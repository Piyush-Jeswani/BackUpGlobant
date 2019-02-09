'use strict';

describe('currentSalesCategoryService', function () {

  var currentSalesCategoryService;

  beforeEach(module('shopperTrak'));

  beforeEach(inject(function (_currentSalesCategoryService_) {
    currentSalesCategoryService = _currentSalesCategoryService_;
  }));

  it('should test storage and retrieval of sales categories per widget', function () {
    var salesCategoriesKPISummaryWidget = [{name: "Bill Payment", id: 793, selected: true}];
    var salesCategoriesDailyPerfIndWidget = [{name: "Activation", id: 787, selected: true}];

    currentSalesCategoryService.storeSelection('kpi-summary-widget', salesCategoriesKPISummaryWidget);
    currentSalesCategoryService.storeSelection('daily-performance-widget', salesCategoriesDailyPerfIndWidget);

    // defined above.
    var resultA = currentSalesCategoryService.readSelection('kpi-summary-widget');

    // defined above.
    var resultB = currentSalesCategoryService.readSelection('daily-performance-widget');

    // undefined i.e. not set above so not available in the service.
    var resultC = currentSalesCategoryService.readSelection('power-hours-widget');

    expect(resultA).toEqual(salesCategoriesKPISummaryWidget);
    expect(resultB).toEqual(salesCategoriesDailyPerfIndWidget);
    expect(resultC).toEqual(undefined);
  });
});
