'use strict';

describe('ExportCartModalCtrl', function() {


  var $scope;
  var $timeout;
  var ExportCartModalCtrl;
  var ExportService;
  var authServiceMock;
  var fakeWindow;

  beforeEach(module('shopperTrak'));

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

  beforeEach(inject(function($rootScope, $controller, _ExportService_,_$timeout_) {
    $scope = $rootScope.$new();
    ExportService = _ExportService_;
    $timeout = _$timeout_;

    authServiceMock = {
      _isAuthenticated: true,
      isAuthenticated: function() {
        return authServiceMock._isAuthenticated;
      },
      logout: function() {
        authServiceMock._isAuthenticated = false;
        $rootScope.$broadcast('auth-logout-success');
      }
    };

    ExportCartModalCtrl = $controller('ExportCartModalCtrl', {
      '$scope': $scope,
      'authService': authServiceMock,
      'ExportService': ExportService
    });
  }));

  afterEach(function() {
    ExportService.clearExportCart();
  });

  it('should be able to show correct names for export area titles', function() {
    expect(ExportService.getCartItemCount()).toBe(0);
    var values = addItemToExportCart();
    expect(ExportService.getCartItemCount()).toBe(1);

    expect($scope.isExportCartEmpty()).toBe(false);
    expect($scope.getExportAreaTitle(values.areaKey)).toBe('1000 (property overall)');

    $scope.clearExportCart();
    expect($scope.isExportCartEmpty()).toBe(true);
    expect(ExportService.getCartItemCount()).toBe(0);
  });

  it('should show error when PDF export fails in backend', function() {
    expect($scope.lastExportFailed).toBe(false);

    var exportDetails = {
      cart: {},
      success: false
    };
    $scope.$broadcast('pdfExportFinish', exportDetails);

    expect($scope.lastExportFailed).toBe(true);
  });

  it('should test exportCurrentCartToPdf() executed successfully and export cart should be empty', function() {
    $timeout.flush();
    
    spyOn(ExportService, 'exportCurrentCartToPdf').and.callThrough();
    $scope.exportCurrentCartToPdf();

    expect(ExportService.exportCurrentCartToPdf).toHaveBeenCalled();  
    expect($scope.isExportCartEmpty()).toBe(true);
  });

  it('should test getSiteById() executed successfully', function () {
    $scope.sites = [{ site_id: 20}, {site_id: 30}];
    var site = $scope.getSiteById('20');

    expect(site.site_id).toBe(20);
  });

  it('should test getLocationById() executed successfully', function () {
    $scope.locations = [{ location_id: 20}, {location_id: 30}];

    var location = $scope.getLocationById(30);

    expect(location.location_id).toBe(30);
  });

  it('should test getExportAreaTitle() executed successfully for longer Area Key', function() {   
    var values = addItemToExportCart2();

    // areaKey = '2000_1000_5000_3000_40000' where index 1 is site id and index 2 is location id
    expect($scope.getExportAreaTitle(values.areaKey)).toEqual('1000 / 5000');
  });  

  function addItemToExportCart2() {
    var areaKey = '2000_1000_5000_3000_40000';
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
    var metricKey = 'traffic';

    ExportService.addToExportCartAndStore(areaKey, dateRange, compare1Range, compare2Range, metricKey, {});

    return { areaKey: areaKey, dateRangeKey: ExportService.buildDateRangeKey(dateRange, compare1Range, compare2Range), metricKey: { name: metricKey }};

  }  

  function addItemToExportCart() {
    var areaKey = '2000_1000';
    var dateRange = {
      start: moment('2014-01-01'),
      end:   moment('2014-01-07').endOf('day')
    };
    var compare1Range = {
      start: moment('2013-12-20'),
      end: moment('2013-12-27').endOf('day')
    };
    var compare2Range = {
      start: moment('2013-12-20'),
      end: moment('2013-12-27').endOf('day')
    };
    var metricKey = 'traffic';

    ExportService.addToExportCartAndStore(areaKey, dateRange, compare1Range, compare2Range, metricKey, {});

    return { areaKey: areaKey, dateRangeKey: ExportService.buildDateRangeKey(dateRange, compare1Range, compare2Range), metricKey: { name: metricKey }};

  }

});
