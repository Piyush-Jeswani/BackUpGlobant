(function () {
  'use strict';

  angular.module('shopperTrak')
    .factory('reportsData', reportsData);

  reportsData.$inject = [
    '$rootScope',
    '$q',
    '$location',
    '$http',
    '$window',
    '$timeout',
    'ObjectUtils',
    'apiUrl',
    'utils',
    'googleAnalytics',
    'ExportService',
    'session',
    'dateRangeService',
    'LocalizationService',
    'generatePdf',
  ];

  function reportsData(
    $rootScope,
    $q,
    $location,
    $http,
    $window,
    $timeout,
    ObjectUtils,
    apiUrl,
    utils,
    googleAnalytics,
    ExportService,
    session,
    dateRangeService,
    LocalizationService,
    generatePdf) {

   var currentOrganizationReport;
    /**
    * loads reports for the user
    * @return {Array} report list for the uer
    */
    function loadReports(user) {
      var deferred = $q.defer();
      $http.get(apiUrl + '/report')
        .then(function (response) {
          var schedules = transformData(response, user);

          deferred.resolve(schedules);
        })
        .catch(function (error) {
          deferred.reject(error);
        });

      return deferred.promise;
    }

    /**
    * delete reports
    */
    function deleteReports() {
      var deferred = $q.defer();
      $http.delete(apiUrl + '/reports')
        .then(function (response) {
          deferred.resolve(response);
        })
        .catch(function (error) {
          deferred.reject(error);
        });

      return deferred.promise;
    }

    /**
    * creates new report and retuns it in success case and broadcasts reportAdded event so ui could update the view list
    * @param {object} report to create
    * @return {object} report to the ui to update the view
    */
    function saveNewReport(report) {
      var deferred = $q.defer();

      $http.post(apiUrl + '/report/', {
        config_object: report
      })
        .then(function (result) {
          result.data.result[0].isEditEnabled = true;
          $rootScope.$broadcast('reportAdded', { report: result.data.result[0] });
          deferred.resolve(result);
        }, function (err) {
          deferred.reject(err);
        });

      return deferred.promise;
    }

    /**
    * deletes a report
    * @param {string} reportId to find the report to delete api expects
    * @return {object} deleted report
    */
    function deleteReport(reportId) {
      var deferred = $q.defer();

      $http.delete(apiUrl + '/report/' + reportId)
        .then(function (result) {
          deferred.resolve(result);
        }, function (err) {
          deferred.reject(err);
        });

      return deferred.promise;
    }

    /**
    * deletes a report
    * @param {string} report to find the schedule for report to delete
    * @return {object} deleted report
    */
    function deleteSchedule(report) {
      var deferred = $q.defer();
      if (ObjectUtils.isNullOrUndefined(report.scheduleId)) {
        var err = 'deleteSchedule error report does not have scheduleId';
        console.error(err);
        deferred.reject(err);
        return deferred.promise;
      }
      var deferred = $q.defer();
      $http(buildDeleteScheduleRequest(report))
        .then(function (result) {
          deferred.resolve(result);
        }).catch(function (error) {
          console.error('deleteSchedule error', error.status);
          deferred.reject(error);
        });

      return deferred.promise;
    }

    /**
    * private help function to create pdf request
    * @param {Object} report for org id
    * @return {Object} request object to pass into http service
    */
    function buildDeleteScheduleRequest(report) {
      var method = 'DELETE';
      var url = apiUrl + '/scheduled-reports/' + report.scheduleId;
      return {
        method: method,
        url: url,
        headers: {
          'Authorization': session.getToken()
        }
      };
    }

    /**
    * updates existing report
    * @param {object} report to be updated
    * @return {object} report to be updated in ui and broadcasts reportUpdated so ui would update the list
    */
    function updateReport(report) {
      var deferred = $q.defer();

      $http.put(apiUrl + '/report/' + report._id, { config_object: report })
        .then(function (result) {
          result.data.result[0].isEditEnabled = true;
          $rootScope.$broadcast('reportUpdated', { report: result.data.result[0] });
          deferred.resolve(result);
        }).catch(function (error) {
          deferred.reject(error);
        });

      return deferred.promise;
    }

    /**
    * transforms report list data
    * @param {object} response to find selected metrics in report widgets
    * @return {Array} report list
    */
    function transformData(response, user) {
      //check if data is valid
      if (!hasValidData(response)) {
        return [];
      }
      _.map(response.data.result, function (_item) {
        _item.isEditEnabled = user.superuser || _item.userId === user._id;
      });

      return _.sortBy(response.data.result, 'name');
    }

    /**
    *validates data
    * @param {object} response to validate
    * @return {Boolean} true if data is valid
    */
    function hasValidData(response) {
      return !ObjectUtils.isNullOrUndefinedOrEmptyObject(response) &&
        !ObjectUtils.isNullOrUndefinedOrEmptyObject(response.data) &&
        !ObjectUtils.isNullOrUndefinedOrEmpty(response.data.result);
    }

    /**
    * finds selected metric ids from report's widgets
    * @param {object} report to find widget ids
    * @param {Array} availableWidgets to find selected metrics in report widgets
    * @return {Array} metric list to pass to the api
    */
    function getSelectedMetricIds(report, availableWidgets) {
      var metrics = [];
      _.each(report.widget_ids, function (id) {
        var widget = _.findWhere(availableWidgets, { _id: id });
        setMetrics(widget, metrics);
      });
      return metrics;
    }

    /**
    * populates metrics list from widget
    * @param {object} widget to get metrics
    * @return {object} metrics to populate
    */
    function setMetrics(widget, metrics) {
      if (widget.widgetType === 'graph') {
        _.each(widget.yAxis, function (axis) {
          if (!_.contains(metrics, axis.selectedMetric)) {
            metrics.push(axis.selectedMetric);
          }
        });
        return;
      }
      _.each(widget.columns, function (metric) {
        if (!_.contains(metrics, metric)) {
          metrics.push(metric);
        }
      });
    }

    /**
    * call api to create csv export
    * @param {object} report to find widget ids
    * @param {Array} availableWidgets to find selected metrics in report widgets
    * @param {object} dateRange to pss to the api has start and end time
    */
    function doCSVExport(report, dateRange, availableWidgets) {
      var deferred = $q.defer();
      var params = {
        orgId: report.organization_id,
        reportStartDate: moment(dateRange.start).toISOString(),
        reportEndDate: moment(dateRange.end).toISOString(),
        dateRangeType: report.period_type,
        kpi: getSelectedMetricIds(report, availableWidgets)
      };

      $http.get(apiUrl + '/kpis/report', {
        headers: {
          'Accept': 'text/csv'
        },
        params: params
      }).then(function (response) {
        googleAnalytics.trackUserEvent('csv', 'generate');

        utils.saveFileAs(report.name + '.csv', response.data, 'text/csv');
        onExportFinish(report, true);
        deferred.resolve(report.name + '.csv');
      }).catch(function (error) {
        onExportFinish(report, false);
        deferred.reject(error);
      });

      return deferred.promise;
    }

    /**
    * private help function to create pdf request
    * @param {String} builtPdfUrl url for pdf
    * @return {Object} request object to pass into http service
    */
    function buildPdfRequest(builtPdfUrl) {
      return {
        method: 'GET',
        url: apiUrl + '/pdf?url=' + builtPdfUrl,
        headers: {
          'Accept': 'application/pdf',
          'Authorization': session.getToken()
        },
        responseType: 'arraybuffer'
      };
    }

    function buildPdfUrlWithWidgets(report, widgets) {
      var widgetData = {
        userId: report.userId,
        widgets: widgets
      };

      var url = $location.absUrl().split('#')[0] + '#/pdf/';

      var encodedWidgetData = encodeURIComponent(JSON.stringify(widgetData));

      return {
        fullPdfUrl: encodeURIComponent(url) + encodedWidgetData,
        basePdfUrl: url,
        encodedWidgetData: encodedWidgetData
      };
    }

    function buildMetricListFromReport(report, widgets, dateRange, org) {
      var parameters = [];

      angular.forEach(widgets, function (widget) {
        var parameter = {
          'widgetId': widget._id,
          'partialPageName': widget.partialPageName,
          'pageName': widget.pageName,
          'summaryKey': getSummaryKey(widget)
        };

        parameters.push(parameter);
      });

      return {
          'widgetIds': _.pluck(widgets, '_id'),
          'widgetParams': parameters,
          'loadWidgetsFromIdList': true,
          'organizationId': report.organization_id,
          'org': org,
          'dateRange': dateRange,
          'periodType': report.period_type
        };
    };

    /**
    * makes widget list to pass to create pdf from them
    * @param {object} report to find widget ids
    * @param {Array} availableWidgets to find widgets in report widgets
    * @return {Array} widget list to create pdf
    */
    function getWidgets(report, availableWidgets) {
      var widgets = [];
      _.each(report.widget_ids, function (id) {
        var widget = _.findWhere(availableWidgets, { _id: id });
        if (!ObjectUtils.isNullOrUndefinedOrEmptyObject(widget)) {
          widgets.push(widget);
        }
      });
      return widgets;
    }

    /**
   * private help function for export
   * @param {object} widget to find widget ids
   * @return {String} summary key to render the widget depending on widgetType
   */
    function getSummaryKey(widget) {
      if (widget.widgetType === 'graph') {
        return 'widget-library-graph';
      }
      return 'table-grid-widget';
    }

    /**
    * get widget data private helper function for export
    * @param {object} report to find report id or widget ids
    * @param {object} dateRange to to pass for pdf export
    * @param {object} availableWidgets to find widget ids
    * @param {object} org to to pass to the buildMetricListFromReport
    * @return {Object} widgetData object for pdf url private helper function
    */
    function getWidgetData(report, dateRange, availableWidgets, org) {
      var widgetData = {
        userId: report.userId,
        loadWidgets: true,
        reportId: report._id,
        dateRange: dateRange,
        periodType: report.period_type
      };

      if (ObjectUtils.isNullOrUndefinedOrBlank(report._id) &&
        !ObjectUtils.isNullOrUndefinedOrEmpty(availableWidgets)) {
        widgetData.loadWidgets = false;
        widgetData.widgets = buildMetricListFromReport(report, getWidgets(report, availableWidgets), dateRange, org);
      }

      return widgetData;
    }

    /**
    * builds pdf url private helper function for export
    * @param {object} userId to find widget ids
    * @return {Object} uri object for pdf url private helper function
    */
    function buildPdfUrl(report, dateRange, availableWidgets, org, loadWidgets) {
      if (!loadWidgets) {
        var widgets = buildMetricListFromReport(report, getWidgets(report, availableWidgets), dateRange, org);

        return buildPdfUrlWithWidgets(report, widgets);
      }
      var widgetData = getWidgetData(report, dateRange, availableWidgets, org);

      var url = $location.absUrl().split('#')[0] + '#/pdf/';

      var encodedWidgetData = encodeURIComponent(JSON.stringify(widgetData));

      return {
        fullPdfUrl: encodeURIComponent(url) + encodedWidgetData,
        basePdfUrl: url,
        encodedWidgetData: encodedWidgetData
      };
    }

    function onExportFinish(report, successful) {
      var exportDetails = {
        cart: report,
        success: successful
      };

      $rootScope.$broadcast('pdfExportFinish', exportDetails);
    }

    /**
    * exports to pdf either creates and saves pdf file or opens pdf url in new tab
    * @param {object} report to be exported
    * @param {object} dateRange calculated date range with report period type
    * @param {Array} availableWidgets to find required parameters in reports widgets based on widget ids in report like selected metrics in report widgets
    * @return {String} in succes case as file name
    */
    function exportReportToPdf(report, dateRange, availableWidgets, org, loadWidgets, generatePdfFlag) {
      if (ObjectUtils.isNullOrUndefined(generatePdfFlag)) {
        generatePdfFlag = generatePdf;
      }

      var deferred = $q.defer();
      googleAnalytics.trackUserEvent('pdf', 'generate');

      var pdfInfo = buildPdfUrl(report, dateRange, availableWidgets, org, loadWidgets);
      $rootScope.$broadcast('pdfExportStart', report);

      var request = buildPdfRequest(pdfInfo.fullPdfUrl);
      if (generatePdfFlag === true) {
        $http(request)
          .then(function (response) {
            ExportService.turnResponseIntoPdf(response);
            onExportFinish(report, true);
            $timeout(setWindowStatus, 4000);
            deferred.resolve(report.name + '.pdf');
          }).catch(function (error) {
            onExportFinish(report, false);
            console.error(error);
            $timeout(setWindowStatus, 4000);
            deferred.reject(error);
          });
      }
      else {
        var url = pdfInfo.basePdfUrl + pdfInfo.encodedWidgetData;
        $window.open(url);
        onExportFinish(report, false);
        $timeout(setWindowStatus, 4000);
        deferred.resolve(report.name + '.pdf');
      }

      return deferred.promise;
    }

    /**
    * sets a status on the window, this is used in labs node api as a condition for phantom to render a pdf
    */
    function setWindowStatus() {
      $window.status = 'allWidgetsRendered';
      $window.renderable = 'allWidgetsRendered';
    }

    /**
    * private help function to save schedules
    * @param {Object} report to use configs to create data to the request
    * @param {Object} dateRange as date range for the schedule calculated from perios type
    * @return {Object} offset report start offset
    */
    function buildOffset(report, dateRange) {// index,url
      var offset = {};

      if (report.frequency.type === 'day') {
        offset.reportStartOffset = 1;
      } else if (report.frequency.type === 'week') {
        offset.reportStartOffset = 7;
      } else {
        offset.reportStartOffset = moment(dateRange.end).utc().diff(moment(dateRange.start).utc(), 'days');
      }

      offset.reportEndOffset = 1;

      return offset;
    }

    /**
    * private help function to save schedules finds start time for the schedule
    * @param {Object} time initial time
    * @param {Object} report to use configs to create data to the request
    * @param {Object} weekDays weekdays setting
    * @return {Object} date object
    */
    function buildStartTime(time, report, weekDays) {
      var desiredDay;

      if (report.frequency.type === 'day') {
        desiredDay = 0;
      } else if (report.frequency.secondary in weekDays) {
        var weekDayKeys = Object.keys(weekDays);
        desiredDay = weekDayKeys.indexOf(report.frequency.secondary);
      } else {
        desiredDay = -1;
      }

      var offset = (desiredDay - time.day() < 0 ? 7 + (desiredDay - time.day()) : (desiredDay - time.day()));
      return moment(time).add(offset, 'days').format();
    }

    /**
    * private help function to save schedules finds start time for the schedule
    * @param {Object} startTime to calculate end time
    * @return {Object} date object
    */
    function buildPayload(report, dateRange,
      url, operatingHours, weekDays,
      availableWidgets, activeGroup,
      groupBySetting, disabled
    ) {
      var payload = {};
      var now = moment();
      var hour;

      payload.exportType = report.report_type;
      payload.scheduleStartDate = buildStartTime(now, report, weekDays);

      var offset;

      offset = buildOffset(report, dateRange);

      if (report.report_type === 'pdf') {
        payload.url = decodeURIComponent(url);
      } else {
        payload.kpi = getSelectedMetricIds(report, availableWidgets);

        if (!ObjectUtils.isNullOrUndefined(groupBySetting)) {
          payload.groupBy = groupBySetting;
        }

        if (activeGroup === 'perimeter') {
          payload.operatingHours = operatingHours;
        }

        payload.includeSiteNames = true;
      }

      payload.reportStartOffset = offset.reportStartOffset;
      payload.reportEndOffset = offset.reportEndOffset;
      payload.disabled = disabled;

      if (report.frequency.repeats) {
        payload.frequency = !ObjectUtils.isNullOrUndefinedOrBlank(report.frequency.secondary) ? report.frequency.secondary : report.frequency.type;
      }

      // Convert 12 hour format to 24 hour format
      if (report.frequency.time.type === 'PM' && report.frequency.time.hour < 12) {
        hour = new Number(report.frequency.time.hour) + 12;
      } else {
        hour = report.frequency.time.hour;
        if (hour < 10) {
          hour = '0' + hour;
        }
      }

      // on PUT/POST, time saved always in GMT
      payload.repeatTime = hour + ':' + report.frequency.time.minute;

      payload.repeatTimezone = 'GMT';

      payload.orgId = report.organization_id;
      payload.subject = report.name;
      payload.message = report.name;
      payload.ccAddress = [];

      if (report.email.has_email) {
        if (!ObjectUtils.isNullOrUndefinedOrBlank(report.email.to)) {
          payload.ccAddress.push(report.email.to);
        }
        if (!ObjectUtils.isNullOrUndefinedOrBlank(report.email.cc)) {
          payload.ccAddress.push(report.email.cc);
        }
        if (!ObjectUtils.isNullOrUndefinedOrBlank(report.email.bcc)) {
          payload.ccAddress.push(report.email.bcc);
        }

      }

      payload.dateRangeType = report.period_type;

      return payload;
    }

    /**
    * private help function to create pdf request
    * @param {Object} report for org id
    * @param {Object} payload as data to request
    * @return {Object} request object to pass into http service
    */
    function buildScheduleRequest(report, payload, currentOrgReport) {
      var method = 'POST';
      var url = apiUrl + '/organizations/' + report.organization_id + '/scheduled-reports';
      if (!ObjectUtils.isNullOrUndefined(report.scheduleId) && (report.organization_id === currentOrgReport.organization_id)) {
        method = 'PUT';
        url = apiUrl + '/organizations/' + report.organization_id + '/scheduled-reports/' + report.scheduleId;
      }
      return {
        method: method,
        url: url,
        headers: {
          'Authorization': session.getToken()
        },
        data: payload
      };
    }

    /**
    * private help function to create pdf request
    * @param {Object} report for org id
    * @param {Object} payload as data to request
    * @return {Object} request object to pass into http service
    */
    function buildExecuteReportRequest(report) {
      var method = 'POST';

      var url = apiUrl + '/organizations/' + report.organization_id + '/scheduled-reports/' + report.scheduleId + '/execute';

      return {
        method: method,
        url: url,
        headers: {
          'Authorization': session.getToken()
        }
      };
    }
   
    function setCurrentOrgReport(org) {
      currentOrganizationReport = org;
    }

    function getCurrentOrgReport() {
      return currentOrganizationReport;
    }

    /**
    * save schedule for the report
    * @param {Object} report to populate schedule parameters
    * @param {Object} dateRange as data to request
    * @return {Object} promise
    */
    function saveSchedule(report, dateRange, org,
      operatingHours, weekDays,
      availableWidgets, activeGroup,
      groupBySetting, disabled 
    ) {
      var currentReport = getCurrentOrgReport();
      
      if (currentReport) {
      var currentOrgReport = currentReport
      } else {
      var currentOrgReport = report;
      }

      if ( !ObjectUtils.isNullOrUndefinedOrBlank(report.scheduleId) && (report.organization_id !== currentOrgReport.organization_id)) {
        deleteSchedule(report);
      }

      var deferred = $q.defer();
      var request;
      var payload;
      if (report.report_type === 'pdf') {
        var url;
        var pdfInfo = buildPdfUrl(report, dateRange, availableWidgets, org, true);

        url = pdfInfo.fullPdfUrl;

        payload = buildPayload(report, dateRange,
          url, operatingHours, weekDays, availableWidgets, activeGroup,
          groupBySetting, disabled
        );

        request = buildScheduleRequest(report, payload, currentOrgReport);
      } else {
        payload = buildPayload(report, dateRange,
          '', operatingHours, weekDays, availableWidgets, activeGroup,
          groupBySetting, disabled
        );
        request = buildScheduleRequest(report, payload, currentOrgReport);
      }

      $http(request)
        .then(function (response) {
          deferred.resolve(response);
        }).catch(function (error) {
          console.error('saveSchedule error', error.status);
          deferred.reject(error);
        });

      return deferred.promise;
    }

    /**
    * runReportToEmail call api to run schedule immediately and email to users
    * @param {Object} report to populate schedule parameters
    * @return {Object} promise
    */
    function runReportToEmail(report) {
      var deferred = $q.defer();
      if (ObjectUtils.isNullOrUndefined(report.scheduleId)) {
        var error = 'report is not scheduled so cannot be run';
        console.error(error);
        deferred.reject(error);
        return deferred.promise;
      }
      $http(buildExecuteReportRequest(report))
        .then(function (response) {
          deferred.resolve(response);
        }).catch(function (error) {
          console.error(error);
          deferred.reject(error);
        });

      return deferred.promise;
    }

    function getDateRangeFromReportPeriodType(report, selectedOrgs, currentUser) {
      return getDateRangeFromPeriodType(report.period_type, currentUser, selectedOrgs[0]);
    }

    function getDateRangeFromPeriodType(period, currentUser, org) {
      if (ObjectUtils.isNullOrUndefined(org)) {
        return;
      }
      setLocalization(org, currentUser);

      return dateRangeService.getPeriodRange(period, currentUser, org);
    }

    function setLocalization(org, currentUser) {
      //set localization service with selected org and current user so we could get correct range
      LocalizationService.setOrganization(org);
      LocalizationService.setUser(currentUser);
    }


    return {
      loadReports: loadReports,
      saveNewReport: saveNewReport,
      updateReport: updateReport,
      deleteReports: deleteReports,
      deleteReport: deleteReport,
      doCSVExport: doCSVExport,
      exportReportToPdf: exportReportToPdf,
      saveSchedule: saveSchedule,
      getDateRangeFromReportPeriodType: getDateRangeFromReportPeriodType,
      deleteSchedule: deleteSchedule,
      runReportToEmail: runReportToEmail,
      getDateRangeFromPeriodType: getDateRangeFromPeriodType,
      setLocalization: setLocalization,
      hasValidData: hasValidData,
      setCurrentOrgReport:setCurrentOrgReport
    };
  }
})();

