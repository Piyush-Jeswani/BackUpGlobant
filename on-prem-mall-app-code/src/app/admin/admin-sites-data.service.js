class adminSitesData {
  constructor ($state, $http, ObjectUtils, apiUrl, authService) {
    this.$state = $state;
    this.$http = $http;
    this.ObjectUtils = ObjectUtils;
    this.apiUrl = apiUrl;
    this.authService = authService;
  }

  /**
    * Fetch locations for an org site for an authorized user from API.
    * @param {int} orgId passed in.
    * @param {int} siteId passed in.
    * @param {function} callback to call when the API sends back a response with
    * the results.
    */
  fetchLocations (orgId, siteId, callback) {
    if (this.ObjectUtils.isNullOrUndefined(orgId)) {
      throw new Error('orgId is undefined');
    }

    this.authService.getCurrentUser().then(currentUser => {
      if (this.authService.isAdminForOrg(orgId, currentUser)) {
        const url = `${this.apiUrl}/organizations/${orgId}/sites/${siteId}/locations`;
        this.$http.get(url, {
          params: {
            hidden: true
          }
        }).then(result => {
          callback.success(result.data);
        }, callback.failed);
      } else {
        this.$state.go('analytics');
      }
    });
  }

  /**
    * Fetch sites for an org for an authorized user from API
    * @param {int} orgId passed in.
    * @param {function} callback to call when the API sends back a response with
    * the results.
    */
  fetchSites (orgId, callback) {
    if (this.ObjectUtils.isNullOrUndefined(orgId)) {
      throw new Error('orgId is undefined');
    }

    this.authService.getCurrentUser().then(currentUser => {
      if (this.authService.isAdminForOrg(orgId, currentUser)) {
        const url = `${this.apiUrl}/organizations/${orgId}/sites`;

        // todo : move all_fields to be in the query string isntead of params
        this.$http.get(url, {
          params: {
            hidden: true,
            all_fields: true
          }
        }).then(result => {
          callback.success(this.transformSitesData(result.data));
        }, callback.failed);
      } else {
        this.$state.go('analytics');
      }
    });
  }

  /**
    * Fetch site for an org for an authorized user from API.
    * @param {int} orgId passed in.
    * @param {int} siteId passed in. Site required.
    * @param {function} callback to call when the API sends back a response with
    * the results.
    */
  fetchSite (orgId, siteId, callback) {
    if (this.ObjectUtils.isNullOrUndefined(siteId)) {
      throw new Error('siteId is undefined');
    }

    this.authService.getCurrentUser().then(currentUser => {
      if (this.authService.isAdminForOrg(orgId, currentUser)) {
        const url = `${this.apiUrl}/organizations/${orgId}/sites/${siteId}`;
        this.$http.get(url).then(result => {
          callback.success(this.transformSitesData(result.data));
        }, callback.failed);
      } else {
        this.$state.go('analytics');
      }
    });
  }

  /**
    * Refresh site for an org for an authorized user from API.
    * @param {int} orgId passed in.
    * @param {int} siteId passed in. Site required.
    * @param {function} callback to call when the API sends back a response with
    * the results.
    */
  refresh (orgId, siteId, callback) {
    // TODO : Should have $http call for when refresh site functionality
    this.authService.getCurrentUser().then(currentUser => {
      if (this.authService.isAdminForOrg(orgId, currentUser)) {

        const url = `${this.apiUrl}/organizations/${orgId}/sites/${siteId}`;

        this.$http.get(url, {
          params: {
            all_fields: true
          }
        }).then(result => {
          callback.success(this.transformSitesData(result.data));
        }, callback.failed);

      } else {
        this.$state.go('analytics');
      }
    });
  }

  /**
    * Transforms the sites data passed in ready for display.
    * @param {object} responseData passed in from API.
    * @return {array} tranformed data.
    */
  transformSitesData (responseData) {
    let transformedData = [];

    if (!this.ObjectUtils.isNullOrUndefined(responseData)) {
      transformedData = responseData.result.map(obj => ({
        id: obj.site_id,
        name: obj.name,
        created: new Date(obj.created).toLocaleDateString(),
        custom_tags: typeof obj.custom_tags !== 'undefined' ? _.pluck(obj.custom_tags, 'tag_id') : [],
        taggedSiteAccess: false,
        customer_site_id: obj.customer_site_id,
        hidden: obj.hidden
      }));
    }
    return transformedData;
  }
}

angular.module('shopperTrak').service('adminSitesData', adminSitesData);

adminSitesData.$inject = [
  '$state',
  '$http',
  'ObjectUtils',
  'apiUrl',
  'authService'
];
