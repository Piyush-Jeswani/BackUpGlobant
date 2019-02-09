(function() {
  'use strict';

  angular.module('shopperTrak.widgets')
    .value('MultipleSelectorPopoverControllerBase', MultipleSelectorPopoverControllerBase);

  MultipleSelectorPopoverControllerBase.$inject = [
    '$scope',
    '$element',
    '$popover',
    'multipleSelectorTemplateUrl'
  ];

  function MultipleSelectorPopoverControllerBase(
    $scope,
    $element,
    $popover,
    multipleSelectorTemplateUrl
  ) {

    activate();

    function activate() {
      $popover($element, {
        trigger: 'click',
        placement: 'bottom',
        autoClose: true,
        templateUrl: multipleSelectorTemplateUrl,
        scope: $scope
      });
    }
  }
})();