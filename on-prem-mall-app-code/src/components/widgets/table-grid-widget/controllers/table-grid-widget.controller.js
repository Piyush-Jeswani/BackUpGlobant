(function () {
  'use strict';

  angular.module('shopperTrak.tableGridWidget')
  .controller('TableGridWidgetController', widgetController);

  widgetController.$inject = [
    '$rootScope',
    '$scope',
    '$filter',
    '$timeout',
    '$document',
    '$translate',
    'OrganizationResource',
    'MetricDataService',
    'currencyService',
    'LocalizationService',
    'widgetLibraryService',
    'ObjectUtils',
    'dateRangeService',
    'SubscriptionsService',
    'metricNameService',
    'metricConstants'
  ];

  function widgetController(
    $rootScope,
    $scope,
    $filter,
    $timeout,
    $document,
    $translate,
    OrganizationResource,
    MetricDataService,
    CurrencyService,
    LocalizationService,
    WidgetLibraryService,
    ObjectUtils,
    dateRangeService,
    SubscriptionsService,
    metricNameService,
    metricConstants
  ) {
    var vm = this;
    var metrics = [];
    var kpis = [];
    var orgObj = {};
    var localizationOptions = {};

    vm.gridOptions = {};

    function activate() {
      vm.isPdf = $rootScope.pdf;
      vm.isLoading = true;
      vm.serverResponseError = false;
      vm.gridOptions.columnDefs = [];
      vm.gridOptions.rowData = [];

      getOrg(vm.currentOrg.organization_id);

      if (vm.isPdf) {
        loadForPdfComplete();
      }
    }

    function setGridControls(controls) {
      if (ObjectUtils.isNullOrUndefined(controls)) {
        return;
      }
      if ($rootScope.pdf) {
        vm.gridOptions.domLayout = 'forPrint';
      }

      _.each(controls, function (control) {
        var digestibleControlName = angular.lowercase(control.name.replace(' ', ''));
        vm.gridOptions.enableMenu = !$rootScope.pdf;
        switch (digestibleControlName) {
          case 'filter':
            vm.gridOptions.enableFilter = !$rootScope.pdf && control.selected;
            break;
          case 'sorting':
            vm.gridOptions.enableSorting = !$rootScope.pdf && control.selected;
            break;
          case 'columnresize':
            vm.gridOptions.enableColResize = !$rootScope.pdf && control.selected;
            break;
          case 'columnre-ordering':
            vm.gridOptions.suppressMovableColumns = !$rootScope.pdf && !control.selected;
            break;
          default:
            break;
        }
      });
    }

    function getOrg(id) {
      OrganizationResource.get({ orgId: id }).$promise
        .then(getOrgSuccess)
        .catch(getOrgError);
    }

    /**
   * Notifies the pdf controller when all widgets have rendered.
   * this function returns nothing but increases the $rootScope.pdfExportsLoaded number by 1.
   */
    function loadForPdfComplete() {
      vm.renderReady = false;

      $scope.$watchGroup(['vm.isLoading', 'vm.renderReady'],
        function () {
          if (!vm.isLoading && vm.renderReady) {
            $rootScope.pdfExportsLoaded += 1;
          }
        }
      );
    }

    function getOrgSuccess(response) {
      LocalizationService.setUser(vm.currentUser);
      LocalizationService.setOrganization(response);

      metricNameService.getMetricNames(response)
        .then(assignMetricNamesFromService)
        .catch(assignMetricNamesFromConstants);
    }

    function assignMetricNamesFromService(data){
      vm.currentOrg.metric_labels = [];
      _.each(data, function(metric){
        vm.currentOrg.metric_labels[metric.kpi] = metric.displayName; //assigning the display name as the naming service has done translation/missing name work for us
      });
      orgObj = vm.currentOrg;
      getCurrencySymbol(vm.currentOrg.organization_id);
    }

    function assignMetricNamesFromConstants(error){ //metric label has failed - get the translated, standard label instead, also avoids a situation where other orgs custom metric assigned
      console.error(error);
      vm.currentOrg.metric_labels = [];
      _.each(metricConstants.metrics, function(metric){
        vm.currentOrg.metric_labels[metric.kpi] = metric.translatedLabel;
      });
      orgObj = vm.currentOrg;
      getCurrencySymbol(vm.currentOrg.organization_id);
    }

    function getOrgError(error) {
      console.error(error);
      setResponseError(true);
    }

    function getCurrencySymbol(orgId) {
      CurrencyService.getCurrencySymbol(orgId)
        .then(getCurrencySymbolSuccess)
        .catch(getCurrencySymbolError)
    }

    function getCurrencySymbolSuccess(response) {
      getMetrics();
      setCurrencyOptions(response);
      setNumberFormatOptions();
    }

    function getCurrencySymbolError(error) {
      console.error(error);
      setResponseError(true)
    }

    function getMetrics() {
      dateRangeOverride(vm.config.overrideRange, vm.currentUser, orgObj);
      metrics = WidgetLibraryService.filterAllowedMetrics(vm.config.columns, orgObj);
      getKpiData(vm.currentOrg.organization_id, metrics, vm.dateRangeStart, vm.dateRangeEnd);
    }

    function getKpiData(orgId, metrics, dateRangeStart, dateRangeEnd) {
      if (ObjectUtils.isNullOrUndefined(metrics)) {
        return setResponseError(true);
      }

      kpis = retrieveKpi(metrics);
      MetricDataService.getDataByKpi(orgId, kpis, dateRangeStart, dateRangeEnd, vm.config.orgLevel)
        .then(getKpiDataSuccess)
        .catch(getKpiDataError);
    }

    function getKpiDataSuccess(data) {
      setRowData(data, kpis, metrics);
    }

    function getKpiDataError(error) {
      console.error(error);
      setResponseError(true);
    }

    function setColumnDefs(metrics) {
      var filterControl = _.findWhere(vm.config.controls, { name: 'Filter' });
      var menuTabs = filterControl && filterControl.selected ? ['filterMenuTab'] : [];
      _.forEach(metrics, function (metric) {
        var col = {
          field: metric.kpi,
          menuTabs: menuTabs,
          headerName : vm.currentOrg.metric_labels[metric.kpi]
        }

        if(metric.metricType === 'rank'){
          metric.kpi = metric.label.replace('Rank', '');
          col.field = metric.label;
          col.cellRenderer = function(params){
            var val = Number(params.data[metric.label]);
            return params.value = val;
          }
        } else {
          col.comparator = function(a, b) {
            var numberA = Number(a.replace(/[^\d.-]/g, ''));
            var numberB = Number(b.replace(/[^\d.-]/g, ''));

            if (isNaN(numberA) && isNaN(numberB)) {
              return 0;
            }
            if (isNaN(numberA)) {
                return 1;
            }
            if (isNaN(numberB)) {
                return -1;
            }

            return numberB - numberA;

          }
        }

        var metricFormatting = _.findWhere(vm.config.conditionalFormatMetrics, {'metric' : metric.kpi});


        if(metricFormatting !== undefined){

          var metricData = _.pluck(vm.gridOptions.rowData, metric.kpi); //grab the metric data from the overall row data
          var alteredMetricData = [];
          var autoFormat = _.contains(vm.config.auto, metric.kpi) ? true : false;

          _.each(metricData, function(value){
            value = value.replace(/[^\d.-]/g, '');//replace non numberic but leave a decimal
            var newValue = Number(value);
            if(!isNaN(newValue)){
              alteredMetricData.push(newValue);
            }
          });
          alteredMetricData = alteredMetricData.sort(
            function (a, b) { return b - a } //return b-a where the higher value is better
          );
          col.cellClass = 'metricCell';
          col.cellStyle = function(params) {

            var cellVal = metric.metricType !== 'rank' ? params.value.replace(/[^\d.-]/g, '') : params.data[metric.kpi].replace(/[^\d.-]/g, '');
            var lastChar = cellVal.charAt(cellVal.length - 1);
            if(isNaN(lastChar)){
              cellVal.replace(lastChar, '');
            }

            if(cellVal === '0' || cellVal === '-'){
              var cellIndex = alteredMetricData.length - 1;
            } else {
              var cellIndex = _.indexOf(alteredMetricData, Number(cellVal));
            }

            if(autoFormat){
              var R = (255 * cellIndex) / alteredMetricData.length;
              var G = (255 * (alteredMetricData.length - cellIndex)) / alteredMetricData.length;
              return {backgroundColor: 'rgba(' + Math.round(R) +',' + Math.round(G) + ', 0, 0.75)'};
            }

            var onePercent = (alteredMetricData[0] / 100);
            var bgColor = '';
            _.each(metricFormatting.conditionalFormatBounds, function(bound){
              var lowerVal = bound.lowerBound !== 0 ? bound.lowerBound * onePercent : 0;
              var upperVal = bound.upperBound * onePercent;
              if(cellVal >= lowerVal && cellVal <= upperVal){
                bgColor = bound.color;
              }
            })

            return {backgroundColor: bgColor};
          }
        }

        vm.gridOptions.columnDefs.push(col);
      });
      var entityName = vm.config.orgLevel ? 'Organisation' : 'Site';
      if(!_.isUndefined(vm.config.rankCols)){
        vm.gridOptions.columnDefs = _.sortBy(vm.gridOptions.columnDefs, 'field');
      }
      vm.gridOptions.columnDefs.unshift(getEntityNameColumn(entityName, menuTabs));
    }

    function getEntityNameColumn(entityName, menuTabs) {
      var entityNameColumn = {
        headerName: entityName,
        field: 'rowName',
        menuTabs: menuTabs,
        sort: 'asc',
        cellClass: 'site',
        headerClass: 'site'
      };
      if(vm.isPdf) {
        entityNameColumn.cellStyle = {
          'height': 'auto!important',
          'white-space': 'normal',
          'text-overflow': 'clip !important',
          'word-wrap': 'break-word !important'
        }
        entityNameColumn.width = 250;
      }
      return entityNameColumn;
    }

    function setRowData(metricDataServiceResponse, kpis, metrics) {
      var metricData = metricDataServiceResponse.result;

      if (!vm.config.orgLevel) {
        WidgetLibraryService.getAllOrgSites([vm.currentOrg.organization_id]).$promise
          .then(assembleRow)
          .catch(getAllOrgSitesError);
      } else {
        assembleRow([{ org_id: vm.currentOrg.organization_id, name: orgObj.name }]);
      }

      function getAllOrgSitesError(error) {
        console.error(error);
        setResponseError(true);
      }


      function assembleRow(rowNames) {
        var isEmpty = {};

        if(!ObjectUtils.isNullOrUndefinedOrEmpty(vm.config.rankCols)){
          _.each(vm.config.rankCols, function(rank){

            if(_.findWhere(metrics, {'kpi' : rank})){

              var dataToSort = angular.copy(metricData);
              var title = rank + 'Rank';
              var rankMetric = {};

              rankMetric.label = title;
              rankMetric.metricType = 'rank';

              kpis.push(title);
              metrics.push(rankMetric);

              dataToSort = _.sortBy(dataToSort, function(data){return data[rank]});
              dataToSort.reverse();

              _.each(dataToSort, function(data, index){
                if(data[rank]){
                  index === 0 || data[rank] !== dataToSort[index -1][rank] ? data[title] = index + 1 : data[title] = dataToSort[index -1][rank];
                } else {
                  data[title] = dataToSort.length;
                }
              });
              metricData = dataToSort
            }
          });
        }

        _.forEach(metricData, function (metricDataObject) {
          var row = {};
          _.forEach(kpis, function (kpi) {
            if(kpi.indexOf('Rank') === -1){
              var metric = getMetricByKpi(metrics, kpi);

              if (ObjectUtils.isNullOrUndefined(isEmpty[kpi])) {
                isEmpty[kpi] = true;
              }

              if (!ObjectUtils.isNullOrUndefined(metricDataObject[kpi]) && isEmpty[kpi]) {
                isEmpty[kpi] = false;
              }

              if (ObjectUtils.isNullOrUndefined(metricDataObject[kpi])) {
                row[kpi] = '-';
                return;
              }

              row[kpi] = formatNumber(metricDataObject[kpi], getPrecision(metric), localizationOptions.numberFormatName);

              if (metric.isCurrency) {
                row[kpi] = formatCurrency(row[kpi], localizationOptions.currencySymbol);
              } else {
                row[kpi] = setUnits(row[kpi], metric);
              }
            } else if(kpi.indexOf('Rank') > 0){
              row[kpi] = metricDataObject[kpi];
            }
          });


          if (vm.config.orgLevel) {
            var org = _.findWhere(rowNames, { 'org_id': metricDataObject.org_id });
            row['rowName'] = org ? org.name : metricDataObject.org_id;
          } else {
            var site = _.findWhere(rowNames, { 'site_id': metricDataObject.site_id });
            row['rowName'] = site ? site.name.replace(/\s+/g, ' ').trim() : metricDataObject.site_id;
          }

          vm.gridOptions.rowData.push(row);
        });

        finalizeGrid(isEmpty);

      }
    }

    function finalizeGrid(isEmpty) {
        setColumnDefs(metrics);
        hideEmptyColumn(isEmpty);
        setGridControls(vm.config.controls);
        vm.gridOptions.rowHeight = 26;
        vm.gridOptions.headerHeight = 40;
        setResponseError(false);

        vm.gridOptions.onGridReady = function (params) {
          params.api.sizeColumnsToFit();
          $timeout(function() {
            setRowHeightForPdf(params);
            vm.renderReady = true;
          }, 10)
        }
    }

    function setRowHeightForPdf(params) {
      if (!vm.isPdf) {
        return;
      }
      vm.rowHeightChanged = false;
      var selector = $document[0].querySelectorAll('.ag-row-level-0');

      params.api.forEachNode(function (rowNode) {
        setRowHeight(selector, rowNode);
      });

      if (vm.rowHeightChanged) {
        params.api.onRowHeightChanged();
      }
    }

    /**
   * private function to reset ag-grid row height when we have long site names in pdf.
   * this function returns nothing but sets the row height.
   */
    function setRowHeight(selector, rowNode) {
      if (!ObjectUtils.isNullOrUndefinedOrEmpty(selector)) {
        var row;
        _.each(selector, function (item) {
          if (item.firstChild.innerText === rowNode.data.rowName) {
            row = item;
          }
        });
        if (!ObjectUtils.isNullOrUndefined(row) && !ObjectUtils.isNullOrUndefined(row.firstChild)) {
          var clientHeight = angular.copy(row.firstChild.clientHeight);
          var rowheight = angular.copy(rowNode.rowHeight);
          if(clientHeight > (rowheight - 2)) {
            rowNode.setRowHeight(clientHeight);
            vm.rowHeightChanged = true;
            return;
          }

          var lineCount = getLineNumber(rowNode.data.rowName);

          if (lineCount < 1) {
            lineCount = 1;
          }

          rowNode.setRowHeight(rowheight * lineCount);
          vm.rowHeightChanged = true;
        }
      }
    }

    function getLineNumber(value) {
      var lineCount = 1;
      if (ObjectUtils.isNullOrUndefinedOrBlank(value) || typeof value.split !== 'function') {
        return lineCount;
      }
      var parts = value.split(' ');

      var maxLengthForLine = 30;
      var partLength = 0;
      _.each(parts, function (part) {
        partLength += part.length + 1;
        if (partLength > maxLengthForLine) {
          lineCount += 1;
          partLength = part.length;
        }
      });

      return lineCount;
    }

    function retrieveKpi(metrics) {
      var kpi = [];
      _.forEach(metrics, function (metric) {
        if (SubscriptionsService.hasSubscriptions(metric.requiredSubscriptions, vm.currentOrg)) {
          kpi.push(metric.kpi);
        }
      });
      return kpi;
    }

    function formatNumber(value, precision, locale, thousandsSeparator) {
      return $filter('formatNumber')(value, precision, locale, thousandsSeparator);
    }

    function getPrecision(metric) {
      return metric.precision;
    }

    function setUnits(value, metric) {
      return metric.prefixSymbol + value + metric.suffixSymbol;
    }

    function getMetricByKpi(metrics, kpi) {
      return _.findWhere(metrics, { 'kpi': kpi });
    }

    function formatCurrency(value, symbol) {
      return symbol + value;
    }

    function setNumberFormatOptions() {
      localizationOptions.numberFormatName = LocalizationService.getCurrentNumberFormatName(vm.currentUser, orgObj);
    }

    function setCurrencyOptions(currencyObj) {
      localizationOptions.currencySymbol = currencyObj.currencySymbol;
    }

    function hideEmptyColumn(isEmpty) {
      for (var prop in isEmpty) {
        if (isEmpty[prop]) {
          vm.gridOptions.columnDefs = _.reject(vm.gridOptions.columnDefs, { field: prop });
        }
      }
    }

    function dateRangeOverride(period, currentUser, orgObj) {
      if (!ObjectUtils.isNullOrUndefined(period)) {
        doOverride(period, currentUser, orgObj);
      } else {
        if (ObjectUtils.isNullOrUndefined(vm.dateRangeStart) &&
          ObjectUtils.isNullOrUndefined(vm.dateRangeEnd)) {
          period = 'week';
          doOverride(period, currentUser, orgObj);
        }
      }

      function doOverride(period, currentUser, orgObj) {
        var dateRange = dateRangeService.getSelectedAndCompareRanges(period, currentUser, orgObj);
        vm.dateRangeStart = dateRange.selectedPeriod.start;
        vm.dateRangeEnd = dateRange.selectedPeriod.end;
      }
    }

    function setResponseError(isError) {
      vm.serverResponseError = isError;
      vm.isLoading = false;
      if(isError) {
        vm.renderReady = true;
      }
    }

    $scope.$watch('vm.currentOrg', function () {
      activate();
    });
  };
})();
