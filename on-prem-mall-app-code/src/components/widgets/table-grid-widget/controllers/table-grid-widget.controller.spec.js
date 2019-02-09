'use strict';

describe('TableGridWidgetController', function () {
  var apiUrl = 'https://api.url';
  var $httpBackend, $timeout, $filter;
  var $scope, $rootScope, $document, $compile, OrganizationResource, WidgetLibraryService, MetricDataService, $q, controller, metricData;

  OrganizationResource = function () {
    return {
      get: function () {
        var dfd = $q.defer();
        dfd.resolve([{
          name: 'North Face',
          subscriptions:{
            interior: true,
            perimeter: true,
            large_format_mall: true,
            sales: true,
            labor:true
          }
        }]);
        return {
          $promise: dfd.promise
        }
      }
    };
  }

  MetricDataService = function () {
    return {
      getDataByKpi: function () {
        var dfd = $q.defer();
        dfd.resolve({
          result: metricData
        });
        return dfd.promise;
      }
    }
  }

  WidgetLibraryService = function () {
    return {
      getAllOrgSites: function () {
        var dfd = $q.defer();
        dfd.resolve([{
          'name': 'North Face - New York',
          'site_id': 50420,
          'customer_site_id': '12',
          'organization': {
            'id': 3068,
            'name': 'North Face'
          },
          'business_day_start_hour': 0,
          'fullAccess': true
        }, {
          'name': 'North Face - Beverly Hills',
          'site_id': 11988,
          'customer_site_id': '11',
          'organization': {
            'id': 3068,
            'name': 'North Face'
          },
          'business_day_start_hour': 0,
          'fullAccess': true
        }, {
          'name': 'North Face - Palo Alto',
          'site_id': 51179,
          'customer_site_id': '03',
          'organization': {
            'id': 3068,
            'name': 'North Face'
          },
          'business_day_start_hour': 0,
          'fullAccess': true
        }]);
        return {
          $promise: dfd.promise
        }
      },
      filterAllowedMetrics: function () {
        return [{
          kpi: 'traffic',
          value: 'traffic',
          label: 'Traffic',
          precision: 0,
          requiredSubscriptions: [],
          subscription: 'any',
          realTimeRequiredPermissions: [],
          realTimeSubscription: 'realtime_traffic',
          icon: 'entrance',
          group: 'any',
          apiReturnkey: 'total_traffic',
          translationLabel: 'kpis.kpiTitle.traffic',
          shortTranslationLabel: 'kpis.shortKpiTitles.tenant_traffic',
          isCurrency: false,
          prefixSymbol: '',
          suffixSymbol: '',
          order: 1
        }, {
          kpi: 'conversion',
          value: 'conversion',
          label: 'Conversion',
          precision: 2,
          requiredSubscriptions: [
            'sales'
          ],
          subscription: 'sales',
          realTimeRequiredPermissions: [
            'realtime_sales'
          ],
          realTimeSubscription: 'realtime_sales',
          icon: 'conversion',
          group: 'perimeter',
          apiReturnkey: 'conversion',
          translationLabel: 'kpis.kpiTitle.conversion',
          shortTranslationLabel: 'kpis.shortKpiTitles.tenant_conversion',
          isCurrency: false,
          prefixSymbol: '',
          suffixSymbol: '%',
          order: 4,
          calculated: true
        }, {
          kpi: 'sales',
          value: 'sales',
          label: 'Sales',
          precision: 0,
          requiredSubscriptions: ['sales'],
          subscription: 'sales',
          realTimeRequiredPermissions: ['realtime_sales'],
          realTimeSubscription: 'realtime_sales',
          icon: 'sales',
          group: 'perimeter',
          apiReturnkey: 'sales_amount',
          translationLabel: 'kpis.kpiTitle.sales',
          shortTranslationLabel: 'kpis.shortKpiTitles.tenant_sales',
          isCurrency: true,
          prefixSymbol: '',
          suffixSymbol: '',
          order: 3
        }];
      }
    }
  }

  beforeEach(module('shopperTrak'));

  beforeEach(module(function ($provide) {
    $provide.constant('apiUrl', apiUrl);
    $provide.factory('OrganizationResource', OrganizationResource);
    $provide.factory('widgetLibraryService', WidgetLibraryService);
    $provide.factory('MetricDataService', MetricDataService);
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

  beforeEach(inject(function ($templateCache) {
    $templateCache.put(
      'components/widgets/table-grid-widget/views/partials/table-grid-widget.partial.html',
      '<div></div>'
    );
  }));

  beforeEach(inject(function (
    _$rootScope_,
    _$compile_,
    _$q_,
    _$httpBackend_,
    _$timeout_,
    _$filter_,
    _$document_
  ) {
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $compile = _$compile_;
    $q = _$q_;
    $httpBackend = _$httpBackend_;
    $timeout = _$timeout_;
    $filter = _$filter_;
    $document = _$document_;
    $rootScope.pdf = false;

    $rootScope.pdf = true;
    $rootScope.pdfExportsLoaded = 0;
    controller = renderDirectiveAndDigest();
  }));

  it('controller should be defined', function () {
    expect(controller).toBeDefined();
  });

  it('controller has required bindings', function () {
    expect(controller.config).toBeDefined();
    expect(controller.widgetIcon).toBeDefined();
    expect(controller.hideExportIcon).toBeDefined();
    expect(controller.exportIsDisabled).toBeDefined();
    expect(controller.dateRangeStart).toBeDefined();
    expect(controller.dateRangeEnd).toBeDefined();
    expect(controller.currentUser).toBeDefined();
    expect(controller.currentOrg).toBeDefined();
  });

  describe('setNoDATA', function () {

    describe('site level', function () {
      beforeEach(function () {
        controller = renderDirectiveAndDigest(false);
        $timeout.flush();
      });

      it('should set no data to Site', function () {
        expect(controller.gridOptions.rowData.length).toEqual(0);
      });
    });

    describe('org level', function () {
      beforeEach(function () {
        controller = renderDirectiveAndDigest(true);
        $timeout.flush();
      });

      it('should set no data to Organisation', function () {
        expect(controller.gridOptions.rowData.length).toEqual(0);
      });
    });

    it('should set headers when there is data', function () {
      renderWithData();
      expect(controller.gridOptions.columnDefs[0].field).toEqual('rowName');
      expect(controller.gridOptions.columnDefs[1].field).toEqual('traffic');
      expect(controller.gridOptions.columnDefs[2].field).toEqual('conversion');
      expect(controller.gridOptions.columnDefs[3].field).toEqual('sales');
    });

    it('should call sizeColumnsToFit when controller.gridOptions.onGridReady', function () {
      renderWithData();
      expect(controller.gridOptions.columnDefs[0].field).toEqual('rowName');
      expect(controller.gridOptions.columnDefs[1].field).toEqual('traffic');
      expect(controller.gridOptions.columnDefs[2].field).toEqual('conversion');
      expect(controller.gridOptions.columnDefs[3].field).toEqual('sales');
      var params = {
        api: {
          sizeColumnsToFit: function() {
            return;
          }

        }
      };
      spyOn(params.api, 'sizeColumnsToFit').and.callThrough();
      controller.gridOptions.onGridReady(params);
      expect(params.api.sizeColumnsToFit).toHaveBeenCalled();
    });

    it('should call sizeColumnsToFit when controller.gridOptions.onGridReady and should reset row heights for long site names when it is pdf', function () {
      $rootScope.pdf = true;
      renderWithData();
      expect(controller.gridOptions.columnDefs[0].field).toEqual('rowName');
      expect(controller.gridOptions.columnDefs[1].field).toEqual('traffic');
      expect(controller.gridOptions.columnDefs[2].field).toEqual('conversion');
      expect(controller.gridOptions.columnDefs[3].field).toEqual('sales');
      var params = {
        api: {
          sizeColumnsToFit: function() {
            return;
          },
          forEachNode: function(rowNode) {
            controller.rowHeightChanged = true;
            return {};
          },
          onRowHeightChanged: function() {
            return;
          }

        }
      };
      spyOn(params.api, 'sizeColumnsToFit').and.callThrough();

      spyOn(params.api, 'forEachNode').and.callThrough();
      spyOn(params.api, 'onRowHeightChanged').and.callThrough();
      $document[0].querySelectorAll = function() {
        return angular.element('<div calss="ag-row-level-0"> </div>');
      }
      controller.gridOptions.onGridReady(params);
      $timeout.flush();
      expect(params.api.sizeColumnsToFit).toHaveBeenCalled();
      expect(params.api.forEachNode).toHaveBeenCalled();
      expect(params.api.onRowHeightChanged).toHaveBeenCalled();
    });

    it('should have a correct number of columns', function () {
      renderWithData();
      expect(controller.gridOptions.columnDefs.length).toEqual(4);
    });
  });

  describe('setRowData', function () {

    describe('site level', function () {
      beforeEach(function () {
        metricData = [{
          sales: 945271.269999999, conversion: 18.2727815954586, traffic: 61159, site_id: 50420, org_id: 3068
        },
        {
          sales: null, conversion: 29.1625463535229, traffic: 47185, site_id: 11988, org_id: 3068
        }, {
          sales: 352069.08, conversion: 21.2621951219512, traffic: 31383, site_id: 51179, org_id: 3068
        }];

        controller = renderDirectiveAndDigest(false);
      });

      it('should set rows', function () {
        expect(controller.gridOptions.rowData[0].rowName).toEqual('North Face - New York');
        expect(controller.gridOptions.rowData[0].sales).toEqual('$945,271');
        expect(controller.gridOptions.rowData[0].conversion).toEqual('18.27%');
        expect(controller.gridOptions.rowData[0].traffic).toEqual('61,159');
        expect(controller.gridOptions.rowData[1].rowName).toEqual('North Face - Beverly Hills');
        expect(controller.gridOptions.rowData[1].sales).toEqual('-');
        expect(controller.gridOptions.rowData[1].conversion).toEqual('29.16%');
        expect(controller.gridOptions.rowData[1].traffic).toEqual('47,185');
        expect(controller.gridOptions.rowData[2].rowName).toEqual('North Face - Palo Alto');
        expect(controller.gridOptions.rowData[2].sales).toEqual('$352,069');
        expect(controller.gridOptions.rowData[2].conversion).toEqual('21.26%');
        expect(controller.gridOptions.rowData[2].traffic).toEqual('31,383');
      });

      it('should have a correct number of rows', function () {
        expect(controller.gridOptions.rowData.length).toEqual(3);
      });
    });

    describe('org level', function () {
      beforeEach(function () {
        metricData = [{
          sales: 34765049.1000001, conversion: 15.9937984315054, traffic: 2738890, org_id: 3068
        }];

        controller = renderDirectiveAndDigest(true);
        $timeout.flush();
      });

      it('should set rows', function () {
        expect(controller.gridOptions.rowData[0].sales).toEqual('$34,765,049');
        expect(controller.gridOptions.rowData[0].conversion).toEqual('15.99%');
        expect(controller.gridOptions.rowData[0].traffic).toEqual('2,738,890');
      });

      it('should have a correct number of rows', function () {
        expect(controller.gridOptions.rowData.length).toEqual(1);
      });
    });

    describe('has an empty column', function () {
      beforeEach(function () {
        metricData = [{
          sales: null, conversion: 18.2727815954586, traffic: 61159, site_id: 50420, org_id: 3068
        },
        {
          sales: null, conversion: 29.1625463535229, traffic: 47185, site_id: 11988, org_id: 3068
        }, {
          sales: null, conversion: 21.2621951219512, traffic: 31383, site_id: 51179, org_id: 3068
        }];

        controller = renderDirectiveAndDigest(false);
      });

      it('should have a correct number of columns', function () {
        expect(controller.gridOptions.columnDefs.length).toEqual(3);
      });
    });

    describe('when PDF is built', function() {

      it('should set the gridOptions.domLayout as "forPrint"', function(){
        expect(controller.gridOptions.domLayout).toBe('forPrint');
      });
    });


  });

  function renderDirectiveAndDigest(orgLevel) {
    $scope.dateRangeStart = moment('2017-08-01', 'YYYY-MM-DD');
    $scope.dateRangeEnd = moment('2017-08-30', 'YYYY-MM-DD');
    $scope.config = {
      'widgetType': 'data-grid',
      'widgetName': 'Example Widget',
      'widgetDescription': 'A widget that shows Traffic, Sales and Conversion summaries across an Organisation',
      'distributedOrgs': [
        { 'organization_id': 5210 },
        { 'organization_id': 5440 },
        { 'organization_id': 3068 }
      ],
      'columns': [
        'traffic',
        'conversion',
        'sales'
      ],
      'orgLevel': orgLevel,
      'controls': [{
        'name': 'Filter',
        'selected': true
      }, {
        'name': 'Sorting',
        'selected': true
      }, {
        'name': 'Column Resize',
        'selected': true
      }
      ],
      'auditTrail': {
        'creator': '5891acb1f01125972d0f00ed',
        'creatorName': 'Dean Hand',
        'creationDate': '2017-09-11T10:39:54.682Z',
        'edits': []
      }
    };
    $scope.currentUser = {
      localization:{
        locale: "en_GB",
        date_format:{mask: "DD/MM/YYYY"},
        number_format:{decimal_separator: '.', thousands_separator: ','}
      }
    };
    $scope.widgetIcon = 'info';
    $scope.currentOrg = {
      organization_id: 3068,
      subscriptions: {
        sales:true,
        labor:true
      }
    }

    var element = angular.element(
      '<table-grid-widget' +
      ' config="config"' +
      ' widget-icon="widgetIcon"' +
      ' hide-export-icon="false"' +
      ' export-is-disabled="false"' +
      ' date-range-start="dateRangeStart"' +
      ' date-range-end="dateRangeEnd"' +
      ' current-user="currentUser"' +
      ' current-org="currentOrg">' +
      '</table-grid-widget>'
    );

    $compile(element)($scope);
    $scope.$digest();

    return element.controller('tableGridWidget');
  }

  function renderWithData() {
    metricData = [{
      sales: 945271.269999999, conversion: 18.2727815954586, traffic: 61159, site_id: 50420, org_id: 3068
    },
    {
      sales: null, conversion: 29.1625463535229, traffic: 47185, site_id: 11988, org_id: 3068
    }, {
      sales: 352069.08, conversion: 21.2621951219512, traffic: 31383, site_id: 51179, org_id: 3068
    }];
    controller = renderDirectiveAndDigest(true);
    $timeout.flush();
  }
});
