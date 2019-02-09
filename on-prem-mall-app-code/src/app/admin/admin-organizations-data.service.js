class adminOrganizationsData {
  constructor ($state, $q, $http, ObjectUtils, Upload, apiUrl, authService) {
    this.$state = $state;
    this.$q = $q;
    this.$http = $http;
    this.ObjectUtils = ObjectUtils;
    this.Upload = Upload;
    this.apiUrl = apiUrl;
    this.authService = authService;
    // Keep reference to data in memory
    this._organizations = null;
  }

  /**
      * Fetches organizations from the cache (synchronus) or from the API (aynchronus).
      * @param {bool} useCache flag passed in to indicate if cache to be used or not
      * @returns {object} returns promise.
      */
  fetchOrganizations (useCache) {
    const deferred = this.$q.defer();

    // set useCache to true by default
    if (this.ObjectUtils.isNullOrUndefined(useCache)) {
      useCache = true;
    }

    // Use cached data if available
    if (this._organizations && useCache === true) {
      deferred.resolve(this.transformResponseData(this._organizations));
      return deferred.promise;
    }

    // Request data from back-end
    const url = `${this.apiUrl}/organizations?all_fields=true`;
    this.$http.get(url).then(result => {
      this._organizations = result.data;

      const transformedData = this.transformResponseData(result.data);
      deferred.resolve(transformedData);
    }).catch(error => {
      deferred.reject(error.data);
    });
    return deferred.promise;
  }

  /**
      * Fetches an organization from the cache (synchronus) or from the API (aynchronus)
      * for user authorized to see this data.
      * @param {orgId} orgId passed in for specific org.
      * @param {bool} useCache flag passed in to indicate if cache to be used or not
      * @returns {object} returns promise.
      */  
  getOrganization (orgId, useCache) {
    return this.authService.getCurrentUser().then(currentUser => {
      if (this.authService.isAdminForOrg(orgId, currentUser)) {
        let org = {};
        const deferred = this.$q.defer();

        if (!this.ObjectUtils.isNullOrUndefined(this._organizations) && useCache === true) {
          org = _.find(this._organizations.result, obj => obj.organization_id === orgId);

          deferred.resolve(org);
        } else {
          const url = `${this.apiUrl}/organizations/${orgId}`;

          this.$http.get(url).then(result => {
            deferred.resolve(result.data.result[0]);
          }, error => {
            deferred.reject(error.data.message);
          });
        }

        return deferred.promise;
      }

      this.$state.go('analytics');
    });
  }

  /**
      * Fetches an organizations calendars from the API
      * for user authorized to see this data.
      * @param {orgId} orgId passed in for specific org.
      * @returns {object} returns promise.
      */    
  getOrganizationCalendars (orgId) {
    return this.authService.getCurrentUser().then(currentUser => {
      if (this.authService.isAdminForOrg(orgId, currentUser)) {
        const deferred = this.$q.defer();

        const url = `${this.apiUrl}/organizations/${orgId}/calendars`;

        this.$http.get(url).then(result => {
          deferred.resolve(result.data.result);
        }, error => {
          deferred.reject(error.data.message);
        });

        return deferred.promise;
      }

      this.$state.go('analytics');
    });
  }

  /**
      * Updates the settings for a specific org using http put to API 
      * with params provided by an authorized user.
      * @param {orgId} orgId passed in for specific org.
      * @param {params} params passed in for specific org.
      * @returns {object} returns promise.
      */
  updateSettings (orgId, params) {
    return this.authService.getCurrentUser().then(currentUser => {
      const deferred = this.$q.defer();

      if (this.authService.isAdminForOrg(orgId, currentUser)) {
        const url = `${this.apiUrl}/organizations/${orgId}`;

        this.$http.put(url, params).then(result => {
          if (!this.ObjectUtils.isNullOrUndefined(this._organizations)) {
            this.updateOrganizationsData(orgId, result.data);
          }
          deferred.resolve(result);
        }, error => {
          deferred.reject(error.data.message);
        });
      } else {
        this.$state.go('analytics');
      }
      return deferred.promise;
    });
  }

  /**
      * Refreshes specific org in UI using http put to API 
      * by fetching latest settings for an authorized user.
      * @param {orgId} orgId passed in for specific org.
      * @param {function} callback passed in to be called with updated data.
      */
  refreshOrganization (orgId, callback) {
    this.authService.getCurrentUser().then(currentUser => {
      if (this.authService.isAdminForOrg(orgId, currentUser)) {
        const url = `${this.apiUrl}/organizations/${orgId}?refresh=true`;

        this.$http.put(url).then(result => {
          const updatedData = this.updateOrganizationsData(orgId, result.data);
          callback.success(updatedData);
        }, callback.failed);
      } else {
        this.$state.go('analytics');
      }
    });
  }

  /**
      * Allows authorized user to create a new org in the MongoDB via API using http post.
      * @param {org} org object passed in for new org.
      * @param {function} callback passed in to be called for success or failure.
      */
  createOrganization (org, callback) {
    this.authService.getCurrentUser().then(currentUser => {
      if (this.authService.isAdminForOrg(org.orgId, currentUser)) {
        const url = `${this.apiUrl}/organizations`;

        const data = {
          orgId: org.orgId,
          name: org.name,
          subscriptions: org.subscriptions,
          status_subscriptions: org.status_subscriptions,
          hide_sales_when_no_traffic: org.hide_sales_when_no_traffic,
          default_calendar_id: org.default_calendar_id,
          timeOfDay: org.timeOfDay
        };

        this.$http.post(url, data).then(result => {
          if (!this.ObjectUtils.isNullOrUndefined(this._organizations)) {
            this._organizations.result.push(result.data.result[0]);
          }
          callback.success(result);
        }, callback.failed);
      } else {
        this.$state.go('analytics');
      }
    });
  }

  /**
      * Allows authorized user to removed an exisitng org in the MongoDB via API using http delete.
      * @param {id} user id passed in.
      * @param {function} callback passed in to be called for success or failure.
      */
  removeOrganization (id, callback) {
    this.authService.getCurrentUser().then(currentUser => {
      if (this.authService.isAdminForOrg(id, currentUser)) {
        const url = `${this.apiUrl}/organizations/${id}`;

        this.$http.delete(url).then(() => {
          callback.success();
        }, error => {
          callback.failed(error);
        });
      } else {
        this.$state.go('analytics');
      }
    });
  }

  /**
      * Allows authorized user to post a floor plan to the API using http post
      * for a specific org.
      * @param {orgId} orgId passed in.
      * @param {object} osm floor plan.
      * @param {int} fileIndex passed in.
      * @param {function} callback passed in to be called for success or failure.
      */
  postOSMFile (orgId, osm, fileIndex, callback) {
    this.authService.getCurrentUser().then(currentUser => {
      if (this.authService.isAdminForOrg(orgId, currentUser)) {
        if (this.ObjectUtils.isNullOrUndefined(orgId)) {
          throw new Error('org id is required.');
        }

        if (this.ObjectUtils.isNullOrUndefined(osm.file)) {
          throw new Error('osm file is required');
        }

        const url = `${this.apiUrl}/organizations/${orgId}/osm?noBatch=true`;
        const data = {
          osm: osm.file
        };

        if (!this.ObjectUtils.isNullOrUndefined(osm.floor)) {
          data.floor = osm.floor;
        }

        return this.Upload.upload({
          'url': url,
          'data': data
        }).then(() => {
          callback.success(fileIndex);
        }, error => {
          callback.failed(error, fileIndex);
        });
      }

      this.$state.go('analytics');
    });
  }

  /**
      * Updates data for organizations from store held locally.
      * @param {orgId} orgId passed in.
      * @param {object} data passed in.
      * @return {object} data to be updated.
      */
  updateOrganizationsData (id, data) {
    if (this._organizations) {
      this._organizations.result = _.map(this._organizations.result, obj => {
        if (obj.organization_id === id) {
          return data.result[0];
        }

        return obj;

      });
    }
    // Return transformed data for easy consumption
    return this.transformResponseData(this._organizations);
  }

  /**
      * Transforms the data passed in ready for display.
      * @param {object} responseData passed in.
      * @return {array} tranformed data.
      */
  transformResponseData (responseData) {
    let transformedData = [];
    if (responseData) {
      transformedData = responseData.result.map(obj => ({
        id: obj.organization_id,
        name: obj.name,
        type: obj.portal_settings && obj.portal_settings.organization_type,
        subscriptions: obj.subscriptions,
        status_subscriptions: obj.status_subscriptions,
        hide_sales_when_no_traffic: obj.hide_sales_when_no_traffic,
        default_calendar_id: obj.default_calendar_id,
        updated: new Date(obj.updated).toLocaleDateString()
      }));
    }
    return transformedData;
  }

  /**
      * Allows authorized user to clear the Org Hazelcast cache on the API side..
      * @param {orgId} orgId passed in.
      * @param {env} environment passed in.
      * @return {object} returns promise.
      */  
  clearOrgHazelCache (orgId, env) {
    return this.authService.getCurrentUser().then(currentUser => {
      if (this.authService.isAdminForOrg(orgId, currentUser)) {
        const deferred = this.$q.defer();

        if (this.ObjectUtils.isNullOrUndefined(orgId)) {
          throw new Error('org id is required.');
        }
        if (this.ObjectUtils.isNullOrUndefined(env)) {
          throw new Error('environment is required.');
        }

        const url = `${this.apiUrl}/hazelcast/clearorgscache`;

        this.$http.delete(url,
          {
            params:
            {
              orgIds: orgId,
              hazelcastMapName: env
            }
          })
          .then(response => {
            deferred.resolve(response.data.result[0]);
          }, error => {
            deferred.reject(error);
          });

        return deferred.promise;
      }
    });
  }
}

angular.module('shopperTrak').service('adminOrganizationsData', adminOrganizationsData);

adminOrganizationsData.$inject = [
  '$state',
  '$q',
  '$http',
  'ObjectUtils',
  'Upload',
  'apiUrl',
  'authService'
];

