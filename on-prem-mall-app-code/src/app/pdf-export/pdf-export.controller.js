'use strict';

angular.module('shopperTrak')
.controller('PdfExportCtrl', [
  '$scope',
  '$q',
  '$http',
  '$stateParams',
  '$filter',
  '$translate',
  '$window',
  'ExportService',
  'LocationResource',
  'apiUrl',
  'OrganizationResource',
  'currentUser',
  'currentOrganization',
  'LocalizationService',
  'ObjectUtils',
  'SiteResource',
  'ZoneResource',
  'metricConstants',
  'ZoneHelperService',
  'metricNameService',
  'authService',
function (
  $scope,
  $q,
  $http,
  $stateParams,
  $filter,
  $translate,
  $window,
  ExportService,
  LocationResource,
  apiUrl,
  OrganizationResource,
  currentUser,
  currentOrganization,
  LocalizationService,
  ObjectUtils,
  SiteResource,
  ZoneResource,
  metricConstants,
  ZoneHelperService,
  metricNameService,
  authService
) {
  $scope.loading = true;
  $scope.numExportsInProgress = 0;

  $scope.lastExportFailed = false;

  $scope.getSiteById = getSiteById;
  $scope.isExportCartEmpty = isExportCartEmpty;
  $scope.clearExportCart = clearExportCart;
  $scope.removeMetric = removeMetric;
  $scope.getLocationById = getLocationById;
  $scope.getExportAreaTitle = getExportAreaTitle;
  $scope.exportCurrentCartToPdf = exportCurrentCartToPdf;
  $scope.getNumKeys = getNumKeys;
  $scope.loadSchedules = loadSchedules;
  $scope.toggleReport = toggleReport;
  $scope.back = back;

  $scope.exportCart = ExportService.getCart();
  $scope.exportedCarts = ExportService.getExportedCarts();

  $scope.currentUser = currentUser;
  $scope.orgId = $stateParams.orgId;
  $scope.organizationsList = [];
  $scope.organizations = {};
  $scope.sites = [];
  $scope.locations = [];
  $scope.zones = [];
  $scope.orgTags = [];

  activate();

  function activate() {
    LocalizationService.setUser(currentUser);

    var displayKpiLabelFor = ['power_hours','traffic_per_weekday'];
    loadTranslations();
    loadSchedules();
    updateMetricsInfo(displayKpiLabelFor);


    $scope.dateFormat = LocalizationService.getCurrentDateFormat(currentOrganization);
    $scope.dateFormat = $scope.dateFormat = $scope.dateFormat.replace(/\|/g,'/');

    if(typeof $stateParams.view !== 'undefined' && $stateParams.view === 'schedule') {
      $scope.editSchedule = true;
    }

    $scope.$on('pdfExportStart', updateNumExportsInProgress);
    $scope.$on('pdfExportFinish', updateNumExportsInProgress);
    $scope.$on('pdfExportFinish', updateExportErrorStatus);
    $scope.$on('clearCurrentPDfExports', clearExportCart);

    $scope.subject = {};
    $scope.message = {};

    $scope.mailCC = {};
    $scope.mailCC.emails = [];
    $scope.mailCC.emails.push({email: null});

    $scope.schedules = {};

    $scope.frequencies = {
      'day' : $filter('translate')('csvExportView.DAILY'),
      'week' : $filter('translate')('csvExportView.WEEKLY'),
      'month' : $filter('translate')('csvExportView.MONTHLY'),
      'year' : $filter('translate')('csvExportView.YEARLY')
    };

    $scope.language = LocalizationService.getCurrentLocaleSetting();
    $scope.widgetIsRenameable = widgetIsRenameable;
  }

  function widgetIsRenameable(partialPageName, name) {
    if(partialPageName === 'traffic') {
      return true;
    }

    if(name === 'power_hours' || name === 'traffic_per_weekday') {
      // For these two widgets, the custom name is appended
      return false;
    }

    var renameableWidgets = metricNameService.getRenameableWidgets();

    return _.contains(renameableWidgets, name);
  }

  $scope.$watchCollection('exportCart', function() {
    var orgId;
    _.each($scope.exportCart, function(exportCart, areaKey) {
      orgId = getOrganizationIdFromAreaKey(areaKey);
      _.each(exportCart, function(content) { content.orgId = orgId; });
      if (typeof $scope.orgTags[orgId] === 'undefined') {
        getOrganizationTags(orgId);
      }
    });

    if(ObjectUtils.isNullOrUndefinedOrEmpty($scope.exportCart)){
      $scope.editSchedule = false;
    }

    loadOrganizations().then(() => {
      loadSites();
      loadLocations();
      loadZones();
      loadExportList();
      $scope.loading = false;
    });
  });

  function loadExportList() {

    $scope.exportList = angular.copy($scope.exportCart);

    let areas = _.allKeys($scope.exportCart);

    _.each(areas, areaKey => {

      let dateRangeKeys = _.allKeys($scope.exportList[areaKey]);
      _.each(dateRangeKeys, dateKey => {
        $scope.exportList[areaKey][dateKey].heirarchyGroup = {};
        let areaDateKeyGroup = $scope.exportList[areaKey][dateKey].heirarchyGroup
        _.each($scope.exportList[areaKey][dateKey].metrics, (widget, index) => {
          //get customTagKey and add widget to new grouping
          let tagKey = 'noTags';

          if (_.isUndefined(widget.customTags)) { //no custom tags
            if (_.isUndefined(areaDateKeyGroup.noTags)) {
              areaDateKeyGroup.noTags = {
                tagTitle: '',
                salesCategoryGroups: {}
              };
            }
          } else { //has custom tags
            tagKey = '';

            let orgId = parseAreaKey(areaKey).organization;
            let orgCustomTags = $scope.organizations[orgId].custom_tags;

            _.each(widget.customTags, (tag, index) => {
              let tagDetails = _.findWhere(orgCustomTags, { _id: tag });
              if (index > 0) {
                tagKey += ` | ${tagDetails.tag_type} - ${tagDetails.name}`;
              } else {
                tagKey += `${tagDetails.tag_type} - ${tagDetails.name}`;
              }
            });

            if (_.isUndefined(areaDateKeyGroup[tagKey])) {
              areaDateKeyGroup[tagKey] = {
                tagTitle: tagKey,
                salesCategoryGroups: {}
              }
            }
          }

          //salesCats
          let catKey = 'noCats';
          let areaDateKeyGroupTagSales = areaDateKeyGroup[tagKey].salesCategoryGroups;

          if (ObjectUtils.isNullOrUndefinedOrEmpty(widget.salesCategories)) {
            if (!ObjectUtils.isNullOrUndefinedOrEmptyObject(areaDateKeyGroupTagSales[catKey])) {
              areaDateKeyGroupTagSales[catKey].widgets[index] = widget;
            } else {
              areaDateKeyGroupTagSales[catKey] = {
                catName: '',
                widgets: {
                  [index]: widget
                }
              }
            }
          } else {
            let catNames = _.pluck(widget.salesCategories, 'name');
            catKey = catNames.join(',').replace(/,/g, ' | ');
            if (ObjectUtils.isNullOrUndefinedOrEmptyObject(areaDateKeyGroupTagSales[catKey])) {
              areaDateKeyGroupTagSales[catKey] = {

                catName: catKey,
                widgets: {
                  [index]: widget
                }
              }
            } else {
              areaDateKeyGroupTagSales[catKey].widgets[index] = widget;
            }
          }
        });
      })
    });
  }

  $scope.$watchCollection('exportedCarts', function() {
    var orgId;
    _.each($scope.exportedCarts, function(exportCart) {
      _.each(exportCart, function(area, areaKey) {
        orgId = getOrganizationIdFromAreaKey(areaKey);

        // Store orgId to export to be able to show tags in list
        if(typeof area === 'object') {
          _.each(area, function(content) { content.orgId = orgId; });

          if (typeof $scope.orgTags[orgId] === 'undefined') {
            getOrganizationTags(orgId);
          }
        }
      });
    });
  });

  $scope.loadSchedules = function() {
    $http.get(apiUrl + '/organizations/' + $stateParams.orgId + '/scheduled-reports?exportType=pdf')
      .then(function(response) {
        $scope.schedules = response.data.result;

        $scope.schedules.map(function(schedule) {

          if(schedule.data && schedule.data.userId) {
            authService.getCurrentUser().then(function(response) {
              schedule.data.username = response.username;
              return schedule;
            }).catch(function (err) {
              console.error(err);
            });
          }
        });
        $scope.schedules = _.sortBy($scope.schedules, function(schedule) {
          if (schedule.data && schedule.data.scheduleEndDate) {
            return schedule.data.scheduleEndDate;
          } else {
            return schedule._id;
          }
        });
      })
      .catch(function(error) {
        console.error(error);
      });
  };

  $scope.loadSchedules();

  $scope.deleteSchedule = function(schedule) {
    $http.delete(apiUrl + '/organizations/' + schedule.data.orgId + '/scheduled-reports/' + schedule._id)
      .then(function() {
        $scope.loadSchedules();
      });
  };

  $scope.hasNoSchedules = function() {
    return $scope.schedules.length === 0;
  };

  $scope.toggleEditScheduleView = function() {
    $scope.editSchedule = !$scope.editSchedule;
  };

  $scope.sortableOptions = {
    stop: function(e, ui) {
      for (var index in ui.item.sortable.sourceModel) {
        ui.item.sortable.sourceModel[index].index = index;
      }
    }
  };

  updateNumExportsInProgress();

  function back(){
    $window.history.back();
  }

  function updateMetricsInfo(displayKpiLabelFor){
     _.each($scope.exportCart, function(area) {
        _.each(area, function(range){
          _.each(range.metrics, function(metric){
            if(displayKpiLabelFor.indexOf(metric.name) > - 1){
               addMetricTransKeys(metric);
            }
          });
        });
     });
  }

  function addMetricTransKeys(metric){
     var kpiName = !ObjectUtils.isNullOrUndefined(metric.selectedMetric) ? metric.selectedMetric : metric.kpi;
     var transKey = _.findWhere(metricConstants.metrics, {value: kpiName});
     if (!ObjectUtils.isNullOrUndefined(transKey) && !ObjectUtils.isNullOrUndefined(transKey.translationLabel)) {
         metric.kpiTranskey = transKey.translationLabel;
     } else {
         metric.kpiTranskey = 'pdfExportView.METRICS.' + kpiName;
     }
  }

  function updateNumExportsInProgress() {
    $scope.numExportsInProgress = ExportService.getNumExportsInProgress();
  }

  function updateExportErrorStatus (event, exportDetails) {
    $scope.lastExportFailed = !exportDetails.success;
  }

  function isExportCartEmpty() {
    return Object.keys($scope.exportCart).length === 0;
  }

  function clearExportCart() {
    $scope.isLoading = true;
    ExportService.clearExportCart();
    $scope.exportCart = ExportService.getCart();
    loadExportList();
    $scope.editSchedule = false;
    $scope.isLoading = false;
  }

  function removeMetric(areaKey, rangeKey, metric) {
    $scope.isLoading = true;
    ExportService.removeFromExportCart(areaKey, rangeKey, metric);
    $scope.exportCart = ExportService.getCart();
    loadExportList();
    $scope.isLoading = false;
  }

  function getSiteById(siteId) {
    var ret;
    angular.forEach($scope.sites, function(site) {
      if (String(site.site_id) === String(siteId)) {
        ret = site;
      }
    });
    return ret;
  }

  function getLocationById(locationId) {
    var ret;
    angular.forEach($scope.locations, function(location) {
      if (String(location.location_id) === String(locationId)) {
        ret = location;
      }
    });
    return ret;
  }

  function getExportAreaTitle(areaKey) {
    var title;
    var exportedCart = parseAreaKey(areaKey);
    var orgKey = exportedCart.organization;

    if(!ObjectUtils.isNullOrUndefined($scope.organizations) &&
       !ObjectUtils.isNullOrUndefined($scope.organizations[orgKey])) {

      title = $scope.organizations[orgKey].name;
    }

    if(hasSiteId(areaKey)) {
      title += ' / '+$scope.sites[orgKey][exportedCart.site].name;
    }

    if(hasZoneId(areaKey)) {
      var zoneName = $scope.zones[orgKey][exportedCart.site][exportedCart.zone].name;
      title += ' / '+ ZoneHelperService.removeLeadingX(zoneName);
    }

    if(hasLocationId(areaKey)) {
      title += ' / '+$scope.locations[orgKey][exportedCart.site][exportedCart.location].description;
    }

    return title;
  }

  function exportCurrentCartToPdf() {
    ExportService.exportCurrentCartToPdf();
    $scope.clearExportCart();
  }

  function getNumKeys(obj) {
    return Object.keys(obj).length;
  }

  $scope.exportCartToPdf = ExportService.exportCartToPdf;

  function loadTranslations() {
    $translate.use($scope.language);
  }

  function getOrganizationById(orgId) {
    return  OrganizationResource.get({orgId: orgId}).$promise;
  }

  function getOrganizationTags(orgId) {
    $scope.orgTags[orgId] = {};
    var organization = getOrganizationById(orgId);
    organization.then(function(result) {
      if(typeof result.portal_settings !== 'undefined' &&
        typeof result.portal_settings.group_structures !== 'undefined') {
        _.each(result.portal_settings.group_structures, function(tagGroup) {
          _.each(tagGroup.levels, function(tag) {
            _.each(tag.possible_values, function(tagValue) {
              $scope.orgTags[orgId][tagValue._id] = tagValue.name;
            });
          });
        });
      }
    });
  }

  function parseAreaKey(key) {
    var site, zone, location;
    var cartKey = key.split('_');
    var org = cartKey[0];

    if(cartKey[2]!=='tags') {
      site = cartKey[1];
    } else {
      site = null;
    }

    if(cartKey[2]!=='tags' && cartKey[2]!=='zone' && cartKey[2]!=='location') {
      location = cartKey[2];
    } else if(cartKey[2]==='location') {
      location = cartKey[3];
    } else {
      location = null;
    }

    if(cartKey[2]!=='tags' && cartKey[2]==='zone') {
      zone = cartKey[3];
    } else {
      zone = null;
    }

    return {
      organization: org,
      site: site,
      location: location,
      zone: zone
    };
  }

  function getOrganizationIdFromAreaKey(areaKey) {
    if( areaKey.indexOf('_') === -1) {
      return areaKey;
    } else {
      return areaKey.substr(0, areaKey.indexOf('_'));
    }
  }

  function loadOrganizations() {
    const deferred = $q.defer();
    let orgPromises = [];

    _.each($scope.exportCart, function buildPromisesForCurrentExports(item, key){
      let org = {};
      org[parseAreaKey(key).organization] = getOrganization(key);
      orgPromises.push(org[parseAreaKey(key).organization].$promise);
    });

    _.each($scope.exportedCart, function buildPromisesForPreviousExports(item){
      let orgKey = Object.keys(item)[0];
      let org = {};
      org[parseAreaKey(orgKey).organization] = getOrganization(orgKey);
      orgPromises.push(org[parseAreaKey(orgKey).organization].$promise);
    });

    $q.all(orgPromises)
      .then(result => {
        if (ObjectUtils.isNullOrUndefinedOrEmpty(result)) return false;
        // Convert promises array, into object keyed by orgId:
        var orgsObject = {};
        _.each(result, function(item){
          orgsObject[item.organization_id] = item;
        });
        $scope.organizations = orgsObject;
        deferred.resolve($scope.organizations);
      })
      .catch(error => {
        console.error(error);
        deferred.reject(error);
      });

    return deferred.promise;
  }

  function loadSites() {
    // Load sites for current export cart
    _.each($scope.exportCart, function(item,key) {
      var exportAreas = parseAreaKey(key);
      if(!siteIsLoaded(key) && hasSiteId(key)) {
        if(typeof $scope.sites[exportAreas.organization] === 'undefined') {
          $scope.sites[exportAreas.organization] = [];
        }
        $scope.sites[exportAreas.organization][exportAreas.site] = getSite(key);
      }
    });
    // Load sites for Previous exports
    var key, exportAreas;
    _.each($scope.exportedCarts, function(item) {
      key = Object.keys(item)[0];
      exportAreas = parseAreaKey(key);
      if(!siteIsLoaded(key) && hasSiteId(key)) {
        if(typeof $scope.sites[exportAreas.organization] === 'undefined') {
          $scope.sites[exportAreas.organization] = [];
        }
        $scope.sites[exportAreas.organization][exportAreas.site] = getSite(key);
      }
    });
  }

  function loadZones() {
    // Load zones for current export cart
    _.each($scope.exportCart, function(item,key) {
      var exportAreas = parseAreaKey(key);
      if(!zoneIsLoaded(key) && hasSiteId(key) && hasZoneId(key)) {
        if(typeof $scope.zones[exportAreas.organization] === 'undefined') {
          $scope.zones[exportAreas.organization] = [];
        }
        if(typeof $scope.zones[exportAreas.organization][exportAreas.site] === 'undefined') {
          $scope.zones[exportAreas.organization][exportAreas.site] = [];
        }
        $scope.zones[exportAreas.organization][exportAreas.site][exportAreas.zone] = getZone(key);
      }
    });
    // Load zones for Previous exports
    var key, exportAreas;
    _.each($scope.exportedCarts, function(item) {
      key = Object.keys(item)[0];
      exportAreas = parseAreaKey(key);
      if(!zoneIsLoaded(key) && hasSiteId(key) && hasZoneId(key)) {
        if(typeof $scope.zones[exportAreas.organization] === 'undefined') {
          $scope.zones[exportAreas.organization] = [];
        }
        if(typeof $scope.zones[exportAreas.organization][exportAreas.site] === 'undefined') {
          $scope.zones[exportAreas.organization][exportAreas.site] = [];
        }
        $scope.zones[exportAreas.organization][exportAreas.site][exportAreas.zone] = getZone(key);
      }
    });
  }

  function loadLocations() {
    // Load locations for current export cart
    _.each($scope.exportCart, function(item,key) {
      var exportAreas = parseAreaKey(key);
      if(hasLocationId(key) && !locationIsLoaded(key)) {
        if(typeof $scope.locations[exportAreas.organization] === 'undefined') {
          $scope.locations[exportAreas.organization] = [];
        }
        if(typeof $scope.locations[exportAreas.organization][exportAreas.site] === 'undefined') {
          $scope.locations[exportAreas.organization][exportAreas.site] = [];
        }
        $scope.locations[exportAreas.organization][exportAreas.site][exportAreas.location] = getLocation(key);
      }
    });
    // Load locations for Previous exports
    var key, exportAreas;
    _.each($scope.exportedCarts, function(item) {
      key = Object.keys(item)[0];
      exportAreas = parseAreaKey(key);
      if(hasLocationId(key) && !locationIsLoaded(key)) {
        if(typeof $scope.locations[exportAreas.organization] === 'undefined') {
          $scope.locations[exportAreas.organization] = [];
        }
        if(typeof $scope.locations[exportAreas.organization][exportAreas.site] === 'undefined') {
          $scope.locations[exportAreas.organization][exportAreas.site] = [];
        }
        $scope.locations[exportAreas.organization][exportAreas.site][exportAreas.location] = getLocation(key);
      }
    });
  }

  function getOrganization(areaKey) {
    var exportContents = parseAreaKey(areaKey);
    return OrganizationResource.get({orgId: exportContents.organization});
  }

  function getSite(areaKey) {
    var exportContents = parseAreaKey(areaKey);
    return SiteResource.get({orgId: exportContents.organization, siteId: exportContents.site});
  }

  function getLocation(areaKey) {
    var exportContents = parseAreaKey(areaKey);
    return  LocationResource.get({orgId: exportContents.organization, siteId: exportContents.site, locationId: exportContents.location});
  }

  function getZone(areaKey) {
    var exportContents = parseAreaKey(areaKey);
    if(!ObjectUtils.isNullOrUndefined(exportContents.zone)) {
      exportContents.zone = parseInt(exportContents.zone);
    }
    return new ZoneResource().get({orgId: exportContents.organization, siteId: exportContents.site, zoneId: exportContents.zone});
  }

  function hasSiteId(areaKey) {
    var exportContents = parseAreaKey(areaKey);
    return !ObjectUtils.isNullOrUndefined(exportContents.site) && exportContents.site !== '-1' && exportContents.location !== 'tags';
  }

  function hasLocationId(areaKey) {
    var exportContents = parseAreaKey(areaKey);
    return !ObjectUtils.isNullOrUndefined(exportContents.location) && exportContents.location !== 'zone' && exportContents.location !== 'tags';
  }

  function hasZoneId(areaKey) {
    var exportContents = parseAreaKey(areaKey);
    return !ObjectUtils.isNullOrUndefined(exportContents.zone);
  }

  function siteIsLoaded(key) {
    var exportAreas = parseAreaKey(key);
    return !(
      ObjectUtils.isNullOrUndefined($scope.sites[exportAreas.organization]) ||
      ObjectUtils.isNullOrUndefined($scope.sites[exportAreas.organization][exportAreas.site])
    );
  }

  function locationIsLoaded(key) {
    var exportAreas = parseAreaKey(key);
    return !(
      ObjectUtils.isNullOrUndefined($scope.locations[exportAreas.organization]) ||
      ObjectUtils.isNullOrUndefined($scope.locations[exportAreas.organization]) ||
      ObjectUtils.isNullOrUndefined($scope.locations[exportAreas.organization][exportAreas.site]) ||
      ObjectUtils.isNullOrUndefined($scope.locations[exportAreas.organization][exportAreas.site][exportAreas.location])
    );
  }

  function zoneIsLoaded(key) {
    var exportAreas = parseAreaKey(key);
    return !(
      ObjectUtils.isNullOrUndefined($scope.zones[exportAreas.organization]) ||
      ObjectUtils.isNullOrUndefined($scope.zones[exportAreas.organization]) ||
      ObjectUtils.isNullOrUndefined($scope.zones[exportAreas.organization][exportAreas.site]) ||
      ObjectUtils.isNullOrUndefined($scope.zones[exportAreas.organization][exportAreas.site][exportAreas.zone])
    );
  }

  function loadSchedules() {
    $http.get(apiUrl + '/organizations/' + $stateParams.orgId + '/scheduled-reports?exportType=pdf')
      .then(function (response) {
        $scope.schedules = response.data.result;
        $scope.isOpenReport = null;

        if (typeof $scope.schedules === 'object') {
          $scope.schedules.map(function (schedule) {
            if (schedule.data && schedule.data.userId) {
              authService.getCurrentUser().then(function (response) {
                schedule.data.username = response.username;
                return schedule;
              });
            }
          });
          $scope.schedules = _.sortBy($scope.schedules, function(schedule) {
            if (schedule.data && schedule.data.scheduleEndDate) {
              return schedule.data.scheduleEndDate;
            } else {
              return schedule._id;
            }
          });
        }
      })
      .catch(function (error) {
        console.error(error);
        $scope.loadingSchedulesFailed = true;
      });
  }

  function toggleReport(index) {
    if(!ObjectUtils.isNullOrUndefined($scope.isOpenReport) && $scope.isOpenReport[index]) {
      $scope.isOpenReport[index] = false;
    } else {
      $scope.isOpenReport = [];
      $scope.isOpenReport[index] = true;
    }
  }

}]);
