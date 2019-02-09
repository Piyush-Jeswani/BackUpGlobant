(function () {
  'use strict';

  angular.module('shopperTrak')
    .factory('adminUsersData', adminUsersData);

  adminUsersData.$inject = [
    '$state',
    '$q',
    '$http',
    'ObjectUtils',
    'apiUrl',
    'Upload',
    'authService'
  ];

  function adminUsersData($state, $q, $http, ObjectUtils, apiUrl, Upload, authService) {
    var baseUrl = apiUrl + '/users';
    var _users = []; // store users data in memory

    function getUsers(callback) {

      if (ObjectUtils.isNullOrUndefined(callback)) {
        throw new Error('getUsers - callback is undefined');
      }

      authService.getCurrentUser().then(function (currentUser) {
        if (authService.isAdminForOrg($state.params.orgId, currentUser)) {
          $http.get(baseUrl).then(function (data) {
            if (data) {
              _users = data.data.result;
            }
            callback.success(data.data.result);
          }, function (error) {
            callback.failed(error);
          });
        } else {
          $state.go('analytics');
        }
      });
    }

    function getUser(userId, callback) {

      if (ObjectUtils.isNullOrUndefined(userId)) {
        throw new Error('getUser - userId is undefined');
      }

      if (ObjectUtils.isNullOrUndefined(callback)) {
        throw new Error('getUser - callback is undefined');
      }

      authService.getCurrentUser().then(function (currentUser) {
        if (authService.isAdminForOrg($state.params.orgId, currentUser)) {

          var url = baseUrl + '/' + userId;

          $http.get(url).then(function (response) {
            callback(response.data);
          });
        } else {
          $state.go('analytics');
        }
      });
    }


    function getOrgUsers(orgId, callback) {

      if (ObjectUtils.isNullOrUndefined(orgId)) {
        throw new Error('getOrgUsers - orgId is undefined');
      }

      if (ObjectUtils.isNullOrUndefined(callback)) {
          callback = function () {};
      }

      authService.getCurrentUser().then(function (currentUser) {
        if (authService.isAdminForOrg(orgId, currentUser)) {

          var url = apiUrl + '/organizations/' + orgId + '/users';

          $http.get(url).then(function (result) {
            var transformedData = transformOrgUsersData(result.data);
            callback(transformedData);
          });
        } else {
          $state.go('analytics');
        }
      });
    }

    function getUserFromCache(username) {
      return filterDataByUsername(username, _users.result);
    }

    function saveUser(user, action, callback) {

      if (ObjectUtils.isNullOrUndefined(user)) {
        throw new Error('saveUser - user is undefined');
      }

      if (ObjectUtils.isNullOrUndefined(action)) {
        throw new Error('saveUser - action is undefined');
      }

      if (ObjectUtils.isNullOrUndefined(callback)) {
        throw new Error('saveUser - callback is undefined');
      }

      authService.getCurrentUser().then(function (currentUser) {
        if (authService.isAdminForOrg($state.params.orgId, currentUser)) {
          var url = baseUrl;

          if (ObjectUtils.isNullOrUndefined(user.superuser)) {
            user.superuser = false;
          }

          if (action === 'add') {

            $http.post(url, user).then(function (result) {

              callback.success(result.data);
            }, function (error) {
              callback.failed(error);
            });
          } else {

            //At this point we have an edit AND we may come into this call from two places
            //1. User Management
            // or
            //2. User Edit t
            // there are two end points that we need to hit to be able complete a succesfull save of the user.
            //
            // 1st is to save just the user details
            // 2nd is to update any access map information.
            // Once we have completed both calls we then return success.

            var updateUserInfoURL = baseUrl + '/' + user._id;
            var updateUserAccesMap = baseUrl + '/' + user._id + '/access';

            $http.put(updateUserInfoURL, user).then(function () { //Update the user info
                $http.put(updateUserAccesMap, user).then(function (result) { //Update the accessMap
                  callback.success(result.data);
                },
                function (error) {
                  callback.failed(error);
                });
            }, function (error) {
              callback.failed(error);
            });
          }
        } else {
          $state.go('analytics');
        }
      });
    }

    function saveOrgUser(user, orgId, action, callback) {
      if (ObjectUtils.isNullOrUndefined(user)) {
        throw new Error('saveOrgUser - user is undefined');
      }

      if (ObjectUtils.isNullOrUndefined(orgId)) {
        throw new Error('saveOrgUser - orgId is undefined');
      }

      if (ObjectUtils.isNullOrUndefined(action)) {
        throw new Error('saveOrgUser - action is undefined');
      }

      if (ObjectUtils.isNullOrUndefined(callback)) {
        throw new Error('saveOrgUser - callback is undefined');
      }

      authService.getCurrentUser(true).then(function (currentUser) {
        if (authService.isAdminForOrg(orgId, currentUser)) {
          var url = apiUrl + '/organizations/' + orgId + '/users';

          if (action === 'edit') {
            // Need to make two http calls here

            // 1. / access. Save only the super user flag expired, and the accessMap
            var accessMapUpdateUrl = apiUrl + '/users/' + user._id + '/access';

            var accessMapUpdateObject = {
              subscriptions: user.subscriptions,
              superuser: user.superuser,
              accessMap: user.accessMap,
              _id: user._id,
              orgId: orgId
            };

            $http.put(accessMapUpdateUrl, accessMapUpdateObject)
              .then(function() {

                // 2. / user, sans accessMap
                url = apiUrl + '/users/' + user._id;

                var userWithoutAccessMap = _.omit(user, 'accessMap');

                userWithoutAccessMap.orgId = orgId;

                $http.put(url, userWithoutAccessMap)
                  .then(callback.success)
                  .catch(callback.failed);
              })
              .catch(callback.failed);


          } else if (action === 'add') {
            $http.post(url, user).then(callback.success, callback.failed);
          } else {
            throw new Error();
          }
        } else {
          $state.go('analytics');
        }
      });
    }

    function deleteUser(userId, callback) {

      if (ObjectUtils.isNullOrUndefined(userId)) {
        throw new Error('deleteUser - user is undefined');
      }

      if (ObjectUtils.isNullOrUndefined(callback)) {
        throw new Error('deleteUser - callback is undefined');
      }

      authService.getCurrentUser().then(function (currentUser) {
        if (authService.isAdminForOrg($state.params.orgId, currentUser)) {
          var url = baseUrl + '/' + userId + '?noBatch=true';

          $http.delete(url).then(callback.success, callback.failed);
        } else {
          $state.go('analytics');
        }
      });
    }

    function deleteOrgUser(orgId, userId, callback) {

      if (ObjectUtils.isNullOrUndefined(orgId)) {
        throw new Error('deleteOrgUser - user is undefined');
      }

      if (ObjectUtils.isNullOrUndefined(userId)) {
        throw new Error('deleteOrgUser - userId is undefined');
      }

      if (ObjectUtils.isNullOrUndefined(callback)) {
        throw new Error('deleteOrgUser - callback is undefined');
      }

      authService.getCurrentUser().then(function (currentUser) {
        if (authService.isAdminForOrg(orgId, currentUser)) {
          var url = apiUrl + '/organizations/' + orgId + '/users/' + userId + '?noBatch=true';

          $http.delete(url).then(callback.success, callback.failed);
        } else {
          $state.go('analytics');
        }
      });
    }

    function transformOrgUsersData(responseData) {
      var transformedData = [];
      if (responseData) {
        transformedData = responseData.result.map(function (obj) {
          return {
            _id: obj._id,
            username: obj.username,
            fullname: obj.fullname,
            email: obj.email,
            title: obj.title,
            accessMap: obj.accessMap,
            superuser: obj.superuser,
            subscriptions:obj.subscriptions,
            last_login: obj.last_login
          };
        });
      }
      return transformedData;
    }

    function filterDataByUsername(username, data) {
      var users = [];
      users = (data || []).filter(function (item) {
        return item.username === username;
      });
      return users[0];
    }

    function uploadOrgUsers(orgId, file, callback) {

      if (ObjectUtils.isNullOrUndefined(orgId)) {
        throw new Error('uploadCustomTags - orgId is undefined');
      }

      if (ObjectUtils.isNullOrUndefined(file)) {
        throw new Error('uploadCustomTags - file is undefined');
      }

      if (ObjectUtils.isNullOrUndefined(callback)) {
        throw new Error('uploadCustomTags - callback is undefined');
      }

      authService.getCurrentUser().then(function (currentUser) {
        if (authService.isAdminForOrg($state.params.orgId, currentUser)) {

          //post:/organizations/:orgId/users/import
          var url = apiUrl + '/organizations/' + orgId + '/users/import';

          var data = {
            userUploadFile: file
          };

          return Upload.upload({
            'url': url,
            'data': data,
          }).then(function (result) {
            callback.success(result);
          }, function (error) {
            callback.failed(error);
          });

        } else {
          $state.go('analytics');
        }
      })
    }

    function getUserDetailsByUserName(username, callback){
      var url = apiUrl + '/users?username=' + username;
      //check if the username passed
      if (ObjectUtils.isNullOrUndefined(username)) {
        throw new Error('getUserDetailsByUserName - username is undefined');
      }
      //pass the orgId to the url only if logged in user is a org admin
      authService.getCurrentUser().then(function (currentUser) {
        if (authService.isAdminForOrg($state.params.orgId, currentUser)) {
          if(authService.isSuperUser(currentUser)){
            url = apiUrl + '/users?username=' + username;
          }
          else{
            url = apiUrl + '/users?username=' + username +'&orgId=' + $state.params.orgId;
          }

          $http.get(url).then(function (response) {
            if (response.data.result) {
              callback.success(response.data.result);
            }
            }, function (error) {
            callback.failed(error);
          });
        } else {
          $state.go('analytics');
        }
      });
    }


    return {
      getUsers: getUsers,
      getUser: getUser,
      getOrgUsers: getOrgUsers,
      getUserFromCache: getUserFromCache,
      saveUser: saveUser,
      saveOrgUser: saveOrgUser,
      deleteUser: deleteUser,
      deleteOrgUser: deleteOrgUser,
      uploadOrgUsers: uploadOrgUsers,
      filterDataByUsername: filterDataByUsername,
      transformOrgUsersData: transformOrgUsersData,
      getUserDetailsByUserName: getUserDetailsByUserName
    };
  }
})();
