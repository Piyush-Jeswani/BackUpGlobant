(function () {
  'use strict';

  angular
    .module('shopperTrak.widgets')
    .directive('sitePerformanceWidget', sitePerformanceWidget);

  function sitePerformanceWidget() {
    return {
      templateUrl: 'components/widgets/site-performance-widget/site-performance-widget.partial.html',
      scope: {
        orgId: '=',
        selectedPeriodStart: '=',
        selectedPeriodEnd: '=',
        compareRange1Start: '=',
        compareRange1End: '=',
        compareRange1Type: '=',
        compareRange2Start: '=',
        compareRange2End: '=',
        compareRange2Type: '=',
        dateFormatMask: '=',
        numberFormatName: '=',
        firstDayOfWeekSetting: '=',
        onExportClick: '&',
        exportIsDisabled: '=?',
        hideExportIcon: '=?',
        language: '=',
        isLoading: '=?',
        currentView: '=?',
        setSelectedWidget: '&'
      },
      controller: sitePerformanceWidgetController,
      controllerAs: 'sitePerformanceWidget',
      bindToController: true
    };
  }

  sitePerformanceWidgetController.$inject = [
    '$scope',
    '$filter',
    '$translate',
    '$timeout',
    '$rootScope',
    '$q',
    'sitePerformanceWidgetConstants',
    'organizationSummaryData',
    'comparisonsHelper',
    'utils',
    'SiteResource',
    'ObjectUtils'
  ];

  function sitePerformanceWidgetController(
    $scope,
    $filter,
    $translate,
    $timeout,
    $rootScope,
    $q,
    constants,
    organizationSummaryData,
    comparisonsHelper,
    utils,
    SiteResource,
    ObjectUtils
  ) {

    var sitePerformanceWidget = this;

    activate();

    function activate() {
      initScope();

      if($rootScope.pdf) {
        sitePerformanceWidget.chartOptions.axisX.offset = 60;
        loadForPdfComplete();
      }

      loadTranslations();
      configureDateRanges();

      getOrganizationSites()
        .then(function(sites) {
          sitePerformanceWidget.sites = sites;
          fetchAllKpiData();
        });
    }

  /**
   * Initialises the scope.
   * Assigns default values and makes functions public
   *
   */
    function initScope() {
      sitePerformanceWidget.numberOfSites = 10;
      sitePerformanceWidget.kpis = ['traffic'];
      sitePerformanceWidget.defaultKpi = 'traffic';
      sitePerformanceWidget.graphColor = ['#9bc614', '#0aaaff', '#be64f0', '#ff5028', '#feac00', '#00abae', '#929090'];
      sitePerformanceWidget.orgSiteData = {};
      sitePerformanceWidget.reloadChart = reloadChart;
      sitePerformanceWidget.hasMoreSites = hasMoreSites;
      sitePerformanceWidget.getPreviousSitesLabel = getPreviousSitesLabel;
      sitePerformanceWidget.getNextSitesLabel = getNextSitesLabel;
      sitePerformanceWidget.loadOrgData = loadOrgData;
      sitePerformanceWidget.compareRangeIsPriorPeriod = compareRangeIsPriorPeriod;
      sitePerformanceWidget.compareRangeIsPriorYear = compareRangeIsPriorYear;
      sitePerformanceWidget.isPdf = $rootScope.pdf;
      sitePerformanceWidget.requestFailed = false;
      sitePerformanceWidget.isLoading = true;
      sitePerformanceWidget.views = constants.views;
      sitePerformanceWidget.externalDataRequest = false;

      sitePerformanceWidget.chartOptions = {
        seriesBarDistance: 13,
        axisX: {
          showGrid: false
        },
      };
    }

    function configureDateRanges() {
      sitePerformanceWidget.compareRanges = [];
      sitePerformanceWidget.compareRanges.push({
        start: sitePerformanceWidget.compareRange1Start,
        end: sitePerformanceWidget.compareRange1End,
        type: sitePerformanceWidget.compareRange1Type
      });

      sitePerformanceWidget.compareRanges.push({
        start: sitePerformanceWidget.compareRange2Start,
        end: sitePerformanceWidget.compareRange2End,
        type: sitePerformanceWidget.compareRange2Type
      });
    }

    /**
    * Notifies the pdf controller when all widgets have rendered.
    * this function returns nothing but increases the $rootScope.pdfExportsLoaded number by 1.
    */
    function loadForPdfComplete() {
      sitePerformanceWidget.renderReady = false;
      sitePerformanceWidget.chartOptions.events = {
        load: sitePerformanceWidget.renderReady = true,
      }
      $scope.$watchGroup(['sitePerformanceWidget.isLoading', 'sitePerformanceWidget.renderReady'],
        function () {
          if (!sitePerformanceWidget.isLoading && sitePerformanceWidget.renderReady) {
            $rootScope.pdfExportsLoaded += 1;
          }
        }
      );
    }

    function setLoadingError(error) {
      console.error(error);
      sitePerformanceWidget.requestFailed = true;
      sitePerformanceWidget.isLoading = false;
    }

    function fetchAllKpiData() {
      var promises = [];

      sitePerformanceWidget.externalDataRequest = true;

      promises.push(fetchKpiData(
        sitePerformanceWidget.orgId,
        sitePerformanceWidget.selectedPeriodStart,
        sitePerformanceWidget.selectedPeriodEnd
      ));

      _.each(sitePerformanceWidget.compareRanges, function(range) {
        promises.push(fetchKpiData(sitePerformanceWidget.orgId, range.start, range.end));
      });

      $q.all(promises).then(function() {
        loadOrgData(sitePerformanceWidget.sites, sitePerformanceWidget.widgetData);
      }).catch(setLoadingError);
    }

    function fetchKpiData(orgId, dateRangeStart, dateRangeEnd) {
      var deferred = $q.defer();

      if (ObjectUtils.isNullOrUndefined(sitePerformanceWidget.widgetData)) {
        sitePerformanceWidget.widgetData = {};
      }

      var dateRangeKey = organizationSummaryData.getDateRangeKey(dateRangeStart, dateRangeEnd);
      organizationSummaryData.setParams({ 'orgId': orgId, 'dateRangeStart': dateRangeStart, 'dateRangeEnd': dateRangeEnd });

      if (ObjectUtils.isNullOrUndefined(sitePerformanceWidget.widgetData[dateRangeKey])) {
        organizationSummaryData.fetchKPIData(function (data) {
          sitePerformanceWidget.widgetData[dateRangeKey] = data;
          deferred.resolve();
        });
      } else {
        deferred.resolve();
      }

      return deferred.promise;
    }

    function setNoData() {
      if (sitePerformanceWidget.isLoading || sitePerformanceWidget.isRefreshingChart) {
        sitePerformanceWidget.noData = false;
        return;
      }

      sitePerformanceWidget.noData = true;

      _.each(sitePerformanceWidget.sites, function (site) {
        _.each(sitePerformanceWidget.kpis, function(kpi) {
          if (reportDataIsAvailable(site.site_id, kpi)) {
            sitePerformanceWidget.noData = false;
          }
        });
      });
    }

    function getOrganizationSites() {
      return SiteResource.query({ orgId: sitePerformanceWidget.orgId }).$promise;
    }

    function initializeChart() {
      sitePerformanceWidget.chartData = {
        labels: [],
        series: [
          [],
          [],
          []
        ]
      };
      sitePerformanceWidget.tooltipData = {};
    }

    function reloadChart(view, page, comparisonIndex) {
      sitePerformanceWidget.isRefreshingChart = true;
      sitePerformanceWidget.currentView = view.view;
      sitePerformanceWidget.currentKpi = view.kpi;
      sitePerformanceWidget.currentOrder = view.order;
      sitePerformanceWidget.currentPage = page;

      var desc;

      initializeChart();

      if (page === undefined) {
        page = 1;
      }

      if (view.order === 'asc') {
        desc = false;
      } else {
        desc = true;
      }

      if (!ObjectUtils.isNullOrUndefinedOrEmpty(sitePerformanceWidget.orgSiteData)) {
        if (view.type === 'selectedPeriod') {
          sitePerformanceWidget.orgSiteData = $filter('orderOrgdataObjectBy')(sitePerformanceWidget.orgSiteData, view.kpi, view.type, desc);
        } else {
          var orderedKpi = desc ? '-' + view.kpi : view.kpi;
          sitePerformanceWidget.orgSiteData = $filter('sortObjectWithKpiBy')(sitePerformanceWidget.orgSiteData, orderedKpi, 'comparisons', comparisonIndex - 1, 'compareTotal', true);
        }

        var start = (page - 1) * sitePerformanceWidget.numberOfSites;
        var i = 0;
        var seriesData = [[],[],[]];
        var labels = [];

        _.each(sitePerformanceWidget.orgSiteData, function (site) {

          if (i >= start && i < (sitePerformanceWidget.numberOfSites * page)) {
            if (sitePerformanceWidget.externalDataRequest === true) {
              labels.push((i + 1) + '. ' + site.name);

            } else {
              labels.push( site.name );
            }

            if (site.data[view.kpi][view.type] === null) {
              seriesData[0].push(0);
              _.each(sitePerformanceWidget.compareRanges, function (range, index) {
                seriesData[index + 1].push(0);
              });
            } else {
              seriesData[0].push(site.data[sitePerformanceWidget.defaultKpi].selectedPeriod);
              _.each(sitePerformanceWidget.compareRanges, function (range, index) {
                seriesData[(index + 1)].push(site.data[sitePerformanceWidget.defaultKpi].comparisons[index].compareTotal);
              });
            }
          }
          i++;
        });

        var chartData = [];
        _.each(seriesData,function(series,key) {
          chartData[key] = getSeriesData(key, series);
        });

        sitePerformanceWidget.chartData = {
          series: chartData,
          options: {
            chart: {
              type: 'column',
              height: 360,
              style: {
                fontFamily: '"Source Sans Pro", sans-serif'
              }
            },
            plotOptions: {
              series: {
                dataLabels: {
                  allowOverlap: true,
                  defer: false,
                  enabled: true,
                  padding: 0,
                  style: {
                    opacity: 0.001
                  }
                },
                groupPadding: 0.27,
                animation: !sitePerformanceWidget.isPdf
              },
              column: {
                pointWidth: 8
              }
            },
            tooltip: {
              shared: true,
              useHTML: true,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderColor: '#e5e5e5',
              shadow: false,
              padding: 10,
              pointFormat: '<strong>{point.name}</strong> <span>{point.value}</span>',
              formatter: toolTipFormatter,
              positioner: positionFormatter
            },
            exporting: {
              enabled: false
            },
            legend: {
              enabled: false
            }
          },
          yAxis: {
            title: {
              text: null
            },
            labels: {
              formatter: function () {
                return this.value;
              }
            }
          },
          xAxis: {
            crosshair: false,
            tickLength: 0,
            showLastLabel: true,
            endOnTick: true,
            labels: {
              align: 'center',
              staggerLines: 1,
              style: {
                color: '#929090',
                padding: '5px 5px',
                whiteSpace: 'normal'
              },
              padding: 0,
              useHTML: true,
              formatter: function() {
                if( ObjectUtils.isNullOrUndefined(sitePerformanceWidget.labels[this.value])) {
                  return null;
                } else {
                  return '<div class="badge-container"><div class="badge">' + (this.value + 1) + '</div></div> <div class="label-name">'+sitePerformanceWidget.labels[this.value] + '</div>';
                }
              }
            }
          },
          title: {
            text: ''
          }
        };
        sitePerformanceWidget.labels = labels;

        if(sitePerformanceWidget.isPdf) {
          sitePerformanceWidget.chartData.xAxis.labels.staggerLines = 2;
          sitePerformanceWidget.chartData.xAxis.labels.style.whiteSpace = 'nowrap';
          sitePerformanceWidget.chartData.tooltip = { enabled: false, animation: false};
          sitePerformanceWidget.chartData.reflow = false;
          sitePerformanceWidget.chartData.series.enableMouseTracking = false;
        }

        sitePerformanceWidget.isRefreshingChart = false;
      }

    }

    function getSeriesData(index, data) {
      return {
        name: 'ser ' + index,
        color: sitePerformanceWidget.graphColor[index],
        data: data
      };
    }

    function toolTipFormatter () {
      var label;
      var s = '';

      s += '<p class="tooltip-title">'+sitePerformanceWidget.labels[this.x]+'</p>' +
           '<table class="chart-tooltip-performance">';

      var formatNumber = $filter('formatNumber');

      var i = 0, selectedPeriodValue, change, iconClass;
      $.each(this.points, function () {
        if(i === 0) {
          label = 'common.SELECTEDPERIOD';
          selectedPeriodValue = this.y;
          change = '-'
        } else {
          label = getRangeLabel(i);
          change = formatNumber(calculateTrafficChange( this.y, selectedPeriodValue ), 1, sitePerformanceWidget.numberFormatName);
        }

        if(change > 0) {
          iconClass = 'positive sticon-triangle-up-filled'
        } else if(change < 0) {
          iconClass = 'negative sticon-triangle-down-filled'
        } else {
          iconClass = ''
        }

        s += '<tr>' +
             ' <td class="table-label">' + $filter('translate')(label) + '</td>' +
             ' <td>'+ formatNumber(this.y, 0, sitePerformanceWidget.numberFormatName) + '</td>' +
             ' <td class="compare-value">';
             if(iconClass !== '') {
               s += '<span class="sticon sticon-triangle-up-filled '+iconClass+'" aria-hidden="true"></span>' + change;
             }
        s += '</td>' +
             '</tr>';
        i++;
      });

      s += '</table>';

      return s;
    }

    function calculateTrafficChange(current, compare) {
      var change;
      if(current > 0) {
        change = compare / current * 100;
        change = (100 - change) * -1;
      } else if(current === 0 && compare > current) {
        change = 0; // most of the times, when current is null data is not available
      } else if(compare === 0 && current === 0) {
        change = 0;
      } else {
        change = -100;
      }
      return change;
    }

    function positionFormatter(boxWidth, boxHeight, point) {
      return {x:point.plotX + -20,y:boxHeight / 2};
    }

    function loadOrgData(sites, orgData) {
      if (typeof orgData !== 'object' || typeof sites !== 'object' ||
        Object.keys(orgData).length < 2 || Object.keys(sites) === 0) {
        return;
      }

      var selectedPeriodKey;
      var comparisonsPeriodKeys;
      var data;
      var kpiData;

      selectedPeriodKey = sitePerformanceWidget.selectedPeriodStart + '_' + sitePerformanceWidget.selectedPeriodEnd;
      comparisonsPeriodKeys = [];

      _.each(sitePerformanceWidget.compareRanges, function (range) {
        comparisonsPeriodKeys.push(range.start + '_' + range.end);
      });

      sitePerformanceWidget.data = orgData[selectedPeriodKey];
      sitePerformanceWidget.comparisonsData = [];

      _.each(comparisonsPeriodKeys, function (periodKey) {
        sitePerformanceWidget.comparisonsData.push(orgData[periodKey]);
      });

      sitePerformanceWidget.orgSiteData = [];

      _.each(sites, function (site) {
        kpiData = {};

        _.each(sitePerformanceWidget.kpis, function (kpi) {
          var currentTotal = null;
          var compareTotal = null;
          if (reportDataIsAvailable(site.site_id, kpi)) {
            currentTotal = sitePerformanceWidget.data[site.site_id][kpi];
          }

          kpiData[kpi] = { selectedPeriod: currentTotal };
          kpiData[kpi].comparisons = [];

          _.each(comparisonsPeriodKeys, function (periodKey, index) {

            if( !ObjectUtils.isNullOrUndefined (sitePerformanceWidget.comparisonsData[index]) && !ObjectUtils.isNullOrUndefined (sitePerformanceWidget.comparisonsData[index][site.site_id]) ) {
              compareTotal = sitePerformanceWidget.comparisonsData[index][site.site_id][kpi];
            } else {
              compareTotal = '-';
            }

            kpiData[kpi].comparisons.push({
              compareTotal: compareTotal,
              comparison: comparisonsHelper.getComparisonData(currentTotal, compareTotal, false)
            });
          });

        });

        data = { id: site.site_id, name: site.name, data: kpiData };
        sitePerformanceWidget.orgSiteData.push(data);
      });


      var currentView = sitePerformanceWidget.views[Object.keys(sitePerformanceWidget.views)[0]];

      var viewIndex = 1;

      // Initial sort
      sitePerformanceWidget.orgSiteData = $filter('orderOrgdataObjectBy')(sitePerformanceWidget.orgSiteData, currentView.kpi, currentView.type, true);

      if(!ObjectUtils.isNullOrUndefined(sitePerformanceWidget.currentView)) {
        var matchedView;

        // We use an each loop because we need the index
        _.each(sitePerformanceWidget.views, function(view, index) {
          if(view.view === sitePerformanceWidget.currentView) {
            matchedView = view;
            viewIndex = index;
          }
        });

        if(!ObjectUtils.isNullOrUndefined(matchedView)) {
          currentView = matchedView;
        }
      }

      reloadChart(currentView, 1, viewIndex);

      setNoData();

      $timeout(function() {
        sitePerformanceWidget.isLoading = false;
        sitePerformanceWidget.allRequestsSucceeded = true;
      });
    }

    function reportDataIsAvailable(siteId, kpi) {
      return !ObjectUtils.isNullOrUndefined (sitePerformanceWidget.data) &&
        !ObjectUtils.isNullOrUndefined (sitePerformanceWidget.data[siteId]) &&
        !ObjectUtils.isNullOrUndefined (sitePerformanceWidget.data[siteId][kpi]);
    }

    function hasMoreSites() {
      var orgSites = sitePerformanceWidget.sites.length;
      if ((sitePerformanceWidget.currentPage * sitePerformanceWidget.numberOfSites) < orgSites) {
        return true;
      } else {
        return false;
      }
    }

    function getPreviousSitesLabel() {
      if (sitePerformanceWidget.currentPage > 2) {
        var startPrevious = getPreviousPage() * sitePerformanceWidget.numberOfSites - 1;
        return startPrevious + '-' + (startPrevious + sitePerformanceWidget.numberOfSites - 1);
      } else {
        return '1-' + sitePerformanceWidget.numberOfSites;
      }
    }

    function getNextSitesLabel() {
      var orgSites = sitePerformanceWidget.sites.length;
      var startNext = getNextPage() * sitePerformanceWidget.numberOfSites - 1;
      if (getNextPage() * sitePerformanceWidget.numberOfSites < orgSites) {
        return startNext + '-' + (startNext + sitePerformanceWidget.numberOfSites - 1);
      } else if (sitePerformanceWidget.currentPage * sitePerformanceWidget.numberOfSites + 1 === orgSites) {
        return orgSites;
      } else {
        return sitePerformanceWidget.currentPage * sitePerformanceWidget.numberOfSites + '-' + orgSites;
      }
    }

    function getNextPage() {
      return sitePerformanceWidget.currentPage + 1;
    }

    function getPreviousPage() {
      return sitePerformanceWidget.currentPage - 1;
    }

    function loadTranslations() {
      $translate.use(sitePerformanceWidget.language);

      angular.forEach(sitePerformanceWidget.views, function (view, key) {
        $translate('kpis.kpiTitle.' + view.view).then(function (title) {
          sitePerformanceWidget.views[key].title = title;
        });
      });

    }

    function compareRangeIsPriorPeriod(comparePeriodType) {
      if (comparePeriodType === 'prior_period') {
        return true;
      } else {
        return false;
      }
    }

    function compareRangeIsPriorYear(comparePeriodType) {
      if (comparePeriodType === 'prior_year') {
        return true;
      } else {
        return false;
      }
    }

    function getRangeLabel(index) {
      var dateRangeType;

      if(index === 1) {
        dateRangeType = sitePerformanceWidget.compareRange1Type;
      } else if(index === 2) {
        dateRangeType = sitePerformanceWidget.compareRange2Type;
      }

      if(dateRangeType === 'prior_period') {
        return 'common.PRIORPERIOD';
      } else if(dateRangeType === 'prior_year') {
        return 'common.PRIORYEAR';
      } else {
        return 'common.CUSTOMCOMPARE' + index;
      }
    }
  }
})();
