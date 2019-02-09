(function() {
  'use strict';

  angular.module('shopperTrak')
    .directive('metricSelector', metricSelector);

  function metricSelector() {
    return {
      restrict: 'E',
      templateUrl: 'components/metric-selector/metric-selector.partial.html',
      scope: {
        selectedMetrics: '=',
        metrics: '=',
        maxLength: '=?',
        minLength: '=?',
        idProperty: '=?',
        titleProperty: '@',
        hideButtonTitle: '=?',
        showListTitle: '=?',
        listTitle: '=?',
        placeholder: '=?',
        btnTooltip: '=?',
        title: '=?',
        buttonIcon: '=?',
        disabled:          '=?'
      },
      bindToController: true,
      controller: metricSelectorController,
      controllerAs: 'vm'
    };
  }

  metricSelectorController.$inject = [
    '$scope',
    'LocalizationService',
    'ObjectUtils'
  ];

  function metricSelectorController($scope, LocalizationService, ObjectUtils) {
    var vm = this;
    vm.trueVal = true;
    var isFirstLoad = true;

    activate();

    function activate() {
      if(ObjectUtils.isNullOrUndefinedOrBlank(vm.titleProperty)) {
        vm.titleProperty = 'shortTranslationLabel';
      }
      if(ObjectUtils.isNullOrUndefinedOrBlank(vm.idProperty)) {
        vm.idProperty = 'key';
      }
      if(ObjectUtils.isNullOrUndefinedOrBlank(vm.placeholder)) {
        vm.placeholder = 'metricSelector.SELECTMETRIC';
      }
      if (ObjectUtils.isNullOrUndefined(vm.minLength)) {
        vm.minLength = 1;
      }
      if (ObjectUtils.isNullOrUndefined(vm.maxLength)) {
        vm.maxLength = 3;
      }
      populateOptions();
      configureWatches();
    }

    function populateOptions() {

      var options = [];

      _.each(vm.metrics, function(metric) {
        options.push(metric);
      });

      vm.metrics = options;
      if (!ObjectUtils.isNullOrUndefinedOrEmpty(vm.selectedMetrics)) {
        vm.unOrderedSelectedMetrics = vm.selectedMetrics;
      }
    }

    function unorderedSelectedMetricsChanged(newSelection) {
      if (ObjectUtils.isNullOrUndefined(newSelection)) {
        return;
      }

      if (!allOptionIsSelected(newSelection)) {
        return;
      }

      if (allOptionIsSelected(newSelection) && newSelection.length > 1) {
        unSelectAllOption();
      }
    }

    function configureWatches() {
      var unbindUnorderedMetricSelectionWatch = $scope.$watch('vm.unOrderedSelectedMetrics', function(newSelection) {
        unorderedSelectedMetricsChanged(newSelection);
        if (!ObjectUtils.isNullOrUndefined(vm.unOrderedSelectedMetrics) && isFirstLoad) {
          isFirstLoad = false;
        }
        vm.selectedMetrics = getOrderedMetrics();
      });

      $scope.$on('$destroy', function() {
        if (typeof unbindUnorderedMetricSelectionWatch === 'function') {
          unbindUnorderedMetricSelectionWatch();
        }
      });
    }

    function getOrderedMetrics() {
      var orderedSelectedMetrics = [];

      _.each(vm.unOrderedSelectedMetrics, function(selectedMetric) {
        if (selectedMetric.key === 'all') {
          orderedSelectedMetrics.push(selectedMetric);
          return;
        }

        if (!isSelected(selectedMetric, orderedSelectedMetrics)) {
          orderedSelectedMetrics.push(selectedMetric);
        }
      });

      if (ObjectUtils.isNullOrUndefinedOrEmpty(orderedSelectedMetrics)) {
        return vm.unOrderedSelectedMetrics;
      }

      return orderedSelectedMetrics;
    }

    function isSelected(option, options) {
      var search = {
        key: option.key
      };

      var selection = _.findWhere(options, search);

      return typeof selection === 'object';
    }

    function allOptionIsSelected(selections) {
      var allOption = _.findWhere(selections, {
        key: 'all'
      });

      return !ObjectUtils.isNullOrUndefined(allOption);
    }

    function unSelectAllOption() {
      vm.toggleSelectionById('all');
    }
  }

})();
