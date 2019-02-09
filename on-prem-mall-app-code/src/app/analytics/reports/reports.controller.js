
(function () {
  'use strict';

  angular
    .module('shopperTrak')
    .controller('reportsController', ReportsController);

  ReportsController.$inject = [
    '$rootScope',
    '$scope',
    '$q',
    '$state',
    '$confirm',
    '$translate',
    '$mdDialog',
    '$rootElement',
    'features',
    'reportsData',
    'widgetLibraryService',
    'metricsHelper',
    'ObjectUtils',
    '$element',
    'csvExportConstants',
    'datePeriods'
  ];

  function ReportsController(
    $rootScope,
    $scope,
    $q,
    $state,
    $confirm,
    $translate,
    $mdDialog,
    $rootElement,
    features,
    reportsData,
    widgetLibraryService,
    metricsHelper,
    ObjectUtils,
    $element,
    csvExportConstants,
    datePeriods
  ) {
    var vm = this;
    vm.sortReports = sortReports;
    vm.toggleReportScheduleEnabled = toggleReportScheduleEnabled;
    vm.deleteReport = deleteReport;
    vm.downloadReport = downloadReport;
    vm.runReportToEmail = runReportToEmail;
    vm.editReport = editReport;
    vm.viewReport = viewReport;
    vm.setMode = setMode;
    vm.showModal = showModal;
    vm.refresh = refresh;
    vm.setReportType = setReportType;
    vm.deleteAllReportsForUser = deleteAllReportsForUser;
    vm.modalTitle = 'scheduleReport.CREATENEWREPORT';

    activate();

    /**
    * activates the module and loads reports and widget library
    */
    function activate() {
      vm.weekDays = csvExportConstants.weekDays;
      vm.datePeriods = datePeriods;
      vm.getDatePeriodTransKey = getDatePeriodTransKey;
      vm.getFrequencyTransKey = getFrequencyTransKey;
      vm.getFrequencySecondaryTransKey = getFrequencySecondaryTransKey;
      vm.getFrequencyTimeZone = getFrequencyTimeZone;
      vm.getFrequencyTime = getFrequencyTime;
      vm.numExportsInProgress = 0;
      vm.numRunnigReportsInProgress = 0;
      vm.runReportToEmailError = false;
      vm.exportError = false;
      vm.toggleReportScheduleEnabledInProgress = 0;
      vm.toggleReportScheduleEnabledError = false;
      vm.activeReport = getNewReportObject();
      vm.activeGroup = 'perimeter';
      vm.groupBySetting = 'day';
      vm.operatingHours = false;

      vm.sortBy = 'name';

      vm.isReversed = {
        name: false,
        report_type: false,
        period_type: false,
        frequency_type: false,
        frequency_time: false,
        frequency_timeZone: false
      };

      metricsHelper.translateMetrics().then(function () {
        vm.isLoading = true;
        loadData();
      });
    }

    function getDatePeriodTransKey(period_type) {
      var period = _.findWhere(vm.datePeriods, { key: period_type });
      if (!ObjectUtils.isNullOrUndefined(period)) {
        return period.shortTranslationLabel;
      }
      return '';
    }

    function getFrequencyTime(report) {
      if (!report.is_scheduled || ObjectUtils.isNullOrUndefined(report.frequency) ||
        ObjectUtils.isNullOrUndefined(report.frequency.time)) {
        return '';
      }

      return report.frequency.time.hour + ':' + report.frequency.time.minute + ' ' + report.frequency.time.type;
    }

    function getFrequencyTimeZone(report) {
      if (!report.is_scheduled || ObjectUtils.isNullOrUndefined(report.frequency) ||
        ObjectUtils.isNullOrUndefined(report.frequency.time)) {
        return '';
      }

      return report.frequency.time.timeZone;
    }

    function getFrequencyTransKey(report) {
      if (!report.is_scheduled || ObjectUtils.isNullOrUndefined(report.frequency)) {
        return '';
      }
      var freq = _.findWhere(csvExportConstants.frequencyChoices, { value: report.frequency.type });
      if (!ObjectUtils.isNullOrUndefined(freq)) {
        return freq.translation_label;
      }
      return '';
    }

    function getFrequencySecondaryTransKey(report) {
      if (!report.is_scheduled || ObjectUtils.isNullOrUndefined(report.frequency) ||
        ObjectUtils.isNullOrUndefinedOrEmpty(report.frequency.secondary)) {
        return '';
      }

      switch (report.frequency.type) {
        case 'week':
          return csvExportConstants.weekDays[report.frequency.secondary];
        case 'month':
          return csvExportConstants.monthParts[report.frequency.secondary];
        case 'year':
          return csvExportConstants.months[report.frequency.secondary];
        default:
          return ''
      }
    }

    /**
    * deletes all reports to clean data
    */
    function deleteAllReportsForUser() {
      vm.deleteFailed = false;
      $confirm({ content: $translate.instant('scheduleReport.AREYOUSUREDELETEREPORT') })
        .then(function (answer) {
          if (answer) {
            vm.deleteLoading = true;
            vm.workingText = $translate.instant('scheduleReport.DELETINGREPORT');
            reportsData.deleteReports()
              .then(function () {
                vm.reports = [];
                vm.deleteLoading = false;
              })
              .catch(function (error) {
                console.error('error deleting reports', error)
                vm.deleteLoading = false;
                vm.deleteFailed = true;
              });
          }
        });
    }

    /**
    * sets events and destroys them
    */
    function setEvents() {
      var watches = [];
      watches.push($rootScope.$on('reportAdded', function (event, data) {
        if (!ObjectUtils.isNullOrUndefined(data) && !ObjectUtils.isNullOrUndefined(data.report)) {
          vm.reports.push((data.report));
          setMode('', 0);
          transformData(vm.reports);
        }
      }));

      watches.push($rootScope.$on('reportUpdated', function (event, data) {
        if (!ObjectUtils.isNullOrUndefined(data) && !ObjectUtils.isNullOrUndefined(data.report)) {
          var index = _.findIndex(vm.reports, { _id: vm.activeReport._id })
          vm.reports[index] = data.report;
          setMode('', 0);
          transformData(vm.reports);
        }
      }));

      watches.push($rootScope.$on('phaseUpdated', function (event, data) {
        if (!ObjectUtils.isNullOrUndefined(data) && !ObjectUtils.isNullOrUndefined(data.phase)) {
          vm.phase = data.phase;
          if (vm.mode === 'new' && vm.phase < 1) {
            if (features.isEnabled('reportsCSV')) {
              vm.modalTitle = 'scheduleReport.CREATENEWREPORT';
              vm.activeReport.report_type = '';
            }
          }
        }
      }));

      watches.push($element.find('#reportConfigModal').on('hide.bs.modal', function () {
        vm.activeReport = {};
        vm.modalTitle = 'scheduleReport.CREATENEWREPORT';
        vm.setMode('', 0);
      }));

      $scope.$on('$destroy', function () {
        //hide the modal and remove modal backdrop to fix issue with back button
        angular.element('#reportConfigModal').modal('hide');
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();

        _.each(watches, function (unbindFunction) {
          if (angular.isFunction(unbindFunction)) {
            unbindFunction();
          }
        });
      });
    }

    /**
    * sets report type for activeReport in new mode user prompted to select report type first and updates the phase for add create modal
    */
    function setReportType(type) {
      vm.activeReport.report_type = type;
      vm.modalTitle = type === 'pdf' ? 'scheduleReport.CREATENEWPDFREPORT' : 'scheduleReport.CREATENEWCSVREPORT';
      vm.phase += 1;
    }

    /**
    * sets activeReport and title for the add edit modal on edit button click in report list sets edit mode and opens modal
    * @param {object} report to set active report that will be edited
    */
    function editReport(report, event) {
      vm.activeReport = angular.copy(report);
      reportsData.setCurrentOrgReport(report);
      vm.modalTitle = report.report_type === 'pdf' ? 'scheduleReport.EDITPDFREPORT' : 'scheduleReport.EDITCSVREPORT';
      vm.setMode('editReport', 1);
      showModal(event);
    }

    /**
    * sets activeReport and title for the view modal on view button click in report list sets edit mode as previewOnlyReport and opens modal
    * @param {object} report to set active report that will be viewed
    */
    function viewReport(report, event) {
      if (ObjectUtils.isNullOrUndefined(report)) {
        return;
      }
      vm.activeReport = angular.copy(report);
      vm.modalTitle = report.report_type === 'pdf' ? 'scheduleReport.VIEWPDFREPORT' : 'scheduleReport.VIEWCSVREPORT';
      vm.setMode('previewOnlyReport', 1);
      showModal(event);
    }

    /**
    * opens reportConfigModal modal
    */
    function showModal(event) {
      reportsData.data = vm;
      if (_.isUndefined(event)) return;
      $scope.activeReport = vm.activeReport;
      $mdDialog.show({
        openFrom: { top: 50, left: 50, width: 'auto', height: 'auto' },
        preserveScope: true,
        targetEvent: event,
        controller: ['$scope', 'reportsData', '$translate', function($scope, reportsData, $translate) {
          var self = this;
            self.activeReport = reportsData.data.activeReport;
            self.modalTitle = reportsData.data.modalTitle;
            self.phase = reportsData.data.phase;
            self.previewWidgetsScreen = reportsData.data.previewWidgetsScreen;
        }],
        controllerAs: 'vm',
        templateUrl:'app/analytics/reports/modals/modal.html'
      });
    }

    /**
    * gets new report and inits it for new mode based on create new report
    *  @returns {object} inits new object report and returns it for mode new
    */
    function getNewReportObject() {
      var report = {
        userId: vm.currentUser._id,
        name: '',
        report_type: '',
        organization_id: null,
        widget_ids: [],
        period_type: '',
        is_scheduled: false,
        email: {
          has_email: false,
          to: '',
          cc: '',
          bcc: ''
        },
        sftp: {
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
          },
        },
        frequency: {
          repeats: true,
          type: 'week',
          secondary: 'monday',
          time: {
            hour: '00',
            minute: '00',
            type: 'AM',
            timeZone: 'GMT'
          },
          messages: ''
        },
      }

      return report;
    }

    /**
    * sets vm mode and phase
    * @param {String} mode new or edit
    * @param {Number} phase 1 to 3(repolrt config, distribution settings and scheduling frequency settings)
    */
    function setMode(mode, phase, event) {
      if (mode === 'new') {
        vm.activeReport = getNewReportObject();
        vm.activeReport.isEditEnabled = true;
        if (!features.isEnabled('reportsCSV')) {
          phase = 1;
          vm.activeReport.report_type = 'pdf';
          vm.modalTitle = 'scheduleReport.CREATENEWPDFREPORT';
        }
        else {
          vm.modalTitle = 'scheduleReport.CREATENEWREPORT';
        }
      }
      vm.phase = phase;
      vm.mode = mode;
      showModal(event);
    }

    /**
    * reloads reports
    */
    function refresh() {
      loadData();
    }

    /**
   * makes api call to pause the schedule not implemented yet
   * @param {object} report to be downladed
   */
    function downloadReport(report) {
      var selectedOrgs = [_.where(vm.organizations, { organization_id: report.organization_id })];
      var dateRange = reportsData.getDateRangeFromReportPeriodType(report, selectedOrgs, vm.currentUser);
      if (report.report_type === 'csv') {
        exportCSV(dateRange, report, selectedOrgs);
        return;
      }
      exportPDF(dateRange, report, selectedOrgs);
    }

    /**
    * makes api call to exportPDF and handles error
    */
    function exportPDF(dateRange, report, selectedOrgs) {
      vm.numExportsInProgress += 1;
      reportsData.exportReportToPdf(report, dateRange, vm.availableWidgets, selectedOrgs[0], true)
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
    function exportCSV(dateRange, report) {
      vm.numExportsInProgress += 1;
      reportsData.doCSVExport(report, dateRange, vm.availableWidgets)
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
    * loads reports
    */
    function loadData() {
      vm.isLoading = true;
      var promises = [];
      promises.push(reportsData.loadReports(vm.currentUser));
      promises.push(widgetLibraryService.loadAvailableWidgetLibraries(vm.currentUser, vm.organizations));
      $q.all(promises)
        .then(function (response) {
          transformData(response[0]);
          vm.availableWidgets = response[1];
          setEvents();
        })
        .catch(function (error) {
          vm.availableWidgets = [];
          console.error('error loading report data widgets and reports', error);
          vm.isLoading = false;
          vm.allRequestsSucceeded = false;
        });
    }

    /**
    * checks if data is valid
    * @param {object} response the data to be validated
    * @returns {bool} returns bool based on data null or undefined
    */
    function isDataValid(response) {
      return !ObjectUtils.isNullOrUndefinedOrEmpty(response);
    }

    /**
    * checks if data is valid and sets reports and updates flags
    * @param {object} response the data to be validated and transformed
    */
    function transformData(response) {
      vm.allRequestsSucceeded = true;
      vm.isLoading = false;

      if (!isDataValid(response)) {
        vm.reports = [];
        return;
      }

      vm.reports = [];
      _.each(response, function (report) {
        if (report.organization_id === vm.currentOrganization.organization_id) {
          vm.reports.push(report);
        }
      })
    }

    /**
    * makes api call to pause the schedule not implemented yet
    * @param {object} report the report to pause
    */
    function toggleReportScheduleEnabled(report) {
      reportsData.setCurrentOrgReport(report);
      var selectedOrgs = [_.where(vm.organizations, { organization_id: report.organization_id })];
      var dateRange = reportsData.getDateRangeFromReportPeriodType(report, selectedOrgs, vm.currentUser);
      var pause = !report.is_schedule_paused;
      vm.toggleReportScheduleEnabledInProgressMess = pause ? '.PAUSINGREPORT' : '.ACTIVATINGREPORT'
      vm.toggleReportScheduleEnabledInProgress += 1;
      reportsData.saveSchedule(report, dateRange, selectedOrgs[0],
        vm.operatingHours, vm.weekDays,
        vm.availableWidgets, vm.activeGroup,
        vm.groupBySetting, pause)
        .then(function (response) {
          updateReportSchedulePause(report, response.data.result[0].disabled);
        }).catch(function (error) {
          console.error(error);
          vm.toggleReportScheduleEnabledError = true;
          vm.toggleReportScheduleEnabledInProgress -= 1;
        });
    }

    /**
    * updates the report and closes the model or shows error message
    *  @param {object} report is the model to close on success
    *  @param {boolean} paused to toggle schedule enabling for the report
    */
    function updateReportSchedulePause(report, paused) {
      var reportToUpdate = angular.copy(report);
      reportToUpdate.is_schedule_paused = paused;
      reportsData.updateReport(reportToUpdate)
        .then(function (response) {
          report.is_schedule_paused = response.data.result[0].is_schedule_paused;
          vm.toggleReportScheduleEnabledError = false;
          vm.toggleReportScheduleEnabledInProgress -= 1;
        })
        .catch(function (error) {
          console.error(error);
          vm.toggleReportScheduleEnabledError = true;
          vm.toggleReportScheduleEnabledInProgress -= 1;
        });

    }

    /**
    * makes api call to delete the report if user confirms removes report from the list if api deletes it
    * @param {object} report to be deleted after user confirmation
    */
    function deleteReport(report) {
      if (ObjectUtils.isNullOrUndefined(report) || !report.isEditEnabled) {
        return;
      }
      vm.deleteFailed = false;
      $confirm({ content: $translate.instant('scheduleReport.AREYOUSUREDELETEREPORT') })
        .then(function (answer) {
          if (answer) {
            vm.deleteLoading = true;
            vm.workingText = $translate.instant('scheduleReport.DELETINGREPORT');
            reportsData.deleteReport(report._id)
              .then(function () {
                vm.reports = _.without(vm.reports, report);
                deleteSchedule(report);
              })
              .catch(function (error) {
                console.error('error deleting report', error)
                vm.deleteLoading = false;
                vm.deleteFailed = true;
              });
          }
        });

    }

    function deleteSchedule(report) {
      if (ObjectUtils.isNullOrUndefined(report.scheduleId)) {
        vm.deleteLoading = false;
        vm.deleteFailed = false;
        return;
      }
      reportsData.deleteSchedule(report)
        .then(function () {
          vm.deleteLoading = false;
        })
        .catch(function (error) {
          console.error('error deleting report', error)
          vm.deleteLoading = false;
          vm.deleteFailed = true;
        });
    }

    /**
    * makes api call to run and email the report
    * @param {object} report to be emailed  not implemented yet
    */
    function runReportToEmail(report) {
      vm.numRunnigReportsInProgress += 1;

      reportsData.runReportToEmail(report)
        .then(function () {
          vm.runReportToEmailError = false;
          vm.numRunnigReportsInProgress -= 1;
        })
        .catch(function (error) {
          console.error(error);
          vm.runReportToEmailError = true;
          vm.numRunnigReportsInProgress -= 1;
        });
    }

    /**
    * sorts reports by property ui passes
    * @param {String} property name to be used for sorting
    */
    function sortReports(property) {
      var reversed = setReversed(property, vm.sortBy === property);
      vm.sortBy = property;
      vm.reports = sortData(vm.reports, property, reversed);
    };

    /**
    * sorts datalist with the property
    * @param {object} data to be sorted
    * @param {String} property to be used to sort
    * @param {Boolean} reversed to determin if reversing requires if same column sorted before then next time it needs to be reversed
    * @returns {Array} sorted data list
    */
    function sortData(data, property, reversed) {
      return reversed ? _.sortBy(data, function (obj) { return getObjectProperty(obj, property); }).reverse() : _.sortBy(data, function (obj) { return getObjectProperty(obj, property); });
    }

    function getObjectProperty(obj, property) {
      switch (property) {
        case 'frequency_type':
          return obj.frequency.type;
        case 'frequency_time':
          return obj.frequency.time.hour;
        case 'frequency_timeZone':
          return obj.frequency.time.timeZone;
        default:
          return obj[property];
      }
    }

    /**
    * help function for sort if it is reversed before
    * @param {String} property to be used to toggle the flag
    * @returns {Boolean}  vm.isReversed[property]
    */
    function toggleReversed(property) {
      vm.isReversed[property] = !vm.isReversed[property];
      return vm.isReversed[property];
    }

    /**
    * help function for sort set reversed
    * @param {String} property to be used to toggle the flag
    * @param {String} value to be used to toggle the flag
    * @returns {Boolean}  vm.isReversed[property]
    */
    function setReversed(property, value) {
      _.each(_.keys(vm.isReversed), function (key) {
        if (key !== property) {
          vm.isReversed[key] = false;
        }
      });
      if (vm.isReversed[property] !== value && value) {
        vm.isReversed[property] = value;
      }
      else { toggleReversed(property) }

      return vm.isReversed[property];
    }
  }
})();
