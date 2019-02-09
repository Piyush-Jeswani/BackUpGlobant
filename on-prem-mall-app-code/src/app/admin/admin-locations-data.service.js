class adminLocationsData {
  constructor ($state, $http, ObjectUtils, apiUrl, authService) {
    this.$state = $state;
    this.$http = $http;
    this.ObjectUtils = ObjectUtils;
    this.apiUrl = apiUrl;
    this.authService = authService;
  }

  /**
    * Gets locations on a site for current user if he/she is authorised 
    * to see them.
    * @param {int} orgId passed in.
    * @param {siteId} siteId passed in. 
    * @param {function} callback to call with the data returned from API. 
    */
  getLocations (orgId, siteId, callback) {

    if (this.ObjectUtils.isNullOrUndefined(orgId)) {
      throw new Error('orgId is undefined');
    }

    if (this.ObjectUtils.isNullOrUndefined(siteId)) {
      throw new Error('siteId is undefined');
    }

    this.authService.getCurrentUser().then(currentUser => {
      if (this.authService.isAdminForOrg(orgId, currentUser)) {
        const url = `${this.apiUrl}/organizations/${orgId}/sites/${siteId}/locations`;

        this.$http.get(url).then(response => {
          callback.success(this.transformLocationsData(response.data.result));
        }, callback.failed);
      } else {
        this.$state.go('analytics');
      }
    });
  }

  /**
    * Gets all locations for an Org on all its sites for a user
    * who is authorised to see them.
    * @param {int} orgId the id passed in.
    * @param {function} callback to call with the data returned from API. 
    * @param {siteIds} All siteIds for the Org passed in. 
    */
  getAllLocations (orgId, callback, siteIds) {
    this.authService.getCurrentUser().then(currentUser => {
      if (this.authService.isAdminForOrg(orgId, currentUser)) {
        if (this.ObjectUtils.isNullOrUndefined(orgId)) {
          throw new Error('orgId is undefined');
        }

        if (this.ObjectUtils.isNullOrUndefined(callback)) {
          throw new Error('callback is undefined');
        }

        let queryString = '';

        if (!this.ObjectUtils.isNullOrUndefined(siteIds)) {
          queryString += '?';
          _.each(siteIds, (value, index) => {
            if (index === 0) {
              queryString += `siteId=${value}`;
            } else {
              queryString += `&siteId=${value}`;
            }
          });
        }

        const url = `${this.apiUrl}/organizations/${orgId}/locations${queryString}`;

        this.$http.get(url).then(result => {
          const locations = result.data.result[0];

          _.each(locations, (location, key) => {
            locations[key] = this.transformLocationsData(location);
          });

          callback.success(locations);
        }, callback.failed);
      } else {
        this.$state.go('analytics');
      }
    });
  }

  /**
    * Saves a location for an Org-site actioned by Org Admin.
    * @param {int} orgId passed in.
    * @param {int} siteId passed in.
    * @param {int} locationId passed in.
    * @param {array} data to store remotely about the location. 
    * @param {string} Operation to perform by Org admin. 
    */
  saveLocation (orgId, siteId, locationId, data, action) {
    this.authService.getCurrentUser().then(currentUser => {
      if (this.authService.isAdminForOrg(orgId, currentUser)) {
        let method;
        let url = `${this.apiUrl}/organizations/${orgId}/sites/${siteId}/locations`;

        if (action === 'edit') {
          method = 'PUT';
          url += `/${locationId}`;
        } else if (action === 'add') {
          method = 'POST';
        } else {
          throw new Error('Invalid action call');
        }

        this.$http({ method, url, data });
      } else {
        this.$state.go('analytics');
      }
    });
  }

  /**
    * Deletes a location for an Org-site actioned by Org Admin.
    * @param {int} orgId passed in.
    * @param {int} siteId passed in.
    * @param {int} locationId passed in.
    * @param {function} callback function to register a successful deletion. 
    */
  deleteLocation (orgId, siteId, locationId, callback) {
    this.authService.getCurrentUser().then(currentUser => {
      if (this.authService.isAdminForOrg(orgId, currentUser)) {
        const url = `${this.apiUrl}/organizations/${orgId}/sites/${siteId}/locations/${locationId}`;

        this.$http.delete(url).then(result => {
          callback(result.data);
        });
      } else {
        this.$state.go('analytics');
      }
    });
  }

  /**
    * Refreshs a location on an org-site.
    * @param {int} orgId passed in.
    * @param {int} siteId passed in.
    * @param {int} locationId passed in.
    * @param {function} callback function to register a successful update. 
    */
  refresh (orgId, siteId, locationId, callback) {
    this.authService.getCurrentUser().then(currentUser => {
      if (this.authService.isAdminForOrg(orgId, currentUser)) {
        const url = `${this.apiUrl}/organizations/${orgId}/sites/${siteId}/locations/${locationId}?refresh=true`;
        this.$http.put(url).then(callback.success, callback.failed);
      } else {
        this.$state.go('analytics');
      }
    });
  }

  /**
    * Transforms location data returned from the API.
    * @param {object} responseData passed in.
    * @returns {array} returns transformed data.
    */  
  transformLocationsData (responseData) {
    let transformedData = [];

    if (responseData) {
      transformedData = _.map(responseData, obj => ({
        id: obj.location_id,
        name: obj.description,
        type: obj.location_type
      }));
    }

    return transformedData;
  }
}

angular.module('shopperTrak').service('adminLocationsData', adminLocationsData);

adminLocationsData.$inject = [
  '$state',
  '$http',
  'ObjectUtils',
  'apiUrl',
  'authService'
];



