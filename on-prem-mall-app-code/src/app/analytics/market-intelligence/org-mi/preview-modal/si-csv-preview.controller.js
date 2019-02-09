(function () {
  'use strict';

  angular.module('shopperTrak').controller('siCsvController', siCsvController);

  siCsvController.$inject = [
    '$timeout',
    '$scope',
    '$rootScope',
    '$filter',
    '$q',
    '$stateParams',
    '$translate',
    '$state',
    'ObjectUtils',
    'marketIntelligenceService',
    'LocalizationService',
    'utils',
    'SubscriptionsService'
  ];

  function siCsvController(
    $timeout,
    $scope,
    $rootScope,
    $filter,
    $q,
    $stateParams,
    $translate,
    $state,
    ObjectUtils,
    marketIntelligenceService,
    LocalizationService,
    utils,
    SubscriptionsService
  ) {
    var vm = this;

    var baseDropdownOptions;
    var translation = {};
    var originalSubscription = [];
    var periodTypeCount = 0;

    activate();

    function activate() {
      // Needed by the date range picker
      $scope.currentUser = vm.currentUser;
      $scope.currentOrganization = vm.currentOrganization;

      LocalizationService.setUser(vm.currentUser);
      LocalizationService.setOrganization(vm.currentOrganization);

      getCsvWidgetTranslations()
      .then(function (translations) {
        vm.translations = translations;
        buildPeriodToDateLabels(translations);
        getNumberFormatInfo();
        buildCsvOptions(translations);
        updateDropdownOptions($stateParams.dateRangeStart, $stateParams.dateRangeEnd);
      })
      .catch(function (error) {
        console.error(error);
      });

      initScope();
      getTranslations();


      loadSubscriptions()
      .then(loadSubscriptionsSuccess)
      .catch(showError);

      vm.closeModal = closeModal;
      vm.onCsvDownload = onCsvDownload;
      vm.showFirstScreen = showFirstScreen;
      vm.showSecondScreen = showSecondScreen;
      vm.updateDataPoints = updateDataPoints;
      vm.emptyReportname = true;
      configureWatches();
    }

    function initScope() {
      vm.isLoading = true;
      vm.firstScreen = true;
      vm.secondScreen = false;
      vm.selectedUuid = null;
      vm.setCategory = setCategory;
      vm.subscriptionArray = [];
      vm.updatedSelectedItems = [];
      vm.periodSelected = {
        start: $stateParams.dateRangeStart,
        end: $stateParams.dateRangeEnd
      };
      vm.periodCompared = {
        start: $stateParams.compareRange1Start,
        end: $stateParams.compareRange1End
      };
      vm.periodType = {
        period: 'Select'
      }
      vm.isPriorYear = isPriorYear(vm.periodSelected, vm.periodCompared);
      loadDates();
      vm.showOrgIndex = showOrgIndex();
      vm.csvParamsObject = checkPriorYear(vm.isPriorYear,vm.updatedSelectedItems);
      vm.marketIndexPoints = [];
      vm.orgIndexPoints = [];
      vm.dataPoints = [];
      vm.geographyByCategoryList = [];
      vm.geographyByCategory = {
        displayProperty: 'name',
        multiSelect: true
      };
      vm.selectedGeographyItems = [];
      vm.toggleAllGeographies = toggleAllGeographies;
    }

    function getNumberFormatInfo() {
      vm.numberFormatName = LocalizationService.getCurrentNumberFormatName(vm.currentUser, vm.currentOrganization);
    }

    function configureWatches() {
      var watches = [];

      watches.push($scope.$watch('vm.reportName', function (value) {
        vm.emptyReportname = ObjectUtils.isNullOrUndefinedOrBlank(value);
      }));

      watches.push($rootScope.$on('selectionMade', function () {
        vm.geographySelected = !ObjectUtils.isNullOrUndefinedOrEmpty(vm.selectedGeographyItems);
        vm.isAllSelected = vm.geographyByCategoryCount === vm.selectedGeographyItems.length;
      }));

      $scope.$on('$destroy', function() {
        _.each(watches, function(unbindFunction) {
          if(angular.isFunction(unbindFunction)) {
            unbindFunction();
          }
        });
      });
    }

    function showOrgIndex() {
      return SubscriptionsService.hasMiOrgIndex(vm.currentUser, vm.currentOrganization);
    }

    function getCsvWidgetTranslations() {
      var deferred = $q.defer();

      var miWidgetTransKeys = [
        'marketIntelligence.TIME',
        'marketIntelligence.DAY',
        'marketIntelligence.WEEK',
        'marketIntelligence.MONTH',
        'marketIntelligence.QUARTER',
        'marketIntelligence.YEAR',
        'marketIntelligence.SITEGROUPING',
        'marketIntelligence.MARKETINDEX',
        'marketIntelligence.ORGINDEX',
        'marketIntelligence.GEOGRAPHYNAME',
        'marketIntelligence.SELECTEDPERIOD',
        'marketIntelligence.COMPAREPERIOD',
        'marketIntelligence.SAMESTOREINDEX',
        'marketIntelligence.GROUPBY',
        'marketIntelligence.REPORTRUN',
        'marketIntelligence.REPORTPERIOD',
        'marketIntelligence.CATEGORY',
        'marketIntelligence.GEOGRAPHY',
        'common.ORGANIZATION',
        'common.CALENDAR',
        'common.STANDARDGREGORIANSUNDAY',
        'common.STANDARDGREGORIANMONDAY',
        'marketIntelligence.GEOGRAPHYLEVEL',
        'marketIntelligence.PERIODTYPE',
        'marketIntelligence.PERIOD',
        'marketIntelligence.YOYCHANGEMKT',
        'marketIntelligence.YOYCHANGEORG',
        'marketIntelligence.CHANGEMKT',
        'marketIntelligence.CHANGEORG',
        'marketIntelligence.PERIODTODATE',
        'marketIntelligence.AGGREGATE',
        'marketIntelligence.SHOPPERTRAKINDEXREPORT',
        'marketIntelligence.WTD',
        'marketIntelligence.MTD',
        'marketIntelligence.QTD',
        'marketIntelligence.YTD'
      ];

      $translate(miWidgetTransKeys).then(function (translations) {
        translation.time = translations['marketIntelligence.TIME'];
        translation.day = translations['marketIntelligence.DAY'];
        translation.week = translations['marketIntelligence.WEEK'];
        translation.month = translations['marketIntelligence.MONTH'];
        translation.quarter = translations['marketIntelligence.QUARTER'];
        translation.year = translations['marketIntelligence.YEAR'];
        translation.siteGrouping = translations['marketIntelligence.SITEGROUPING'];
        translation.marketIndex = translations['marketIntelligence.MARKETINDEX'];
        translation.orgIndex = translations['marketIntelligence.ORGINDEX'];
        translation.geographyName = translations['marketIntelligence.GEOGRAPHYNAME'];
        translation.selectedPeriod = translations['marketIntelligence.SELECTEDPERIOD'];
        translation.comparePeriod = translations['marketIntelligence.COMPAREPERIOD'];
        translation.sameStoreIndex = translations['marketIntelligence.SAMESTOREINDEX'];
        translation.groupBy = translations['marketIntelligence.GROUPBY'];
        translation.reportRun = translations['marketIntelligence.REPORTRUN'];
        translation.reportPeriod = translations['marketIntelligence.REPORTPERIOD'];
        translation.organization = translations['common.ORGANIZATION'];
        translation.calendar = translations['common.CALENDAR'];
        translation.standardGregorianMonday = translations['common.STANDARDGREGORIANMONDAY'];
        translation.standardGregorianSunday = translations['common.STANDARDGREGORIANSUNDAY'];
        translation.category = translations['marketIntelligence.CATEGORY'];
        translation.geography = translations['marketIntelligence.GEOGRAPHY'];
        translation.geographyLevel = translations['marketIntelligence.GEOGRAPHYLEVEL'];
        translation.periodType = translations['marketIntelligence.PERIODTYPE'];
        translation.period = translations['marketIntelligence.PERIOD'];
        translation.yoyMarket = translations['marketIntelligence.YOYCHANGEMKT'];
        translation.yoyOrg = translations['marketIntelligence.YOYCHANGEORG'];
        translation.customMarket = translations['marketIntelligence.CHANGEMKT'];
        translation.customOrg = translations['marketIntelligence.CHANGEORG'];
        translation.periodToDate = translations['marketIntelligence.PERIODTODATE'];
        translation.aggregate = translations['marketIntelligence.AGGREGATE'];
        translation.shoppertrakIndexReport = translations['marketIntelligence.SHOPPERTRAKINDEXREPORT'];
        translation.wtd = translations['marketIntelligence.WTD'];
        translation.mtd = translations['marketIntelligence.MTD'];
        translation.qtd = translations['marketIntelligence.QTD'];
        translation.ytd = translations['marketIntelligence.YTD'];

        deferred.resolve(translation);
      });

      return deferred.promise;
    }

    function buildCsvOptions(translation) {
      baseDropdownOptions = [{
        name: translation.time,
        type: 'group'
      }, {
        name: translation.day,
        type: 'option',
        cast: 'time',
        period: 'day'
      }, {
        name: translation.week,
        type: 'option',
        cast: 'time',
        period: 'week'
      }, {
        name: translation.month,
        type: 'option',
        cast: 'time',
        period: 'month'
      }, {
        name: translation.quarter,
        type: 'option',
        cast: 'time',
        period: 'quarter'
      }, {
        name: translation.year,
        type: 'option',
        cast: 'time',
        period: 'year'
      }, {
        name: translation.periodToDate,
        type: 'option',
        cast: 'time', // This forces the graph to render as bars
        period: 'periodToDate'
      }, {
        name: translation.aggregate,
        type: 'option',
        cast: 'time', // This forces the graph to render as bars
        period: 'aggregate'
      }, {
        name: translation.siteGrouping,
        type: 'group'
      }, {
        name: translation.regions,
        type: 'option',
        geoTypeKey: 'REGION',
        cast: 'geo'
      }, {
        name: translation.metros,
        type: 'option',
        geoTypeKey: 'METRO',
        cast: 'geo'
      }];
    }

    function updateDropdownOptions(dateStart, dateEnd) {

      vm.trendAnalysisDropDownArray = _.where(baseDropdownOptions, {
        cast: 'time'
      });
      hideDayOption(moment(dateStart), moment(dateEnd));
      vm.selectedGroupingName = 'Select'
    }

    function isCompareDates() {
      if (LocalizationService.isCurrentCalendarGregorian()) {
        return !vm.isPriorYear;
      }
      return !vm.isPriorYear;
    }

    function updateDataPoints(selectedDropDown) {
      if(!vm.calendarSelected){
        loadDates();
      }
      vm.showErrorInfo = false;
      vm.selectedGroupingName = selectedDropDown.name;
      vm.periodType.period = selectedDropDown.period;
      var queryObj = {
        dateStart: vm.csvParamsObject.dateStart,
        dateEnd: vm.csvParamsObject.dateEnd,
        subscriptions: vm.csvParamsObject.subscriptions,
        groupByDateRanges: []
      };

      var aggregateObj = {
        dateStart: vm.csvParamsObject.dateStart,
        dateEnd: vm.csvParamsObject.dateEnd,
        compareStart: vm.csvParamsObject.compareStart,
        compareEnd: vm.csvParamsObject.compareEnd,
        subscriptions: vm.csvParamsObject.subscriptions
      };

      var calendarId = LocalizationService.getActiveCalendar().id;
      var startPeriod = vm.csvParamsObject.dateStart;
      var endPeriod = vm.csvParamsObject.dateEnd;

      if (selectedDropDown.name === 'Aggregate') {
        getMIData(aggregateObj).then(function (res) {
          validateResult(res);
        });
      }
      else if (isCompareDates() && selectedDropDown.name !== 'Aggregate') {
        var compareStartPeriod = vm.csvParamsObject.compareStart;
        var compareEndPeriod = vm.csvParamsObject.compareEnd;
        // If we're looking at a gregorian calendar, we just pass in the current dates and let the MI service calculate the prior dates for us
        if (selectedDropDown.period === 'periodToDate' && LocalizationService.isCurrentCalendarGregorian()) {
          compareStartPeriod = startPeriod;
          compareEndPeriod = endPeriod;
        }
        $q.all(
          [
            marketIntelligenceService.getCalendarDateRanges(calendarId, selectedDropDown.period, startPeriod, endPeriod),
            marketIntelligenceService.getCalendarDateRanges(calendarId, selectedDropDown.period, compareStartPeriod, compareEndPeriod)
          ]
        )
        .then(function (res) {
          vm.isLoading = false;
          addDateRangesProperty(res[0], queryObj, 'groupByDateRanges', selectedDropDown.period);
          addDateRangesProperty(res[1], queryObj, 'groupByCompareDateRanges', selectedDropDown.period);
          getMIData(queryObj).then(function (res) {
            validateResult(res);
          });
        })
        .catch(displayError);
      } else {
        marketIntelligenceService.getCalendarDateRanges(calendarId, selectedDropDown.period, startPeriod, endPeriod)
        .then(function (res) {
          vm.isLoading = false;
          addDateRangesProperty(res, queryObj, 'groupByDateRanges', selectedDropDown.period);
          getMIData(queryObj).then(function (res) {
            validateResult(res);
          });
        })
        .catch(displayError);
      }
    };

    function addDateRangesProperty(passedArray, passedObj, propertyName, selectedPeriodName) {
      if (selectedPeriodName === 'periodToDate') {
        var results = passedArray.data.result[0];
        passedObj[propertyName] = [
          results.year,
          results.quarter,
          results.month,
          results.week
        ];
        return;
      }

      _.each(passedArray.data.result, function (eachItem) {
        if (eachItem.start === eachItem.end) {
          passedArray.data.result = _.without(passedArray.data.result, eachItem);
        }
        passedObj[propertyName] = passedArray.data.result;
      });
    }

    function validateResult(result) {
      if (result === 'Ok') {
        vm.requestFailed = false;
        vm.hasData = true;
      } else if (result === 'No Data') {
        vm.hasData = false;
        vm.requestFailed = false;
      } else {
        vm.requestFailed = true;
        vm.hasData = true;
      }
      updateData();
    }

    function loadSubscriptionsSuccess(subscriptions) {
      originalSubscription = subscriptions;
      vm.subscribedCategories = marketIntelligenceService.sliceSubscription(subscriptions, 'category');
      setCategory(vm.subscribedCategories[0].uuid);
      vm.isLoading = false;
      vm.hasError = false;
    }

    function setCategory(selectedUuid) {
      vm.categorySelected = true;
      vm.selectedUuid = selectedUuid;
      vm.selectedCategory = _.findWhere(vm.subscribedCategories, {uuid: selectedUuid});
      getGeographyByCategory(vm.selectedCategory);
      vm.selectedGeographyItems = [];
      toggleAllGeographies();
    }

    function getGeographyByCategory(selectedCategory) {
      var selectedObj = [{
        selectedDimension: vm.translations.category,
        selectedValue: selectedCategory.name
      }];
      var geographyByCategoryList = marketIntelligenceService.getReducedSubscription(originalSubscription, selectedObj, undefined, vm.translations);
      if (ObjectUtils.isNullOrUndefinedOrEmpty(geographyByCategoryList)) {
        vm.geographyByCategoryList = undefined;
      } else {
        vm.geographyByCategoryList = _.findWhere(geographyByCategoryList, { name: vm.translations.geography}).values;
        vm.geographyByCategoryCount = getTotalCount(vm.geographyByCategoryList);
      }
    }

    function getTotalCount(geographyList){
      var listCount = 0;
      var totalCount = startCount(geographyList);

      function startCount(listItems){
        _.each(listItems, function(item){
          listCount++;
          if(item.children){
            startCount(item.children);
          }
        });
        return listCount;
      }
     return totalCount;
    }

    function loadSubscriptions() {
      return marketIntelligenceService.getSubscriptions($stateParams.orgId, false, true);
    }

    function getTranslations() {
      $translate('marketIntelligence.CSV.ENTERREPORTNAME')
      .then(function (translation) {
        vm.reportNamePlaceholder = translation
      });
    }

    function hideDayOption(dateStart, dateEnd) {
      var numOfDaysSelected = utils.getDaysBetweenDates(dateStart, dateEnd);
      if (numOfDaysSelected > 45) {
        return vm.trendAnalysisDropDownArray.shift();
      }
      return vm.trendAnalysisDropDownArray;
    }

    function loadDates() {
      vm.csvParamsObject = checkPriorYear(vm.isPriorYear,vm.updatedSelectedItems);
      vm.selectedGroupingName = 'Select';
      vm.periodType.period = 'Select';
      vm.enableDownloadBtn = false;
      vm.showErrorInfo = true;
    }

    function showError(error) {
      vm.isLoading = false;
      vm.showError = true;
      console.error(error);
    }

    function showSecondScreen() {
      vm.selectedGroupingName = 'Select';
      vm.periodType.period = 'Select';
      vm.firstScreen = false;
      vm.secondScreen = true;
      vm.updatedSelectedItems = [];

      _.each(vm.selectedGeographyItems, function (item) {
        vm.updatedSelectedItems.push({
          category: vm.selectedCategory,
          geography: _.pick(item.src, 'uuid', 'name', 'childrenUuids', 'lastUpdated', 'geoType', 'parentUuid'),
          orgId: vm.currentOrganization.organization_id
        });
      });
    };

    $scope.$on('dateSelectionChanged', function (event, data) {
      vm.calendarSelected = true;
      vm.periodSelected = {
        start: data.dateStart,
        end: data.dateEnd
      };
      vm.periodCompared = {
        start: data.compareStart,
        end: data.compareEnd
      };
      vm.isPriorYear = isPriorYear(vm.periodSelected, vm.periodCompared);
      vm.csvParamsObject = data;
      vm.csvParamsObject.subscriptions = vm.updatedSelectedItems;
      vm.selectedGroupingName = 'Select';
      vm.periodType.period = 'Select';
      vm.enableDownloadBtn = false;
      vm.showErrorInfo = true;
      updateDropdownOptions(vm.csvParamsObject.dateStart, vm.csvParamsObject.dateEnd);
    });

    $scope.$on('dateRangesChanged', function (event, ranges) {
      vm.calendarSelected = true;
      vm.showErrorInfo = true;
      vm.selectedGroupingName = 'Select';
      vm.periodType.period = 'Select';
      vm.enableDownloadBtn = false;
      vm.dataError = false;
      vm.periodSelected = {
        start: ranges.dateRangeStart,
        end: ranges.dateRangeEnd
      };
      vm.periodCompared = {
        start: ranges.compareRange1Start,
        end: ranges.compareRange1End
      };
      vm.isPriorYear = isPriorYear(vm.periodSelected, vm.periodCompared);
      vm.csvParamsObject.dateStart = ranges.dateRangeStart;
      vm.csvParamsObject.dateEnd = ranges.dateRangeEnd;
      vm.csvParamsObject.compareStart = ranges.compareRange1Start;
      vm.csvParamsObject.compareEnd = ranges.compareRange1End;
      vm.csvParamsObject.subscriptions = vm.updatedSelectedItems;
      updateDropdownOptions(vm.csvParamsObject.dateStart, vm.csvParamsObject.dateEnd);
    });

    function showFirstScreen() {
      vm.firstScreen = true;
      vm.secondScreen = false;
      vm.enableDownloadBtn = false;
      vm.showErrorInfo = true;
      vm.calendarSelected = false;
    };

    function getValueForCsv(value) {
      var formatData = $filter('formatNumber')(value, 1, vm.numberFormatName) + '%';
      if (formatData.indexOf(',') !== -1) {
        formatData = '"'+formatData+'"';
      }
      return formatData
    }

    function getCsvHeaderSection() {

      var dateFormatMask = LocalizationService.getCurrentDateFormat(vm.currentOrganization);

      var datePeriod = '';

      var calendarName = getCalendarName();

      var groupBy = vm.translations.groupBy + vm.selectedGroupingName;

      var reportDate = vm.translations.reportRun + moment().format(dateFormatMask);

      var cellsString = '';

      cellsString += vm.translations.organization + ': ' + vm.currentOrganization.name + '\n';

      cellsString += datePeriod + '\n';

      cellsString += calendarName + '\n';

      cellsString += groupBy + '\n';

      cellsString += reportDate + '\n \n';

      return cellsString;

    }

    function getCalendarName() {
      var currentCalendarName = LocalizationService.getCurrentCalendarName();

      if (!angular.isDefined(currentCalendarName)) {
        var calendarInfo = LocalizationService.getActiveCalendar();

        if (LocalizationService.isCalendarIdGregorianMonday(calendarInfo.id)) {
          currentCalendarName = translation.standardGregorianMonday;
        } else {
          currentCalendarName = translation.standardGregorianSunday;
        }
      }
      return vm.translations.calendar + ': ' + currentCalendarName;
    }

    function updateData() {

      vm.marketIndexPoints = [];
      vm.orgIndexPoints = [];
      vm.dateFormat = LocalizationService.getCurrentDateFormat(vm.currentOrganization);
      var tempDataPoints = [];
      
      _.each(vm.trendAnalysisPanelArray, function (item) {
        vm.marketIndexPoints.push(item.marketindexchange);
        if (!vm.showOrgIndex) {
          item.orgindexchange = null;
        }
        vm.orgIndexPoints.push(item.orgindexchange);

        // ToDo - Refactor this, it's all duplicated code

        var formattedStartDate = LocalizationService.getLocalDateTimeFormatIgnoringUTC(item.startDate).format(vm.dateFormat);
        var formattedEndDate = LocalizationService.getLocalDateTimeFormatIgnoringUTC(item.endDate).format(vm.dateFormat);
        var formattedComStartDate = LocalizationService.getLocalDateTimeFormatIgnoringUTC(item.comStartDate).format(vm.dateFormat);
        var formattedComEndDate = LocalizationService.getLocalDateTimeFormatIgnoringUTC(item.comEndDate).format(vm.dateFormat);

        var dataPoint = buildDataPoint(item, formattedStartDate, formattedEndDate, formattedComStartDate, formattedComEndDate);
        tempDataPoints.push(dataPoint);
      });

      vm.dataPoints = tempDataPoints;
    }

    function buildDataPoint(item, formattedStartDate, formattedEndDate, formattedComStartDate, formattedComEndDate) {

      return {
        periodtype: item.periodType,
        geographytype: item.geographytype,
        geographyname: item.geographyname,
        categoryname: item.categoryname,
        marketIndexData: item.marketindexchange,
        orgIndexData: item.orgindexchange,
        zeroMarketIndex: item.noMarketIndex,
        zeroOrgIndex: item.noOrgIndex,
        startDates: formattedStartDate,
        endDates: formattedEndDate,
        comStartDates: formattedComStartDate,
        comEndDates: formattedComEndDate,
      }
    }

    function getMIData(obj) {

      var deferred = $q.defer();
      marketIntelligenceService.getIndexData(obj, vm.showOrgIndex).then(function (res) {
        vm.requestFailed = false;
        vm.hasData = true;
        vm.trendAnalysisPanelArray = [];
        for (var i = 0; i < res.index.length; i++) {
          var indexDataObj = {};
          if (res.index[i].valid === false && !ObjectUtils.isNullOrUndefined(res.index[i].errorMessage)) {
            indexDataObj.noMarketIndex = true;
          }
          indexDataObj.periodType = vm.periodType;
          indexDataObj.marketindexchange = res.index[i].value * 100;
          indexDataObj.categoryname = res.index[i].subscription.category.name;
          indexDataObj.geographyname = marketIntelligenceService.getFullGeoTitleByCode(res.index[i].subscription.geography.name);
          indexDataObj.geographytype = $filter('capitalize')(res.index[i].subscription.geography.geoType);
          indexDataObj.startDate = res.index[i].dateStart;
          indexDataObj.endDate = res.index[i].dateEnd;
          indexDataObj.comStartDate = res.index[i].compDateStart;
          indexDataObj.comEndDate = res.index[i].compDateEnd;
          if (vm.showOrgIndex === true) {
            if (res.org[i].valid === false && !ObjectUtils.isNullOrUndefined(res.org[i].errorMessage)) {
              indexDataObj.noOrgIndex = true;
            }

            indexDataObj.orgindexchange = res.org[i].value * 100;
          }

          vm.trendAnalysisPanelArray.push(indexDataObj);
        }
        updateData();
        vm.enableDownloadBtn = true;
        deferred.resolve('Ok');
      }).catch(function (error) {
        if(error){
          vm.dataError = true;
        }
        console.error(error);
        deferred.resolve(error);
      });

      return deferred.promise;
    }

    function displayError(error) {
      console.error(error);
      vm.isLoading = false;
      vm.requestFailed = true;
      vm.hasData = true;
    }

    function firstDaySetting() {
      return LocalizationService.getCurrentCalendarFirstDayOfWeek();
    }

    function isPriorYear(startPeriod, comparePeriod) {
      return utils.dateRangeIsPriorYear(startPeriod, comparePeriod, firstDaySetting(), vm.currentUser, vm.currentOrganization);
    }

    function checkPriorYear(priorYear, subsObject) {
      if (LocalizationService.isCurrentCalendarGregorian() && priorYear) {
        return {
          dateStart: $stateParams.dateRangeStart,
          dateEnd: $stateParams.dateRangeEnd,
          compareStart: $stateParams.compareRange1Start,
          compareEnd: $stateParams.compareRange1End,
          subscriptions: subsObject
        };
      }
      if (!priorYear) {
        return {
          dateStart: $stateParams.dateRangeStart,
          dateEnd: $stateParams.dateRangeEnd,
          compareStart: $stateParams.compareRange1Start,
          compareEnd: $stateParams.compareRange1End,
          subscriptions: subsObject
        };
      }
      return {
        dateStart: $stateParams.dateRangeStart,
        dateEnd: $stateParams.dateRangeEnd,
        subscriptions: subsObject
      };
    }

    function createCsvColumnLabels(yoyOrg, yoyMarket) {
      var createCellsArray;
      if (isCompareDates()) {
        if (vm.showOrgIndex) {
          createCellsArray = [[vm.translations.category, vm.translations.geographyLevel, vm.translations.geographyName, vm.translations.periodType, vm.translations.selectedPeriod, vm.translations.comparePeriod, yoyMarket, yoyOrg]];
        } else if (!vm.showOrgIndex) {
          createCellsArray = [[vm.translations.category, vm.translations.geographyLevel, vm.translations.geographyName, vm.translations.periodType, vm.translations.selectedPeriod, vm.translations.comparePeriod, yoyMarket]];
        }
      } else {
        if (vm.showOrgIndex) {
          createCellsArray = [[vm.translations.category, vm.translations.geographyLevel, vm.translations.geographyName, vm.translations.periodType, vm.translations.selectedPeriod, yoyMarket, yoyOrg]];
        } else if (!vm.showOrgIndex) {
          createCellsArray = [[vm.translations.category, vm.translations.geographyLevel, vm.translations.geographyName, vm.translations.periodType, vm.translations.selectedPeriod, yoyMarket]];
        }
      }
      return createCellsArray;
    }

    function defaultReportName() {
      if (ObjectUtils.isNullOrUndefined(vm.reportName)) {
        var dateFormat = LocalizationService.getCurrentDateFormat(vm.currentOrganization);
        vm.reportName = translation.shoppertrakIndexReport + '(' + moment().format(dateFormat) + ')'
      }
    }

    function closeModal() {
      $('#miModal').modal('hide');
      $state.miOpen = false;
      $timeout(resetModal, 1000);
    }

    function resetModal() {
      vm.firstScreen = true;
      vm.secondScreen = false;
      vm.reportName = null;
      vm.enableDownloadBtn = false;
      vm.selectedGroupingName = 'Select';
      vm.periodType.period = 'Select';
      vm.selectedGeographyItems = [];
      vm.isAllSelected = false;
      setCategory(vm.subscribedCategories[0].uuid);
    }

    function buildPeriodToDateLabels(translations) {
      vm.periodToDateLabels = [];
      vm.periodToDateLabels.push(translations.ytd);
      vm.periodToDateLabels.push(translations.qtd);
      vm.periodToDateLabels.push(translations.mtd);
      vm.periodToDateLabels.push(translations.wtd);
    }

    function getPeriodToDatePeriodType(index) {
      var type;
      if (index >= vm.periodToDateLabels.length) {
        periodTypeCount = index % 4 === 0 ? 0 : periodTypeCount + 1;
        type = vm.periodToDateLabels[periodTypeCount];
      } else {
        type = vm.periodToDateLabels[index];
      }
      return type;
    }

    function onCsvDownload() {

      var cellsArray = createCsvColumnLabels(vm.translations.yoyOrg, vm.translations.yoyMarket);
      if (!vm.isPriorYear) {
        cellsArray = createCsvColumnLabels(vm.translations.customOrg, vm.translations.customMarket);
      }
      var cellsString = getCsvHeaderSection();
      
      _.each(vm.dataPoints, function (item, index) {

        var marketDataString = getValueForCsv(item.marketIndexData);

        var orgDataString = getValueForCsv(item.orgIndexData);
        var periodName = vm.selectedGroupingName;
        if (vm.periodType.period === 'periodToDate') {
          periodName = getPeriodToDatePeriodType(index);
        }

        if (isCompareDates()) {
          var startDates = item.startDates;
          var compareDates = item.comStartDates;
          if (vm.periodType.period === 'periodToDate') {
            startDates = item.startDates + ' - ' + item.endDates;
            compareDates = item.comStartDates + ' - ' + item.comEndDates;
          }
          if (vm.periodType.period === 'periodToDate') {
            startDates = item.startDates + ' - ' + item.endDates;
            compareDates = item.comStartDates + ' - ' + item.comEndDates;
          }

          if (vm.showOrgIndex) {
            cellsArray.push([item.categoryname, item.geographytype, item.geographyname, periodName, startDates, compareDates, marketDataString, orgDataString]);
          } else if (!vm.showOrgIndex) {
            cellsArray.push([item.categoryname, item.geographytype, item.geographyname, periodName, startDates, compareDates, marketDataString]);
          }
        } else {
          if (vm.showOrgIndex) {
            cellsArray.push([item.categoryname, item.geographytype, item.geographyname, periodName, item.startDates + ' - ' + item.endDates, marketDataString, orgDataString]);
          } else if (!vm.showOrgIndex) {
            cellsArray.push([item.categoryname, item.geographytype, item.geographyname, periodName, item.startDates + ' - ' + item.endDates, marketDataString]);
          }
        }

      });
      _.each(cellsArray, function (cellItem) {
        var dataString = cellItem.join(',');
        cellsString += dataString + '\n';
      });

      defaultReportName();
      utils.saveFileAs(vm.reportName + '.csv', cellsString, 'text/csv');
    }

    function toggleAllGeographies(){
      $rootScope.$broadcast('toggleAllGeographies', vm.isAllSelected);
    }

  }
})();
