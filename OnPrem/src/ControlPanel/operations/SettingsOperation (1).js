
const loginComponent = require('../components/LoginComponents.js');
const settingComponent = require('../components/Settings.js');
const zoneEntranceComponent = require('../components/ControlPanelSettings/Zone/ZoneAndEntranceComponent.js');

const env = require( '../../env.js');
const commonOperation =require('./CommonOperation.js');

    module.exports = {
        selectSettingTab:function(tab_name){
            settingComponent.selectSettingTab(tab_name);
            commonOperation.customWait_visibilityOf(zoneEntranceComponent.zone_Entrance_btn,10000);
        },
       
        verifyOrganizationComponents:function(org_name,id_label,org_Id,org_type_lbl,org_type,site_settings,zone_entrance,device_settings,editLinkText){
            expect(settingComponent.getOrg_name().getText()).toBe(org_name);
            expect(settingComponent.getOrg_Item_name("ID").getText()).toBe(id_label);
            expect(settingComponent.getOrg_Item_value("ID").getText()).toBe(org_Id);
            
            expect(settingComponent.getOrg_Item_name("Type").getText()).toBe(org_type_lbl);
            expect(settingComponent.getOrg_Item_value("Type").getText()).toBe(org_type);

            expect(settingComponent.Organization_Edit_Link.getText()).toBe(editLinkText);

            expect(settingComponent.getSettings_tab(site_settings).isDisplayed()).toBe(true);
            expect(settingComponent.getSettings_tab(zone_entrance).isDisplayed()).toBe(true);
            expect(settingComponent.getSettings_tab(device_settings).isDisplayed()).toBe(true);
            }
    };