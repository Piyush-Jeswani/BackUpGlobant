(function () {
    'use strict';

    var notificationBox = {
        templateUrl: 'components/notification-box/notification-box.partial.html',
        controller: 'NotificationBoxController',
        controllerAs: 'vm',
        bindings: {
            boxType: '@',
            boxPosition: '@',
            customPadding: '<',
            customMessage: '='
        }
    }

    angular.module('shopperTrak')
        .component('notificationBox', notificationBox);

})();