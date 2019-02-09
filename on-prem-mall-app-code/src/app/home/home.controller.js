(function () {
  'use strict';
  angular.module('shopperTrak').controller('HomeCtrl', HomeCtrl);

  HomeCtrl.$inject = [
    '$scope',
    '$state',
    'authService',
    'localStorageService'
  ];

  function HomeCtrl($scope, $state, authService, localStorageService) {
    var vm = this; // vm stands for viewmodel

    vm.username = '';
    vm.password = '';
    vm.loginError = null;
    vm.handleLoginFormSubmit = handleLoginFormSubmit;
    vm.loginFormIsVisible = false;
    vm.validate = validate;
    vm.usernameValidation = false;
    vm.passwordValidation = false;
    vm.validName = '';
    vm.validPassword = '';

    activate();

    function activate() {
      if (authService.isAuthenticated()) {
        $state.go('analytics');
      } else {
        vm.loginFormIsVisible = true;
      }

      $scope.$on('auth-login-success', function () {
        $state.go('analytics');
        vm.loginFormIsVisible = false;
      });

      $scope.$on('auth-logout-success', function () {
        vm.loginFormIsVisible = true;
      });
    }

    function addLoadingIndicator() {
      vm.isBusy = true;
    }

    function removeLoadingIndicator() {
      vm.isBusy = false;
    }

    function validate(input) {
      if (input.length === 0) {
        return true;
      }
      return false;
    }

    function handleLoginFormSubmit() {
      vm.loginError = '';
      vm.usernameValidation = validate(vm.username);
      vm.passwordValidation = validate(vm.password);

      if (vm.usernameValidation === true || vm.passwordValidation === true) {
        vm.loginError = 'Please check your credentials and try again.';
        vm.username = '';
        vm.password = '';
        //both input fields red
        vm.usernameValidation = true;
        vm.passwordValidation = true;
        return;
      }
      addLoadingIndicator();
      authService.login(vm.username, vm.password).then(function () {
        vm.loginError = null;
      }).catch(function (response) {
        if (response.status === 401) {
          // 401 almost certainly means that the username and/or password were wrong
          vm.loginError = 'Please check your credentials and try again.';
        } else if (response.data && response.data.message) {
          vm.loginError = response.data.message;
        } else {
          vm.loginError = 'Connection error (' + response.status + ')';
        }
        removeLoadingIndicator();
      });
      vm.username = '';
      vm.password = '';
    }
  }
})();
