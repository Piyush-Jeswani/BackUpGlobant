(function () {
  'use strict';

  angular.module('shopperTrak')
    .controller('createReportController', createReportController);

  createReportController.$inject = [
    '$rootScope',
    '$scope',
    '$timeout',
    '$filter',
    '$mdDialog',
    'ObjectUtils',
    'reportsData',
    'LocalizationService',
    'ExportService',
    'csvExportConstants',
    'datePeriods',
    'features'
  ];

  function createReportController(
    $rootScope,
    $scope,
    $timeout,
    $filter,
    $mdDialog,
    ObjectUtils,
    reportsData,
    LocalizationService,
    ExportService,
    csvExportConstants,
    datePeriods,
    features
  ) {
    var vm = this;

    vm.data = reportsData.data;

    initVmParametersFromScope();

    activate();

    /**
    * Activates and init default params and sets watches
    */
    function activate() {
      //TODO: remove block when feature ready
      vm.showReportsSFTP = features.isEnabled('reportsSFTP');
      vm.reportsCSVEnabled = features.isEnabled('reportsCSV');

      setValueFromData();

      if (ObjectUtils.isNullOrUndefined(vm.report)) {
        return;
      }
      init();

      setWatches();
    }

    function setValueFromData() {
      if(_.isUndefined(vm.data)) return;
      if(!_.isUndefined(vm.data.mode)) vm.mode = vm.data.mode;
      if(!_.isUndefined(vm.data.phase)) vm.phase = vm.data.phase;
      if(!_.isUndefined(vm.data.activeReport)) vm.report = vm.data.activeReport;
      if(!_.isUndefined(vm.data.currentUser)) vm.currentUser = vm.data.currentUser;
      if(!_.isUndefined(vm.data.availableWidgets)) vm.availableWidgets = vm.data.availableWidgets;
      if(!_.isUndefined(vm.data.organizations)) vm.organizations = vm.data.organizations;
    }

    /**
    * update vm parameters from scope
    */
    function initVmParametersFromScope() {
      copyScopedVariable('currentUser');

      copyScopedVariable('organizations');

      copyScopedVariable('report');

      copyScopedVariable('mode');

      copyScopedVariable('phase');

      copyScopedVariable('availableWidgets');
    }

    function copyScopedVariable(propertyName) {
      if (ObjectUtils.isNullOrUndefined(vm[propertyName]) && !ObjectUtils.isNullOrUndefined($scope[propertyName])) {
        vm[propertyName] = $scope[propertyName];
      }
    }

    /**
    * Inits default params
    */
    function init() {
      vm.trueVal = true;
      vm.falseVal = false;
      vm.saveReport = saveReport;
      vm.cancel = cancel;
      vm.nextPhase = nextPhase;
      vm.setSecondaryFrequency = setSecondaryFrequency;
      vm.secondaryFrequencyIsSet = secondaryFrequencyIsSet;
      vm.checkPhase1Validation = checkPhase1Validation;
      vm.getPreviewTimePeriodTitle = getPreviewTimePeriodTitle;
      vm.getDatePeriodTransKey = getDatePeriodTransKey;
      vm.goBack = goBack;
      vm.updateReport = updateReport;
      vm.buttonIcon = 'glyphicon glyphicon-plus left'
      vm.addWidgetButtonTitle = 'scheduleReport.ADDAWIDGET';
      vm.frequencyButtonTitle = 'scheduleReport.FREQUENCY';

      vm.endPreview = endPreview;
      vm.prepPreview = prepPreview;
      vm.downloadReport = downloadReport;

      vm.disAllowedCharacters = /^[^[\]><$[\]|{}%!^*+=?]+$/i;
      vm.disableContinueButton = true;
      vm.isDisabledSaveButton = true;

      vm.saveError = false;

      vm.numExportsInProgress = 0;

      vm.activeChoices = angular.copy(csvExportConstants.activeChoices);

      vm.weekDays = angular.copy(csvExportConstants.weekDays);

      vm.monthParts = angular.copy(csvExportConstants.monthParts);

      vm.months = angular.copy(csvExportConstants.months);
      initMultiSelectLists();

      initTimeZone();

      loadTimezones();

      //set default values for following values used in schedule report untill they are added into ui or we get new api end point
      vm.activeGroup = 'perimeter';
      vm.groupBySetting = 'day';

      vm.operatingHours = false;
    }

    /**
    * Inits default params
    */
    function loadTimezones() {
      if (!ObjectUtils.isNullOrUndefined(vm.searchTermTimezone) && vm.searchTermTimezone.length > 3) {
        vm.usedTypeAhead = true;
        vm.isSearchingItems = true;

        vm.filteredTzData = $filter('filter')(vm.tzData, { name: vm.searchTermTimezone });
      } else {
        vm.filteredTzData = vm.tzData;
      }
      vm.isSearchingItems = false;
    }

    /**
    * Inits multi select lists to fix bug in multiselect
    */
    function initMultiSelectLists() {

      //copy selectable lists from object constants
      vm.selectableOrgs = angular.copy(vm.organizations);
      vm.frequencyChoices = angular.copy(csvExportConstants.frequencyChoices);
      vm.datePeriods = angular.copy(datePeriods);

      //empty selection lists
      vm.selectedDatePeriod = [];
      vm.selectedOrgs = [];

    }

    /**
    * Inits time zone for multi select lists to fix bug in multiselect
    */
    function initTimeZone() {
      vm.tzData = [];
      if (ObjectUtils.isNullOrUndefinedOrEmptyObject(vm.report)) {
        return;
      }

      vm.timezones = moment.tz.names();
      // Filter out 'Etc/*' values as they are duplicates to location based zones
      vm.timezones = $filter('filter')(vm.timezones, function (item) {
        return item.substring(0, 4) !== 'Etc/';
      });

      var i = 0;
      _.each(vm.timezones, function (tz) {
        vm.tzData.push({
          'id': i,
          'name': tz
        });
        if (tz === vm.report.frequency.time.timeZone) {
          vm.scheduleTimezone = {
            id: i,
            name: tz
          };

        }
        i++;
      });
    }


    /**
    * set watches and destroys them
    */
    function setWatches() {
      var watches = [];
      watches.push($scope.$watchGroup([
        'vm.mode',
        'vm.report'
      ], setVmFromReportObject));

      watches.push($scope.$watchGroup([
        'vm.report.name',
        'vm.report.is_scheduled',
        'vm.unOrderedSelectedWidgets',
        'vm.selectedDatePeriod',
        'vm.selectedOrgs'
      ], checkPhase1Validation));

      watches.push($scope.$watchGroup([
        'vm.report.email.has_email',
        'vm.report.email.to',
        'vm.report.sftp.upload.has_upload',
        'vm.report.sftp.upload.server',
        'vm.report.sftp.upload.port',
        'vm.report.sftp.upload.path',
        'vm.report.sftp.upload.user_name',
        'vm.report.sftp.upload.password',
        'vm.report.sftp.download.has_upload',
        'vm.report.sftp.download.server',
        'vm.report.sftp.download.port',
        'vm.report.sftp.download.path',
        'vm.report.sftp.download.user_name',
        'vm.report.sftp.download.password'
      ], checkPhase2Validation));

      watches.push($scope.$watchGroup([
        'vm.report.frequency.repeats',
        'vm.report.frequency.secondary',
        'vm.report.frequency.type'
      ], checkPhase3Validation));

      watches.push($scope.$watch('vm.unOrderedSelectedFrequencyChoices', setFrequencyType));

      watches.push($scope.$on('searchTextChanged', function (event, searchValue) {
        if ((vm.searchTermTimezone === '' && searchValue === '') || (vm.searchTermTimezone !== searchValue)) {
          vm.searchUsed = false;
          vm.searchTermTimezone = searchValue;
          $rootScope.savedSearchterm = searchValue;
          loadTimezones();
        }
      }));

      $scope.$on('$destroy', function () {
        _.each(watches, function (unbindFunction) {
          if (angular.isFunction(unbindFunction)) {
            unbindFunction();
          }
        });
      });
    }

    /**
    * in the edit mode it sets selected items from report
    */
    function setVmFromReportObject() {
      vm.setVmFromReportObjectFlag = true;
      initMultiSelectLists();

      initTimeZone();

      if (ObjectUtils.isNullOrUndefinedOrBlank(vm.mode) ||
        vm.phase === -1 ||
        ObjectUtils.isNullOrUndefinedOrEmptyObject(vm.report)) {
        vm.setVmFromReportObjectFlag = false;
        return;
      }

      vm.saveError = false;
      vm.saveScheduleError = false;
      setSelectedOrg();
      setSelectedWidgets();
      setSelectedDatePeriod();
      setSelectedFrequency();
      checkPhase1Validation();

      $timeout(function () {
        vm.setVmFromReportObjectFlag = false;
      }, 10);
    }

    /**
    * in the edit mode it sets selected org with report org id
    */
    function setSelectedOrg() {
      vm.showOrgSelect = vm.selectableOrgs.length > 1 ? true : false;
      if (!vm.showOrgSelect) {
        vm.selectedOrgs = vm.selectableOrgs;
      } else {
        vm.selectedOrgs = [];
        if (ObjectUtils.isNullOrUndefined(vm.report.organization_id)) {
          return;
        }

        vm.selectedOrgs.push(_.findWhere(vm.selectableOrgs, { organization_id: vm.report.organization_id }));
      }
    }

    /**
    * in the edit mode it sets selected widgets with widget ids
    */
    function setSelectedWidgets() {
      if (ObjectUtils.isNullOrUndefinedOrEmpty(vm.availableWidgets)) {
        return;
      }

      vm.unOrderedSelectedWidgets = [];

      if (ObjectUtils.isNullOrUndefinedOrEmpty(vm.report.widget_ids)) {
        _.each(vm.availableWidgets, function (widget) {
          widget.selected = false;
        });
        return;
      }
      var selectedWidgets = [];

      if (ObjectUtils.isNullOrUndefinedOrEmpty(vm.report.widget_ids)) {
        vm.unOrderedSelectedWidgets = selectedWidgets;
        return;
      }
      _.each(vm.report.widget_ids, function (widgetId) {
        var widget = _.findWhere(vm.availableWidgets, { _id: widgetId });
        if (!ObjectUtils.isNullOrUndefined(widget)) {
          widget.selected = true;
          selectedWidgets.push(widget);
        }
      });
      vm.unOrderedSelectedWidgets = selectedWidgets;
    }

    /**
    * in the edit mode it sets selected frequency from report frequency type
    */
    function setSelectedFrequency() {
      var frequency = ObjectUtils.isNullOrUndefinedOrBlank(vm.report.frequency.type) ? 'week' : vm.report.frequency.type;

      var freq = _.findWhere(vm.frequencyChoices, { value: frequency });

      if (!ObjectUtils.isNullOrUndefined(freq)) {
        vm.unOrderedSelectedFrequencyChoices = [freq];
      }
    }

    /**
    * in the edit mode it sets selected date period from report period type
    */
    function setSelectedDatePeriod() {
      vm.selectedDatePeriod = [];
      if (ObjectUtils.isNullOrUndefinedOrBlank(vm.report.period_type)) {
        return;
      }
      var period = _.findWhere(vm.datePeriods, { key: vm.report.period_type });
      setDateRangeFromPeriodType();
      vm.selectedDatePeriod.push(period);
    }

    /**
    * Sets the date range  periods based upon the PeriodType. Private function.
    */
    function setDateRangeFromPeriodType() {
      if (ObjectUtils.isNullOrUndefinedOrEmpty(vm.selectedOrgs)) {
        vm.dateRange = null;
        return;
      }

      vm.dateRange = reportsData.getDateRangeFromReportPeriodType(vm.report, vm.selectedOrgs, vm.currentUser);
    }

    /**
    * Sets disable flags for save and continue buttons for phase 1
    */
    function checkPhase1Validation() {
      if (vm.phase !== 1) {
        return;
      }

      vm.disableContinueButton = ObjectUtils.isNullOrUndefinedOrBlank(vm.report.name) ||
        ObjectUtils.isNullOrUndefinedOrEmpty(vm.unOrderedSelectedWidgets) ||
        ObjectUtils.isNullOrUndefinedOrEmpty(vm.selectedDatePeriod) ||
        ObjectUtils.isNullOrUndefinedOrEmpty(vm.selectedOrgs) ? true : false;

      vm.phase1Validated = !vm.disableContinueButton;

      if (!vm.report.is_scheduled) {
        vm.isDisabledSaveButton = vm.disableContinueButton;
      }
    }

    /**
    * Sets reports frequency secondary
    *  @param {object} frequency is sent to set the value
    */
    function setSecondaryFrequency(frequency) {
      vm.report.frequency.secondary = frequency;
    }

    /**
    * checks if frequency is set as secondary
    *  @param {object} frequency is sent to check
    */
    function secondaryFrequencyIsSet(frequency) {
      return vm.report.frequency.secondary === frequency;
    }

    /**
    * Sets disable flags for  continue buttons for phase 2
    */
    function checkPhase2Validation() {
      if (vm.phase !== 2) {
        return;
      }
      vm.disableContinueButton = !checkEmailValidation() || !checkSFTPValidation();
    }

    /**
    * Sets disable flags for  save buttons for phase 3
    */
    function checkPhase3Validation() {
      if (vm.phase !== 3) {
        return;
      }
      vm.isDisabledSaveButton = !checkFrequencyValidation();
      vm.disableContinueButton = vm.isDisabledSaveButton;
    }

    /**
    * Sets frequency type for report based on selected choice and inits secondary value
    */
    function setFrequencyType() {
      if (ObjectUtils.isNullOrUndefined(vm.unOrderedSelectedFrequencyChoices)) {
        return;
      }
      if (vm.setVmFromReportObjectFlag) {
        return;
      }
      vm.report.frequency.secondary = '';
      if (ObjectUtils.isNullOrUndefinedOrEmpty(vm.unOrderedSelectedFrequencyChoices)) {
        vm.report.frequency.type = '';
        return;
      }
      vm.report.frequency.type = vm.unOrderedSelectedFrequencyChoices[0].value;
      switch (vm.report.frequency.type) {
        case 'week':
          return setSecondaryFrequency('monday');
        case 'month':
          return setSecondaryFrequency('1st');
        case 'year':
          return setSecondaryFrequency('january');
      }
    }

    /**
    * checks frequency validation
    *  @returns {bool} depending on selected frequency and repeats flag for the report
    */
    function checkFrequencyValidation() {
      if (!vm.report.frequency.repeats) {
        return true;
      }
      if (ObjectUtils.isNullOrUndefinedOrEmpty(vm.unOrderedSelectedFrequencyChoices)) {
        return false;
      }

      if (vm.report.frequency.type !== 'day') {
        return !ObjectUtils.isNullOrUndefinedOrBlank(vm.report.frequency.secondary)
      }
      return true;
    }

    /**
    * checks email validation
    *  @returns {bool} depending on to address and has_eamil flag
    */
    function checkEmailValidation() {
      if (!vm.report.email.has_email) {
        return true;
      }

      return !ObjectUtils.isNullOrUndefinedOrBlank(vm.report.email.to);
    }

    /**
    * checks sftp validation
    *  @returns {bool} depending server settings and flags
    */
    function checkSFTPValidation() {
      return (
        !vm.report.sftp.upload.has_upload ||
        !ObjectUtils.isNullOrUndefinedOrBlank(vm.report.sftp.upload.server) &&
        !ObjectUtils.isNullOrUndefinedOrBlank(vm.report.sftp.upload.path) &&
        !ObjectUtils.isNullOrUndefinedOrBlank(vm.report.sftp.upload.port) &&
        !ObjectUtils.isNullOrUndefinedOrBlank(vm.report.sftp.upload.user_name) &&
        !ObjectUtils.isNullOrUndefinedOrBlank(vm.report.sftp.upload.password)
      ) &&
        (!vm.report.sftp.download.has_download ||
          !ObjectUtils.isNullOrUndefinedOrBlank(vm.report.sftp.download.server) &&
          !ObjectUtils.isNullOrUndefinedOrBlank(vm.report.sftp.download.path) &&
          !ObjectUtils.isNullOrUndefinedOrBlank(vm.report.sftp.download.port) &&
          !ObjectUtils.isNullOrUndefinedOrBlank(vm.report.sftp.download.user_name) &&
          !ObjectUtils.isNullOrUndefinedOrBlank(vm.report.sftp.download.password)
        );
    }

    /**
    * saves the report with mode
    *  @param {object} traget is the model to close on success
    */
    function saveReport(target) {
      $scope.vm.reportNameExists = false;
      setReportObject();

      save(target);
    }

    /**
    * saves the report with mode
    *  @param {object} traget is the model to close on success
    */
    function save(target) {
      if (vm.mode === 'new') {
        saveNewReport(target);
      }
      else {
        updateReport(target, false);
      }
    }

    /**
    * saves the report with mode
    *  @param {object} traget is the model to close on success
    */
    function saveSchedule(target) {
      reportsData.saveSchedule(vm.report, vm.dateRange, vm.selectedOrgs[0],
        vm.operatingHours, vm.weekDays,
        vm.availableWidgets, vm.activeGroup,
        vm.groupBySetting)
        .then(function (response) {
          vm.report.scheduleId = _.isUndefined(response.data.result[0]._id) ? null : response.data.result[0]._id;
          vm.saveScheduleError = false;
          updateReport(target, true);
        })
        .catch(function (error) {
          console.error(error);
          vm.report.scheduleId = null;
          vm.saveScheduleError = true;
        });
    }

    /**
    * saves new report and closes the model or shows error message
    *  @param {object} traget is the model to close on success
    */
    function saveNewReport(target) {
      reportsData.saveNewReport(vm.report)
        .then(function (response) {
          vm.saveError = false;

          if (vm.report.is_scheduled &&
            reportsData.hasValidData(response)) {
            vm.report._id = response.data.result[0]._id;
            return saveSchedule(target);
          }

          closeModel();
        })
        .catch(function (error) {
          console.error(error);
          vm.phase = -1;
          vm.saveError = true;
        });
    }

    /**
    * updates the report and closes the model or shows error message
    *  @param {object} traget is the model to close on success
    */
    function updateReport(target, isScheduleSaved) {
      reportsData.updateReport(vm.report)
        .then(function () {
          vm.saveError = false;
          if (!isScheduleSaved) {
            return saveSchedule(target);
          }
          closeModel();
        })
        .catch(function (error) {
          vm.phase = -1;
          vm.saveError = true;
          console.error(error);
        });
    }

    /**
    * closes the model with target
    */
    function closeModel() {
      vm.selectedOrgs = [];
      $mdDialog.hide();
    }

    /**
    * gets the period key we use in dateperiod constants
    * @param {String} period if period is a short key then return long key
    * @return {String} period
    */
    function getPeriodKey(period) {
      switch (period) {
        case 'wtd':
          return 'week_to_date';
          break;
        case 'mtd':
          return 'month_to_date';
          break;
        case 'qtd':
          return 'quarter_to_date';
          break;
        case 'ytd':
          return 'year_to_date';
          break;
      }
      return period;
    }

    /**
    * gets the translation key for the period
    * @param {String} period period type
    * @return {String} trans key
    */
    function getDatePeriodTransKey(period_type) {
      var period = _.findWhere(vm.datePeriods, { key: getPeriodKey(period_type) });
      if (!ObjectUtils.isNullOrUndefined(period)) {
        return period.shortTranslationLabel;
      }
      return '';
    }

    /**
    * gets the date fomat for org and user
    * @return {String} current date format with selected user and org
    */
    function getDateFormat() {
      reportsData.setLocalization(vm.selectedOrgs[0], vm.currentUser);
      return LocalizationService.getCurrentDateFormat(vm.selectedOrgs[0]);
    }

    /**
    * gets getPreviewTimePeriodTitle for the widget
    * @param {Object} widget to check overrideRange
    * @return {String} period formatted date range title
    */
    function getPreviewTimePeriodTitle(widget) {
      var dateRange = ObjectUtils.isNullOrUndefinedOrBlank(widget.overrideRange) ? vm.dateRange : reportsData.getDateRangeFromPeriodType(widget.overrideRange, vm.currentUser, vm.selectedOrgs[0]);
      var dateFormat = getDateFormat();
      var start = dateRange.start.format(dateFormat);

      var end = dateRange.end.format(dateFormat);
      var period = start + ' - ' + end;

      return period;
    }

    /**
    * sets report parameters before saving based on vm settings
    */
    function setReportObject() {
      if (!ObjectUtils.isNullOrUndefinedOrEmpty(vm.selectedOrgs)) {
        vm.report.organization_id = vm.selectedOrgs[0].organization_id;
      }

      vm.report.widget_ids = _.map(vm.unOrderedSelectedWidgets, function (item) {
        return item._id;
      });

      if (!ObjectUtils.isNullOrUndefinedOrEmpty(vm.selectedDatePeriod) && !ObjectUtils.isNullOrUndefined(vm.selectedDatePeriod[0])) {
        vm.report.period_type = vm.selectedDatePeriod[0].key;
      }

      setDateRangeFromPeriodType();

      if (!vm.report.is_scheduled) {
        clearReportScheduleParams();
        return;
      }

      if (!ObjectUtils.isNullOrUndefinedOrEmpty(vm.unOrderedSelectedFrequencyChoices)) {
        vm.report.frequency.type = vm.unOrderedSelectedFrequencyChoices[0].value;
      }
      if (!ObjectUtils.isNullOrUndefined(vm.scheduleTimezone)) {
        vm.report.frequency.time.timeZone = vm.scheduleTimezone.name;
      }
    }

    /**
   * gets new report and inits it for new mode based on create new report
   *  @returns {object} inits new object report and returns it for mode new
   */
    function clearReportScheduleParams() {
      vm.report.email = {
        has_email: false,
        to: '',
        cc: '',
        bcc: ''
      };
      vm.report.sftp = {
        upload: {
          has_upload: false,
          server: '',
          path: '',
          port: '',
          user_name: '',
          password: ''
        },
        download: {
          has_download: false,
          server: '',
          path: '',
          port: '',
          user_name: '',
          password: ''
        }
      };
      vm.report.frequency = {
        repeats: true,
        type: 'week',
        secondary: '',
        time: {
          hour: '00',
          minute: '00',
          type: 'AM',
          timeZone: 'GMT'
        },
        messages: ''
      };
    }


    /**
    * sets phase and diasble flag for continue button and validates for new phase
    */
    function nextPhase() {
      vm.disableContinueButton = true;

      vm.phase += 1;
      switch (vm.phase) {
        case 2:
          checkPhase2Validation();
          break;
        case 3:
          checkPhase3Validation();
          break;
      }
    }

    /**
    * sets phase and mode to the initial
    */
    function cancel() {
      vm.mode = '';
      vm.phase = 0;
      $mdDialog.hide();
    }

    function clearSaveErrors() {
      vm.saveScheduleError = false;
      vm.saveError = false;
      vm.phase = 1;
    }

    /**
    * sets phase and diasble flag for preview if it is preview mode
    */
    function goBack() {
      if (vm.saveError || vm.saveScheduleError) {
        return clearSaveErrors();
      }
      vm.phase -= 1;
      if (vm.mode === 'new' && vm.phase < 1) {
        $rootScope.$broadcast('phaseUpdated', { phase: vm.phase });
      }
    }

    /**
    * sets preview mode and date range base on selected period for widgets to use it
    */
    function prepPreview() {
      setReportObject();
      vm.previewWidgetsScreen = true;
    }

    /**
    * sets preview mode to false to hide preview view and continue to set report parameters for scheduling and distribution if it is scheduling
    */
    function endPreview() {
      vm.previewWidgetsScreen = false;
    }

    /**
    * makes api call to pause the schedule not implemented yet
    * @param {object} report to be downladed
    */
    function downloadReport() {
      vm.numExportsInProgress += 1;
      setReportObject();
      if (vm.report.report_type === 'csv') {
        exportCSV();
        return;
      }
      exportPDF();
    }

    /**
    * makes api call to exportPDF and handles error
    */
    function exportPDF() {
      reportsData.exportReportToPdf(vm.report, vm.dateRange, vm.availableWidgets, vm.selectedOrgs[0], false)
        .then(function () {
          vm.exportError = false;
          vm.numExportsInProgress -= 1;
        })
        .catch(function (error) {
          console.error(error);
          vm.exportError = true;
          vm.numExportsInProgress -= 1;
        });
    }

    /**
   * makes api call to exportCSV and handles error
   */
    function exportCSV() {
      reportsData.doCSVExport(vm.report, vm.dateRange, vm.availableWidgets)
        .then(function () {
          vm.exportError = false;
          vm.numExportsInProgress -= 1;
        })
        .catch(function (error) {
          console.error(error);
          vm.exportError = true;
          vm.numExportsInProgress -= 1;
        });
    }
  }
})();
