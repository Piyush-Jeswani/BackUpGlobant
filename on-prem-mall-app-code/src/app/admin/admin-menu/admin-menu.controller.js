(function() {
  'use strict';

  angular.module('shopperTrak')
    .controller('AdminMenuController', AdminMenuController);

  AdminMenuController.$inject = [
    '$scope',
    '$state',
    'authService',
    'localStorageService'
  ];

  function AdminMenuController(
    $scope,
    $state,
    authService,
    localStorageService
  ) {

    var vm = this;

    // NOTE: Admin menu UI-behaviour/styles/markup has parity with analytics-menu
    // and ideally would be refactored so we don't have repeated code.

    var sidebarStateKey = 'has-open-sidebar';
    var sidebarTransitionClass = 'is-transitioning-analytics-menu';
    var htmlEl = document.documentElement;
    vm.isExpanded = vm.isExpanded || false;
    vm.toggleExpanded = toggleExpanded;
    vm.stateIsActive = stateIsActive;
    vm.currentUser = null;
    vm.menuItems = [];

    activate();

    function activate() {
      if (localStorageService.get(sidebarStateKey) === 1) toggleExpanded(true);

      authService.getCurrentUser().then(function(currentUser)
      {
        vm.currentUser = currentUser;
        populateMenu(currentUser)
      });

    }

    function toggleExpanded(expandState) {
      // Update state:
      vm.isExpanded = _.isUndefined(expandState) ? !vm.isExpanded : expandState;
      htmlEl.classList.toggle('has-expanded-analytics-menu', expandState);
      htmlEl.classList.add(sidebarTransitionClass);
      localStorageService.set(sidebarStateKey, vm.isExpanded ? 1 : 0);
      // Post-transition behaviour:
      setTimeout(expandedTransitionDone, 241);
    }

    function expandedTransitionDone() {
      // Force re-render of charts:
      window.dispatchEvent(new CustomEvent('resize'));
      // Remove transition style tweaks:
      setTimeout(function(){
        htmlEl.classList.remove(sidebarTransitionClass);
      },100);
    }

    function populateMenu(currentUser){

      vm.menuItems.push({
        'name': 'admin.ORGMANAGEMENT',
        'state': 'admin',
        'href': '#/admin/organizations',
        'icon': 'company'
      });

      if (currentUser.superuser) {
        vm.menuItems.push({
          'name': 'admin.USERMANAGEMENT',
          'state': 'admin.usermanagement',
          'href': '#/admin/usermanagement',
          'icon': 'avatar'
        });
      }

      if($state.current.name === 'admin.misubscriptionmanagement'){
        vm.menuItems.push({
          'name': 'marketIntelligence.ADMIN.SHOPPERTRAKSETTINGS',
          'state': 'admin.misubscriptionmanagement',
          'href': '#/admin/misubscriptionpage',
          'icon': 'mi-admin'
        });
      } else if($state.current.name === 'admin.misubscriptionpage'){
        vm.menuItems.push({
          'name': 'marketIntelligence.ADMIN.SHOPPERTRAKSETTINGS',
          'state': 'admin.misubscriptionpage',
          'href': '#/admin/misubscriptionpage',
          'icon': 'mi-admin'
        });
      } else {
        vm.menuItems.push({
          'name': 'marketIntelligence.ADMIN.SHOPPERTRAKSETTINGS',
          'state': 'admin.misubscriptionpage',
          'href': '#/admin/misubscriptionpage',
          'icon': 'mi-admin'
        });
      }

      /* this will come later once we have SA-731 done
      vm.menuItems.push({
        'name': 'Tag management',
        'state': 'admin.tag.managment',
        'icon': 'tags',
      }); */
    }

    function stateIsActive(stateName) {
      return $state.current.name.indexOf(stateName) !== -1;
    }
  }
})();
