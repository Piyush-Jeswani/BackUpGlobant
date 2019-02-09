const commonOp = require('../../operations/CommonOperation.js');
module.exports = {

    
    //Device_Tab
    //Traffic Tab
    site_Name:element(by.css(".site .name h1")),
    site_Id_Lbl:element(by.cssContainingText("span.item-name"," SITE ID ")),
    site_Type_Lbl:element(by.cssContainingText("span.item-name"," SITE TYPE ")),
    reporting_name_Lbl:element(by.cssContainingText("span.item-name"," REPORTING NAME ")),
    setting_Icon:element(by.css(".site-summary mat-icon")),

    validateSiteDetailsExist:function(){      
        // commonOp.customWait_visibilityOf(this.site_Id_Lbl,10000);
        // commonOp.waitForElementVisibility(this.site_Id_Lbl)  
        browser.sleep(5000);
        
        expect(this.site_Name.isDisplayed()).toBe(true);
        expect(this.site_Id_Lbl.isDisplayed()).toBe(true);
        expect(this.site_Type_Lbl.isDisplayed()).toBe(true);
        expect(this.reporting_name_Lbl.isDisplayed()).toBe(true);       
    },
    
    clickSetting:function(){
    commonOp.customWait_visibilityOf(this.setting_Icon,10000);
    this.setting_Icon.click();
    }
    
    }