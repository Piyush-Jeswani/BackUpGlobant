'use strict';

describe('summaryWidget', function () {  

  var $compile, $scope

  var start_date = '2015-03-22';
  var end_date = '2015-03-28';
  var dateRangeKey = moment(start_date).format('x') + '_' + moment(end_date).endOf('day').format('x');

  beforeEach(module('shopperTrak'));

  beforeEach(inject(putTemplateToTemplateCache));

  beforeEach(inject(function ($rootScope,
    _$compile_) {
    $compile = _$compile_;
    $scope = $rootScope.$new();

    var dateFormat = 'DD-MM-YYYY';
    $scope.dateRangeStart = moment('29-10-2017', dateFormat);
    $scope.dateRangeEnd = moment('04-11-2017', dateFormat);
    $scope.compareRange1Start = moment('22-10-2017', dateFormat);
    $scope.compareRange1End = moment('28-10-2017', dateFormat);
    $scope.compareRange2Start = moment('30-10-2016', dateFormat);
    $scope.compareRange2End = moment('05-11-2016', dateFormat);
  }));

  describe('activate', function() {
    it('should call activate() function of directive with calculateAverages true and widgetData set', function() {
        $scope.calculateAverages = true;
        $scope.widgetData = {};
        var vm = renderDirectiveAndDigest();
        expect($scope.returnDataPrecision).toBe(0);
        expect($scope.numberFormatName).toBe(undefined);
        expect($scope.multiplier).toBe(1);
        expect($scope.selectedTags).toEqual([]);
        expect($scope.isLoading).toBe(true);
        expect($scope.showAverages).toBe(undefined);
        expect($scope.widgetData).toEqual({});
        expect($scope.calculateAverages).toBe(true);
    });
  });

  describe('activate', function() {
    it('should call activate() function of directive with calculateAverages false', function() {
      $scope.calculateAverages = false;
      $scope.widgetData = {};      
      var vm = renderDirectiveAndDigest();
      expect($scope.returnDataPrecision).toBe(0);
      expect($scope.numberFormatName).toBe(undefined);
      expect($scope.multiplier).toBe(1);
      expect($scope.selectedTags).toEqual([]);
      expect($scope.isLoading).toBe(true);
      expect($scope.showAverages).toBe(undefined);
      expect($scope.widgetData).toEqual({});
      expect($scope.calculateAverages).toBe(false);
    });
  });

  describe('activate', function() {
    it('should call activate() function of directive with site id, zone id and location id set with operating hours with no widgetData', function() {
      $scope.siteId = 100;
      $scope.zoneId = 100;
      $scope.locationId = 100;
      $scope.operatingHours = true;  
      var vm = renderDirectiveAndDigest();
      expect($scope.returnDataPrecision).toBe(0);
      expect($scope.numberFormatName).toBe(undefined);
      expect($scope.multiplier).toBe(1);
      expect($scope.selectedTags).toEqual([]);
      expect($scope.isLoading).toBe(false);
      expect($scope.showAverages).toBe(undefined);
      expect($scope.siteId).toBe(100);   
      expect($scope.zoneId).toBe(100);
      expect($scope.locationId).toBe(100);       
    });
  });

  function renderDirectiveAndDigest() {
    var element = createDirectiveElement();
    $compile(element)($scope);
    $scope.$digest();
    return element.isolateScope().vm;
  }

  function createDirectiveElement() {
    return angular.element(
      '<summary-widget ' +
      'org-id="1234" ' +
      'site-id="siteId" ' +
      'zone-id="zoneId" ' +
      'location-id="locationId" ' +
      'selected-tags="selectedTags" ' + 
      'return-data-precision="returnDataPrecision" ' +   
      'calculate-averages="calculateAverages" ' +    
      'widget-data="widgetData" ' + 
      'date-range-start="dateRangeStart" ' +
      'date-range-end="dateRangeEnd" ' +
      'compare-range-1-start="compareRange1Start" ' +
      'compare-range-1-end="compareRange1End" ' +
      'compare-range-2-start="compareRange2Start" ' +
      'compare-range-2-end="compareRange2End" ' +
      'operating-hours="operatingHours" ' +
      'multiplier="multiplier" ' +   
      'is-loading="isLoading" ' +      
      '></summary-widget>'
    );
  }

  function putTemplateToTemplateCache($templateCache) {
    // Put an empty template to the template cache to prevent Angular from
    // trying to fetch it. We are only testing the controller here, so the
    // actual template is not needed.
    $templateCache.put(
      'components/widgets/summary-widgets/summary-widget.partial.html',
      '<div></div>'
    );
  }

});