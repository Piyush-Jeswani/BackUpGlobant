(function() {
  'use strict';

  angular.module('shopperTrak')
  .factory('googleAnalytics', [
    '$window',
    'ObjectUtils',
    function (
      $window,
      ObjectUtils
  ) {

    var googleAnalyticsNotLoadedErrorMsg = 'Google Analytics is not loaded';
    var hasSentUserId = false;
    var setOrgId;

  /** Checks if the google analytics object is available.
   *  Private function.
   **/
    function googleAnalyticsIsLoaded() {
      return !ObjectUtils.isNullOrUndefined($window.ga);
    }

  /** Sends a page view to google analytics. Should be called when a state change occurs
   *  Public function.
   *
   *  @param {string} route - An identifier for the new route
   *  @param {number} loadTime - The load time of the page in milliseconds. Optional.
   **/
    function sendPageView(route, loadTime) {
      if(!googleAnalyticsIsLoaded()) {
        throw new Error(googleAnalyticsNotLoadedErrorMsg);
      }

      if(ObjectUtils.isNullOrUndefinedOrBlank(route)) {
        throw new Error('Route name is required');
      }

      var virtualPath = getVirtualPath(route);

      if(virtualPathIsEmpty(virtualPath)) {
        //don't track this - it's just a page redirection
        return;
      }

      $window.ga('set', 'page', virtualPath);

      if(angular.isNumber(loadTime)) {
        var loadTimeInSeconds = loadTime / 1000;

        var pageViewParams = {
          'metric1' : loadTimeInSeconds
        };

        $window.ga('send', 'pageview', pageViewParams);
      } else {
        // If loadTime wasn't supplied, don't send it
        $window.ga('send', 'pageview');
      }
    }

    /** Gets the virtual page path. Is used for sending to google analytics.
     *  Removes any purely numeric parts to stop things like the orgId from skewing data
     *  Private function
     *
     *  @param {string} currentPath - The path, usually from $location.$$path
     *  @returns {string} the virtual URL
     **/
    function getVirtualPath(currentPath) {
      var parts = currentPath.split('/');
      
      var virtualPage = '';
      
      _.each(parts, function(part) {
        var number = Number(part);
        if(_.isNaN(number)) {
          virtualPage = virtualPage + '/' + part;
        }
      });

      return virtualPage;
    }

    /** Checks to see if the virtual path is empty
     *  Private function
     *
     *  @param {string} virtualPath - The virtual path to be sent to Google Analytics
     *  @returns {boolean}
     **/
    function virtualPathIsEmpty(virtualPath) {
      return virtualPath.length === 0 || virtualPath === '/'
    }

    /***
     * Send a user event to Google Analytics
     * @param {string} category
     * @param {string} action
     */
    function trackUserEvent(category, action) {
      if (!googleAnalyticsIsLoaded()) {
        throw new Error(googleAnalyticsNotLoadedErrorMsg);
      }

      if (ObjectUtils.isNullOrUndefined(category)) {
        throw new Error('Category is required');
      }

      if (ObjectUtils.isNullOrUndefined(action)) {
        throw new Error('Action is required');
      }

      $window.ga('send', {
        hitType: 'event',
        eventCategory: category,
        eventAction: action,
        eventLabel: 'User Action',
        eventValue: 1
      });
    }

  /** Sends the time an API request took to respond to google analytics
   *  Public function.
   *
   *  @param {string} apiUri - A resource identifier for the route (e.g. /kpis/traffic)
   *  @param {string} apiAddress - The full address, including query string params.
   *  @param {number} requestTime - The time, in milliseconds the request took. Must be an integer (no decimals)
   **/
    function sendRequestTime(apiUri, apiAddress, requestTime) {
      if(!googleAnalyticsIsLoaded()) {
        throw new Error(googleAnalyticsNotLoadedErrorMsg);
      }

      if (ObjectUtils.isNullOrUndefinedOrBlank(apiUri)) {
        throw new Error('apiUri is required');
      }

      if (ObjectUtils.isNullOrUndefinedOrBlank(apiAddress)) {
        throw new Error('apiAddress is required');
      }

      if (!angular.isNumber(requestTime)) {
        throw new Error('requestTime must be a number');
      }

      $window.ga('send', {
        hitType: 'event',
        eventCategory: apiUri,
        eventAction: apiAddress,
        eventLabel: 'API Request Time',
        eventValue: requestTime
      });
    }

  /** Sends the specified userId to Google Analytics
   *  Public function.
   *
   *  @param {string} userId - An identifier for the current user
   **/
    function setUserId(userId) {
      if(hasSentUserId) {
        return;
      }

      if(!googleAnalyticsIsLoaded()) {
        throw new Error(googleAnalyticsNotLoadedErrorMsg);
      }

      if(!angular.isString(userId)) {
        throw new Error('UserId must be a string');
      }

      if(ObjectUtils.isNullOrUndefinedOrBlank(userId)) {
        throw new Error('UserId is required')
      }

      $window.ga('set', 'userId', userId);
      $window.ga('set', 'dimension3', userId);

      hasSentUserId = true;
    }

  /** Sets the orgId dimension
   *  Public function.
   *
   *  @param {number} orgId - The orgId
   **/
    function setOrg(orgId) {
      if(ObjectUtils.isNullOrUndefined(orgId)) {
        throw new Error('OrgId is required');
      }

      if(setOrgId === orgId) {
        // We've already set this orgId
        return;
      }

      $window.ga('set', 'dimension1', orgId.toString());
      setOrgId = orgId;
    }

  /** Sets the user role dimension
   *  Public function.
   *
   *  @param {string} userRole - The userRole
   **/
    function setUserRole(userRole) {
      if(ObjectUtils.isNullOrUndefined(userRole)) {
        throw new Error('userRole is required');
      }

      $window.ga('set', 'dimension2', userRole);
    }

    function resetUserIdSentStatus() {
      hasSentUserId = false;
    }

    return {
      trackUserEvent: trackUserEvent,
      sendPageView: sendPageView,
      setUserId: setUserId,
      resetUserIdSentStatus: resetUserIdSentStatus,
      sendRequestTime: sendRequestTime,
      setOrg: setOrg,
      setUserRole: setUserRole
    };

  }]);
})();
