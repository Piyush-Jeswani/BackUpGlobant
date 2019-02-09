(function() {
  'use strict';

  angular.module('shopperTrak').controller('WhatifCtrl', WhatifCtrl);

  WhatifCtrl.$inject = [
    '$scope',
    '$rootScope',
    '$timeout',
    '$window',
    '$filter',
    '$q',
    '$state',
    '$stateParams',
    'currentOrganization',
    'currentSite',
    'retailOrganizationSummaryData',
    'currentUser',
    'ExportService',
    'LocalizationService',
    'utils',
    'ObjectUtils',
    'metricConstants',
    'customDashboardService',
    'dateRangeService',
    'variableParam',
    'variableMetrics',
    'metricNameService'
  ];

  function WhatifCtrl(
    $scope,
    $rootScope,
    $timeout,
    $window,
    $filter,
    $q,
    $state,
    $stateParams,
    currentOrganization,
    currentSite,
    retailOrganizationSummaryData,
    currentUser,
    ExportService,
    LocalizationService,
    utils,
    ObjectUtils,
    metricConstants,
    customDashboardService,
    dateRangeService,
    variableParam,
    variableMetrics,
    metricNameService
  ) {

    var vm = this;
    activate();

    function activate() {
      vm.currentOrganization = currentOrganization;
      vm.currentSite = currentSite;
      vm.currentUser = currentUser;
      vm.onFocus = onFocus;
      vm.setSelectedFilters = setSelectedFilters;
      vm.setSelectedTagsSites = setSelectedTagsSites;

      LocalizationService.setUser(currentUser);
      vm.dateFormat = LocalizationService.getCurrentDateFormat(currentOrganization);

      metricNameService.applyCustomMetricNames(currentOrganization)
        .then(function() {
          initData();
        })
        .catch(function(error) {
          console.error(error);
          initData();
        });
    }

    function initData() {
      vm.displayNames = getMetricDisplayNames();

      var sales = new variableParam({
        kpi: 'sales',
        hold: false
      });

      var ats = new variableParam({
        kpi: 'ats',
        hold: true
      });

      var conversion = new variableParam({
        kpi: 'conversion',
        hold: false,
      });

      var traffic = new variableParam({
        kpi: 'traffic',
        hold: true
      });

      var aur = new variableParam({
        kpi: 'aur',
        hold: true
      });

      var upt = new variableParam({
        kpi: 'upt',
        hold: true
      });

      var transactions = new variableParam({
        kpi: 'transactions',
        hold: false
      });

      var sps = new variableParam({
        kpi: 'sps',
        hold: false
      });


      //order is very important here
      variableMetrics.addVariables([transactions, sales, ats, conversion, traffic, aur, upt, sps]);
      vm.allKpis = variableMetrics.getMetricKeys();

      //avoid race issue for cached data
      $timeout(function () {
        loadInitialData();
      });

      $scope.$on('$destroy', function() {
        _.each(variableMetrics.getCollection(), function(_collection) {
          _collection.destroyWatcher();
        });
      });
    }

    function getMetricDisplayNames() {
      return {
        sales: getMetricDisplayName('sales'),
        sps: getMetricDisplayName('sps'),
        traffic: getMetricDisplayName('traffic'),
        conversion: getMetricDisplayName('conversion'),
        ats: getMetricDisplayName('ats'),
        transactions: getMetricDisplayName('transactions'),
        upt: getMetricDisplayName('upt'),
        aur: getMetricDisplayName('aur'),
      };
    }

    function getMetricDisplayName(metricKpi) {
      var metric = _.findWhere(metricConstants.metrics, { kpi: metricKpi });

      return metric.displayName;
    }

    function loadInitialData() {
      var requestPromises = [];
      var dateRanges = [
        {start: $stateParams.dateRangeStart, end: $stateParams.dateRangeEnd},
        {start: $stateParams.compareRange1Start, end: $stateParams.compareRange1End},
        {start: $stateParams.compareRange2Start, end: $stateParams.compareRange2End},
      ];

      vm.dateRanges = dateRanges;

      _.each( dateRanges, function(dateParams) {
        requestPromises.push( getData(dateParams) );
      });

      variableMetrics.setLoading(true);

      $q.all(requestPromises).then( function(_data) {
        _.each(vm.allKpis, function(kpi) {
          var currentValue = (_data[0].result[0] || {})[kpi] || '-';
          var priorPeriodVal = (_data[1].result[0] || {})[kpi] || '-';
          var priorYearVal = (_data[2].result[0]|| {})[kpi] || '-';

          variableMetrics.reset();
          variableMetrics.setInitialValueFor(kpi, currentValue, priorPeriodVal, priorYearVal);
        });
      });
    }

    function setSelectedTagsSites(selectedTagsSites) {
      vm.selectedTagsSites = selectedTagsSites;
    }


    function setSelectedFilters(filters, customTags) {
      vm.selectedTags = [];
      vm.selectedCustomTags = [];
      vm.selectedTagNames = filters[1];

      if( !ObjectUtils.isNullOrUndefinedOrEmptyObject(customTags) ) {
        vm.selectedCustomTags =  _.keys(_.pick(customTags, function(_selected) {
          return _selected === true;
        }));
      }

      // Selected Tags
      var selectedTags = filters[0];
      vm.selectedTags = _.keys(_.pick(selectedTags, function(_selected) {
        return _selected === true;
      }));

      $rootScope.$broadcast('filtersApplied', {customTags:vm.selectedCustomTags, tags: vm.selectedTags});
      doFilter();
    }

    function doFilter() {
      vm.numTags = _.keys(vm.selectedTags).length + _.keys(vm.selectedCustomTags).length;
      $timeout(function () {
        loadInitialData();
      });
    }

    function getData(_dateParams) {
      var deferred = $q.defer();
      var params = {
        apiEndpoint: 'kpis/report',
        orgId: $stateParams.orgId,
        siteId: $stateParams.siteId,
        kpi: vm.allKpis,
        dateRangeStart: _dateParams.start,
        dateRangeEnd: _dateParams.end,
        operatingHours: true,
        selectedTags: vm.selectedTags || [],
        customTagId: vm.selectedCustomTags || [],
      };
      retailOrganizationSummaryData.fetchKpiData(params, true, function (data) {
        deferred.resolve(data);
      }, function (error, status) {
        deferred.reject(status);
      });

      return deferred.promise;
    }

    function onFocus(_isEditing) {
      variableMetrics.setIsEditing(_isEditing.kpi);
    }

  }
})();
