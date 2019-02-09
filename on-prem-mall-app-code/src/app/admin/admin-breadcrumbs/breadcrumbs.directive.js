'use strict';

angular
  .module('shopperTrak')
  .directive('adminBreadcrumbs', adminBreadcrumbs);

function adminBreadcrumbs() {
  return {
    restrict: 'E',
    templateUrl: 'app/admin/admin-breadcrumbs/breadcrumbs.partial.html',
    controller: BreadcrumbController,
    controllerAs: 'breadcrumbs',
    bindToController: true
  };
}

BreadcrumbController.$inject = [
  '$scope',
  '$state',
  'ObjectUtils'
];

function BreadcrumbController($scope, $state, ObjectUtils) {
  var crumbs = this;

  crumbs.path = [];

  crumbs.parsePathInfo = parsePathInfo;
  crumbs.populateRouteWithParams = populateRouteWithParams;
  crumbs.getCurrentOrganizationName = getCurrentOrganizationName;

  if ($state.$current.path.length) {
    updatePath();
  }

  $scope.$on('$stateChangeSuccess', function() {
    updatePath();
  });

  function updatePath() {
    var path = $state.$current.path.map(function(item) {
      return parsePathInfo(item);
    });

    crumbs.path = path.filter(function(item){
      return item.title !== false;
    });
  }

  function parsePathInfo(p) {
    // Only 'title' and 'route' are needed by breadcrumbs component
    var title = false;
    var route = populateRouteWithParams(p.url.source);

    var path = p.toString();
    switch (path) {
      case 'admin':
        title = 'Home';
        break;

      case 'admin.superusers':
        title = 'Super users';
        break;

      case 'admin.superusers.add':
        title = 'Add super user';
        break;

      case 'admin.superusers.edit':
        title = $state.params.username;
        break;

      case 'admin.organizations':
        title = 'Organizations';
        break;

      case 'admin.organizations.add':
        title = 'Add Organization';
        break;

      case 'admin.organizations.edit':
        title = getCurrentOrganizationName();
        break;

      case 'admin.organizations.edit.sites':
        break;

      case 'admin.organizations.edit.sites.add':
        title = 'Add new site';
        break;

      case 'admin.organizations.edit.sites.edit':
        title = getCurrentSiteName();
        break;

      case 'admin.organizations.edit.users':
        title = 'Users';
        break;

      case 'admin.organizations.edit.users.add':
        title = 'Add new user';
        break;

      case 'admin.organizations.edit.users.edit':
        title = $state.params.username;
        break;
    }

    return {
      title: title,
      route: route
    };
  }

  function populateRouteWithParams(route) {
    return route
        .replace('{username:string}', $state.params.username || '')
        .replace('{orgId:int}', $state.params.orgId)
        .replace('{siteId:int}', $state.params.siteId);
  }

  function getCurrentOrganizationName() {
    var locals = $state.$current.locals;
    var name = '';

    _.mapObject(locals, function(value) {
      if(!ObjectUtils.isNullOrUndefined(value.currentOrganization)) {
        name = value.currentOrganization.name;
      } else if(!ObjectUtils.isNullOrUndefined(value.currentAdminOrganization)) {
        name = value.currentAdminOrganization.name;
      }
    });

    return name;
  }

  function getCurrentSiteName() {
    return $state
              .$current
              .locals['adminMain@admin']
              .currentAdminSite
              .name;
  }

}
