(function() {
  'use strict';

  angular.module('shopperTrak')
    .controller('AdminUsersTableController', AdminUsersTableController);

  AdminUsersTableController.$inject = [
    '$state',
    'adminUsersData',
    'ObjectUtils',
    '$timeout',
  ];

  function AdminUsersTableController($state, adminUsersData, ObjectUtils, $timeout) {
    var vm = this;

    var orgId = $state.params.orgId;
    this.orgUsers = [];
    this.usersearch = '';

    vm.saveSuccesfull = false;

    function refresh() {
      load();
    }

    function load() {
      vm.usersLoading = true;
      adminUsersData.getOrgUsers(orgId, function (users) {
        vm.orgUsers = users;
        vm.usersLoading = false;
      });
    }

    function failedResult(error)  {
      vm.loading = false;

      vm.fail = true;

      if (error) {
        //Display an error here
        vm.errorMessage =  error.data.message;
      }

      $timeout(function () {
        vm.loading = false;
        vm.fail = false;

      }, 7500);
    }

    function uploadUsers(files) {

      //We now have enough code here to trigger this to upload - we await the API to catch up.
      vm.loading = false;
      vm.success = false;
      vm.fail = false;

      if (!ObjectUtils.isNullOrUndefined(files)) {
        var file = files[0];

        if (file) {
          var filetype = file.name.split('.').pop().trim();

          if (filetype !== 'csv') {
            return;
          }

          var callback = {
            success: function (result) {
              if(ObjectUtils.isNullOrUndefinedOrBlank(result.data) || ObjectUtils.isNullOrUndefinedOrEmptyObject(result.data)) {
                var error = {
                  data:{
                    message:'.ERROR'
                  }
                };

                failedResult(error);
                return;
              }

              vm.loading = false;
              vm.success = true;
              vm.errorRecords = false;

              //Update data from the  import.
              vm.successMessage = result.data.result[0].savedRecords + ' users successfully added.';

              //Set up a blob for the user to download.
              if (result.data.result[0].failedRecords > 0) {

                vm.successMessage += ' ' + result.data.result[0].failedRecords + ' failed to import.';

                vm.errorRecords = true;

                var content = result.data.result[0].errorCsv;
                var blob = new Blob([content], {
                  type: 'text/plain'
                });

                vm.csvErrorsUrl = (window.URL || window.webkitURL).createObjectURL(blob);
              } else {

                //This is the successful import route - we only want to show it for a short while.
                $timeout(function () {
                  vm.success = false;
                  vm.loading = false;
                  vm.fail = false;
                }, 5000);

              }

              //Update the UI with the new users...
              vm.orgUsers = result.data.result[0].users;


            },
            failed: function (error) {
              failedResult(error);
            }
          };

          //Let the user know we are doing something.....
          // Call the data service here to
          adminUsersData.uploadOrgUsers($state.params.orgId,file,callback)
        }
      }
    }

    this.refresh = refresh;
    this.uploadUsers = uploadUsers;

    load();
  }
})();
