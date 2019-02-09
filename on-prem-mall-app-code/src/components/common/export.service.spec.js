'use strict';

describe('ExportService', function() {


  var ExportService;
  var $httpBackend;
  var apiUrl;
  var $rootScope;
  var userId = 'd5v4fd54f6df4vd5f4gd54f';
  var fakeWindow;

  beforeEach(module(function ($provide) {
    fakeWindow =  {
      ga: function(action, param1, param2) {
        // Do nothing
        angular.noop(action, param1, param2);
      },
      open: function(url) {
        angular.noop(url);
      }
    };

    $provide.value('$window', fakeWindow);
  }));

  beforeEach(function() {
    module('shopperTrak', function($provide, $translateProvider) {
      $provide.constant('httpBatchConfigProvider', {
        getBatchConfig: function (url) {
          return {enabled: false};
        },
        setAllowedBatchEndpoint: function(serviceUrl, batchEndpointUrl, config) {},
        canBatchCall: function (url, method) { return false; },
        calculateBoundary: function () {  },
        $get: [function() {
          return this;
        }]
      });

      $provide.constant('generatePdf', true);

      $translateProvider.translations('en_US', {});

      $provide.factory('authService', function($q) {
        var getCurrentUser = jasmine.createSpy('getCurrentUser').and.callFake(function() {
          return $q.when({ _id: userId });
        });

        return {
          getCurrentUser: getCurrentUser
        };
      });

    });
  });

  beforeEach(inject(function(_$rootScope_, _ExportService_, _apiUrl_, _$httpBackend_, _$timeout_) {
    $rootScope = _$rootScope_;
    ExportService = _ExportService_;
    apiUrl = _apiUrl_;
    $httpBackend = _$httpBackend_;
  }));



  afterEach(function() {
    ExportService.clearExportCart();
  });

  describe('isInExportCart', function() {

    it('should return true if item has been added to cart', function() {

      var areaKey = '2000_1000';
      var dateRange = {
        start: moment.utc('2014-01-01'),
        end:   moment.utc('2014-01-07').endOf('day')
      };
      var compare1Range = {
        start: moment.utc('2013-12-21'),
        end: moment.utc('2013-12-27').endOf('day')
      };
      var compare2Range = {
        start: moment.utc('2013-12-18'),
        end: moment.utc('2013-12-24').endOf('day')
      };
      var metricKey = 'test-metric';
      var dateRangeKey = dateRange.start + ' - ' + dateRange.end + ' - ' +
                         compare1Range.start + ' - ' + compare1Range.end + ' - ' +
                         compare2Range.start + ' - ' + compare2Range.end;

      ExportService.addToExportCartAndStore(areaKey, dateRange, compare1Range, compare2Range, metricKey);

      expect(ExportService.isInExportCart(areaKey, dateRangeKey, metricKey)).toBe(true);

    });

    it('should return false if there are items with the area key but not with the date range', function() {
      var areaKey = '2000_1000';
      var dateRange = {
        start: moment.utc('2014-01-01'),
        end:   moment.utc('2014-01-07').endOf('day')
      };
      var compare1Range = {
        start: moment.utc('2013-12-20'),
        end: moment.utc('2013-12-27').endOf('day')
      };
      var compare2Range = {
        start: moment.utc('2013-12-20'),
        end: moment.utc('2013-12-27').endOf('day')
      };
      var metricKey = 'test-metric';

      ExportService.addToExportCartAndStore(areaKey, dateRange, compare1Range, compare2Range, metricKey);

      // Use a random date range key
      expect(ExportService.isInExportCart(
        areaKey,
        '1388620800000 - 1389225599999 - 1387584000000 - 1388275199999 - 1387584000000 - 1388275199999',
        metricKey)
      ).toBe(false);
    });

    it('should not be able to add to export metric with same key to the cart', function() {
      var exported = addItemToExportCart();
      addItemToExportCart();
      var cart = ExportService.getCart();
      expect(cart[exported.areaKey][exported.dateRangeKey].metrics.length).toBe(1);
    });

  });



  describe('getNumExportsInProgress', function() {

    it('should return 0 if no exports are in progress', function() {

      expect(ExportService.getNumExportsInProgress()).toBe(0);

    });

    it('should return 2 if 2 exports in progress', function() {
      var exportItems = [];

      exportItems.push(addItemToExportCart());
      ExportService.exportCurrentCartToPdf();

      exportItems.push(addItemToExportCart());
      ExportService.exportCurrentCartToPdf();

      expect(ExportService.getNumExportsInProgress()).toBe(2);

    });

  });

  describe('removeFromExportCart', function() {

    it('should remove stuff from export cart', function() {
      expect(ExportService.getCartItemCount()).toBe(0);
      var values = addItemToExportCart();
      expect(ExportService.getCartItemCount()).toBe(1);

      ExportService.removeFromExportCart(values.areaKey, values.dateRangeKey, values.metricKey);

      expect(ExportService.getCartItemCount()).toBe(0);
    });

  });

  describe('getOrgIdFromExportCart', function() {

    it('should be able to retrieve orgId from export cart', function() {
      var combinedDateRange = getTestDateRange();
      var parameter = {
        orgId: 'foo',
        siteId: 'bar',
        locationId: 'foobar',
        dateRange: combinedDateRange.dateRange,
        compare1Range: combinedDateRange.compare1Range,
        compare2Range: combinedDateRange.compare2Range,
        name: 'foo'
      };

      ExportService.createExportAndStore(parameter);
      expect(ExportService.getOrgIdFrom(ExportService.getCart())).toBe('foo');
    });

  });

  describe('addItemToExportCart', function() {

    it('should accept location type parameters', function() {
      var combinedDateRange = getTestDateRange();

      ExportService.addToExportCartAndStore('foobar', combinedDateRange.dateRange, combinedDateRange.compare1Range, combinedDateRange.compare2Range, {name: 'barfoo_bar', location_type: 'corridor'});
      var cartUnderAreaKey = ExportService.getCart().foobar;
      expect(cartUnderAreaKey[Object.keys(cartUnderAreaKey)].metrics[0].location_type).toBe('corridor');
    });

    it('should accept arbitrary parameters', function() {
      var combinedDateRange = getTestDateRange();

      ExportService.addToExportCartAndStore('foo', combinedDateRange.dateRange, combinedDateRange.compare1Range, combinedDateRange.compare2Range, {name: 'foo', location_type: 'bar', foobar: 'barfoo'});
      var cartUnderAreaKey = ExportService.getCart().foo;
      expect(cartUnderAreaKey[Object.keys(cartUnderAreaKey)].metrics[0].foobar).toBe('barfoo');
    });

    it ('should contain multiple locationIds in custom parameter object', function(){
      var combinedDateRange = getTestDateRange();
      var parameter = {
        orgId: 'foo',
        siteId: 'bar',
        locationIds: [ '3380' , '4000'],
        dateRange: combinedDateRange.dateRange,
        compare1Range: combinedDateRange.compare1Range,
        compare2Range: combinedDateRange.compare2Range,
        name: 'foo'
      };

      ExportService.createExportAndStore(parameter);

      var cartUnderAreaKey = ExportService.getCart();
      var cartLocationIds = Object.keys(cartUnderAreaKey);

      expect(cartLocationIds).toEqual(['foo_bar_location_3380,4000']);
    });

    it('should work with only one parameter containing required info', function() {
      var combinedDateRange = getTestDateRange();
      var parameter = {
        orgId: 'foo',
        siteId: 'bar',
        locationId: 'foobar',
        dateRange: combinedDateRange.dateRange,
        compare1Range: combinedDateRange.compare1Range,
        compare2Range: combinedDateRange.compare2Range,
        name: 'foo'
      };

      ExportService.createExportAndStore(parameter);
      var cartUnderAreaKey = ExportService.getCart().foo_bar_location_foobar;
      expect(cartUnderAreaKey[Object.keys(cartUnderAreaKey)].metrics[0].name).toBe('foo');
    });

    it('should work with zone id instead of location id', function() {
      var combinedDateRange = getTestDateRange();
      var parameter = {
        orgId: 'foo',
        siteId: 'bar',
        zoneId: 'foobar',
        dateRange: combinedDateRange.dateRange,
        compare1Range: combinedDateRange.compare1Range,
        compare2Range: combinedDateRange.compare2Range,
        name: 'foo'
      };

      ExportService.createExportAndStore(parameter);
      var cartUnderAreaKey = ExportService.getCart().foo_bar_zone_foobar;
      expect(cartUnderAreaKey[Object.keys(cartUnderAreaKey)].metrics[0].name).toBe('foo');
    });

    it('should be able to sort cart item\'s (metrics)', function() {
      var areaKey = '2000_1000';
      var combinedDateRange = getTestDateRange();

      var firstMetric = { name: 'foobar', location_type: 'corridor', index: 1 };
      var secondMetric = { name: 'barfoo', location_type: 'corridor', index: 2 };

      var cart = ExportService.addToExportCart({}, areaKey, combinedDateRange.dateRange, combinedDateRange.compare1Range, combinedDateRange.compare2Range, firstMetric);
      ExportService.addToExportCart(cart, areaKey, combinedDateRange.dateRange,  combinedDateRange.compare1Range, combinedDateRange.compare2Range, secondMetric);

      var widgets = ExportService.buildMetricListFromExportCart(cart);
      ExportService.sort(widgets);
      expect(widgets[0].summaryKey).toBe('foobar');

      //Simulate ui-sortable drag and drop
      for (var index in widgets) {
        widgets[index].index = 3 - index;
      }

      ExportService.sort(widgets);
      expect(widgets[0].summaryKey).toBe('barfoo');
    });

  });

  describe('exportPdf', function() {
    it('should construct a correct URL for organization level exports', function() {
      var areaKey = '2000';
      var dateRanges = getTestDateRange();
      var metricKey = 'test-metric';

      ExportService.addToExportCartAndStore(areaKey, dateRanges.dateRange, dateRanges.compare1Range, dateRanges.compare2Range, metricKey);

      // Note: object property order matters in PhantomJS
      var exportItems = [{
        'organizationId': '2000',
        'dateRange': {
          'start': dateRanges.dateRange.start.toISOString(),
          'end': dateRanges.dateRange.end.toISOString()
        },
        'compare1Range': {
          'start': dateRanges.compare1Range.start.toISOString(),
          'end': dateRanges.compare1Range.end.toISOString()
        },
        'compare2Range': {
          'start': dateRanges.compare2Range.start.toISOString(),
          'end': dateRanges.compare2Range.end.toISOString()
        },
        'summaryKey': 'test-metric',
        'locationType': []
      }];

      $httpBackend.whenGET(
         getPdfUrl(exportItems)
      ).respond(404);

      ExportService.exportCartToPdf(ExportService.getCart());

      $httpBackend.flush();
    });

    it('should construct a correct URL for site level exports', function() {
      var areaKey = '2000_1000';
      var dateRanges = getTestDateRange();
      var metricKey = 'test-metric';

      ExportService.addToExportCartAndStore(areaKey, dateRanges.dateRange, dateRanges.compare1Range, dateRanges.compare2Range,  metricKey);

      // Note: object property order matters in PhantomJS
      var exportItems = [{
        'organizationId': '2000',
        'siteId': '1000',
        'dateRange': {
          'start': dateRanges.dateRange.start.toISOString(),
          'end': dateRanges.dateRange.end.toISOString()
        },
        'compare1Range': {
          'start': dateRanges.compare1Range.start.toISOString(),
          'end': dateRanges.compare1Range.end.toISOString()
        },
        'compare2Range': {
          'start': dateRanges.compare2Range.start.toISOString(),
          'end': dateRanges.compare2Range.end.toISOString()
        },
        'summaryKey': 'test-metric',
        'locationType': []
      }];

      $httpBackend.whenGET(
         getPdfUrl(exportItems)
      ).respond(404);

      ExportService.exportCartToPdf(ExportService.getCart());

      $httpBackend.flush();
    });

    it('should construct a correct URL for location level exports', function() {
      var areaKey = '2000_1000_location_0000';
      var dateRanges = getTestDateRange();
      var metricKey = 'test-metric';

      ExportService.addToExportCartAndStore(areaKey, dateRanges.dateRange, dateRanges.compare1Range, dateRanges.compare2Range, metricKey);

      // Note: object property order matters in PhantomJS
      var exportItems = [{
        'organizationId': '2000',
        'siteId': '1000',
        'locationId': '0000',
        'dateRange': {
          'start': dateRanges.dateRange.start.toISOString(),
          'end': dateRanges.dateRange.end.toISOString()
        },
        'compare1Range': {
          'start': dateRanges.compare1Range.start.toISOString(),
          'end': dateRanges.compare1Range.end.toISOString()
        },
        'compare2Range': {
          'start': dateRanges.compare2Range.start.toISOString(),
          'end': dateRanges.compare2Range.end.toISOString()
        },
        'summaryKey': 'test-metric',
        'locationType': []
      }];

      $httpBackend.whenGET(
         getPdfUrl(exportItems)
      ).respond(404);

      ExportService.exportCartToPdf(ExportService.getCart());

      $httpBackend.flush();
    });

    it('should construct a correct URL with arbitrary number of parameters', function() {
      var combinedDateRange = getTestDateRange();

      var parameter = {
        orgId: '2000',
        siteId: '1000',
        locationId: '0000',
        dateRange: combinedDateRange.dateRange,
        compare1Range: combinedDateRange.compare1Range,
        compare2Range: combinedDateRange.compare2Range,
        name: 'test-metric',
        foobar: 'barfoo'
      };

      ExportService.createExportAndStore(parameter);

      // Note: object property order matters in PhantomJS
      var exportItems = [{
        'organizationId': '2000',
        'siteId': '1000',
        'locationId': '0000',
        'dateRange': {
          'start': combinedDateRange.dateRange.start.toISOString(),
          'end': combinedDateRange.dateRange.end.toISOString()
        },
        'compare1Range': {
          'start': combinedDateRange.compare1Range.start.toISOString(),
          'end': combinedDateRange.compare1Range.end.toISOString()
        },
        'compare2Range': {
          'start': combinedDateRange.compare2Range.start.toISOString(),
          'end': combinedDateRange.compare2Range.end.toISOString()
        },
        'summaryKey': 'test-metric',
        'locationType': [],
        'foobar': 'barfoo'
      }];

      $httpBackend.whenGET(
         getPdfUrl(exportItems)
      ).respond(404);

      ExportService.exportCartToPdf(ExportService.getCart());

      $httpBackend.flush();
    });

    it('should construct a correct URL with list type arbitrary parameters', function() {
      var combinedDateRange = getTestDateRange();

      var parameter = {
        orgId: '2000',
        siteId: '1000',
        locationId: '0000',
        dateRange: combinedDateRange.dateRange,
        compare1Range: combinedDateRange.compare1Range,
        compare2Range: combinedDateRange.compare2Range,
        name: 'test-metric',
        locationType: ['foo', 'bar', 'foobar'],
        foobar: ['barfoo']
      };

      ExportService.createExportAndStore(parameter);

      // Note: object property order matters in PhantomJS
      var exportItems = [{
        'organizationId': '2000',
        'siteId': '1000',
        'locationId': '0000',
        'dateRange': {
          'start': combinedDateRange.dateRange.start.toISOString(),
          'end': combinedDateRange.dateRange.end.toISOString()
        },
        'compare1Range': {
          'start': combinedDateRange.compare1Range.start.toISOString(),
          'end': combinedDateRange.compare1Range.end.toISOString()
        },
        'compare2Range': {
          'start': combinedDateRange.compare2Range.start.toISOString(),
          'end': combinedDateRange.compare2Range.end.toISOString()
        },
        'summaryKey': 'test-metric',
        'locationType': ['foo', 'bar', 'foobar'],
        'foobar': ['barfoo']
      }];

      $httpBackend.whenGET(
         getPdfUrl(exportItems)
      ).respond(404);

      ExportService.exportCartToPdf(ExportService.getCart());

      $httpBackend.flush();
    });

    it('should return correct pdf url parameter', function() {
      var combinedDateRange = getTestDateRange();

      var parameter = {
        orgId: '2000',
        siteId: '1000',
        locationId: '0000',
        dateRange: combinedDateRange.dateRange,
        compare1Range: combinedDateRange.compare1Range,
        compare2Range: combinedDateRange.compare2Range,
        name: 'test-metric',
        locationType: ['foo', 'bar', 'foobar'],
        foobar: ['barfoo']
      };

      ExportService.createExportAndStore(parameter);

      // Note: object property order matters in PhantomJS
      var exportItems = [{
        'organizationId': '2000',
        'siteId': '1000',
        'locationId': '0000',
        'dateRange': {
          'start': combinedDateRange.dateRange.start.toISOString(),
          'end': combinedDateRange.dateRange.end.toISOString()
        },
        'compare1Range': {
          'start': combinedDateRange.compare1Range.start.toISOString(),
          'end': combinedDateRange.compare1Range.end.toISOString()
        },
        'compare2Range': {
          'start': combinedDateRange.compare2Range.start.toISOString(),
          'end': combinedDateRange.compare2Range.end.toISOString()
        },
        'summaryKey': 'test-metric',
        'locationType': ['foo', 'bar', 'foobar'],
        'foobar': ['barfoo']
      }];

      ExportService.buildPdfUrl(
        ExportService.buildMetricListFromExportCart(ExportService.getCart())
      ).then(function(data){
        expect(data).toBe('http%3A%2F%2Fserver%2F%23%2Fpdf%2F' + encodeURIComponent(JSON.stringify(exportItems)));
      })

    });

    it('should broadcast correct event when PDF export request returns error', function() {
      var areaKey = '2000_1000';
      var dateRanges = getTestDateRange();
      var metricKey = 'test-metric';

      spyOn($rootScope, '$broadcast').and.callThrough();

      ExportService.addToExportCartAndStore(areaKey, dateRanges.dateRange, dateRanges.compare1Range, dateRanges.compare2Range, metricKey);

      var pdfExportApiUrlMatcher = new RegExp(apiUrl + '/pdf\\?.*');

      $httpBackend.expectGET(
        pdfExportApiUrlMatcher
      ).respond(404);

      ExportService.exportCartToPdf(ExportService.getCart());

      $httpBackend.flush();

      expect($rootScope.$broadcast).toHaveBeenCalledWith('pdfExportFinish', {
        success: false,
        cart: ExportService.getCart()
      });
    });
  });


  describe('buildAreaKey', function() {

    it('should construct correct area key for org level export', function() {
      var orgId = '1234';
      var siteId = null;
      var zoneId = null;
      var locationId = null;
      var tags = null;

      var areaKey = ExportService.buildAreaKey(orgId, siteId, locationId, zoneId, tags);
      expect(areaKey).toMatch('1234_-1');
    });

    it('should construct correct area key for site level export', function() {
      var orgId = '1234';
      var siteId = '123456';
      var zoneId = null;
      var locationId = null;
      var tags = null;

      var areaKey = ExportService.buildAreaKey(orgId, siteId, locationId, zoneId, tags);
      expect(areaKey).toMatch('1234_123456');
    });

    it('should construct correct area key for location level export', function() {
      var orgId = '1234';
      var siteId = '123456';
      var zoneId = null;
      var locationId = '9999';
      var tags = null;

      var areaKey = ExportService.buildAreaKey(orgId, siteId, locationId, zoneId, tags);
      expect(areaKey).toMatch('1234_123456_location_9999');
    });

    it('should construct correct area key for zone level export', function() {
      var orgId = '1234';
      var siteId = '123456';
      var zoneId = '8888';
      var locationId = null;
      var tags = null;

      var areaKey = ExportService.buildAreaKey(orgId, siteId, locationId, zoneId, tags);
      expect(areaKey).toMatch('1234_123456_zone_8888');
    });

    it('should construct correct area key for org level export with tags', function() {
      var orgId = '1234';
      var siteId = null;
      var zoneId = null;
      var locationId = null;
      var tags = 'tagstring';

      var areaKey = ExportService.buildAreaKey(orgId, siteId, locationId, zoneId, tags);
      expect(areaKey).toMatch('1234_-1_tags_tagstring');
    });

  });

  function getTestDateRange() {
    var dateRange = {
      start: moment.utc('2014-01-01'),
      end:   moment.utc('2014-01-07').endOf('day')
    };
    var compare1Range = {
      start: moment.utc('2013-12-20'),
      end: moment.utc('2013-12-27').endOf('day')
    };
    var compare2Range = {
      start: moment.utc('2013-12-20'),
      end: moment.utc('2013-12-27').endOf('day')
    };

    return { dateRange: dateRange, compare1Range: compare1Range, compare2Range: compare2Range };
  }

  function addItemToExportCart() {
    var areaKey = '2000_1000';
    var combinedDateRange = getTestDateRange();
    var metricKey = 'test-metric';

    ExportService.addToExportCartAndStore(areaKey, combinedDateRange.dateRange, combinedDateRange.compare1Range, combinedDateRange.compare2Range, metricKey);

    return { areaKey: areaKey, dateRangeKey: ExportService.buildDateRangeKey(combinedDateRange.dateRange, combinedDateRange.compare1Range, combinedDateRange.compare2Range), metricKey: { name: metricKey }};

  }

  function getPdfUrl(exportItems) {
    var pdfRequest = {
      userId : userId,
      widgets: exportItems
    };
    return apiUrl + '/pdf?url=http%3A%2F%2Fserver%2F%23%2Fpdf%2F' + encodeURIComponent(JSON.stringify(pdfRequest));
  }


});
