'use strict';
describe('Widget libray graph factory', function () {
  var $window, objectUtils, metricConstants, widgetLibraryGraphFactory;
  beforeEach(module('shopperTrak'));
  beforeEach(module('shopperTrak.httpRequests'));
  describe('graph requests', function () {
    beforeEach(inject(function (_$window_, _ObjectUtils_, _metricConstants_, _widgetLibraryGraphFactory_) {
      $window = _$window_;
      objectUtils = _ObjectUtils_;
      metricConstants = _metricConstants_;
      widgetLibraryGraphFactory = _widgetLibraryGraphFactory_;
    }));

    it('transform chart data', function () {
      var dateRange = {
        start: '01/09/2017',
        end: '31/09/2017'
      };
      var orgMock = {
        organization_id: 1234,
        name: 'Test Org 1',
        portal_settings: 'test',
        subscriptions: {}
      };
      var localizationOptions = {
        dateFormat:'MM/DD/YYYY'
      }
      var currentUserMock = {
        localization: { date_format: 'MM/DD/YYYY' }
      };
      // Arrange
      var metricList = [{
          kpi: 'sales',
          groupBy: 'week',
          dateRange: {
            start: '01/09/2017',
            end: '31/09/2017'
          }
        },
        {
          kpi: 'sales',
          groupBy: 'week',
          dateRange: {
            start: '01/09/2017',
            end: '31/09/2017'
          }
        }];

        var responses =
        [
           {conversion: '12%', period_start_date: '12/08/2017'},
           {conversion: '17%', period_start_date: '13/08/2017'},
           {conversion: '62%', period_start_date: '14/08/2017'},
           {conversion: '52%', period_start_date: '15/08/2017'},
           {conversion: '92%', period_start_date: '16/08/2017'},
        ];
      // Act
      var vm = {
        selectedOrg : {
          metric_labels : {
            sales: 'sales'
          }
        }
      };
      var configResult = widgetLibraryGraphFactory.transformChartData(responses, metricList, currentUserMock, orgMock, localizationOptions, 'Hour', dateRange,vm);

      // Assert
      expect(configResult.options.chart.zoomType).toEqual('xy');
    });
  });
});
