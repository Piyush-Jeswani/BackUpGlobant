(function () {

  'use strict';

  angular
    .module('shopperTrak.widgets')
    .directive('kpiVariance', kpiVariance);

  function kpiVariance() {
    return {
      templateUrl: 'components/widgets/summary-widgets/kpi-variance/kpi-variance.partial.html',
      scope: {
        data: '=data',
        currentOrganization: '=currentOrganization',
        currentUser: '=currentUser'
      },
      link: function (scope) {
        var previousPeriod = scope.data.comparisons.data[scope.data.comparisons.previousPeriod];

        var previousYear = scope.data.comparisons.data[scope.data.comparisons.previousYear];

        function buildPopover(period, labels) {
          return {
            precision: scope.data.precision,
            comparePeriodTranskey: labels.periodLabel,
            comparePeriod: period.comparePeriod,
            previousValue: period.total,
            totalsLabel: labels.totalsLabel,
            numberFormatName: scope.numberFormatName,
            prefixSymbol: scope.data.prefixSymbol,
            suffixSymbol: scope.data.suffixSymbol
          };
        }
        if (typeof previousPeriod !== 'undefined') {
          scope.previousPeriodPopover = buildPopover(previousPeriod, scope.data.labels[scope.data.comparisons.previousPeriod]);
        }
        if (typeof previousYear !== 'undefined') {
          scope.previousYearPopover = buildPopover(previousYear, scope.data.labels[scope.data.comparisons.previousYear]);
        }
      },
      controller: KpiVarianceController
    };
  }

  KpiVarianceController.$inject = [
    '$scope',
    '$filter',
    '$translate',
    'LocalizationService'
  ];

  function KpiVarianceController(
    $scope,
    $filter,
    $translate,
    LocalizationService
  ) {
    var currentUser = $scope.currentUser;
    var currentOrganization = $scope.currentOrganization;

    $scope.numberFormatName = LocalizationService.getCurrentNumberFormatName(currentUser, currentOrganization);
  }
})();
