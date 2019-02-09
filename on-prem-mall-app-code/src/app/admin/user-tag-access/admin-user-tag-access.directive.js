'use strict';

angular.module('shopperTrak').directive('adminUserTagAccess', function () {
  return {
    templateUrl: 'app/admin/user-tag-access/admin-user-tag-access.partial.html',
    scope: {
      user: '=',
      mode: '=',
      enabled: '=',
    },
    controller: AdminUserTagAccessController,
    controllerAs: 'vm',
    bindToController: true
  };
});

AdminUserTagAccessController.$inject = [
  '$scope',
  '$rootScope',
  '$state',
  'ObjectUtils',
  'adminCustomTagsData',
  'adminUsersData',
  '$timeout'
];

function AdminUserTagAccessController($scope,$rootScope,$state, ObjectUtils, adminCustomTagsData,adminUsersData, $timeout) {

  var vm = this;
  vm.orgId = $state.params.orgId;
  vm.available = [];
  vm.customTags = [];
  vm.chosenSelectedCustomTags = [];
  vm.chosenCustomTags = [];
  vm.selectedCustomTags = [];
  vm.add = add;
  vm.remove = remove;
  vm.availableTagSearch = '';
  vm.chosenTagSearch = '';
  vm.loadMoreCustomTags = loadMoreCustomTags;

  $scope.$watch('vm.enabled', function() {
        if (vm.enabled === false) {
          //Reset all the tags.
          vm.chosenSelectedCustomTags = vm.customTags;
          vm.selectedCustomTags = [];

          vm.countLimit = Math.min(100,vm.customTags.length);; //resetting the limit here to avoid delay in next time toggle
        }
    });

  activate();

  function activate() {

    vm.loading = true;

    if (vm.mode === 'edit') {
      fetchUserAccessDetails();
    }

    var getOrgCustomTagsCallback = {
      success: function (tags) {
        if (tags !== null) {

          //We need to compare the tags we got back with the ones the users has already chosen.
          var processedResults = processCustomTags(tags, vm.user);

          vm.customTags = processedResults.availableCustomTags;
          vm.countLimit = Math.min(100,vm.customTags.length);
          vm.selectedCustomTags = processedResults.selectedCustomTags;

          if (vm.selectedCustomTags && vm.selectedCustomTags.length !== 0){
            vm.user.accessMap.setup.tags = _.pluck(vm.selectedCustomTags, '_id');
          }

          vm.loading = false;
        }
      },
      failed: function (result) {
        vm.error = true;
        vm.errorMessage = result.statusText;
      }
    };

    adminCustomTagsData.getAllTags($state.params.orgId, getOrgCustomTagsCallback);

  }

  /* when there are more custom tags for any org (like MetroPCS has 5155 custom tags assiciated with it), 
  digest cycle takes lot of time and results in poor performance. ApplyFullAccess toggling was taking approx. 19 secs to toggle.
  Hence limiting the countLimit to 100 initially and then incrementing the tag countLimit when the user reaches end of the scrollbar */

  function loadMoreCustomTags(){
    if(vm.countLimit < vm.customTags.length){
      vm.loading = true;
      vm.countLimit = Math.min(vm.countLimit + 1000, vm.customTags.length);
    }
   
    $timeout(function(){
      vm.loading = false;
    }, 2000);
  }

  function add() {

    //Convert chosen tags to objects....
    var chosenTagsObjects = [];
    angular.forEach(this.chosenCustomTags, function(value) {

        var tagObj = JSON.parse(value);
        this.push(tagObj);

    }, chosenTagsObjects);

    //Create a list of id's
    var chosenIDS = _.pluck(chosenTagsObjects, '_id');

    //Loop through customTags and remove any that match the IDs in chosenIDS.
    this.customTags = _.filter(this.customTags, function (tag) {

      if (chosenIDS.indexOf(tag._id) === -1) {
        return tag;
      }
    });

    this.selectedCustomTags = _.union(this.selectedCustomTags, chosenTagsObjects);
    vm.user.accessMap.setup.tags = mergeSelectedTags(this.selectedCustomTags, vm.user.accessMap.setup.tags);

    //Broadcast to others in the system that we have changed.
    $rootScope.$broadcast('custom-tag-access-changed');
  }

  function remove() {

    //Create a list of id's
    var chosenSelectedIDS = _.map(this.chosenSelectedCustomTags, function (tag) {
      return tag._id
    });

    this.selectedCustomTags = _.filter(this.selectedCustomTags, function (tag) {
      if (chosenSelectedIDS.indexOf(tag._id) === -1) {
        return tag;
      }
    });

    this.customTags = _.union(this.customTags, this.chosenSelectedCustomTags);
    vm.user.accessMap.setup.tags = reduceSelectedTags(this.chosenSelectedCustomTags, vm.user.accessMap.setup.tags);

    //Broadcast to others in the system that we have changed.
    $rootScope.$broadcast('custom-tag-access-changed');

  }

  //This is a helper method that processes the incoming custom tags
  //so that we display an already selected org tags in the Selected Custom Tags window
  //Any others will be displayed in the list on left hand side - ready for selection.
  function processCustomTags(customTags, theUser) {

    var availableCustomTags = null;
    var selectedCustomTags = null;
    var accessMapCustomTagValues = null;

    //If we are creating a user 'theUser' will be null so just reutrn a list of tags to choose from.
    if (!theUser) {
      return {
        availableCustomTags: customTags,
        selectedCustomTags: selectedCustomTags
      };
    }

    if (theUser.accessMap) {
      accessMapCustomTagValues = theUser.accessMap.setup.tags;
    }

    availableCustomTags = customTags;

    if (accessMapCustomTagValues !== null) {

      //Strip down the custom tags to ids.
      var customTagIDs = _.map(customTags, function (tag) {
        return tag._id;
      });

      //Find out if we have any already selected custom tags.
      var selectedTagIDS = _.intersection(accessMapCustomTagValues, customTagIDs);

      if (selectedTagIDS !== null && selectedTagIDS.length > 0) {

        //Get a list of custom tags without the ones we have already selected.
        availableCustomTags = _.reject(customTags, function (tag) {
          return selectedTagIDS.indexOf(tag._id) > -1;
        }, selectedTagIDS);

        //Get a list of custom tags we know have been selected.
        selectedCustomTags = _.filter(customTags, function (tag) {
          return selectedTagIDS.indexOf(tag._id) > -1;
        }, selectedTagIDS);

      }
    }

    return {
      availableCustomTags: availableCustomTags,
      selectedCustomTags: selectedCustomTags
    };
  }

  function mergeSelectedTags(customTags, userTags) {
    var tagIDs = _.pluck(customTags, '_id');
    var merged = _.union(userTags, tagIDs);
    return merged;
  }

  function reduceSelectedTags(selectedTags, userTags) {
    var tagIDs = _.pluck(selectedTags, '_id');
    var reduced = _.difference(userTags, tagIDs);
    return reduced;
  }

  function fetchUserAccessDetails() {

    adminUsersData.getOrgUsers($state.params.orgId, function (data) {

      vm.user = adminUsersData.filterDataByUsername($state.params.username, data);

      if (vm.user.accessMap && vm.user.accessMap.actual.organizations.indexOf(vm.orgId) >= 0) {
        vm.orgAccess = true;
        vm.orgAdmin = vm.user.accessMap.setup.orgs_admin.indexOf(vm.orgId) >= 0;
      } else {
        vm.orgAccess = false;
        vm.orgAdmin = false;
      }
    });
  }
}

