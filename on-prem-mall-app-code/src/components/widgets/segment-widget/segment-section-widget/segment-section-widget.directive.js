(function () {
  'use strict';
  angular.module('shopperTrak')
  .directive('segmentSectionWidget', segmentSectionWidget);

  function segmentSectionWidget() {
    return {
      restrict: 'E',
      templateUrl: 'components/widgets/segment-widget/segment-section-widget/segment-section-widget.partial.html',
      scope: {
        segmentTimePeriod:'=',
        noDataForSelectedTimeDimension:'=',
        noDataForAvailableTimeDimension:'=',
        segmentGeographyName: '=',
        segmentMarketIndexChange: '=',
        segmentOrgIndexChange: '=',
        segmentMarketIndexColor: '=',
        segmentOrgIndexColor: '=',
        segmentMarketIconClass: '=',
        segmentOrgIconClass: '=',
        numberFormatName: '=',
        segmentOrgName: '=',
        segmentIndexErrorMessage:'=',
        segmentOrgErrorMessage:'=',
        showOrgIndex:'='
      },
      controller: segmentSectionWidgetController,
      controllerAs: 'vm',
      bindToController: true
    }
  }

  segmentSectionWidgetController.$inject = ['$state'];

  function segmentSectionWidgetController($state) {
    var vm = this;
    vm.addSubscription = function () {
      $state.go('analytics.organization.marketIntelligence.edit');
    };
  }
})();
