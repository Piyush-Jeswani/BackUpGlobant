'use strict';

describe('retailOrganizationTableWidget', function () {
  var $compile,
      $scope,
      $rootScope,
      $filter,
      $window,
      $translate,
      $q,
      vm,
      retailOrganizationSummaryData,
      metricConstants,
      utils,
      ObjectUtils,
      comparisonsHelper,
      SubscriptionsService,
      currencyService,
      $timeout;

  var mockUtils = {
    dateRangeIsPriorPeriod: function() {
      return true;
    },
    getCompareType: function() {
      return 'compare-type';
    },
    urlDateParamsLoaded: function() {
      return true;
    }
  }

  var siteCatMock = {
    '80067135': 2,
    '80071487': 2,
    '80025111': 2,
    '80207': 3,
    '80030842': 0,
    '80053328': 2,
    '80068277': 3,
    '73174': 3,
    '10093183': 3,
    '60637' : 0,
    '80076160': 2,
    '67730': 3,
    '80058787': 1
  }

  var gridOptionsApiMock = {
    setColumnDefs: function(){
      var newData = _.pluck(vm.gridOptions.rowData, {'category' : vm.selectedCategory});
      vm.gridOptions.rowData = newData;
    },
    sizeColumnsToFit : function(){
      return true;
    },
    getFilterInstance : function(){
      return {
        setModel: function(){
          return true;
        },
        resetFilterValues : function(){
          return true;
        },
        selectValue : function(){
          return true;
        }

      }
    },
    onFilterChanged :function(){
      return true;
    }
  }

  beforeEach(module('shopperTrak', function($translateProvider) {
    $translateProvider.translations('en_US', {});
  }));

  beforeEach(module('shopperTrak.widgets'));

  beforeEach(module(function ($provide) {
    $provide.constant('utils', mockUtils);
    $provide.factory('currencyService', function ($q) {
      var getCurrencySymbol = jasmine.createSpy('getCurrencySymbol').and.callFake(function () {
        return $q.when({
          currencySymbol: '$'
        });
      });

      return {
        getCurrencySymbol: getCurrencySymbol
      };
    });
  }));

  beforeEach(inject(putTemplateToTemplateCache));

  beforeEach(inject(function (
    $rootScope,
    _$compile_,
    _$filter_,
    _$window_,
    _$translate_,
    _$timeout_,
    _$q_
  ) {
    $scope = $rootScope.$new();
    $compile = _$compile_;
    $filter = _$filter_;
    $window = _$window_;
    $timeout = _$timeout_;
    $q = _$q_;

    $rootScope.customDashboards = false;
    vm = renderDirectiveAndDigest();
    $scope.siteCategories = siteCatMock;
    $scope.$digest();
    $timeout.flush();
  }));



  describe('when running the activate function', function(){

    it('should initialise the vm', function(){
      expect(vm).toBeDefined();
    });

    it('should have the needed bindings', function(){
      expect(vm.orgId).toBeDefined();
      expect(vm.orgSites).toBeDefined();
      expect(vm.dateRangeStart).toBeDefined();
      expect(vm.dateRangeEnd).toBeDefined();
      expect(vm.compareRange1Start).toBeDefined();
      expect(vm.compareRange1End).toBeDefined();
      expect(vm.compareRange2Start).toBeDefined();
      expect(vm.compareRange2End).toBeDefined();
      expect(vm.currentOrganization).toBeDefined();
      expect(vm.currentUser).toBeDefined();
      expect(vm.widgetData).toBeDefined();
      expect(vm.isLoading).toBeDefined();
      expect(vm.selectedTags).toBeDefined();
      expect(vm.siteCategories).toBeDefined();
      expect(vm.selectedCategory).toBeDefined();
      expect(vm.filterText).toBeDefined();
      expect(vm.orgHasInterior).toBeDefined();
      expect(vm.orgHasSales).toBeDefined();
      expect(vm.orgHasLabor).toBeDefined();
    });

    it('should configure watches', function(){
      expect(vm.watchUnbinds).toBeDefined();
      expect(vm.watchUnbinds.length).toBeGreaterThan(0);
    });

    it('should set selected metrics', function(){
      expect(vm.metrics).toBeDefined();
    });

    it('should build the grid', function(){
      expect(vm.allData).toBeDefined();
      expect(typeof vm.allData).toBe('object');
      expect(vm.gridBuilder).toBeDefined();
      expect(typeof vm.gridBuilder).toBe('object');
      expect(typeof vm.gridBuilder.rowData).toBe('object');
      expect(typeof vm.gridBuilder.columnDefs).toBe('object');
      expect(vm.gridOptions).toBeDefined();
      expect(typeof vm.gridOptions).toBe('object');
      expect(typeof vm.gridOptions.rowData).toBe('object');
      expect(typeof vm.gridOptions.columnDefs).toBe('object');
    });

    it('should set ag grid options', function(){
      expect(vm.gridOptions.enableColResize).toEqual(true);
      expect(vm.gridOptions.suppressResize).toEqual(false);
      expect(vm.gridOptions.enableSorting).toEqual(true);
      expect(vm.gridOptions.rowHeight).toEqual(26);
      expect(vm.gridOptions.enableFilter).toEqual(true);
      expect(vm.gridOptions.suppressDragLeaveHidesColumns).toEqual(true);
      expect(vm.gridOptions.angularCompileHeaders).toEqual(true);
    });

    it('should notify the view that the widget is ready to render', function(){
      expect(vm.isLoading).toEqual(false);
      expect(vm.requestFailed).toEqual(false);
    });

  });

  describe('after loading the table', function(){

    it('should update have the correct number of columns', function(){
      expect(vm.gridOptions.columnDefs.length).toEqual(30);
    });

    it('should show compare period 1 and value columns', function(){
      var shownCols = _.filter(vm.gridOptions.columnDefs, function(col){ return col.hide === false || !col.hide });
      var colHeaders = ['rowname', 'traffic', 'trafficp1', 'sales', 'salesp1', 'conversion', 'conversionp1', 'transactions', 'transactionsp1', 'ats', 'atsp1']
      var shownColField = _.pluck(shownCols, 'field');
      expect(shownCols.length).toEqual(11);
      expect(shownColField).toEqual(colHeaders);
    });

    it('should call the on filter change method when a filter is changed', function(){
      vm.filterText = 'Lincoln';
      vm.gridOptions.api = gridOptionsApiMock;
      spyOn(vm.gridOptions.api, 'onFilterChanged');
      $scope.$digest();
      expect(vm.gridOptions.api.onFilterChanged).toHaveBeenCalled();
    });

    it('should update row data when the sales category is changed', function(){
      vm.gridOptions.api = gridOptionsApiMock;
      vm.filterCategory(0);
      spyOn(vm.gridOptions.api, 'setColumnDefs');
      $scope.$digest();
      expect(vm.gridOptions.api.setColumnDefs).toHaveBeenCalled();
    });

    it('should resize the columns when the selected metric changes', function(){
      vm.gridOptions.api = gridOptionsApiMock;
      vm.selectedMetrics = [vm.metrics[0], vm.metrics[1]];
      spyOn(vm.gridOptions.api, 'sizeColumnsToFit');
      $scope.$digest();
      expect(vm.gridOptions.api.sizeColumnsToFit).toHaveBeenCalled();
    });

    it('should have created an an object for each row with the correct data', function(){
      var rowObj = {
        traffic: '5,112',
        trafficp1: '149.1%',
        trafficp2: '149.1%',
        sales: '$24,274',
        salesp1: '-24.0%',
        salesp2: '-24.0%',
        conversion: '8.72%',
        conversionp1: '-57.8%',
        conversionp2: '-57.8%',
        transactions: '446',
        transactionsp1: '5.2%',
        transactionsp2: '5.2%',
        ats: '$54.43',
        atsp1: '-27.7%',
        atsp2: '-27.7%',
        aur: '$109.34',
        aurp1: '-',
        aurp2: '-',
        sps: '$4.75',
        spsp1: '-',
        spsp2: '-',
        star: '17',
        starp1: '76.9%',
        starp2: '76.9%',
        splh: '$78.79',
        splhp1: '-',
        splhp2: '-',
        class: 'site-name-label--yellow',
        site_id: 80076160,
        category: 0,
        rowname: '80076160'
      }

      expect(vm.gridOptions.rowData[0]).toEqual(rowObj);
    });

    it('should load compare period 1', function(){
      expect(vm.comparisonIndex).toEqual(1);
      expect(vm.gridOptions.columnDefs[2].hide).toEqual(false);
      expect(vm.gridOptions.columnDefs[3].hide).toEqual(true);
    });

    it('should load compare period 2 after changing the period selection', function(){
      vm.changeCompare(2);
      $scope.$digest();
      expect(vm.comparisonIndex).toEqual(2);
      vm.comparisonIndex = 2;
    });
  })



  function renderDirectiveAndDigest() {

    $scope.orgId = 3068;
    $scope.orgSites = [
      {'name':'12 North Face - New York','site_id':50420,'customer_site_id':'12','organization':{'id':3068,'name':'North Face'},'business_day_start_hour':0,'fullAccess':true},
      {'name':'1211 North Face- Yorkdale Shopping Centr','site_id':80025932,'customer_site_id':'1211','organization':{'id':3068,'name':'North Face'},'business_day_start_hour':0,'fullAccess':true},
      {'name':'01 North Face - San Francisco','site_id':51182,'customer_site_id':'01','organization':{'id':3068,'name':'North Face'},'business_day_start_hour':0,'fullAccess':true},
      {'name':'04 North Face - Seattle','site_id':51178,'customer_site_id':'04','organization':{'id':3068,'name':'North Face'},'business_day_start_hour':0,'fullAccess':true},
      {'name':'10 North Face - Chicago','site_id':51181,'customer_site_id':'10','organization':{'id':3068,'name':'North Face'},'business_day_start_hour':0,'fullAccess':true}
    ];
    $scope.dateRangeStart = moment('2018-01-29T00:00:00.000Z');
    $scope.dateRangeEnd = moment('2018-02-04T23:59:59.999Z');
    $scope.compareRange1Start = moment('2017-01-30T00:00:00.000Z');
    $scope.compareRange1End = moment('2017-02-05T23:59:59.999Z');
    $scope.compareRange2Start = moment('2018-01-22T00:00:00.000Z');
    $scope.compareRange2End = moment('2018-01-28T23:59:59.999Z');
    $scope.currentOrganization = {
      '_id': '5627e27365fc27467e49c17d',
      'organization_id': 3068,
      'name': 'North Face',
      'subscriptions': {
        'market_intelligence': false,
        'qlik': false,
        'large_format_mall': false,
        'interior': false,
        'perimeter': true,
        'labor': true,
        'sales': true,
        'realtime_traffic': true,
        'realtime_sales': false,
        'realtime_labor': false,
        'advanced': true,
        'campaigns': false,
        'consumer_behavior': false,
        'what_if_analysis': true
      },
      'expired': null,
      'updated': '2018-02-07T23:50:29.211Z',
      'created': '2015-10-21T19:07:31.339Z',
      '__v': 100,
      'portal_settings': {
        'organization_type': 'Retail',
        'enter_exit': 'Exits',
        'uses_custom_comp_date': true,
        'calendar_ids': [
          1,
          2666
        ],
        'currency': 'NONE',
        'default_calendar_id': 2666,
        'sales_categories': [
          {
            'name': 'Total Retail Sales',
            'id': 0
          }
        ],
        'legacy_week_start_day': null
      },
      'default_calendar_id': -2,
      'localization': {
        'date_format': {
          'mask': 'M/D/YY'
        },
        'time_format': {
          'format': '24'
        },
        'number_format': {
          'decimal_separator': '.',
          'thousands_separator': ','
        },
        'locale': 'en-US'
      },
      'site_count': 123,
      'refresh_status': {
        'last_refresh_date': '2017-02-27T21:03:07.482Z',
        'status': 'none'
      },
      'dwell_time_threshold': {
        'shoppers_vs_others': null
      },
      'peel_off': true,
      'single_sign_on': {
        'certificates': [

        ]
      },
      'status_subscriptions': {
        'market_intelligence': [
          {
            'status': 'disabled',
            'end': '2018-02-07T23:50:29.110Z',
            'start': '2018-02-07T23:50:29.109Z'
          }
        ]
      },
      'metric_labels': {
        'abandonment_rate': '',
        'ats': '',
        'aur': '',
        'conversion': '',
        'draw_rate': '',
        'dwelltime': '',
        'gsh': '',
        'labor_hours': '',
        'loyalty': '',
        'opportunity': '',
        'sales': '',
        'splh': '',
        'sps': '',
        'star': '',
        'traffic': '',
        'transactions': '',
        'upt': '',
        'average_percent_shoppers': '',
        'average_sales': '',
        'average_traffic': '',
        'peel_off': '',
        'traffic_pct': ''
      },
      'use_hierarchy_tags': false
    };
    $scope.currentUser = {
      'username': 'dev-user-3',
      'fullname': 'Dean Hand',
      'title': 'Developer',
      'superuser': true,
      'localization': {
        'locale': 'en_GB',
        'number_format': {
          'decimal_separator': '.',
          'thousands_separator': ','
        },
        'date_format': {
          'mask': 'DD/MM/YYYY'
        },
        'temperature_format': 'F',
        'velocity_format': 'MPH'
      },
      'timezone': 'Z',
      'preferences': {
        'custom_period_2': {
          'num_weeks': 8,
          'period_type': 'prior_period'
        },
        'custom_period_1': {
          'num_weeks': 4,
          'period_type': 'prior_year'
        },
        'weather_reporting': true,
        'calendar_id': -1
      },
      '_id': '5891acb1f01125972d0f00ed',
      'email': 'd_hand@shoppertrak.com',
      'last_login': '2018-02-07T14:54:23.321Z'
    }
    $scope.selectedTags = [];
    $scope.widgetData = {
      '1485734400000_1486339199999' : [
        {'org_id':3068,'site_id':80067135,'sales_category_id':1,'period_start_date':'2018-01-29','period_end_date':'2018-02-04','traffic':7753,'sales':107414.27,'conversion':14.5234102927899,'ats':95.3945559502664,'star':15.8021317955305,'upt':1.85079928952043,'sps':13.8545427576422,'splh':218.931310623075,'aur':51.5423560460653,'transactions':1126},
        {'org_id':3068,'site_id':80071487,'sales_category_id':2,'period_start_date':'2018-01-29','period_end_date':'2018-02-04','traffic':11422,'sales':232788.61,'conversion':15.3650849238312,'ats':132.643082621083,'star':5.2719517073594,'upt':1.22905982905983,'sps':20.3807222903169,'splh':107.446183675654,'aur':107.922396847473,'transactions':1755},
        {'org_id':3068,'site_id':80025111,'sales_category_id':2,'period_start_date':'2018-01-29','period_end_date':'2018-02-04','traffic':4108,'sales':37161.02,'conversion':10.2239532619279,'ats':88.478619047619,'star':16.1681359036337,'upt':0.807142857142857,'sps':9.04601265822785,'splh':146.257162044219,'aur':109.619528023599,'transactions':420},
        {'org_id':3068,'site_id':80207,'sales_category_id':3,'period_start_date':'2018-01-29','period_end_date':'2018-02-04','traffic':972,'sales':13418.21,'conversion':15.3292181069959,'ats':90.0551006711409,'star':6.09901505791772,'upt':0.966442953020134,'sps':13.8047427983539,'splh':84.1953341978417,'aur':93.1820138888889,'transactions':149},
        {'org_id':3068,'site_id':80030842,'sales_category_id':0,'period_start_date':'2018-01-29','period_end_date':'2018-02-04','traffic':2052,'sales':31927.2,'conversion':20.6627680311891,'ats':75.3,'star':9.37714199529288,'upt':1.80660377358491,'sps':15.5590643274854,'splh':145.899555512726,'aur':41.6804177545692,'transactions':424},
        {'org_id':3068,'site_id':80053328,'sales_category_id':2,'period_start_date':'2018-01-29','period_end_date':'2018-02-04','traffic':972,'sales':13418.21,'conversion':15.3292181069959,'ats':90.0551006711409,'star':6.09901505791772,'upt':0.966442953020134,'sps':13.8047427983539,'splh':84.1953341978417,'aur':93.1820138888889,'transactions':149},
        {'org_id':3068,'site_id':80068277,'sales_category_id':3,'period_start_date':'2018-01-29','period_end_date':'2018-02-04','traffic':2052,'sales':31927.2,'conversion':20.6627680311891,'ats':75.3,'star':9.37714199529288,'upt':1.80660377358491,'sps':15.5590643274854,'splh':145.899555512726,'aur':41.6804177545692,'transactions':424},
        {'org_id':3068,'site_id':73174,'sales_category_id':3,'period_start_date':'2018-01-29','period_end_date':'2018-02-04','traffic':972,'sales':13418.21,'conversion':15.3292181069959,'ats':90.0551006711409,'star':6.09901505791772,'upt':0.966442953020134,'sps':13.8047427983539,'splh':84.1953341978417,'aur':93.1820138888889,'transactions':149},
        {'org_id':3068,'site_id':10093183,'sales_category_id':3,'period_start_date':'2018-01-29','period_end_date':'2018-02-04','traffic':2052,'sales':31927.2,'conversion':20.6627680311891,'ats':75.3,'star':9.37714199529288,'upt':1.80660377358491,'sps':15.5590643274854,'splh':145.899555512726,'aur':41.6804177545692,'transactions':424},
        {'org_id':3068,'site_id':60637,'sales_category_id':0,'period_start_date':'2018-01-29','period_end_date':'2018-02-04','traffic':972,'sales':13418.21,'conversion':15.3292181069959,'ats':90.0551006711409,'star':6.09901505791772,'upt':0.966442953020134,'sps':13.8047427983539,'splh':84.1953341978417,'aur':93.1820138888889,'transactions':149},
        {'org_id':3068,'site_id':80076160,'sales_category_id':2,'period_start_date':'2018-01-29','period_end_date':'2018-02-04','traffic':2052,'sales':31927.2,'conversion':20.6627680311891,'ats':75.3,'star':9.37714199529288,'upt':1.80660377358491,'sps':15.5590643274854,'splh':145.899555512726,'aur':41.6804177545692,'transactions':424},
        {'org_id':3068,'site_id':67730,'sales_category_id':3,'period_start_date':'2018-01-29','period_end_date':'2018-02-04','traffic':972,'sales':13418.21,'conversion':15.3292181069959,'ats':90.0551006711409,'star':6.09901505791772,'upt':0.966442953020134,'sps':13.8047427983539,'splh':84.1953341978417,'aur':93.1820138888889,'transactions':149},
        {'org_id':3068,'site_id':880058787,'sales_category_id':1,'period_start_date':'2018-01-29','period_end_date':'2018-02-04','traffic':2052,'sales':31927.2,'conversion':20.6627680311891,'ats':75.3,'star':9.37714199529288,'upt':1.80660377358491,'sps':15.5590643274854,'splh':145.899555512726,'aur':41.6804177545692,'transactions':424}
      ],
      '1516579200000_1517183999999' : [
        {'org_id':3068,'site_id':80053328,'sales_category_id':0,'period_start_date':'2017-01-30','period_end_date':'2017-02-05','traffic':3177,'sales':30895.93,'conversion':10.450110166824,'ats':93.0600301204819,'star':9.97488226059655,'upt':1.02409638554217,'sps':9.72487566887,'splh':97.0044897959184,'aur':90.8703823529412,'transactions':332},
        {'org_id':3068,'site_id':80068277,'sales_category_id':0,'period_start_date':'2017-01-30','period_end_date':'2017-02-05','traffic':5240,'sales':55088.12,'conversion':18.4732824427481,'ats':56.909214876033,'star':13.5159533828628,'upt':1.40599173553719,'sps':10.513,'splh':142.093217914036,'aur':40.4762086700955,'transactions':968},
        {'org_id':3068,'site_id':73174,'sales_category_id':0,'period_start_date':'2017-01-30','period_end_date':'2017-02-05','traffic':1763,'sales':20198.56,'conversion':14.0669313669881,'ats':81.4458064516129,'star':6.77868383198387,'upt':0.983870967741935,'sps':11.4569256948383,'splh':77.6628769718413,'aur':82.7809836065574,'transactions':248},
        {'org_id':3068,'site_id':10093183,'sales_category_id':0,'period_start_date':'2017-01-30','period_end_date':'2017-02-05','traffic':2167,'sales':19203.12,'conversion':17.0742962621135,'ats':51.9003243243243,'star':8.07708051355614,'upt':0.52972972972973,'sps':8.8616151361329,'splh':71.5759789346933,'aur':97.9751020408163,'transactions':370},
        {'org_id':3068,'site_id':60637,'sales_category_id':0,'period_start_date':'2017-01-30','period_end_date':'2017-02-05','traffic':1459,'sales':25808.43,'conversion':18.9170664838931,'ats':93.5088043478261,'star':4.92456223749572,'upt':0.902173913043478,'sps':17.6891226867718,'splh':87.111185597705,'aur':103.648313253012,'transactions':276},
        {'org_id':3068,'site_id':80030842,'sales_category_id':0,'period_start_date':'2017-01-30','period_end_date':'2017-02-05','traffic':2052,'sales':31927.2,'conversion':20.6627680311891,'ats':75.3,'star':9.37714199529288,'upt':1.80660377358491,'sps':15.5590643274854,'splh':145.899555512726,'aur':41.6804177545692,'transactions':424},
        {'org_id':3068,'site_id':80053328,'sales_category_id':2,'period_start_date':'2017-01-30','period_end_date':'2017-02-05','traffic':972,'sales':13418.21,'conversion':15.3292181069959,'ats':90.0551006711409,'star':6.09901505791772,'upt':0.966442953020134,'sps':13.8047427983539,'splh':84.1953341978417,'aur':93.1820138888889,'transactions':149},
        {'org_id':3068,'site_id':80068277,'sales_category_id':3,'period_start_date':'2017-01-30','period_end_date':'2017-02-05','traffic':2052,'sales':31927.2,'conversion':20.6627680311891,'ats':75.3,'star':9.37714199529288,'upt':1.80660377358491,'sps':15.5590643274854,'splh':145.899555512726,'aur':41.6804177545692,'transactions':424},
        {'org_id':3068,'site_id':73174,'sales_category_id':3,'period_start_date':'2017-01-30','period_end_date':'2017-02-05','traffic':972,'sales':13418.21,'conversion':15.3292181069959,'ats':90.0551006711409,'star':6.09901505791772,'upt':0.966442953020134,'sps':13.8047427983539,'splh':84.1953341978417,'aur':93.1820138888889,'transactions':149},
        {'org_id':3068,'site_id':10093183,'sales_category_id':3,'period_start_date':'2017-01-30','period_end_date':'2017-02-05','traffic':2052,'sales':31927.2,'conversion':20.6627680311891,'ats':75.3,'star':9.37714199529288,'upt':1.80660377358491,'sps':15.5590643274854,'splh':145.899555512726,'aur':41.6804177545692,'transactions':424},
        {'org_id':3068,'site_id':60637,'sales_category_id':0,'period_start_date':'2017-01-30','period_end_date':'2017-02-05','traffic':972,'sales':13418.21,'conversion':15.3292181069959,'ats':90.0551006711409,'star':6.09901505791772,'upt':0.966442953020134,'sps':13.8047427983539,'splh':84.1953341978417,'aur':93.1820138888889,'transactions':149},
        {'org_id':3068,'site_id':80076160,'sales_category_id':2,'period_start_date':'2017-01-30','period_end_date':'2017-02-05','traffic':2052,'sales':31927.2,'conversion':20.6627680311891,'ats':75.3,'star':9.37714199529288,'upt':1.80660377358491,'sps':15.5590643274854,'splh':145.899555512726,'aur':41.6804177545692,'transactions':424},
        {'org_id':3068,'site_id':67730,'sales_category_id':3,'period_start_date':'2017-01-30','period_end_date':'2017-02-05','traffic':972,'sales':13418.21,'conversion':15.3292181069959,'ats':90.0551006711409,'star':6.09901505791772,'upt':0.966442953020134,'sps':13.8047427983539,'splh':84.1953341978417,'aur':93.1820138888889,'transactions':149},
        {'org_id':3068,'site_id':880058787,'sales_category_id':1,'period_start_date':'2017-01-30','period_end_date':'2017-02-05','traffic':2052,'sales':31927.2,'conversion':20.6627680311891,'ats':75.3,'star':9.37714199529288,'upt':1.80660377358491,'sps':15.5590643274854,'splh':145.899555512726,'aur':41.6804177545692,'transactions':424}
      ],
      '1517184000000_1517788799999' : [
        {'org_id':3068,'site_id':80076160,'sales_category_id':0,'period_start_date':'2018-01-22','period_end_date':'2018-01-28','traffic':5112,'sales':24274.42,'conversion':8.7245696400626,'ats':54.4269506726457,'star':16.5920152506666,'upt':0.497757847533632,'sps':4.7485172143975,'splh':78.7874700393361,'aur':109.344234234234,'transactions':446},
        {'org_id':3068,'site_id':67730,'sales_category_id':0,'period_start_date':'2018-01-22','period_end_date':'2018-01-28','traffic':2212,'sales':26193.4,'conversion':12.2965641952984,'ats':96.2992647058824,'star':10.3737750050253,'upt':0.856617647058823,'sps':11.8415009041591,'splh':122.841066101551,'aur':112.418025751073,'transactions':272},
        {'org_id':3068,'site_id':80068277,'sales_category_id':0,'period_start_date':'2018-01-22','period_end_date':'2018-01-28','traffic':6662,'sales':79528.09,'conversion':20.0090063044131,'ats':59.6609827456864,'star':14.5372818637732,'upt':1.17854463615904,'sps':11.9375697988592,'splh':173.539816934483,'aur':50.6225907065563,'transactions':1333},
        {'org_id':3068,'site_id':80053328,'sales_category_id':0,'period_start_date':'2018-01-22','period_end_date':'2018-01-28','traffic':3117,'sales':15590.52,'conversion':9.01507860121912,'ats':55.4822775800712,'star':13.7834969859944,'upt':0.587188612099644,'sps':5.00177093358999,'splh':68.9418945877722,'aur':94.488,'transactions':281},
        {'org_id':3068,'site_id':80058787,'sales_category_id':0,'period_start_date':'2018-01-22','period_end_date':'2018-01-28','traffic':3690,'sales':28775.13,'conversion':14.7967479674797,'ats':52.7017032967033,'star':16.0052047328388,'upt':1.33699633699634,'sps':7.79813821138211,'splh':124.810798608144,'aur':39.4179863013699,'transactions':546},
        {'org_id':3068,'site_id':80030842,'sales_category_id':0,'period_start_date':'2018-01-22','period_end_date':'2018-01-28','traffic':2052,'sales':31927.2,'conversion':20.6627680311891,'ats':75.3,'star':9.37714199529288,'upt':1.80660377358491,'sps':15.5590643274854,'splh':145.899555512726,'aur':41.6804177545692,'transactions':424},
        {'org_id':3068,'site_id':80053328,'sales_category_id':2,'period_start_date':'2018-01-22','period_end_date':'2018-01-28','traffic':972,'sales':13418.21,'conversion':15.3292181069959,'ats':90.0551006711409,'star':6.09901505791772,'upt':0.966442953020134,'sps':13.8047427983539,'splh':84.1953341978417,'aur':93.1820138888889,'transactions':149},
        {'org_id':3068,'site_id':80068277,'sales_category_id':3,'period_start_date':'2018-01-22','period_end_date':'2018-01-28','traffic':2052,'sales':31927.2,'conversion':20.6627680311891,'ats':75.3,'star':9.37714199529288,'upt':1.80660377358491,'sps':15.5590643274854,'splh':145.899555512726,'aur':41.6804177545692,'transactions':424},
        {'org_id':3068,'site_id':73174,'sales_category_id':3,'period_start_date':'2018-01-22','period_end_date':'2018-01-28','traffic':972,'sales':13418.21,'conversion':15.3292181069959,'ats':90.0551006711409,'star':6.09901505791772,'upt':0.966442953020134,'sps':13.8047427983539,'splh':84.1953341978417,'aur':93.1820138888889,'transactions':149},
        {'org_id':3068,'site_id':10093183,'sales_category_id':3,'period_start_date':'2018-01-22','period_end_date':'2018-01-28','traffic':2052,'sales':31927.2,'conversion':20.6627680311891,'ats':75.3,'star':9.37714199529288,'upt':1.80660377358491,'sps':15.5590643274854,'splh':145.899555512726,'aur':41.6804177545692,'transactions':424},
        {'org_id':3068,'site_id':60637,'sales_category_id':0,'period_start_date':'2018-01-22','period_end_date':'2018-01-28','traffic':972,'sales':13418.21,'conversion':15.3292181069959,'ats':90.0551006711409,'star':6.09901505791772,'upt':0.966442953020134,'sps':13.8047427983539,'splh':84.1953341978417,'aur':93.1820138888889,'transactions':149},
        {'org_id':3068,'site_id':80076160,'sales_category_id':2,'period_start_date':'2018-01-22','period_end_date':'2018-01-28','traffic':2052,'sales':31927.2,'conversion':20.6627680311891,'ats':75.3,'star':9.37714199529288,'upt':1.80660377358491,'sps':15.5590643274854,'splh':145.899555512726,'aur':41.6804177545692,'transactions':424},
        {'org_id':3068,'site_id':67730,'sales_category_id':3,'period_start_date':'2018-01-22','period_end_date':'2018-01-28','traffic':972,'sales':13418.21,'conversion':15.3292181069959,'ats':90.0551006711409,'star':6.09901505791772,'upt':0.966442953020134,'sps':13.8047427983539,'splh':84.1953341978417,'aur':93.1820138888889,'transactions':149},
        {'org_id':3068,'site_id':880058787,'sales_category_id':1,'period_start_date':'2018-01-22','period_end_date':'2018-01-28','traffic':2052,'sales':31927.2,'conversion':20.6627680311891,'ats':75.3,'star':9.37714199529288,'upt':1.80660377358491,'sps':15.5590643274854,'splh':145.899555512726,'aur':41.6804177545692,'transactions':424}
      ]
    };
    $scope.selectedCategory = '';
    $scope.dateFormatMask = 'DD-MM-YYYY';
    $scope.filterString = {};

    var element = angular.element(
      '<retail-organization-table-widget ' +
      'org-id="orgId" ' +
      'org-sites="orgSites" ' +
      'date-range-start="dateRangeStart" ' +
      'date-range-end="dateRangeEnd" ' +
      'widget-title="Organization summary" ' +
      'widget-icon="site" ' +
      'site-categories="siteCategories" ' +
      'compare-range-1-start="compareRange1Start" ' +
      'compare-range-1-end="compareRange1End" ' +
      'compare-range-2-start="compareRange2Start" ' +
      'compare-range-2-end="compareRange2End" ' +
      'current-organization="currentOrganization" ' +
      'current-user="currentUser" ' +
      'date-format-mask="dateFormat" ' +
      'selected-tags="selectedTags" ' +
      'widget-data="widgetData" ' +
      'selected-category="selectedCategory" ' +
      'org-has-interior="false" ' +
      'org-has-sales="true" ' +
      'org-has-labor="true" ' +
      'operating-hours="true" ' +
      'is-loading="true" ' +
      'filter-text="filterString" ' +
      'selectedMetrics="" >' +
      '</retail-organization-table-widget>'
    );

    $compile(element)($scope);
    $scope.$digest();

    return element.controller('retailOrganizationTableWidget');
  }

  function putTemplateToTemplateCache($templateCache) {
    // Put an empty template to the template cache to prevent Angular from
    // trying to fetch it. We are only testing the vm here, so the
    // actual template is not needed.
    $templateCache.put(
      'components/widgets/table-widget/retail-organization-table-widget/retail-organization-table-widget.partial.html',
      '<div></div>'
    );
  };

});
