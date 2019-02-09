'use strict';

describe('compareStateManager', function() {
  var compareStateManager;
  var compareStateManagerConstants;

  var localStorageServiceMock;

  beforeEach(module('shopperTrak'));
  beforeEach(module(function($provide) {
    localStorageServiceMock = {
      storage: {},
      set: function(key, value) {
        localStorageServiceMock.storage[key] = value;
      },
      get: function(key) {
        return localStorageServiceMock.storage[key];
      },
      remove: function(key) {
        delete localStorageServiceMock.storage[key];
      },
      keys: function() {
        return Object.keys(localStorageServiceMock.storage);
      },
    };
    $provide.factory('localStorageService', function() {
      return localStorageServiceMock;
    });
  }));
  beforeEach(inject(function(_compareStateManager_, _compareStateManagerConstants_) {
    compareStateManager = _compareStateManager_;
    compareStateManagerConstants = _compareStateManagerConstants_;
  }));

  describe('saveWidgets', function() {
    it('should save widgets to localStorage', function() {
      spyOn(localStorageServiceMock, 'set');

      var orgId = 1000;
      var siteId = 20000;
      var widgets = [];

      compareStateManager.saveWidgets(orgId, siteId, widgets);

      expect(localStorageServiceMock.set).toHaveBeenCalledWith(
        buildSaveKey(compareStateManagerConstants.savePrefix, orgId, siteId),
        widgets
      );
    });
  });

  describe('loadWidgets', function() {
    it('should retrieve widgets from localStorage', function() {
      var widgets = [{ type: 'foo' }, { type: 'bar' }];

      spyOn(localStorageServiceMock, 'get').and.callFake(function() {
        return widgets;
      });

      var orgId = 1000;
      var siteId = 20000;

      compareStateManager.saveWidgets(orgId, siteId, widgets);
      var loadedWidgets = compareStateManager.loadWidgets(orgId, siteId);

      expect(loadedWidgets).toEqual(widgets);
      expect(localStorageServiceMock.get).toHaveBeenCalledWith(
        buildSaveKey(compareStateManagerConstants.savePrefix, orgId, siteId)
      );
    });
  });

  describe('clearAll', function() {
    it('should clear all widgets from localStorage', function() {
      var orgId1 = 1000;
      var siteId1 = 10000;
      var widgets1 = [{ type: 'foo' }, { type: 'bar' }];

      var orgId2 = 2000;
      var siteId2 = 20000;
      var widgets2 = [{ type: 'george costanza' }, { type: 'kramer' }];

      compareStateManager.saveWidgets(orgId1, siteId1, widgets1);
      compareStateManager.saveWidgets(orgId2, siteId2, widgets2);

      expect(compareStateManager.loadWidgets(orgId1, siteId1)).toEqual(widgets1);
      expect(compareStateManager.loadWidgets(orgId2, siteId2)).toEqual(widgets2);

      compareStateManager.clearAll();

      spyOn(localStorageServiceMock, 'get').and.callThrough();

      expect(compareStateManager.loadWidgets(orgId1, siteId1)).toEqual([]);
      expect(compareStateManager.loadWidgets(orgId2, siteId2)).toEqual([]);

      expect(localStorageServiceMock.get).toHaveBeenCalledWith(
        buildSaveKey(compareStateManagerConstants.savePrefix, orgId1, siteId1)
      );
      expect(localStorageServiceMock.get).toHaveBeenCalledWith(
        buildSaveKey(compareStateManagerConstants.savePrefix, orgId2, siteId2)
      );
      expect(localStorageServiceMock.get.calls.count()).toBe(2);
    });
  });

  function buildSaveKey(savePrefix, orgId, siteId) {
    return savePrefix + orgId + '-' + siteId;
  }
});
