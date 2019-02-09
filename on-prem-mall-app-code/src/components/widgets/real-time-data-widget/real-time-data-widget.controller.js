(function () {
  'use strict';

  angular.module('shopperTrak').controller('realTimeDataWidgetCtrl', [
    '$scope',
    '$rootScope',
    'realTimeDataService',
    'comparisonsHelper',
    'realTimeDataWidgetConstants',
    'metricConstants',
    '$translate',
    '$q',
    'LocalizationService',
    'OrganizationResource',
    'SiteResource',
    'ObjectUtils',
    'metricsHelper',
    function (
      $scope,
      $rootScope,
      realTimeDataService,
      comparisonsHelper,
      realTimeDataWidgetConstants,
      metricConstants,
      $translate,
      $q,
      LocalizationService,
      OrganizationResource,
      SiteResource,
      ObjectUtils,
      metricsHelper) {
      var unbindLoadingWatch;
      var unbindRefreshDataWatch;

      $scope.allKpisData = [];

      activate();

      function activate() {
        // If currentOrganization is not provided, fetch organization settings using vm.orgId
        if (!ObjectUtils.isNullOrUndefined($scope.orgId) &&
          (ObjectUtils.isNullOrUndefined($scope.currentOrganization) ||
          $scope.currentOrganization.organization_id !== $scope.orgId)) {
          var currentOrganization;
          currentOrganization = OrganizationResource.get({
            orgId: $scope.orgId
          }).$promise;
          currentOrganization.then(function(result) {
            $scope.currentOrganization = result;
            LocalizationService.setOrganization($scope.currentOrganization);
            getOrganizationSites();
          });
          return;
        }
        init();
      }

      function getOrganizationSites() {
        if (ObjectUtils.isNullOrUndefinedOrEmpty($scope.sites)) {
          var sites = SiteResource.query({
            orgId: $scope.currentOrganization.organization_id,
            allFields:'?all_fields=true'
          });

          sites.$promise.then(function(sites) {
            $scope.sites = sites;
            populateSelectedSitesInfo();
            init();
          });
        }
      }

      function populateSelectedSitesInfo() {
        $scope.selectedSitesInfo = [];
        _.each($scope.selectedSites, function (siteId) {
          addToSiteIfo(siteId);
        });
        _.each($scope.selectedTagsSites, function (siteId) {
          addToSiteIfo(siteId);
        });
      }

      function addToSiteIfo(siteId) {
        var site = _.findWhere($scope.sites, { site_id: siteId });
        if (!ObjectUtils.isNullOrUndefined(site)) {
          $scope.selectedSitesInfo.push(site);
        }
      }

      function init() {
        configureKpis();
        configureWatches();
        $scope.$on('$destroy', onDestroy);
        // set it to false for time being in future we might need to show compare time period
        $scope.widgetIcon = 'real-time';
        if (ObjectUtils.isNullOrUndefined($scope.showCompareTimePeriod)) {
          $scope.showCompareTimePeriod = false;
        }
      }

      function getMetricTitle(kpi, displayName) {
        if(!_.isUndefined($scope.orgMetrics)) {
          var metric = _.findWhere($scope.orgMetrics, { value: kpi.value });
          if(!_.isUndefined(metric)) {
            return metric.displayName;
          }
        }
        return !ObjectUtils.isNullOrUndefinedOrBlank(displayName)? displayName: kpi.shortTranslationLabel;
      }

      function configureKpis() {
        $scope.allKpisData = [];
        var promises =[];
        realTimeDataWidgetConstants.kpis.forEach(function (kpi, key) {
          var metric = metricsHelper.getMetricInfo(kpi.id,realTimeDataService.metricLookup, undefined, true);
          metric.title = getMetricTitle(metric, metric.displayName);
          var permissionInfo = getPermissionInfo(kpi);
          var hasPermission = _.where(permissionInfo, { hasPermission: true }).length === permissionInfo.length;
          var prefixSymbol = metric.prefixSymbol;

          if (metric.isCurrency && !ObjectUtils.isNullOrUndefinedOrBlank($scope.currencySymbol)) {
            prefixSymbol = $scope.currencySymbol;
          }

          var promise = getPermissionMessage(permissionInfo).then(function (permissionMessage) {
            var kpiData = angular.extend(metric, {
              id: key,
              isLoading: false,
              requestFailed: false,
              hasData: false,
              title: metric.title,
              api: metric.apiReturnkey,
              hasPermission: hasPermission,
              permissionName: permissionMessage,
              precision: metric.precision,
              prefixSymbol: prefixSymbol,
              suffixSymbol: metric.suffixSymbol,
              labels: {
                1: {
                  totalsLabel: kpi.totalsLabel,
                  fromLabel: ''
                }
              },
              comparisons: {
                current: 1,
                data: {}
              }
            });

            $scope.allKpisData.push(kpiData);
          });
          promises.push(promise);
        });

         $q.all(promises).then(function() {
           /* If view controller doesn't provide widgetData, widget makes own data requests.
             This is used by the PDF export feature. */
          if (ObjectUtils.isNullOrUndefined($scope.widgetData)) {
            $scope.widgetDataIsLoading = {};
            $scope.widgetData = {};
            $scope.hasData = false;

            getWidgetData();
          }
        });
      }

      function setPdfEvent() {
        if ($rootScope.pdf) {
          $scope.renderReady = false;

          $scope.$watchGroup(['loading', 'renderReady'],
            function () {
              if (!$scope.loading  && $scope.renderReady) {
                $rootScope.pdfExportsLoaded += 1;
              }
            }
          );
        }
      }

      function configureWatches() {
        setPdfEvent();

        unbindLoadingWatch = $scope.$watch('isLoading', function (nv) {
          if (nv === false) {
            $scope.loading = false;
            $scope.renderReady = true;
          }
        });

        unbindRefreshDataWatch = $scope.$watch('refreshData', function () {
          if (!$scope.refreshData) {
            return;
          }

          $scope.widgetDataIsLoading = {};
          $scope.widgetData = {};
          $scope.hasData = false;
          getWidgetData();
          $scope.refreshData = false;
        });
      }

      function onDestroy() {
        realTimeDataService.cancelAllOutstandingRequests();
        if (typeof unbindLoadingWatch === 'function') {
          unbindLoadingWatch();
        }

        if (typeof unbindRefreshDataWatch === 'function') {
          unbindRefreshDataWatch();
        }
      }

      function getPermissionMessage(permissionInfo) {
        var deferred = $q.defer();

        var result = '';

        var missingPermissions = _.where(permissionInfo, { hasPermission: false });

        var transkeys = missingPermissions.map(function (missingPermission) {
          return missingPermission.transkey;
        });

        if (transkeys.length === 0) {
          deferred.resolve(result);
        }

        $translate(transkeys).then(function (translations) {

          transkeys.forEach(function (transkey, index) {
            if (index > 0) {
              result += ', ';
            }
            result += translations[transkey];
          }, function () {
            deferred.reject();
          });

          deferred.resolve(result);
        });

        return deferred.promise;
      }

      function getPermissionInfo(kpi) {
        var metric = _.findWhere(metricConstants.metrics, { value: kpi.id });

        var permissionResults = [];

        metric.requiredSubscriptions.forEach(function (permission) {

          var permissionResult = {
            name: permission
          };

          if (permission === 'sales') {
            permissionResult.hasPermission = $scope.hasSales;
            permissionResult.transkey = 'kpis.shortKpiTitles.tenant_sales';
          }

          if (permission === 'labor') {
            permissionResult.hasPermission = $scope.hasLabor;
            permissionResult.transkey = 'kpis.shortKpiTitles.tenant_labor';
          }

          permissionResults.push(permissionResult);
        });

        return permissionResults;
      }

      function getSiteId() {
        if($scope.singleSite &&
          !ObjectUtils.isNullOrUndefinedOrEmpty($scope.selectedSites)) {
          return $scope.selectedSites[0];
        }

        if($scope.singleSite &&
          !ObjectUtils.isNullOrUndefinedOrEmpty($scope.selectedTagsSites) &&
          $scope.selectedTagsSites.length === 1) {
          return $scope.selectedTagsSites[0].site_id;
        }

        if (ObjectUtils.isNullOrUndefined($scope.currentSite) &&
          ObjectUtils.isNullOrUndefined($scope.siteId)) {
          return undefined;
        }

        if (ObjectUtils.isNullOrUndefined($scope.siteId)) {
          return $scope.currentSite.site_id;
        } else {
          return $scope.siteId;
        }
      }

      function getOrgId() {
        if (ObjectUtils.isNullOrUndefined($scope.currentOrganization) && ObjectUtils.isNullOrUndefined($scope.orgId)) {
          return undefined;
        }

        if (ObjectUtils.isNullOrUndefined($scope.orgId)) {
          return $scope.currentOrganization.organization_id;
        } else {
          return $scope.orgId;
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

        return params;
      }

      function getWidgetData() {
        $scope.widgetData = [];
        $scope.widgetDataIsLoading = true;
        $scope.isLoading = true;
        $scope.requestFailed = false;

        realTimeDataService.getRealTimeKpiData(getRealTimeDataParams(),
          $scope.allKpisData,
          $scope.selectedSitesInfo,
          $scope.selectedTagsSites,
          $scope.enterExit,
          $scope.singleSite
          )
          .then(function (result) {
            $scope.widgetData = result.metricList;
            if (!ObjectUtils.isNullOrUndefined($scope.widgetData)) {
              $scope.allKpisData = result.metricList;
            }

            $scope.widgetDataIsLoading = false;
            $scope.isLoading = false;

            $scope.hasData = result.hasData;
            $scope.requestFailed = false;
          }).catch(function(error) {
            if(error !== 'User cancelled') {
              $scope.widgetDataIsLoading = false;
              $scope.isLoading = false;
              $scope.requestFailed = true;
              $scope.hasData = false;
              console.log('error getting Real Time Kpi Data');
              console.log(error);
            }
          });
      }

    }]);
})();
