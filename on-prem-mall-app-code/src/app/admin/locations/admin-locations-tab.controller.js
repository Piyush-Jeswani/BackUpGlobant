'use strict';


class LocationsTabController {
  constructor($timeout, $stateParams, adminSiteData, adminSitesData) {
    this.$timeout = $timeout;
    this.$stateParams = $stateParams;
    this.adminSiteData = adminSiteData;
    this.adminSitesData = adminSitesData;
  }

  getLocaleDateString(date) {
    return new Date(date).toLocaleDateString()
  }

  loadData() {
    const { orgId, siteId } = this.$stateParams;

    const callback = {
      success: (data) => {
        this.locations = _.sortBy(data.result, (location) => location.description);
      },
      failed: (result) => {
        this.error = true;
        this.errorMessage = result.statusText;
      }
    };

    this.adminSitesData.fetchLocations(orgId, siteId, callback);
  }

  initScope() {
    this.error = false;
    this.errorMessage = '';

    this.loadData();
  }

  refresh() {
    this.loadData();
  }


  toggleHide(hidden, location) {
    const { orgId, siteId } = this.$stateParams;
    const {
      location_id:locationId,
      location_type,
      description,
    } = location;

    const params = {
      location_type,
      description,
      hidden
    };

    const callback = {
      success: (result) => {
        this.notifyStatus({success:true, message:'.SUCCESSFUL', result:result});
      },
      failed: () => {
        //error notification
        this.notifyStatus({error:true, message:''});
      }
    };

    this.adminSiteData.updateSiteSettings({
      orgId,
      siteId,
      locationId,
      params,
      callback
    });
  }

  notifyStatus(data) {
    this.success = data.success;
    this.successMessage = data.message;
    this.error = data.error;
    this.errorMessage = data.message;

    this.$timeout(() => {
      this.success = false;
      this.error = false;
    }, 5000);
  }

  $onInit() {
    this.initScope();
  }

}

angular.module('shopperTrak')
  .controller('LocationsTabController', LocationsTabController);

LocationsTabController.$inject = [
  '$timeout',
  '$stateParams',
  'adminSiteData',
  'adminSitesData'
];
