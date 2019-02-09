'use strict';

describe('AdminKpiLibraryController', function () {
  var currentAdminOrganizationMock = {},
  metricNameServiceMock,
  $controller,
  $q,
  $timeout;

  beforeEach(module('shopperTrak'));
  beforeEach(inject(function(_$controller_, _$q_, _$timeout_) {
    $controller = _$controller_;
    $q = _$q_;
    $timeout = _$timeout_;
  }));

  beforeEach(function() {
    metricNameServiceMock = {
      getMetricNames: function(org) {
        var deferred = $q.defer();

        angular.noop(org);
        var results = [
          { kpi: 'traffic', value: 'traffic', shortTranslationLabel: 'trafficShortTranslationLabel', displayName: 'trafficShortTranslationLabel'},
          { kpi: 'traffic pct', value: 'traffic (pct)', shortTranslationLabel: 'trafficpctShortTranslationLabel', displayName: 'trafficpctShortTranslationLabel'},
          { kpi: 'average percent shoppers', value: 'average_percent_shoppers', shortTranslationLabel: 'apsShortTranslationLabel', displayName: 'apsShortTranslationLabel'},
          { kpi: 'sales', value: 'sales', shortTranslationLabel: 'salesShortTranslationLabel', displayName: 'salesShortTranslationLabel'},
          { kpi: 'peel_off', value: 'peel_off', shortTranslationLabel: 'peelOffShortTranslationLabel', displayName: 'peelOffShortTranslationLabel'}
        ];

        deferred.resolve(results);

        return deferred.promise;
      }
    };
  });

  describe('$onInit', function() {
    it('should assign the changeSort function to the scope', function() {
      var controller = createController();
      controller.$onInit();

      expect(typeof controller.changeSort).toBe('function');
    });
  });

  describe('getMetrics', function() {
    it('should set the metrics', function() {
      var controller = createController();
      controller.$onInit();

      $timeout.flush();

      expect(controller.metrics).toBeDefined();
      expect(controller.metrics.length).toBe(5);
    });
  });

  describe('changeSort', function() {
    it('should sort the metrics descending', function() {
      var controller = createController();
      controller.$onInit();

      var metrics = [
        {name: 'C metric', displayName: 'c metric'},
        {name: 'A metric', displayName: 'a metric'},
        {name: 'B metric', displayName: 'b metric'},
      ];

      controller.changeSort(metrics, 'name');

      expect(controller.metrics[0].name).toBe('A metric');
      expect(controller.metrics[1].name).toBe('B metric');
      expect(controller.metrics[2].name).toBe('C metric');
    });

    it('should sort the metrics ascending', function() {
      var controller = createController();
      controller.$onInit();

      controller.sortBy = 'name';
      controller.sortReverse = false;

      var metrics = [
        {name: 'C metric', displayName: 'c metric'},
        {name: 'A metric', displayName: 'a metric'},
        {name: 'B metric', displayName: 'b metric'},
      ];

      controller.changeSort(metrics, 'name');

      expect(controller.metrics[0].name).toBe('C metric');
      expect(controller.metrics[1].name).toBe('B metric');
      expect(controller.metrics[2].name).toBe('A metric');
    });
  });

  function createController() {
    return $controller('AdminKpiLibraryController', {
      'currentAdminOrganization' : currentAdminOrganizationMock,
      'metricNameService': metricNameServiceMock
    });
  }

});