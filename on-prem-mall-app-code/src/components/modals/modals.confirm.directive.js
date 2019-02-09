(function(){

  angular.module('shopperTrak.modals')
  .config(function($modalProvider) {
    angular.extend($modalProvider.defaults, {
      html: true
    });
  })
  .factory('$confirm', function($modal, $rootScope, $q, $translate) {
    return function(config) {
      var scope = $rootScope.$new();
      var deferred = $q.defer();
      var confirm;
      scope.title = config.title;
      scope.content = config.content;
      scope.okText = config.okText || $translate.instant('common.OK');
      scope.cancelText = config.cancelText|| $translate.instant('common.CANCEL');
      scope.answer = function(res) {
        deferred.resolve(res);
        confirm.isShown = true;
        confirm.hide();
      };
      confirm = $modal({
        templateUrl: 'components/modals/modals.confirm.partial.html',
        scope: scope,
        show: false
      });
      confirm.$promise.then(confirm.show);
      return deferred.promise;
    };
  });

})();
