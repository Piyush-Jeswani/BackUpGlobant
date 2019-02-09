const editZoneComponent = require('../../../components/ControlPanelSettings/Zone/EditZoneComponent.js');
module.exports = {
   
    verifyEditZoneComponent:function(){
    //    editZoneComponent.getEditZoneLabels();
       
        expect(editZoneComponent.getEditZone_Name_Label().getText()).toBe("ZONE NAME");   
        expect(editZoneComponent.getEditZone_Id_Label().getText()).toBe("ZONE ID");   
        expect(editZoneComponent.getEditZone_Type_Label().getText()).toBe("ZONE TYPE");   
        expect(editZoneComponent.getEditZone_Effective_Date_Label().getText()).toBe("EFFECTIVE DATE");   
        expect(editZoneComponent.getEditZone_End_Date_Label().getText()).toBe("END DATE");   
        expect(editZoneComponent.getZoneName().isDisplayed()).toBe(true);
        expect(editZoneComponent.getZoneId().isDisplayed()).toBe(true);
        expect(editZoneComponent.getZoneType().isDisplayed()).toBe(true);
        expect(editZoneComponent.getZoneEffectiveDate().isDisplayed()).toBe(true);
        expect(editZoneComponent.getZoneEndDate().isDisplayed()).toBe(true);
        expect(editZoneComponent.getOptiontoCreateSubZone_No().isDisplayed()).toBe(true);
        expect(editZoneComponent.getOptiontoCreateSubZone_Yes().isDisplayed()).toBe(true);
        expect(editZoneComponent.getUpdateZone().isDisplayed()).toBe(true);
        expect(editZoneComponent.getCancel().isDisplayed()).toBe(true);
        this.verifyEditZoneSubZoneComponent();
        
    },
    verifyEditZoneSubZoneComponent:function(){
           expect(editZoneComponent.getSubZoneName().isDisplayed()).toBe(true);
           expect(editZoneComponent.getSubZoneId().isDisplayed()).toBe(true);
           expect(editZoneComponent.getSubZoneType().isDisplayed()).toBe(true);
           expect(editZoneComponent.getSubZoneEffectiveDate().isDisplayed()).toBe(true);
           expect(editZoneComponent.getSubZoneEndDate().isDisplayed()).toBe(true);
        },

    fillZoneDetails:function(zone_name,zone_type,date){
       // editZoneComponent.editZoneName(zone_name);
       // editZoneComponent.clickZoneTypeDropDown();
        //editZoneComponent.selectZoneType(zone_type);
        //editZoneComponent.editZoneEffectiveDate(date);
        editZoneComponent.getSubZoneName();
    }

};