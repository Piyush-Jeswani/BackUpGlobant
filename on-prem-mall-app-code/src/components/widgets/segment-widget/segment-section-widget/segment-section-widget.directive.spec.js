'use strict';

describe('segmentSectionWidget', function() {
  var $scope;
  var controller;

  beforeEach(module('shopperTrak', function($translateProvider) {
    $translateProvider.translations('en_US', {});
  }));

  beforeEach(inject(function($rootScope, $templateCache, $compile) {
    $scope = $rootScope.$new();

    // Put an empty template to cache to prevent Angular from fetching it
    $templateCache.put(
      'src/components/widgets/segment-widget/segment-section-widget/segment-section-widget.partial.html',
      '<div></div>'
    );

    var element = angular.element(
      '<segment-section-widget'>'</segment-widget>'
    );

    $compile(element)($scope);
    $scope.$digest();
    controller = element.controller('segmentSectionWidget');
  }));

});
