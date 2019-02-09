(function () {

  'use strict';

  angular.module('shopperTrak')
    .controller('AdminSiteEditController', AdminSiteEditController);

  AdminSiteEditController.$inject = [
    '$scope',
    '$state',
    '$q',
    '$http',
    '$timeout',
    '$anchorScroll',
    'apiUrl',
    'adminSiteData',
    'currentSite',
    'currentOrganization',
    'authService',
    'ObjectUtils',
    'features'
  ];

  function AdminSiteEditController(
    $scope,
    $state,
    $q,
    $http,
    $timeout,
    $anchorScroll,
    apiUrl,
    adminSiteData,
    currentSite,
    currentOrganization,
    authService,
    ObjectUtils,
    features) {

    const vm = this;
    vm.osm = [];
    addNewOSM();
    activate();

    function activate() {
      vm.saveSuccessful = false;
      vm.saveFailed = false;
      vm.orgTagsExists = false;
      vm.errorMessage = '';
      vm.onlyPositiveNumbers = /^\d+$/;
      vm.dirty = false;
      vm.sortReverse = false;
      vm.deleteMessage = '';
      vm.siteCustomTags = [];

      //Set up the site ID details.
      vm.site_Name = currentSite.name;
      vm.org_Id = currentSite.organization.id;
      vm.site_Id = currentSite.site_id;
      vm.site_Type = currentSite.type;

      vm.siteSubscriptions = currentSite.subscriptions;

      var timeOutSettingsCallBack = {
        success: function (timeouts) {
          vm.dwell_time_threshold = timeouts.result[0].dwell_time_threshold;
        },
        failed: function (result) {
          vm.error = true;
          vm.errorMessage = result.statusText;
        }
      };

      adminSiteData.getSiteSettings(vm.org_Id, vm.site_Id, timeOutSettingsCallBack);

      //TODO - remove these calls to a resolve on the router.
      //Get all the custom tags defined at the org level for this site.
      const getOrgCustomTagsCallback = {
        success: function (tags) {
          vm.customTags = processOrganisationTags(tags);

          // The following code is not the usual way I would write this but I am having so many problems with using a directive
          // approach that I am resorted to old school vanilla js. The ng-if/ng-show approach works but 'flashes' the message briefly
          // which leads to a detrimental user experience.
          if (vm.customTags.length === 0) {
            vm.orgTagsExists = false;
            document.getElementById('noTagsMessage').style.display = 'block';
          } else {
            vm.orgTagsExists = true;
            document.getElementById('noTagsMessage').style.display = 'none';
          }
        },
        failed: function (result) {
          vm.error = true;
          vm.errorMessage = result.statusText;
        }
      };

      //will eventually move this to a resolve.
      getAllOrgTags(vm.org_Id, getOrgCustomTagsCallback);

      const siteTagsCallBack = {
        success: function (data) {
          vm.siteCustomTags = processSiteTags(data.result);
        },
        failed: function (result) {
          vm.error = true;
          vm.errorMessage = result.statusText;
        }
      };

      //Get all the site level tags already defined for this site.
      adminSiteData.getCustomTags(vm.org_Id, vm.site_Id, siteTagsCallBack);

      var siteCustomTags = [];
      vm.siteCustomTags = siteCustomTags;
      vm.selectedCustomTagValues = [];
      vm.tagExists = false;

    }

    function selectedCustomTagChanged(index) {

      const matchType = vm.siteCustomTags[index].orgTagType;

      if (matchType === undefined) return; //User selects initial option

      //Find the values we want.
      for (let i = 0; i < vm.customTags.length; i++) {

        const tagType = vm.customTags[i].orgTagType;

        if (tagType === matchType.orgTagType) {
          vm.selectedCustomTagValues = vm.customTags[i].orgTagValues;
          return;
        }
      }
    }

    function saveSelectedCustomTag(index) {

      //Have we got some proper data to save?
      const tagType = this.siteCustomTags[index].orgTagType;
      const tagValue = this.siteCustomTags[index].orgTagValue;

      if (ObjectUtils.isNullOrUndefined(tagType)) return;
      if (ObjectUtils.isNullOrUndefined(tagValue)) return;

      //Check to see if we have added a duplicate.
      if (findDuplicate() === false) {

        const siteTagsCallBack = {
          success: function (result) {

            //Set the last item added to view mode.
            vm.siteCustomTags = null;
            vm.siteCustomTags = processSiteTags(result.result[0].custom_tags);

          },
          failed: function (result) {
            vm.error = true;
            vm.errorMessage = result.statusText;
          }
        };

        //Get the tag we are referring to.
        const tagID = vm.siteCustomTags[vm.siteCustomTags.length - 1].orgTagValue._id;
        const currentTag = [];
        currentTag.push(tagID);

        // //Get all the site level tags already defined for this site.
        adminSiteData.addCustomTag(vm.org_Id, vm.site_Id, currentTag, siteTagsCallBack);
      } else {
        this.tagExists = true;
      }
    }

    function saveChanges() {

      //If the user has changed the subscriptions of this site. (any that are now false).
      //We need to store this - to the put.

      //Get the subscriptions ready.
      const params = {
        subscriptions: vm.siteSubscriptions,
        dwell_time_threshold: vm.dwell_time_threshold,
      };

      const callback = {
        success: function (result) {

          //Set up the UI again.
          vm.subscriptions = result.result[0].subscriptions;
          vm.dwell_time_threshold = result.result[0].dwell_time_threshold;

          //Show we have had success.
          vm.saveSuccessful = true;
          $anchorScroll();
          $timeout(() => {
            vm.saveSuccessful = false;
          }, 5000);
        },
        failed: function () {
          vm.saveFailed = true;
          $anchorScroll();
        }
      };

      adminSiteData.updateSiteSettings({
        orgId: vm.org_Id,
        siteId: vm.site_Id,
        params,
        callback
      });
    }

    function addSiteCustomTag() {

      //Add a new item to the siteCustomTags array and set the editing flag.
      //Turn off all editing for any other tags.
      //Before we allow the user to add another item - lets check that they have not added a duplicate.
      vm.tagExists = false;
      const valuesEntered = true;
      if (vm.siteCustomTags.length > 0) {

        const tagValue = vm.siteCustomTags[vm.siteCustomTags.length - 1].orgTagValue;
        const tagType = vm.siteCustomTags[vm.siteCustomTags.length - 1].orgTagType;

        if (ObjectUtils.isNullOrUndefined(tagValue) || ObjectUtils.isNullOrUndefined(tagType)) {
          return;
        }
      }

      //Check we have some data AND no duplicates.
      if (findDuplicate() === false && valuesEntered === true) {
        let newTag = createTag(vm.customTags[0], true);
        vm.siteCustomTags.push(newTag);
      } else {
        vm.tagExists = true;
      }
    }

    function createTag(data, newTagFlag) {

      const newTag = {};

      newTag.orgTagType = null;
      newTag.orgTagValues = null;
      newTag._id = data._id;
      newTag.siteCustomTagEditMode = newTagFlag;

      return newTag;

    }

    function findDuplicate() {

      //Early out option. To find a duplicate we need at LEAST 2 items..... so just return false
      //until we have two items!
      if (vm.siteCustomTags.length <= 1) {
        return false
      };

      //This only runs when we add an item.
      //Get the last item in the list
      let currentTag = vm.siteCustomTags[vm.siteCustomTags.length - 1].orgTagValue;

      //Did we get something sensible?
      if (ObjectUtils.isNullOrUndefined(currentTag)) {
        //Must be an already defined tag.
        currentTag = vm.siteCustomTags[vm.siteCustomTags.length - 1];
      }

      //Now loop over the other site level tags (but not this one) - and see if there is a match.
      for (let i = 0; i < vm.siteCustomTags.length - 1; i++) {

        const testTag = vm.siteCustomTags[i];

        if (testTag.orgTagType === currentTag.tag_type) {
          if (testTag.orgTagValue === currentTag.name) {
            return true;
          }
        }
      }

      //We only get to this point if we did  NOT encounter any duplicates.
      //Clear any errors
      vm.tagExists = false;
      return false;
    }

    function showSiteCustomTagDeleteModal(index) {

      vm.deleteIndex = index;

      const element = angular.element('#customTagDeleteModal');
      if (element !== null) {
        element.modal('show');
      }
    }

    function confirmSiteDeleteTag() {

      if (vm.deleteIndex !== null) {
        deleteSiteCustomTag(vm.deleteIndex);
      }
    }

    function deleteSiteCustomTag(index) {

      //Commented out till we get the api calls working.
      const deleteCallback = {
        success: function () {
          //We don't do anything here.
        },
        failed: function (result) {
          vm.error = true;
          vm.errorMessage = result.statusText;
        }
      };

      //If the duplicate flag is raised - OR - we don't had any values - we do not need to do a network call.
      //Check to see if the tag has a type
      const currentTag = vm.siteCustomTags[vm.siteCustomTags.length - 1];
      let hasValues = false;

      if (!ObjectUtils.isNullOrUndefined(currentTag)) {
        if (currentTag.orgTagValues !== null) {
          hasValues = true;
        }
      }

      if (vm.tagExists === false && hasValues === true) {
        const orgTagTypeId = [];
        orgTagTypeId[0] = vm.siteCustomTags[index]._id;
        adminSiteData.deleteCustomTag(vm.org_Id, vm.site_Id, orgTagTypeId, deleteCallback);
      }

      //Remove it fro the UI.
      vm.siteCustomTags.splice(index, 1);
      vm.tagExists = false;
    }

    function cancel() {
      //Redirect the user back to the org page.
      $state.go('admin.organizations.edit', {
        orgId: vm.org_Id
      });
    }

    function refresh() {

      const callback = {
        success: function (data) {
          currentSite = data.result[0];
          activate();
        },
        failed: function (result) {
          vm.error = true;
          vm.errorMessage = result.statusText;
        }
      };

      adminSiteData.getSiteSettings(vm.org_Id, vm.site_Id, callback);

    }

    function processSiteTags(tags) {

      const tmpArray = [];

      for (let i = 0; i < tags.length; i++) {
        tmpArray.push({
          orgTagType: tags[i].tag_type,
          orgTagValues: tags[i].name,
          orgTagValue: tags[i].name,
          _id: tags[i].tag_id,
          siteCustomTagEditMode: false
        });
      }

      return tmpArray;
    }

    function processOrganisationTags(tags) {

      let previousTagValue = null;
      const tmpArray = [];

      //reshape the incoming data.
      if (tags !== null) {

        _.filter(tags, (tag) => {

          if (previousTagValue !== tag.tag_type) {
            previousTagValue = tag.tag_type;
            tmpArray.push({
              orgTagType: tag.tag_type,
              orgTagValues: [],
              orgTagValue: '',
              _id: tag._id,
              siteCustomTagEditMode: false
            });
          }

          if (previousTagValue === tag.tag_type) {
            tmpArray[tmpArray.length - 1].orgTagValues.push({
              name: tag.name,
              tag_type: tag.tag_type,
              _id: tag._id
            });
          }
        });
      }

      return tmpArray;
    }

    function getAllOrgTags(orgId, callback) {

      const defaultState = 'analytics';

      authService.getCurrentUser().then(currentUser => {
        if (authService.isAdminForOrg(orgId, currentUser)) {

          if (ObjectUtils.isNullOrUndefined(orgId)) {
            throw new Error('getAllTags: orgId is undefined');
          }

          if (ObjectUtils.isNullOrUndefined(callback)) {
            throw new Error('getAllTags: callback is undefined');
          }

          var getAllTagsURL = apiUrl + '/organizations/' + orgId + '/custom-tags';
          $http.get(getAllTagsURL).then(response => {

            callback.success(response.data.result);

          }, callback.failed);
        } else {
          $state.go(defaultState);
        }
      });
    }

    function reverseTable() {
      vm.sortReverse = !vm.sortReverse;
      vm.siteCustomTags.reverse();
    }

    function uploadOSMFile() {
      const promises = [];

      for (let index in vm.osm) {
        const osm = vm.osm[index];

        if (!ObjectUtils.isNullOrUndefined(osm.file)) {
          var filetype = osm.file.name.split('.').pop().trim();

          if (filetype !== 'osm') {
            osm.hasError = true;
            osm.errorMessage = 'This is not an OSM file';
          } else {
            resetOsmUploadStatus(index);

            const callback = {
              success: vm.success,
              failed: vm.failed
            };

            const promise = adminSiteData.postOSMFile(vm.site_Id, vm.org_Id, osm, index, callback);
            promises.push(promise);
          }
        } else {
          osm.hasError = true;
          osm.errorMessage = 'Please upload an OSM file';
        }
      }

      $q.all(promises);
    }

    function timeoutReset(index) {
      $timeout(() => {
        removeOSM(index);
      }, 5000);
    }

    function resetOsmUploadStatus(index) {
      vm.osm[index].hasError = false;
      vm.osm[index].errorMessage = '';
      vm.osm[index].successful = false;
    }

    function addNewOSM() {
      vm.osm.push({
        hasError: false,
        errorMessage: '',
        successful: false
      });
    }

    function removeOSM(index) {
      vm.osm.splice(index, 1);
    }

    function success(index) {
      vm.osm[index].successful = true;
      timeoutReset(index);
    }

    function failed(error, index) {
      vm.osm[index].hasError = true;
      vm.osm[index].errorMessage = error.data.message;
    }

    //Exports
    vm.cancel = cancel;
    vm.refresh = refresh;
    vm.saveChanges = saveChanges;
    vm.addSiteCustomTag = addSiteCustomTag;
    vm.deleteSiteCustomTag = deleteSiteCustomTag;
    vm.selectedCustomTagChanged = selectedCustomTagChanged;
    vm.saveSelectedCustomTag = saveSelectedCustomTag;
    vm.showSiteCustomTagDeleteModal = showSiteCustomTagDeleteModal;
    vm.confirmSiteDeleteTag = confirmSiteDeleteTag;
    vm.reverseTable = reverseTable;
    vm.uploadOSMFile = uploadOSMFile;
    vm.addNewOSM = addNewOSM;
    vm.removeOSM = removeOSM;
    vm.resetOsmUploadStatus = resetOsmUploadStatus;
    vm.timeoutReset = timeoutReset;
    vm.success = success;
    vm.failed = failed;

  }

})();
