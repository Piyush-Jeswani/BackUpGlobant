(function() {
  'use strict';

  angular.module('shopperTrak.locationSelector')
    .directive('locationTree', locationTreeDirective);

  function locationTreeDirective() {
    return {
      restrict: 'E',
      templateUrl: 'components/location-selector/location-tree.partial.html',
      scope: {
        keyword: '@filter',
        locations: '=',
        isSelected: '&',
        language: '=',
        collapsedLocations: '=?',
        getLocationHref: '&locationHref',
        onLocationClick: '&',
        selectableLocationTypes: '=',
        selectedLocationsOnClick: '&',
        showSelectAllButton: '=',
        currentDepth: '=?'
      },
      controller: LocationTreeDirectiveController,
      controllerAs: 'vm',
      bindToController: true
    };
  }

  LocationTreeDirectiveController.$inject = [
    'locationTypeColors',
    'ObjectUtils',
    'orderByFilter'
  ];


  function LocationTreeDirectiveController(locationTypeColors, ObjectUtils, orderBy) {
    var vm = this;

    vm.getRootNodesThatShouldBeShown = getRootNodesThatShouldBeShown;
    vm.getChildNodesThatShouldBeShown = getChildNodesThatShouldBeShown;
    vm.getNumChildNodesThatShouldBeShown = getNumChildNodesThatShouldBeShown;
    vm.selectLocation = selectLocation;
    vm.shouldBeShown = shouldBeShown;
    vm.toggleNode = toggleNode;
    vm.isCollapsed = isCollapsed;
    vm.getColor = getColor;
    vm.selectAllLocations = selectAllLocations;
    vm.allSelected = false;

    activate();

    function activate() {
      if (ObjectUtils.isNullOrUndefined(vm.selectedLocations)) {
        vm.selectedLocations = [];
      }
      if (ObjectUtils.isNullOrUndefined(vm.collapsedLocations)) {
        vm.collapsedLocations = [];
      }
      if (ObjectUtils.isNullOrUndefined(vm.currentDepth)) {
        vm.currentDepth = 1;
      }

      createTreeArray();
    }

    function createTreeArray() {
      vm.tree = [];
      var usedIds = [];
      var sortLocationsByDepth = orderBy(vm.locations, 'nested_set.depth');

      _.each(sortLocationsByDepth, function(location) {
        if(_.indexOf(usedIds, location.location_id) === -1){
          var childNodes = getChildNodesThatShouldBeShown(location);
          
          if(childNodes.length > 0 && location.nested_set.depth > 0) {
            location.childNodes = childNodes;
            
            var childNodeIds = _.pluck(childNodes, 'location_id');
            usedIds = _.union(usedIds, childNodeIds);
          } else {
            location.childNodes = [];
          }
        
          vm.tree.push(location);
        }
      });
    }

    function getRootNodesThatShouldBeShown() {
      return getRootNodes().filter(shouldBeShown);
    }

    function getChildNodesThatShouldBeShown(location) {
      return getChildNodes(location).filter(shouldBeShown);
    }

    function getNumChildNodesThatShouldBeShown(location) {
      return getChildNodesThatShouldBeShown(location).length;
    }

    function toggleNode(locationId) {
      var index = vm.collapsedLocations.indexOf(locationId);

      if (index >= 0) {
        vm.collapsedLocations.splice(index, 1);
      } else {
        vm.collapsedLocations.push(locationId);
      }
    }

    function selectLocation(locationId) {
      vm.onLocationClick({
        locationId: locationId
      });
    }

    function isCollapsed(locationId) {
      return vm.collapsedLocations.indexOf(locationId) >= 0;
    }

    function getColor(locationType) {
      if (locationTypeColors[locationType]) {
        return locationTypeColors[locationType];
      }
      return locationTypeColors['default'];
    }

    function getRootNodes() {
      // The site node is always at depth zero, but the view is only concerned
      // about its descendants, so return locations with depth 1 or greater as
      // top level locations.
      return vm.tree.filter(function(location) {
        return location.nested_set.depth >= vm.currentDepth;
      });
    }

    function getChildNodes(parent) {
      return vm.locations.filter(function(location) {
        return parent.nested_set.depth === (location.nested_set.depth - 1) &&
          parent.nested_set.left < location.nested_set.left &&
          parent.nested_set.right > location.nested_set.right;
      });
    }

    function shouldBeShown(location) {
      return location.location_type !== 'Site' && (
        (vm.keyword.length === 0 || matches(location.description, vm.keyword)) ||
        (getChildNodes(location).some(shouldBeShown))
      );
    }

    function matches(string, keyword) {
      return string.toLowerCase().indexOf(keyword.toLowerCase()) >= 0;
    }

    function selectAllLocations() {
      var mainLocations = getRootNodesThatShouldBeShown();
      var locationDescriptionList = [];
      vm.allSelected = !vm.allSelected;

      angular.forEach(mainLocations, function(mainLocation) {
        var sublist = getChildNodesThatShouldBeShown(mainLocation);
        angular.forEach(sublist, function(item) {
          locationDescriptionList.push(item);
        });
      });

      var combinedList = mainLocations.map(function(mainLocation) {
        mainLocation.sublist = locationDescriptionList.filter(function(location) {
          return mainLocation.nested_set.depth === (location.nested_set.depth - 1) &&
            mainLocation.nested_set.left < location.nested_set.left &&
            mainLocation.nested_set.right > location.nested_set.right;
        });
        return mainLocation;
      });

      selectedLocations(combinedList);

    }

    function selectedLocations(allLocationsList) {
      vm.selectedLocationsOnClick({
        allLocationsList: allLocationsList
      });
    }

  }
})();
