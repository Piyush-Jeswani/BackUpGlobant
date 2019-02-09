'use strict';

describe('metricSwitchSelector', function () {

  var $compile,
      $scope,
      LocalizationService,
      SubscriptionsService,
      ObjectUtils,
      metricNameServiceMock,
      $q,
      metricNameService,
      $timeout,
      $httpBackend;

  var metricNameServiceMock = function(){
    return {
      applyCustomMetricNames: function(org) {
        var deferred = $q.defer();
        angular.noop(org);
        deferred.resolve();
        return deferred.promise;
      }
    };
  };
  
  beforeEach(module('shopperTrak'));

  beforeEach(module(function ($provide) {
    $provide.factory('metricNameService', metricNameServiceMock);
  }));

  beforeEach(inject(putTemplateToTemplateCache));

  beforeEach(inject(function (
    $rootScope,
    _$compile_,
    _ObjectUtils_,
    _LocalizationService_,
    _SubscriptionsService_,
    _$httpBackend_,
    _metricNameService_,
    _$timeout_,
    _$q_
  ) {
    $compile = _$compile_;
    $scope = $rootScope.$new();
    $q = _$q_;
    ObjectUtils = _ObjectUtils_;
    LocalizationService = _LocalizationService_;
    SubscriptionsService = _SubscriptionsService_;
    $httpBackend = _$httpBackend_;
    $httpBackend.whenGET('l10n/languages/en_US.json').respond({});
    metricNameService = _metricNameService_;
    $timeout = _$timeout_;
  }));



  describe('getActiveSubscriptions', function() {
    it('should set activeSubscriptions to items marked as true in subscriptions', function() {

      var scope = $scope;
      scope.activeGroup = 'perimeter';
      scope.selectedMetric = {};
      scope.currentOrg = {
        subscriptions: {
          advanced: false,
          campaigns: false,
          consumer_behavior: false,
          interior: false,
          labor: false,
          large_format_mall: true,
          market_intelligence: false,
          perimeter: true,
          qlik: false,
          sales: true,
        }
      };

      var metricSwitch = renderDirectiveAndDigest(scope);

      var actualResult = JSON.stringify(metricSwitch.activeSubscriptions);
      var expectedResult = JSON.stringify(['large_format_mall', 'perimeter', 'sales']);

      expect(actualResult).toBe(expectedResult);
    });

    it('should set the active group to the firstgroup', function() {
      var metricSwitch = renderDirectiveAndDigest();
      metricSwitch.activeGroup ='perimeter';
      expect(metricSwitch.activeGroup).toBe('perimeter');
    });

    it('should successfully call metricIsDisabled(metric) for traffic with no selected metrics and no maxLength defined', function() {
      var metricSwitch = renderDirectiveAndDigest();

      expect(metricSwitch.metricIsDisabled('traffic')).toBe(false);
      expect($scope.selectedMetrics).toBe(undefined);
      expect($scope.maxLength).toBe(undefined);
    });
    
    it('should successfully call metricIsDisabled(metric) for traffic with selected metrics and maxLength=0', function() {
      $scope.selectedMetrics = [] 
      $scope.selectedMetrics['traffic'] = true;
      $scope.selectedMetrics['sales'] = false;   
      $scope.selectedMetrics['perimeter'] = false;
      $scope.maxLength = 0;

      var metricSwitch = renderDirectiveAndDigest();

      expect(metricSwitch.metricIsDisabled('traffic')).toBe(false);
    });

    it('should successfully call metricIsDisabled(metric) for traffic with selected metrics and maxLength=null', function() {
      $scope.maxLength = null;

      var metricSwitch = renderDirectiveAndDigest();

      expect(metricSwitch.metricIsDisabled('traffic')).toBe(false);
    });

    it('should successfully call selectMetric(metric) for traffic', function() {
      var metricSwitch = renderDirectiveAndDigest();

      metricSwitch.selectMetric('traffic');

      expect(metricSwitch.selectedMetrics).toEqual({traffic: true});
    });

    it('should successfully call selectMetric(metric) for traffic with maxLength=0', function() {
      $scope.selectedMetrics = []; 
      $scope.selectedMetrics['traffic'] = true;
      $scope.selectedMetrics['sales'] = false;   
      $scope.selectedMetrics['perimeter'] = false;
      $scope.maxLength = 0;

      var metricSwitch = renderDirectiveAndDigest();

      metricSwitch.selectMetric('traffic');

      expect(metricSwitch.selectedMetrics['traffic']).toBe(false);
      expect(metricSwitch.selectedMetrics['sales']).toBe(false);
      expect(metricSwitch.selectedMetrics['perimeter']).toBe(false);      
    });    

    it('should successfully call groupFilter(metric) for traffic with active group subscription set to perimeter by default', function() {
      var metricSwitch = renderDirectiveAndDigest();
      metricSwitch.activeGroup = 'perimeter';
      expect(metricSwitch.groupFilter('traffic')).toBe(false);
      expect(metricSwitch.activeGroup).toBe('perimeter');
    });

    it('should successfully call setActiveGroup(group) for perimeter traffic', function() {
      var metricSwitch = renderDirectiveAndDigest();

      metricSwitch.setActiveGroup('perimeter');

      expect(metricSwitch.activeGroup).toBe('perimeter');
      _.each(metricSwitch.metrics, function(metric) {
        if(metric.kpi === 'traffic'){
          expect(metric.translationLabel).toEqual('kpis.kpiTitle.traffic');          
        }
      });
    });

    xit('should successfully call setActiveGroup(group) for interior traffic', function() {
      var metricSwitch = renderDirectiveAndDigest();

      metricSwitch.setActiveGroup('interior');

      expect(metricSwitch.activeGroup).toBe('interior');
      expect(metricSwitch.selectedMetrics).toEqual({});
      _.each(metricSwitch.metrics, function(metric) {
        if(metric.kpi === 'traffic'){
          expect(metric.translationLabel).toEqual('kpis.kpiTitle.visitor_behaviour_traffic');          
        }
      });
    });
  });

  function renderDirectiveAndDigest() {
    var element = createDirectiveElement();
    $compile(element)($scope);
    $scope.$digest();
    var vm = element.isolateScope().vm;
    $timeout.flush();
    return vm;
  }

  function createDirectiveElement() {
    return angular.element(
      '<metric-switch-selector ' +
      'selected-metrics="selectedMetrics" ' +
      'max-length="maxLength" ' +
      'current-organization="currentOrg" ' +
      'current-site="currentSite" ' +
      '</metric-switch-selector>'
    );
  }

  function putTemplateToTemplateCache($templateCache) {
    // Put an empty template to the template cache to prevent Angular from
    // trying to fetch it. We are only testing the controller here, so the
    // actual template is not needed.
    $templateCache.put(
      'components/metric-switch-selector/metric-switch-selector.partial.html',
      '<div></div>'
    );
  }

});
