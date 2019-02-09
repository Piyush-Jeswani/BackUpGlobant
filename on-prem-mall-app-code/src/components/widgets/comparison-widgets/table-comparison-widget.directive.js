(function() {
  'use strict';

  angular.module('shopperTrak.widgets')
    .directive('tableComparisonWidget', tableComparisonWidget);

  function tableComparisonWidget() {
    return {
      restrict: 'E',
      templateUrl: 'components/widgets/comparison-widgets/table-comparison-widget.partial.html',
      scope: {
        orgId: '=',
        siteId: '=',
        columns: '=',
        dateRangeStart: '=',
        dateRangeEnd: '=',
        comparisonDateRangeStart: '=',
        comparisonDateRangeEnd: '=',
        language: '@'
      },
      bindToController: true,
      controller: TableComparisonWidgetController,
      controllerAs: 'vm'
    };
  }

  TableComparisonWidgetController.$inject = [
    '$scope',
    'LocationResource',
    'tableComparisonWidgetConstants'
  ];

  function TableComparisonWidgetController($scope, LocationResource, constants) {
    var vm = this;

    vm.locations = [];
    vm.columns = [];
    vm.rows = constants.rows;

    vm.getColumnTitle = getColumnTitle;
    vm.getComparisonValue = getComparisonValue;
    vm.getKPIs = getKPIs;
    vm.getReportValue = getReportValue;
    vm.getRowTitle = getRowTitle;
    vm.locationIsSelected = locationIsSelected;
    vm.siteIsSelected = siteIsSelected;
    vm.toggleLocation = toggleLocation;
    vm.toggleSite = toggleSite;

    activate();

    function activate() {
      vm.locations = LocationResource.query({
        orgId: vm.orgId,
        siteId: vm.siteId
      });
    }

    function getColumnTitle(column) {
      switch (column.type) {
        case 'site':
          return 'Property overall';
        case 'location':
          return getLocationColumnTitle(column);
      }
    }

    // TODO: Implement the function
    function getComparisonValue(/*column, kpi*/) {
      return 100;
    }

    function getKPIs(row) {
      return row.kpis;
    }

    // TODO: Implement the function
    function getReportValue(/*column, kpi*/) {
      return 80;
    }

    function getRowTitle(row) {
      return row.title;
    }

    function locationIsSelected(locationId) {
      return getLocationColumnIndex(locationId) >= 0;
    }

    function siteIsSelected() {
      return vm.columns.some(function(column) {
        return column.type === 'site';
      });
    }

    function toggleLocation(locationId) {
      if (locationIsSelected(locationId)) {
        removeLocation();
      } else {
        addLocation(locationId);
      }
    }

    function toggleSite() {
      if (siteIsSelected()) {
        removeSite();
      } else {
        addSite();
      }
    }

    function getLocationColumnTitle(column) {
      var location = _(vm.locations).findWhere({ location_id: column.locationId });
      if (location) {
        return location.description;
      } else {
        return column.locationId;
      }
    }

    function addSite() {
      vm.columns.push({
        type: 'site'
      });
    }

    function removeSite() {
      var index = getSiteColumnIndex();
      removeColumnAt(index);
    }

    function getSiteColumnIndex() {
      return _(vm.columns).findIndex(function(column) {
        return column.type === 'site';
      });
    }

    function addLocation(locationId) {
      vm.columns.push({
        type: 'location',
        locationId: locationId
      });
    }

    function removeLocation(locationId) {
      var index = getLocationColumnIndex(locationId);
      removeColumnAt(index);
    }

    function getLocationColumnIndex(locationId) {
      return _(vm.columns).findIndex(function(column) {
        return column.locationId === locationId;
      });
    }

    function removeColumnAt(index) {
      vm.columns.splice(index, 1);
    }
  }
})();
