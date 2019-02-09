'use strict';

angular.module('shopperTrak').controller('KpiSummaryWidgetContainerController',
  [
    '$scope',
    '$q',
    '$timeout',
    'requestManager',
    'apiUrl',
    'retailOrganizationSummaryData',
    'ObjectUtils',
    'utils',
    function ($scope, $q, $timeout, requestManager, apiUrl, retailOrganizationSummaryData, ObjectUtils, utils) {
      var vm = this;

      var salesDateranges = {
        current: 1,
        previousPeriod: 2,
        previousYear: 3,
        range: {
          1: { value: '' },
          2: { value: '' },
          3: { value: '' }
        }
      };

      var tempKpiData;

      activate();

      function activate() {
        vm.orgHasLabor = true;
        vm.orgHasSales = true;

        getAllKpiData();
        configureWatches();
      }

      function getEndpoint() {
        if (!vm.siteHasSales) {
          return 'kpis/traffic';
        }

        return 'kpis/report';
      }

      function configureWatches() {
        var unbindSalesCategoriesWatch = $scope.$watch('vm.salesCategories', function (newValue, oldValue) {
          if (angular.equals(newValue, oldValue)) {
            return;
          }
          vm.isLoading = true;
          getAllKpiData();
        });

        $scope.$on('$destroy', function () {
          if (angular.isFunction(unbindSalesCategoriesWatch)) {
            unbindSalesCategoriesWatch();
          }
        });
      }

      function getAllKpiData() {
        vm.isLoading = true;

        var promises = [];

        vm.salesDateRanges = salesDateranges;

        var apiDateRanges = [vm.dateRange, vm.compareRange1, vm.compareRange2];

        tempKpiData = {};

        apiDateRanges.forEach(function (range, index) {
          var promise = getKpiData(range, salesDateranges.range[index + 1]);
          promises.push(promise);
        });

        $q.all(promises)
          .then(function () {
            vm.isLoading = false;
            vm.widgetData = tempKpiData;
          })
          .catch(function (error) {
            vm.isLoading = false;
            vm.hasError = true;
            console.error(error);
          });
      }

      function getKpiData(range, salesDaterange) {
        var deferred = $q.defer();
        salesDaterange.value = retailOrganizationSummaryData.getDateRangeKey(range.start, range.end);
        var params = {
          orgId: vm.orgId,
          groupBy: 'aggregate',
          siteId: vm.siteId,
          operatingHours: true
        };

        if (typeof vm.zoneId !== 'undefined') {
          params.zoneId = vm.zoneId;
        }

        if (typeof vm.operatingHours !== 'undefined') {
          params.operatingHours = vm.operatingHours;
        }

        if (vm.siteHasSales) {
          var kpi = ['ats', 'conversion', 'traffic'];

          if (vm.siteHasLabor) {
            kpi.push('star');
          }

          params.kpi = kpi;
        }

        if (typeof vm.salesCategories !== 'undefined' && vm.salesCategories.length > 0 && _.min(vm.salesCategories.id) > 0) {
          params.sales_category_id = vm.salesCategories.map(function (category) {
            return category.id;
          });
        }

        params.reportStartDate = typeof range.start === 'string' ? range.start : utils.getDateStringForRequest(range.start);
        params.reportEndDate = typeof range.end === 'string' ? range.end : utils.getDateStringForRequest(range.end);

        var url = getEndpoint();

        requestManager.get(apiUrl + '/' + url, {
          params: params
        }).then(function (response) {
          ObjectUtils.rename(response.result[0], 'sales_amount', 'sales');
          ObjectUtils.rename(response.result[0], 'total_sales', 'sales');
          ObjectUtils.rename(response.result[0], 'total_traffic', 'traffic');

          tempKpiData[salesDaterange.value] = response;
          deferred.resolve();
        }, function (e) {
          console.log('rejected', e);
          deferred.reject();
        }).catch(function (e) {
          console.log('rejected', e)
        });

        return deferred.promise;
      }
    }]);