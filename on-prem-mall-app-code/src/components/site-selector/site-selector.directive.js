(function() {
  'use strict';

  angular.module('shopperTrak.siteSelector')
    .directive('siteSelector', siteSelectorDirective);

  function siteSelectorDirective() {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      templateUrl: 'components/site-selector/site-selector.partial.html',
      scope: {
        sites: '=',
        getSiteHref: '&siteHref',
        onSiteClick: '&',
        isSelected: '&',
        showSelectAllButton: '=',
        showCustomerSiteId: '=?',
        selectAllSites: '&',
        language: '='
      },
      controller: siteSelectorController,
      controllerAs: 'vm',
      bindToController: true
    };
  }

  siteSelectorController.$inject = [
    '$scope',
    '$element',
    'ZoneResource'
  ];

  function siteSelectorController() {

    var vm = this;

    vm.keyword = '';
    vm.selectedSites = [];

    vm.selectSite = selectSite;
    vm.shouldBeShown = shouldBeShown;
   
    activate();

    function activate() {
      if (!vm.selectedSites) {
        vm.selectedSites = [];
      }
    }

    function selectSite(siteId) {
      if(vm.selectedSites.indexOf(siteId) === -1) {
        vm.selectedSites.push(siteId);
      } else {
        var index = vm.selectedSites.indexOf(siteId);
        vm.selectedSites.splice(index, 1);
      }
      vm.onSiteClick({ siteId: siteId });
    }

    function shouldBeShown(site) {
      return vm.keyword.length === 0 || matches(site.name, vm.keyword);
    }

    function matches(string, keyword) {
      return string.toLowerCase().indexOf(keyword.toLowerCase()) >= 0;
    }

  }
})();
