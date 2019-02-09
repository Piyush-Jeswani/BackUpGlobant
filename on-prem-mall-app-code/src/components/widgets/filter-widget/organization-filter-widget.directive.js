/** Organization Filter Widget
  * Isolated Scope:
  * - currentOrganization: We will need this data to display any filter data.
  * - updateSelectedFilters: Pass in a function that will be called when the user updates the filters they selected.
  *   This is mainly to create a two way connection with the parent controller so that we don't have to use factories (Ex: CSV Export).
  * - openMain: You can pass in a true/false on whether you want the main filter content to be open when the user loads the page.
  * - preselectedTags: If you want to have a preconfigured set of filter tags already selected then use this.
  *   It is an array of values containing the selectedTags, selectedTagNames and selectedTagsInGroup (in that order).
  *   Those three values do need to be sent for the functionality to work correctly.
  */


 angular.module('shopperTrak.widgets').directive('organizationFilterWidget', OrganizationFilterWidget);

 function OrganizationFilterWidget () {
   return {
     templateUrl: 'components/widgets/filter-widget/organization-filter-widget.partial.html',
     controller: OrganizationFilterWidgetCtrl,
     controllerAs: 'vm',
     bindToController: true,
     scope: {
       currentOrganization: '=?',
       compStores: '=?',
       updateSelectedFilters: '&',
       openMain: '=?',
       preselectedTags: '=?',
       selectedTagData: '=?',
       selectedTagIds: '=?',
       setSelectedTagsSites: '=?',
       clearFilter: '=clearFilter',
       activeFilters: '=?'
     }
   };
 }
 
 OrganizationFilterWidgetCtrl.$inject = [
   '$scope',
   '$timeout',
   '$state',
   '$rootScope',
   '$http',
   '$translate',
   '$filter',
   '$q',
   'retailOrganizationSummaryData',
   'adminSitesData',
   'LocalizationService',
   'requestManager',
   'ObjectUtils',
   'apiUrl',
   'CompParams'
 ];
 
 function OrganizationFilterWidgetCtrl (
   $scope,
   $timeout,
   $state,
   $rootScope,
   $http,
   $translate,
   $filter,
   $q,
   retailOrganizationSummaryData,
   adminSitesData,
   LocalizationService,
   requestManager,
   ObjectUtils,
   apiUrl,
   CompParams
 ) {
   const vm = this;
   let separatedTags;
   let allSeparatedTags;
 
   activate();
 
   function activate () {
     initScope();
 
     if (vm.openMain) {
       vm.openFilters = true;
     } else {
       vm.openFilters = false;
     }
 
     setPreselectedTags();
 
     getTotalFiltersApplied();
 
     calculateUserFilterCount();
 
     parseHierarchyTags(vm.organizationTags);
     getCustomTags();
 
     loadTranslations();
     configureWatches();
 
     if (ObjectUtils.isNullOrUndefined(vm.cachedFilters)) {
       vm.cachedFilters = [];
     }
 
     if (!ObjectUtils.isNullOrUndefined(vm.activeFilters)) {
       setActiveFilters(vm.activeFilters);
       return;
     }
 
     if (!ObjectUtils.isNullOrUndefined($state.activeFilters) && $state.activeFilterId === vm.currentOrganization.organization_id) {
       setPrevSelectedFilters();
     } else {
       delete $state.activeFilters;
       delete $state.activeFilterId;
     }
   }
 
   function initScope () {
     vm.isOpenGroup = [];
     vm.isOpenLevel = [];
     vm.totalTagsSelected = 0;
 
     vm.language = LocalizationService.getCurrentLocaleSetting();
 
     vm.toggleGroup = toggleGroup;
     vm.toggleLevel = toggleLevel;
     vm.toggleTag = toggleTag;
 
     vm.clearFilters = clearFilters;
     vm.applyFilters = applyFilters;
     vm.toggleFilters = toggleFilters;
     vm.getCompFilterCount = getCompFilterCount;
 
     vm.filterHasChanged = false;
     vm.ranApplyFilters = false;
 
     vm.getCustomTags = getCustomTags;
   }
 
   function getCompFilterCount () {
     return CompParams.getCompFilterCount() || '-';
   }
 
   function tagsAreAvailable (tags) {
     return _.some(tags, tagCollection => !ObjectUtils.isNullOrUndefinedOrEmpty(tagCollection));
   }
 
   function getOrganizationTags () {
     if (!ObjectUtils.isNullOrUndefined(vm.currentOrganization) &&
       !ObjectUtils.isNullOrUndefined(vm.currentOrganization.portal_settings)) {
       return vm.currentOrganization.portal_settings.group_structures;
     }
     return null;
   }
 
   function setPreselectedTags () {
     if (!ObjectUtils.isNullOrUndefined(vm.preselectedTags)) {
       vm.selectedTags = vm.preselectedTags[0];
       vm.selectedTagNames = vm.preselectedTags[1];
       vm.selectedTagsInGroup = vm.preselectedTags[2];
       updateAppliedSiteCount(); // if we pass in preselected tags then we should update site showing count
     } else {
       vm.selectedTags = [];
       vm.customTagsSelected = {};
       vm.selectedTagNames = {};
       vm.selectedTagsInGroup = {};
     }
   }
 
   function setActiveFilters (activeFilters) {
     clearFilters();
 
     _.each(activeFilters, _filter => {
       const tag = _filter.tag;
       const group = _filter.group;
       vm.filterHasChanged = true;
       toggleTag(tag, group);
     });
 
     applyFilters();
   }
 
   function setPrevSelectedFilters () {
     _.each($state.activeFilters, _filter => {
       const tag = _filter.tag;
       const group = _filter.group;
 
       toggleTag(tag, group);
     });
 
     applyFilters();
   }
 
   function configureWatches () {
     const unbindFunctions = [];
 
     unbindFunctions.push($scope.$watch('vm.selectedTagData', onSelectedTagDataChange));
     unbindFunctions.push($scope.$on('clearFilter', onClearFilter));
     unbindFunctions.push($rootScope.$on('$stateChangeSuccess', onStateChangeSuccess));
 
     $scope.$on('$destroy', () => {
       _.each(unbindFunctions, unbindFunction => {
         if (angular.isFunction(unbindFunction)) {
           unbindFunction();
         }
       });
     });
   }
 
   function onSelectedTagDataChange () {
     if (ObjectUtils.isNullOrUndefinedOrEmpty(vm.selectedTagData)) {
       clearFilters();
     }
   }
 
   function onClearFilter (event, data) {
     if (data) {
       clearFilters();
     }
   }
 
   function onStateChangeSuccess (ev, to, {siteId, orgId}) {
     if (!ObjectUtils.isNullOrUndefined(siteId) || vm.currentOrganization.organization_id !== orgId) {
       delete $state.activeFilters;
       delete $state.activeFilterId;
     }
   }
 
   function loadTranslations () {
     $translate.use(vm.language);
   }
 
   function isTagSelectedInFilters (tag) {
     if (ObjectUtils.isNullOrUndefinedOrEmpty(vm.selectedTagIds)) {
       return false;
     }
     return vm.selectedTagIds.includes(tag);
   }
 
   /** set hierarchy tags
    *   set org tags sort them and set selected
   */
   function parseHierarchyTags () {
     const tags = getOrganizationTags();
 
     // Creating an object of unique level descriptions and it's possible values
     const availableTags = {};
     _.each(tags, group => {
       _.each(group.levels, ({description, possible_values}) => {
         availableTags[description] = [];
         _.each(possible_values, tag => {
           availableTags[description].push(tag);
           if (isTagSelectedInFilters(tag._id)) {
             toggleTag(tag, group);
           }
         });
       });
     });
 
     // Making the tags into an easier structure and removing any tags that don't have any values in them
     const newTags = [];
 
     _.each(availableTags, (tag, key) => {
       if (tag.length > 0) {
         const sortedTags = alphabeticalSort(tag);
         newTags.push({ name: key, levels: sortedTags });
       }
     });
 
     separateTagsIntoColumns(newTags);
 
     if (!ObjectUtils.isNullOrUndefinedOrEmpty(vm.selectedTagIds)) {
       applyFilters();
     }
   }
 
   /** sort tags
    *   sort tags and levels capitalize and trim selectedTagNames
    * @param {(Object)Array} array list to sort
    * @return {(Object)Array} sorted items
   */
   function alphabeticalSort (obj) {
     const sortedItems = _.sortBy(obj, item => {
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
   function alphabeticalListSort (list, key) {
     if (ObjectUtils.isNullOrUndefinedOrEmpty(list)) {
       return list;
     }
 
     return _.sortBy(list, item => {
       item[key] = capitalizeAndTrim(item[key]);
       return item[key];
     });
   }
 
   /** capitalizeAndTrim
    *   capitalizeAndTrim a string
    * @param {String} to be used
    * @return {String} capitalized and trimmed string
   */
   function capitalizeAndTrim (name) {
     return $filter('capitalize')(name.trim());
   }
 
   function separateTagsIntoColumns (tags) {
     const column1 = [];
     const column2 = [];
     const column3 = [];
     const column4 = [];
     const column5 = [];
     const column6 = [];
 
     for (let index = 0; index < tags.length; index++) {
       const maxIndexLenght = 6;
       const modulusEvaluationVal2 = 2;
       const modulusEvaluationVal3 = 3;
       const modulusEvaluationVal4 = 4;
       const modulusEvaluationVal5 = 5;
       const modulusEvaluation = index % maxIndexLenght;
       if (index === 0) {
         column1.push(tags[index]);
       } else {
         if (modulusEvaluation === 1) {
           column2.push(tags[index]);
         } else if (modulusEvaluation === modulusEvaluationVal2) {
           column3.push(tags[index]);
         } else if (modulusEvaluation === modulusEvaluationVal3) {
           column4.push(tags[index]);
         } else if (modulusEvaluation === modulusEvaluationVal4) {
           column5.push(tags[index]);
         } else if (modulusEvaluation === modulusEvaluationVal5) {
           column6.push(tags[index]);
         } else {
           column1.push(tags[index]);
         }
       }
     }
 
     separatedTags = [column1, column2, column3, column4, column5, column6];
   }
 
   function toggleLevel (group, level) {
     if (!ObjectUtils.isNullOrUndefined(vm.isOpenLevel) && vm.isOpenLevel[group] && vm.isOpenLevel[group][level]) {
       vm.isOpenLevel[group][level] = false;
     } else {
       vm.isOpenLevel = [];
       vm.isOpenLevel[group] = [];
       vm.isOpenLevel[group][level] = true;
     }
   }
 
   /**
    * Toggles if the specified group is open or not.
    * Public function.
    *
    * @param {string} groupName - The groupname to toggle
    */
   function toggleGroup (groupName) {
     if (!ObjectUtils.isNullOrUndefined(vm.isOpenGroup) && vm.isOpenGroup[groupName]) {
       vm.isOpenGroup[groupName] = false;
     } else {
       vm.isOpenGroup[groupName] = true;
     }
   }
 
   function toggleTag (_tag, group) {
     const tagId = _tag._id;
     const name = _tag.name;
 
     vm.filterHasChanged = true;
 
     if (isCustomTag(_tag)) {
       vm.customTagsSelected[tagId] = !vm.customTagsSelected[tagId];
     } else {
       vm.selectedTags[tagId] = !vm.selectedTags[tagId];
     }
 
     const tagCache = { tag: _tag, group };
 
     if (isTagSelected(tagId, vm.selectedTags, vm.customTagsSelected)) {
       if (ObjectUtils.isNullOrUndefined(vm.selectedTagsInGroup[group])) {
         vm.selectedTagsInGroup[group] = 0;
       }
       vm.selectedTagsInGroup[group]++;
 
       vm.cachedFilters.push(tagCache);
     } else {
       vm.selectedTagsInGroup[group]--;
 
       vm.cachedFilters = _.reject(vm.cachedFilters, ({tag}) => tag._id === _tag._id);
     }
 
     vm.selectedTagNames[tagId] = name;
 
     if (customTagsAreSelected(vm.cachedFilters) || ObjectUtils.isNullOrUndefinedOrEmpty(vm.cachedFilters)) {
       filterRelatedCustomTags(vm.cachedFilters);
     }
   }
 
   /**
    * Checks to see if any custom tags are selected
    *
    * @param {array<object>} selectedTags - The currently selected tags
    */
   function customTagsAreSelected (selectedTags) {
     const tags = _.pluck(selectedTags, 'tag');
 
     return _.some(tags, isCustomTag);
   }
 
   /**
    * Filters the current filter widget in view based on the linked tags
    *
    * @param {array<object>} selectedCustomTags - The selected custom tags
    */
   function filterRelatedCustomTags (selectedCustomTags) {
     if (ObjectUtils.isNullOrUndefinedOrEmpty(selectedCustomTags)) {
       vm.separatedTags = angular.copy(allSeparatedTags);
       return;
     }
 
     const tagIdsToFilterTo = getTagsToFilterTo(selectedCustomTags);
 
     let filteredTags = angular.copy(allSeparatedTags);
 
     _.each(filteredTags, group => {
       group[0].levels = _.filter(group[0].levels, ({_id}) => _.contains(tagIdsToFilterTo, _id));
     });
 
     filteredTags = _.filter(filteredTags, group => group[0].levels.length > 0);
 
     vm.separatedTags = angular.copy(filteredTags);
   }
 
   /**
    * Traverses the selected custom tags to find the selected tags and the ids of any tags they are linked to.
    *
    * @param {array<object>} selectedCustomTags - The selected custom tags
    * @returns {array<string>} A list of custom tagIds
    */
   function getTagsToFilterTo (selectedCustomTags) {
     const tags = _.pluck(selectedCustomTags, 'tag');
 
     const selectedTagIds = _.pluck(tags, '_id');
 
     let linkedTagIds = _.pluck(tags, 'linked_tags');
 
     linkedTagIds = _.intersection(...linkedTagIds);
 
     return _.union(selectedTagIds, linkedTagIds);
   }
 
   /**
    * Checks to see if the provided tag is a custom tag or not
    *
    * @param {object} tag - The tag object used by the UI
    * @returns {boolean} The result
    */
   function isCustomTag ({filter_type}) {
     return !ObjectUtils.isNullOrUndefined(filter_type);
   }
 
   /**
    * Checks to see if the provided tag is selected or not.
    * Works for both tag types
    *
    * @param {number} tagId - The id of the tag object to check
    * @param {array<object>} selectedTags -the array of selected tags to check
    * @param {array<object>} selectedCustomTags - the array of selected custom tags to check
    * @returns {boolean} The result
    */
   function isTagSelected (tagId, selectedTags, selectedCustomTags) {
     return selectedTags[tagId] || selectedCustomTags[tagId];
   }
 
   function getTotalFiltersApplied () {
     vm.totalTagsSelected = 0;
     _.each(vm.selectedTagsInGroup, group => {
       vm.totalTagsSelected += group;
     });
   }
 
   function applyFilters () {
     // Only apply filters if the filter themselves have changed
     if (vm.filterHasChanged) {
       vm.filterHasChanged = false;
       vm.ranApplyFilters = true;
 
       const tags = [vm.selectedTags, vm.selectedTagNames, vm.selectedTagsInGroup];
 
       getTotalFiltersApplied();
       updateAppliedSiteCount();
 
       vm.selectedTagData = tags;
 
       vm.updateSelectedFilters({ filterTags: tags, customTags: vm.customTagsSelected, customTagDetails: vm.cachedFilters });
 
       //save new tag selections
       $state.activeFilters = vm.cachedFilters;
       $state.activeFilterId = vm.currentOrganization.organization_id;
     }
   }
 
   function clearFilters () {
     vm.selectedTags = [];
     vm.customTagsSelected = {};
     vm.selectedTagNames = {};
     vm.selectedTagsInGroup = {};
     vm.totalTagsSelected = 0;
     vm.cachedFilters = [];
 
     if (!ObjectUtils.isNullOrUndefinedOrEmpty(allSeparatedTags)) {
       vm.separatedTags = angular.copy(allSeparatedTags);
     }
 
     // We only need to run this whenever we have already applied filters
     if (vm.ranApplyFilters) {
       vm.ranApplyFilters = false;
       const tags = [vm.selectedTags, vm.selectedTagNames];
 
       vm.selectedTagData = tags;
 
       updateAppliedSiteCount();
       vm.updateSelectedFilters({ filterTags: tags });
       if (_.isFunction(vm.setSelectedTagsSites)) {
         vm.setSelectedTagsSites([]);
       }
     }
 
     if (!ObjectUtils.isNullOrUndefined($state.activeFilters)) {
       vm.cachedFilters = [];
       delete $state.activeFilters;
       delete $state.activeFilterId;
     }
   }
 
   function toggleFilters () {
     if (vm.openFilters) {
       vm.openFilters = false;
     } else {
       vm.openFilters = true;
     }
   }
 
   function getCount (data) {
     if (!ObjectUtils.isNullOrUndefined(data) &&
       !ObjectUtils.isNullOrUndefinedOrEmpty(data.result)) {
       if (!ObjectUtils.isNullOrUndefined(data.result[0].count)) {
         return data.result[0].count;
       }
 
       return data.result.length;
     }
 
     return 0;
   }
 
   function calculateUserFilterCount () {
    //use data_released_site_count if property exists
    vm.totalSiteCount = !_.isUndefined(vm.currentOrganization.data_released_site_count) ?
    vm.currentOrganization.data_released_site_count : vm.currentOrganization.site_count;
    vm.sitesShowingCount = vm.totalSiteCount;
    vm.initialSiteCount = vm.totalSiteCount;
   }
   function getCustomTags () {
      const customTags = vm.currentOrganization.custom_tags;
 
      let tagsHaveSiteCount = [];
      tagsHaveSiteCount = _.filter(customTags, ({site_count}) => site_count > 0);
 
      if (tagsHaveSiteCount.length <= 0) {
        if (tagsAreAvailable(separatedTags)) {
          vm.separatedTags = separatedTags;
        }
        return;
      }
 
      const tagTypes = _.uniq(_.pluck(tagsHaveSiteCount, 'tag_type'));
      const transFormedTags = [];
    
      _.each(tagTypes, tagType => {
        const group = _.filter(customTags, _tag => {
          _tag.filter_type = 'custom';
          return _tag.tag_type === tagType;
        });
 
        const tagObj = [{ levels: group, name: tagType }];
        transFormedTags.push(tagObj);
      });
 
      let filterTags = _.union(transFormedTags, separatedTags);
 
      filterTags = _.sortBy(filterTags, tag => {
        if (ObjectUtils.isNullOrUndefined(tag[0])) {
          const niner = 999;
          return niner;
        }
 
        tag[0].name = capitalizeAndTrim(tag[0].name);
 
        tag[0].levels = alphabeticalListSort(tag[0].levels, 'name');
 
        return tag[0].name;
      });
 
      vm.separatedTags = _.filter(filterTags, ({length}) => length > 0);
      //This is used as a backup when filtering tags
      allSeparatedTags = angular.copy(vm.separatedTags);
    }
 
   function updateAppliedSiteCount () {
     if (vm.totalTagsSelected === 0) {
       //assumes no filters were selected
       vm.sitesShowingCount = vm.initialSiteCount;
 
       if (_.isFunction(vm.setSelectedTagsSites)) {
         vm.setSelectedTagsSites([]);
       }
 
     } else {
 
       let customTags = [];
       const tagIds = _.keys(_.pick(vm.selectedTags, _selected => _selected === true));
 
       if (!ObjectUtils.isNullOrUndefined(vm.customTagsSelected)) {
         customTags = _.keys(_.pick(vm.customTagsSelected, _selected => _selected === true));
       }
 
       let heirarchyTags = '';
       let customTagIds = '';
 
       _.each(tagIds, id => {
         heirarchyTags += heirarchyTags === '' ? `?hierarchyTagId=${id}` : `&hierarchyTagId=${id}`;
       });
 
       _.each(customTags, id => {
         customTagIds += `&customTagId=${id}`;
       });
 
       heirarchyTags += heirarchyTags === '' ? '?all_fields=true' : '&all_fields=true';
 
       let url = `${apiUrl}/organizations/${vm.currentOrganization.organization_id}/sites${heirarchyTags}`;
 
       if (customTagIds !== '') {
         url += customTagIds;
       }
 
       $http.get(url).then(({data}) => {
         vm.sitesShowingCount = getCount(data);
 
         if (_.isFunction(vm.setSelectedTagsSites)) {
           vm.setSelectedTagsSites(data.result);
         }
       });
     }
   }
 }
