'use strict';

describe('daySelector', function () {

  var $compile, $scope, LocalizationService, ObjectUtils;
  var $httpBackend;

  beforeEach(module('shopperTrak'));

  beforeEach(module(function ($provide) {
    $provide.factory('LocalizationService', getMockLocalizationService);
  }));

  beforeEach(inject(putTemplateToTemplateCache));

  beforeEach(inject(function ($rootScope,
    _$compile_,
    _ObjectUtils_,
    _LocalizationService_,
    _$httpBackend_) {
    $compile = _$compile_;
    $scope = $rootScope.$new();
    ObjectUtils = _ObjectUtils_;
    LocalizationService = _LocalizationService_;
    $httpBackend = _$httpBackend_;
    $httpBackend.whenGET('l10n/languages/en_US.json').respond({});
  }));

  describe('populateDayOptions', function() {

    it('should add "all days" to the top of the available day options', function() {
      var daySelector = renderDirectiveAndDigest();

      expect(daySelector.dayOptions[0].key).toBe('all');
    });

    it('should add "weekends" as the second option in the available day options list', function() {
      var daySelector = renderDirectiveAndDigest();

      expect(daySelector.dayOptions[1].key).toBe('weekends');
    });

    it('should add the days of the week in the organizations day of week order', function() {
      var daySelector = renderDirectiveAndDigest();

      expect(daySelector.dayOptions[2].key).toBe('mon');
      expect(daySelector.dayOptions[3].key).toBe('tue');
      expect(daySelector.dayOptions[4].key).toBe('wed');
      expect(daySelector.dayOptions[5].key).toBe('thu');
      expect(daySelector.dayOptions[6].key).toBe('fri');
      expect(daySelector.dayOptions[7].key).toBe('sat');
      expect(daySelector.dayOptions[8].key).toBe('sun');
    });

    it('should set the transkeys for the day options', function() {
      var daySelector = renderDirectiveAndDigest();

      expect(daySelector.dayOptions[0].transkey).toBe('daySelector.ALLDAYS');
      expect(daySelector.dayOptions[1].transkey).toBe('daySelector.WEEKENDS');
      expect(daySelector.dayOptions[2].transkey).toBe('weekdaysLong.mon');
      expect(daySelector.dayOptions[3].transkey).toBe('weekdaysLong.tue');
      expect(daySelector.dayOptions[4].transkey).toBe('weekdaysLong.wed');
      expect(daySelector.dayOptions[5].transkey).toBe('weekdaysLong.thu');
      expect(daySelector.dayOptions[6].transkey).toBe('weekdaysLong.fri');
      expect(daySelector.dayOptions[7].transkey).toBe('weekdaysLong.sat');
      expect(daySelector.dayOptions[8].transkey).toBe('weekdaysLong.sun');
    });

  });

  describe('unorderedSelectedDaysChanged', function() {
    it('should set a single day to selected if it gets selected', function() {
      var daySelector = renderDirectiveAndDigest();

      daySelector.unorderedDaySelection = [{key: 'mon'}];
      $scope.$digest();

      // This is to get around the first change check
      daySelector.unorderedDaySelection = [{key: 'mon'}];
      $scope.$digest();

      expect(daySelector.selectedDays.length).toBe(1);

      expect(daySelector.selectedDays[0].key).toBe('mon');
    });

    it('should set all days as selected on first load if there are no selected days supplied', function() {
      var daySelector = renderDirectiveAndDigest();

      expect(daySelector.selectedDays.length).toBe(7);

      expect(daySelector.selectedDays[0].key).toBe('mon');
      expect(daySelector.selectedDays[1].key).toBe('tue');
      expect(daySelector.selectedDays[2].key).toBe('wed');
      expect(daySelector.selectedDays[3].key).toBe('thu');
      expect(daySelector.selectedDays[4].key).toBe('fri');
      expect(daySelector.selectedDays[5].key).toBe('sat');
      expect(daySelector.selectedDays[6].key).toBe('sun');
    });

    it('should set all days to selected if the all days option gets selected ', function() {
      var daySelector = renderDirectiveAndDigest();

      daySelector.unorderedDaySelection = [{key: 'mon'}];
      $scope.$digest();

      // This is to get around the first change check
      daySelector.unorderedDaySelection = [{key: 'mon'}];
      $scope.$digest();

      expect(daySelector.selectedDays.length).toBe(1);

      // Now set the selection back to all
      daySelector.unorderedDaySelection = [{key: 'all'}];
      $scope.$digest();

      expect(daySelector.selectedDays.length).toBe(7);

      expect(daySelector.selectedDays[0].key).toBe('mon');
      expect(daySelector.selectedDays[1].key).toBe('tue');
      expect(daySelector.selectedDays[2].key).toBe('wed');
      expect(daySelector.selectedDays[3].key).toBe('thu');
      expect(daySelector.selectedDays[4].key).toBe('fri');
      expect(daySelector.selectedDays[5].key).toBe('sat');
      expect(daySelector.selectedDays[6].key).toBe('sun');
    });

    it('should set saturday and sunday as selected if the weekends option gets selected ', function() {
      var daySelector = renderDirectiveAndDigest();

      daySelector.unorderedDaySelection = [{key: 'mon'}];
      $scope.$digest();

      // This is to get around the first change check
      daySelector.unorderedDaySelection = [{key: 'weekends'}];
      $scope.$digest();

      expect(daySelector.selectedDays.length).toBe(2);
      expect(daySelector.selectedDays[0].key).toBe('sat');
      expect(daySelector.selectedDays[1].key).toBe('sun');
    });

    it('should not unselect the all option if no other days are selected', function() {
      var daySelector = renderDirectiveAndDigest();

      daySelector.unorderedDaySelection = [{key: 'all'}];
      $scope.$digest();

      daySelector.toggleSelectionById = function(id) { };

      spyOn(daySelector, 'toggleSelectionById');

      daySelector.unorderedDaySelection = [];
      $scope.$digest();

      expect(daySelector.toggleSelectionById).not.toHaveBeenCalledWith('all');
    });
  });

  function renderDirectiveAndDigest() {
    var element = createDirectiveElement();
    $compile(element)($scope);
    $scope.$digest();
    var vm = element.isolateScope().vm;
    return vm;
  }

  function getMockLocalizationService() {
    return {
      getCurrentOrganizationDaysOfWeek: function() {
        return ['mon','tue','wed','thu','fri','sat','sun'];
      }
    }
  }

  function createDirectiveElement() {
    return angular.element(
      '<day-selector ' +
      'selected-days="selectedDays" ' +
      '  </day-selector>'
    );
  }

  function putTemplateToTemplateCache($templateCache) {
    // Put an empty template to the template cache to prevent Angular from
    // trying to fetch it. We are only testing the controller here, so the
    // actual template is not needed.
    $templateCache.put(
      'components/day-selector/day-selector.partial.html',
      '<div></div>'
    );
  }

});
