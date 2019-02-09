(function() {
  'use strict';

  angular.module('shopperTrak')
    .controller('AdminKPIEditController', AdminKPIEditController);

    AdminKPIEditController.$inject = [
      '$http',
      '$state',
      '$stateParams',
      '$cacheFactory',
      '$timeout',
      'currentAdminOrganization',
      'metricNameService',
      'metricConstants',
      'ObjectUtils',
      'apiUrl'
  ];

  function AdminKPIEditController($http, $state, $stateParams, $cacheFactory, $timeout, currentOrganization, metricNameService, metricConstants, ObjectUtils, apiUrl) {
    var vm = this;
    vm.success = false;
    vm.error = false;

    activate();

    function activate() {
      initScope();
      getMetric();
      vm.orgId = $stateParams.orgId;
    }

    function initScope() {
      vm.saveKpi = saveKpi;
    }

    function getMetric() {
      metricNameService.getMetricNames(currentOrganization)
        .then(function (metrics) {
          var metric = _.findWhere(metrics, {kpi: $stateParams.kpi});

          if(_.isUndefined(metric)) {
            vm.errorMessage = 'Metric: ' + $stateParams.kpi + ' was not found';
            return;
          }
    
          metric.customName = getOrgCustomName(metric.kpi);
    
          vm.metric = angular.copy(metric);
        }).catch(function (error) {
          vm.errorMessage = error;
        });
    }

    function getOrgCustomName(kpiName) {
      if(ObjectUtils.isNullOrUndefined(currentOrganization.metric_labels)) {
        return;
      }

      return currentOrganization.metric_labels[kpiName];
    }

    function saveKpi(metric) {
      vm.loading = true;
      vm.error = false;

      var orgMetrics = currentOrganization.metric_labels;

      if(_.isUndefined(orgMetrics)) {
        orgMetrics = { };
      }

      orgMetrics[metric.kpi] = metric.customName;

      orgMetrics = insertMissingMetricKeys(orgMetrics);

      currentOrganization.metric_labels = orgMetrics;

      var url = getSaveUrl();

      $http.put(url, currentOrganization)
       .then(function() {
         vm.success = true;
         // We have to do this because the app holds onto requests for reference info,
         // and we're updating reference info here
        
         $timeout(function(){
          $cacheFactory.get('$http').removeAll();
          vm.loading = false;
          $state.go('admin.organizations.edit', {orgId: vm.orgId});
         }, 2000);
         
       })
       .catch(function(err) {
         console.error(err);
         vm.loading = false;
         vm.error = true;
       });
    }

    function getSaveUrl() {
      return apiUrl + '/organizations/' + vm.orgId.toString();
    }

    function insertMissingMetricKeys(orgMetrics) {
      var allMetricKeys = metricNameService.getAllKeys();

      var defaultKpiName = '';

      _.each(allMetricKeys, function(metricKey) {
        if(!orgMetrics.hasOwnProperty(metricKey)) {
          orgMetrics[metricKey] = defaultKpiName;
        }
      });

      return orgMetrics;
    }
  }
})();
