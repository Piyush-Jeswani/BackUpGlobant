'use strict';

describe('AdminKPIEditController', function () {
  var stateMock,
  stateParamsMock,
  currentAdminOrganizationMock = {},
  apiUrl = 'http://api.url',
  $controller,
  $httpBackend,
  $timeout,
  metricNameService;

  beforeEach(module('shopperTrak'));
  beforeEach(inject(function(_$controller_, _$httpBackend_, _$timeout_, _metricNameService_) {
    $controller = _$controller_;
    $httpBackend = _$httpBackend_;
    $timeout = _$timeout_;
    metricNameService = _metricNameService_;
  }));

  describe('getMetric', function() {
    it('should show an error if the KPI cannot be found', function() {
      stateParamsMock = {
        kpi: 'nothing'
      };

      var controller = createController();

      $timeout.flush();

      expect(controller.errorMessage).toBe('Metric: nothing was not found');
    });

    it('should return the metric', function() {
      stateParamsMock = {
        kpi: 'traffic'
      };

      var controller = createController();

      $timeout.flush();
      
      expect(controller.errorMessage).toBeUndefined();

      expect(controller.metric.kpi).toBe('traffic');
    });
  });

  describe('getOrgCustomName', function() {
    beforeEach(function() {
      stateParamsMock = {
        kpi: 'traffic'
      };
    });

    it('should set the customName to undefined if the organization contains no metric_labels', function() {
      var controller = createController();

      $timeout.flush();

      expect(controller.metric.customName).toBeUndefined();
    });

    it('should set the customName to undefined if the organization metric_labels prop is not set', function() {
      currentAdminOrganizationMock = {
        metric_labels: {}
      };

      var controller = createController();

      $timeout.flush();

      expect(controller.metric.customName).toBeUndefined();
    });

    it('should set the customName if it has been set on the organization', function() {
      currentAdminOrganizationMock = {
        metric_labels: {
          traffic: 'custom traffic name'
        }
      };

      var controller = createController();

      $timeout.flush();

      expect(controller.metric.customName).toBe('custom traffic name');
    });
  });

  describe('saveKpi', function() {
    beforeEach(function() {
      stateParamsMock = {
        kpi: 'traffic',
        orgId: 1234
      };

      stateMock = {
        go: function(state, params) {
          angular.noop(state, params);
        }
      };
    });

    it('should set loading to true', function() {
      var controller = createController();

      var metric = {
        kpi: 'traffic'
      }

      controller.saveKpi(metric);

      expect(controller.loading).toBe(true);
    });

    it('should set error to false', function() {
      var controller = createController();
      
      var metric = {
        kpi: 'traffic'
      }

      controller.saveKpi(metric);

      expect(controller.error).toBe(false);
    });

    it('should save the custom metric name if the org has no metric_labels', function() {
      currentAdminOrganizationMock = {};

      var controller = createController();
      
      var metric = {
        kpi: 'traffic',
        customName: 'custom traffic'
      };

      var requestBody = {
        metric_labels: {
          'traffic': 'custom traffic'
        }
      };

      var requestBody = {
        metric_labels: getMetricNames()
      };

      requestBody.metric_labels.traffic = 'custom traffic';

      $httpBackend.expectPUT('http://api.url/organizations/1234', requestBody).respond(200);

      controller.saveKpi(metric);

      $httpBackend.flush();
    });

    it('should save the custom metric name if the org has metric_labels already set', function() {
      currentAdminOrganizationMock = {
        metric_labels: {
          'traffic' : 'traffic',
          'average_traffic': 'someothermetric'
        }
      };
      
      var controller = createController();
      
      var metric = {
        kpi: 'traffic',
        customName: 'custom traffic'
      };

      var requestBody = {
        metric_labels: getMetricNames()
      };

      requestBody.metric_labels.traffic = 'custom traffic';
      requestBody.metric_labels.average_traffic = 'someothermetric';

      $httpBackend.expectPUT('http://api.url/organizations/1234', requestBody).respond(200);

      controller.saveKpi(metric);

      $httpBackend.flush();
    });

    it('should redirect to the admin edit page after a successful save', function() {
      currentAdminOrganizationMock = {};
      
      var controller = createController();
      
      var metric = {
        kpi: 'traffic',
        customName: 'custom traffic'
      };

      var requestBody = {
        metric_labels: getMetricNames()
      };

      requestBody.metric_labels.traffic = 'custom traffic';

      spyOn(stateMock, 'go');

      $httpBackend.expectPUT('http://api.url/organizations/1234', requestBody).respond(200);

      controller.saveKpi(metric);

      $httpBackend.flush();
      $timeout.flush();

      expect(controller.loading).toBe(false);
      expect(stateMock.go).toHaveBeenCalledWith('admin.organizations.edit', {orgId: 1234});
    });

    it('should display an error if the save is unsuccessful', function() {
      currentAdminOrganizationMock = {};
      
      var controller = createController();
      
      var metric = {
        kpi: 'traffic',
        customName: 'custom traffic'
      };

      var requestBody = {
        metric_labels: getMetricNames()
      };

      requestBody.metric_labels.traffic = 'custom traffic';

      spyOn(stateMock, 'go');

      $httpBackend.expectPUT('http://api.url/organizations/1234', requestBody).respond(500);

      controller.saveKpi(metric);

      $httpBackend.flush();

      expect(controller.loading).toBe(false);
      expect(controller.error).toBe(true);
    });
  });


  function createController() {
    return $controller('AdminKPIEditController', {
      '$state': stateMock,
      '$stateParams': stateParamsMock,
      'currentAdminOrganization' : currentAdminOrganizationMock,
      'apiUrl': apiUrl
    });
  }

  function getMetricNames() {
    var metricNames = {};

    var allKeys = metricNameService.getAllKeys();

    _.each(allKeys, function(key) {
      metricNames[key] = ''
    });

    return metricNames;
  }

});