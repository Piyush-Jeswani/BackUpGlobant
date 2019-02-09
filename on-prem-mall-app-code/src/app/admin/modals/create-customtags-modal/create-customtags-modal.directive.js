(function () {
  'use strict';

  angular.module('shopperTrak')
    .directive('createCustomTagsModal', createCustomTagsModal);

  function createCustomTagsModal() {
    return {
      restrict: 'EA',
      templateUrl: 'app/admin/modals/create-customtags-modal/create-customtags-modal.partial.html',
      scope: {
        mode: '=',
        customTag: '=',
        customTagIndex: '=',
        addEdit: '&'
      },
      link: function () {},
      bindToController: true,
      controller: CreateCustomTagsModalController,
      controllerAs: 'vm'
    };
  }

  CreateCustomTagsModalController.$inject = [
    '$scope',
    '$state',
    '$element',
    '$timeout',
    'ObjectUtils',
    'adminCustomTagsData',
    '$stateParams'

  ];

  function CreateCustomTagsModalController($scope, $state, $element, $timeout, ObjectUtils, adminCustomTagsData, $stateParams) {

    var vm = this;
    
    vm.disAllowedCharacters = /^[^[\]><$[\]|{}%!^*+=?]+$/i;
    vm.addCustomValue = addCustomValue;
    vm.tmpCustomTag = {};
    vm.deleteTag = deleteTag;
    vm.deleteTagConfirmed = deleteTagConfirmed;
    vm.updateCustomTag = updateCustomTag;

    vm.customTags = [];
    var showingTags = [];

    activate();

    function activate() {

      //Find the modal and set up a 'show' event
      var element = angular.element('#customTagCreateModal');
      if (element !== null) {

        element.on('show.bs.modal', function () {

          //Reset the form validation
          $scope.tagsForm.$setPristine();

          //Tidy things up.
          vm.tmpCustomTag = null;
          vm.valueExists = false;
          vm.tagExists = false;

        })

        element.on('shown.bs.modal', function () {

          //Set focus to the first text item.
          document.getElementById('tagName').focus();

          showingTags = [];

          function getAllTags(getTags) {

            var getOrgCustomTagsCallback = {
              success: function (tags) {
                return getTags(tags)
              },
              failed: function (result) {
                vm.error = true;
                vm.errorMessage = result.statusText;
              }
            };

            adminCustomTagsData.getAllTags($stateParams.orgId, getOrgCustomTagsCallback);
          }

          getAllTags(function (res) {
            _.reduce(res, function (refVar, elem) {
              refVar = elem.tag_type;
              showingTags.push(refVar);
              return refVar;
            }, []);
          });

          if (!ObjectUtils.isNullOrUndefined(vm.mode)) {

            vm.tmpCustomTag = {};
            switch (vm.mode.toLowerCase()) {

              case 'create':
                {
                  vm.valueExists = vm.tagExists = false;
                  vm.tmpCustomTag.orgTagValues = [];
                  vm.tmpCustomTag.orgTagValues.push({
                    name: '',
                    tag_type: vm.tmpCustomTag.orgTagType
                  });
                  $scope.$apply();
                  break;
                }

              case 'modify':
                {
                  vm.valueExists = false;
                  vm.tagExists = false;

                  //We store the original custom-tag tag_type here in case the user decides to change it.
                  angular.copy(vm.customTag, vm.tmpCustomTag);

                  //Store the original tagName incase the user changes it.
                  vm.tmpCustomTag.originalTagType = vm.customTag.orgTagType;

                  $scope.$apply();
                  break;
                }
            }
          }
        });
      }
    }

    function findDuplicateTagValue() {

      vm.valueExists = false;

      var createdArray = [];
      if (vm.tmpCustomTag.orgTagValues !== undefined) {
        for (var i = 0; i < vm.tmpCustomTag.orgTagValues.length; i++) {
          createdArray.push(vm.tmpCustomTag.orgTagValues[i].name);
        }
      }
      var checkUnique = createdArray
        .map(function (val) {
          return {
            count: 1,
            val: val
          }
        })
        .reduce(function (objRef, objElem) {
          objRef[objElem.val] = (objRef[objElem.val] || 0) + objElem.count;
          return objRef
        }, {});

      var duplicates = Object.keys(checkUnique).filter(
        function (objRef) {
          return checkUnique[objRef] > 1
        }
      );

      if (duplicates.length !== 0) {
        return vm.valueExists = true;
      }

      return vm.valueExists;

    }

    function addCustomValue(index) {

      if (findDuplicateTagValue() === false) {

        var dummyItem = {
          name: '',
          tag_type: vm.tmpCustomTag.orgTagType
        };

        //We use this function twice.
        if ((index === undefined)) {
          if (vm.tmpCustomTag.orgTagValues !== undefined) {

            vm.tmpCustomTag.orgTagValues.push(dummyItem);

          } else {
            vm.tmpCustomTag.orgTagValues = [];
            vm.tmpCustomTag.orgTagValues.push(dummyItem);
          }
        } else {
          vm.tmpCustomTag.orgTagValues.push(dummyItem, '');
        }

        $timeout(function () {
          var newTag = 'tag' + (vm.tmpCustomTag.orgTagValues.length - 1).toString();
          var inputElement = document.getElementById(newTag);
          if (inputElement !== null) {
            inputElement.focus();
          }
        });
      }
    }

    function deleteTag(index) {

      vm.deletionIndex = index;

      //Get the id of the tag.
      var tagId = vm.tmpCustomTag.orgTagValues[index];

      //Check to see if this tag is being used by any users.
      var getUsersOfTagCallback = {
        success: function (users) {
          vm.affectedUsers = users;
          showConfirmDeleteModal();
        },
        failed: function (result) {
          //Due to the new way that Angular is handling rejected calls we come into here,
          //it means we have no users who are related to the tag so we just confirm delete.
          if (result.status === 404) {
            vm.affectedUsers = null;
            showConfirmDeleteModal();
          } else {
            vm.error = true;
            vm.errorMessage = result.statusText;
          }
        }
      };

      adminCustomTagsData.deleteTag($stateParams.orgId, tagId, getUsersOfTagCallback);

    }

    function updateCustomTag(createdTag) {

      var vmMode = vm.mode.toLowerCase();

      vm.tagExists = false;

      if (vmMode === 'create') {
        var existingTag = _.find(showingTags, function (item) {
          return item.toLowerCase() === createdTag.toLowerCase();
        });

        if (existingTag) {
          vm.tagExists = true;
        }
      }

      if (findDuplicateTagValue() === false) {

        if (vm.tagExists) {
          return;
        }

        switch (vmMode) {

          case 'create':
            {
              vm.addEdit({
                tag: vm.tmpCustomTag
              });
              var createDialog = document.getElementsByClassName('modal');
              angular.element(createDialog).modal('hide');
              break;
            }
          case 'modify':
            {
              //We need to know the index
              vm.addEdit({
                tag: vm.tmpCustomTag,
                index: vm.customTagIndex
              });
              var modifyDialog = document.getElementsByClassName('modal');
              angular.element(modifyDialog).modal('hide');
              break;
            }
        }
      }
    }

    function showConfirmDeleteModal() {
      var element = angular.element('#customTagValueDeleteModal');
      if (element !== null) {
        element.modal('show');
      }
    }

    function deleteTagConfirmed() {
      if (vm.tmpCustomTag.orgTagValues.length > 1) {
        vm.tmpCustomTag.orgTagValues.splice(vm.deletionIndex, 1);
        $scope.tagsForm.$dirty = true;
        $scope.tagsForm.$pristine = false;
        vm.deletionIndex = -1;
      }
    }
  }
})();
