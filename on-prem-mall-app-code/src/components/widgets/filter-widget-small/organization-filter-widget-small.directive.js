'use strict';

angular.module('shopperTrak.widgets').directive('organizationFilterWidgetSmall', OrganizationFilterWidgetSmall);

function OrganizationFilterWidgetSmall() {
  return {
    templateUrl: 'components/widgets/filter-widget-small/organization-filter-widget-small.partial.html',
    controller: OrganizationFilterWidgetSmallCtrl,
    controllerAs: 'vm',
    bindToController: true,
    scope: {
      currentOrganization: '=?',
      updateSelectedFilters: '&',
      preselectedTags: '=?',
      selectedTagIds: '=?'
    }
  };
}

OrganizationFilterWidgetSmallCtrl.$inject = [
  '$scope',
  '$rootScope',
  '$translate',
  '$filter',
  'ObjectUtils'
];

function OrganizationFilterWidgetSmallCtrl(
  $scope,
  $rootScope,
  $translate,
  $filter,
  ObjectUtils
) {
  var vm = this;

  vm.organizationTags = getOrganizationTags();
  vm.organizationTagsIsNull = false;
  vm.selectedSiteCount = 0;
  vm.selectedTagObjects = [];

  vm.toggleLevelSelection = toggleLevelSelection;
  vm.cancel = cancel;
  vm.clearFilters = clearFilters;
  vm.applyFilters = applyFilters;
  vm.toggleFilters = toggleFilters;

  vm.ranApplyFilters = false;

  if(!ObjectUtils.isNullOrUndefined(vm.preselectedTags)) {
    vm.selectedTags = vm.preselectedTags[0];
    vm.selectedTagNames = vm.preselectedTags[1];
    vm.selectedTagsInGroup = vm.preselectedTags[2];
  } else {
    vm.selectedTags = [];
    vm.selectedTagNames = {};
    vm.selectedTagsInGroup = {};
  }

  var filterOpenedEventName = 'filterOpened';

  activate();

  function getOrganizationTags() {
    if(!ObjectUtils.isNullOrUndefined(vm.currentOrganization) &&
    !ObjectUtils.isNullOrUndefined(vm.currentOrganization.portal_settings)) {
      return vm.currentOrganization.portal_settings.group_structures;
    }
    return null;
  }

  function activate() {
    if(ObjectUtils.isNullOrUndefinedOrEmpty(vm.organizationTags)){
      vm.organizationTagsIsNull = true;
      return;
    }

    if(ObjectUtils.isNullOrUndefined(vm.selectedTagIds)) {
      vm.selectedTagIds = [];
    }

    parseHierarchyTags(vm.organizationTags);

    configureListeners();
  }

  function configureListeners() {
    var unbindFilterOpenedListener = $scope.$on(filterOpenedEventName, function(event, args) {

      if(anotherFilterWasOpened(args.openedFilterId) && vm.filterIsOpen) {
        vm.filterIsOpen = false;
      }
    });

    $scope.$on('$destroy', function() {
      if(typeof unbindFilterOpenedListener === 'function') {
        unbindFilterOpenedListener();
      }
    });
  }

  function anotherFilterWasOpened(openedFilterId) {
    return openedFilterId !== $scope.$id;
  }

  function isTagSelected(tag) {
    if(ObjectUtils.isNullOrUndefinedOrEmpty(vm.selectedTagIds)) {
      return false;
    }
    return (vm.selectedTagIds.indexOf(tag) > -1);
  }

   /** set hierarchy tags
   *   set org tags sort them and set selected
  */
  function parseHierarchyTags(tags) {
    // Creating an object of unique level descriptions and it's possible values
    var availableTags = {};
    _.each(tags, function(group) {
      _.each(group.levels, function(level) {
        availableTags[level.description] = [];
        _.each(level.possible_values, function(tag) {
          availableTags[level.description].push(tag);
          if(isTagSelected(tag._id)) {
            tag.selected = true;
            toggleLevelSelection(tag);
          }
        });
      });
    });

    // Making the tags into an easier structure and removing any tags that don't have any values in them
    var newTags = [];

    _.each(availableTags, function(tag, key) {
      if(tag.length > 0) {
        var sortedTags = alphabeticalSort(tag);
        newTags.push({ name: key, levels: sortedTags });
      }
    });

    vm.rows = angular.copy(buildGroups(newTags));
  }

  function buildGroups(newTags) {
    var rows = [];

    var sortedTags = _.sortBy(newTags, 'name');

    _.each(sortedTags, function(tag) {
      var highestRowIndex = (rows.length - 1);

      if(rows.length === 0) {
        addNewRow(rows);
      } else if(rows[highestRowIndex].columns.length % 3 === 0) {
        addNewRow(rows);
      } else if(tag.levels > 10) { // Tags with more than 10 options get their own row
        addNewRow(rows);
      }

      addTagToRow(rows, tag);
    });

    return rows;
  }

  function addNewRow(rows) {
    var newRow = {
      columns: []
    };

    rows.push(newRow);
  }

  function addTagToRow(rows, tag) {
    var maxRowIndex = (rows.length - 1);

    if(tag.levels.length <= 10) {
      var newColumn = buildNewColumn(tag);

      rows[maxRowIndex].columns.push(newColumn);
    } else {
      // Split tags
      var maxNumberOfPages = 3;

      var tagsPerPage = tag.levels.length / maxNumberOfPages;

      var roundedTagsPerPage = Math.round(tagsPerPage);

      var pageLengths = [];

      if(roundedTagsPerPage > tagsPerPage) {
        pageLengths.push(roundedTagsPerPage);
        pageLengths.push(roundedTagsPerPage);
        pageLengths.push(roundedTagsPerPage);
      } else {
        pageLengths.push(roundedTagsPerPage + 1);
        pageLengths.push(roundedTagsPerPage);
        pageLengths.push(roundedTagsPerPage);
      }

      var startTagIndex = 0;

      var endTagIndex = pageLengths[0];

      for(var page = 0; page < maxNumberOfPages; page++) {
        var pageTags = angular.copy(tag);

        pageTags.levels = pageTags.levels.slice(startTagIndex, endTagIndex);

        if(page !== 0) {
          pageTags.name = '';
        }

        var newColumn = buildNewColumn(pageTags);

        rows[maxRowIndex].columns.push(newColumn);

        if(page < (maxNumberOfPages - 1)) {
          startTagIndex = endTagIndex;

          endTagIndex += pageLengths[page + 1];
        }
      }
    }
  }

  function buildNewColumn(tag) {
    var column = {
      name: tag.name,
      levels: tag.levels
    };

    return column;
  }

  /** sort tags
   *   sort tags and levels capitalize and trim selectedTagNames
   * @param {(Object)Array} array list to sort
   * @return {(Object)Array} sorted items
  */
  function alphabeticalSort(obj) {
    var sortedItems = _.sortBy(obj, function (item) {
      item.name = capitalizeAndTrim(item.name);

      item.levels = alphabeticalListSort(item.levels, 'name');

      return item.name;
    });

    return sortedItems;
  }

    /** sort the list
   *  sort list capitalize and trim selectedTagNames
   * @param {(Object)Array} array list to sort
   * @param {String} key used to sort the list
   * @return {(Object)Array} sorted items
  */
  function alphabeticalListSort(list, key) {
    if (ObjectUtils.isNullOrUndefinedOrEmpty(list)) {
      return list;
    }

    return _.sortBy(list, function (item) {
      item[key] = capitalizeAndTrim(item[key]);
      return item[key];
    });
  }

  /** capitalizeAndTrim
   *   capitalizeAndTrim a string
   * @param {String} to be used
   * @return {String} capitalized and trimmed string
  */
  function capitalizeAndTrim(name) {
    return ($filter('capitalize')(name.trim()));
  }

  function toggleLevelSelection(tag) {
    if(tag.selected === true) {
      vm.selectedSiteCount += tag.site_count;
      vm.selectedTagObjects.push(tag);
    } else {
      vm.selectedSiteCount -= tag.site_count;
      vm.selectedTagObjects = _.without(vm.selectedTagObjects, _.findWhere(vm.selectedTagObjects, {
        _id: tag._id
      }));
    }
  }

  function clearFilters() {
    vm.selectedSiteCount = 0;

    _.each(vm.selectedTagObjects, function(tag) {
      tag.selected = false;
    });

    vm.selectedTagObjects = [];

    vm.filterHasChanged = true;

    // We only need to run this whenever we have already applied filters
    if(vm.ranApplyFilters) {
      vm.filterHasChanged = false;
      vm.selectedTagIds = [];
      vm.updateSelectedFilters({ filterTags: vm.selectedTagObjects });
    }
  }

  function applyFilters() {
    // Only apply filters if the filter themselves have changed
    if(vm.filterHasChanged) {
      vm.filterHasChanged = false;
      vm.ranApplyFilters = true;
      vm.updateSelectedFilters({ filterTags: vm.selectedTagObjects });

      vm.selectedTagIds = _.pluck(vm.selectedTagObjects, '_id');
      toggleFilters();
    } else {
      // Close it even if nothing has changed
      vm.filterIsOpen = false;
    }
  }

  function toggleFilters() {
    vm.filterHasChanged = true;
    if(vm.filterIsOpen) {
      vm.filterIsOpen = false;
    } else {
      vm.filterIsOpen = true;
      vm.selectedTagsBackup = angular.copy(vm.selectedTagObjects);
      vm.selectedSiteCountBackup = vm.selectedSiteCount;
      $rootScope.$broadcast(filterOpenedEventName, { openedFilterId: $scope.$id });
    }
  }

  function cancel() {
    _.each(vm.rows, function(row) {
      _.each(row.columns, function(row) {
        _.each(row.levels, function(level) {

          var selectedLevel = _.findWhere(vm.selectedTagsBackup, {_id: level._id});

          if(ObjectUtils.isNullOrUndefined(selectedLevel)) {
            level.selected = false;
          } else {
            level.selected = true;
          }

        });
      });
    });

    vm.selectedTagObjects = vm.selectedTagsBackup;
    vm.selectedSiteCount = vm.selectedSiteCountBackup;
    vm.selectedTagIds = _.pluck(vm.selectedTagObjects, '_id');
    toggleFilters();
  }
}

