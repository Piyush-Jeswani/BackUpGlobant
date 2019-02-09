'use strict';

describe('customDashboardAddWidgetController', function() {
  var $controller;
  var $scope;
  var $state;
  var $rootScope;
  var $httpBackend;
  var $q;
  var controller;
  var  $timeout;
  var customDashboardService;
  var currentUserMockWithDashboard;
  var LocalizationService;
  var apiUrl;
  var authService;

  var widgetOrgCustomCompareMock = {
    name:'org-custom-compare',
    activeSelectedMetrics:{0:'traffic'},
    chart_name:'Traffic Comparison Mall of Arabia vs Mall of Dharan over the last year',
    organizationId: 10,
    currentOrganization: {
      name: 'org'
    },
    compare: {
      chart_name: 'Traffic Comparison Mall of Arabia vs Mall of Dharan over the last year',
      selected_date_range: {
        period_type:"prior_period"
      }
    },
    siteId: 80030032,
    dateRangeShortCut:'year',
    dateRanges: {
      dateRange: {
        start: '01-01-2017',
        end:'01-08-2017'
      },
      compare1Range: {
        start: '01-01-2016',
        end:'01-08-2016'
      },
      compare2Range: {
        start: '01-01-2016',
        end:'01-08-2016'
      }
      
    },
    compareSites:{
      0:80030032,
      1:80029911
    },
    dateRange: {
      start: '01-01-2017',
      end:'01-08-2017'
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
    },
    firstDayOfWeekSetting: 0,
    metrics: ['Traffic']
  };

  var widgetMock = {
    name:'org-compare',
    activeSelectedMetrics:{0:'traffic'},
    chart_name:'Traffic Comparison Mall of Arabia vs Mall of Dharan over the last year',
    organizationId: 10,
    currentOrganization: {
      name: 'org'
    },
    compare: {
      chart_name: 'Traffic Comparison Mall of Arabia vs Mall of Dharan over the last year',
      selected_date_range: {
        period_type:"prior_period"
      }
    },
    siteId: 80030032,
    dateRangeShortCut:'year',
    compareSites:{
      0:80030032,
      1:80029911
    },
    dateRange: {
      start: '01-01-2017',
      end:'01-08-2017'
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
    },
    firstDayOfWeekSetting: 0
  };

  beforeEach(module('shopperTrak'));

  beforeEach(module('shopperTrak', function($translateProvider) {
    $translateProvider.translations('en_US', {});
  }));

  beforeEach(module(function($provide) {
    $provide.constant('apiUrl', apiUrl);    
  }));

  beforeEach(inject(function(_$rootScope_,
    _$state_,
    _$httpBackend_, 
    _$controller_, 
    _$q_, 
    _$timeout_,
    $templateCache,
    _customDashboardService_ ,
    _LocalizationService_,
    _authService_
   ) {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $state = _$state_;
    $httpBackend = _$httpBackend_;
    $q = _$q_;
    $timeout = _$timeout_;
    customDashboardService = _customDashboardService_;
    LocalizationService = _LocalizationService_;
    authService =  _authService_;
    
    var form = $('<form '+
      'ng-submit="dashboardModalForm.$invalid !== true && vm.submitModalForm()"' +
      'name="dashboardModalForm"' +
      'class="modal-content form"'+
      'autocomplete="off"' +
      'novalidate>'+
      '</form>'
    );
    $(document.body).append(form);

    apiUrl = 'https://api.url';
   
    var newDashboard = {
      widgets: [widgetMock, widgetOrgCustomCompareMock],
      name: 'neDashboardTest1',
      position: 1
    };

    currentUserMockWithDashboard = {
      _id:1,
      preferences: {
        calendar_id: 3,
        custom_dashboards: [newDashboard],
        market_intelligence: { },
        custom_period_1: {
          period_type: 'custom'
        },
        custom_period_2: {
          period_type: 'custom'
        }
      },
      localization: {
        locale: 'en-us',
        date_format:{
          mask: 'dd-mm-yyyy'
        }
      }
    };

    $scope.currentUser = currentUserMockWithDashboard;

    authService.getCurrentUser = function () {
      var defer = $q.defer();
      defer.resolve(currentUserMockWithDashboard);
      return defer.promise;
    };
    cacheTemplates($templateCache);  
    $scope.$apply();
  }));

  it('should activate and set user', function() {   
    instantiateController();

    expect(controller.currentUser).toEqual(currentUserMockWithDashboard); 
  }); 

  it('should update selected dashboardname', function() {   
    instantiateController();
    $scope.vm.updateSelectedDashboardName('test')

    expect(controller.selectedDashboardName).toEqual('test'); 
  }); 

  it('should submit the form and create new dashboard', function() {
    var url = apiUrl + '/users/' + currentUserMockWithDashboard._id;

    $httpBackend.whenPUT(url).respond({result:[currentUserMockWithDashboard]});
    
    spyOn(customDashboardService, 'saveNewDashboard').and.callThrough();
     
    instantiateController();

    $scope.vm.selectedDashboardName = '__newdashboard__';

    $scope.vm.newDashboardName = 'test 1';
    
    setSelectedWidget(widgetOrgCustomCompareMock);
  
    $scope.vm.submitModalForm();

    var widget = customDashboardService.getSelectedWidget();

    $timeout.flush();   

    $httpBackend.flush();
   
    expect(customDashboardService.saveNewDashboard).toHaveBeenCalledWith($scope.vm.newDashboardName, widget, $scope.vm.currentUser, $state.params.orgId);
    $timeout.flush();   
    expect($scope.vm.isCreateDashboardRadioFocused).toBeFalsy;
    expect($scope.vm.errorMessage).toBeNull;
    expect($scope.vm.newDashboardName).toEqual('');
    expect($scope.vm.wasSubmitted).toBeFalsy;
  }); 

  it('should submit the form and handle error in create new dashboard', function() {   
    customDashboardService.saveNewDashboard = function(name , widget, user) {
      var defer = $q.defer();
      defer.reject('error');
      return defer.promise;
    }
    
    spyOn(customDashboardService, 'saveNewDashboard').and.callThrough();
     
    instantiateController();

    $scope.vm.selectedDashboardName = '__newdashboard__';

    $scope.vm.newDashboardName = 'test 1';
    
    setSelectedWidget(widgetOrgCustomCompareMock);
  
    $scope.vm.submitModalForm();

    var widget = customDashboardService.getSelectedWidget();

    expect(customDashboardService.saveNewDashboard).toHaveBeenCalledWith($scope.vm.newDashboardName, widget, $scope.vm.currentUser, $state.params.orgId);

    $timeout.flush();  

    expect($scope.vm.errorMessage).toEqual('error');

    expect($scope.vm.wasSubmitted).toBeFalsy;
  }); 

  it('should submit the form and save widget into dashboard when it is not a new dashboard', function() {   
    var url = apiUrl + '/users/' + currentUserMockWithDashboard._id;

    $httpBackend.whenPUT(url).respond({result:[currentUserMockWithDashboard]});
    
    spyOn(customDashboardService, 'saveWidgetToDashboard').and.callThrough();
     
    instantiateController();

    $scope.vm.selectedDashboardName = 'neDashboardTest1';
 
    setSelectedWidget(widgetOrgCustomCompareMock);
  
    $scope.vm.submitModalForm();

    var widget = customDashboardService.getSelectedWidget();

    $timeout.flush();   

    $httpBackend.flush();

    expect(customDashboardService.saveWidgetToDashboard).toHaveBeenCalledWith(widget, $scope.vm.selectedDashboardName, $state.params.orgId);

    $timeout.flush();  

    expect($scope.vm.isCreateDashboardRadioFocused).toBeFalsy;

    expect($scope.vm.errorMessage).toBeNull;

    expect($scope.vm.wasSubmitted).toBeFalsy;
  }); 

  it('should submit the form and handle the error if widget not be saved into dashboard when it is not a new dashboard', function() {   
   customDashboardService.saveWidgetToDashboard = function(name , widget, user) {
      var defer = $q.defer();
      defer.reject('error');
      return defer.promise;
    }
    
    spyOn(customDashboardService, 'saveWidgetToDashboard').and.callThrough();
     
    instantiateController();

    $scope.vm.selectedDashboardName = 'neDashboardTest1';
 
    setSelectedWidget(widgetOrgCustomCompareMock);
  
    $scope.vm.submitModalForm();

    var widget = customDashboardService.getSelectedWidget();

    expect(customDashboardService.saveWidgetToDashboard).toHaveBeenCalledWith(widget, $scope.vm.selectedDashboardName, $state.params.orgId);

    $timeout.flush();  

    expect($scope.vm.errorMessage).toEqual('error');

    expect($scope.vm.wasSubmitted).toBeFalsy;
  });

  function setSelectedWidget(widget) {
    var params = {
      orgId: widget.corganizationId,
      compare: widget,
      showTable: true,
      dateRange: widget.dateRange,
      compare1Range: widget.dateRanges.compare1Range,
      compare2Range: widget.dateRanges.compare2Range,
      dateRangeKey: buildDateRangeKey (widget.dateRange, widget.dateRanges.compare1Range, widget.dateRanges.compare2Range),
      hideCompare2Range: true,
      currentUser: $scope.vm.currentUser,
      language: 'en_US',
      name: widget.chart_name,
      areaKey: widget.organizationId + '_-1',
      noTranslation: true,
      summaryKey: 'org-custom-compare',
      dateFormat: 'YYYY-MM-DD',
      compareId: widget.chart_name + widget.organizationId,
      selectedMetrics: widget.metrics,
      table: true
    };
    params.compareId = 1;
    customDashboardService.setSelectedWidget(params);
  }

  function buildDateRangeKey (dateRange, compare1Range, compare2Range) {
    return dateRange.start.format +
      ' - ' +
      dateRange.end.format +
      ' - ' +
      compare1Range.start +
      ' - ' +
      compare1Range.end +
      ' - ' +
      compare2Range.start +
      ' - ' +
      compare2Range.end;
  }

  function instantiateController() {
    LocalizationService.setUser(currentUserMockWithDashboard);
     
    controller = $controller('customDashboardAddWidgetController', {
      '$scope': $scope,
      '$state':$state,
      '$timeout': $timeout,
      'customDashboardService': customDashboardService
    });

    $scope.vm = controller;
    $scope.vm.currentUser = currentUserMockWithDashboard;
    $state.params.orgId = '1000003068';
    $scope.$apply();
    $timeout.flush();   
  }

  function cacheTemplates($templateCache) {
    // Put an empty template to cache to prevent Angular from fetching it
    $templateCache.put(
      'app/header/header.html',
      '<div></div>'
    );

    $templateCache.put(
      'app/analytics/custom-dashboard/custom-dashboard-add-widget-modal.partial.html',
      '<div></div>'
    );
   
    $templateCache.put(
      'components/widgets/widget-header.partial.html',
      '<div>' +
      '<form '+
      'ng-submit="dashboardModalForm.$invalid !== true && vm.submitModalForm()"' +
      'name="dashboardModalForm"' +
      'class="modal-content form"'+
      'autocomplete="off"' +
      'novalidate>'+
      '</form>' +
      '</div>'
    );
  }
});