(function() {
  'use strict';

  angular.module('shopperTrak')
    .directive('daySelector', daySelector);

  function daySelector() {
    return {
      restrict: 'E',
      templateUrl: 'components/day-selector/day-selector.partial.html',
      scope: {
        selectedDays: '=',
        includeHours: '=?',
        selectedMetric: '=?',
        isSingleDaySelected: '=?'
      },
      bindToController: true,
      controller: daySelectorController,
      controllerAs: 'vm'
    };
  }

  daySelectorController.$inject = [
    '$scope',
    'LocalizationService',
    'ObjectUtils'
  ];

  function daySelectorController($scope, LocalizationService, ObjectUtils) {
    var vm = this;
    vm.trueVal = true;

    activate();

    function activate() {
      populateDayOptions();
      configureWatches();

      if(!ObjectUtils.isNullOrUndefinedOrEmpty(vm.selectedDays)) {
        selectDays(vm.selectedDays);
      } else if(ObjectUtils.isNullOrUndefined(vm.unorderedDaySelection)) {
        selectAllDays();
      }
    }

    function selectDays(daysToSelect) {
      if(daysToSelect.length === 7) {
        selectAllDays();
        return;
      }

      var tempDays = [];

      _.each(daysToSelect, function(dayToSelect) {
        var search = {key: dayToSelect.key};

        var day = _.findWhere(vm.dayOptions, search);

        tempDays.push(day);
      });

      vm.unorderedDaySelection = tempDays;
    }

    function selectAllDays() {
      vm.unorderedDaySelection = [];
      var defaultIndex = 0;

      if(vm.includeHours === true) {
        defaultIndex = 1;

        if(vm.isSingleDaySelected === true) {
          defaultIndex = 0; // There is only "day" option, so we need to select the first
        }
      }

      vm.unorderedDaySelection.push(vm.dayOptions[defaultIndex]);
    }

    function populateDayOptions() {
      var daysOfWeek = LocalizationService.getCurrentOrganizationDaysOfWeek();

      var dayOptions = [];

      if(vm.includeHours === true) {
        dayOptions.push({ key: 'hours', transkey: 'daySelector.HOURS', selectionType: 'single'});

        if(vm.isSingleDaySelected === true) {
          vm.dayOptions = dayOptions;
          return;
        }
      }

      dayOptions.push({ key: 'all', transkey: 'daySelector.ALLDAYS', selectionType: 'single'});
      dayOptions.push({ key: 'weekends', transkey: 'daySelector.WEEKENDS', selectionType: 'multiple'});

      _.each(daysOfWeek, function(weekdayLabel) {
        var dayOption = {
          key: weekdayLabel,
          transkey: 'weekdaysLong.' + weekdayLabel,
          selectionType: 'multiple'
        };

        dayOptions.push(dayOption);
      });
      vm.dayOptions = angular.copy(dayOptions);
      vm.dayoptions2 = angular.copy(dayOptions)
    }

    function configureWatches() {
      var unbindUnorderedDaySelectionWatch = $scope.$watchGroup(['vm.unorderedDaySelection', 'vm.selectedMetric'], function() {
        vm.selectedDays = getOrderedDays();
      });

      $scope.$on('$destroy', function() {
        if(typeof unbindUnorderedDaySelectionWatch === 'function') {
          unbindUnorderedDaySelectionWatch();
        }
      });
    }

    function getOrderedDays() {
      var orderedSelectedDays = [];

      _.each(vm.dayOptions, function(dayOption) {

        if(dayOption.key === 'all' || dayOption.key === 'weekends' || (dayOption.key === 'hours' && vm.isSingleDaySelected !== true)) {
          return;
        }

        _.each(vm.unorderedDaySelection, function(selectedDay) {
          if(selectedDay.key === 'all') {
            orderedSelectedDays.push(angular.copy(dayOption));
            return;
          }

          if(selectedDay.key === 'weekends') {
            if(isWeekend(dayOption) && !isSelected(selectedDay, orderedSelectedDays)) {
              orderedSelectedDays.push(angular.copy(dayOption));
            }
            return;
          }

          if(selectedDay.key === 'hours' && orderedSelectedDays.length !== 1) {
            orderedSelectedDays.push(angular.copy(selectedDay));
            return;
          }

          if(dayOption.key === selectedDay.key && !isSelected(selectedDay, orderedSelectedDays)) {
            orderedSelectedDays.push(angular.copy(dayOption));
          }
        });
      });

      return orderedSelectedDays;
    }

    function isSelected(day, selectedDays) {
      var search = {
        key: day.key
      };

      var selection = _.findWhere(selectedDays, search);

      return typeof selection === 'object';
    }

    function isWeekend(day) {
      return day.key === 'sat' || day.key === 'sun';
    }
  }

})();
