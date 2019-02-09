(function () {
  'use strict';

angular.module('shopperTrak')
.factory('customDashboardService', [
  'apiUrl',
  '$http',
  '$q',
  'authService',
  'ObjectUtils',
  '$rootScope',
  '$state',
  '$translate',
  'googleAnalytics',
  'utils',
  function customDashboardService (
    apiUrl,
    $http,
    $q,
    authService,
    ObjectUtils,
    $rootScope,
    $state,
    $translate,
    googleAnalytics,
    utils
  ) {

    var selectedWidget = null;

    function isNewDashboardAllowed(newDashboardName, user){
      if(!ObjectUtils.isNullOrUndefined(user.preferences.custom_dashboards.length) && user.preferences.custom_dashboards.length < 5) {
        var nameDoesNotExist = true;
        _.each(user.preferences.custom_dashboards, function(dashboard){
          if(dashboard.name === newDashboardName) {
            nameDoesNotExist = false;
          }
        });
        return nameDoesNotExist;
      } else {
        return false;
      }
    }

    function saveNewDashboard(newDashboardName, widget, currentUser, orgId) {

      // Some charts will pass in the current user that causes an error when updating the user preferences
      if (widget.hasOwnProperty('currentUser')) delete widget.currentUser;

      var availablePosition = currentUser.preferences.custom_dashboards.length + 1;

      adjustDatesForCustomRanges(widget);

      var newDashboard = {
        widgets: widget,
        name: newDashboardName,
        position: availablePosition
      };

      var deferred = $q.defer();

      currentUser.preferences.custom_dashboards.push(newDashboard);

      $http.put(apiUrl + '/users/' + currentUser._id, {
        preferences: {
          custom_dashboards: currentUser.preferences.custom_dashboards
        },
        orgId:orgId
      })
      .then(function(result) {
        authService.updateUserPreferencesCustomDashboards(result.data.result[0].preferences.custom_dashboards);
        $rootScope.$broadcast('customDashboardAdded', { customDashboards: currentUser.preferences.custom_dashboards });
        deferred.resolve();
      }, function(err) {
        // Remove custom dashboard that was added
        currentUser.preferences.custom_dashboards.pop();
        deferred.reject(err.statusText || $translate.instant('common.DATAERROR'));
      });

      return deferred.promise;
    }

    function dashboardBefore(dashboardIndex, currentUser) {
      if (typeof currentUser.preferences.custom_dashboards[dashboardIndex - 1] !== 'undefined') {
        return { customDashboard: currentUser.preferences.custom_dashboards[dashboardIndex - 1], dashboardBefore: true, dashboardAfter: false };
      }
    }

    function dashboardAfter(dashboardIndex, currentUser) {
      if (typeof currentUser.preferences.custom_dashboards[dashboardIndex] !== 'undefined') {
        return { customDashboard: currentUser.preferences.custom_dashboards[dashboardIndex], dashboardBefore: false, dashboardAfter: true };
      }
    }

    function dashboardBeforeOrAfter(dashboardIndex, currentUser) {
      if (dashboardBefore(dashboardIndex, currentUser)) {
        return dashboardBefore(dashboardIndex, currentUser);
      }

      if (dashboardAfter(dashboardIndex, currentUser)) {
        return dashboardAfter(dashboardIndex, currentUser);
      }

      return false;
    }

    function deleteDashboard(dashboard, currentUser){
      var toSplice;
      _.each(currentUser.preferences.custom_dashboards, function(item, index){
        if(dashboard.name === item.name) {
          toSplice = index;
        }
      });

      currentUser.preferences.custom_dashboards.splice(toSplice, 1);
      sortPositions(currentUser);

      var deferred = $q.defer();
      $http.put(apiUrl + '/users/' + currentUser._id, {
        preferences: {
          custom_dashboards: currentUser.preferences.custom_dashboards
        }
      })
      .then((function (result) {
        authService.updateUserPreferencesCustomDashboards(result.data.result[0].preferences.custom_dashboards);
        var isDashboardBeforeOrAfter = dashboardBeforeOrAfter(toSplice, currentUser);
        $rootScope.$broadcast('customDashboardRemoved', isDashboardBeforeOrAfter);
        deferred.resolve();
      }), function (err) {
        //couldn't delete so put dashboard back
        currentUser.preferences.custom_dashboards.splice(toSplice, 0, dashboard);
        deferred.reject(err);
      });
      return deferred.promise;
    }

    function deleteAllDashboards(currentUser) {
      var deferred = $q.defer();
      $http.put(apiUrl + '/users/' + currentUser._id, { preferences: { custom_dashboards: [] } })
      .then(function (result) {
        authService.updateUserPreferencesCustomDashboards(result.data.result[0].preferences.custom_dashboards);
        $rootScope.$broadcast('customDashboardRemoved');
        deferred.resolve();
      }, function (err) {
        deferred.reject(err);
      });
      return deferred.promise;
    }

    /**
    * Updates an existing dashboard
    * @param {object} dashWidgets The dashboard widgets to be updated. Public function.
    * @returns {object} a object containing the updated widgets as this function removes all the unused 
    * properties for currentOrganization except orgID to make calls efficient. 
    */
    function removeUnwantedWidgetProperties(dashWidgets) {
      if (!ObjectUtils.isNullOrUndefined(dashWidgets.widgets)) {
        _.each(dashWidgets.widgets, (widget) => {
          if (!ObjectUtils.isNullOrUndefined(widget.currentOrganization)) {

            if (!ObjectUtils.isNullOrUndefined(widget.currentOrganization.organization_id)) {
              const widgetOrgId = widget.currentOrganization.organization_id;
              widget.currentOrganization = {
                organization_id: widgetOrgId
              }
            } else {
              widget.currentOrganization = {};
            }
          }
        })

        return dashWidgets;

      }
      return dashWidgets;
    }

    /**
    * Updates an existing dashboard
    * @param {object} dashboardToUpdate The dashboard to update. Public function.
    * @param {String} oldName The target dashboard name (for use when the name changed)
    * @returns {object} a promise containing the updated user object as returned from the API
    */
    function updateDashboard(dashboardToUpdate, oldName, orgId) {
      // Load the current user
      var deferred = $q.defer();

      authService.getCurrentUser().then(function (currentUser) {
        var dashboards = getDashboards(currentUser);
        let updateWidgetData = removeUnwantedWidgetProperties(dashboardToUpdate);
        var index = findDashboardIndex(dashboards, oldName || updateWidgetData.name);
        dashboards[index] = updateWidgetData;
        currentUser.preferences.custom_dashboards = dashboards;

        $http.put(apiUrl + '/users/' + currentUser._id, {
          preferences: {
            custom_dashboards: currentUser.preferences.custom_dashboards
          },
          orgId: orgId
        })
          .then(function (result) {
            authService.updateUserPreferencesCustomDashboards(result.data.result[0].preferences.custom_dashboards);
            deferred.resolve(result.data.result[0]);
          }, function (err) {
            deferred.reject(err.statusText || $translate.instant('common.DATAERROR'));
          });

      }, function (error) {
        deferred.reject(error);
      });
      return deferred.promise;
    }

    /**
    * Finds the index of a dashboard based on the position. Private function.
    * @param {array} dashboards The array of dashboards to search within
    * @param {number} position The position to find the index of
    * @returns {number} The index of the dashboard at the specified position
    */
    function findDashboardIndex(dashboards, name) {
      return _.findIndex(dashboards, {name:name});
    }

    function sortPositions(currentUser){
      _.each(currentUser.preferences.custom_dashboards, function(item, index){
        item.position = index + 1;
      });
    }

    function getDashboards(currentUser) {
      return currentUser.preferences.custom_dashboards;
    }

    function setSelectedWidget(params, vm) {
      if(!ObjectUtils.isNullOrUndefined(vm)){
        params.currentOrganization = vm.currentOrganization;
        params.compareSites = params.sites;
      }
      params.dateRangeShortCut = $state.rangeSelected;
      params.customRange = $state.customRange;
      selectedWidget = params;
    }

    function getSelectedWidget() {
      return selectedWidget;
    }

    function getDashboardByName(currentUser, dashboardName) {
      var search = { name: dashboardName };

      var dashboard = _.findWhere(currentUser.preferences.custom_dashboards, search);

      return dashboard;
    }

    function saveWidgetToDashboard(widget, dashboardName, orgId) {
      var deferred = $q.defer();

      authService.getCurrentUser().then(function(currentUser) {
        var currentDashboard = getDashboardByName(currentUser, dashboardName);

        var dashboardIndex = currentDashboard.position - 1;
        adjustDatesForCustomRanges(widget);

        // Remove currentUser from widget
        delete widget.currentUser;

        stringifyDates(widget);
        currentUser.preferences.custom_dashboards[dashboardIndex].widgets.push(widget);
        $http.put(apiUrl + '/users/' + currentUser._id, {
          preferences: {
            custom_dashboards: currentUser.preferences.custom_dashboards
          },
          orgId:orgId
        })
        .then(function(result) {
          googleAnalytics.trackUserEvent('custom dashboard', 'add widget');
          authService.updateUserPreferencesCustomDashboards(result.data.result[0].preferences.custom_dashboards);
          deferred.resolve();
        }, (function (user, dashboardIndex) {
          return function (err) {
            // Remove custom dashboard that was added
            user.preferences.custom_dashboards[dashboardIndex].widgets.pop();
            deferred.reject(err.statusText || $translate.instant('common.DATAERROR'));
          }
        }(currentUser, dashboardIndex)));
      });
      return deferred.promise;
    }

  /**
    * This function gets the dates ready for saving in the user preferences object.
    * Without this function, we get timezone problems as the default action is to turn a momentJS object into an ISO string for saving
    * @param {object<widget>}
    */
    function stringifyDates(widget) {
      stringifyDateRange(widget, 'dateRange');
      stringifyDateRange(widget, 'compare1Range');
      stringifyDateRange(widget, 'compare2Range');
    }

    function stringifyDateRange(widget, datePropName) {
      if(ObjectUtils.isNullOrUndefined(widget[datePropName])) {
        return;
      }

      if(moment.isMoment(widget[datePropName].start)) {
        widget[datePropName].start = utils.getDateStringForRequest(widget[datePropName].start);
      }

      if(moment.isMoment(widget[datePropName].end)) {
        widget[datePropName].end = utils.getDateStringForRequest(widget[datePropName].end);
      }
    }

  /**
    * Adds in properties needed for widgets with custom date ranges.
    * Operates directly on widget object passed in
    * @param {object<widget>} end - a moment object date
    */
    function adjustDatesForCustomRanges(widget) {
      if(widget.dateRangeShortCut !== 'custom') {
        return;
      }

      if(ObjectUtils.isNullOrUndefined(widget.customRange)) {
        widget.deferStartDaysDateBy = xDaysBack(widget.dateRange.start);
        widget.dateDurationInDays = xDuration(widget.dateRange.start, widget.dateRange.end);

        widget.compareDatesBack = {
          compare1Start: utils.getDaysBetweenDates(widget.dateRange.start, widget.compare1Range.start, false),
          compare1End: utils.getDaysBetweenDates(widget.dateRange.end, widget.compare1Range.end, false),
          compare2Start: utils.getDaysBetweenDates(widget.dateRange.start, widget.compare2Range.start, false),
          compare2End: utils.getDaysBetweenDates(widget.dateRange.end, widget.compare2Range.end, false)
        }
      }
    }

  /**
    * Calculates the number of days back from now until the given date. Private function.
    * Returns a number
    * @param {object<momentJs>} end - a moment object date
    */
    function xDaysBack(end){
      var start = moment();
      return dateDifference(start, end)
    }

    /**
    * Caluculates the difference between two dates. Private function.
    * Returns a number.
    * @param {start, end} start, end - a moment object date
    */
    function xDuration(start, end){
       return dateDifference(end, start)//switch dates round to prevent a negative integer
    }

    /**
    * Caluculates the difference between two dates. Private function.
    * Returns a number.
    * @param {start, end} start, end - a moment object date
    */
    function dateDifference(start, end){
      return start.diff(end, 'days');
    }

    return {
      saveNewDashboard : saveNewDashboard,
      isNewDashboardAllowed : isNewDashboardAllowed,
      deleteDashboard : deleteDashboard,
      sortPositions : sortPositions,
      getDashboards : getDashboards,
      setSelectedWidget : setSelectedWidget,
      getSelectedWidget : getSelectedWidget,
      saveWidgetToDashboard : saveWidgetToDashboard,
      updateDashboard : updateDashboard,
      deleteAllDashboards: deleteAllDashboards
    };

  }
]);

})();
