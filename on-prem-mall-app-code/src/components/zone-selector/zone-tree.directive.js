(function() {
  'use strict';

  angular.module('shopperTrak.zoneSelector')
    .directive('zoneTree', zoneTreeDirective);

  function zoneTreeDirective() {
    return {
      restrict: 'E',
      templateUrl: 'components/zone-selector/zone-tree.partial.html',
      scope: {
        keyword: '@filter',
        zones: '=',
        tmps: '=?',
        isSelected: '&',
        collapsedZones: '=?',
        getZoneHref: '&zoneHref',
        onZoneClick: '&',
        onEntranceClick: '&',
        selectedZonesOnClick: '&',
        showSelectAllButton: '=',
        language: '=',
        isCsv: '=?'
      },
      controller: ZoneTreeDirectiveController,
      controllerAs: 'vm',
      bindToController: true
    };
  }

  ZoneTreeDirectiveController.$inject = [
    '$state',
    'locationTypeColors',
    'ZoneHelperService'
  ];


  function ZoneTreeDirectiveController(
    $state,
    locationTypeColors,
    ZoneHelperService
  ) {
    var vm = this;
    vm.getRootNodesThatShouldBeShown = getRootNodesThatShouldBeShown;
    vm.getChildNodesThatShouldBeShown = getChildNodesThatShouldBeShown;
    vm.getNumChildNodesThatShouldBeShown = getNumChildNodesThatShouldBeShown;
    vm.selectZone = selectZone;
    vm.selectEntrance = selectEntrance;
    vm.toggleNode = toggleNode;
    vm.isCollapsed = isCollapsed;
    vm.getColor = getColor;
    vm.selectAllZs = selectAllZs;
    vm.allSelected = false;

    activate();

    function activate() {
      if (!vm.selectedZones) {
        vm.selectedZones = [];
      }
      if (!vm.collapsedZones) {
        vm.collapsedZones = [];
      }

      vm.allZones = vm.getRootNodesThatShouldBeShown();

      buildHrefs();
      correctTitles();
    }

    function buildHrefs() {
      _.each(vm.zones, function(zone) {
        zone.zoneHref = vm.getZoneHref({zoneId: zone.id});
      });
    }

    function correctTitles() {
      _.each(vm.zones, function(zone){
        zone.collapsed = true;
        var zoneName = zone.name;
        zone.name = ZoneHelperService.removeLeadingX(zoneName);
        _.each(zone.tmps, function(tmps){
          var deviceName = tmps.name;
          tmps.name = ZoneHelperService.removeLeadingX(deviceName);
        });
      });
    }

    function getRootNodesThatShouldBeShown() {
      return getRootNodes();
    }

    function getChildNodesThatShouldBeShown(zone) {
      return getChildNodes(zone).filter(shouldBeShown);
    }

    function getNumChildNodesThatShouldBeShown(zone) {
      return getChildNodesThatShouldBeShown(zone).length;
    }

    function toggleNode(zoneId) {
      var index = vm.collapsedZones.indexOf(zoneId);

      if (index >= 0) {
        vm.collapsedZones.splice(index, 1);
      } else {
        vm.collapsedZones.push(zoneId);
      }
    }

    function selectZone(zoneId) {
      vm.onZoneClick({
        zoneId: zoneId
      });
    }

    function selectEntrance(zoneId, entranceId) {
      var params = $state.params;
      params.zoneId = zoneId;
      params.entranceId = entranceId;

      $state.go('analytics.organization.site.entrance', params);
    }

    function isCollapsed(zoneId) {
      return vm.collapsedZones.indexOf(zoneId) >= 0;
    }

    function getColor(zoneType) {
      if (locationTypeColors[zoneType]) {
        return locationTypeColors[zoneType];
      }
      return locationTypeColors['default'];
    }

    function getRootNodes() {
      // The site node is always at depth zero, but the view is only concerned
      // about its descendants, so return zones with depth 1 as top level
      // zones.
      if(!vm.zones){
        return [];
      }
      return vm.zones.filter(function(zone) {
        return zone.depth === 1 && zone.zone_type !== 'Site';
      });
    }

    function getChildNodes(parent) {
      return vm.zones.filter(function(zone) {
        return parent.depth === 1 && zone.parent_item === parent.id;
      });
    }

    function shouldBeShown(zone) {
      return zone.zone_type !== 'Site' && (
        (vm.keyword.length === 0 || matches(zone.name, vm.keyword)) ||
        (getChildNodes(zone).some(shouldBeShown))
      );
    }

    function matches(string, keyword) {
      return string.toLowerCase().indexOf(keyword.toLowerCase()) >= 0;
    }

    function selectAllZs() {
      vm.allSelected = !vm.allSelected;

      if(vm.tmps) {
        selectedZones(vm.tmps);
        return;
      }

      selectedZones(getRootNodesThatShouldBeShown());
    }

    function selectedZones(allZonesList) {
      vm.selectedZonesOnClick({
        allZonesList : allZonesList,
        type: vm.tmps !== undefined ? 'zoneLevel' : 'siteLevel'
      });
    }
  }
})();
