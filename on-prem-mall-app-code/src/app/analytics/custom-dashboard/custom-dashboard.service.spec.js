'use strict';

describe('customDashboard', function() {
  var $httpBackend;

  var apiUrl;
  var customDashboardService;
  var currentUserMock;
  var widgetMock;
  var authService
  var $q;
  var timeout;
  var googleAnalytics;
  
  beforeEach(function() {
    apiUrl = 'https://api.url';

    widgetMock = {
      activeSelectedMetrics:{0:'traffic'},
      chart_name:'Traffic Comparison Mall of Arabia vs Mall of Dharan over the last year',
      compareSites:{
        0:80030032,
        1:80029911
      },
      compare_period_1:{
        custom_end_date:'',
        custom_start_date:'',
        period_type:"prior_period"
      },
      compare_period_2: {
        custom_end_date:'',
        custom_start_date:'',
        period_type:'prior_year'
      }
    };

    currentUserMock = {
      _id:1,
      preferences: {
        custom_dashboards: [],
        market_intelligence: { }
      }
    };
    
  });

  beforeEach(module('shopperTrak', function($translateProvider) {
    $translateProvider.translations('en_US', {});
  }));

  beforeEach(module(function($provide) {
    $provide.constant('apiUrl', apiUrl);    
  }));

  beforeEach(inject(function(_$httpBackend_, _customDashboardService_, _authService_, _$q_, _$timeout_, _googleAnalytics_) {
    $httpBackend = _$httpBackend_;
    customDashboardService = _customDashboardService_;
    authService = _authService_;
    googleAnalytics = _googleAnalytics_;
    $q = _$q_;
    timeout = _$timeout_;
    authService.getCurrentUser = function () {
      var defer = $q.defer();
      defer.resolve(currentUserMock);
      return defer.promise;
    };
    googleAnalytics.trackUserEvent = function(dashboard, message){};

    authService.updateUserPreferencesCustomDashboards = function (custom_dashboards) {
      currentUserMock.preferences.custom_dashboards = custom_dashboards;

    };
    }));

  describe('isNewDashboardAllowed', function() {

    it('should return true when there is no  dashboard or less then 5 dashboard exist', function() {
      var allowed = customDashboardService.isNewDashboardAllowed('neDashboardTest1', currentUserMock);
      
      expect(allowed).toBe(true);
    }); 
    
    it('should return false when user has more then 4 dashboard', function() {
      for(var i=1; i<6; i++) {
        var newDashboard = {
          widgets: widgetMock,
          name: 'test' + i,
          position: i
        };
        currentUserMock.preferences.custom_dashboards.push(newDashboard);
      }
      
      var allowed = customDashboardService.isNewDashboardAllowed('neDashboardTest1', currentUserMock);
      
      expect(allowed).toBe(false);
    }); 
  });

  describe('saveNewDashboard', function() {

    it('should save new daahboard', function() {
      customDashboardService.saveNewDashboard('neDashboardTest1', widgetMock, currentUserMock);
      var url = apiUrl + '/users/' + currentUserMock._id;
      $httpBackend.whenPUT(url).respond({result:[currentUserMock]});

      $httpBackend.flush();
      expect(currentUserMock.preferences.custom_dashboards.length).toBe(1);
    });  

    it('should save new dashboard  handle the error case', function() {
      var url = apiUrl + '/users/' + currentUserMock._id;
      //error case
      $httpBackend.whenPUT(url).respond(500, 'error');

      spyOn(authService, 'updateUserPreferencesCustomDashboards').and.callThrough();
      customDashboardService.saveNewDashboard('neDashboardTest1', widgetMock, currentUserMock);
      $httpBackend.flush();
      timeout.flush();
      expect(authService.updateUserPreferencesCustomDashboards).not.toHaveBeenCalled;
    }); 
  });

   describe('updateDashboard', function() {

    it('should update  the daahboard', function() {
      customDashboardService.saveNewDashboard('neDashboardTest1', widgetMock, currentUserMock);
      var url = apiUrl + '/users/' + currentUserMock._id;
      $httpBackend.whenPUT(url).respond({result:[currentUserMock]});

      var newDashboard = {
        widgets: widgetMock,
        name: 'newDashboardName',
        position: 1
      };

      $httpBackend.flush();
      expect(currentUserMock.preferences.custom_dashboards.length).toBe(1);
      spyOn(authService, 'updateUserPreferencesCustomDashboards').and.callThrough();
      customDashboardService.updateDashboard(newDashboard, 'neDashboardTest1') ;
      $httpBackend.flush();
      timeout.flush();
      expect(authService.updateUserPreferencesCustomDashboards).toHaveBeenCalledWith([newDashboard]);
    });  

    it('should update  handle the error case', function() {
      var newDashboard = {
        widgets: [widgetMock],
        name: 'neDashboardTest1',
        position: 1
      };
      currentUserMock.preferences.custom_dashboards = [newDashboard];
      var url = apiUrl + '/users/' + currentUserMock._id;
      //error case
      $httpBackend.whenPUT(url).respond(500, 'error');

      var newDashboard = {
        widgets: widgetMock,
        name: 'newDashboardName',
        position: 1
      };

      spyOn(authService, 'updateUserPreferencesCustomDashboards').and.callThrough();
      customDashboardService.updateDashboard(newDashboard, 'neDashboardTest1') ;
      $httpBackend.flush();
      timeout.flush();
      expect(authService.updateUserPreferencesCustomDashboards).not.toHaveBeenCalled;
    });  

    it('should save widget into the dashboard', function() {
      var newDashboard = {
        widgets: [widgetMock],
        name: 'neDashboardTest1',
        position: 1
      };
      currentUserMock.preferences.custom_dashboards = [newDashboard];
     
      var url = apiUrl + '/users/' + currentUserMock._id;
      $httpBackend.whenPUT(url).respond({result:{data:{result:[currentUserMock]}}});
      
      spyOn(authService, 'getCurrentUser').and.callThrough();
      customDashboardService.saveWidgetToDashboard(widgetMock, 'neDashboardTest1');
      $httpBackend.flush();
      timeout.flush();
      expect(authService.updateUserPreferencesCustomDashboards).toHaveBeenCalled;
    });  

    it('should save widget  handle the error case', function() {
      var newDashboard = {
        widgets: [widgetMock],
        name: 'neDashboardTest1',
        position: 1
      };
      currentUserMock.preferences.custom_dashboards = [newDashboard];
      var url = apiUrl + '/users/' + currentUserMock._id;
      //error case
      $httpBackend.whenPUT(url).respond(500, 'error');

      spyOn(authService, 'updateUserPreferencesCustomDashboards').and.callThrough();
      customDashboardService.saveWidgetToDashboard(widgetMock, 'neDashboardTest1');
      $httpBackend.flush();
      timeout.flush();
      expect(authService.updateUserPreferencesCustomDashboards).not.toHaveBeenCalled;
    }); 
  });

  describe('deleteDashboard', function() {

    it('should delete the daahboard', function() {
      customDashboardService.saveNewDashboard('neDashboardTest1', widgetMock, currentUserMock);
      var url = apiUrl + '/users/' + currentUserMock._id;
      $httpBackend.whenPUT(url).respond({result:[currentUserMock]});

      $httpBackend.flush();
      expect(currentUserMock.preferences.custom_dashboards.length).toBe(1);
      
      $httpBackend.whenPUT(url).respond({result:[currentUserMock]});
      customDashboardService.deleteDashboard(currentUserMock.preferences.custom_dashboards[0], currentUserMock);
      $httpBackend.flush();
      expect(currentUserMock.preferences.custom_dashboards.length).toBe(0);
    });  

    it('should handle error when delete the dashboard', function() {
      var newDashboard = {
        widgets: widgetMock,
        name: 'newDashboardName',
        position: 1
      };

      currentUserMock.preferences.custom_dashboards.push(newDashboard);
      expect(currentUserMock.preferences.custom_dashboards.length).toBe(1);
      var url = apiUrl + '/users/' + currentUserMock._id;
      
      //error case
      $httpBackend.whenPUT(url).respond(500, 'error');
      customDashboardService.deleteDashboard(currentUserMock.preferences.custom_dashboards[0], currentUserMock);
      $httpBackend.flush();
      expect(currentUserMock.preferences.custom_dashboards.length).toBe(1);
    });  

    it('should delete all dashboards', function() {
      var newDashboard = {
        widgets: widgetMock,
        name: 'newDashboardName',
        position: 1
      };
      var newDashboard2 = {
        widgets: widgetMock,
        name: 'newDashboardName2',
        position: 2
      };

      currentUserMock.preferences.custom_dashboards.push(newDashboard);
      currentUserMock.preferences.custom_dashboards.push(newDashboard2);
      expect(currentUserMock.preferences.custom_dashboards.length).toBe(2);
      var url = apiUrl + '/users/' + currentUserMock._id;
      var result = angular.copy(currentUserMock);
      result.preferences.custom_dashboards = [];
      spyOn(authService, 'updateUserPreferencesCustomDashboards').and.callThrough();
    
      $httpBackend.whenPUT(url).respond({result:[result]});
      customDashboardService.deleteAllDashboards(currentUserMock);
      $httpBackend.flush();
      expect(authService.updateUserPreferencesCustomDashboards).toHaveBeenCalledWith([]);
    });  

    it('should handle error when delete all dashboards', function() {
      var newDashboard = {
        widgets: widgetMock,
        name: 'newDashboardName',
        position: 1
      };

      var newDashboard2 = {
        widgets: widgetMock,
        name: 'newDashboardName2',
        position: 2
      };

      currentUserMock.preferences.custom_dashboards.push(newDashboard);
      currentUserMock.preferences.custom_dashboards.push(newDashboard2);

      expect(currentUserMock.preferences.custom_dashboards.length).toBe(2);
      var url = apiUrl + '/users/' + currentUserMock._id;

      spyOn(authService, 'updateUserPreferencesCustomDashboards').and.callThrough();
      
      //error case
      $httpBackend.whenPUT(url).respond(500, 'error');
      customDashboardService.deleteAllDashboards(currentUserMock);
      $httpBackend.flush();
      expect(authService.updateUserPreferencesCustomDashboards).not.toHaveBeenCalled();
    });  
  });

});
