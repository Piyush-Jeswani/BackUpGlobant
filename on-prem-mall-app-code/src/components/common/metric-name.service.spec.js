'use strict';

describe('metricNameService', function () {
  var metricNameService,
  metricConstantsMock,
  subscriptionsServiceMock,
  translateMock,
  $timeout;

  beforeEach(module('shopperTrak'));

  beforeEach(function() {
    module(function($provide) {
      subscriptionsServiceMock = function() {
        var getMetrics = function(org) {
          angular.noop(org);
          return [
            { kpi: 'traffic', value: 'traffic', shortTranslationLabel: 'trafficShortTranslationLabel'},
            { kpi: 'traffic pct', value: 'traffic (pct)', shortTranslationLabel: 'trafficpctShortTranslationLabel'},
            { kpi: 'average percent shoppers', value: 'average_percent_shoppers', shortTranslationLabel: 'apsShortTranslationLabel'},
            { kpi: 'sales', value: 'sales', shortTranslationLabel: 'salesShortTranslationLabel'},
          ]
        };

        return {
          getMetrics: getMetrics
        };
      };

      metricConstantsMock = {
        metrics: [
          { kpi: 'traffic', value: 'traffic'},
          { kpi: 'traffic pct', value: 'traffic (pct)'},
          { kpi: 'average percent shoppers', value: 'average_percent_shoppers'},
          { kpi: 'sales', value: 'sales'},
        ]
      };
  
      $provide.factory('SubscriptionsService', subscriptionsServiceMock);
      $provide.constant('metricConstants', metricConstantsMock);
    });
  });

  beforeEach(inject(function(_$translate_, _$timeout_, _metricNameService_) {
    $timeout = _$timeout_;
    metricNameService = _metricNameService_;

    _$translate_ = translateMock;
  }));

  describe('applyCustomMetricNames', function() {
    it('should be exposed', function() {
      expect(typeof metricNameService.applyCustomMetricNames).toBe('function');
    });

    // ToDo: Fix this test
    xit('should update the metrics constants with the new values', function() {
      var org = {
        metric_labels: {
          'traffic': 'custom traffic',
          'sales': 'custom sales'
        }
      };

      metricNameService.applyCustomMetricNames(org);

      $timeout.flush();

      expect(metricConstantsMock.metrics[0].displayName).toBe('custom traffic');
      expect(metricConstantsMock.metrics[3].displayName).toBe('custom sales');
    });
  });

  describe('getMetricNames', function() {
    it('should be exposed', function() {
      expect(typeof metricNameService.getMetricNames).toBe('function');
    });

    it('should set the translatedShortLabel for each metric', function() {
      var org = {};

      metricNameService.getMetricNames(org)
        .then(function(metrics) {
          expect(metrics.length).toBeGreaterThan(0);
          _.each(metrics, function(metric) {
            expect(metric.translatedShortLabel).toBeDefined();
          });
        })
        .catch(handleError);
      
      $timeout.flush();      
    });

    it('should set the custom name to the translated name if the org does not have a custom name for the metric', function() {
      var org = {};
      
      metricNameService.getMetricNames(org)
        .then(function(metrics) {
          _.each(metrics, function(metric) {
            expect(metric.displayName).toBeDefined();
            expect(metric.displayName).toBe(metric.shortTranslationLabel);
          });
        })
        .catch(handleError);

      $timeout.flush();
    });

    it('should set the custom name if the org has a custom name for the metric', function() {
      var org = {
        metric_labels: {
          'traffic': 'custom traffic',
          'sales': 'custom sales'
        }
      };

      metricNameService.getMetricNames(org)
        .then(function(metrics) {
          var traffic = _.findWhere(metrics, {kpi: 'traffic'});
          var sales = _.findWhere(metrics, {kpi: 'sales'});
    
          expect(traffic.displayName).toBe('custom traffic');
          expect(sales.displayName).toBe('custom sales');
        })
        .catch(handleError);

      $timeout.flush();
    });

    it('should reject the promise if there is an error', function() {
      metricNameService.getMetricNames()
      .then(function() {
        fail('This block should not have been entered');
      })
      .catch(function(error) {
        expect(error).toBeDefined();
      });

      $timeout.flush();
    });
  });

  function handleError(error) {
    fail(error);
  }
});