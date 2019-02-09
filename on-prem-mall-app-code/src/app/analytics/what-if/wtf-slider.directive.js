(function () {
  'use strict';

  angular.module('shopperTrak')
    .directive('wtfSlider', wtfSlider);

  function wtfSlider() {
    return {
      restrict: 'E',
      template: '<div ng-if="vm.param.status" class="slider-container"> \
                  <div class="prior-year"  ng-if="vm.param.priorYear"> \
                    <rzslider ng-if="!vm.isRefreshing" rz-slider-model="vm.param.priorYear" rz-slider-options="::vm.comparisonScale.options" /> \
                  </div> \
                  <div class="prior-period"  ng-if="vm.param.priorPeriod"> \
                    <rzslider ng-if="!vm.isRefreshing" rz-slider-model="vm.param.priorPeriod" rz-slider-options="::vm.comparisonScale.options" /> \
                  </div> \
                  <rzslider ng-if="!vm.isRefreshing" rz-slider-model="vm.param.val" rz-slider-options="::vm.slider.options" /> \
                </div>',
      scope: {
        param: '=',
        onChange: '&',
        onFocus: '&',
      },
      bindToController: true,
      controller: WtfSliderController,
      controllerAs: 'vm'
    };
  }

  WtfSliderController.$inject = [
    '$scope',
    '$timeout',
    '$filter'
  ];

  function WtfSliderController($scope, $timeout, $filter) {

    var vm = this;
    var isEditing = false;

    activate();

    function activate() {

      vm.comparisonScale = {
        options: {
          ceil: vm.param.max || 450.00,
          floor: 0,
          readOnly: true,
          translate: function() {
            return '';
          }
        }
      };

      vm.slider = {
        options: {
          onStart: setFocus,
          onEnd: endEdit,
          disabled: vm.param.hold,
          floor: 0.00,
          ceil: vm.param.max || 450.00,
          step: 0.01,
          translate: function(value) {
            if(value === Infinity) {
              return '';
            }
            if(vm.param.isCurrency) {
              return $filter('formatCurrency')(value, vm.param.prefixSymbol);
            }
            else if (vm.param.suffixSymbol !== null) {
              return $filter('formatNumber')(value, vm.param.precision) + vm.param.suffixSymbol;
            }
            else {
              return $filter('formatNumber')(value, vm.param.precision);
            }
          },
          precision: 2,
        }
      };

      var watcherFn = $scope.$watchGroup(
        [
          'vm.param.hold',
          'vm.param.min',
          'vm.param.max'
        ], function() {
          if(isEditing) {
            return;
          }

          if(!_.isUndefined(vm.param.status)) {
            updateSliderState();
          }

        }
      );

      $scope.$on('$destroy', function() {
        watcherFn();
      });


    }

    function setFocus() {
      isEditing = true;
      vm.onFocus();
    }

    function endEdit() {
      isEditing = false;
    }

    function updateSliderState() {
      //trying to get around chnging slider state =))
      vm.isRefreshing = true;
      var _sliderParams = vm.slider.options || {};
      var _compareParams = vm.comparisonScale.options || {};

      _sliderParams.disabled = vm.param.hold;
      _sliderParams.floor = vm.param.min;
      _sliderParams.ceil = vm.param.max;

      _compareParams.disabled = vm.param.hold;
      _compareParams.floor = vm.param.min;
      _compareParams.ceil = vm.param.max;

      vm.slider = {};
      vm.comparisonScale = {};

      $timeout(function () {
        vm.slider.options = _sliderParams;
        vm.comparisonScale.options = _compareParams;
        vm.isRefreshing = false;
      });
    }

  }

})();
