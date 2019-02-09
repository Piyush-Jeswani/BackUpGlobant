'use strict';

describe("NotificationBoxController", function(){

    var $componentController;

    beforeEach(module('shopperTrak'));

    beforeEach(inject(function (
        _$componentController_
    ) {
        $componentController = _$componentController_;
    }));

    it('controller should be defined', function () {
        var bindings = {boxType: 'info', boxPosition:'left', customPadding: '10', customMessage:'Custom message' };
        var controller = $componentController('notificationBox', null, bindings);
        expect(controller).toBeDefined();
    });


    it('controller has required bindings', function () {
        var bindings = {boxType: 'info', boxPosition:'left', customPadding: '10', customMessage:'Custom message' };
        var controller = $componentController('notificationBox', null, bindings);
        
        expect(controller.boxType).toBeDefined();
        expect(controller.boxPosition).toBeDefined();
        expect(controller.customPadding).toBeDefined();
        expect(controller.customMessage).toBeDefined();
    });
});