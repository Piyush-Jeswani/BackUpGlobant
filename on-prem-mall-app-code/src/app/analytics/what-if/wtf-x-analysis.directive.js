(function () {
  'use strict';

  angular.module('shopperTrak')
    .directive('wtfXAnalysis', wtfSlider);

  function wtfSlider() {
    return {
      restrict: 'E',
      templateUrl: 'app/analytics/what-if/wtf-x-analysis.partial.html',
      scope: {
        kpis: '=?',
      },
      bindToController: true,
      controller: WtfXAnalysisController,
      controllerAs: 'vm'
    };
  }

  WtfXAnalysisController.$inject = [
    '$rootScope',
    '$scope',
    '$timeout',
    '$window',
    '$document',
    '$filter',
    '$stateParams',
    'variableMetrics',
    'dayOfWeekDataService',
    'metricConstants'
  ];

  function WtfXAnalysisController($rootScope, $scope, $timeout, $window, $document, $filter, $stateParams, variableMetrics, dayOfWeekDataService, metricConstants) {

    var vm = this;

    activate();

    function activate() {
      vm.deltaChanges = {};
      vm.toggleSelection = toggleSelection;
      vm.toggleTable = toggleTable;
      vm.kpis = [
        {
          kpi: 'sales',
          selected:true,
          displayName: getMetricDisplayName('sales')
        },
        {
          kpi: 'sps',
          selected:true,
          displayName: getMetricDisplayName('sps')
        },
        {
          kpi: 'traffic',
          selected:true,
          displayName: getMetricDisplayName('traffic')
        },
        {
          kpi: 'conversion',
          selected:true,
          displayName: getMetricDisplayName('conversion')
        },
        {
          kpi: 'ats',
          selected:true,
          displayName: getMetricDisplayName('ats')
        },
        {
          kpi: 'upt',
          selected:true,
          displayName: getMetricDisplayName('upt')
        },
        {
          kpi: 'aur',
          selected:true,
          displayName: getMetricDisplayName('aur')
        },
        {
          kpi: 'transactions',
          selected:true,
          displayName: getMetricDisplayName('transactions')
        },
      ]

      var updateListener = $rootScope.$on('metricUpdate', doUpdate);
      var filtersAppliedListener = $rootScope.$on('filtersApplied', loadFilteredData);

      var firstDayWatcher  = $rootScope.$watch('firstDaySetting', function () {
        var firstDay = $rootScope.firstDaySetting;

        if( _.isUndefined(firstDay) ) {
          return;
        }

        var weekdays = moment.weekdays();
        _.each(weekdays, function (weekday, i) {
          var weekObj = {day: weekday, translation: $filter('translate')('weekdaysLong.' + weekday.toLowerCase().substr(0,3)) }
          weekdays[i] = weekObj;
        });

        if (firstDay === 1) {
          var last = weekdays.shift();
          weekdays.push(last);
        }

        vm.weekdays = weekdays;
        loadData();
      });

      angular.element($window).on('resize', resizeColumns);


      $scope.$on('$destroy', function () {
        firstDayWatcher();
        updateListener();
        filtersAppliedListener();
        angular.element($window).off('resize', resizeColumns);
      });
    }

    function resizeColumns() {
      if(_.isUndefined(vm.gridOptions) || !vm.isShown) {
        return;
      }

      $timeout(function () {
        vm.gridOptions.api.sizeColumnsToFit();
      });
    }

    function doUpdate() {
      $timeout(function () {
        var rowData = vm.gridOptions.rowData;
        _.each(vm.kpis, function(_item) {
          var metricObject = variableMetrics.getMetricObjectFor(_item.kpi);
          vm.deltaChanges[_item.kpi] = metricObject.deltaChange;

          _.each(rowData, function(_rowData) {
            _rowData['adjusted_' + _item.kpi] = _rowData[_item.kpi] + (_rowData[_item.kpi] * metricObject.deltaChange * 0.01);
          });

        });
        vm.gridOptions.rowData = rowData;
        vm.gridOptions.api.refreshCells();
      });
    }

    function buildColHeaders() {
      var columnDefs = [
        {
          headerName: 'DOW',
          field: 'dow',
          cellStyle: function() {
            return {'text-align': 'left'};
          },
          headerCellRenderer: function() {
            return ('<div class="dow-header">DOW</div>');
          },
          suppressFilter: true,
          suppressPaste : true,
          suppressMovable: true
        },

      ];

      _.each(vm.kpis, function(_item) {
        var label = _item.displayName;

        var colDef = {
          headerName: label,
          children: [
            {
              headerName: $filter('translate')('common.INITIAL'),
              kpi: _item.kpi,
              field: _item.kpi,
              valueFormatter: customFormatter,
              suppressFilter: true,
              suppressPaste : true,
              suppressMovable: true
            },

            {
              headerName: '',
              kpi: _item.kpi,
              field: 'adjusted_' + _item.kpi,
              suppressFilter: true,
              suppressPaste : true,
              suppressMovable: true,
              valueFormatter: customFormatter,
              cellStyle: deltaFormatter,
              headerCellRenderer: function() {
                var classDescriptor = 'ng-class="{\'positive\': vm.deltaChanges.'+ _item.kpi + ' > 0, \'negative\': vm.deltaChanges.' + _item.kpi + ' < 0}"';
                return '<div ' + classDescriptor + '>{{vm.deltaChanges.' + _item.kpi + '}}%</div>';
              }
            }

          ]
        }

        if(_item.selected === true) {
          columnDefs.push(colDef);
        }

      });

      return columnDefs;
    }

    function buildGrid() {
      vm.gridOptions = null;

      $timeout(() => {
        vm.gridOptions = {};
        vm.gridOptions.columnDefs = buildColHeaders();
        vm.gridOptions.domLayout='autoHeight',
        vm.gridOptions.rowData = vm.rowData;
        vm.gridOptions.enableColResize = true;
        vm.gridOptions.suppressResize = false;
        vm.gridOptions.suppressContextMenu = true;
        vm.gridOptions.enableSorting = true;
        vm.gridOptions.headerHeight =  26;
        vm.gridOptions.rowHeight =  26;
        vm.gridOptions.enableFilter = true;
        vm.gridOptions.suppressDragLeaveHidesColumns = true;
        vm.gridOptions.angularCompileHeaders = true;

        vm.gridOptions.onGridReady = () => {
          resizeColumns();
        }

      });
    }

    function customFormatter(params) {
      var kpi = params.colDef.kpi;
      var val = params.value;

      if(val === undefined) {
        return '-';
      }
      return variableMetrics.formatValueFor(kpi, val);
    }

    function deltaFormatter(params) {
      var originalVal = params.data[params.colDef.kpi];
      var textColor = params.value > originalVal ? '#9bc614' : params.value <  originalVal ? '#f75c38' : null;
      return { color: textColor };
    }

    function toggleSelection(_item) {
      _item.selected = !_item.selected;
      buildGrid();
    }

    function toggleTable() {
      vm.isShown = !vm.isShown;

      $timeout(function () {
        $window.scrollTo(0, $document[0].body.scrollHeight || $document[0].documentElement.scrollHeight);
        $window.dispatchEvent(new CustomEvent('resize'));
      });

    }

    function loadFilteredData(e, data) {
      vm.selectedCustomTags = data.customTags;
      vm.selectedTags = data.tags;

      $timeout(function () {
        loadData();
      });
    }

    function loadData() {
      var params = {
        apiEndpoint: 'kpis/report',
        organizationId: $stateParams.orgId,
        siteId: $stateParams.siteId,
        metrics: _.map(vm.kpis, 'kpi'),
        groupBy: 'day_of_week',
        startDate: $stateParams.dateRangeStart,
        endDate: $stateParams.dateRangeEnd,
        selectedTags: vm.selectedTags || [],
        customTagId: vm.selectedCustomTags || [],
        operatingHours: true
      };

      var rowData = [];

      vm.loading = true;
      dayOfWeekDataService.getDailyData(params).then( (_data) => {
        var dataRows = _data.result;
        vm.loading = false;
        _.each(vm.weekdays, (_dayObj) => {
          var row = _.find(dataRows, (_dataRow) => _dayObj.day.indexOf(_dataRow.period_start_date) === 0) || {};
          row.dow = _dayObj.translation;
          rowData.push(row);
        });

        vm.rowData = rowData;
        buildGrid();

      });


    }
    function getMetricDisplayName(metricKpi) {
      var metric = _.findWhere(metricConstants.metrics, { kpi: metricKpi });
      return metric.displayName;
    }
  }

})();
