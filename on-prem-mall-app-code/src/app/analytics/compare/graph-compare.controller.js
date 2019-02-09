(function() {
  'use strict';

  angular.module('shopperTrak')
    .constant('graphCompareControllerConstants', {
      // For each widget type, there should be a template
      // partial in the 'partials' directory.
      availableWidgets: {
        'interior': [
          {
            title: 'Mobile traffic',
            translationSlug: 'kpis.kpiTitle.mobile_traffic',
            type: 'traffic-comparison-widget',
            locationsType: 'interior'
          }, {
            title: 'Dwell time',
            translationSlug: 'kpis.kpiTitle.dwell_time',
            type: 'dwell-time-comparison-widget',
            locationsType: 'interior'
          }, {
            title: 'Gross shopping hours',
            translationSlug: 'kpis.kpiTitle.gsh',
            type: 'gross-shopping-hours-comparison-widget',
            locationsType: 'interior'
          }, {
            title: 'Draw rate',
            translationSlug: 'kpis.kpiTitle.draw_rate',
            type: 'draw-rate-comparison-widget',
            locationsType: 'interior'
          }, {
            title: 'Abandonment rate',
            translationSlug: 'kpis.kpiTitle.abandonment_rate',
            type: 'abandonment-rate-comparison-widget',
            locationsType: 'interior'
          }, {
            title: 'Opportunity',
            translationSlug: 'kpis.kpiTitle.opportunity',
            type: 'opportunity-comparison-widget',
            locationsType: 'interior'
          }
        ],
        'perimeter': [
          {
            title: 'Traffic',
            translationSlug: 'kpis.kpiTitle.traffic',
            type: 'perimeter-traffic-comparison-widget',
            locationsType: 'perimeter'
          }
        ],
        'sales': [
          {
            title: 'Sales',
            translationSlug: 'kpis.kpiTitle.sales',
            type: 'sales-comparison-widget',
            locationsType: 'perimeter'
          },{
            title: 'Conversion',
            translationSlug: 'kpis.kpiTitle.conversion',
            type: 'conversion-comparison-widget',
            locationsType: 'perimeter'
          },{
            title: 'ATS',
            translationSlug: 'kpis.kpiTitle.ats',
            type: 'ats-comparison-widget',
            locationsType: 'perimeter'
          },{
            title: 'Units per transaction',
            translationSlug: 'kpis.kpiTitle.upt',
            type: 'upt-comparison-widget',
            locationsType: 'perimeter'
          }
        ],
        'labor': [
          {
            title: 'Labor hours',
            translationSlug: 'kpis.kpiTitle.labor',
            type: 'labor-hours-comparison-widget',
            locationsType: 'perimeter'
          },
          {
            title: 'STAR',
            translationSlug: 'kpis.kpiTitle.star',
            type: 'star-comparison-widget',
            locationsType: 'perimeter'
          }
        ]}
    })
    .controller('GraphCompareController', GraphCompareController);

  GraphCompareController.$inject = [
    '$scope',
    '$stateParams',
    'graphCompareControllerConstants',
    'compareStateManager',
    'currentOrganization',
    'currentSite',
    'currentUser',
    'ExportService',
    'SubscriptionsService',
    'LocalizationService',
    '$translate',
    'customDashboardService'
  ];

  function GraphCompareController(
    $scope,
    $stateParams,
    controllerConstants,
    compareStateManager,
    currentOrganization,
    currentSite,
    currentUser,
    ExportService,
    SubscriptionsService,
    LocalizationService,
    $translate,
    customDashboardService
  ) {
    var vm = this;

    vm.stateParams = $stateParams;
    vm.widgetDropdownIsOpen = false;
    vm.availableWidgets = getAvailableWidgets();
    vm.widgets = [];
    vm.locationsShouldBeCopied = false;

    vm.closeWidgetDropdown = closeWidgetDropdown;
    vm.toggleWidgetDropdown = toggleWidgetDropdown;
    vm.addWidgetAndCloseDropdown = addWidgetAndCloseDropdown;
    vm.removeWidget = removeWidget;
    vm.changeWidgetType = changeWidgetType;
    vm.getAvailableWidgetByType = getAvailableWidgetByType;
    vm.onExportButtonClick = onExportClick;
    vm.widgetIsExported = widgetIsExported;
    vm.setSelectedWidget = setSelectedWidget;
    vm.widgetIsAdded = widgetIsAdded;
    vm.setAreas = setAreas;
    vm.dateRangesLoaded = dateRangesLoaded();

    vm.language = LocalizationService.getCurrentLocaleSetting();

    activate();

    function activate() {
      loadTranslations();

      vm.widgets = compareStateManager.loadWidgets(
        $stateParams.orgId,
        $stateParams.siteId
      );

      LocalizationService.setUser(currentUser);
      vm.dateFormat = LocalizationService.getCurrentDateFormat(currentOrganization);
      vm.numberFormatName = LocalizationService.getCurrentNumberFormatName(currentUser, currentOrganization);

      vm.selectedAreas = {};

      $scope.$watch('vm.widgets', function(oldWidgets, newWidgets) {
        if (angular.equals(oldWidgets, newWidgets)) {
          return;
        }
        compareStateManager.saveWidgets(
          $stateParams.orgId,
          $stateParams.siteId,
          vm.widgets
        );
      }, true);
    }

    function getAvailableWidgets() {
      var availableWidgets = [];

        if(SubscriptionsService.siteHasInterior(currentOrganization, currentSite)) {
          angular.forEach(controllerConstants.availableWidgets.interior, function(item) {
            availableWidgets.push(item);
          });
        }

        if(SubscriptionsService.siteHasPerimeter(currentOrganization, currentSite)) {
          angular.forEach(controllerConstants.availableWidgets.perimeter, function(item) {
            availableWidgets.push(item);
          });
        }

        if(SubscriptionsService.siteHasSales(currentOrganization, currentSite)) {
          angular.forEach(controllerConstants.availableWidgets.sales, function(item) {
            availableWidgets.push(item);
          });
        }

        if(SubscriptionsService.siteHasLabor(currentOrganization, currentSite)) {
          angular.forEach(controllerConstants.availableWidgets.labor, function(item) {
            availableWidgets.push(item);
          });
        }

      return availableWidgets;
    }

    function onExportClick(metricKey, toDashboard) {
      if (metricKey !== undefined) {
        var params = {
          orgId: currentSite.organization.id,
          siteId: currentSite.site_id,
          dateRange: {
            start: $stateParams.dateRangeStart,
            end: $stateParams.dateRangeEnd
          },
          compare1Range: {
            start: $stateParams.dateRangeStart,
            end: $stateParams.dateRangeEnd
          },
          compare2Range: {
            start: $stateParams.dateRangeStart,
            end: $stateParams.dateRangeEnd
          },
          name: metricKey
        };

        if(widgetUsesInterior(metricKey)) {
          params.locationIds = getWidgetLocations(metricKey);
        } else {
          params.zoneIds = getWidgetZones(metricKey);
        }

        if (toDashboard) {
          customDashboardService.setSelectedWidget(params, currentUser);
        } else {
          ExportService.createExportAndStore(params);
        }
      }
    }

    function setSelectedWidget(title) {
      onExportClick(title, true);
    }

    function getWidgetLocations(metricKey) {
      var widgetLocations,
      widgetObj = vm.widgets.filter(function(widget) {
        if (widget.type === metricKey) {
          return widget;
        }
      });
      widgetLocations = widgetObj[0].locationIds;
      return widgetLocations;
    }

    function getWidgetZones(metricKey) {
      var widgetZones,
      widgetObj = vm.widgets.filter(function(widget) {
        if (widget.type === metricKey) {
          return widget;
        }
      });
      widgetZones = widgetObj[0].zoneIds;
      return widgetZones;
    }

    function getAreaKey(metricKey) {
      var areaKey = currentSite.organization.id + '_' + currentSite.site_id;
      var widgetAreaIds;
      var joinedMetricKey;

      if (metricKey !== undefined) {
        if(widgetUsesInterior(metricKey)) {
          widgetAreaIds = getWidgetLocations(metricKey);
        } else {
          widgetAreaIds = getWidgetZones(metricKey);
        }
        if(widgetAreaIds !== undefined && widgetAreaIds.length > 0) {
          joinedMetricKey = widgetAreaIds.join();
          areaKey += '_' + joinedMetricKey;
        }
      }
      return areaKey;
    }

    function widgetUsesInterior(metricKey) {
      if(metricKey !== 'perimeter-traffic-comparison-widget') {
        return true;
      } else {
        return false;
      }
    }

    function closeWidgetDropdown() {
      vm.widgetDropdownIsOpen = false;
    }

    function toggleWidgetDropdown() {
      vm.widgetDropdownIsOpen = !vm.widgetDropdownIsOpen;
    }

    function addWidgetAndCloseDropdown(widgetType) {
      addWidget(widgetType);
      closeWidgetDropdown();
    }

    function addWidget(widgetType) {
      var locationIds = [];

      if(!widgetIsAdded(widgetType)) {
        vm.selectedAreas[widgetType] = [];
        vm.widgets.push({
          type: widgetType,
          locationIds: locationIds
        });
      }
    }

    function removeWidget(widget) {
      vm.selectedAreas[widget] = [];
      vm.widgets.splice(vm.widgets.indexOf(widget), 1);
    }

    function changeWidgetType(widget, newType) {
      widget.type = newType;
    }

    function getAvailableWidgetByType(type) {
      return _(vm.availableWidgets).findWhere({
        type: type
      });
    }

    function widgetIsAdded(widgetType) {
      var widget = _(vm.widgets).findWhere({
        type: widgetType
      });
      if(widget === undefined) {
        return false;
      } else {
        return true;
      }
    }

    function widgetIsExported(metricKey) {
      var dateRangeKey =
        $stateParams.dateRangeStart +
        ' - ' +
        $stateParams.dateRangeEnd +
        ' - ' +
        $stateParams.dateRangeStart +
        ' - ' +
        $stateParams.dateRangeEnd +
        ' - ' +
        $stateParams.dateRangeStart +
        ' - ' +
        $stateParams.dateRangeEnd;

      return ExportService.isInExportCart(getAreaKey(metricKey), dateRangeKey, metricKey);
    }

    function dateRangesLoaded() {
      if($stateParams.dateRangeStart !== undefined && $stateParams.dateRangeEnd !== undefined) {
        return true;
      } else {
        return false;
      }
    }

    function setAreas(copyFrom, copyTo) {
      if(vm.selectedAreas[copyTo] !== vm.selectedAreas[copyFrom]) {
        vm.selectedAreas[copyTo] = vm.selectedAreas[copyFrom];
      }
    }

    function loadTranslations() {
      $translate.use(vm.language);
    }

  }
})();
