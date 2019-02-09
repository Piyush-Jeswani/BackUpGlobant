(function() {
  'use strict';

  angular.module('shopperTrak.auth', [
    'LocalStorageModule',
    'shopperTrak.config',
    'shopperTrak.obfuscation'
  ])
  .config(function($httpProvider) {
    $httpProvider.interceptors.push('authHttpInterceptor');
    $httpProvider.interceptors.push('pdfInterceptor');
    $httpProvider.interceptors.push('httpInterceptor');
  });
})();
