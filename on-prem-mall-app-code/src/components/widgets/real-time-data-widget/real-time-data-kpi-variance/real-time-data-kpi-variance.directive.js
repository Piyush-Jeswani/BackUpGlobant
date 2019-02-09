(function () {

  'use strict';

  angular
    .module('shopperTrak.widgets')
    .directive('realTimeDataKpiVariance', realTimeDataKpiVariance);

  function realTimeDataKpiVariance() {
    return {
      templateUrl: 'components/widgets/real-time-data-widget/real-time-data-kpi-variance/real-time-data-kpi-variance.partial.html',
      scope: {
        data: '=data',
        currentOrganization: '=currentOrganization',
        currentUser: '=currentUser'
      },
      controller: RealTimeDataKpiVarianceController
    };
  }

  RealTimeDataKpiVarianceController.$inject = [
    '$scope',
    '$rootScope',
    '$filter',
    '$translate',
    'LocalizationService'
  ];

  function RealTimeDataKpiVarianceController(
    $scope,
    $rootScope,
    $filter,
    $translate,
    LocalizationService
  ) {
    $scope.numberFormatName = LocalizationService.getCurrentNumberFormatName($scope.currentUser, $scope.currentOrganization);
    $scope.pdf = $rootScope.pdf;
  }
})();
