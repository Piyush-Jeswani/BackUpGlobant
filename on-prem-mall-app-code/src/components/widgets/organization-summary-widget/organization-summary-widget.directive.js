(function() {
  'use strict';
  angular.module('shopperTrak.widgets')
    .controller('OrganizationSummaryWidgetController', OrganizationSummaryWidgetController)
    .directive('organizationSummaryWidget', organizationSummaryWidgetDirective);


  function organizationSummaryWidgetDirective() {
    return {
      templateUrl: 'components/widgets/organization-summary-widget/organization-summary-widget.partial.html',
      scope: {
        orgId:                    '=',
        sites:                    '=?',
        selectedPeriodStart:      '=',
        selectedPeriodEnd:        '=',
        compareRange1Start:       '=compareRange1Start',
        compareRange1End:         '=compareRange1End',
        compareRange1Type:        '=compareRange1Type',
        compareRange2Start:       '=compareRange2Start',
        compareRange2End:         '=compareRange2End',
        compareRange2Type:        '=compareRange2Type',
        compareType:              '=',
        firstDayOfWeekSetting:    '=firstDayOfWeekSetting',
        widgetData:               '=?',
        hideExportIcon:           '=?',
        onExportClick:            '&',
        exportIsDisabled:         '=?exportIsDisabled',
        numberFormatName:         '=',
        filterType:               '@',
        filterText:               '=?',
        zoneFilterQuery:          '=',
        activeSortType:           '=',
        hideControls:             '=',
        isLoading:                '=?',
        setSelectedWidget:        '&',
        orgMetrics:               '=?' // This is passed in on the custom dashboard, and the PDF
      },
      controller: OrganizationSummaryWidgetController,
      controllerAs: 'vm',
      bindToController: true
    };
  }

  OrganizationSummaryWidgetController.$inject = [
    '$scope',
    '$rootScope',
    'organizationSummaryWidgetConstants',
    'organizationSummaryData',
    'SiteResource',
    '$translate',
    '$timeout',
    '$filter',
    'LocalizationService',
    'ObjectUtils',
    'comparisonsHelper',
    'metricConstants'
  ];

  function OrganizationSummaryWidgetController(
    $scope,
    $rootScope,
    widgetConstants,
    organizationSummaryData,
    SiteResource,
    $translate,
    $timeout,
    $filter,
    LocalizationService,
    ObjectUtils,
    comparisonsHelper,
    metricConstants
  ) {
    var vm = this;
    var localMetricConstants;

    $scope.hideControls = false;
    vm.showAllSites = false;
    vm.kpis = ['traffic', 'gsh', 'loyalty'];
    vm.compareType = vm.compareType || 'range1';

    vm.language = LocalizationService.getCurrentLocaleSetting();
    vm.widgetData = undefined;
    vm.orgSiteData = [];
    vm.allData= [];
    vm.columns = [];
    vm.filter = vm.filter || { text: vm.filterText || '' };

    setMetricsConstants();
    loadTranslations();
    vm.options = {
      emptyMessage: '',
      rowHeight: 50,
      sortType: 'single',
      columnMode: 'force',
      headerHeight: 50,
      footerHeight: false,
      selectable: true,
      columns: vm.columns,
      paging: {
        externalPaging: false
      }
    };

    if($rootScope.pdf) {
      vm.isPdf = true;
      loadForPdfComplete()
    }

    $scope.$watchCollection('vm.widgetData', function() {
      renderWidget();
    });

    $scope.$watchCollection('vm.sites', function() {
      renderWidget();
    });

    if (!ObjectUtils.isNullOrUndefined(vm.hideControls) && vm.hideControls.indexOf('summary-page') > -1) {
      $scope.hideControls = true;
    }

    vm.reportDataIsAvailable = reportDataIsAvailable;
    vm.compareDataIsAvailable = compareDataIsAvailable;
    vm.setCompareType = setCompareType;
    vm.compareRangeIsPriorPeriod = compareRangeIsPriorPeriod;
    vm.compareRangeIsPriorYear = compareRangeIsPriorYear;

    vm.getKpiTitle = getKpiTitle;
    vm.getKpiDeltaLabel = getKpiDeltaLabel;
    vm.getFractionSize = getFractionSize;

    vm.filterKeyDown = function (ev) {
      // Prevent Backspace in search input from refreshing the whole page
      if (ev.keyCode === 8 && ev.target.value === '') {
        ev.stopPropagation();
      }
    };

    activate();

    $scope.$watch('vm.compareType', function() {
      activate();
      renderWidget();
    });

    /**
    * Notifies the pdf controller when all widgets have rendered.
    * this function returns nothing but increases the $rootScope.pdfExportsLoaded number by 1.
    */
    function loadForPdfComplete() {
      vm.renderReady = false;
      vm.options.events = {
        load: vm.renderReady = true,
      }
      $scope.$watchGroup(['vm.isLoading', 'vm.renderReady'],
        function () {
          if (!vm.isLoading && vm.renderReady) {
            $rootScope.pdfExportsLoaded += 1;
          }
        }
      );
    }

    var filterTextTimeout;


    if (!ObjectUtils.isNullOrUndefined(vm.activeSortType)) {
      vm.orderBy = vm.activeSortType;
    } else {
      vm.orderBy = '-summary';
    }

    $scope.$watch('vm.filter.text', function (filterText) {
      if (filterTextTimeout) {
        $timeout.cancel(filterTextTimeout);
      }

      filterTextTimeout = $timeout(function () {
        if (filterText.length > 2) {
          vm.filterText = filterText;
          vm.orgSiteData = $filter('collectionFilter')(vm.allData, 'name', filterText);
        } else {
          if (vm.filterText !== false) {
            vm.filterText = false;
            vm.orgSiteData = angular.copy(vm.allData);
          }
        }
      }, 250);
    });

    function activate() {
      vm.isLoading = true;
      vm.allRequestsSucceeded = false;

      if (vm.compareType === 'range1') {
        vm.comparePeriod = {
          start: vm.compareRange1Start,
          end: vm.compareRange1End
        };
      } else {
        vm.comparePeriod = {
          start: vm.compareRange2Start,
          end: vm.compareRange2End
        };
      }

      vm.compare1Period = {
        start: vm.compareRange1Start,
        end: vm.compareRange1End
      };

      vm.compare2Period = {
        start: vm.compareRange2Start,
        end: vm.compareRange2End
      };


      fetchKpiData(vm.orgId, vm.selectedPeriodStart, vm.selectedPeriodEnd);
      fetchKpiData(vm.orgId, vm.comparePeriod.start, vm.comparePeriod.end);

      if (ObjectUtils.isNullOrUndefined(vm.sites)) {
        getOrganizationSites();
      }
    }

  /**
   * Overwrites the metric constants with whatever has been passed in to the directive
   * This is used by the PDF and the custom dashboard and covers the case of users with
   * Access to multiple organizations 
   */
  function setMetricsConstants() {
    localMetricConstants = angular.copy(metricConstants);

    if(!_.isUndefined(vm.orgMetrics)) {
      localMetricConstants.metrics = vm.orgMetrics;
    }
  }

    function loadTranslations() {
      vm.kpiTitles = {};
      vm.deltaLabels = {};
      vm.sitePlaceholder = 'Organization Summary';

      $translate.use(vm.language);

      $translate('common.SITE').then(function(label) {
        var siteColumn = {
          prop: 'name',
          name: label,
          width: 200,
          canAutoresize: false,
          template: '<ng-include src="\'components/widgets/organization-summary-widget/cell-templates/site-cell.partial.html\'"></ng-include>',
          headerTemplate: '<ng-include src="\'components/widgets/organization-summary-widget/cell-templates/header.partial.html\'"></ng-include>'
        };
        vm.columns.unshift(siteColumn);
      });

      $translate('organizationSummaryWidget.HEADER').then(function(placeholder) {
        vm.sitePlaceholder = placeholder;
      });


      angular.forEach(vm.kpis, function(kpi) {
        $translate('kpis.deltaLabel.' + kpi).then(function(label) {
          vm.deltaLabels[kpi] = label;
          var colOj = {
            name: label,
            prop: 'data.' + kpi + '.comparison.percentageChangeReal',
            kpi: kpi,
            headerTemplate: '<ng-include src="\'components/widgets/organization-summary-widget/cell-templates/header.partial.html\'"></ng-include>',
            template: '<ng-include src="\'components/widgets/organization-summary-widget/cell-templates/kpi-change.partial.html\'"></ng-include>'
          };
          vm.columns.push(colOj);
        });

        var metric = _.findWhere(localMetricConstants.metrics, { value: kpi});

        $translate('kpis.kpiTitle.' + kpi).then(function(title) {
          vm.kpiTitles[kpi] = title;
          var colOj = {
            name: title,
            prop: 'data.' + kpi + '.selectedPeriod',
            kpi: kpi,
            headerTemplate: '<ng-include src="\'components/widgets/organization-summary-widget/cell-templates/header.partial.html\'"></ng-include>',
            template: '<ng-include src="\'components/widgets/organization-summary-widget/cell-templates/kpi-cell.partial.html\'"></ng-include>'
          };

          if(!_.isUndefined(metric)) {
            vm.kpiTitles[kpi] = metric.displayName;
            colOj.name = metric.displayName;
          }
          vm.columns.push(colOj);
        });
      });
    }

    function fetchKpiData(orgId, dateRangeStart, dateRangeEnd) {
      if (ObjectUtils.isNullOrUndefined(vm.widgetData)) {
        vm.widgetData = {};
      }

      var dateRangeKey = organizationSummaryData.getDateRangeKey(dateRangeStart, dateRangeEnd);

      organizationSummaryData.setParams({
        'orgId': orgId,
        'dateRangeStart': dateRangeStart,
        'dateRangeEnd': dateRangeEnd
      });
      if (vm.widgetData[dateRangeKey] === undefined) {
        organizationSummaryData.fetchKPIData(function(data) {
          vm.widgetData[dateRangeKey] = data;
          vm.options.paging.count = vm.widgetData.length;
          vm.options.paging.size = 25;
        });
      }
    }

    function getOrganizationSites() {
      vm.sites = SiteResource.query({orgId: vm.orgId});
    }

    function renderWidget() {
      if (ObjectUtils.isNullOrUndefinedOrEmpty(vm.sites) ||
        ObjectUtils.isNullOrUndefined(vm.widgetData) ||
        Object.keys(vm.widgetData).length < 2) {
        return;
      }

      var selectedPeriodKey;
      var priorPeriodKey;
      var data;
      var kpiData;

      selectedPeriodKey = organizationSummaryData.getDateRangeKey(
        vm.selectedPeriodStart,
        vm.selectedPeriodEnd
      );

      priorPeriodKey = organizationSummaryData.getDateRangeKey(
        vm.comparePeriod.start,
        vm.comparePeriod.end
      );

      vm.data = vm.widgetData[selectedPeriodKey];
      vm.comparisonData = vm.widgetData[priorPeriodKey];

      vm.orgSiteData = [];


      angular.forEach(vm.sites, function(site) {
        kpiData = {};

        angular.forEach(vm.kpis, function(kpi) {
          var currentTotal = null;
          if (vm.reportDataIsAvailable(site.site_id, kpi)) {
            currentTotal = vm.data[site.site_id][kpi];
          }

          kpiData[kpi] = {selectedPeriod: currentTotal};

          var compareTotal = null;
          if (vm.compareDataIsAvailable(site.site_id, kpi)) {
            compareTotal = vm.comparisonData[site.site_id][kpi];
          }

          kpiData[kpi].compareTotal = compareTotal;
          kpiData[kpi].comparison = comparisonsHelper.getComparisonData(currentTotal, compareTotal, true);
        });

        data = {id: site.site_id, name: site.name, data: kpiData};
        vm.orgSiteData.push(data);
      });


      vm.allData = vm.orgSiteData;

      vm.orgSiteData = $filter('collectionFilter')(vm.allData, 'name', vm.filter.text);
      vm.isLoading = false;
      vm.allRequestsSucceeded = true;
    }

    function reportDataIsAvailable(siteId, kpi) {
      return !!vm.data && !!vm.data[siteId] && !!vm.data[siteId][kpi];
    }

    function compareDataIsAvailable(siteId, kpi) {
      return !!vm.comparisonData && !!vm.comparisonData[siteId] && !!vm.comparisonData[siteId][kpi];
    }

    function getKpiTitle(kpi) {
      return vm.kpiTitles[kpi];
    }

    function getKpiDeltaLabel(kpi) {
      return vm.deltaLabels[kpi];
    }

    function getFractionSize(kpi) {
      return widgetConstants.fractionSizes[kpi];
    }

    function setCompareType(compareType) {
      vm.compareType = compareType;
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

  }
})();
