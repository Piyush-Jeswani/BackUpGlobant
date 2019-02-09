const zoneEntranceComponent = require('../../../components/ControlPanelSettings/Zone/ZoneAndEntranceComponent.js');
const editZoneComponent = require('../../../components/ControlPanelSettings/Zone/EditZoneComponent.js');
const commonOperation =require('../../../operations/CommonOperation.js');
module.exports = {
    clickZoneorEntrance:function(btn_name){
        zoneEntranceComponent.clickZoneEntranceButton(btn_name);
    },
    verifyZoneEntranceComponent:function(create_zone,create_entrance,){
        expect(zoneEntranceComponent.getZoneorEntranceButton(create_zone).isDisplayed()).toBe(true);
        expect(zoneEntranceComponent.getZoneorEntranceButton(create_entrance).isDisplayed()).toBe(true);
        expect(zoneEntranceComponent.getSearchZone().isDisplayed()).toBe(true);
        expect(zoneEntranceComponent.getTotalZoneCount().getText()).toBeGreaterThan(0);
        zoneEntranceComponent.verifyZoneRows();

    },

    clickEditZone:function(){
        commonOperation.customWait_visibilityOf(zoneEntranceComponent.getedit_zone(),10000);
        zoneEntranceComponent.getedit_zone().click();
        commonOperation.customWait_visibilityOf($('div.form_title'),10000);
        
    },
    clickEditEntrance:function(){
        commonOperation.customWait_visibilityOf(zoneEntranceComponent.getedit_zone(),10000);
        zoneEntranceComponent.expandorCollapseZone();
        
        
    }
    

};