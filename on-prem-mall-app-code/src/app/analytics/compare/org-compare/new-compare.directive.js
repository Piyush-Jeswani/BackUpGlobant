(function() {
  'use strict';

  angular.module('shopperTrak')
    .directive('newCompare', newCompare)
    .controller('newCompareController', newCompareController);

  function newCompare() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'app/analytics/compare/org-compare/new-compare.partial.html',
      scope: {
        currentOrganization: '=',
        currentUser: '=',
        compare: '=?',
        sites: '=',
        setMode: '=',
        isWidgetNameExist: '=',
        dateFormatMask: '=',
        editMode: '=?'
      },
      controller: newCompareController,
      controllerAs: 'vm',
      bindToController: true
    };
  }

  newCompareController.$inject = [
    '$scope',
    '$translate',
    '$stateParams',
    '$timeout',
    '$element',
    'apiUrl',
    'orgCompareService',
    'MallCheckService',
    'authService',
    'ObjectUtils',
    'datePeriods'
  ];

  function newCompareController(
    $scope,
    $translate,
    $stateParams,
    $timeout,
    $element,
    apiUrl,
    orgCompareService,
    MallCheckService,
    authService,
    ObjectUtils,
    datePeriods
  ) {
    var vm = this;

    activate();

    function activate() {
      init();
      setCompare();
      setTypes();
      setComparePeriods();
    }

    function setCompareParams() {
      vm.compare.metrics = getMetricsList(); // (array of strings, should be an enum in the data model. rest-field should be similar to kpiSortByField)
      vm.compare.sites = getSiteList(); // (array of site ids)
      vm.compare.hierarchy_tag_ids = getHierarchyList(); // hierarchy_tag_ids(array of hierarchy tag ids)
      vm.compare.organization_id = vm.currentOrganization.organization_id;

      vm.compare.selected_date_range = {
        period_type: vm.selectedDatePeriod[0].key, //'year', //possible values: 'day', 'week', 'month','quarter', 'year', 'wtd','mtd','qtd','ytd'
        custom_start_date: '',
        custom_end_date: ''
      };
      vm.compare.salesCategories = vm.salesCategories;
      updateComparePeriod1();
    }

    function setCompare() {
      if (vm.editMode === 'editCompare') {
        setVmParamsFromCompare();
        //edit mode no need to init
        return;
      }
      //new compare so init
      vm.compare = {
        chart_name: '', //chart_name (string)
        type: 'single', // (enum, can be 'single' or 'multi')
        organization_id: vm.currentOrganization.organization_id,
        metrics: [], // (array of strings, should be an enum in the data model. rest-field should be similar to kpiSortByField)
        sites: [], // (array of site ids)
        hierarchy_tag_ids: [], // hierarchy_tag_ids(array of hierarchy tag ids)
        selected_date_range: {
          period_type: 'year', //possible values: 'day', 'week', 'month','quarter', 'year', 'wtd','mtd','qtd','ytd'
          custom_start_date: '',
          custom_end_date: ''
        },
        compare_period_1: {
          period_type: 'prior_period', //  possible values: 'prior_period', 'prior_year'
          custom_start_date: '', // only used if period_type is 'custom'
          custom_end_date: '' //  only used if period_type is 'custom'
        },
        compare_period_2: {
          period_type: 'prior_year', //  possible values: 'prior_period', 'prior_year'
          custom_start_date: '', // only used if period_type is 'custom'
          custom_end_date: '' //  only used if period_type is 'custom'
        }
      };
    }

    function getCompareParams() {
      var params = {
        chart_name: vm.compare.chart_name, //chart_name (string)
        organization_id: vm.currentOrganization.organization_id,
        type: vm.compare.type, // (enum, can be 'single' or 'multi')
        metrics: vm.compare.metrics, // (array of strings, should be an enum in the data model. rest-field should be similar to kpiSortByField)
        selected_date_range: vm.compare.selected_date_range,
        compare_period_1: vm.compare.compare_period_1,
        compare_period_2: vm.compare.compare_period_2
      };

      if (!ObjectUtils.isNullOrUndefinedOrEmpty(vm.salesCategories) &&
        _.min(vm.salesCategories.id) > 0){
        params.sales_category_id = vm.salesCategories.map(function(category){
            return category.id;
        });
      }

      if (!ObjectUtils.isNullOrUndefinedOrEmpty(vm.compare.sites)){
        params.sites = vm.compare.sites;
      } else {
        params.sites = [-1];

      }

      if (!ObjectUtils.isNullOrUndefinedOrEmpty(vm.compare.hierarchy_tag_ids)){
        params.hierarchy_tag_ids = vm.compare.hierarchy_tag_ids;
      }

      return params;
    }

    function setVmParamsFromCompare() {
      vm.selectedMetrics = {};

      _.each(vm.compare.metrics, function(metric) {
        vm.selectedMetrics[metric] = true;
      });
      vm.salesCategories = vm.compare.salesCategories;

      vm.selectedSites = setValidSitesFromCompare();

      vm.selectedTags = vm.compare.hierarchy_tag_ids;

      setSelectedDatePeriod();
    }

    function setValidSitesFromCompare() {
      //some older compares contain sites that may no longer exist. this function removes those sites from the selectedSites
      let validSites = [];

      _.each(vm.compare.sites, compareSite => {
        let siteExists = _.findWhere(vm.sites, {site_id : compareSite});
        if (siteExists) {
          validSites.push(compareSite);
        }
      });      

      return validSites;
    }

    function setSelectedDatePeriod() {
      vm.selectedDatePeriod = [];

      var search = {
        key: vm.compare.selected_date_range.period_type
      };

      var item = _.findWhere(datePeriods, search);

      if (ObjectUtils.isNullOrUndefined(item)) {
        return;
      }

      item.selected = true;

      vm.selectedDatePeriod.push(item);
    }

    function getMetricsList() {
      var list = [];

      var selected = _.keys(
        _.pick(vm.selectedMetrics, function(value) {
          return value === true;
        })
      );

      _.each(selected, function(key) {
        list.push(key);
      });

      return list;
    }

    function getSiteList() {
      var list = [];

      if (ObjectUtils.isNullOrUndefinedOrEmpty(vm.selectedSites)) {
        return list;
      }

      _.each(vm.selectedSites, function(site) {
        list.push(site);
      });

      return list;
    }

    function getHierarchyList() {
      var list = [];

      if (ObjectUtils.isNullOrUndefinedOrEmpty(vm.selectedTags)) {
        return list;
      }

      _.each(vm.selectedTags, function(tag) {
        list.push(tag);
      });

      return list;
    }

    /**
    * SA-971. Custom compare needs form validation. 
    * Using the canBeSaved() function to check which form elements are mandatory.
    * Identify ones that are not set and alert user to the required input.
    * Minimum validation: You cannot click the form Save button until:
    * Compare name is entered.
    * At least one metric is chosen.
    * At least one site or tag is selected.
    * A date period is selected.
    * 
    */
    function canBeSaved() {
      vm.chartNameAlreadyExistMessage = '';

      // Reset the vm.validationMessages on each call to this function
      // in order to provide the user with the remaining mandatory form
      // input still required.
      vm.validationMessages = [];

      var isWidgetNameExist = false;
      if (vm.editMode !== 'editCompare') {
        isWidgetNameExist = vm.isWidgetNameExist(vm.compare.chart_name);
      }

      // Check if the chart name has already been created. If so tell the user
      // and return false from this function later.
      if (!ObjectUtils.isNullOrUndefinedOrBlank(vm.compare.chart_name) && isWidgetNameExist) {
        vm.chartNameAlreadyExistMessage = 'customCompare.CHARTNAMEALREADYEXISTMESSAGE';
      }

      // Check if the form is missing the chart name.
      if (ObjectUtils.isNullOrUndefinedOrBlank(vm.compare.chart_name)) {
        vm.validationMessages.push('customCompare.VALIDATIONCHARTNAME');
      }

      // Check if the form is missing a selected metric.      
      if (!hasSelectedMetric()) {
        vm.validationMessages.push('customCompare.VALIDATIONMETRICS');
      }

      // Check if the form is missing both selected site and selected tag. One of these has to be selected
      // for this part of the form validation to pass.       
      if (Object.keys(vm.selectedSites).length === 0 && vm.tags.length === 0) {
        vm.validationMessages.push('customCompare.VALIDATIONSITEORTAG');
      }

      // Check if the form is missing a selected date period.      
      if (ObjectUtils.isNullOrUndefinedOrEmpty(vm.selectedDatePeriod)) {
        vm.validationMessages.push('customCompare.VALIDATIONDATEPERIOD');
      }

      // Check if this custom compare name is NOT already being used.
      if (isWidgetNameExist) {
        return false;
      }   

      // If the vm.validationMessages array contains any items this means
      // form validation is still failing and the user needs to be asked
      // to provide the required input so that the Save button on the form
      // can be enabled. 
      if (vm.validationMessages.length > 0) {
        return false;
      }   

      // All the forms mandatory inputs have been provided. Return true to enable the Save button 
      // on this form.
      return true;
    }

    function getUserNewCharts() {
      var customCharts = [];

      if (!ObjectUtils.isNullOrUndefinedOrEmpty(vm.currentUser.preferences.custom_charts)) {
        customCharts = angular.copy(vm.currentUser.preferences.custom_charts);
      }

      customCharts.push(getCompareParams());

      return customCharts;
    }

    function cancel(target) {
      //force modal to hide to remove modal-backdrop fade in
      $element.find(target).modal('hide');
      vm.previewInProgress = false;
      if (vm.editMode === 'editCompare') {
        vm.setMode('edit');
        return;
      }
      vm.setMode('');
    }

    function save(target) {
      //force modal to hide to remove modal-backdrop fade in
      $element.find(target).modal('hide');

      vm.previewInProgress = false;

      if (vm.savingInProgress) {
        return;
      }

      setCompareParams();

      if (vm.editMode === 'editCompare') {
        vm.setMode('editCompareCompleted', vm.compare);
        return;
      }

      vm.savingInProgress = true;

      orgCompareService.saveUserCustomCompare(vm.currentUser, getUserNewCharts(), vm.currentOrganization.organization_id)
        .then(function(customCharts) {
          authService.updateUserPreferencesCustomCharts(customCharts);
          $timeout(function() {
            vm.savingInProgress = false;
            vm.setMode('added', vm.compare, customCharts);
          }, 100);
        });
    }

    function hasSelectedMetric() {
      for (var metric in vm.selectedMetrics) {
        if (vm.selectedMetrics[metric] === true) {
          return true;
        }
      }
      return false;
    }

    function setTypeMessage() {
      vm.typeInfo = 'customCompare.SINGLETYPEINFOSMESSAGE';
      vm.metricMessage = 'customCompare.SINGLEMETRICMESSAGE';
      if(vm.activeType.type === 'multi') {
        vm.typeInfo = 'customCompare.MULTITYPEINFOSMESSAGE';
        vm.metricMessage = 'customCompare.MULTIMETRICSMESSAGE';
      }
    }

    function setActiveType(type) {
      vm.activeType = type;
      setTypeMessage();
      if(vm.compare.type === vm.activeType.type) {
        //it is either first set or not changed so do nothing
        return;
      }
      vm.compare.type = vm.activeType.type; // (enum, can be 'single' or 'multi')
      //type changed so clear selected metrics

      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Property_Accessors
      // This should be an object and not an array i.e. object.property is identical to object['property']
      vm.selectedMetrics = {};
    }

    function setTypes() {
      vm.types = [{
        name: 'values',
        translation_label: '.VALUES',
        type: 'single',
        minLength: 1,
        maxLength: 1
      }, {
        name: 'percentChange',
        translation_label: '.PERCENTCHANGES',
        type: 'multi',
        minLength: 1,
        maxLength: 5
      }];

      if (vm.editMode === 'editCompare' && vm.compare.type === 'multi') {
        vm.activeType = vm.types[1];
        setTypeMessage();
        return;
      }

      setActiveType(vm.types[0]);
    }

    function setActiveComparePeriod(period) {
      vm.activeComparePeriod = period;
      updateComparePeriod1();
    }

    function updateComparePeriod1() {
      vm.compare.compare_period_1 = {
        period_type: vm.activeComparePeriod.period_type, //  possible values: 'prior_period', 'prior_year'
        custom_start_date: '', // only used if period_type is 'custom'
        custom_end_date: '' //  only used if period_type is 'custom'
      };
    }

    function setComparePeriods() {
      vm.comparePeriods = [{
        transKey: 'common.PRIORPERIOD',
        period_type: 'prior_period', //  possible values: 'prior_period', 'prior_year'
        custom_start_date: '', // only used if period_type is 'custom'
        custom_end_date: '' //  only used if period_type is 'custom'
      }, {
        transKey: 'common.PRIORYEAR',
        period_type: 'prior_year', //  possible values: 'prior_period', 'prior_year'
        custom_start_date: '', // only used if period_type is 'custom'
        custom_end_date: '' //  only used if period_type is 'custom'
      }];

      vm.activeComparePeriod = vm.comparePeriods[0];

      if (vm.editMode === 'editCompare') {
        if (vm.compare.compare_period_1.period_type === 'prior_year') {
          vm.activeComparePeriod = vm.comparePeriods[1];
        }
        return;
      }
      updateComparePeriod1();
    }

    function init() {
      vm.maxTags = 10;
      vm.maxSites = 10;
      vm.maxTagsExceededMessage = '';
      vm.maxSitesExceededMessage = '';
      vm.isAllSitesSelected = isAllSitesSelected;
      vm.setActiveComparePeriod = setActiveComparePeriod;
      vm.setActiveType = setActiveType;
      vm.save = save;
      vm.canBeSaved = canBeSaved;
      vm.savingInProgress = false;
      vm.data = {};
      vm.removeAllSites = removeAllSites;
      vm.removeAllTags = removeAllTags;
      vm.getSiteNameById = getSiteNameById;
      vm.selectAllSites = selectAllSites;
      vm.siteIsSelected = siteIsSelected;
      vm.toggleSite = toggleSite;
      vm.preview = preview;
      vm.showFilter = (MallCheckService.isNotMall(vm.currentOrganization) && MallCheckService.hasTags(vm.currentOrganization)); //We only show the filter if we are NOT a Mall and we have CustomTags or Hierarchy Tags.
      vm.cancel = cancel;
      vm.modalEventsSetup = false;

      vm.setSelectedFilters = setSelectedFilters;
      vm.removeAllSites();
      vm.removeAllTags();
    }

    function removeAllSites() {
      vm.selectedSites = [];
    }

    function removeAllTags() {
      vm.tags = [];
    }

    function getSiteNameById(siteId) {
      if (ObjectUtils.isNullOrUndefinedOrEmpty(vm.sites)) {
        return siteId;
      }

      var site = _.where(vm.sites, {
        site_id: siteId
      });
      return site[0].name;
    }

    function selectAllSites() {
      if (isAllSitesSelected()) {
        vm.selectedSites = [];
        return;
      }

      vm.selectedSites = _.pluck(vm.sites, 'site_id');
    }

    function isAllSitesSelected() {
      if (ObjectUtils.isNullOrUndefinedOrEmpty(vm.sites) ||
        ObjectUtils.isNullOrUndefinedOrEmpty(vm.selectedSites)) {
        return false;
      }
      return (vm.selectedSites.length === vm.sites.length);
    }

    function getSelectedTagName(filters, key) {
      if (filters.length > 1) {
        return filters[1][key];
      }
      return null;
    }

    function initFilters() {
      vm.selectedTags = [];
      vm.selectedTagNames = [];
      vm.selectedTagsInGroup = '';
      vm.data.filterText = ''; // clear search text when tags are applied
    }

    function maxTagsExceeded(filters) {
      var tags = _.compact(Object.values(filters[0]));
      return !ObjectUtils.isNullOrUndefinedOrEmpty(tags) &&
        tags.length > vm.maxTags;
    }

    function setSelectedFilters(filters) {
      if(maxTagsExceeded(filters)) {
        vm.maxTagsExceededMessage = 'customCompare.MAXTAGSMESSAGE';
        return;
      }

      vm.maxTagsExceededMessage = '';

      initFilters();

      if (ObjectUtils.isNullOrUndefined(filters)) {
        return;
      }

      vm.tags = [];

      // Selected Tags
      var selectedTags = filters[0];

      _.each(Object.keys(selectedTags), function(key) {
        if (selectedTags[key] === true) {
          vm.selectedTags.push(key);
          vm.tags.push(key);
          vm.selectedTagNames.push(getSelectedTagName(filters, key));
        }
      });
    }

    function preview(target) {
      setCompareParams();

      if(!vm.modalEventsSetup) {
        $element.find(target).on('hidden.bs.modal', function() {
          vm.modalLoaded = false;
        });

        $element.find(target).on('show.bs.modal', function () {
          $timeout(function() {
            vm.previewInProgress = true;
          }, 200);

        });

        $scope.$on('$destroy', function() {
          var modal = $(target);
          if (!ObjectUtils.isNullOrUndefined(modal) && _.isFunction(modal.modal)) {
            modal.modal('hide');
            modal.data('bs.modal', null);
          }
        });

        vm.modalEventsSetup = true;
      }

      $(target).modal('show');
    }

    function maxSitesReached() {
      return !ObjectUtils.isNullOrUndefinedOrEmpty(vm.selectedSites) &&
        vm.selectedSites.length >= vm.maxSites;
    }

    function toggleSite(siteId) {
      if (siteIsSelected(siteId)) {
        var index = vm.selectedSites.indexOf(siteId);
        vm.selectedSites.splice(index, 1);
        vm.maxSitesExceededMessage = '';
        return;
      }

      if(maxSitesReached()) {
        vm.maxSitesExceededMessage = 'customCompare.MAXSITESMESSAGE';
        return;
      }

      vm.maxSitesExceededMessage = '';
      vm.selectedSites.push(siteId);
    }

    function siteIsSelected(siteId) {
      return (vm.selectedSites.indexOf(siteId) > -1);
    }
  }
})();
