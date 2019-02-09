const zoneEntranceLink = element(by.xpath("//div[@class='mat-tab-label-content'][contains(text(),'ZONE AND ENTRANCE')]"));
const createZoneBtn = element(by.cssContainingText(".btn.btn-primary-2","create zone"));
const createEntrance = element(by.cssContainingText(".btn.btn-primary-2","create entrance"));
const orgEdit = element(by.css('.header_summary .btn.link.btn-icon a'));
const orgSave = element(by.css('.btn.btn-primary'));
const siteSave = element(by.css('.btn.btn-primary'));
const siteEdit = element(by.xpath("//*[contains(text(),'site settings')]/following-sibling::div//a"));
const commonOp = require('../operations/CommonOperation.js');

module.exports = {

    clickZoneEntraneSetting:function(){
        zoneEntranceLink.click();
    },

    clickCreateZoneBtn:function(){
        createZoneBtn.click();
    },

    clickOrganizationEdit:function(){
        commonOp.waitForElementVisibility('.header_summary .btn.link.btn-icon a');        
        orgEdit.click();
        commonOp.waitForElementVisibility('.btn.btn-primary');        
    },

    clickSiteSettingIcon:function(){
        commonOp.waitForElementVisibility('.header.with-breadcrumb .fa.fa-pencil-square-o');
        browser.sleep(3000);
        siteEdit.click();
        commonOp.waitForElementVisibility('.btn.btn-primary');        
    }

}