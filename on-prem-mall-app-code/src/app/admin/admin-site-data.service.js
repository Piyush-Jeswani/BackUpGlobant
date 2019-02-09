(function () {
  'use strict';

  angular.module('shopperTrak').factory('adminSiteData', adminSiteData);

  adminSiteData.$inject = [
    '$state',
    '$q',
    '$http',
    '$cacheFactory',
    'ObjectUtils',
    'Upload',
    'apiUrl',
    'authService'
  ];

  function adminSiteData($state, $q, $http, $cacheFactory, ObjectUtils, Upload, apiUrl, authService) {

    function getCustomTags(orgId, siteId, callback) {

      authService.getCurrentUser().then(function (currentUser) {

        if (authService.isAdminForOrg(orgId, currentUser)) {

          if (ObjectUtils.isNullOrUndefined(orgId)) {
            throw new Error('orgId is undefined');
          }

          if (ObjectUtils.isNullOrUndefined(siteId)) {
            throw new Error('siteId is undefined');
          }

          var url = apiUrl + '/organizations/' + orgId + '/sites/' + siteId + '/custom-tags';

          // todo : move all_fields to be in the query string isntead of params
          $http.get(url).then(function (result) {
            callback.success(result.data);
          }, function (error) {
            callback.failed(error);
          });
        } else {
          $state.go('analytics');
        }
      });
    }

    function addCustomTag(orgId, siteId, customTagId, callback) {
      authService.getCurrentUser().then(function (currentUser) {
        if (authService.isAdminForOrg(orgId, currentUser)) {

          if (ObjectUtils.isNullOrUndefined(orgId)) {
            throw new Error('orgId is undefined');
          }

          if (ObjectUtils.isNullOrUndefined(siteId)) {
            throw new Error('siteId is undefined');
          }

          if (ObjectUtils.isNullOrUndefined(customTagId)) {
            throw new Error('customTagId is undefined');
          }

          var url = apiUrl + '/organizations/' + orgId + '/sites/' + siteId + '/custom-tags';

          var data = {
            customTagId: customTagId
          }

          $http.post(url, data).then(function (response) {
            $cacheFactory.get('$http').removeAll();
            if(_.isFunction(callback.success)) {
              callback.success(response.data);
            }
          }).catch(function(error) {
            console.error(error);
            if(_.isFunction(callback.failed)) {
              callback.failed(error);
            }
          });
        } else {
          $state.go('analytics');
        }

      });
    }

    function deleteCustomTag(orgId, siteId, customTags, callback) {
      authService.getCurrentUser().then(function (currentUser) {
        if (authService.isAdminForOrg(orgId, currentUser)) {

          if (ObjectUtils.isNullOrUndefined(orgId)) {
            throw new Error('orgId is undefined');
          }

          if (ObjectUtils.isNullOrUndefined(siteId)) {
            throw new Error('siteId is undefined');
          }

          if (ObjectUtils.isNullOrUndefined(customTags)) {
            throw new Error('customTags is undefined');
          }

          if (ObjectUtils.isNullOrUndefined(callback)) {
            throw new Error('callback is undefined');
          }

          var url = apiUrl + '/organizations/' + orgId + '/sites/' + siteId + '/custom-tags';

          var data = {
            customTagId: customTags
          }

          //We cannot use $http.delete as it does not support sending a body.
          $http({
            method: 'DELETE',
            url: url,
            data: data,
            headers: {
              'Content-Type': 'application/json;charset=utf-8'
            }
          }).then(function successCallback(response) {
            $cacheFactory.get('$http').removeAll();
            if(_.isFunction(callback.success)) {
              callback.success(response.data);
            }
          }).catch(function(error) {
            console.error(error);
            if(_.isFunction(callback.failed)) {
              callback.failed(error);
            }
          });

        } else {
          $state.go('analytics');
        }
      });
    }

    function getSiteSettings(orgId, siteId, callback) {
      authService.getCurrentUser().then(function (currentUser) {
        if (authService.isAdminForOrg(orgId, currentUser)) {

          if (ObjectUtils.isNullOrUndefined(orgId)) {
            throw new Error('orgId is undefined');
          }

          if (ObjectUtils.isNullOrUndefined(siteId)) {
            throw new Error('siteId is undefined');
          }

          var url = apiUrl + '/organizations/' + orgId + '/sites/' + siteId

          $http.get(url).then(function (result) {
            callback.success(result.data);
          }, function (error) {
            callback.failed(error);
          });
        } else {
          $state.go('analytics');
        }
      });
    }

    function updateSiteSettings({orgId, siteId, locationId, params, callback}) {
      authService.getCurrentUser().then(function (currentUser) {
        if (authService.isAdminForOrg(orgId, currentUser)) {

          if (ObjectUtils.isNullOrUndefined(orgId)) {
            throw new Error('orgId is undefined');
          }

          if (ObjectUtils.isNullOrUndefined(siteId)) {
            throw new Error('siteId is undefined');
          }

          if (ObjectUtils.isNullOrUndefined(params)) {
            throw new Error('params is undefined');
          }

          if (ObjectUtils.isNullOrUndefined(callback)) {
            throw new Error('callback is undefined');
          }

          const baseURL = `${apiUrl}/organizations/${orgId}/sites/${siteId}`;
          const url = _.isUndefined(locationId) ? `${baseURL}` : `${baseURL}/locations/${locationId}`;

          // todo : move all_fields to be in the query string isntead of params
          $http.put(url, params).then(function (result) {
              callback.success(result.data);
            },
            callback.failed);
        } else {
          $state.go('analytics');
        }
      });
    }

    function postOSMFile(siteId, orgId, osm, fileIndex, callback) {
      authService.getCurrentUser().then(function (currentUser) {
        if (authService.isAdminForOrg(orgId, currentUser)) {
          if (ObjectUtils.isNullOrUndefined(orgId)) {
            throw new Error('org id is required.');
          }
          if (ObjectUtils.isNullOrUndefined(siteId)) {
            throw new Error('org id is required.');
          }
          if (ObjectUtils.isNullOrUndefined(osm.file)) {
            throw new Error('osm file is required');
          }

          var url = apiUrl + '/organizations/' + orgId + '/sites/' + siteId + '/osm?noBatch=true';

          var data = {
            osm: osm.file
          };

          if (!ObjectUtils.isNullOrUndefined(osm.floor)) {
            data.floor = osm.floor;
          }

          return Upload.upload({
            'url': url,
            'data': data
          }).then(function () {
            callback.success(fileIndex);
          }, function (error) {
            callback.failed(error, fileIndex);
          });
        } else {
          $state.go('analytics');
        }
      });
    }

    return {
      getCustomTags: getCustomTags,
      getSiteSettings: getSiteSettings,
      addCustomTag: addCustomTag,
      deleteCustomTag: deleteCustomTag,
      updateSiteSettings: updateSiteSettings,
      postOSMFile: postOSMFile
    };
  }
})();
