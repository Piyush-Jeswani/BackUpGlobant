(function () {
  'use strict';

  angular.module('shopperTrak', [
    'ngAnimate',
    'ngMaterial',
    'ngTouch',
    'ngSanitize',
    'ui.router',
    'shopperTrak.config',
    'shopperTrak.routing',
    'shopperTrak.auth',
    'shopperTrak.resources',
    'shopperTrak.filters',
    'shopperTrak.obfuscation',
    'shopperTrak.widgets',
    'shopperTrak.tableGridWidget',
    'shopperTrak.locationSelector',
    'shopperTrak.zoneSelector',
    'shopperTrak.siteSelector',
    'shopperTrak.validators',
    'shopperTrak.constants',
    'shopperTrak.features',
    'shopperTrak.modals',
    'shopperTrak.httpRequests',
    'angularMoment',
    'mgcrea.ngStrap',
    'offClick',
    'shopperTrak.utils',
    'angular-underscore',
    'LocalStorageModule',
    'ui.sortable',
    'jcs.angular-http-batch',
    'perfect_scrollbar',
    'pascalprecht.translate',
    'data-table',
    'ngFileUpload',
    'ui.bootstrap',
    'rzModule',
    window.angularDragula(angular),
    'slugifier',
    'colorpicker.module'
  ])
  .config([
    'httpBatchConfigProvider',
    'apiUrl',
    '$compileProvider',
    '$qProvider',
    '$locationProvider',
    'debugInfoEnabled',
    'batchEnabled',
  function config(
    httpBatchConfigProvider,
    apiUrl,
    $compileProvider,
    $qProvider,
    $locationProvider,
    debugInfoEnabled,
    batchEnabled
  ) {

    $compileProvider.debugInfoEnabled(debugInfoEnabled);
    $compileProvider.preAssignBindingsEnabled(true);
    $qProvider.errorOnUnhandledRejections(false);
    $locationProvider.hashPrefix('');
    if(batchEnabled === true) configureBatching(httpBatchConfigProvider, apiUrl);
    registerAgGrid();
  }
  ]);

  function configureBatching(httpBatchConfigProvider, apiUrl) {
    httpBatchConfigProvider.setAllowedBatchEndpoint(
      apiUrl.substr(0, apiUrl.indexOf('/api/v1')),
      apiUrl + '/batch',
      {
        batchRequestCollectionDelay: 5,
        maxBatchedRequestPerCall: 6,
        ignoredVerbs: ['head'], // This array is pointless. The getBatchableRequests function overrides it
        canBatchRequest: getBatchableRequests,
        adapter: 'nodeJsMultiFetchAdapter'
      }
    );
  }

  function getBatchableRequests(url, method) {
    if(method !== 'GET') {
      return false;
    }

    return url.indexOf('source=pdfExport') < 0 &&
      url.indexOf('noBatch=true') < 0 &&
      url.indexOf('/batch') < 0 &&
      url.indexOf('/pdf') < 0 &&
      url.indexOf('/sites') < 0;
  }

  function registerAgGrid() {
    agGrid.LicenseManager.setLicenseKey('ShopperTrak_ShopperTrak_Analytics_1Devs2_SaaS_15_August_2018__MTUzNDI4NzYwMDAwMA==390a46244a1af6608a2aca6d4c30932a');
  }
})();
