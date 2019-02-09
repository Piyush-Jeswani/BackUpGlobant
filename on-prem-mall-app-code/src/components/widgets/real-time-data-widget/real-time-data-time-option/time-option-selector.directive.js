(function() {
  'use strict';

  angular.module('shopperTrak')
    .directive('timeOptionSelector', timeOptionSelector);

  function timeOptionSelector() {
    return {
      restrict: 'E',
      templateUrl: 'components/widgets/real-time-data-widget/real-time-data-time-option/time-option-selector.partial.html',
      scope: {
        selectedOption:  '=',
        options: '='
      },
      bindToController: true,
      controller: timeOptionSelectorController,
      controllerAs: 'vm'
    };
  }

  timeOptionSelectorController.$inject = [
    '$scope',
    'LocalizationService',
    'ObjectUtils'
  ];

  function timeOptionSelectorController($scope, LocalizationService, ObjectUtils) {
    var vm = this;
    vm.trueVal = true;
    vm.select = select;
    vm.toggle = toggle;
    vm.close = close;

    activate();

    function activate() {
      vm.isOpen = false;
      if(!ObjectUtils.isNullOrUndefinedOrEmpty(vm.options)) {
        populateOptions();
      }
      vm.titleProperty = 'realTimeOptions.devideby';
    }

    function populateOptions() {
      var options = [];
      options.push({
        id: '1hour',
        transKey:'realTimeOptions.hourOption'
      });

      options.push({
        id: '15minute',
        transKey:'realTimeOptions.15minuteOption'
      });

      vm.options = options;
      vm.selectedOption = options[0];
    }

    function select(item) {
      vm.selectedOption = item;
    }

     function toggle() {
      vm.isOpen = !vm.isOpen;
    }

    function close() {
      vm.isOpen = false;
    }


  }

})();
