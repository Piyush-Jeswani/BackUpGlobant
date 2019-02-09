(function() {
  'use strict';

  angular.module('shopperTrak')
    .constant('compareStateManagerConstants', {
      'savePrefix': 'compare-widgets-'
    })
    .factory('compareStateManager', compareStateManager);

  compareStateManager.$inject = [
    'localStorageService',
    'utils',
    'compareStateManagerConstants'
  ];

  function compareStateManager(localStorageService, utils, stateManagerConstants) {
    return {
      saveWidgets: saveWidgets,
      loadWidgets: loadWidgets,
      clearAll: clearAll
    };

    function saveWidgets(orgId, siteId, widgets) {
      var key = buildKey(orgId, siteId);
      localStorageService.set(key, widgets);
    }

    function loadWidgets(orgId, siteId) {
      var key = buildKey(orgId, siteId);
      var loadedWidgets = localStorageService.get(key);
      return loadedWidgets ? loadedWidgets : [];
    }

    function clearAll() {
      var keys = localStorageService.keys().filter(function(key) {
        return utils.startsWith(key, stateManagerConstants.savePrefix);
      });
      keys.forEach(localStorageService.remove);
    }

    function buildKey(orgId, siteId) {
      return stateManagerConstants.savePrefix + orgId + '-' + siteId;
    }
  }
})();
