
const settingCom = require('../components/settingPageComponents.js')

module.exports = {
    enterZoneEntranceSetting:function(){
        settingCom.clickZoneEntraneSetting();       
    },

    createZone:function(){
        settingCom.clickCreateZoneBtn();
    },

    clickOrganizationToEdit:function(){
        settingCom.clickOrganizationEdit();
    },

    clickSiteToEdit:function(){
        settingCom.clickSiteSettingIcon();    
    }

};
