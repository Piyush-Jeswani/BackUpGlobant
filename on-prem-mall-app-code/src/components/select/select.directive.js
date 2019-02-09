(function () {
    'use strict';

    angular.module('shopperTrak').directive('customSelect', function () {
        return {
            restrict: 'E',
            templateUrl: 'components/select/select.partial.html',
            controller: 'customSelectCtrl',
            scope: {
                controlId: '@',
                items: '=',
                currentItem: '=',
                activeLinkHeaderClass: '@',
                activeLinkHeader: '=',
                selectHeader: '=',
                useTypeahead: '=',
                showParentLink: '=',
                minSearchLength: '=',
                promptText: '@',
                filterProperty: '@',
                orderBy: '@',
                order: '@',
                displayProperty: '@',
                idProperty: '@',
                onItemSelection: '&',
                isSearching: '=?',
                itemUiSrefPattern: '@',
                parentUiSrefPattern: '@',
                currentUiSrefPattern: '@',
                parentDropDownClass: '@',
                loadMore: '=?',
                isFetching: '=',
                searchName: '=',
                disabled: '=?'
            }
        };
    });
})();
