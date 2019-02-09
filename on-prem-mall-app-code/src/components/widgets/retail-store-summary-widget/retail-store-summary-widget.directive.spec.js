'use strict';

describe('retailStoreSummaryWidgetDirective', function() {
  var $scope;
  var $compile;
  var reportMockupData;
  var $httpBackend;
  var dateRangeKey;
  var $filter;
  var $timeout;

  var orgSitesMock =
    [{
      'site_id': 1,
      'organization': {
        'id': 1,
        'name': 'Test Org'
      },
      'name': 'Foo\'s Bar',
    },
    {
      'site_id': 2,
      'organization': {
        'id': 1,
        'name': 'Test Org'
      },
      'name': 'Foo\'s Store',
    },
    {
      'site_id': 3,
      'organization': {
        'id': 1,
        'name': 'Test Org'
      },
      'name': 'Foo\'s Shop',
    }];

  var constants = {
    defaults: {
      options: {
        credits: {
          enabled: false
        },
        exporting: {
          enabled: false
        },
        colors: ['#0aaaff'],
        yAxis: {
          gridLineWidth: 1,
          lineWidth: 0,
          minorGridLineWidth: 0,
          gridLineColor: '#bbbbbb',
          reversed: false,
          minRange: 1,
          tickWidth: 0,
          tickAmount: 3,
          tickPositions: [0,0,0],
          tickColor: '#bbbbbb',
          plotLines: [{
            color: '#bbbbbb',
            dashStyle: 'ShortDot',
            width: 0,
            value: 0,
            zIndex: 2
          }],
          labels: {
            enabled: false
          }
        },
        xAxis: {
          gridLineWidth: 1,
          lineWidth: 0,
          minorGridLineWidth: 0,
          gridLineColor: '#bbbbbb',
          reversed: false,
          minRange: 1,
          tickWidth: 0,
          tickAmount: 3,
          tickPositions: [0,0,0],
          tickColor: '#bbbbbb',
          plotLines: [{
            color: '#bbbbbb',
            dashStyle: 'ShortDot',
            width: 0,
            value: 0,
            zIndex: 2
          }],
          labels: {
            enabled: false
          }
        },
        legend: {
          enabled: false
        }
      },
      title: {
         text: ''
      },
      xAxis: {
        title: {
            enabled: true,
            text: 'Average daily traffic',
            style: {
              fontWeight: 'bold',
              textTransform: 'uppercase',
              fontFamily: 'Source Sans Pro'
            }
        },
        startOnTick: true,
        endOnTick: true,
        showLastLabel: true,
      },
      yAxis: {
        title: {
            text: 'Conversion',
            style: {
              fontWeight: 'bold',
              textTransform: 'uppercase',
              fontFamily: 'Source Sans Pro'
            }
        },
        startOnTick: true,
        endOnTick: true,
        showLastLabel: true,
      },
      plotOptions: {
        scatter: {
          marker: {
            symbol: 'circle'
          }
        }
      }
    }
  }

  var mockRetailOrganizationSummaryData = {
      getDateRangeKey : function() { return dateRangeKey; },
      fetchReportData : function(){}
  };

  beforeEach(module('shopperTrak', function($translateProvider) {
    $translateProvider.translations('en_US', {});
  }));

  beforeEach(module('shopperTrak.widgets'));
  beforeEach(module('shopperTrak.filters'));

  beforeEach(module(function($provide) {
    $provide.value('retailOrganizationSummaryData', mockRetailOrganizationSummaryData);
    $provide.constant('retailStoreSummaryWidgetConstants', constants);

    var localStorageService = {
      set: function(key, value) { },
      get: function(key) {
        return undefined;
      },
      keys: function() {
        return [];
      }
    };

    $provide.value('localStorageService', localStorageService);
  }));
  beforeEach(inject(function($rootScope, $templateCache, _$compile_, _$httpBackend_, _$filter_, _$timeout_) {
    $scope = $rootScope.$new();
    $compile = _$compile_;
    $httpBackend = _$httpBackend_;
    $filter = _$filter_;
    $timeout =  _$timeout_;

    var start_date = '2015-03-22';
    var end_date = '2015-03-28';
    dateRangeKey = moment(start_date).format('x') + '_' + moment(end_date).endOf('day').format('x');

    reportMockupData = {};
    reportMockupData[dateRangeKey] = [{
        'org_id':1,
        'period_end_date':'2015-03-28',
        'period_start_date':'2015-03-22',
        'site_id':1,
        'star':0,
        'traffic':1000,
        'conversion': 15,
        'dwelltime': null,
        'sales':500,
    },
    {
        'org_id':1,
        'period_end_date':'2015-03-28',
        'period_start_date':'2015-03-22',
        'site_id':2,
        'star':0,
        'traffic':2000,
        'conversion': 5,
        'dwelltime': null,
        'sales':250,
    },
    {
        'org_id':1,
        'period_end_date':'2015-03-28',
        'period_start_date':'2015-03-22',
        'site_id':3,
        'star':0,
        'traffic':1500,
        'conversion': 10,
        'dwelltime': null,
        'sales':1000,
    }];

    $templateCache.put(
      'components/widgets/retail-store-summary-widget/retail-store-summary-widget.partial.html',
      '<div></div>'
    );

    var organization = {
      subscriptions: {
        sales: true
      }
    };

    $httpBackend.whenGET('https://rdc-api-staging.shoppertrak.com/api/v1/organizations').respond(organization);
  }));

  describe('toggleExtremes', function() {
    it('should include extremes when checkbox is checked (toggled)', function() {
      var controller = renderDirectiveAndDigest();
      controller.orgSites = orgSitesMock;
      controller.widgetData = reportMockupData;
      controller.extremeToggle = {
        checkbox: true
      };
      controller.toggleExtremes();
      expect(controller.includeExtremes).toBe(true);
    });
  });

  describe('countTotals', function() {
    it('should return correct totals for data', function() {
      var controller = renderDirectiveAndDigest();
      controller.orgSites = orgSitesMock;
      controller.widgetData = reportMockupData;
      controller.includeExtremes = true;
      var data = controller.transformData(reportMockupData[dateRangeKey]);
      var totals = controller.countTotals(data);
      expect(Object.keys(totals)).toContain('x');
      expect(Object.keys(totals)).toContain('y');
      expect(totals.x).toBe(4500);
      expect(totals.y).toBe(30);
    });
  });

  describe('calculateAverages', function() {
    it('should return correct averages for data', function() {
      var controller = renderDirectiveAndDigest();
      controller.orgSites = orgSitesMock;
      controller.widgetData = reportMockupData;
      controller.includeExtremes = true;
      var data = controller.transformData(reportMockupData[dateRangeKey]);
      var totals = controller.countTotals(data);
      var averages = controller.calculateAverages(data, totals);
      expect(Object.keys(averages)).toContain('x');
      expect(Object.keys(averages)).toContain('y');
      expect(averages.x).toBe(1500);
      expect(averages.y).toBe(10);
    });
  });

  function renderDirectiveAndDigest() {
    var element = angular.element(
      '<retail-store-summary-widget' +
      '  org-sites="{}"'+
      '  date-range-start="2015-03-22"'+
      '  date-range-end="2015-03-28"'+
      '  on-export-click="true"'+
      '  export-is-disabled="true"'+
      '  site-categories="foo"'+
      '  selected-category="bar"'+
      '  selected-tags="{}"'+
      '  filter-text="" ' +
      '  widget-data="{}"' +
      '  categories="[]"' +
      '>' +
      '</retail-store-summary-widget>'
    );

    $compile(element)($scope);
    $scope.$digest();

    return element.controller('retailStoreSummaryWidget');
  }

});
