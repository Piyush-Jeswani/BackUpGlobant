(function () {
  'use strict';

  angular
    .module('shopperTrak.widgets')
    .directive('scheduledReportWidget', scheduledReportWidget);

  function scheduledReportWidget () {
    return {
      templateUrl: 'components/widgets/scheduled-report-widget/scheduled-report-widget.partial.html',
      scope: {
        scheduleType: '@',
        organizationId: '=',
        user: '=',
        schedule: '=?',
        activeGroup: '=?',
        businessHours: '=?',
        dateRange: '=?',
        siteLevel: '=?',
        siteId: '=?',
        selectedZones: '=?',
        selectedLocations: '=?',
        selectedSites: '=?',
        selectedMetrics: '=?',
        selectedTags: '=?',
        selectedCustomTags: '=?',
        loadSchedules: '&?',
        closeSchedule: '&?',
        currentUser: '=',
        currentOrganization: '=',
        groupBySetting: '=?',
        compareDateRange1: '=?',
        compareDateRange2: '=?'
      },
      controller: scheduledReportWidgetController,
      controllerAs: 'vm',
      bindToController: true
    };
  }

  scheduledReportWidgetController.$inject = [
    '$scope',
    '$rootScope',
    '$http',
    '$filter',
    '$translate',
    '$stateParams',
    '$q',
    '$timeout',

    'ObjectUtils',
    'ExportService',
    'localStorageService',
    'csvExportConstants',
    'apiUrl',
    'utils',
    'LocalizationService'
  ];

  function scheduledReportWidgetController(
    $scope,
    $rootScope,
    $http,
    $filter,
    $translate,
    $stateParams,
    $q,
    $timeout,

    ObjectUtils,
    ExportService,
    localStorageService,
    csvExportConstants,
    apiUrl,
    utils,
    LocalizationService
    
  ) {
    var vm = this;

    // Functions
    vm.addEmail = addEmail;
    vm.removeEmail = removeEmail;
    vm.saveSchedule = saveSchedule;
    vm.setFrequency = setFrequency;
    vm.setSecondaryFrequency = setSecondaryFrequency;
    vm.secondaryFrequencyIsSet = secondaryFrequencyIsSet;
    vm.buildPayload = buildPayload;
    vm.closeSchedulingForm = closeSchedulingForm;
    vm.checkHours = checkHours;
    vm.checkMins = checkMins;
    vm.searchTermTimezone = '';
    vm.timezones = [];
    vm.tzData = [];

    vm.isSaved = false;
    vm.saveError = false;

    // Variables
    vm.mailCC = [];
    vm.frequencyChoices = csvExportConstants.frequencyChoices;

    vm.weekDays = {
      'sunday': 'weekdaysLong.sun',
      'monday': 'weekdaysLong.mon',
      'tuesday': 'weekdaysLong.tue',
      'wednesday': 'weekdaysLong.wed',
      'thursday': 'weekdaysLong.thu',
      'friday': 'weekdaysLong.fri',
      'saturday': 'weekdaysLong.sat'
    };

    vm.monthParts = {
      '1st': 'common.FIRST',
      '15th': 'common.15TH'
    };

    vm.months = {
      'january': 'monthsLong.january',
      'february': 'monthsLong.february',
      'march': 'monthsLong.march',
      'april': 'monthsLong.april',
      'may': 'monthsLong.may',
      'june': 'monthsLong.june',
      'july': 'monthsLong.july',
      'august': 'monthsLong.august',
      'september': 'monthsLong.september',
      'october': 'monthsLong.october',
      'november': 'monthsLong.november',
      'december': 'monthsLong.december'
    };

    $scope.$watch('vm.firstDay', function() {
      var now = moment();
      if(!ObjectUtils.isNullOrUndefined(vm.firstDay) && ObjectUtils.isNullOrUndefined(vm.dateRange)) {
        if(vm.firstDay === 1) {
          vm.dateRange = {
            start: moment(now).startOf('week').subtract(1, 'week').add(1, 'days'),
            end: moment(now).startOf('week').subtract(1, 'week').endOf('week').add(1, 'days')
          };
        } else {
          vm.dateRange = {
            start: moment(now).startOf('week').subtract(1, 'week'),
            end: moment(now).startOf('week').subtract(1, 'week').endOf('week')
          };
        }
        vm.selectedDateRange = angular.copy(vm.dateRange);
      }
    });


    $scope.$on('searchTextChanged', function (event, searchValue) {
      if ((vm.searchTermTimezone === '' && searchValue === '') || (vm.searchTermTimezone !== searchValue)) {
        vm.searchUsed = false;
        vm.searchTermTimezone = searchValue;
        $rootScope.savedSearchterm = searchValue;
        loadTimezones();
      }
    });


    activate();

    function activate() {

      vm.timezones = moment.tz.names();
      // Filter out 'Etc/*' values as they are duplicates to location based zones
      vm.timezones = $filter('filter')(vm.timezones, function(item) {
        return item.substring(0,4) !== 'Etc/';
      });

      var i = 0;
      _.each(vm.timezones, function(tz) {
        vm.tzData.push({
          'id': i,
          'name': tz
        });
        i++;
      });

      loadTimezones();

      if(!ObjectUtils.isNullOrUndefined(vm.schedule)) {
        checkAndTranslateDataSubject();
      } else {
        vm.mailCC.push({email: null});
        vm.frequencySetting = vm.frequencyChoices[0];
        vm.activeSetting = 6;

        vm.scheduleTimezone = 'GMT';
        vm.scheduleTimezone = {
          id: 0,
          name: 'GMT'
        };
        vm.scheduleTimeHour = '00';
        vm.scheduleTimeType = 'AM';
        vm.scheduleTimeMin = '00';

        findFrequencyValueFromDateRange();
      }

      translateFrequencies();
    }

    /**
     * @function checkAndTranslateDataSubject
     * If the schedule subject has not been named, it will be passed in as a translation key.
     *
     * The key is translated and the next function in the stack is called
     * If the translation fails the subject is hardcoded to fallback to 'Scheduled Report'
     *
     * @returns {function} setEditScheduleValues function that sets the schecdule proprties to new VM props
    */
    function checkAndTranslateDataSubject(){

      if(vm.schedule.data.subject !== 'scheduleReport.SINGLESCHEDULEDREPORT') {
        return setEditScheduleValues();
      }

      var deferred = $q.defer()
      vm.schedule.data.subject = $filter('translate')(vm.schedule.data.subject);
      $translate(vm.schedule.data.subject)
      .then(function(translation){
        vm.schedule.data.subject = translation;
        deferred.resolve();
      })
      .catch(function(error) {
        vm.schedule.data.subject = 'Scheduled Report'; //fall back to english - no nasty translation keys
        deferred.reject(error);
      });

      return setEditScheduleValues();
    }

    function loadTimezones() {
      if (!ObjectUtils.isNullOrUndefined(vm.searchTermTimezone) && vm.searchTermTimezone.length > 3) {
        vm.usedTypeAhead = true;
        vm.isSearchingItems = true;

        vm.filteredTzData = $filter('filter')(vm.tzData, {name: vm.searchTermTimezone});
      } else {
        vm.filteredTzData = vm.tzData;
      }
      vm.isSearchingItems = false;
    }

    function translateFrequencies() {
      _.each(vm.frequencyChoices, function(frequency) {
        frequency.translation_label = $filter('translate')(frequency.translation_label);
      });
    }

    function closeSchedulingForm() {
      // resetting values in the form
      if(!ObjectUtils.isNullOrUndefined(vm.schedule)) {
        setEditScheduleValues();
      } else {
        vm.mailCC = [{email: null}];
        vm.frequencySetting = vm.frequencyChoices[0];
        vm.activeSetting = 6;
      }

      vm.isSaved = false;
      vm.closeSchedule();
    }

    function setEditScheduleValues() {
      // Setting mail
      if(vm.schedule.data.ccAddress.length > 0) {
        angular.forEach(vm.schedule.data.ccAddress, function (email) {
          var emailObj = { 'email': email };
          vm.mailCC.push(emailObj);
        });
      } else {
        vm.mailCC.push({email: null});
      }

      // Setting operating hours
      vm.operatingHours = vm.schedule.data.operatingHours;

      // Setting frequency
      findFrequencyValue(vm.schedule.repeatInterval);

      // Setting report name
      vm.mailSubject = vm.schedule.data.subject;

      // Setting message
      vm.mailMessage = vm.schedule.data.message;

      // Setting active setting
      vm.activeSetting = 6; // need to figure out how to set it to what the user selected

      // Setting time and timezone
      vm.scheduleTimeHour = moment.tz(vm.schedule.nextRunAt, vm.schedule.repeatTimezone).format('h');
      vm.scheduleTimeMin = moment.tz(vm.schedule.nextRunAt, vm.schedule.repeatTimezone).format('mm');
      vm.scheduleTimeType = moment.tz(vm.schedule.nextRunAt, vm.schedule.repeatTimezone).format('a').toUpperCase();
      vm.scheduleTimezone = {
        id: 0,
        name: vm.schedule.repeatTimezone
      };
    }

    function addEmail() {
      vm.mailCC.push({
        email: null
      });
    }

    function removeEmail(index) {
      vm.mailCC.splice(index, 1);
    }

    function checkHours() {
      if(typeof vm.scheduleTimeHour === 'undefined') {
        vm.scheduleTimeHour = '';
      }
    }

    function checkMins() {
      if(typeof vm.scheduleTimeMin === 'undefined') {
        vm.scheduleTimeMin = '';
      }
    }

    function findFrequencyValueFromDateRange() {
      var dateRangeDaysDifference;

      if(ObjectUtils.isNullOrUndefined(vm.dateRange)) {
        var getCart = ExportService.getCart();
        var area = getCart[ _.keys(getCart)[0] ];
        var range = area[ _.keys(area)[0] ];
        vm.dateRange = {
          start: range.compare1Start,
          end: range.compare1End
        };
        dateRangeDaysDifference = moment(range.end).diff(moment(range.start), 'days');
      } else {
        dateRangeDaysDifference = moment(vm.dateRange.end).diff(moment(vm.dateRange.start), 'days');
      }

      if(dateRangeDaysDifference === 0) {
        findFrequencyValue('day');
      } else if(dateRangeDaysDifference <= 6) {
        findFrequencyValue('week');
      } else if(dateRangeDaysDifference <= 362) {
        findFrequencyValue('month');
      } else if(dateRangeDaysDifference >= 363) {
        findFrequencyValue('year');
      } else {
        findFrequencyValue('day');
      }
    }

    function findFrequencyValue(frequency) {
      if(frequency in vm.months) { // secondary frequency months
        vm.frequencySetting = vm.frequencyChoices[3];
        vm.secondaryFrequencySetting = frequency;
      } else if(frequency in vm.monthParts) { // secondary frequency 1st 15th
        vm.frequencySetting = vm.frequencyChoices[2];
        vm.secondaryFrequencySetting = frequency;
      } else if(frequency in vm.weekDays) { // secondary frequency weekdays
        vm.frequencySetting = vm.frequencyChoices[1];
        vm.secondaryFrequencySetting = frequency;
      } else if(frequency === 'day') {
        vm.frequencySetting = vm.frequencyChoices[0];
      } else if(frequency === 'week') {
        vm.frequencySetting = vm.frequencyChoices[1];
        vm.secondaryFrequencySetting = 'monday';
      } else if(frequency === 'month') {
        vm.frequencySetting = vm.frequencyChoices[2];
        vm.secondaryFrequencySetting = '1st';
      } else {
        vm.frequencySetting = vm.frequencyChoices[3];
        vm.secondaryFrequencySetting = 'january';
      }
    }

    function setFrequency(frequency) {
      vm.frequencySetting = frequency;

      // certain frequencies will get an auto selected secondary frequency value
      if(frequency.value === 'week') {
        vm.secondaryFrequencySetting = 'monday';
      } else if(frequency.value === 'month') {
        vm.secondaryFrequencySetting = '1st';
      } else if(frequency.value === 'year') {
        vm.secondaryFrequencySetting = 'january';
      } else {
        vm.secondaryFrequencySetting = undefined;
      }
    }

    function setSecondaryFrequency(frequency) {
      vm.secondaryFrequencySetting = frequency;
    }

    function secondaryFrequencyIsSet(frequency) {
      return vm.secondaryFrequencySetting === frequency;
    }

    function buildStartTime(time) {
      var desiredDay;

      if(vm.frequencySetting.value === 'day') {
        desiredDay = 0;
      } else if(vm.secondaryFrequencySetting in vm.weekDays) {
        var weekDayKeys = Object.keys(vm.weekDays);
        desiredDay = weekDayKeys.indexOf(vm.secondaryFrequencySetting);
      } else {
        desiredDay = -1;
      }

      var offset = (desiredDay - time.day() < 0 ? 7 + (desiredDay - time.day()) : (desiredDay - time.day()));

      var dateTimeWithOffset = moment(time).add(offset, 'days');

      return utils.getDateStringForRequest(dateTimeWithOffset);
    }

    function buildOffset(url, index) {
      var offset = {};
      /* code to calculate noOfDaysToAdd (no of days in a year) for different calendar types 
      This considers case of leap years as well */
      const currentYear = moment().year();
      const firstDayOfYear = LocalizationService.getFirstDayOfYear(currentYear);
      const lastDayOfYear = LocalizationService.getLastDayOfYear(currentYear);
     
      //Difference in number of days
      const diffInDays = moment.duration(lastDayOfYear.diff(firstDayOfYear)).asDays();
      const noOfDaysToAdd = Math.round(diffInDays) - 1; 

      if (ObjectUtils.isNullOrUndefined(vm.dateRange)) {
        var cartParent = url.substring(url.indexOf('{'), url.length);

        if (cartParent.substr(cartParent.length - 1) === '}') {
          cartParent = cartParent.substring(0, cartParent.length - 1);
        }

        var cart = cartParent.substring(cartParent.indexOf('['), cartParent.length);
        var cartInJson = JSON.parse(cart);
        var oneInCart = cartInJson[index];

        offset.reportStartOffset = moment(oneInCart.dateRange.end).diff(moment(oneInCart.dateRange.start), 'days') + 1;
      } else {
        offset.reportStartOffset = moment(vm.dateRange.end).diff(moment(vm.dateRange.start), 'days') + 1;
      }

      offset.reportEndOffset = 1;

      //SA-4240
      if (!ObjectUtils.isNullOrUndefined(vm.compareDateRange1)) {
        offset.comparePeriod1StartOffset = offset.reportStartOffset + offset.reportStartOffset;
        offset.comparePeriod1EndOffset = offset.reportEndOffset + offset.reportStartOffset;
      }
      if (!ObjectUtils.isNullOrUndefined(vm.compareDateRange2)) {
        offset.comparePeriod2StartOffset = offset.reportStartOffset + noOfDaysToAdd;
        offset.comparePeriod2EndOffset = offset.reportEndOffset + noOfDaysToAdd;
      }
      
      return offset;
    }

    function buildEndTime(startTime) {
      var endTime = startTime.add(Number(vm.activeSetting), 'months');
      return utils.getDateStringForRequest(endTime);
    }

    function getSelectedMetricIds() {
      var metrics = [];
      _.each(Object.keys(vm.selectedMetrics), function (key) {
        if (vm.selectedMetrics[key]) {
          metrics.push(key);
        }
      });
      return metrics;
    }

    function buildPayload(url, index) {
      var payload = {};
      var now = moment();
      var hour;

      if(vm.scheduleType !== 'pdf' && vm.scheduleType !== 'csv') {
        payload.operatingHours = vm.operatingHours;
      } else {
        payload.exportType = vm.scheduleType;
        payload.scheduleStartDate = buildStartTime(now);
        payload.scheduleEndDate = buildEndTime(now);

        var offset;

        if(vm.scheduleType === 'pdf') {
          payload.url = decodeURIComponent(url);
          offset = buildOffset(payload.url, index);
        } else {
          offset = buildOffset();
          payload.kpi = getSelectedMetricIds();

          if(!ObjectUtils.isNullOrUndefined(vm.groupBySetting)) {
            payload.groupBy = vm.groupBySetting;
          }

          if (vm.activeGroup === 'perimeter') {
            payload.operatingHours = vm.businessHours;
          }

          if(vm.siteLevel) {
            payload.siteId = vm.siteId;
            if (vm.activeGroup === 'perimeter') {
              payload.zoneId = vm.selectedZones;
              payload.includeZoneNames = true;
            } else {
              payload.locationId = vm.selectedLocations;
            }
          } else {
            //fix for Belk SA-3575 if there is valuable custom tags then add it in parameters otherwise api renders empty csv
            if(!ObjectUtils.isNullOrUndefinedOrEmpty(vm.selectedCustomTags)) {
              payload.customTagId = vm.selectedCustomTags;
            }

            //fix for Belk SA-3575 and reatail orgs like north face if there is valuable selected tags then add it in parameters otherwise api renders empty csv
            if(!ObjectUtils.isNullOrUndefinedOrEmpty(vm.selectedTags)) {
              payload.hierarchyTagId = vm.selectedTags;
            }

            payload.siteId = vm.selectedSites;
            payload.includeSiteNames = true;
          }
        }

        payload.reportStartOffset = offset.reportStartOffset;
        payload.reportEndOffset = offset.reportEndOffset;

        if (offset.comparePeriod1StartOffset && offset.comparePeriod1EndOffset) {
          payload.comparePeriod1StartOffset = offset.comparePeriod1StartOffset;
          payload.comparePeriod1EndOffset = offset.comparePeriod1EndOffset;
        }
        if (offset.comparePeriod2StartOffset && offset.comparePeriod2EndOffset) {
          payload.comparePeriod2StartOffset = offset.comparePeriod2StartOffset;
          payload.comparePeriod2EndOffset = offset.comparePeriod2EndOffset;
        }
      }

      if(!ObjectUtils.isNullOrUndefined(vm.secondaryFrequencySetting)) {
        if(vm.secondaryFrequencySetting === vm.monthParts[0]) {
          payload.frequency = '1st';
        } else if(vm.secondaryFrequencySetting === vm.monthParts[1]) {
          payload.frequency = '15th';
        } else {
          payload.frequency = vm.secondaryFrequencySetting;
        }
      } else {
        payload.frequency = vm.frequencySetting.value;
      }

      // Convert 12 hour format to 24 hour format
      if(vm.scheduleTimeType === 'PM' && vm.scheduleTimeHour < 12) {
        hour = new Number(vm.scheduleTimeHour) + 12;
      } else {
        hour = vm.scheduleTimeHour;
        if(hour < 10) {
          hour = '0' + hour;
        }
      }

      // on PUT/POST, time saved always in GMT
      payload.repeatTime = hour + ':'+vm.scheduleTimeMin;
      if(ObjectUtils.isNullOrUndefined(vm.scheduleTimezone.name)) {
        vm.scheduleTimezone.name = 'GMT';
      }
      payload.repeatTimezone = vm.scheduleTimezone.name;

      payload.orgId = vm.organizationId;
      payload.subject = vm.mailSubject;
      payload.message = vm.mailMessage;
      payload.ccAddress = [];

      vm.mailCC.map(function(entry) {
        if(entry.email !== null) {
          payload.ccAddress.push(entry.email);
        }
      });

      var dateRange = {};

      if(!ObjectUtils.isNullOrUndefined(vm.dateRange)) {
        dateRange = {
          start: vm.dateRange.start,
          end: vm.dateRange.end
        };
        payload.dateRangeType = utils.getDateRangeType(dateRange, vm.currentUser, vm.currentOrganization);
      }

      // @todo: Add compare date range param when API is supporting this (CSV)
      if(!ObjectUtils.isNullOrUndefined(vm.compareRange)) {
        payload.compareStartDate = vm.compareRange.start;
        payload.compareEndDate = vm.compareRange.end;
      }

      return payload;
    }

    function saveSchedule() {
      var req;
      if (vm.scheduleType === 'pdf') {
        var requests = [];
        var index = -1;
        var cart = ExportService.getCart();
        var url;
        var savedUrls = [];
        ExportService.buildPdfUrl(ExportService.buildMetricListFromExportCart(cart, true), true).then(function (pdfInfo) {//true params tell scheduled report to keep the compare object
          url = pdfInfo.fullPdfUrl;


          Object.keys(cart).map(function (area) {
            Object.keys(cart[area]).map(function () {
              ++index;
              var payload = buildPayload(url, index);

              if(savedUrls.indexOf(payload.url) === -1) {
                savedUrls.push(payload.url);

                req = {
                  method: 'POST',
                  url: apiUrl + '/organizations/' + ExportService.getOrgIdFrom(cart) + '/scheduled-reports',
                  headers: {
                    'Authorization': localStorageService.get('authToken')
                  },
                  data: payload
                };
                requests.push(req);
              }
            });
          });

          $q.all(requests.map(function (req) {
            return $http(req);
          })).then(function () {
            vm.isSaved = true;
            vm.saveError = false;
            hideAlert();
          });
        });
      } else {
        var payload = vm.buildPayload();
        if(vm.scheduleType === 'csv') { 
          req = {
            method: 'POST',
            url: apiUrl + '/organizations/' + vm.organizationId + '/scheduled-reports',
            headers: {
              'Authorization': localStorageService.get('authToken')
            },
            data: payload
          };
        } else {
          req = {
            method: 'PUT',
            url: apiUrl + '/organizations/' + vm.organizationId + '/scheduled-reports/' + vm.schedule._id,
            headers: {
              'Authorization': localStorageService.get('authToken')
            },
            data: payload
          };
        }

        $http(req).then(function() {
          vm.isSaved = true;
          vm.saveError = false;
          hideAlert();
        }, function(error) {
          vm.saveError = true;
          hideAlert();
          console.log(error);
        });
      }
    }

    function hideAlert() {
      $timeout(function() {
        vm.loadSchedules();
        vm.closeSchedule();
        vm.isSaved = false;
        vm.saveError = false;
      },3000);
    }
  }
})();
