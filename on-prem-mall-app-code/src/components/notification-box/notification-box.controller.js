(function () {
    'use strict';
    
    angular.module('shopperTrak')
        .controller('NotificationBoxController', NotificationBoxController);

    NotificationBoxController.$inject =[];

    function NotificationBoxController(){
        var vm = this;
        
        activate();

        function activate(){
            vm.boxPosition = vm.boxPosition? vm.boxPosition : 'left';
            
            vm.data = {
                boxType: vm.boxType,
                boxPosition: vm.boxPosition==='left'? 'pull-left' : 'pull-right',
                customPadding: vm.customPadding,
                customMessage: vm.customMessage
            }
        }
    }

})();