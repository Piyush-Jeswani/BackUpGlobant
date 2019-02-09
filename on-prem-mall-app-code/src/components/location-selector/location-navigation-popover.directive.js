(function() {
  'use strict';

  angular.module('shopperTrak.locationSelector')
    .directive('locationNavigationPopover', locationNavigationPopoverDirective);

  function locationNavigationPopoverDirective() {
    return {
      restrict: 'A',
      scope: {
        locations: '=',
        activeLocationId: '=?',
        showSelectAllButton: '=',
        language: '='
      },
      controller: LocationNavigationPopoverController,
      controllerAs: 'vm',
      bindToController: true,
    };
  }

  LocationNavigationPopoverController.$inject = [
    '$scope',
    '$element',
    '$popover',
    '$state'
  ];

  function LocationNavigationPopoverController(
    $scope,
    $element,
    $popover,
    $state
  ) {
    var vm = this;

    vm.filter = '';
    vm.collapsedLocations = [];
    vm.getLocationHref = getLocationHref;
    vm.getSiteHref = getSiteHref;
    vm.locationIsActive = locationIsActive;

    activate();

    function activate() {
      $popover($element, {
        trigger: 'click',
        placement: 'bottom',
        autoClose: true,
        templateUrl: 'components/location-selector/location-navigation-popover.partial.html',
        scope: $scope
      });
    }

    function getLocationHref(locationId) {
      var location = _(vm.locations).findWhere({ location_id: locationId });

      if (!location) {
        return;
      }

      var params = {
        locationId: location.location_id
      };

      // Don't allow navigation to a filtered usageOfAreas view, if the
      // selected location is not of matching type. This is done to prevent
      // erroneous API requests.
      if (
        $state.current.name === 'analytics.organization.site.usageOfAreas' &&
        location.location_type !== $state.params.locationTypeFilter
      ) {
        params.locationTypeFilter = null;
      }

      return $state.href($state.current.name, params);
    }

    // A function is needed, because UI Router has a bug with ui-sref
    // attributes that only define state parameters. Eg. this does not work
    // properly in a template: ui-sref="{locationId: null}"
    // See discussion here: https://github.com/angular-ui/ui-router/issues/1031
    function getSiteHref() {
      return $state.href('.', {
        locationId: null
      });
    }

    function locationIsActive(locationId) {
      return locationId === vm.activeLocationId;
    }

  }
})();
