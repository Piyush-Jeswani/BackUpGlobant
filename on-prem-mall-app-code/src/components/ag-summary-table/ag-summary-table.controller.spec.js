'use strict';

describe('agSummaryTable', function () {

  var $compile,
  $scope, 
  $q, 
  vm,
  metricNameServiceMock,
  gridOptions;

  beforeEach(module('shopperTrak', function($translateProvider) {
    $translateProvider.translations('en_US', {});
  }));

  beforeEach(module('shopperTrak.widgets'));

  beforeEach(module(function ($provide) {
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

  }));

  beforeEach(inject(putTemplateToTemplateCache));

  beforeEach(inject(function (
    $rootScope,
    _$compile_,
    _$q_) {
    $compile = _$compile_;
    $scope = $rootScope.$new();
    $q = _$q_;

    vm = renderDirectiveAndDigest();

  }));

  it('should define the controller', function(){
    expect(vm).toBeDefined();
  });

  it('should init scope variables', function(){
    expect(vm.columnHeaders).toBeDefined();
    expect(vm.rows).toBeDefined();
    expect(vm.isLoading).toBeDefined();
    expect(vm.numberFormatName).toBeDefined();
  });

  it('should build the gridOptions', function(){
    expect(vm.gridOptions).toBeDefined();
    expect(vm.gridOptions.rowData).toBeDefined();
    expect(vm.gridOptions.columnDefs).toBeDefined();
    expect(vm.gridOptions.enableSorting).toEqual(true);
    expect(vm.gridOptions.angularCompileRows).toEqual(true);
    expect(vm.gridOptions.angularCompileHeaders).toEqual(true);
    expect(vm.gridOptions.rowHeight).toEqual(34);
    expect(vm.gridOptions.headerHeight).toEqual(34);
  });

  it('should have the correct column structure', function(){
    expect(vm.gridOptions.columnDefs[0].headerName).toBe('<span class="sticon sticon-change"></span>');
    expect(vm.gridOptions.columnDefs[0].field).toBe('dayOfWeek');
    expect(typeof vm.gridOptions.columnDefs[0].cellClass).toEqual('function');
    expect(typeof vm.gridOptions.columnDefs[0].cellRenderer).toEqual('function');
  })

  it('should have the correct row structure', function(){
    var row = {
      conversion : 14.5519637780352,
      dayOfWeek : 'weekdaysLong.mon',
      labor_hours : 5308.14,
      labor_hours_contribution : 12.56445980165341,
      sales : 677625.62,
      sales_contribution : 8.02467651050164,
      star : 8.94569449505021,
      traffic : 47485,
      traffic_contribution : 7.876673699855355,
      transactions : 6910,
      transactions_contribution : 7.380901516769921
    }

    expect(vm.gridOptions.rowData[0]).toEqual(row);
  });

  

  function renderDirectiveAndDigest() {

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
    $scope.tableData = [
      {"dayOfWeek":"weekdaysLong.mon","dayOfWeekIndex":0,"sales":677625.62,"traffic":47485,"labor_hours":5308.14,"transactions":6910,"conversion":14.5519637780352,"star":8.94569449505021,"sales_contribution":8.02467651050164,"traffic_contribution":7.876673699855355,"labor_hours_contribution":12.56445980165341,"transactions_contribution":7.380901516769921,"conversion_contribution":13.003946945908568,"star_contribution":9.470870549830211},
      {"dayOfWeek":"weekdaysLong.tue","dayOfWeekIndex":1,"sales":660451.36,"traffic":45122,"labor_hours":5381.8,"transactions":6944,"conversion":15.3893887682284,"star":8.38418403462335,"sales_contribution":7.821292994973926,"traffic_contribution":7.484706132144327,"labor_hours_contribution":12.73881430417026,"transactions_contribution":7.417218543046358,"conversion_contribution":13.752287878428449,"star_contribution":8.87639542148541},
      {"dayOfWeek":"weekdaysLong.wed","dayOfWeekIndex":2,"sales":924672.39,"traffic":51982,"labor_hours":5533.6,"transactions":9507,"conversion":18.2890231233889,"star":9.39388446628388,"sales_contribution":10.950289642151388,"traffic_contribution":8.622622981275795,"labor_hours_contribution":13.098127547206612,"transactions_contribution":10.154881435590687,"conversion_contribution":16.343463330222498,"star_contribution":9.945372468226251},
      {"dayOfWeek":"weekdaysLong.thu","dayOfWeekIndex":3,"sales":825130.62,"traffic":49689,"labor_hours":5344.66,"transactions":8842,"conversion":17.794682927811,"star":9.296942845261,"sales_contribution":9.771481639684248,"traffic_contribution":8.242266809984473,"labor_hours_contribution":12.650903277514328,"transactions_contribution":9.444563127536851,"conversion_contribution":15.9017103287322,"star_contribution":9.842739682800099},
      {"dayOfWeek":"weekdaysLong.fri","dayOfWeekIndex":4,"sales":1221438.34,"traffic":82251,"labor_hours":6244.67,"transactions":13662,"conversion":16.6101323996061,"star":13.1713927283612,"sales_contribution":14.464694466575981,"traffic_contribution":13.643556670249612,"labor_hours_contribution":14.781242617864448,"transactions_contribution":14.593035676137578,"conversion_contribution":14.843170570216921,"star_contribution":13.94464740108294},
      {"dayOfWeek":"weekdaysLong.sat","dayOfWeekIndex":5,"sales":2220969.36,"traffic":175276,"labor_hours":7840.18,"transactions":25641,"conversion":14.6289280905543,"star":22.3561188735735,"sales_contribution":26.30148584661817,"traffic_contribution":29.074273126584128,"labor_hours_contribution":18.55784256777836,"transactions_contribution":27.38837855159154,"conversion_contribution":13.07272390632386,"star_contribution":23.668582463372196},
      {"dayOfWeek":"weekdaysLong.sun","dayOfWeekIndex":6,"sales":1913985.66,"traffic":151051,"labor_hours":6594.21,"transactions":22114,"conversion":14.6400884469484,"star":22.9066106318709,"sales_contribution":22.66607889949465,"traffic_contribution":25.055900579906314,"labor_hours_contribution":15.608609883812582,"transactions_contribution":23.621021149327067,"conversion_contribution":13.082697040167513,"star_contribution":24.251392013202892}
    ]
    $scope.metricDisplayInfo = [
      {"kpi":"sales","value":"sales","label":"Sales","precision":0,"requiredSubscriptions":["sales"],"subscription":"sales","realTimeRequiredPermissions":["realtime_sales"],"realTimeSubscription":"realtime_sales","icon":"sales","group":"perimeter","apiReturnkey":"sales_amount","translationLabel":"kpis.kpiTitle.sales","shortTranslationLabel":"kpis.shortKpiTitles.tenant_sales","isCurrency":true,"prefixSymbol":"$","suffixSymbol":"","order":3,"translatedShortLabel":"Sales","displayName":"Sales","apiPropertyName":"sales","chartLocation":"left"},
      {"kpi":"traffic","value":"traffic","label":"Traffic","precision":0,"requiredSubscriptions":[],"subscription":"any","realTimeRequiredPermissions":[],"realTimeSubscription":"realtime_traffic","icon":"entrance","group":"any","apiReturnkey":"total_traffic","translationLabel":"kpis.kpiTitle.traffic","shortTranslationLabel":"kpis.shortKpiTitles.tenant_traffic","isCurrency":false,"prefixSymbol":"","suffixSymbol":"","order":1,"translatedShortLabel":"Traffic","displayName":"Traffic","apiPropertyName":"traffic","chartLocation":"left"},
      {"kpi":"labor_hours","value":"labor","label":"Labor","precision":1,"requiredSubscriptions":["labor"],"subscription":"labor","realTimeRequiredPermissions":["realtime_labor"],"realTimeSubscription":"realtime_labor","icon":"labor-fat","group":"perimeter","apiReturnkey":"labor","translationLabel":"kpis.kpiTitle.labor_hours","shortTranslationLabel":"kpis.shortKpiTitles.tenant_labor","isCurrency":false,"prefixSymbol":"","suffixSymbol":"","order":10,"translatedShortLabel":"Labour","displayName":"Labour","apiPropertyName":"labor_hours","chartLocation":"left"},
      {"kpi":"transactions","value":"transactions","label":"Transactions","precision":0,"requiredSubscriptions":["sales"],"subscription":"sales","realTimeRequiredPermissions":["realtime_sales"],"realTimeSubscription":"realtime_sales","icon":"transactions","group":"perimeter","apiReturnkey":"transactions","translationLabel":"kpis.kpiTitle.transactions","shortTranslationLabel":"kpis.shortKpiTitles.tenant_transactions","isCurrency":false,"prefixSymbol":"","suffixSymbol":"","order":5,"translatedShortLabel":"Transactions","displayName":"Transactions","apiPropertyName":"transactions","chartLocation":"left"},
      {"kpi":"conversion","value":"conversion","label":"Conversion","precision":2,"requiredSubscriptions":["sales"],"subscription":"sales","realTimeRequiredPermissions":["realtime_sales"],"realTimeSubscription":"realtime_sales","icon":"conversion","group":"perimeter","apiReturnkey":"conversion","translationLabel":"kpis.kpiTitle.conversion","shortTranslationLabel":"kpis.shortKpiTitles.tenant_conversion","isCurrency":false,"prefixSymbol":"","suffixSymbol":"%","order":4,"calculated":true,"translatedShortLabel":"Conversion","displayName":"Conversion","apiPropertyName":"conversion","chartLocation":"right","hidePercentColumn":true},
      {"kpi":"star","value":"star","label":"STAR","precision":0,"requiredSubscriptions":["sales","labor"],"subscription":"labor","realTimeRequiredPermissions":["realtime_sales","realtime_labor"],"realTimeSubscription":"realtime_labor","icon":"star-labor-fat","group":"perimeter","apiReturnkey":"star","translationLabel":"kpis.kpiTitle.star","shortTranslationLabel":"kpis.shortKpiTitles.tenant_star","isCurrency":false,"prefixSymbol":"","suffixSymbol":"","order":11,"calculated":true,"translatedShortLabel":"STAR","displayName":"STAR","apiPropertyName":"star","chartLocation":"right","hidePercentColumn":true}]
    $scope.averages = {
      "sales":1206324.7642857141,
      "traffic":86122.28571428571,
      "labor_hours":6035.322857142857,
      "transactions":13374.285714285714,
      "conversion":15.52941332590204,
      "star":14
    }
    $scope.changeType = "contribution"
    var element = angular.element(
      '<ag-summary-table ' +
      'current-org="currentOrganization" ' +
      'current-user="currentUser" ' +
      'table-data="tableData" ' +
      'columns="metricDisplayInfo" ' +
      'total-row="averages" ' +
      'compare-type="changeType" ' +
      'watch-prop="isLoading" >' +
      '</ag-summary-table>'
    );

    $compile(element)($scope);
    $scope.$digest();

    return element.controller('agSummaryTable');
  }

  function putTemplateToTemplateCache($templateCache) {
    // Put an empty template to the template cache to prevent Angular from
    // trying to fetch it. We are only testing the controller here, so the
    // actual template is not needed.
    $templateCache.put(
      'components/ag-summary-table/ag-summary-table.partial.html',
      '<div></div>'
    );
  }

});
