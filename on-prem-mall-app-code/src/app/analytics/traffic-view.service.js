(function () {
  'use strict';

angular.module('shopperTrak')
  .factory('trafficViewService', [
    '$rootScope',
    '$q',
    '$state',
    '$stateParams',
    'utils',
    'ObjectUtils',
    'metricConstants',
    'widgetConstants',
    'ExportService',
    function trafficViewService (
    $rootScope,
    $q,
    $state,
    $stateParams,
    utils,
    ObjectUtils,
    metricConstants,
    widgetConstants,
    ExportService) {

    var self = this;
    var currentOrganization;
    var currentZone;
    var currentSite;
    var metricsToShow;

    function widgetVariables() {
      return widgetConstants.exportProperties;
    }

    function isShowMetrics() {
      var tenant = ['TenantCommon'];

      if (ObjectUtils.isNullOrUndefined(currentOrganization) && ObjectUtils.isNullOrUndefined(currentZone)) {
        return false;
      }

      var retailSite = currentOrganization.portal_settings.organization_type === 'Retail' ||
        (!ObjectUtils.isNullOrUndefined(currentSite) && currentSite.type === 'Retailer');

      var tenantZone = (!ObjectUtils.isNullOrUndefined(currentZone) && currentZone.type === tenant) ||
        (!ObjectUtils.isNullOrUndefined(self.zones) && hasZonesWithType(tenant));

      return retailSite || tenantZone;
    }

    function hasZonesWithType(widgetZoneTypes, exclude) {
      var zoneTypes = mapZoneType(self.zones);
      if (exclude === undefined) {
        exclude = false;
      }
      var filteredList = filterLists(zoneTypes, widgetZoneTypes, exclude);
      var showWidget = false;

      if (filteredList !== undefined && filteredList.length > 0) {
        showWidget = true;
      }
      return showWidget;
    }

    function mapZoneType(zones) {
      return zones.map(function (zone) {
        return zone.type;
      });
    }

    function filterLists(zoneTypes, widgetZoneTypes, exclude) {
      var matchedList = [];

      zoneTypes.forEach(function (type) {
        if (widgetZoneTypes.indexOf(type) === -1 && exclude === true) {
          matchedList.push(type);
        } else if (widgetZoneTypes.indexOf(type) !== -1 && exclude === false) {
          matchedList.push(type);
        }
      });

      return matchedList;
    }

    function getDateRangeType (state) {
      let dateRangeType = $stateParams.activeShortcut;

      if (_.isUndefined(dateRangeType)) {
        dateRangeType = utils.getDateRangeType(state.dateRange, state.currentUser, state.currentOrganization);
      }

      return dateRangeType;
    }

    function initExportParam (metricKey, state) {
      let params;

      params = {
        orgId: currentSite.organization.id,
        siteId: currentSite.site_id,
        dateRange: { start: state.dateRange.start, end: state.dateRange.end },
        dateRangeType: getDateRangeType(state),
        compare1Range: { start: state.compareRange1.start, end: state.compareRange1.end },
        compare2Range: { start: state.compareRange2.start, end: state.compareRange2.end },
        compare1Type: state.compareRange1Type,
        compare2Type: state.compareRange2Type,
        dateFormat: state.dateFormat,
        dateRangeShortCut: $state.rangeSelected,
        customRange:  $state.customRange || null,
        name: metricKey,
        kpi: state.kpi.name,
        language: state.language,
        firstDayOfWeekSetting: state.firstDayOfWeek,
        operatingHours: state.operatingHours,
        siteHasLabor: state.siteHasLabor,
        siteHasSales: state.siteHasSales,
        currencySymbol: _.findWhere(metricConstants.metrics, { isCurrency: true }).prefixSymbol,
        userId: state.currentUser._id,
        selectedWeatherMetrics: state.selectedWeatherMetrics,
        showWeatherMetrics: state.showWeatherMetrics,
        sortType: '-traffic',
        pdfOrientation: 'portrait'
      };

      if (params.dateRangeShortCut === 'custom' && params.customRange === null) {
        params.xDaysBack = moment().diff(params.dateRange.start, 'days');
        params.xDaysDuration = params.dateRange.end.diff(params.dateRange.start, 'days');
      }

      if (currentZone) {
        params.zoneId = currentZone.id;
      }

      return params;
    }

    function setCurrentOrganization(org) {
      currentOrganization = org;
    }

    function setCurrentZone (zone) {
      currentZone = zone;
    }

    function setCurrentSite(site) {
      currentSite = site;
      if (site && site.zones) {
        self.zones = site.zones;
      }
    }

    function setMetricsToShow(metrics) {
      metricsToShow = metrics;
    }

    function getAreaKey() {
      if (ObjectUtils.isNullOrUndefined(currentSite)) {
        return null;
      }

      var areaKey = currentSite.organization.id + '_' + currentSite.site_id;
      if (currentZone) {
        areaKey += '_zone_' + currentZone.id;
      }
      return areaKey;
    }

    function scheduleExportCurrentViewToPdf(scope) {
      _.each(metricsToShow, function (metricToShow) {
        switch(metricToShow) {
          case 'entrance_contribution':
            if(scope.showEntranceSummary === true) {
              scope.exportWidget(metricToShow);
            }
            break;

          case 'daily_performance_widget':
            if(!scope.isSingleDaySelected) {
              scope.exportWidget(metricToShow);
            }
            break;  
          default:
            scope.exportWidget(metricToShow);
        }
      });

      $state.go('pdfexport', { orgId: currentOrganization.organization_id, siteId: currentSite.site_id, view: 'schedule' });
    }

    /**
     * this = $scope from controller - widgetIsExported.bind($scope) is used in traffic.controller and hourly.controller
     * @param metricKey
     * @param groupBy
     * @returns {*}
    */
    function widgetIsExported(metricKey, params) {
      const exports = ExportService.getCart();
      if (ObjectUtils.isNullOrUndefinedOrEmptyObject(exports)) {
        //if the export cart is empty there is nothing to check so return false (all export buttons can be enabled). 
        return false;
      }
    
      const dateRangeKey =
        this.dateRange.start +
        ' - ' +
        this.dateRange.end +
        ' - ' +
        this.compareRange1.start +
        ' - ' +
        this.compareRange1.end +
        ' - ' +
        this.compareRange2.start +
        ' - ' +
        this.compareRange2.end;

      let currentOrgExports;

      if (!ObjectUtils.isNullOrUndefinedOrEmptyObject(this.currentZone)) {
        currentOrgExports = `${this.currentOrganization.organization_id}_${this.currentSite.site_id}_zone_${this.currentZone.zoneId}`;
      } else if (!_.isUndefined(this.currentSite.site_id)) {
        currentOrgExports = `${this.currentOrganization.organization_id}_${this.currentSite.site_id}`;
      } else {
        currentOrgExports = `${this.currentOrganization.organization_id}_-1`;
      }

      if (_.isUndefined(exports[currentOrgExports])) {
        //no exports for the current organisation/site in the cart, nothing needs to be checked, the export button for this widget can be enabled. 
        return false;
      }

      if(_.isUndefined(exports[currentOrgExports][dateRangeKey])) {
        //no exports for the current date range, widget exports can be enabled
        return false;
      }

      const exportMetrics = _.pluck(exports[currentOrgExports][dateRangeKey].metrics, 'name');

      if (!exportMetrics.includes(metricKey)) {
        //if the widget type is not in the export cart, nothing needs to be checked, the export button for this widget can be enabled. 
        return false;
      }

      let paramsToCompare;

      if (ObjectUtils.isNullOrUndefined(params.partialPageName)) params.partialPageName = params.name;

      if (!ObjectUtils.isNullOrUndefined(params.partialPageName)) {
        paramsToCompare = widgetVariables()[params.partialPageName];
      }

      return ExportService.isInExportCartWithSettings(getAreaKey(), dateRangeKey, metricKey, params, paramsToCompare)
    }


    return {
      isShowMetrics: isShowMetrics,
      hasZonesWithType: hasZonesWithType,
      mapZoneType: mapZoneType,
      filterLists: filterLists,
      initExportParam: initExportParam,
      setCurrentOrganization: setCurrentOrganization,
      setCurrentZone: setCurrentZone,
      setCurrentSite: setCurrentSite,
      setMetricsToShow: setMetricsToShow,
      getAreaKey: getAreaKey,
      scheduleExportCurrentViewToPdf: scheduleExportCurrentViewToPdf,
      widgetIsExported: widgetIsExported,
      widgetVariables: widgetVariables
    }
  }])
})();
