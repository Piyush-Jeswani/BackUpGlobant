(function() {
  'use strict';

  angular
    .module('shopperTrak.widgets')
    .directive('entranceContributionPieWidget', entranceContributionPieWidget);

  function entranceContributionPieWidget() {
    return {
      templateUrl: 'components/widgets/entrance-contribution-pie-widget/entrance-contribution-pie-widget.partial.html',
      scope: {
        orgId:            '=',
        siteId:           '=',
        zoneId:           '=',
        dateRangeStart:   '=',
        dateRangeEnd:     '=',
        currentOrganization: '=',
        currentUser:      '=',
        operatingHours:   '=',
        language:         '=',
        hideExportIcon:   '=',
        onExportClick:    '&',
        exportIsDisabled: '=?',
        summaryKey:       '@',
        siteZones:        '=?',
        setSelectedWidget:'&',
        isLoading:        '=?',
        segments:         '=?',
        gridLayout:       '='
      },
      controller: EntranceContributionPieWidgetController,
      controllerAs: 'vm',
      bindToController: true
    };
  }

  EntranceContributionPieWidgetController.$inject = [
    '$scope',
    '$rootScope',
    'requestManager',
    '$q',
    'apiUrl',
    'SiteResource',
    '$filter',
    'LocalizationService',
    'comparisonsHelper',
    '$translate',
    'ObjectUtils',
    'utils'
  ];

  function EntranceContributionPieWidgetController(
    $scope,
    $rootScope,
    requestManager,
    $q,
    apiUrl,
    SiteResource,
    $filter,
    LocalizationService,
    comparisonsHelper,
    $translate,
    ObjectUtils,
    utils
  ) {
        var vm = this; // 'vm' stands for 'view model'
        vm.entranceItems = [];
        vm.isLoading = false;
        vm.requestFailed = false;
        vm.pdf = $rootScope.pdf;
        vm.chartOptions = {
          donut: true,
          labelOffset: 30,
          labelDirection: 'explode',
          chartPadding: 60,
          donutWidth: 30,
          labelOverflow: false
        };
        vm.chartData = {
          series: [],
          labels: [],
          chart: {
            margin: [0, 0, 0, 0],
            spacingTop: 0,
            spacingBottom: 0,
            spacingLeft: 0,
            spacingRight: 0
          },
          plotOptions: {
            pie: {
              size:'100%'
              // dataLabels: {
              //   enabled: false
              // }
            }
          }
        };
        activate();
        function activate() {
          setNumberFormatName();
          $scope.$watchGroup([
            'vm.orgId',
            'vm.siteId',
            'vm.dateRangeStart',
            'vm.dateRangeEnd'
          ], fetchData);
          loadTranslations();
          if($rootScope.pdf) loadForPdfComplete();
        }

        /**
        * Notifies the pdf controller when all widgets have rendered.
        * this function returns nothing but increases the $rootScope.pdfExportsLoaded number by 1.
        */
        function loadForPdfComplete() {
          vm.loadRun = 0;
          vm.renderReady = false;
          vm.chartOptions.events = {
            load: vm.renderReady = true,
          }
          $scope.$watchGroup(['vm.isLoading', 'vm.renderReady', 'vm.chartHasData'],
            function () {
              if (!vm.isLoading && vm.renderReady && vm.chartHasData && vm.loadRun < 1) {
                $rootScope.pdfExportsLoaded += 1;
                vm.loadRun += 1;
              }
            }
          );
        }

        function loadTranslations() {
          $translate.use(vm.language);
        }

        function setNumberFormatName() {
          var currentUser = vm.currentUser;
          var currentOrganization = vm.currentOrganization;
          vm.numberFormatName = LocalizationService.getCurrentNumberFormatName(currentUser, currentOrganization);
        }

        function fetchData() {
          var selectedZoneId;
          vm.isLoading = true;

          fetchSite().then(function(site) {

            if (angular.isDefined(vm.zoneId)) {
              selectedZoneId = vm.zoneId;
            } else {
              selectedZoneId = site.total_property_zone_id;
            }

            vm.siteZones = site.zones;

            $q.all([
              fetchReportData(selectedZoneId),
              fetchTmpData()
            ])
              .then(updateScopeWithResponseData)
              .catch(showError);
          });
        }

        function fetchSite() {
          return SiteResource.get({
            orgId: vm.orgId,
            siteId: vm.siteId
          }).$promise;
        }

        function fetchReportData(selectedZoneId) {

          var requestParams = {
            orgId:           vm.orgId,
            siteId:          vm.siteId,
            zoneId:          selectedZoneId,
            reportStartDate: utils.getDateStringForRequest(vm.dateRangeStart),
            reportEndDate:   utils.getDateStringForRequest(vm.dateRangeEnd),
            // We are interested in aggregate data, so use
            // the largest possible grouping
            groupBy:         'month',
            countType:       'enters'
          };

          if (angular.isDefined(vm.operatingHours)) {
            requestParams.operatingHours = vm.operatingHours;
          }

          return requestManager.get(apiUrl + '/kpis/traffic/entrances', { params: requestParams });
        }

        function dataNotValid(responses) {
          return ObjectUtils.isNullOrUndefinedOrEmpty(responses) || ObjectUtils.isNullOrUndefined(responses[0] || ObjectUtils.isNullOrUndefinedOrEmpty(responses[0].result));
        }

        function clearDataAndSetNoData() {
          vm.isLoading = false;
          vm.chartHasData = true;
          vm.totalTraffic = 0;
          vm.entranceItems = [];
          vm.chartData = [];
        }

        function updateScopeWithResponseData(responses) {
          if(dataNotValid(responses)) {
            return clearDataAndSetNoData();
          }

          var reportData = responses[0];
          var monitorPointIds = getUniqueMonitorPointIds(reportData.result);
          vm.segments = monitorPointIds;

          var entranceItems = monitorPointIds.map(function(monitorPointId) {
            return {
              id: monitorPointId,
              name: vm.tmpData[monitorPointId],
              traffic: calculateAggregateTraffic(monitorPointId, reportData.result)
            };
          });

          entranceItems.sort(function(itemA, itemB) {
            return String(itemA.id).localeCompare(itemB.id);
          });

          // Entrances are given a number, because they don't have names. This way,
          // users have a way of comparing entrances over different time periods.
          entranceItems.forEach(function(item, index) {
            item.number = index + 1;
          });

          vm.totalTraffic = entranceItems.reduce(function(total, item) {
            return total + item.traffic;
          }, 0);
          vm.chartData = transformEntranceItemsToChartData(entranceItems, vm.totalTraffic, vm.numberFormatName);
          checkIfChartHasData();
          vm.entranceItems = entranceItems;
          vm.isLoading = false;
        }

        function checkIfChartHasData(){
          vm.chartHasData =  _.max(vm.chartData.series, function(share){ return share; }) > 0;
        }

        function transformEntranceItemsToChartData(entranceItems, totalTraffic, format) {
          var share;
          var chartData = {
            series: [],
            labels: []
          };
          var i = 1;
          var shownTraffic = 0;

          entranceItems = $filter('orderBy')(entranceItems,'-traffic');
          vm.chartLegend = _.pluck(entranceItems, 'name');


          entranceItems.forEach(function(entranceItem) {
            if(i===10) {
              var othersLabel = $filter('translate')('entranceContributionPieWidget.OTHERS');
              var othersShare = comparisonsHelper.getPercentageShare(totalTraffic, totalTraffic - shownTraffic);
              chartData.labels.push(othersLabel + ': ' + $filter('formatNumber')(othersShare.percentageShare,1, format));
              chartData.series.push(othersShare.actual);

              var entranceShare = comparisonsHelper.getPercentageShare(totalTraffic, entranceItem.traffic);
              entranceItem.share = entranceShare;

            } else {
              share = comparisonsHelper.getPercentageShare(totalTraffic, entranceItem.traffic);
              entranceItem.share = share;

              if(i < 10) {
                chartData.labels.push($filter('formatNumber')(share.percentageShare,1,format));
                chartData.series.push(share.actual);
                shownTraffic += share.actual;
              }
            }
            i++;
          });

          return chartData;
        }

        function getUniqueMonitorPointIds(resultItems) {
          return resultItems.reduce(function(monitorPointIds, item) {
            if (monitorPointIds.indexOf(item.monitor_point_id) < 0) {
              monitorPointIds.push(item.monitor_point_id);
            }
            return monitorPointIds;
          }, []);
        }

        function calculateAggregateTraffic(monitorPointId, resultItems) {
          var itemsForMonitorPoint = resultItems.filter(function(item) {
            return item.monitor_point_id === monitorPointId;
          });

          return itemsForMonitorPoint.reduce(function(aggregateValue, item) {
            return aggregateValue + parseInt(item.total_traffic);
          }, 0);
        }

        function fetchTmpData() {
          var deferred = $q.defer();
          vm.tmpData = [];
          angular.forEach(vm.siteZones, function(zone) {
            angular.forEach(zone.tmps, function(tmp) {
              if(tmp.name !== null && tmp.name !== undefined && tmp.name.length > 0) {
                vm.tmpData[tmp.id] = tmp.name;
              }
            });
          });

          deferred.resolve();

          return vm.tmpData;
        }

        function showError() {
          vm.requestFailed = true;
          vm.isLoading = false;
        }
  }
})();
