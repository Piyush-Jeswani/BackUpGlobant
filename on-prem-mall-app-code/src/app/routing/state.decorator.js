(function() {
  'use strict';

  angular.module('shopperTrak.routing')
    .config(configureStateDecorator);

  configureStateDecorator.$inject = [
    '$provide'
  ];

  function configureStateDecorator($provide) {
    $provide.decorator('$state', extendHrefMethod);
  }

  extendHrefMethod.$inject = [
    '$delegate',
    '$urlMatcherFactory',
    'specialStateParams',
    'routeUtils',
    'fillDefaultDateRangeParams'
  ];

  function extendHrefMethod(
    $delegate,
    $urlMatcherFactory,
    specialStateParams,
    routeUtils,
    fillDefaultDateRangeParams
  ) {
    var hrefFn = $delegate.href;
    $delegate.href = extendedHrefFn;

    return $delegate;

    function extendedHrefFn(stateOrName, params, options) {
      var newParams = {};

      var stateName = typeof stateOrName === 'string' ? stateOrName : stateOrName.name;
      var stateNames = routeUtils.getAncestorStateNames(stateName).concat(stateName);
      var stateParams = getURLParamsForStates(stateNames);

      specialStateParams.forEach(function(paramName) {
        if (_(stateParams).contains(paramName)) {
          newParams[paramName] = $delegate.params[paramName];
        }
      });

      newParams = fillDefaultDateRangeParams(newParams);

      angular.extend(newParams, params);

      return hrefFn.call($delegate, stateOrName, newParams, options);
    }

    function getURLParamsForStates(stateNames) {
      return _.union.apply(null, stateNames.map(getURLParams));
    }

    function getURLParams(stateName) {
      var state = $delegate.get(stateName);

      var urlMatcher = $urlMatcherFactory.compile(state.url);
      return  urlMatcher.parameters();
    }
  }
})();
