const editEntranceComponent = require('../../../components/ControlPanelSettings/Zone/EditEntranceComponent.js');
const commonOperation =require('../../../operations/CommonOperation.js');
module.exports = {
    verifyEditEntranceComponent:function(){
        expect(editEntranceComponent.getEntranceName().isDisplayed()).toBe(true);
        expect(editEntranceComponent.getEntranceId().isDisplayed()).toBe(true);
        expect(editEntranceComponent.getEntranceType().isDisplayed()).toBe(true);
        expect(editEntranceComponent.getEntrance_EffectiveDate().isDisplayed()).toBe(true);
        expect(editEntranceComponent.getEntrance_EndDate().isDisplayed()).toBe(true);
        expect(editEntranceComponent.getSourceData_TrafficCounters().isDisplayed()).toBe(true);
        expect(editEntranceComponent.getSourceData_Reversal().isDisplayed()).toBe(true);
        expect(editEntranceComponent.getZoneorSubZoneDropDown().isDisplayed()).toBe(true);
        expect(editEntranceComponent.getUpdateEntrance().isDisplayed()).toBe(true);
        expect(editEntranceComponent.getCancelEntrance().isDisplayed()).toBe(true);

    },
};