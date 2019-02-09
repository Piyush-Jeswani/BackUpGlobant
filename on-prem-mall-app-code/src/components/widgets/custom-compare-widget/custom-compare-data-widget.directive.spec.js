'use strict';

describe('customCompareDataWidget', function () {

  var $compile, $scope, $rootScope, $q, $timeout;
  var SiteResource;
  var orgCompareService;
  var dateRangeHelper;
  var utils;
  var LocalizationService;
  var currencyServiceMock = {
    getCurrencySymbol: function (orgid, siteid) {
      angular.noop(orgid);
      angular.noop(siteid);
      var defer = $q.defer();
      defer.resolve('$');
      return defer.promise;
    }
  }
  var widgetOrgCustomCompareMock = {
    name: 'org-custom-compare',
    activeSelectedMetrics: { 0: 'traffic' },
    chart_name: 'Traffic Comparison Mall of Arabia vs Mall of Dharan over the last year',
    organizationId: 10,
    currentOrganization: {
      name: 'org'
    },
    compare: {
      chart_name: 'Traffic Comparison Mall of Arabia vs Mall of Dharan over the last year',
      selected_date_range: {
        period_type: 'prior_period'
      }
    },
    siteId: 80030032,
    dateRangeShortCut: 'year',
    dateRanges: {
      dateRange: {
        start: '01-01-2017',
        end: '01-08-2017'
      },
      compare1Range: {
        start: '01-01-2016',
        end: '01-08-2016'
      },
      compare2Range: {
        start: '01-01-2016',
        end: '01-08-2016'
      }

    },
    compareSites: {
      0: 80030032,
      1: 80029911
    },
    dateRange: {
      start: '01-01-2017',
      end: '01-08-2017'
    },
    compare_period_1: {
      custom_end_date: '',
      custom_start_date: '',
      period_type: 'prior_period'
    },
    compare_period_2: {
      custom_end_date: '',
      custom_start_date: '',
      period_type: 'prior_year'
    },
    firstDayOfWeekSetting: 0,
    metrics: ['Traffic']
  };
  var newDashboard = {
    widgets: [widgetMock, widgetOrgCustomCompareMock],
    name: 'neDashboardTest1',
    position: 1
  };

  var widgetMock = {
    name: 'org-compare',
    activeSelectedMetrics: { 0: 'traffic' },
    chart_name: 'Traffic Comparison Mall of Arabia vs Mall of Dharan over the last year',
    organizationId: 10,
    currentOrganization: {
      name: 'org'
    },
    compare: {
      chart_name: 'Traffic Comparison Mall of Arabia vs Mall of Dharan over the last year',
      selected_date_range: {
        period_type: 'prior_period'
      }
    },
    siteId: 80030032,
    dateRangeShortCut: 'year',
    compareSites: {
      0: 80030032,
      1: 80029911
    },
    dateRange: {
      start: '01-01-2017',
      end: '01-08-2017'
    },
    compare_period_1: {
      custom_end_date: '',
      custom_start_date: '',
      period_type: 'prior_period'
    },
    compare_period_2: {
      custom_end_date: '',
      custom_start_date: '',
      period_type: 'prior_year'
    },
    firstDayOfWeekSetting: 0
  };

  var chartData = {
    chartWithData: [
      {
        id: 50420,
        item: {
          business_day_start_hour: 0,
          currencySymbol: '$',
          customer_site_id: '12',
          fullAccess: true,
          name: 'North Face - New York',
          organization: { id: 3068, name: 'North Face' },
          site_id: 50420
        }
      }],
    labels: ['11/5/17', '11/6/17', '11/7/17', '11/8/17', '11/9/17', '11/10/17', '11/11/17'],
    series: [[524, 373, 480, 579, 617, 866, 1270]]
  };

  var tableData = {
    tableData: [
      {
        tag: {
          id: 50420, type: 'site', name: 'North Face - New York', item: {
            business_day_start_hour: 0,
            currencySymbol: '$',
            customer_site_id: '12',
            fullAccess: true,
            name: 'North Face - New York',
            organization: {
              id: 3068,
              name: 'North Face'
            },
            site_id: 50420
          }
        },
        tagIndex: 0,
        traffic: {
          comparePeriodContribution: 100,
          comparePeriodData: 3368,
          deltaColoringPeriod: 'positive',
          percentageChangePeriod: '39.8%',
          percentageChangeReal: 39.815914489311155,
          periodContribution: 100,
          periodData: 4709
        }
      },
      {
        tag: {
          id: 11988, type: 'site', name: 'North Face - Beverly Hills', item: {
            business_day_start_hour: 0,
            currencySymbol: '$',
            customer_site_id: '11',
            fullAccess: true,
            name: 'North Face - Beverly Hills',
            organization: {
              id: 3068,
              name: 'North Face'
            },
            site_id: 11988
          },
          tagIndex: 1,
          traffic: {
            comparePeriodContribution: 0,
            comparePeriodData: 0,
            deltaColoringPeriod: '',
            percentageChangePeriod: '-',
            percentageChangeReal: null,
            periodContribution: 0,
            periodData: 0
          }
        }
      }
    ]
  };

  var sites = [{
    site_id: 1023,
    timezone: 'Europe/Rome',
    customer_site_id: '0067',
    name: 'site1',
    OrganizationResource: {
      id: 10
    }
  }];

  var organization = { organization_id: 10, subscriptions: {traffic: true, sales: true, peel_off: true} };


  beforeEach(module('shopperTrak'));

  beforeEach(module(function ($provide) {
    $provide.factory('getOrganization', myGetOrganization);
    $provide.value('currentOrganization', organization);
    $provide.factory('currencyService', function () {
      return currencyServiceMock;
    });
  }));

  beforeEach(inject(putTemplateToTemplateCache));

  beforeEach(inject(function (_$rootScope_,
    _$compile_, _$state_, _$timeout_, _requestManager_, _$q_, _OrganizationResource_, _orgCompareService_, _dateRangeHelper_, _utils_, _LocalizationService_, _SiteResource_) {
    $rootScope = _$rootScope_;
    $compile = _$compile_;
    $scope = $rootScope.$new();
    $q = _$q_;
    $timeout = _$timeout_;
    orgCompareService = _orgCompareService_;
    dateRangeHelper = _dateRangeHelper_;
    utils = _utils_;
    LocalizationService = _LocalizationService_;
    SiteResource = _SiteResource_;
  }));

  beforeEach(function () {
    orgCompareService.transformDataForChart = function () {
      return chartData;
    },
      orgCompareService.transformDataForTable = function () {
        return tableData;
      }
  });

  beforeEach(function () {
    dateRangeHelper.getDateRange = function () {
      return {
        start: moment.utc('2017-01-01', 'YYYY-MM-DD'),
        end: moment.utc('2017-11-30', 'YYYY-MM-DD')
      }
    }
  });

  beforeEach(function () {
    utils.getShortcutDateRange = function () {
      return {
        start: moment.utc('2017-01-01', 'YYYY-MM-DD'),
        end: moment.utc('2017-11-30', 'YYYY-MM-DD')
      }
    },
      utils.getDateRangeForPreviousMTD = function () {
        return {
          start: moment.utc('2016-01-01', 'YYYY-MM-DD'),
          end: moment.utc('2016-11-30', 'YYYY-MM-DD')
        }
      },
      utils.compareDate = function (currentTime, firstDayOfCurrentQuarter) {
        angular.noop(currentTime);
        angular.noop(firstDayOfCurrentQuarter);
        return 0;
      },
      utils.getDateRangeForPreviousYTD = function (dateRange) {
        angular.noop(dateRange);

        return {
          start: moment.utc('2016-01-01', 'YYYY-MM-DD'),
          end: moment.utc('2016-11-30', 'YYYY-MM-DD')
        };
      }
  });

  beforeEach(function () {
    LocalizationService.getActiveCalendarSettings = function () {
      return 1;
    },
      LocalizationService.getFirstDayOfCurrentWeek = function () {
        return moment('20.09.2017', 'DD.MM.YYYY');
      },
      LocalizationService.isCurrentCalendarGregorian = function () {
        return true;
      },
      LocalizationService.getSystemYearForDate = function (currentTime) {
        var year = { year: 2017 }
        var monthIndex = 7;

        angular.noop(currentTime);

        return {
          year: year.year,
          month: monthIndex - 1
        };
      },
      LocalizationService.getFirstDayOfMonth = function (month, year) {

        angular.noop(month);

        var years = [
          {
            'year': 2014,
            'start_date': '2014-02-02T00:00:00.000Z',
            'start_month': 1,
            'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
          },
          {
            'year': 2015,
            'start_date': '2015-02-01T00:00:00.000Z',
            'start_month': 1,
            'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
          },
          {
            'year': 2016,
            'start_date': '2016-01-31T00:00:00.000Z',
            'start_month': 1,
            'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
          },
          {
            'year': 2017,
            'start_date': '2016-01-31T00:00:00.000Z',
            'start_month': 1,
            'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
          },
          {
            'year': 2018,
            'start_date': '2016-01-31T00:00:00.000Z',
            'start_month': 1,
            'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
          },
          {
            'year': 2016,
            'start_date': '2016-01-31T00:00:00.000Z',
            'start_month': 1,
            'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
          },
          {
            'year': 2017,
            'start_date': '2017-01-31T00:00:00.000Z',
            'start_month': 1,
            'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
          },
          {
            'year': 2018,
            'start_date': '2018-01-31T00:00:00.000Z',
            'start_month': 1,
            'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
          },
          {
            'year': 2019,
            'start_date': '2019-01-31T00:00:00.000Z',
            'start_month': 1,
            'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
          },
          {
            'year': 2020,
            'start_date': '2020-01-31T00:00:00.000Z',
            'start_month': 1,
            'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
          },
          {
            'year': 2021,
            'start_date': '2021-01-31T00:00:00.000Z',
            'start_month': 1,
            'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
          },
          {
            'year': 2022,
            'start_date': '2022-01-31T00:00:00.000Z',
            'start_month': 1,
            'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
          },
          {
            'year': 2023,
            'start_date': '2023-01-31T00:00:00.000Z',
            'start_month': 1,
            'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
          },
          {
            'year': 2024,
            'start_date': '2024-01-31T00:00:00.000Z',
            'start_month': 1,
            'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
          },
          {
            'year': 2025,
            'start_date': '2025-01-31T00:00:00.000Z',
            'start_month': 1,
            'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
          },
          {
            'year': 2026,
            'start_date': '2026-01-31T00:00:00.000Z',
            'start_month': 1,
            'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
          },
          {
            'year': 2027,
            'start_date': '2027-01-31T00:00:00.000Z',
            'start_month': 1,
            'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
          },
          {
            'year': 2028,
            'start_date': '2028-01-31T00:00:00.000Z',
            'start_month': 1,
            'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
          },
          {
            'year': 2029,
            'start_date': '2029-01-31T00:00:00.000Z',
            'start_month': 1,
            'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
          },
          {
            'year': 2030,
            'start_date': '2030-01-31T00:00:00.000Z',
            'start_month': 1,
            'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
          }
        ];

        var weeksFromStart = 0;

        var currentYear = _.findWhere(years, { year: year });

        var firstDayOfYear = moment.utc(currentYear.start_date);

        return firstDayOfYear.add(weeksFromStart, 'weeks');
      },
      LocalizationService.getLastDayOfMonth = function (month, year) {

        angular.noop(month);

        var years = [
          {
            'year': 2014,
            'start_date': '2014-02-02T00:00:00.000Z',
            'start_month': 1,
            'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
          },
          {
            'year': 2015,
            'start_date': '2015-02-01T00:00:00.000Z',
            'start_month': 1,
            'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
          },
          {
            'year': 2016,
            'start_date': '2016-01-31T00:00:00.000Z',
            'start_month': 1,
            'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
          },
          {
            'year': 2017,
            'start_date': '2016-01-31T00:00:00.000Z',
            'start_month': 1,
            'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
          },
          {
            'year': 2018,
            'start_date': '2016-01-31T00:00:00.000Z',
            'start_month': 1,
            'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
          },
          {
            'year': 2016,
            'start_date': '2016-01-31T00:00:00.000Z',
            'start_month': 1,
            'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
          },
          {
            'year': 2017,
            'start_date': '2017-01-31T00:00:00.000Z',
            'start_month': 1,
            'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
          },
          {
            'year': 2018,
            'start_date': '2018-01-31T00:00:00.000Z',
            'start_month': 1,
            'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
          },
          {
            'year': 2019,
            'start_date': '2019-01-31T00:00:00.000Z',
            'start_month': 1,
            'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
          },
          {
            'year': 2020,
            'start_date': '2020-01-31T00:00:00.000Z',
            'start_month': 1,
            'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
          },
          {
            'year': 2021,
            'start_date': '2021-01-31T00:00:00.000Z',
            'start_month': 1,
            'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
          },
          {
            'year': 2022,
            'start_date': '2022-01-31T00:00:00.000Z',
            'start_month': 1,
            'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
          },
          {
            'year': 2023,
            'start_date': '2023-01-31T00:00:00.000Z',
            'start_month': 1,
            'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
          },
          {
            'year': 2024,
            'start_date': '2024-01-31T00:00:00.000Z',
            'start_month': 1,
            'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
          },
          {
            'year': 2025,
            'start_date': '2025-01-31T00:00:00.000Z',
            'start_month': 1,
            'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
          },
          {
            'year': 2026,
            'start_date': '2026-01-31T00:00:00.000Z',
            'start_month': 1,
            'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
          },
          {
            'year': 2027,
            'start_date': '2027-01-31T00:00:00.000Z',
            'start_month': 1,
            'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
          },
          {
            'year': 2028,
            'start_date': '2028-01-31T00:00:00.000Z',
            'start_month': 1,
            'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
          },
          {
            'year': 2029,
            'start_date': '2029-01-31T00:00:00.000Z',
            'start_month': 1,
            'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
          },
          {
            'year': 2030,
            'start_date': '2030-01-31T00:00:00.000Z',
            'start_month': 1,
            'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
          }
        ];

        var weeksFromStart = 0;

        var currentYear = _.findWhere(years, { year: year });

        var firstDayOfYear = moment.utc(currentYear.start_date);

        return firstDayOfYear.add(weeksFromStart, 'weeks');
      },
      LocalizationService.getLastDayOfCurrentWeek = function () {
        var start = moment('01-01-2017');

        return start.add(6, 'days').endOf('day');
      },
      LocalizationService.isGregorian = function (currentCalendarSettings) {
        angular.noop(currentCalendarSettings);

        return false;
      },
      LocalizationService.hasMonthDefinitions = function () {
        return true;
      }
  });

  beforeEach(function () {
    SiteResource.query = function (orgId) {
      angular.noop(orgId);

      var deferred = $q.defer();
      deferred.resolve({ result: sites });
      return {
        $promise: deferred.promise
      };
    }
  });

  describe('directive instantiation', function () {
    it('should test directive constructor with $rootScope.pdf set to true and compare set', function () {
      $rootScope.pdf = true;
      $scope.compare = {
        organization_id: organization.organization_id,
        name: 'Test Org 1',
        portal_settings: 'test',
        subscriptions: organization.subscriptions
      };
      spyOn(orgCompareService, 'setMetricLookup').and.callThrough();

      var vm = renderDirectiveAndDigest();

      expect(vm.loaded).toEqual(false);
      expect(vm.trueVal).toEqual(true);
      expect(vm.showAverage).toEqual(false);
      expect(vm.hideExportIcon).toEqual($rootScope.pdf);
      expect(vm.pdf).toEqual($rootScope.pdf);
      expect(vm.requestFailed).toEqual(false);
      expect(vm.hasTableData).toEqual(false);
      expect(vm.minLength).toEqual(1);
      expect(vm.maxLength).toEqual(1);
      expect(vm.chartGraphClass).toEqual('col-xs-12');
      expect(vm.chartLegendClass).toEqual('col-xs-12');
      expect(orgCompareService.setMetricLookup).toHaveBeenCalled();
      expect(vm.dateFormatMask).toEqual('MM/DD/YYYY');
      expect(vm.currentOrganization).toEqual(organization);
      expect(vm.sites.result[0].site_id).toEqual(1023);
    });
    it('should test directive constructor with $rootScope.pdf set to false, $rootScope.customDashboards set to true, no sites set and compare set', function () {
      $rootScope.pdf = false;
      $rootScope.customDashboards = true;
      $scope.compare = {
        organization_id: 10,
        name: 'Test Org 1',
        portal_settings: 'test',
        subscriptions: {
          interior: true
        }
      };

      var vm = renderDirectiveAndDigest();

      expect(vm.loaded).toEqual(false);
      expect(vm.trueVal).toEqual(true);
      expect(vm.showAverage).toEqual(false);
      expect(vm.hideExportIcon).toEqual($rootScope.pdf);
      expect(vm.pdf).toEqual($rootScope.pdf);
      expect(vm.requestFailed).toEqual(false);
      expect(vm.hasTableData).toEqual(false);
      expect(vm.minLength).toEqual(1);
      expect(vm.maxLength).toEqual(1);
      expect(vm.chartGraphClass).toEqual('col-xs-12  col-md-9 col-lg-10');
      expect(vm.chartLegendClass).toEqual('col-xs-12 col-md-3 col-lg-2');
    });
    it('should test directive constructor with currentUser set, $rootScope.pdf set to false, $rootScope.customDashboards \
        set to true, sites set, compare set (with hierarchy tag id for multi), compare-compare_period_1-period_type set to custom, current organization set, \
        selectedDateRange set, date range set, customDatePeriod1 \
        set, comparePeriods set and previewInProgress true', function () {
        $scope.currentUser = {
          _id: 1,
          preferences: {
            calendar_id: 3,
            custom_dashboards: [newDashboard],
            market_intelligence: {},
            custom_period_1: {
              period_type: 'custom'
            },
            custom_period_2: {
              period_type: 'custom'
            }
          },
          localization: {
            locale: 'en-us',
            date_format: {
              mask: 'dd-mm-yyyy'
            }
          }
        };
        $rootScope.pdf = false;
        $rootScope.customDashboards = true;
        $scope.sites = [{
            site_id: 1000,
            timezone: 'Europe/Rome',
            customer_site_id: '0067',
            name: 'site1',
            OrganizationResource: {
              id: 10
            }
          }, {
            site_id: 57778,
            timezone: 'Europe/Rome',
            customer_site_id: 57778,
            name: 57778,
            OrganizationResource: {
              id: 10
            }
          }, {
            site_id: 57777,
            timezone: 'Europe/Rome',
            customer_site_id: 57777,
            name: 57777,
            OrganizationResource: {
              id: 10
            }
          }
        ];
        $scope.compare = {
          organization_id: 10,
          name: 'Test Org 1',
          portal_settings: 'test',
          subscriptions: {
            interior: true
          },
          selected_date_range: { period_type: 'custom' },
          activeSelectedComparePeriods: [{ x: 'x', p: 'p' }, { y: 'y', q: 'q' }],
          compare_period_1: { period_type: 'custom' },
          type: 'multi',
          metrics: ['traffic'],
          sites: [
            12345678,
            57777,
            57778
          ],
          hierarchy_tag_ids: ['576d54845f8731540e48bbaf']
        };
        $scope.currentOrganization = {
          'organization_id': 10,
          'name': 'Foobar',
          'subscriptions': {
            'advanced': false,
            'campaigns': false,
            'labor': false,
            'sales': false,
            'market_intelligence': false,
            'qlik': false,
            'large_format_mall': true,
            'interior': false,
            'perimeter': true
          },
          'portal_settings': {
            'sales_categories': [{ id: 1 }, { id: 2 }],
            'organization_type': 'Mall',
            group_structures: {
              levels: {},
              group: [{ id: 1, data: 'test' }, { id: 2, data: 'test' }]
            }
          }
        }
        $scope.selectedDateRange = { start: moment('20.09.2017', 'DD.MM.YYYY') };
        $scope.customDatePeriod1 = {
          custom_end_date: '',
          custom_start_date: '',
          period_type: 'prior_period'
        }
        $scope.comparePeriods = [{
          custom_end_date: '',
          custom_start_date: '',
          period_type: 'prior_period'
        },
        {
          custom_end_date: '',
          custom_start_date: '',
          period_type: 'prior_period'
        }
        ];
        $scope.previewInProgress = true;

        var vm = renderDirectiveAndDigest();

        expect(vm.loaded).toEqual(true);
        expect(vm.trueVal).toEqual(true);
        expect(vm.showAverage).toEqual(false);
        expect(vm.hideExportIcon).toEqual($rootScope.pdf);
        expect(vm.pdf).toEqual($rootScope.pdf);
        expect(vm.requestFailed).toEqual(true);
        expect(vm.hasTableData).toEqual(false);
        expect(vm.minLength).toEqual(1);
        expect(vm.maxLength).toEqual(5);
        expect(vm.chartGraphClass).toEqual('col-xs-12  col-md-9 col-lg-10');
        expect(vm.chartLegendClass).toEqual('col-xs-12 col-md-3 col-lg-2');
        expect(vm.dateRanges.dateRange).toEqual(vm.selectedDatePeriod);
        expect(vm.dateRanges.compare1Range).toEqual(vm.comparePeriods[0].datePeriod);
        expect(vm.metricSetByCode).toEqual(true);

        var Element0 = vm.tags.pop();    
        expect(Element0.id).toEqual(57778);
        expect(Element0.type).toEqual('site');
        expect(Element0.name).toEqual(57778);
        expect(Element0.item).toBeDefined();
 
        var Element1 = vm.tags.pop();
        expect(Element1.id).toEqual(57777);
        expect(Element1.type).toEqual('site');
        expect(Element1.name).toEqual(57777);
        expect(Element1.item).toBeDefined();

        var Element3 = vm.tags.pop();
        expect(Element3.id).toEqual('576d54845f8731540e48bbaf');
        expect(Element3.type).toEqual('hierarchy_tag');
        expect(Element3.name).toEqual(undefined);
        expect(Element3.item).toEqual({});

        expect(vm.compare.type).toEqual('multi');
      });
    it('should test directive constructor with currentUser set, $rootScope.pdf set to false, $rootScope.customDashboards \
        set to true, sites set, compare set (with hierarchy tag id for single), compare-compare_period_1-period_type set to custom, current organization set, \
        selectedDateRange set, date range set, customDatePeriod1 \
        set, comparePeriods set and previewInProgress true', function () {
        $scope.currentUser = {
          _id: 1,
          preferences: {
            calendar_id: 3,
            custom_dashboards: [newDashboard],
            market_intelligence: {},
            custom_period_1: {
              period_type: 'custom'
            },
            custom_period_2: {
              period_type: 'custom'
            }
          },
          localization: {
            locale: 'en-us',
            date_format: {
              mask: 'dd-mm-yyyy'
            }
          }
        };
        $rootScope.pdf = false;
        $rootScope.customDashboards = true;
        $scope.sites = [{
          site_id: 1000,
          timezone: 'Europe/Rome',
          customer_site_id: '0067',
          name: 'site1',
          OrganizationResource: {
            id: 10
          }
        }];
        $scope.compare = {
          organization_id: 10,
          name: 'Test Org 1',
          portal_settings: 'test',
          subscriptions: {
            interior: true
          },
          selected_date_range: { period_type: 'custom' },
          activeSelectedComparePeriods: [{ x: 'x', p: 'p' }, { y: 'y', q: 'q' }],
          compare_period_1: { period_type: 'custom' },
          type: 'single',
          metrics: ['traffic'],
          sites: [
            12345678,
            57777,
            57778
          ],
          hierarchy_tag_ids: ['576d54845f8731540e48bbaf']
        };
        $scope.currentOrganization = {
          'organization_id': 10,
          'name': 'Foobar',
          'subscriptions': {
            'advanced': false,
            'campaigns': false,
            'labor': false,
            'sales': false,
            'market_intelligence': false,
            'qlik': false,
            'large_format_mall': true,
            'interior': false,
            'perimeter': true
          },
          'portal_settings': {
            'sales_categories': [{ id: 1 }, { id: 2 }],
            'organization_type': 'Mall',
            group_structures: {
              levels: {},
              group: [{ id: 1, data: 'test' }, { id: 2, data: 'test' }]
            }
          }
        }
        $scope.selectedDateRange = { start: moment('20.09.2017', 'DD.MM.YYYY') };
        $scope.sites = [
          {
            site_id: 57778,
            timezone: 'Europe/Rome',
            customer_site_id: 57778,
            name: 57778,
            OrganizationResource: {
              id: 10
            }
          }, {
            site_id: 57777,
            timezone: 'Europe/Rome',
            customer_site_id: 57777,
            name: 57777,
            OrganizationResource: {
              id: 10
            }
          }, 
          {
            site_id: 12345678,
            timezone: 'Europe/Rome',
            customer_site_id: 12345678,
            name: 12345678,
            OrganizationResource: {
              id: 10
            }
          }
        ]
        $scope.customDatePeriod1 = {
          custom_end_date: '',
          custom_start_date: '',
          period_type: 'prior_period'
        }
        $scope.comparePeriods = [{
          custom_end_date: '',
          custom_start_date: '',
          period_type: 'prior_period'
        },
        {
          custom_end_date: '',
          custom_start_date: '',
          period_type: 'prior_period'
        }
        ];
        $scope.previewInProgress = true;

        var vm = renderDirectiveAndDigest();

        expect(vm.loaded).toEqual(true);
        expect(vm.trueVal).toEqual(true);
        expect(vm.showAverage).toEqual(false);
        expect(vm.hideExportIcon).toEqual($rootScope.pdf);
        expect(vm.pdf).toEqual($rootScope.pdf);
        expect(vm.requestFailed).toEqual(true);
        expect(vm.hasTableData).toEqual(false);
        expect(vm.minLength).toEqual(1);
        expect(vm.maxLength).toEqual(1);
        expect(vm.chartGraphClass).toEqual('col-xs-12  col-md-9 col-lg-10');
        expect(vm.chartLegendClass).toEqual('col-xs-12 col-md-3 col-lg-2');
        expect(vm.dateRanges.dateRange).toEqual(vm.selectedDatePeriod);
        expect(vm.dateRanges.compare1Range).toEqual(vm.comparePeriods[0].datePeriod);
        expect(vm.metricSetByCode).toEqual(true);

        var Element0 = vm.tags.pop();

        expect(Element0.id).toEqual(57778);
        expect(Element0.type).toEqual('site');
        expect(Element0.name).toEqual(57778);
        expect(Element0.item).toBeDefined();

        var Element1 = vm.tags.pop();
        expect(Element1.id).toEqual(57777);
        expect(Element1.type).toEqual('site');
        expect(Element1.name).toEqual(57777);
        expect(Element1.item).toBeDefined();

        var Element2 = vm.tags.pop();
        expect(Element2.id).toEqual(12345678);
        expect(Element2.type).toEqual('site');
        expect(Element2.name).toEqual(12345678);
        expect(Element2.item).toBeDefined();

        var Element3 = vm.tags.pop();
        expect(Element3.id).toEqual('576d54845f8731540e48bbaf');
        expect(Element3.type).toEqual('hierarchy_tag');
        expect(Element3.name).toEqual(undefined);
        expect(Element3.item).toEqual({});

        expect(vm.compare.type).toEqual('single');
      });
    it('should test directive constructor with currentUser set, $rootScope.pdf set to false, $rootScope.customDashboards \
        set to true, sites set, compare set, compare.compare_period_1.period_type set to prior_period,\
        compare.selected_date_range.period_type set to custom \
        current organization set, \
        selectedDateRange set, date range set, customDatePeriod1 \
        set, comparePeriods set and previewInProgress true', function () {
        $scope.currentUser = {
          _id: 1,
          preferences: {
            calendar_id: 3,
            custom_dashboards: [newDashboard],
            market_intelligence: {},
            custom_period_1: {
              period_type: 'custom'
            },
            custom_period_2: {
              period_type: 'custom'
            }
          },
          localization: {
            locale: 'en-us',
            date_format: {
              mask: 'dd-mm-yyyy'
            }
          }
        };
        $rootScope.pdf = false;
        $rootScope.customDashboards = true;
        $scope.sites = [{
          site_id: 1000,
          timezone: 'Europe/Rome',
          customer_site_id: '0067',
          name: 'site1',
          OrganizationResource: {
            id: 10
          }
        }];
        $scope.compare = {
          organization_id: 10,
          name: 'Test Org 1',
          portal_settings: 'test',
          subscriptions: {
            interior: true
          },
          selected_date_range: { period_type: 'custom' },
          activeSelectedComparePeriods: [{ x: 'x', p: 'p' }, { y: 'y', q: 'q' }],
          compare_period_1: { period_type: 'prior_period' },
          type: 'multi',
          metrics: ['traffic']
        };
        $scope.currentOrganization = {
          'organization_id': 10,
          'name': 'Foobar',
          'subscriptions': {
            'advanced': false,
            'campaigns': false,
            'labor': false,
            'sales': false,
            'market_intelligence': false,
            'qlik': false,
            'large_format_mall': true,
            'interior': false,
            'perimeter': true
          }
        }
        $scope.selectedDateRange = { start: moment('20.09.2017', 'DD.MM.YYYY') };
        $scope.customDatePeriod1 = {
          custom_end_date: '',
          custom_start_date: '',
          period_type: 'prior_period'
        }
        $scope.comparePeriods = [{
          custom_end_date: '',
          custom_start_date: '',
          period_type: 'prior_period'
        },
        {
          custom_end_date: '',
          custom_start_date: '',
          period_type: 'prior_period'
        }
        ];
        $scope.previewInProgress = true;

        var vm = renderDirectiveAndDigest();

        expect(vm.loaded).toEqual(true);
        expect(vm.trueVal).toEqual(true);
        expect(vm.showAverage).toEqual(false);
        expect(vm.hideExportIcon).toEqual($rootScope.pdf);
        expect(vm.pdf).toEqual($rootScope.pdf);
        expect(vm.requestFailed).toEqual(true);
        expect(vm.hasTableData).toEqual(false);
        expect(vm.minLength).toEqual(1);
        expect(vm.maxLength).toEqual(5);
        expect(vm.chartGraphClass).toEqual('col-xs-12  col-md-9 col-lg-10');
        expect(vm.chartLegendClass).toEqual('col-xs-12 col-md-3 col-lg-2');
        expect(vm.dateRanges.dateRange).toEqual(vm.selectedDatePeriod);
        expect(vm.dateRanges.compare1Range).toEqual(vm.comparePeriods[0].datePeriod);
        expect(vm.metricSetByCode).toEqual(true);
      });
    it('should test directive constructor with currentUser set, $rootScope.pdf set to false, $rootScope.customDashboards \
        set to true, sites set, compare set, compare-compare_period_1-period_type set to prior_period,\
        compare.selected_date_range.period_type set to week \
        current organization set, \
        selectedDateRange set, date range set, customDatePeriod1 \
        set, comparePeriods set and previewInProgress true', function () {
        $scope.currentUser = {
          _id: 1,
          preferences: {
            calendar_id: 3,
            custom_dashboards: [newDashboard],
            market_intelligence: {},
            custom_period_1: {
              period_type: 'custom'
            },
            custom_period_2: {
              period_type: 'custom'
            }
          },
          localization: {
            locale: 'en-us',
            date_format: {
              mask: 'dd-mm-yyyy'
            }
          }
        };
        $rootScope.pdf = false;
        $rootScope.customDashboards = true;
        $scope.sites = [{
          site_id: 1000,
          timezone: 'Europe/Rome',
          customer_site_id: '0067',
          name: 'site1',
          OrganizationResource: {
            id: 10
          }
        }];
        $scope.compare = {
          organization_id: 10,
          name: 'Test Org 1',
          portal_settings: 'test',
          subscriptions: {
            interior: true
          },
          selected_date_range: { period_type: 'week' },
          activeSelectedComparePeriods: [{ x: 'x', p: 'p' }, { y: 'y', q: 'q' }],
          compare_period_1: { period_type: 'prior_period' },
          type: 'multi',
          metrics: ['traffic']
        };
        $scope.currentOrganization = {
          'organization_id': 10,
          'name': 'Foobar',
          'subscriptions': {
            'advanced': false,
            'campaigns': false,
            'labor': false,
            'sales': false,
            'market_intelligence': false,
            'qlik': false,
            'large_format_mall': true,
            'interior': false,
            'perimeter': true
          }
        }
        $scope.selectedDateRange = { start: moment('20.09.2017', 'DD.MM.YYYY') };
        $scope.customDatePeriod1 = {
          custom_end_date: '',
          custom_start_date: '',
          period_type: 'prior_period'
        }
        $scope.comparePeriods = [{
          custom_end_date: '',
          custom_start_date: '',
          period_type: 'prior_period'
        },
        {
          custom_end_date: '',
          custom_start_date: '',
          period_type: 'prior_period'
        }
        ];
        $scope.previewInProgress = true;

        var vm = renderDirectiveAndDigest();

        expect(vm.loaded).toEqual(true);
        expect(vm.trueVal).toEqual(true);
        expect(vm.showAverage).toEqual(false);
        expect(vm.hideExportIcon).toEqual($rootScope.pdf);
        expect(vm.pdf).toEqual($rootScope.pdf);
        expect(vm.requestFailed).toEqual(true);
        expect(vm.hasTableData).toEqual(false);
        expect(vm.minLength).toEqual(1);
        expect(vm.maxLength).toEqual(5);
        expect(vm.chartGraphClass).toEqual('col-xs-12  col-md-9 col-lg-10');
        expect(vm.chartLegendClass).toEqual('col-xs-12 col-md-3 col-lg-2');
        expect(vm.dateRanges.dateRange).toEqual(vm.selectedDatePeriod);
        expect(vm.dateRanges.compare1Range).toEqual(vm.comparePeriods[0].datePeriod);
        expect(vm.metricSetByCode).toEqual(true);
        expect(vm.customDatePeriod1).toEqual(vm.comparePeriods[0].datePeriod);
        var lastItemAdded = vm.selectedComparePeriods.pop();
        expect(lastItemAdded).toEqual(vm.comparePeriods[0]);
      });
    it('should test directive constructor with currentUser set, $rootScope.pdf set to false, $rootScope.customDashboards \
        set to true, sites set, compare set, compare-compare_period_1-period_type set to prior_period,\
        compare.selected_date_range.period_type set to week_to_date \
        current organization set, \
        selectedDateRange set, date range set, customDatePeriod1 \
        set, comparePeriods set and previewInProgress true', function () {
        $scope.currentUser = {
          _id: 1,
          preferences: {
            calendar_id: 3,
            custom_dashboards: [newDashboard],
            market_intelligence: {},
            custom_period_1: {
              period_type: 'custom'
            },
            custom_period_2: {
              period_type: 'custom'
            }
          },
          localization: {
            locale: 'en-us',
            date_format: {
              mask: 'dd-mm-yyyy'
            }
          }
        };
        $rootScope.pdf = false;
        $rootScope.customDashboards = true;
        $scope.sites = [{
          site_id: 1000,
          timezone: 'Europe/Rome',
          customer_site_id: '0067',
          name: 'site1',
          OrganizationResource: {
            id: 10
          }
        }];
        $scope.compare = {
          organization_id: 10,
          name: 'Test Org 1',
          portal_settings: 'test',
          subscriptions: {
            interior: true
          },
          selected_date_range: { period_type: 'week_to_date' },
          activeSelectedComparePeriods: [{ x: 'x', p: 'p' }, { y: 'y', q: 'q' }],
          compare_period_1: { period_type: 'prior_period' },
          type: 'multi',
          metrics: ['traffic']
        };
        $scope.currentOrganization = {
          'organization_id': 10,
          'name': 'Foobar',
          'subscriptions': {
            'advanced': false,
            'campaigns': false,
            'labor': false,
            'sales': false,
            'market_intelligence': false,
            'qlik': false,
            'large_format_mall': true,
            'interior': false,
            'perimeter': true
          }
        }
        $scope.selectedDateRange = { start: moment('20.09.2017', 'DD.MM.YYYY') };
        $scope.customDatePeriod1 = {
          custom_end_date: '',
          custom_start_date: '',
          period_type: 'prior_period'
        }
        $scope.comparePeriods = [{
          custom_end_date: '',
          custom_start_date: '',
          period_type: 'prior_period'
        },
        {
          custom_end_date: '',
          custom_start_date: '',
          period_type: 'prior_period'
        }
        ];
        $scope.previewInProgress = true;

        var vm = renderDirectiveAndDigest();

        expect(vm.loaded).toEqual(true);
        expect(vm.trueVal).toEqual(true);
        expect(vm.showAverage).toEqual(false);
        expect(vm.hideExportIcon).toEqual($rootScope.pdf);
        expect(vm.pdf).toEqual($rootScope.pdf);
        expect(vm.requestFailed).toEqual(true);
        expect(vm.hasTableData).toEqual(false);
        expect(vm.minLength).toEqual(1);
        expect(vm.maxLength).toEqual(5);
        expect(vm.chartGraphClass).toEqual('col-xs-12  col-md-9 col-lg-10');
        expect(vm.chartLegendClass).toEqual('col-xs-12 col-md-3 col-lg-2');
        expect(vm.metricSetByCode).toEqual(true);

        var lastItemAdded = vm.selectedComparePeriods.pop();
        expect(lastItemAdded).toEqual(vm.comparePeriods[0]);
      });
    it('should test directive constructor with currentUser set, $rootScope.pdf set to false, $rootScope.customDashboards \
        set to true, sites set, compare set, compare-compare_period_1-period_type set to prior_period,\
        compare.selected_date_range.period_type set to month_to_date \
        current organization set, \
        selectedDateRange set, date range set, customDatePeriod1 \
        set, comparePeriods set and previewInProgress true', function () {
        $scope.currentUser = {
          _id: 1,
          preferences: {
            calendar_id: 3,
            custom_dashboards: [newDashboard],
            market_intelligence: {},
            custom_period_1: {
              period_type: 'custom'
            },
            custom_period_2: {
              period_type: 'custom'
            }
          },
          localization: {
            locale: 'en-us',
            date_format: {
              mask: 'dd-mm-yyyy'
            }
          }
        };
        $rootScope.pdf = false;
        $rootScope.customDashboards = true;
        $scope.sites = [{
          site_id: 1000,
          timezone: 'Europe/Rome',
          customer_site_id: '0067',
          name: 'site1',
          OrganizationResource: {
            id: 10
          }
        }];
        $scope.compare = {
          organization_id: 10,
          name: 'Test Org 1',
          portal_settings: 'test',
          subscriptions: {
            interior: true
          },
          selected_date_range: { period_type: 'month_to_date' },
          activeSelectedComparePeriods: [{ x: 'x', p: 'p' }, { y: 'y', q: 'q' }],
          compare_period_1: { period_type: 'prior_period' },
          type: 'multi',
          metrics: ['traffic']
        };
        $scope.currentOrganization = {
          'organization_id': 10,
          'name': 'Foobar',
          'subscriptions': {
            'advanced': false,
            'campaigns': false,
            'labor': false,
            'sales': false,
            'market_intelligence': false,
            'qlik': false,
            'large_format_mall': true,
            'interior': false,
            'perimeter': true
          }
        }
        $scope.selectedDateRange = { start: moment('20.09.2017', 'DD.MM.YYYY') };
        $scope.customDatePeriod1 = {
          custom_end_date: '',
          custom_start_date: '',
          period_type: 'prior_period'
        }
        $scope.comparePeriods = [{
          custom_end_date: '',
          custom_start_date: '',
          period_type: 'prior_period'
        },
        {
          custom_end_date: '',
          custom_start_date: '',
          period_type: 'prior_period'
        }
        ];
        $scope.previewInProgress = true;

        var vm = renderDirectiveAndDigest();

        expect(vm.loaded).toEqual(true);
        expect(vm.trueVal).toEqual(true);
        expect(vm.showAverage).toEqual(false);
        expect(vm.hideExportIcon).toEqual($rootScope.pdf);
        expect(vm.pdf).toEqual($rootScope.pdf);
        expect(vm.requestFailed).toEqual(true);
        expect(vm.hasTableData).toEqual(false);
        expect(vm.minLength).toEqual(1);
        expect(vm.maxLength).toEqual(5);
        expect(vm.chartGraphClass).toEqual('col-xs-12  col-md-9 col-lg-10');
        expect(vm.chartLegendClass).toEqual('col-xs-12 col-md-3 col-lg-2');
        expect(vm.metricSetByCode).toEqual(true);

        var lastItemAdded = vm.selectedComparePeriods.pop();
        expect(lastItemAdded).toEqual(vm.comparePeriods[0]);
      });
    it('should test directive constructor with currentUser set, $rootScope.pdf set to false, $rootScope.customDashboards \
        set to true, sites set, compare set, compare-compare_period_1-period_type set to prior_period,\
        compare.selected_date_range.period_type set to quarter_to_date \
        current organization set, \
        selectedDateRange set, date range set, customDatePeriod1 \
        set, comparePeriods set and previewInProgress true', function () {
        $scope.currentUser = {
          _id: 1,
          preferences: {
            calendar_id: 3,
            custom_dashboards: [newDashboard],
            market_intelligence: {},
            custom_period_1: {
              period_type: 'custom'
            },
            custom_period_2: {
              period_type: 'custom'
            }
          },
          localization: {
            locale: 'en-us',
            date_format: {
              mask: 'dd-mm-yyyy'
            }
          }
        };
        $rootScope.pdf = false;
        $rootScope.customDashboards = true;
        $scope.sites = [{
          site_id: 1000,
          timezone: 'Europe/Rome',
          customer_site_id: '0067',
          name: 'site1',
          OrganizationResource: {
            id: 10
          }
        }];
        $scope.compare = {
          organization_id: 10,
          name: 'Test Org 1',
          portal_settings: 'test',
          subscriptions: {
            interior: true
          },
          selected_date_range: { period_type: 'quarter_to_date' },
          activeSelectedComparePeriods: [{ x: 'x', p: 'p' }, { y: 'y', q: 'q' }],
          compare_period_1: { period_type: 'prior_period' },
          type: 'multi',
          metrics: ['traffic']
        };
        $scope.currentOrganization = {
          'organization_id': 10,
          'name': 'Foobar',
          'subscriptions': {
            'advanced': false,
            'campaigns': false,
            'labor': false,
            'sales': false,
            'market_intelligence': false,
            'qlik': false,
            'large_format_mall': true,
            'interior': false,
            'perimeter': true
          }
        }
        $scope.selectedDateRange = { start: moment('20.09.2017', 'DD.MM.YYYY') };
        $scope.customDatePeriod1 = {
          custom_end_date: '',
          custom_start_date: '',
          period_type: 'prior_period'
        }
        $scope.comparePeriods = [{
          custom_end_date: '',
          custom_start_date: '',
          period_type: 'prior_period'
        },
        {
          custom_end_date: '',
          custom_start_date: '',
          period_type: 'prior_period'
        }
        ];
        $scope.previewInProgress = true;

        spyOn(LocalizationService, 'getSystemYearForDate').and.callThrough();
        spyOn(utils, 'getFirstMonthInQuarter').and.callThrough();
        spyOn(LocalizationService, 'getFirstDayOfMonth').and.callThrough();
        spyOn(utils, 'compareDate').and.callThrough();
        spyOn(LocalizationService, 'getLastDayOfMonth').and.callThrough();
        spyOn(utils, 'getEquivalentPriorYearDateRange').and.callThrough();
        spyOn(utils, 'getDateRangeForPreviousQTD').and.callThrough();

        var vm = renderDirectiveAndDigest();

        expect(vm.loaded).toEqual(true);
        expect(vm.trueVal).toEqual(true);
        expect(vm.showAverage).toEqual(false);
        expect(vm.hideExportIcon).toEqual($rootScope.pdf);
        expect(vm.pdf).toEqual($rootScope.pdf);
        expect(vm.requestFailed).toEqual(true);
        expect(vm.hasTableData).toEqual(false);
        expect(vm.minLength).toEqual(1);
        expect(vm.maxLength).toEqual(5);
        expect(vm.chartGraphClass).toEqual('col-xs-12  col-md-9 col-lg-10');
        expect(vm.chartLegendClass).toEqual('col-xs-12 col-md-3 col-lg-2');
        expect(vm.metricSetByCode).toEqual(true);

        var lastItemAdded = vm.selectedComparePeriods.pop();
        expect(lastItemAdded).toEqual(vm.comparePeriods[0]);

        expect(LocalizationService.getSystemYearForDate).toHaveBeenCalled();
        expect(utils.getFirstMonthInQuarter).toHaveBeenCalled();
        expect(LocalizationService.getFirstDayOfMonth).toHaveBeenCalled();
        expect(utils.compareDate).toHaveBeenCalled();
        expect(LocalizationService.getLastDayOfMonth).toHaveBeenCalled();
        expect(utils.getEquivalentPriorYearDateRange).toHaveBeenCalled();
        expect(utils.getDateRangeForPreviousQTD).toHaveBeenCalled();
        expect(vm.dateRanges.dateRange.start.format('DD/MM/YYYY')).toEqual('31/01/2016');
        expect(vm.dateRanges.dateRange.end.format('DD/MM/YYYY')).toEqual('31/01/2016');
      });
    it('should test directive constructor with currentUser set, $rootScope.pdf set to false, $rootScope.customDashboards \
            set to true, sites set, compare set, compare-compare_period_1-period_type set to prior_period,\
            compare.selected_date_range.period_type set to quarter \
            current organization set, \
            selectedDateRange set, date range set, customDatePeriod1 \
            set, comparePeriods set and previewInProgress true', function () {
        $scope.currentUser = {
          _id: 1,
          preferences: {
            calendar_id: 3,
            custom_dashboards: [newDashboard],
            market_intelligence: {},
            custom_period_1: {
              period_type: 'custom'
            },
            custom_period_2: {
              period_type: 'custom'
            }
          },
          localization: {
            locale: 'en-us',
            date_format: {
              mask: 'dd-mm-yyyy'
            }
          }
        };
        $rootScope.pdf = false;
        $rootScope.customDashboards = true;
        $scope.sites = [{
          site_id: 1000,
          timezone: 'Europe/Rome',
          customer_site_id: '0067',
          name: 'site1',
          OrganizationResource: {
            id: 10
          }
        }];
        $scope.compare = {
          organization_id: 10,
          name: 'Test Org 1',
          portal_settings: 'test',
          subscriptions: {
            interior: true
          },
          selected_date_range: { period_type: 'quarter' },
          activeSelectedComparePeriods: [{ x: 'x', p: 'p' }, { y: 'y', q: 'q' }],
          compare_period_1: { period_type: 'prior_period' },
          type: 'multi',
          metrics: ['traffic']
        };
        $scope.currentOrganization = {
          'organization_id': 10,
          'name': 'Foobar',
          'subscriptions': {
            'advanced': false,
            'campaigns': false,
            'labor': false,
            'sales': false,
            'market_intelligence': false,
            'qlik': false,
            'large_format_mall': true,
            'interior': false,
            'perimeter': true
          }
        }
        $scope.selectedDateRange = { start: moment('20.09.2017', 'DD.MM.YYYY') };
        $scope.customDatePeriod1 = {
          custom_end_date: '',
          custom_start_date: '',
          period_type: 'prior_period'
        }
        $scope.comparePeriods = [{
          custom_end_date: '',
          custom_start_date: '',
          period_type: 'prior_period'
        },
        {
          custom_end_date: '',
          custom_start_date: '',
          period_type: 'prior_period'
        }
        ];
        $scope.previewInProgress = true;

        spyOn(utils, 'getPreviousCalendarPeriodDateRange').and.callThrough();
        spyOn(LocalizationService, 'isGregorian').and.callThrough();
        spyOn(utils, 'getEquivalentPriorYearDateRange').and.callThrough();
        spyOn(LocalizationService, 'getFirstDayOfMonth').and.callThrough();

        var vm = renderDirectiveAndDigest();

        expect(vm.loaded).toEqual(true);
        expect(vm.trueVal).toEqual(true);
        expect(vm.showAverage).toEqual(false);
        expect(vm.hideExportIcon).toEqual($rootScope.pdf);
        expect(vm.pdf).toEqual($rootScope.pdf);
        expect(vm.requestFailed).toEqual(true);
        expect(vm.hasTableData).toEqual(false);
        expect(vm.minLength).toEqual(1);
        expect(vm.maxLength).toEqual(5);
        expect(vm.chartGraphClass).toEqual('col-xs-12  col-md-9 col-lg-10');
        expect(vm.chartLegendClass).toEqual('col-xs-12 col-md-3 col-lg-2');
        expect(vm.metricSetByCode).toEqual(true);

        var lastItemAdded = vm.selectedComparePeriods.pop();
        expect(lastItemAdded).toEqual(vm.comparePeriods[0]);

        expect(utils.getPreviousCalendarPeriodDateRange).toHaveBeenCalled();
        expect(LocalizationService.isGregorian).toHaveBeenCalled();
        expect(utils.getEquivalentPriorYearDateRange).toHaveBeenCalled();
        expect(LocalizationService.getFirstDayOfMonth).toHaveBeenCalled();
      });
    it('should test directive constructor with currentUser set, $rootScope.pdf set to false, $rootScope.customDashboards \
        set to true, sites set, compare set, compare-compare_period_1-period_type set to prior_period,\
        compare.selected_date_range.period_type set to year_to_date \
        current organization set, \
        selectedDateRange set, date range set, customDatePeriod1 \
        set, comparePeriods set and previewInProgress true', function () {
        $scope.currentUser = {
          _id: 1,
          preferences: {
            calendar_id: 3,
            custom_dashboards: [newDashboard],
            market_intelligence: {},
            custom_period_1: {
              period_type: 'custom'
            },
            custom_period_2: {
              period_type: 'custom'
            }
          },
          localization: {
            locale: 'en-us',
            date_format: {
              mask: 'dd-mm-yyyy'
            }
          }
        };
        $rootScope.pdf = false;
        $rootScope.customDashboards = true;
        $scope.sites = [{
          site_id: 1000,
          timezone: 'Europe/Rome',
          customer_site_id: '0067',
          name: 'site1',
          OrganizationResource: organization
        }];
        $scope.compare = {
          organization_id: 10,
          name: 'Test Org 1',
          portal_settings: 'test',
          subscriptions: {
            interior: true
          },
          selected_date_range: { period_type: 'year_to_date' },
          activeSelectedComparePeriods: [{ x: 'x', p: 'p' }, { y: 'y', q: 'q' }],
          compare_period_1: { period_type: 'prior_period' },
          type: 'multi',
          metrics: ['traffic']
        };
        $scope.currentOrganization = {
          'organization_id': 10,
          'name': 'Foobar',
          'subscriptions': {
            'advanced': false,
            'campaigns': false,
            'labor': false,
            'sales': false,
            'market_intelligence': false,
            'qlik': false,
            'large_format_mall': true,
            'interior': false,
            'perimeter': true
          }
        }
        $scope.selectedDateRange = { start: moment('20.09.2017', 'DD.MM.YYYY') };
        $scope.customDatePeriod1 = {
          custom_end_date: '',
          custom_start_date: '',
          period_type: 'prior_period'
        }
        $scope.comparePeriods = [{
          custom_end_date: '',
          custom_start_date: '',
          period_type: 'prior_period'
        },
        {
          custom_end_date: '',
          custom_start_date: '',
          period_type: 'prior_period'
        }
        ];
        $scope.previewInProgress = true;

        spyOn(utils, 'getDateRangeForPreviousYTD').and.callThrough();
        spyOn(utils, 'getEquivalentPriorYearDateRange').and.callThrough();
        spyOn(LocalizationService, 'isGregorian').and.callThrough();

        var vm = renderDirectiveAndDigest();

        expect(vm.loaded).toEqual(true);
        expect(vm.trueVal).toEqual(true);
        expect(vm.showAverage).toEqual(false);
        expect(vm.hideExportIcon).toEqual($rootScope.pdf);
        expect(vm.pdf).toEqual($rootScope.pdf);
        expect(vm.requestFailed).toEqual(true);
        expect(vm.hasTableData).toEqual(false);
        expect(vm.minLength).toEqual(1);
        expect(vm.maxLength).toEqual(5);
        expect(vm.chartGraphClass).toEqual('col-xs-12  col-md-9 col-lg-10');
        expect(vm.chartLegendClass).toEqual('col-xs-12 col-md-3 col-lg-2');
        expect(vm.metricSetByCode).toEqual(true);

        expect(utils.getDateRangeForPreviousYTD).toHaveBeenCalled();
        expect(utils.getEquivalentPriorYearDateRange).toHaveBeenCalled();
        expect(LocalizationService.isGregorian).toHaveBeenCalled();
      });
  });

  describe('getPrefixSymbol(metric, row)', function () {
    it('should test call to getPrefixSymbol(metric, row) when metric.isCurrency is true, vm.currenySymbol is set to $ and tag has not got site set', function () {
      var vm = renderDirectiveAndDigest();

      var metric = { isCurrency: true };
      vm.currencySymbol = '$';

      expect(vm.getPrefixSymbol(metric)).toEqual('$');
    });
  });

  describe('getPrefixSymbol(metric, row)', function () {
    it('should test call to getPrefixSymbol(metric, row) when metric.isCurrency is false, vm.currenySymbol is set to $ and tag has not got site set', function () {
      var vm = renderDirectiveAndDigest();

      var metric = { isCurrency: false };
      vm.currencySymbol = '$';

      expect(vm.getPrefixSymbol(metric)).toEqual(undefined);
    });
  });

  describe('getPrefixSymbol(metric, row)', function () {
    it('should test call to getPrefixSymbol(metric, row) when metric.isCurrency is true, vm.currenySymbol is set to $ and tag has got site set', function () {
      var vm = renderDirectiveAndDigest();

      var metric = { isCurrency: true };
      vm.currencySymbol = '$';

      var row = { tag: { type: 'site', id: 1000 } };
      expect(vm.getPrefixSymbol(metric, row)).toEqual(undefined);
    });
  });

  describe('setComparePeriod(item)', function () {
    it('should test call to setComparePeriod(item) when item.period_type is week and so is vm.selectedComparePeriods[0].period_type', function () {
      var vm = renderDirectiveAndDigest();

      vm.selectedComparePeriods = [{ period_type: 'week' }];

      var item = { period_type: 'week' }

      vm.setComparePeriod(item);

      expect(vm.selectedComparePeriods[0].period_type).toEqual(item.period_type);
      expect(vm.compare).toEqual(undefined);
    });
  });

  describe('setComparePeriod(item)', function () {
    it('should test call to setComparePeriod(item) when item.period_type is week, vm.selectedComparePeriods[0].period_type is year and $scope.compare is set', function () {
      $scope.compare = {
        activeSelectedComparePeriods: [{ x: 'x', p: 'p' }, { y: 'y', q: 'q' }],
        metrics: ['traffic'],
        selected_date_range: { period_type: 'year' }
      };

      var vm = renderDirectiveAndDigest();

      vm.selectedComparePeriods = [{ period_type: 'year' }];

      var item = { period_type: 'week' };

      vm.setComparePeriod(item);

      expect(vm.selectedComparePeriods[0].period_type).toEqual(item.period_type);
      expect(vm.compare.activeSelectedComparePeriods).toEqual(vm.selectedComparePeriods);
      expect(vm.loaded).toEqual(false);
      expect(vm.loading).toEqual(true);
      expect(vm.requestFailed).toEqual(false);
      expect(vm.compare.selected_date_range.period_type).toEqual('year');
    });
  });

  describe('setComparePeriod(item)', function () {
    it('should test call to setComparePeriod(item) when item.period_type is week, vm.selectedComparePeriods[0].period_type is year_to_date and $scope.compare is set', function () {
      $scope.compare = {
        activeSelectedComparePeriods: [{ x: 'x', p: 'p' }, { y: 'y', q: 'q' }],
        metrics: ['traffic'],
        selected_date_range: { period_type: 'year_to_date' }
      };

      var vm = renderDirectiveAndDigest();

      vm.selectedComparePeriods = [{ period_type: 'year' }];

      var item = { period_type: 'week' };

      vm.setComparePeriod(item);

      expect(vm.selectedComparePeriods[0].period_type).toEqual(item.period_type);
      expect(vm.compare.activeSelectedComparePeriods).toEqual(vm.selectedComparePeriods);
      expect(vm.loaded).toEqual(false);
      expect(vm.loading).toEqual(true);
      expect(vm.requestFailed).toEqual(false);
      expect(vm.compare.selected_date_range.period_type).toEqual('year_to_date');
    });
  });

  describe('setComparePeriod(item)', function () {
    it('should test call to setComparePeriod(item) when item.period_type is week, vm.selectedComparePeriods[0].period_type is ytd and $scope.compare is set', function () {
      $scope.compare = {
        activeSelectedComparePeriods: [{ x: 'x', p: 'p' }, { y: 'y', q: 'q' }],
        metrics: ['traffic'],
        selected_date_range: { period_type: 'ytd' }
      };

      var vm = renderDirectiveAndDigest();

      vm.selectedComparePeriods = [{ period_type: 'year' }];

      var item = { period_type: 'week' };

      vm.setComparePeriod(item);

      expect(vm.selectedComparePeriods[0].period_type).toEqual(item.period_type);
      expect(vm.compare.activeSelectedComparePeriods).toEqual(vm.selectedComparePeriods);
      expect(vm.loaded).toEqual(false);
      expect(vm.loading).toEqual(true);
      expect(vm.requestFailed).toEqual(false);
      expect(vm.compare.selected_date_range.period_type).toEqual('ytd');
    });
  });

  describe('setComparePeriod(item)', function () {
    it('should test call to setComparePeriod(item) when item.period_type is week, vm.selectedComparePeriods[0].period_type is quarter and $scope.compare is set', function () {
      $scope.compare = {
        activeSelectedComparePeriods: [{ x: 'x', p: 'p' }, { y: 'y', q: 'q' }],
        metrics: ['traffic'],
        selected_date_range: { period_type: 'quarter' }
      };

      var vm = renderDirectiveAndDigest();

      vm.selectedComparePeriods = [{ period_type: 'year' }];

      var item = { period_type: 'week' };

      vm.setComparePeriod(item);

      expect(vm.selectedComparePeriods[0].period_type).toEqual(item.period_type);
      expect(vm.compare.activeSelectedComparePeriods).toEqual(vm.selectedComparePeriods);
      expect(vm.loaded).toEqual(false);
      expect(vm.loading).toEqual(true);
      expect(vm.requestFailed).toEqual(false);
      expect(vm.compare.selected_date_range.period_type).toEqual('quarter');
    });
  });

  describe('setComparePeriod(item)', function () {
    it('should test call to setComparePeriod(item) when item.period_type is week, vm.selectedComparePeriods[0].period_type is quarter and $scope.compare is set', function () {
      $scope.compare = {
        activeSelectedComparePeriods: [{ x: 'x', p: 'p' }, { y: 'y', q: 'q' }],
        metrics: ['traffic'],
        selected_date_range: { period_type: 'quarter' }
      };

      var vm = renderDirectiveAndDigest();

      vm.selectedComparePeriods = [{ period_type: 'year' }];

      var item = { period_type: 'week' };

      vm.setComparePeriod(item);

      expect(vm.selectedComparePeriods[0].period_type).toEqual(item.period_type);
      expect(vm.compare.activeSelectedComparePeriods).toEqual(vm.selectedComparePeriods);
      expect(vm.loaded).toEqual(false);
      expect(vm.loading).toEqual(true);
      expect(vm.requestFailed).toEqual(false);
      expect(vm.compare.selected_date_range.period_type).toEqual('quarter');
    });
  });

  describe('setComparePeriod(item)', function () {
    it('should test call to setComparePeriod(item) when item.period_type is week, vm.selectedComparePeriods[0].period_type is quarter_to_date and $scope.compare is set', function () {
      $scope.compare = {
        activeSelectedComparePeriods: [{ x: 'x', p: 'p' }, { y: 'y', q: 'q' }],
        metrics: ['traffic'],
        selected_date_range: { period_type: 'quarter_to_date' }
      };

      var vm = renderDirectiveAndDigest();

      vm.selectedComparePeriods = [{ period_type: 'year' }];

      var item = { period_type: 'week' };

      vm.setComparePeriod(item);

      expect(vm.selectedComparePeriods[0].period_type).toEqual(item.period_type);
      expect(vm.compare.activeSelectedComparePeriods).toEqual(vm.selectedComparePeriods);
      expect(vm.loaded).toEqual(false);
      expect(vm.loading).toEqual(true);
      expect(vm.requestFailed).toEqual(false);
      expect(vm.compare.selected_date_range.period_type).toEqual('quarter_to_date');
    });
  });

  describe('setComparePeriod(item)', function () {
    it('should test call to setComparePeriod(item) when item.period_type is week, vm.selectedComparePeriods[0].period_type is qtd and $scope.compare is set', function () {
      $scope.compare = {
        activeSelectedComparePeriods: [{ x: 'x', p: 'p' }, { y: 'y', q: 'q' }],
        metrics: ['traffic'],
        selected_date_range: { period_type: 'qtd' }
      };

      var vm = renderDirectiveAndDigest();

      vm.selectedComparePeriods = [{ period_type: 'year' }];

      var item = { period_type: 'week' };

      vm.setComparePeriod(item);

      expect(vm.selectedComparePeriods[0].period_type).toEqual(item.period_type);
      expect(vm.compare.activeSelectedComparePeriods).toEqual(vm.selectedComparePeriods);
      expect(vm.loaded).toEqual(false);
      expect(vm.loading).toEqual(true);
      expect(vm.requestFailed).toEqual(false);
      expect(vm.compare.selected_date_range.period_type).toEqual('qtd');
    });
  });

  describe('setComparePeriod(item)', function () {
    it('should test call to setComparePeriod(item) when item.period_type is week, vm.selectedComparePeriods[0].period_type is month and $scope.compare is set', function () {
      $scope.compare = {
        activeSelectedComparePeriods: [{ x: 'x', p: 'p' }, { y: 'y', q: 'q' }],
        metrics: ['traffic'],
        selected_date_range: { period_type: 'month' }
      };

      var vm = renderDirectiveAndDigest();

      vm.selectedComparePeriods = [{ period_type: 'year' }];

      var item = { period_type: 'week' };

      vm.setComparePeriod(item);

      expect(vm.selectedComparePeriods[0].period_type).toEqual(item.period_type);
      expect(vm.compare.activeSelectedComparePeriods).toEqual(vm.selectedComparePeriods);
      expect(vm.loaded).toEqual(false);
      expect(vm.loading).toEqual(true);
      expect(vm.requestFailed).toEqual(false);
      expect(vm.compare.selected_date_range.period_type).toEqual('month');
    });
  });

  describe('setComparePeriod(item)', function () {
    it('should test call to setComparePeriod(item) when item.period_type is week, vm.selectedComparePeriods[0].period_type is month_to_date and $scope.compare is set', function () {
      $scope.compare = {
        activeSelectedComparePeriods: [{ x: 'x', p: 'p' }, { y: 'y', q: 'q' }],
        metrics: ['traffic'],
        selected_date_range: { period_type: 'month_to_date' }
      };

      var vm = renderDirectiveAndDigest();

      vm.selectedComparePeriods = [{ period_type: 'year' }];

      var item = { period_type: 'week' };

      vm.setComparePeriod(item);

      expect(vm.selectedComparePeriods[0].period_type).toEqual(item.period_type);
      expect(vm.compare.activeSelectedComparePeriods).toEqual(vm.selectedComparePeriods);
      expect(vm.loaded).toEqual(false);
      expect(vm.loading).toEqual(true);
      expect(vm.requestFailed).toEqual(false);
      expect(vm.compare.selected_date_range.period_type).toEqual('month_to_date');
    });
  });

  describe('setComparePeriod(item)', function () {
    it('should test call to setComparePeriod(item) when item.period_type is week, vm.selectedComparePeriods[0].period_type is mtd and $scope.compare is set', function () {
      $scope.compare = {
        activeSelectedComparePeriods: [{ x: 'x', p: 'p' }, { y: 'y', q: 'q' }],
        metrics: ['traffic'],
        selected_date_range: { period_type: 'mtd' }
      };

      var vm = renderDirectiveAndDigest();

      vm.selectedComparePeriods = [{ period_type: 'year' }];

      var item = { period_type: 'week' };

      vm.setComparePeriod(item);

      expect(vm.selectedComparePeriods[0].period_type).toEqual(item.period_type);
      expect(vm.compare.activeSelectedComparePeriods).toEqual(vm.selectedComparePeriods);
      expect(vm.loaded).toEqual(false);
      expect(vm.loading).toEqual(true);
      expect(vm.requestFailed).toEqual(false);
      expect(vm.compare.selected_date_range.period_type).toEqual('mtd');
    });
  });

  describe('setComparePeriod(item)', function () {
    it('should test call to setComparePeriod(item) when item.period_type is week, vm.selectedComparePeriods[0].period_type is week and $scope.compare is set', function () {
      $scope.compare = {
        activeSelectedComparePeriods: [{ x: 'x', p: 'p' }, { y: 'y', q: 'q' }],
        metrics: ['traffic'],
        selected_date_range: { period_type: 'week' }
      };

      var vm = renderDirectiveAndDigest();

      vm.selectedComparePeriods = [{ period_type: 'year' }];

      var item = { period_type: 'week' };

      vm.setComparePeriod(item);

      expect(vm.selectedComparePeriods[0].period_type).toEqual(item.period_type);
      expect(vm.compare.activeSelectedComparePeriods).toEqual(vm.selectedComparePeriods);
      expect(vm.loaded).toEqual(false);
      expect(vm.loading).toEqual(true);
      expect(vm.requestFailed).toEqual(false);
      expect(vm.compare.selected_date_range.period_type).toEqual('week');
    });
  });

  describe('setComparePeriod(item)', function () {
    it('should test call to setComparePeriod(item) when item.period_type is week, vm.selectedComparePeriods[0].period_type is week_to_date and $scope.compare is set', function () {
      $scope.compare = {
        activeSelectedComparePeriods: [{ x: 'x', p: 'p' }, { y: 'y', q: 'q' }],
        metrics: ['traffic'],
        selected_date_range: { period_type: 'week_to_date' }
      };

      var vm = renderDirectiveAndDigest();

      vm.selectedComparePeriods = [{ period_type: 'year' }];

      var item = { period_type: 'week' };

      vm.setComparePeriod(item);

      expect(vm.selectedComparePeriods[0].period_type).toEqual(item.period_type);
      expect(vm.compare.activeSelectedComparePeriods).toEqual(vm.selectedComparePeriods);
      expect(vm.loaded).toEqual(false);
      expect(vm.loading).toEqual(true);
      expect(vm.requestFailed).toEqual(false);
      expect(vm.compare.selected_date_range.period_type).toEqual('week_to_date');
    });
  });

  describe('setComparePeriod(item)', function () {
    it('should test call to setComparePeriod(item) when item.period_type is week, vm.selectedComparePeriods[0].period_type is wtd and $scope.compare is set', function () {
      $scope.compare = {
        activeSelectedComparePeriods: [{ x: 'x', p: 'p' }, { y: 'y', q: 'q' }],
        metrics: ['traffic'],
        selected_date_range: { period_type: 'wtd' }
      };

      var vm = renderDirectiveAndDigest();

      vm.selectedComparePeriods = [{ period_type: 'year' }];

      var item = { period_type: 'week' };

      vm.setComparePeriod(item);

      expect(vm.selectedComparePeriods[0].period_type).toEqual(item.period_type);
      expect(vm.compare.activeSelectedComparePeriods).toEqual(vm.selectedComparePeriods);
      expect(vm.loaded).toEqual(false);
      expect(vm.loading).toEqual(true);
      expect(vm.requestFailed).toEqual(false);
      expect(vm.compare.selected_date_range.period_type).toEqual('wtd');
    });
  });

  describe('setComparePeriod(item)', function () {
    it('should test call to setComparePeriod(item) when item.period_type is week, vm.selectedComparePeriods[0].period_type is day and $scope.compare is set', function () {
      $scope.compare = {
        activeSelectedComparePeriods: [{ x: 'x', p: 'p' }, { y: 'y', q: 'q' }],
        metrics: ['traffic'],
        selected_date_range: { period_type: 'day' }
      };

      var vm = renderDirectiveAndDigest();

      vm.selectedComparePeriods = [{ period_type: 'year' }];

      var item = { period_type: 'week' };

      vm.setComparePeriod(item);

      expect(vm.selectedComparePeriods[0].period_type).toEqual(item.period_type);
      expect(vm.compare.activeSelectedComparePeriods).toEqual(vm.selectedComparePeriods);
      expect(vm.loaded).toEqual(false);
      expect(vm.loading).toEqual(true);
      expect(vm.requestFailed).toEqual(false);
      expect(vm.compare.selected_date_range.period_type).toEqual('day');
    });
  });

  describe('setComparePeriod(item)', function () {
    it('should test call to setComparePeriod(item) when item.period_type is week, vm.selectedComparePeriods[0].period_type is null and $scope.compare is set', function () {
      $scope.compare = {
        activeSelectedComparePeriods: [{ x: 'x', p: 'p' }, { y: 'y', q: 'q' }],
        metrics: ['traffic'],
        selected_date_range: { period_type: null }
      };

      var vm = renderDirectiveAndDigest();

      vm.selectedComparePeriods = [{ period_type: 'year' }];

      var item = { period_type: 'week' };

      vm.setComparePeriod(item);

      expect(vm.selectedComparePeriods[0].period_type).toEqual(item.period_type);
      expect(vm.compare.activeSelectedComparePeriods).toEqual(vm.selectedComparePeriods);
      expect(vm.loaded).toEqual(false);
      expect(vm.loading).toEqual(true);
      expect(vm.requestFailed).toEqual(false);
      expect(vm.compare.selected_date_range.period_type).toEqual(null);
    });
  });

  describe('orderBy(metric, property)', function () {
    it('should test call to orderBy(metric, property)', function () {
      var vm = renderDirectiveAndDigest();

      vm.tableData = { tableData: ['x'] };

      vm.orderBy('traffic', 'hourOfDayIndex');

      expect(vm.sortProp['traffic' + '.' + 'hourOfDayIndex']).toEqual('asc');
      expect(vm.currentSort).toEqual({
        metric: 'traffic',
        property: 'hourOfDayIndex'
      });
    });
  });

  describe('toogleTableShow()', function () {
    it('should test call to toogleTableShow() with edit mode not edit', function () {
      var vm = renderDirectiveAndDigest();

      vm.tableData = { tableData: ['x'] };
      vm.compare = { showTable: true };
      vm.editMode = 'readonly'

      vm.toogleTableShow();

      expect(vm.editMode).toEqual('readonly');
      expect(vm.compare.showTable).toEqual(false);
    });
  });

  describe('toogleTableShow()', function () {
    it('should test call to toogleTableShow() with edit mode set to edit', function () {
      var vm = renderDirectiveAndDigest();

      vm.tableData = { tableData: ['x'] };
      vm.compare = { showTable: true };
      vm.editMode = 'edit'

      vm.toogleTableShow();

      expect(vm.editMode).toEqual('edit');
      expect(vm.compare.showTable).toEqual(true);
    });
  });

  describe('isValidNumber(value, property)', function () {
    it('should test call to isValidNumber(value, property) with number array', function () {
      var vm = renderDirectiveAndDigest();

      var arr = [3, 43, 44]
      expect(vm.isValidNumber(arr, 0)).toEqual(true);
    });
  });

  function renderDirectiveAndDigest() {
    var element = createDirectiveElement();
    $compile(element)($scope);
    $scope.$digest();
    $timeout.flush();
    var vm = element.isolateScope().vm;
    return vm;
  }

  function myGetOrganization(OrganizationResource, $q) {
    return getCurrentOrganization;
    function getCurrentOrganization() {
      var def = $q.defer();
      def.resolve(organization);
      return def.promise;
    }
  }

  function createDirectiveElement() {
    return angular.element(
      '<custom-compare-data-widget ' +
      'current-user="currentUser" ' +
      'current-organization="currentOrganization" ' +
      'sites="sites" ' +
      'order-by="orderBy" ' +
      'compare="compare" ' +
      'edit-mode="editMode" ' +
      'preview-in-progress="previewInProgress" ' +
      '></custom-compare-data-widget>'
    );
  }

  function putTemplateToTemplateCache($templateCache) {
    // Put an empty template to the template cache to prevent Angular from
    // trying to fetch it. We are only testing the controller here, so the
    // actual template is not needed.
    $templateCache.put(
      'components/widgets/custom-compare-widget/custom-compare-data-widget.partial.html',
      '<div></div>'
    );
  }

});
