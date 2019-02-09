(function () {
'use strict';
angular.module('shopperTrak')
  .controller('typeAheadCtrl', ['$scope', '$rootScope', '$filter', '$timeout', function ($scope, $rootScope, $filter, $timeout) {
      var unbindModelWatch;
      var filterTextTimeout;
      $scope.allitems = $scope.items;

      $scope.isInUse = function () {
        $scope.focus = true;
      };

      $scope.isBeingUsed = function () {
        unbindModelWatch = $scope.$watch('model', function (searchval) {
          filterTextTimeout = $timeout(function () {
            if (typeof searchval === 'undefined') {
              return;
            } else {
              if (searchval === '' || searchval.length > $scope.minSearchLength) {
                if ($scope.useApiToSearch === true) {
                  $scope.$emit('searchTextChanged', searchval);
                } else {
                  var searchTerm = {};
                  searchTerm[$scope.filterProperty] = searchval;
                  $scope.items = $filter('filter')($scope.allitems, searchTerm);
                }
              }
            }
          }, $scope.startSearchAfterMilliseconds);
        });
      };

      $scope.outOfUse = function () {
        $scope.focus = false;
        if (typeof unbindModelWatch !== 'undefined') {
          unbindModelWatch();
        }
      };

      $scope.$on('$destroy', function () {
        if (filterTextTimeout) {
          $timeout.cancel(filterTextTimeout);
        }
      });
    }]);
})();
