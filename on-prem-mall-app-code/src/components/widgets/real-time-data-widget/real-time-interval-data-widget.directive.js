(function() {
  'use strict';

  angular.module('shopperTrak')
    .directive('realTimeIntervalDataWidget', realTimeIntervalDataWidgetDirective);

    function realTimeIntervalDataWidgetDirective() {
      return {
        restrict: 'E',
        templateUrl: 'components/widgets/real-time-data-widget/real-time-interval-data-widget.partial.html',
        scope: {
          currentUser: '=',
          currentOrganization: '=?',
          orgId: '=?',
          currentSite: '=?',
          siteId: '=?',
          sites: '=?',
          selectedSites: '=?',
          selectedSitesInfo: '=?',
          singleSite: '=?',
          selectedTags: '=?',
          selectedTagsSites: '=?',
          refreshData: '=?',
          hierarchyTagId: '=?',
          zoneId: '=?',
          onExportClick: '&',
          exportIsDisabled: '=?exportIsDisabled',
          showTable: '=?',
          selectedMetrics: '=?',
          selectedMetricIds: '=?',
          orderBy: '=?',
          hasSales: '=?',
          hasLabor: '=?',
          siteHasLabor: '=?',
          siteHasSales: '=?',
          hideExportIcon: '=?',
          dateFormatMask: '=?',
          businessDays: '=?',
          selectedTimeOption: '=?',
          enterExit: '=?',
          setShowTable: '=?',
          loading: '=?',
          orgMetrics: '=?'
        },
        controller: realTimeIntervalDataWidgetController,
        controllerAs: 'vm',
        bindToController: true
      };
    }

    realTimeIntervalDataWidgetController.$inject = [
      '$scope',
      '$rootScope',
      '$timeout',
      '$translate',
      'ObjectUtils',
      'LocalizationService',
      'SubscriptionsService',
      'apiUrl',
      '$stateParams',
      'realTimeDataService',
      '$q',
      'OrganizationResource',
      'SiteResource',
      '$filter',
      'metricsHelper',
      '$state',
    ];

    function realTimeIntervalDataWidgetController(
      $scope,
      $rootScope,
      $timeout,
      $translate,
      ObjectUtils,
      LocalizationService,
      SubscriptionsService,
      apiUrl,
      $stateParams,
      realTimeDataService,
      $q,
      OrganizationResource,
      SiteResource,
      $filter,
      metricsHelper,
      $state) {
      var vm = this;
      var unbindMetricSelectorWatch;
      var unbindRefreshDataWatch;
      var businessDayChanged;
      vm.loaded = false;
      vm.orderBy = orderBy;
      vm.averageTranskey = '';
      vm.additionalTableCssClass = '';
      vm.pdf = $rootScope.pdf;

      if (ObjectUtils.isNullOrUndefined(vm.showTable)) {
        vm.showTable = false;
      }

      if (!ObjectUtils.isNullOrUndefined(vm.siteHasLabor)) {
        vm.hasLabor = vm.siteHasLabor;
      }

      if (!ObjectUtils.isNullOrUndefined(vm.siteHasSales)) {
        vm.hasSales = vm.siteHasSales;
      }

      activate();

      function activate() {
        vm.trueVal = true;
        vm.isValidNumber = isValidNumber;
        vm.getSiteName = getSiteName;
        vm.realTimeDateFormat = 'HH:mm';
        vm.hideExportIcon = $state.current.name === 'pdf';
        vm.showContribution = false;
        vm.requestFailed = false;
        vm.hasTableData = false;
        vm.showTotal = false;

        setupLayout();

        populateTimeOptions();

        LocalizationService.setUser(vm.currentUser);

        // If currentOrganization is not provided, fetch organization settings using vm.orgId
        if (!ObjectUtils.isNullOrUndefined(vm.orgId) &&
          (ObjectUtils.isNullOrUndefined(vm.currentOrganization) ||
          vm.currentOrganization.organization_id !== vm.orgId)) {
          var currentOrganization;
          currentOrganization = OrganizationResource.get({
            orgId: vm.orgId
          }).$promise;
          currentOrganization.then(function(result) {
            vm.currentOrganization = result;
            LocalizationService.setOrganization(vm.currentOrganization);
            getOrganizationSites();
          });
          return;
        }

        if(ObjectUtils.isNullOrUndefinedOrEmpty(vm.sites)) {
          return getOrganizationSites();
        }

        init();
      }

      /**
      * Notifies the pdf controller when all widgets have rendered.
      * this function returns nothing but increases the $rootScope.pdfExportsLoaded number by 1.
      */
      function setPdfEvent() {
        if ($rootScope.pdf) {
          vm.renderReady = false;

          $scope.$watchGroup(['vm.loading', 'vm.renderReady'],
            function () {
              if (!vm.loading && vm.loaded && vm.renderReady) {
                //we don't need a delay for highchart drawing if this is not the last widget in pdf
                if($rootScope.pdfExportsLoaded > 1) {
                  $rootScope.pdfExportsLoaded += 1;
                  return;
                }

                //highchart can't complete drawing sometimes and it cause graph plotting cut off in actual pdf file so minimum delay added and tested less then 350 doen't work always
                $timeout(function () {
                  $rootScope.pdfExportsLoaded += 1;
                }, 400);

              }
            }
          );
        }
      }

      function init() {
        setPdfEvent();
        setOrgLevel();

        setWidgetTitle();

        if (ObjectUtils.isNullOrUndefined(vm.currentSite) && !ObjectUtils.isNullOrUndefined(vm.siteId)) {
          var currentSite;
          currentSite = SiteResource.get({
            orgId: vm.orgId,
            siteId: vm.siteId
            },{
            all_fields:true
          }).$promise;
          currentSite.then(function(result) {
            vm.currentSite = result;
            setOrgLevel();
          });
        }

        setMetrics();

        buildChartTitle();

        getNumberFormatInfo();

        setupWatch();
      }

      function setOrgLevel() {
        vm.orgLevel = ObjectUtils.isNullOrUndefined(vm.currentSite) &&
        ObjectUtils.isNullOrUndefined(vm.siteId);
      }

      function getActiveSubscriptions() {
        if (!ObjectUtils.isNullOrUndefined(vm.currentSite)) {
          if (!ObjectUtils.isNullOrUndefined(vm.currentSite.subscriptions)) {
            vm.activeSubscriptions = SubscriptionsService.getSubscriptions(vm.currentSite);
          } else {
             //use org data
             vm.activeSubscriptions = SubscriptionsService.getSubscriptions(vm.currentOrganization);
          }
        } else {
          vm.activeSubscriptions = SubscriptionsService.getSubscriptions(vm.currentOrganization);
        }
        return vm.activeSubscriptions;
      }

      function getSiteName(siteId) {
        var site = _.where(vm.sites, { customer_site_id: siteId });

        if (!ObjectUtils.isNullOrUndefinedOrEmpty(site)) {
          return siteId + '-' +site[0].name;
        }
        return siteId;
      }

      function getMetrics() {
        return metricsHelper.getMetricDisplayInformation(
          getActiveSubscriptions(),
          true
        );
      }

      function getSortedMetrics() {
        return _.sortBy(getMetrics(), function(metric) {
          return metric.order;
        });
      }

      function setMetrics() {
        vm.metricDisplayInfo = getSortedMetrics();

        _.map(vm.metricDisplayInfo, function (_item) {
          _item.title = getMetricTitle(_item, _item.displayName);
        });

        initSelectedMetrics();
      }

      function initSelectedMetrics() {
        vm.maxLength = vm.singleSite ? 3: 5;
        vm.minLength = 1;

        if(vm.orgLevel &&
          !vm.singleSite &&
          ObjectUtils.isNullOrUndefinedOrEmpty(vm.selectedMetricIds)) {
          vm.selectedMetrics = vm.metricDisplayInfo.length > 5 ? angular.copy(vm.metricDisplayInfo.slice(0, 5)): angular.copy(vm.metricDisplayInfo);
          loadData();
          return;
        }

        vm.selectedMetrics = [];
        if (ObjectUtils.isNullOrUndefinedOrEmpty(vm.selectedMetricIds) &&
          !ObjectUtils.isNullOrUndefinedOrEmpty(vm.metricDisplayInfo)) {
          vm.selectedMetrics.push(vm.metricDisplayInfo[0]);
        } else {
          var metrics = [];
          _.each(vm.selectedMetricIds, function(metric) {
            var metric = metricsHelper.getMetricInfo(metric, vm.metricDisplayInfo, undefined, true);
            metric.title = getMetricTitle(metric, metric.displayName);
            metrics.push(metric);
          });
          vm.selectedMetrics = angular.copy(metrics);
          loadData();
        }
      }

      function setWidgetTitle() {
        if (vm.orgLevel && !vm.singleSite) {
          vm.widgetTitle = 'realTimeData.REALTIMEDATABYSITE';
          return;
        }

        vm.widgetTitle = 'realTimeData.REALTIMEDATA';
      }

      function getMetricTitle(kpi, displayName) {
        if(!_.isUndefined(vm.orgMetrics)) {
          var metric = _.findWhere(vm.orgMetrics, { value: kpi.value });
          if(!_.isUndefined(metric)) {
            return metric.displayName;
          }
        }
        return !ObjectUtils.isNullOrUndefinedOrBlank(displayName)? displayName: kpi.shortTranslationLabel;
      }

      function buildChartTitle() {
        var metricDisplayInfo = _.where(vm.metricDisplayInfo);

        var title = '';

        var transkeys = metricDisplayInfo.map(function(metric) {
          return getMetricTitle(metric, metric.displayName);
        });

        $translate(transkeys).then(function(translations) {
          _.each(transkeys, function(transkey, index) {
            if (index > 0 && (index < transkeys.length - 2)) {
              title += ',';
            }

            if (index === transkeys.length - 2 && transkeys.length > 2) {
              title += ' &';
            }

            if (index > 0) {
              title += ' ';
            }

            title += translations[transkey];
          });

          vm.chartTitle = title;
        });
      }

      function getNumberFormatInfo() {
        vm.numberFormatName = LocalizationService.getCurrentNumberFormatName(vm.currentUser, vm.currentOrganization);
      }

      function setHasData() {
        vm.hasTableData = !ObjectUtils.isNullOrUndefinedOrEmpty(vm.tableData);
        vm.hasData = !ObjectUtils.isNullOrUndefined(vm.chartData) &&
          !ObjectUtils.isNullOrUndefinedOrEmpty(vm.chartData.metricsWithData);
        if (!vm.hasData  && !vm.singleSite) {
          vm.hasData = vm.hasTableData;
          return;
        }
      }

      function setTableData(data) {
        if (!ObjectUtils.isNullOrUndefined(data.tableData)) {
          vm.averages = data.tableData.averages;
          vm.totals = data.tableData.totals;
          vm.tableData = data.tableData.tableData;
          vm.hasTableData = false;
          return;
        }
        vm.tableData = null;
      }

      function loadData() {
        if (ObjectUtils.isNullOrUndefinedOrEmpty(vm.selectedMetrics) ||
          ObjectUtils.isNullOrUndefinedOrEmpty(vm.sites)
          ) {
          return;
        }
        vm.loading = true;
        vm.loaded = false;
        vm.requestFailed = false;

        realTimeDataService.getRealTimeData(getRealTimeDataParams(),
          vm.selectedMetrics,
          vm.metricDisplayInfo,
          vm.selectedSitesInfo,
          vm.selectedTagsSites,
          vm.selectedTimeOption.id === '1hour',
          !vm.businessDays,
          vm.enterExit,
          vm.singleSite
          )
          .then(function(data) {
            vm.chartData = data.chartData;
            setTableData(data);

            if (!ObjectUtils.isNullOrUndefined(vm.chartData)) {
              vm.chartConfig = buildHighchartConfig(vm.chartData, 'multi');
            }

            vm.currentSort =!vm.orgLevel || vm.singleSite ? 'timeIndex': 'siteName';
            vm.currentSortDirection = 'desc';
            setHasData();
            vm.loading = false;
            vm.loaded = true;
            vm.requestFailed = false;
            vm.orderBy('siteName');
          })
          .catch(function(error) {
            if (error !== 'User cancelled') {
              vm.loading = false;
              vm.loaded = true;

              vm.requestFailed = true;
              vm.hasData = false;
              console.log('error getting real time data');
              console.log(error);
            }
        });
      }

      function populateTimeOptions() {
        if (vm.hideExportIcon === true) {
          return;
        }

        var options = [];
        options.push({
          id: '1hour',
          transKey: 'realtime-houroption'
        });

        options.push({
          id: '15minute',
          transKey: 'realtime-15minuteoption'
        });

        vm.timeOptions = options;
        if (ObjectUtils.isNullOrUndefined(vm.selectedTimeOption)) {
          vm.selectedTimeOption = options[0];
        }
      }

      function getSiteId() {
        if (vm.singleSite &&
          !ObjectUtils.isNullOrUndefinedOrEmpty(vm.selectedSites)) {
          return vm.selectedSites[0];
        }

        if(vm.singleSite &&
          !ObjectUtils.isNullOrUndefinedOrEmpty(vm.selectedTagsSites) &&
          vm.selectedTagsSites.length === 1) {
          return vm.selectedTagsSites[0].site_id;
        }

        if (ObjectUtils.isNullOrUndefined(vm.currentSite) &&
          ObjectUtils.isNullOrUndefined(vm.siteId)) {
          return undefined;
        }

        if (ObjectUtils.isNullOrUndefined(vm.siteId)) {
          return vm.currentSite.site_id;
        } else {
          return vm.siteId;
        }
      }

      function getOrgId() {
        if (ObjectUtils.isNullOrUndefined(vm.currentOrganization) && ObjectUtils.isNullOrUndefined(vm.orgId)) {
          return undefined;
        }

        if (ObjectUtils.isNullOrUndefined(vm.orgId)) {
          return vm.currentOrganization.organization_id;
        } else {
          return vm.orgId;
        }
      }

      function getRealTimeDataParams() {
        var params = {
          orgId: getOrgId()
        };

        var siteId = getSiteId();
        if (!ObjectUtils.isNullOrUndefined(siteId)) {
          params.siteId = siteId;
        }

        if (!ObjectUtils.isNullOrUndefined(vm.zoneId)) {
          //params.zoneId = vm.zoneId;
        }

        return params;
      }

      function setupWatch() {
        businessDayChanged = $scope.$on('businessDayChanged', function(event, option) {
          vm.businessDays = option;

          if (ObjectUtils.isNullOrUndefined(vm.selectedMetrics) ||
            ObjectUtils.isNullOrUndefined(vm.currentOrganization)) {
            return;
          }

          vm.loaded = false;

          loadData();
        });

        unbindMetricSelectorWatch = $scope.$watchGroup(['vm.selectedMetrics', 'vm.selectedTimeOption'], function() {
          if ((vm.orgLevel  && ! vm.singleSite) || ObjectUtils.isNullOrUndefined(vm.selectedMetrics) ||
            ObjectUtils.isNullOrUndefined(vm.currentOrganization)) {
            if(vm.loading) {
              return;
            }
            vm.loaded = false;
            $timeout(function () {
              vm.loaded = true;
            });
            return;
          }

          vm.loaded = false;

          loadData();
        });

        unbindRefreshDataWatch = $scope.$watch('vm.refreshData', function() {
          if (!vm.refreshData) {
            return;
          }

          setWidgetTitle();

          initSelectedMetrics();

          vm.loaded = false;

          loadData();
        });

        $scope.$on('$destroy', function() {
          realTimeDataService.cancelAllOutstandingRequests();
          if (typeof unbindMetricSelectorWatch === 'function') {
            unbindMetricSelectorWatch();
          }

          if (typeof businessDayChanged === 'function') {
            businessDayChanged();
          }

          if (typeof unbindRefreshDataWatch === 'function') {
            unbindRefreshDataWatch();
          }
        });
      }

      function orderBy(metric) {
        var sortDirection = getSortDirection();

        var ordered = _.sortBy(vm.tableData, function(row) {
          if (!ObjectUtils.isNullOrUndefinedOrBlank(row[metric])) {
            if(metric === 'siteName') {
              return getSiteName(row[metric]);
            }
            return row[metric];
          }

          return 0;
        });

        if (sortDirection === 'desc') {
          ordered = ordered.reverse();
        }

        vm.tableData = ordered;

        vm.currentSort = metric;

        vm.currentSortDirection = sortDirection;
      }

      function getSortDirection() {
        if (vm.currentSortDirection === 'asc') {
          return 'desc';
        }

        if (vm.currentSortDirection === 'desc') {
          return 'asc';
        }
      }

      function getOrganizationSites() {
        if (ObjectUtils.isNullOrUndefinedOrEmpty(vm.sites)) {
          var sites = SiteResource.query({
            orgId: vm.currentOrganization.organization_id,
            allFields:'?all_fields=true'});

          sites.$promise.then(function(sites) {
            vm.sites = sites;
            populateSelectedSitesInfo();
            init();
          });
        }
      }

      function populateSelectedSitesInfo() {
        vm.selectedSitesInfo = [];
        _.each(vm.selectedSites, function (siteId) {
          addToSiteIfo(siteId);
        });
        _.each(vm.selectedTagsSites, function (siteId) {
          addToSiteIfo(siteId);
        });
      }

      function addToSiteIfo(siteId) {
          var site = _.findWhere(vm.sites, { site_id: siteId });
          if (!ObjectUtils.isNullOrUndefined(site)) {
            vm.selectedSitesInfo.push(site);
          }
        }

      function setupLayout() {
        if ($rootScope.pdf) {
          vm.averageTranskey = 'common.AVG';
          vm.additionalTableCssClass = 'reduced-padding';
        } else {
          vm.averageTranskey = 'common.AVERAGE';
        }
        vm.totalTranskey = 'common.TOTAL';
      }

      function setxAxisChartLabels(chartLabels) {
        vm.xAxisChartLabels = chartLabels;
      }

      function buildHighchartConfig(chartData, yAxisType) {
        if(chartData.metricsWithData.length > 2) {
          yAxisType = 'single';
        }
        if (!ObjectUtils.isNullOrUndefined(chartData)) {
          var seriesData = [];
          var yAxisData = [];
          var graphColor = ['#9bc614', '#0aaaff', '#be64f0', '#ff5028', '#feac00', '#00abae', '#929090'];

          // We have to set the xAxis labels since they change depending on user selected filters
          // this is for the formatter bug on the tooltips
          setxAxisChartLabels(chartData.labels);

          // y-axis
          if (yAxisType === 'single') {
            yAxisData.push({
              labels: {
                formatter: function() {
                  return Math.round(this.value);
                }
              },
              title: {
                text: ''
              },
            allowDecimals: false,
            gridLineDashStyle: 'Dot',
            gridLineColor: '#b0b0b0'
            });
          } else {
            _.each(chartData.metricsWithData, function(labels, index) {
              var oppositeValue = false;

              if (index === 1) {
                oppositeValue = true;
              }

              yAxisData.push({
                labels: {
                  style: {
                    color: graphColor[index]
                  },
                  formatter: function() {
                    return Math.round(this.value);
                  }
                },
                title: {
                  text: '',
                  style: {
                    color: graphColor[index],
                  }
                },
                allowDecimals: false,
                opposite: oppositeValue,
                gridLineDashStyle: 'Dot',
                gridLineColor: '#b0b0b0'
              });
            });
          }

          // series data
          _.each(chartData.series, function(data, index) {
            var yAxisValue;

            if (yAxisType === 'single') {
              yAxisValue = 0;
            } else {
              yAxisValue = index;
            }

            var seriesNameTranslated = $filter('translate')(chartData.metricsWithData[index].title);

            seriesData.push({
              name: seriesNameTranslated,
              yAxis: yAxisValue,
              data: data,
              color: graphColor[index],
              marker: {
                symbol: 'circle',
                radius: 3
              },
              states: {
                hover: {
                  lineWidth: 2
                }
              }
            });
          });

          var chartConfig = {
            options: {
              chart: {
                type: 'line',
                height: 225,
                style: {
                  fontFamily: '"Source Sans Pro", sans-serif'
                },
                events: {
                  load: function(event) {
                    event.target.reflow();
                    vm.renderReady = true;
                  }
                }
              },
              tooltip: {
                shared: true,
                useHTML: true,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderColor: '#e5e5e5',
                shadow: false,
                formatter: function() {
                var title = '<div class="tooltip-header">' + vm.xAxisChartLabels[this.x] + '</div>';

                var body = '';
                _.each(this.points, function(point) {
                  body += '<div class="row tooltip-option">';
                  body += '<div class="tooltip-name">' + point.series.name + '</div>';
                  body += '<div class="tooltip-value">' + $filter('formatNumber')(point.y, 1, vm.numberFormatName) + '</div>';
                  body += '</div>';
                });

                return title + body;
              }
            },
            exporting: {
              enabled: false
            }
                    },
                    title: {
                        text: ''
                    },
                    xAxis: {
                        crosshair: false,
                        tickLength: 0,
                        showLastLabel: true,
                        endOnTick: true,
                        labels: {
                            align: 'left',
                            style: {
                                color: '#929090'
                            },
                            formatter: function() {
                                return chartData.labels[this.value];
                            }
                        }
                    },
                    yAxis: yAxisData,
                    series: seriesData
          };

          return chartConfig;
        }
      }

      function isValidNumber(value) {
        return !ObjectUtils.isNullOrUndefinedOrBlank(value) &&
        !isNaN(value) && isFinite(value);
      }
    }
})();
