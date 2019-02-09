(function() {
  'use strict';

  angular.module('shopperTrak.zoneSelector')
    .directive('zoneNavigationPopover', zoneNavigationPopoverDirective);

  function zoneNavigationPopoverDirective() {
    return {
      restrict: 'A',
      scope: {
        zones: '=',
        activeZoneId: '=?',
        showSelectAllButton: '=',
        language: '='
      },
      controller: zoneNavigationPopoverController,
      controllerAs: 'vm',
      bindToController: true,
    };
  }

  zoneNavigationPopoverController.$inject = [
    '$scope',
    '$element',
    '$popover',
    '$state',
    'ZoneResource'
  ];

  function zoneNavigationPopoverController(
    $scope,
    $element,
    $popover,
    $state
  ) {
    var vm = this;

    vm.filter = '';
    vm.collapsedZones = [];
    vm.getZoneHref = getZoneHref;
    vm.zoneIsActive = zoneIsActive;

    activate();

    function activate() {
      vm.siteHref = getSiteHref();
      $popover($element, {
        trigger: 'click',
        placement: 'bottom-left',
        autoClose: true,
        templateUrl: 'components/zone-selector/zone-navigation-popover.partial.html',
        scope: $scope
      });
    }

    function getZoneHref(zoneId) {
      var zone = _(vm.zones).findWhere({ id: zoneId });

      if (!zone) {
        return;
      }

      var params = {
        zoneId: zone.id
      };


      // Prevent us from getting stuck in a loop
      if ($state.current.name === 'analytics.organization.site.entrance') {
        return $state.href('analytics.organization.site.traffic', params);
      }


      return $state.href($state.current.name, params);
    }

    // A function is needed, because UI Router has a bug with ui-sref
    // attributes that only define state parameters. Eg. this does not work
    // properly in a template: ui-sref="{zoneId: null}"
    // See discussion here: https://github.com/angular-ui/ui-router/issues/1031
    function getSiteHref() {
      if ($state.current.name === 'analytics.organization.site.entrance') {
        return $state.href('analytics.organization.site');
      }

      return $state.href('.', {
        zoneId: null
      });
    }

    function zoneIsActive(zoneId) {
      return zoneId === vm.activeZoneId;
    }
  }
})();
