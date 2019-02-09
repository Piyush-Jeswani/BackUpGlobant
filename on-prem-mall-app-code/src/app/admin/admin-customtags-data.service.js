class adminCustomTagsData {
  constructor ($state, $http, $cacheFactory, ObjectUtils, apiUrl, Upload, authService) {
    this.$state = $state;
    this.$http = $http;
    this.$cacheFactory = $cacheFactory;
    this.ObjectUtils = ObjectUtils;
    this.apiUrl = apiUrl;
    this.Upload = Upload;
    this.authService = authService;

    this.defaultState = 'analytics';
  }

  /**
   * Returns all tags for given organisation.
   * get:/organizations/:orgId/custom-tags
   * ToDo: Refactor this to return a promise instead of using callbacks
   *
   * @param {number} orgId - The orgId
   * @param {object} callback - should 'success' and 'failed' properties, both being functions
   */
  getAllTags (orgId, callback) {
    if (this.ObjectUtils.isNullOrUndefined(orgId)) {
      throw new Error('getAllTags: orgId is undefined');
    }

    if (this.ObjectUtils.isNullOrUndefined(callback)) {
      throw new Error('getAllTags: callback is undefined');
    }

    this.authService.getCurrentUser().then(currentUser => {
      if (this.authService.isAdminForOrg(orgId, currentUser)) {

        const getAllTagsURL = `${this.apiUrl}/organizations/${orgId}/custom-tags`;

        this.$http.get(getAllTagsURL)
          .then(response => {
            if (_.isFunction(callback.success)) {
              callback.success(response.data.result);
            }
          })
          .catch(error => {
            console.error(error);
            if (_.isFunction(callback.failed)) {
              callback.failed(error);
            }
          });
      } else {
        this.$state.go(this.defaultState);
      }
    });
  }

  /**
   * Returns all single tag for given organisation.
   * get:/organizations/:orgId/custom-tags/:tagId
   * ToDo: Refactor this to return a promise instead of using callbacks
   *
   * @param {number} orgId - The orgId
   * @param {number} tagId - The tagId
   * @param {object} callback - should 'success' and 'failed' properties, both being functions
   */
  getTag (orgId, tagId, callback) {
    if (this.ObjectUtils.isNullOrUndefined(orgId)) {
      throw new Error('getTag: orgId is undefined');
    }

    if (this.ObjectUtils.isNullOrUndefined(tagId)) {
      throw new Error('getTag: tagId is undefined');
    }

    if (this.ObjectUtils.isNullOrUndefined(callback)) {
      throw new Error('getTag: callback is undefined');
    }

    this.authService.getCurrentUser().then(currentUser => {
      if (this.authService.isAdminForOrg(orgId, currentUser)) {
        const getTagURL = `${this.apiUrl}/organizations/${orgId}/custom-tags/${tagId}`;
        this.$http.get(getTagURL).then(response => {
          if (_.isFunction(callback.success)) {
            callback.success(response.data);
          }
        }).catch(error => {
          console.error(error);
          if (_.isFunction(callback.failed)) {
            callback.failed(error);
          }
        });
      } else {
        this.$state.go(this.defaultState);
      }
    });
  }

  /**
   * Adds a new tag to a specified org.
   * post:/organizations/:orgId/custom-tags
   * ToDo: Refactor this to return a promise instead of using callbacks
   *
   * @param {number} orgId - The orgId
   * @param {object<customTagValues>} values - The custom tag values to save
   * @param {object} callback - should 'success' and 'failed' properties, both being functions
   */
  addTag (orgId, values, callback) {
    this.authService.getCurrentUser().then(currentUser => {
      if (this.authService.isAdminForOrg(orgId, currentUser)) {

        if (this.ObjectUtils.isNullOrUndefined(orgId)) {
          throw new Error('updateTag: orgId is undefined');
        }

        if (this.ObjectUtils.isNullOrUndefined(values)) {
          throw new Error('updateTag: orgId is undefined');
        }

        if (this.ObjectUtils.isNullOrUndefined(callback)) {
          throw new Error('updateTag: callback is undefined');
        }

        const addTagURL = `${this.apiUrl}/organizations/${orgId}/custom-tags`;
        this.$http.post(addTagURL, values).then(response => {
          // This is quite a complex travese so checking we have something valid.
          if (this.ObjectUtils.isNullOrUndefined(response.data.result[0].custom_tags)) {
            throw new Error(`A data api call failed to return expected data -: ${addTagURL}`);
          }

          this.$cacheFactory.get('$http').removeAll();

          if (_.isFunction(callback.success)) {
            callback.success(response.data.result[0].custom_tags);
          }
        }).catch(error => {
          console.error(error);
          if (_.isFunction(callback.failed)) {
            callback.failed(error);
          }
        });
      } else {
        this.$state.go(this.defaultState);
      }
    });
  }

  /**
   * Deletes a specfic tag for an organisation.
   * delete:/organizations/:orgId/custom-tags/:customTagTypeId/custom-tag
   * ToDo: Refactor this to return a promise instead of using callbacks
   *
   * @param {number} orgId - The orgId
   * @param {string} tagType - The custom tag type
   * @param {object} callback - should 'success' and 'failed' properties, both being functions
   */
  deleteTag (orgId, tagType, callback) {
    if (this.ObjectUtils.isNullOrUndefined(orgId)) {
      throw new Error('deleteTag: orgId is undefined');
    }

    if (this.ObjectUtils.isNullOrUndefined(tagType)) {
      throw new Error('deleteTag: tag is undefined');
    }

    if (this.ObjectUtils.isNullOrUndefined(callback)) {
      throw new Error('deleteTag: callback is undefined');
    }

    this.authService.getCurrentUser().then(currentUser => {
      if (this.authService.isAdminForOrg(orgId, currentUser)) {
        const deleteTagURL = `${this.apiUrl}/organizations/${orgId}/custom-tags/${tagType}`;

        this.$http.delete(deleteTagURL).then(
          response => {
            this.$cacheFactory.get('$http').removeAll();
            if (_.isFunction(callback.success)) {
              callback.success(response.data.result[0].custom_tags);
            }
          }).catch(error => {
            console.error(error);
            if (_.isFunction(callback.failed)) {
              callback.failed(error);
            }
          });

      } else {
        this.$state.go(this.defaultState);
      }
    });
  }

  /**
   * Updates the tag specified in tagID. If tagID is not set we ADD the tag.
   * delete:/organizations/:orgId/custom-tags/:customTagTypeId/custom-tag
   * ToDo: Refactor this to return a promise instead of using callbacks
   *
   * @param {number} orgId - The orgId
   * @param {string} tagType - The custom tag type
   * @param {object} callback - should 'success' and 'failed' properties, both being functions
   */
  updateTag (orgId, tagValues, callback) {
    if (this.ObjectUtils.isNullOrUndefined(orgId)) {
      throw new Error('updateTag: orgId is undefined');
    }

    if (this.ObjectUtils.isNullOrUndefined(tagValues)) {
      throw new Error('updateTag: tagId is undefined');
    }

    if (this.ObjectUtils.isNullOrUndefined(callback)) {
      throw new Error('updateTag: callback is undefined');
    }

    this.authService.getCurrentUser().then(currentUser => {
      if (this.authService.isAdminForOrg(orgId, currentUser)) {
        //As we are updating the custom Tag here - we need to check whether or not the user
        //renamed the custom tag_type. If they have we need to change the tag_type in the values
        //to the new name so that api can update the new name.

        //First we check to see if the names are different
        if (tagValues.orgTagType !== tagValues.originalTagType) {

          for (let index = 0; index < tagValues.orgTagValues.length; index++) {
            tagValues.orgTagValues[index].tag_type = tagValues.orgTagType;
          }
        }

        const updateTagURL = `${this.apiUrl}/organizations/${orgId}/custom-tags/${tagValues.originalTagType}`;
        this.$http.put(updateTagURL, tagValues).then(
          response => {
            this.$cacheFactory.get('$http').removeAll();

            if (_.isFunction(callback.success)) {
              callback.success(response.data.result);
            }
          }).catch(error => {
            console.error(error);
            if (_.isFunction(callback.failed(error))) {
              callback.failed(error);
            }
          }
          );
      } else {
        this.$state.go(this.defaultState);
      }
    });
  }

  /**
   * Returns specific users that are related to a certain tag.
   * Users related to a tag :/organizations/:orgId/custom-tags/:customTagId/users
   * ToDo: Refactor this to return a promise instead of using callbacks
   *
   * @param {number} orgId - The orgId
   * @param {string} customTagId - The custom tag id
   * @param {object} callback - should 'success' and 'failed' properties, both being functions
   */
  getUserForCustomTag (orgId, customTagId, callback) {
    if (this.ObjectUtils.isNullOrUndefined(orgId)) {
      throw new Error('getUserForCustomTag: orgId is undefined');
    }

    if (this.ObjectUtils.isNullOrUndefined(customTagId)) {
      throw new Error('getUserForCustomTag: tag is undefined');
    }

    if (this.ObjectUtils.isNullOrUndefined(callback)) {
      throw new Error('getUserForCustomTag: callback is undefined');
    }

    this.authService.getCurrentUser().then(currentUser => {
      if (this.authService.isAdminForOrg(orgId, currentUser)) {

        const customTagUsersURL = `${this.apiUrl}/organizations/${orgId}/custom-tags/${customTagId}/users`;

        this.$http.get(customTagUsersURL).then(
          response => {
            //Returning the list of users we have found.
            if (_.isFunction(callback.success)) {
              callback.success(response.data.result);
            }
          }).catch(error => {
            console.error(error);
            if (_.isFunction(callback.failed(error))) {
              callback.failed(error);
            }
          });

      } else {
        this.$state.go(this.defaultState);
      }
    });
  }

  /**
   * Uploads a custom tag file to an org
   * Passes the file to :/organizations/:orgId/custom-tags/import
   * ToDo: Refactor this to return a promise instead of using callbacks
   *
   * @param {number} orgId - The orgId
   * @param {file} file - The file to import
   * @param {object} callback - should 'success' and 'failed' properties, both being functions
   */
  uploadCustomTags (orgId, file, callback) {
    if (this.ObjectUtils.isNullOrUndefined(orgId)) {
      throw new Error('uploadCustomTags - orgId is undefined');
    }

    if (this.ObjectUtils.isNullOrUndefined(file)) {
      throw new Error('uploadCustomTags - file is undefined');
    }

    if (this.ObjectUtils.isNullOrUndefined(callback)) {
      throw new Error('uploadCustomTags - callback is undefined');
    }

    this.authService.getCurrentUser().then(currentUser => {
      if (this.authService.isAdminForOrg(orgId, currentUser)) {
        const url = `${this.apiUrl}/organizations/${orgId}/custom-tags/import`;

        const data = {
          customTagFile: file
        };

        return this.Upload.upload({
          'url': url,
          'data': data,
        }).then(response => {
          this.$cacheFactory.get('$http').removeAll();

          if (_.isFunction(callback.success)) {
            callback.success(response.data.result);
          }
        }).catch(error => {
          console.error(error);
          if (_.isFunction(callback.failed(error))) {
            callback.failed(error);
          }
        });

      }
        
      this.$state.go('analytics');
      
    });

  }
}

angular.module('shopperTrak').service('adminCustomTagsData', adminCustomTagsData);

adminCustomTagsData.$inject = [
  '$state',
  '$http',
  '$cacheFactory',
  'ObjectUtils',
  'apiUrl',
  'Upload',
  'authService'
];




