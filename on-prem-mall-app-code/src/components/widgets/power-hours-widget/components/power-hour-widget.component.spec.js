'use strict';

describe('Component: powerHoursWidget', () => {
  let $rootScope
  let $scope;
  let $compile;
  let controller;
  let currentUserMock;
  let element;

  beforeEach(module('shopperTrak', function($translateProvider) {
    $translateProvider.translations('en_US', {});
  }));

  beforeEach(inject(function(_$rootScope_, $templateCache, _$compile_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();


    currentUserMock = {
      _id:1,
      preferences: {
        calendar_id: 3,
        custom_dashboards: [],
        market_intelligence: { },
        custom_period_1: {
          period_type: 'custom'
        },
        custom_period_2: {
          period_type: 'custom'
        }
      },
      localization: {
        locale: 'en-us',
        date_format:{
          mask: 'dd-mm-yyyy'
        }
      }
    };

    $scope.currentUser = currentUserMock;

    var organizationMock = {
      organization_id: 1234,
      name: 'Test Org 1',
      portal_settings: 'test',
      subscriptions: {
        interior: true
      }
    };

    $scope.organizations = [organizationMock];
    $scope.$apply();
    $scope.$digest();

    // Put an empty template to cache to prevent Angular from fetching it
    cacheTemplates($templateCache);

  }));

  it('should create widget', () => {
    createElement();
    $scope.$digest();
    expect(element).toBeDefined()
  });

  function createElement() {
    element = angular.element(
     ' <power-hours-widget' +
     ' org-id="::currentSite.organization.id"' +
     ' site-id="::currentSite.site_id"' +
     ' zone-id="currentZone.id"' +
     ' date-range-start="dateRange.start"' +
     ' date-range-end="dateRange.end"' +
     ' current-organization="::currentOrganization"' +
     ' current-site="::currentSite"' +
     ' current-user="::currentUser"' +
     ' active-option="viewData[metricType].displayType"' +
     ' summary-key="power_hours"' +
     ' language="language"' +
     ' operating-hours="operatingHours"' +
     ' sales-categories="viewData[metricType].salesCategories"' +
     ' is-loading="isLoading[metricType]"' +
     ' on-export-click="exportWidget("power_hours"")"' +
     ' export-is-disabled="widgetIsExported("power_hours", viewData[metricType]) || isLoading[metricType]"' +
     ' set-selected-widget="setSelectedWidget("power_hours")">' +
     ' </power-hours-widget>'
    );

    $compile(element)($scope);
    $scope.$digest();
    controller = element.controller('powerHoursWidgetController');
  }

  function cacheTemplates($templateCache) {
    // Put an empty template to cache to prevent Angular from fetching it
    $templateCache.put(
      'app/header/header.html',
      '<div></div>'
    );
    $templateCache.put(
      'components/widgets/power-hours-widget/views/power-hours-widget.partial.html',
      '<div></div>'
    );
  }
});
