(function () {
  'use strict';

  angular.module('shopperTrak')
    .directive('metricSwitchSelector', metricSwitchSelector);

  function metricSwitchSelector() {
    return {
      restrict: 'E',
      templateUrl: 'components/metric-switch-selector/metric-switch-selector.partial.html',
      scope: {
        selectedMetrics: '=?',
        activeGroup: '=?',
        maxLength: '=?',
        minLength: '=?',
        currentOrganization: '=',
        currentSite: '=?',
        metricMessage: '=?',
        zoneLevel: '=?'
      },
      bindToController: true,
      controller: metricSwitchSelectorController,
      controllerAs: 'vm'
    };
  }

  metricSwitchSelectorController.$inject = [
    '$scope',
    '$translate',
    '$filter',
    'LocalizationService',
    'SubscriptionsService',
    'ObjectUtils',
    'metricConstants',
    'metricNameService'
  ];

  function metricSwitchSelectorController(
    $scope,
    $translate,
    $filter,
    LocalizationService,
    SubscriptionsService,
    ObjectUtils,
    metricConstants,
    metricNameService
  ) {


    var vm = this;
    var trafficDisplayName;
    vm.selectMetric = selectMetric;
    vm.setActiveGroup = setActiveGroup;
    vm.groupFilter = groupFilter;
    vm.metricIsDisabled = metricIsDisabled;
    metricNameService.applyCustomMetricNames(vm.currentOrganization)
    .then(function(){
      activate();
    }).catch(function(error){
      console.error(error);
      activate();
    });

    function activate() {
      getActiveSubscriptions();
      setGroupAndMetrics();
      initialise();
    }

    function filterSubscriptionsForGroup(groups) {
      return _.filter(groups, function (group) {
        return (group.subscription === 'any' ||
          _.contains(vm.activeSubscriptions, group.subscription));
      });
    }

    function filterSubscriptionsForMetrics(metrics) {
      return _.filter(metrics, function (metric) {
        if((metric.group === 'any' || _.contains(vm.activeSubscriptions, metric.group)) &&
            hasRequiredPermissions (metric.requiredSubscriptions, $scope.currentOrganization)) {
              return true;
        }

        return false;
      });
    }

    function hasRequiredPermissions(requiredSubscriptions) {
      if (ObjectUtils.isNullOrUndefinedOrEmpty(requiredSubscriptions)) {
        return true;
      }

      var hasRequiredPermission = true;
       _.each(requiredSubscriptions, function(permission) {
        if(!_.contains(vm.activeSubscriptions, permission)) {
          hasRequiredPermission = false;
          return false;
        }
      });
      return hasRequiredPermission;
    }

    function metricIsDisabled(metric) {
      if(ObjectUtils.isNullOrUndefined(vm.selectedMetrics) ||
        ObjectUtils.isNullOrUndefined(vm.maxLength)){
        return false;
      }

      var selected = _.keys(
        _.pick(vm.selectedMetrics, function(value) {
          return value === true;})
        );

      return selected.length >= vm.maxLength && vm.selectedMetrics[metric] !== true;
   }

    function getActiveSubscriptions(){
      if (!ObjectUtils.isNullOrUndefined(vm.currentSite) &&
        !ObjectUtils.isNullOrUndefined(vm.currentSite.subscriptions)){
          vm.activeSubscriptions = SubscriptionsService.getSubscriptions(vm.currentSite);
      }else {
        vm.activeSubscriptions = SubscriptionsService.getSubscriptions(vm.currentOrganization);
      }
    }

    function setGroupAndMetrics() {
      vm.groups = filterSubscriptionsForGroup(metricConstants.groups);
      let currentMetrics = filterSubscriptionsForMetrics(metricConstants.metrics);
      vm.metrics = angular.copy(_.sortBy(currentMetrics, 'order'));
    }

    function groupFilter(metric) {
      return (metric.group === 'any' || metric.group === vm.activeGroup);
    }

    function initialise(){
      if (ObjectUtils.isNullOrUndefined(vm.activeGroup)){
        //if active group isnt passed to directive
        vm.activeGroup = vm.groups[0].name;
      }

      var traffic = _.findWhere(metricConstants.metrics, { kpi: 'traffic'});

      trafficDisplayName = traffic.displayName;
    }

    function selectMetric(metric) {
      if( ObjectUtils.isNullOrUndefined(vm.selectedMetrics)){
        vm.selectedMetrics = {};
        vm.selectedMetrics[metric] = true;
        return;
      }

      if (ObjectUtils.isNullOrUndefined(vm.maxLength)){
        //default to unlimited selection
        vm.selectedMetrics[metric] = !vm.selectedMetrics[metric];
      } else {

        var selected = _.keys(
          _.pick(vm.selectedMetrics, function(value) {
            return value === true;})
          );

        if(selected.length < vm.maxLength || vm.selectedMetrics[metric] === true){
            vm.selectedMetrics[metric] = !vm.selectedMetrics[metric];
        }
      }
    }

    function setActiveGroup(group) {
      if(vm.activeGroup === group) {
        return;
      }

      vm.selectedMetrics = {};
      vm.activeGroup = group;
      if(group === 'interior') {
        _.each(vm.metrics, function(metric) {
          if(metric.kpi === 'traffic') {
            $translate('csvExportView.VISITORBEHAVIOR').then(function(translation) {
              var metricName;

              if(!_.isUndefined(trafficDisplayName)) {
                metricName = trafficDisplayName.toLowerCase();
              } else {
                metricName = metric.kpi.toLowerCase();
              }

              metric.displayName = translation + ' ' + metricName;
            });
          }
        });
      }
      if(group === 'perimeter') {
        _.each(vm.metrics, function(metric) {
          if(metric.kpi === 'traffic') {
            if(!_.isUndefined(trafficDisplayName)) {
              metric.displayName = trafficDisplayName;
            } else {
              metric.displayName = $filter('translate')(metric.translationLabel);
            }
          }
        });
      }
    }
  }
})();
