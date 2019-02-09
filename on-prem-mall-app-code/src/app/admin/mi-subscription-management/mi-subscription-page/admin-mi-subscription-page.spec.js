'use strict';

describe('AdminMiPageController', function() {
  var $scope,
      $controller,
      $timeout,
      $q,
      $mockState,
      $httpBackend,
      $filter;

  var adminOrganizationsDataMock;

  beforeEach(module('shopperTrak', function ($translateProvider) {
    $translateProvider.translations('en_US', {});
  }));

  beforeEach(inject(function (
    _$rootScope_,
    _$controller_,
    _$timeout_,
    _$httpBackend_,
    _$q_,
    _adminOrganizationsData_,
    _$filter_
  ) {
    $scope = _$rootScope_.$new();
    $controller = _$controller_;
    $timeout = _$timeout_;
    $httpBackend = _$httpBackend_;
    $q = _$q_;
    adminOrganizationsDataMock = _adminOrganizationsData_;
    $filter = _$filter_;
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('activate()', function() {
    beforeEach(function () {
      spyOn(adminOrganizationsDataMock, 'fetchOrganizations').and.callFake(function () {
        var deferred = $q.defer();
        deferred.resolve(getAdminOrganisations());
        return deferred.promise;
      });
    });

    it('should call fetchOrganizations to get organisations', function() {
      instantiateController();
      expect(adminOrganizationsDataMock.fetchOrganizations).toHaveBeenCalled();
    });

    it('should return the correct number of organisations', function() {
      var controller = instantiateController();
      expect(controller.organizations.length).toEqual(5);
    });

    it('should set status to Active', function() {
      var controller = instantiateController();
      expect(controller.status.locale.name).toEqual('marketIntelligence.ADMIN.ACTIVE');
    });

    it('should filter out the organisations with the status of Active', function() {
      var controller = instantiateController();
      expect(controller.filteredOrganizations.length).toEqual(3);
      var item1 = controller.filteredOrganizations[0];
      var item2 = controller.filteredOrganizations[1];
      var item3 = controller.filteredOrganizations[2];
      expect(item1.market_intelligence_status).toEqual('marketIntelligence.ADMIN.ACTIVE');
      expect(item2.market_intelligence_status).toEqual('marketIntelligence.ADMIN.ACTIVE');
      expect(item3.market_intelligence_status).toEqual('marketIntelligence.ADMIN.ACTIVE');
    });
  });

  describe('filterBySelection()', function() {
    beforeEach(function () {
      spyOn(adminOrganizationsDataMock, 'fetchOrganizations').and.callFake(function () {
        var deferred = $q.defer();
        deferred.resolve(getAdminOrganisations());
        return deferred.promise;
      });
    });

    it('should filter the organisation list by status', function() {
      var controller = instantiateController();
      controller.status.locale = controller.status.options[2];
      controller.filterBySelection();
      expect(controller.filteredOrganizations.length).toEqual(1);
      controller.status.locale = controller.status.options[1];
      controller.filterBySelection();
      expect(controller.filteredOrganizations.length).toEqual(3);
      controller.status.locale = controller.status.options[0];
      controller.filterBySelection();
      expect(controller.filteredOrganizations.length).toEqual(5);
    });

    it('should filter the organisation list by name', function() {
      var controller = instantiateController();
      controller.orgsearch = 'Retail';
      controller.filterBySelection();
      expect(controller.filteredOrganizations.length).toEqual(2);
      expect(controller.filteredOrganizations[0].name).toEqual('Retail Demo');
      expect(controller.filteredOrganizations[1].name).toEqual('Retail Org');
    });

    it('should filter the organisation list list by status and by name', function() {
      var controller = instantiateController();
      controller.status.locale = controller.status.options[1];
      controller.orgsearch = 'Retail';
      controller.filterBySelection();
      expect(controller.filteredOrganizations.length).toEqual(2);
      expect(controller.filteredOrganizations[0].name).toEqual('Retail Demo');
      expect(controller.filteredOrganizations[1].name).toEqual('Retail Org');
      controller.status.locale = controller.status.options[2];
      controller.filterBySelection();
      expect(controller.filteredOrganizations.length).toEqual(0);
    });
  });

  describe('onCSVExport()', function() {
    beforeEach(function () {
      spyOn(adminOrganizationsDataMock, 'fetchOrganizations').and.callFake(function () {
        var deferred = $q.defer();
        deferred.resolve(getAdminOrganisations());
        return deferred.promise;
      });
    });

    it('should create an export ready object', function() {
      var controller = instantiateController();
      controller.status.locale = controller.status.options[1];
      controller.orgsearch = 'Retail';
      controller.filterBySelection();
      expect(_.isEmpty(controller.csvExport.dataObj)).toBe(true);
      controller.onCSVExport(controller.filteredOrganizations);
      expect(controller.csvExport.dataObj.header).toBeDefined();
      expect(controller.csvExport.dataObj.columnHeaders).toBeDefined();
      expect(controller.csvExport.dataObj.rows).toBeDefined();
    });

    it('should have data for filteredOrganizations', function() {
      var controller = instantiateController();
      controller.status.locale = controller.status.options[1];
      controller.orgsearch = 'Retail';
      controller.filterBySelection();
      controller.onCSVExport(controller.filteredOrganizations);
      var item1 = controller.csvExport.dataObj.rows[0];
      var startDateRetailDemo = $filter('date')('2018-04-01T23:00:00.000Z', 'MMM d, y');
      var endDateRetailDemo = $filter('date')('2019-04-02T23:00:00.000Z', 'MMM d, y');
      expect(item1[0]).toEqual(100003068);
      expect(item1[1]).toEqual('Retail Demo');
      expect(item1[2]).toEqual('Marketintelligence.admin.active ('+startDateRetailDemo+' - '+endDateRetailDemo+')');
      var item2 = controller.csvExport.dataObj.rows[1];
      expect(item2[0]).toEqual(100003069);
      expect(item2[1]).toEqual('Retail Org');
      var startDateRetailOrg = $filter('date')('2018-04-01T23:00:00.000Z', 'MMM d, y');
      var endDateRetailOrg = $filter('date')('2019-04-02T23:00:00.000Z', 'MMM d, y');
      expect(item2[2]).toEqual('Marketintelligence.admin.active ('+startDateRetailOrg+' - '+endDateRetailOrg+')');
    });

  });

  function instantiateController() {
    var controller = $controller('AdminMiPageController', {
      '$scope': $scope,
      '$state': $mockState
    });
    $timeout.flush();
    return controller;
  }

  $mockState = {
    go: function(stateName) {
      angular.noop(stateName)
    }
  }

  function getAdminOrganisations() {
    return [
      {
        'id': 8706,
        'name': 'PORTO VENERE, S.A.',
        'type': 'Mall',
        'subscriptions': {
          'perimeter': true,
          'interior': true,
          'large_format_mall': true,
          'what_if_analysis': false
        },
        'default_calendar_id': 65,
        'updated': '05/05/2015'
      }, {
        'id': 5210,
        'name': 'Dicks Sporting Goods',
        'type': 'Retail',
        'subscriptions': {
          'perimeter': true,
          'interior': true,
          'large_format_mall': true,
          'advanced': false,
          'campaigns': false,
          'consumer_behavior': false,
          'labor': false,
          'market_intelligence': false,
          'qlik': false,
          'sales': false,
          'what_if_analysis': false,
          'realtime_labor': false,
          'realtime_sales': false,
          'realtime_traffic': false
        },
        'status_subscriptions': {
          'market_intelligence': [
            {
              'status': 'disabled',
              'end': '2019-02-21T16:36:10.801Z',
              'start': '2018-02-20T16:36:10.801Z'
            }
          ]
        },
        'default_calendar_id': 1,
        'updated': '26/02/2018'
      }, {
        'id': 8695,
        'name': 'Newground CIC',
        'type': 'Retail',
        'subscriptions': {
          'interior': true,
          'perimeter': true,
          'large_format_mall': true,
          'advanced': false,
          'campaigns': false,
          'consumer_behavior': false,
          'labor': false,
          'market_intelligence': true,
          'qlik': false,
          'realtime_labor': false,
          'realtime_sales': false,
          'realtime_traffic': false,
          'sales': false,
          'what_if_analysis': false
        },
        'status_subscriptions': {
          'market_intelligence': [
            {
              'start': '2016-09-22T09:40:46.167Z',
              'end': '2018-09-22T09:40:46.167Z',
              'status': 'active'
            }
          ]
        },
        'default_calendar_id': 1,
        'updated': '27/03/2017'
      }, {
        'id': 5185,
        'name': 'Liverpool',
        'type': 'Mall',
        'subscriptions': {
          'interior': false,
          'perimeter': true,
          'large_format_mall': true,
          'what_if_analysis': false
        },
        'default_calendar_id': 65,
        'updated': '06/08/2015'
      }, {
        'id': 100003068,
        'name': 'Retail Demo',
        'type': 'Retail',
        'subscriptions': {
          'market_intelligence': true,
          'qlik': true,
          'large_format_mall': false,
          'interior': true,
          'perimeter': false,
          'labor': false,
          'sales': false,
          'realtime_traffic': false,
          'realtime_sales': false,
          'realtime_labor': false,
          'advanced': true,
          'campaigns': false,
          'consumer_behavior': false,
          'what_if_analysis': false
        },
        'status_subscriptions': {
          'market_intelligence': [
            {
              'status': 'active',
              'end': '2019-04-02T23:00:00.000Z',
              'start': '2018-04-01T23:00:00.000Z'
            }
          ]
        },
        'default_calendar_id': 1006,
        'updated': '05/04/2018'
      }, {
        'id': 100003069,
        'name': 'Retail Org',
        'type': 'Retail',
        'subscriptions': {
          'market_intelligence': true,
          'qlik': true,
          'large_format_mall': false,
          'interior': true,
          'perimeter': false,
          'labor': false,
          'sales': false,
          'realtime_traffic': false,
          'realtime_sales': false,
          'realtime_labor': false,
          'advanced': true,
          'campaigns': false,
          'consumer_behavior': false,
          'what_if_analysis': false
        },
        'status_subscriptions': {
          'market_intelligence': [
            {
              'status': 'active',
              'end': '2019-04-02T23:00:00.000Z',
              'start': '2018-04-01T23:00:00.000Z'
            }
          ]
        },
        'default_calendar_id': 1006,
        'updated': '05/04/2018'
      }, {
        'id': 5928,
        'name': 'A1 Cellular - TPR',
        'type': 'Retail',
        'subscriptions': {
          'realtime_traffic': false,
          'realtime_sales': false,
          'realtime_labor': false,
          'consumer_behavior': false,
          'market_intelligence': false,
          'qlik': false,
          'advanced': false,
          'campaigns': false,
          'labor': true,
          'sales': false,
          'large_format_mall': true,
          'interior': false,
          'perimeter': true,
          'what_if_analysis': false
        },
        'status_subscriptions': {
          'market_intelligence': [
            {
              'status': 'enabled',
              'end': '2019-02-13T18:30:00.000Z',
              'start': '2018-02-12T18:30:00.000Z'
            }
          ]
        },
        'default_calendar_id': 1,
        'updated': '03/04/2018'
      }
    ]
  }
});
