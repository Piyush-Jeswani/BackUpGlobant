(function () {
    'use strict';

    angular.module('shopperTrak').directive('typeAhead', function () {
        return {
            restrict: 'E',
            scope: {
                prompt: '@',
                items: '=',
                model: '=',
                focus: '=',
                filterProperty: '=',
                minSearchLength: '=',
                useApiToSearch: '=',
                startSearchAfterMilliseconds: '='
            },
            controller: 'typeAheadCtrl',
            templateUrl: 'components/select/type-ahead/type-ahead.partial.html'
        };
    });
})();
