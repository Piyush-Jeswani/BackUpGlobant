(function () {
  'use strict';

  angular.module('shopperTrak.widgets')
    .value('SelectorPopoverControllerBase', SelectorPopoverControllerBase);

  SelectorPopoverControllerBase.$inject = [
    '$scope',
    '$element',
    '$popover',
    'SelectorTemplateUrl'
  ];

  function SelectorPopoverControllerBase (
    $scope,
    $element,
    $popover,
    SelectorTemplateUrl
  ) {

    activate();

    function activate () {
      $popover($element, {
        trigger: 'click',
        placement: 'bottom',
        autoClose: true,
        templateUrl:  SelectorTemplateUrl,
        scope: $scope
      });
    }
  }
})();
