(function() {
  'use strict';

  angular.module('shopperTrak.zoneSelector')
    .directive('zoneSelector', zoneSelectorDirective);

  function zoneSelectorDirective() {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      templateUrl: 'components/zone-selector/zone-selector.partial.html',
      scope: {
        zones: '=',
        tmps: '=?',
        onZoneClick: '&',
        getZoneHref: '&zoneHref',
        onEntranceClick: '&',
        getEntranceHref: '&entranceHref',
        zoneIsSelected: '&',
        collapsedZones: '=',
        selectedZonesOnClick: '&',
        showSelectAllButton: '=',
        language: '=',
        isCsv: '=?'
      },
      controller: ZoneSelectorController,
      controllerAs: 'vm',
      bindToController: true,
    };
  }

  ZoneSelectorController.$inject = [
    '$scope',
    '$element',
    'ZoneResource'
  ];

  function ZoneSelectorController() {
    var vm = this;
    vm.filter = '';

    vm.selectZone = selectZone;
    vm.selectEntrance = selectEntrance;
    vm.selectAll = selectAll;

    function selectZone(zoneId) {
      vm.onZoneClick({
        zoneId: zoneId
      });
    }

    function selectEntrance(zoneId, entranceId) {
      vm.onEntranceClick({
        zoneId: zoneId,
        entranceId: entranceId
      });
    }

    function selectAll(allZonesList){
      vm.selectedZonesOnClick({
        allZonesList : allZonesList
      });
    }
  }
})();
