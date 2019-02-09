'use strict';

angular.module('shopperTrak').directive('customTags', customTags);

function customTags() {
  return {
    templateUrl: 'app/admin/custom-tags/custom-tags.partial.html',
    restrict: 'E',
    scope: {
    },
    bindToController: true,
    controller: CustomTagsController,
    controllerAs: 'vm'
  };
}

CustomTagsController.$inject = [
  '$state',
  '$scope',
  '$timeout',
  'ObjectUtils',
  'adminUsersData',
  'adminCustomTagsData'
];

// maybe we just send usernamesSelected, userids, valid, action
function CustomTagsController($state, $scope, $timeout, ObjectUtils, adminUsersData, adminCustomTagsData) {

  var vm = this;

  activate();

  function activate() {
    initScope();

    //Load up the custom tags.
    initCustomTags($state.params.orgId);
  }

  function processTags(tags) {
    var previousTagValue = null;
    var tmpArray = [];

    //reshape the incoming data.
    if (!ObjectUtils.isNullOrUndefined(tags)) {

      _.each(tags, function (tag) {
        if (previousTagValue !== tag.tag_type) {
          previousTagValue = tag.tag_type;
          tmpArray.push({
            orgTagType: tag.tag_type,
            orgTagValues: [],
            show_extra: false, //We use this on the UI to allow us to toggle extra info if the user has more than 10 values for the custom tag.
          });
        }

        if (previousTagValue === tag.tag_type) {
          tmpArray[tmpArray.length - 1].orgTagValues.push({
            name: tag.name,
            _id: tag._id,
            tag_type: tag.tag_type,
          });
        }
      });
    }
    return tmpArray;
  }

  /**
   * Initializes custom tags.
   * Should be called in the loading stage of the page
   * @param {object} org The current org
   */
  function initCustomTags(orgId) {
    vm.customTags = [];

    var getOrgCustomTagsCallback = {
      success: function (tags) {
        vm.customTags = processTags(tags);
      },
      failed: function (result) {
        vm.error = true;
        vm.errorMessage = result.statusText;
      }
    };

    adminCustomTagsData.getAllTags(orgId, getOrgCustomTagsCallback);
  }


  /**
   * Function :  editCustomTagItem
   * @param {a number representing the indexed item to delete} index 
   */
  function editCustomTagItem(index) {
    vm.customTagMode = 'Modify';
    vm.customTagIndex = index;
    vm.customTag = vm.customTags[index];
    var element = angular.element('#customTagCreateModal');
    if (element !== null) {
      element.modal('show');
    }
  }

  /**
   * Function: addCustomTag
   */
  function addCustomTag() {
    vm.customTagMode = 'Create';
    var element = angular.element('#customTagCreateModal');
    if (element !== null) {
      element.modal('show');
    }
  }

  /**
   * Function: updateCustomTag
   * @param {*} tag 
   * @param {*} index 
   */
  function updateCustomTag(tag, index) {
    var customTagCallback = {
      success: function (tags) {
        vm.customTags = processTags(tags);
      },
      failed: function (result) {
        vm.error = true;
        vm.errorMessage = result.statusText;
      }
    };

    if (!ObjectUtils.isNullOrUndefined(index)) {
      //We are updating an item.
      adminCustomTagsData.updateTag(vm.id, tag, customTagCallback);
    } else {
      adminCustomTagsData.addTag(vm.id, tag, customTagCallback);
    }
  }

  function reverseTable() {
    vm.sortReverse = !vm.sortReverse;
    vm.customTags.reverse();
  }

  function showDeleteCustomTagModal(index) {
    //Store the index.
    vm.customTagDeleteIndex = index;

    var element = angular.element('#customTagDeleteModal');
    if (element !== null) {
      element.modal('show');
    }
  }

  function deleteCustomTagItem() {
    //Check we have something sensible.
    if (!ObjectUtils.isNullOrUndefinedOrEmpty(vm.customTagDeleteIndex) || !ObjectUtils.isNullOrUndefinedOrEmpty(vm.customTags[vm.customTagDeleteIndex])) {
      return;
    } else {

      var deleteCallback = {
        success: function (tags) {
          vm.customTags = processTags(tags);
        },
        failed: function (result) {
          vm.error = true;
          vm.errorMessage = result.statusText;
        }
      };

      var orgTagType = vm.customTags[vm.customTagDeleteIndex].orgTagType;
      adminCustomTagsData.deleteTag(vm.id, orgTagType, deleteCallback);

      // Remove the item from the array.
      vm.customTags.splice(vm.customTagDeleteIndex, 1);
      vm.customTagDeleteIndex = null;
    }
  }

  function uploadCustomTags(files) {   
    vm.tagImportFailed = false;

    if (files) {
      if (!ObjectUtils.isNullOrUndefined(files)) {
        var file = files[0];

        if (file) {

          var filetype = file.name.split('.').pop().trim();

          if (filetype !== 'csv') {
            return;
          }

          //Let the user know we are doing something.....
          vm.loading = true;
          $scope.$digest();
          
          var callback = {
            success: function (result) {
              vm.customTags = processTags(result[0].orgCustomTags);
              vm.loading = false;
              vm.tagImportSuccesful = true;
              vm.successMessage = 'Custom Tags successfully imported';

              $timeout(function () {
                vm.tagImportSuccesful = false;
              }, 5000); // Why do we have this arbitrary timeout?
            },
            failed: function (error) {
              vm.loading = false;
              vm.tagImportFailed = true;
              vm.tagImportSuccesful = false;
              vm.failedMessage = error.data.message;
            }
          };

          //Ok time to upload....
          adminCustomTagsData.uploadCustomTags($state.params.orgId, file, callback);
        }
      }
    }
  }

  function initScope() {
    vm.id = $state.params.orgId;
    vm.showDeleteCustomTagModal = showDeleteCustomTagModal;
    vm.deleteCustomTagItem = deleteCustomTagItem;
    vm.reverseTable = reverseTable;
    vm.addCustomTag = addCustomTag;
    vm.editCustomTagItem = editCustomTagItem;
    vm.updateCustomTag = updateCustomTag;
    vm.uploadCustomTags = uploadCustomTags;
  }

}