

const commonOperation =require('../operations/CommonOperation.js');
module.exports = {
    headerTitle_div:$(".header_title"),
    headerSubTitle_div:$(".header_subtitle"),
    form_title_div:$$(".form_title"),
    org_name_input:$("[formcontrolname='name']"),
    org_id_input:$("[formcontrolname='id']"),
    // org_name_input:$("[placeholder='organization name']"),
    // org_id_input:$("[placeholder='organization id']"),
    org_type_dropdown:$("[placeholder='organization type']"),//[formcontrolname='type'] div.mat-select-arrow-wrapper
    dropDownList_option:".mat-option.ng-star-inserted span",
    radio_btns:$$("mat-radio-button.mat-radio-button"),
    dateFormat_dropdown:$("[formcontrolname='date_format'][role='listbox']"),
    calendarFormat_dropdown:$("[formcontrolname='calendar_format'][role='listbox']"),
    locale_dropdown:$("[formcontrolname='locale'][role='listbox']"),
    

    perimeter_checkbox:$("[formcontrolname='perimeter'] div.mat-slide-toggle-thumb"),
    realTimeTraffice_checkbox:$("[formcontrolname='realtime_traffic'] div.mat-slide-toggle-thumb"),
    occupancy_checkbox:$("[formcontrolname='occupancy'] div.mat-slide-toggle-thumb"),
    create_organization_btn:$(".btn-secondary"),
    logout:$("div.logout"),

    //labels
    getLabel:function(label_name){
        return element(by.cssContainingText("label", label_name))
    },

    getLabelsInsideDiv:function(label_name){
        return element(by.cssContainingText("div.form-field-label", label_name))
    },

 




    getTitle:function(){
        return this.headerTitle_div.getText();
    },

    getSubTitle:function(){
        return this.headerSubTitle_div.getText();
    },

    getOrgSettingLabel:function(){
        return this.form_title_div.get(0).getText();
    },
    getFormatSettingLabel:function(){
        return this.form_title_div.get(1).getText();
    },
    getSubscriptionLabel:function(){
        return this.form_title_div.get(2).getText();
    },

    getOrgName:function(){
        return this.org_name_input;
    },
    enterOrgName:function(org_name){
        
        // browser.driver.findElement(By.css("[formcontrolname='name']")).sendKeys(org_name);
        // browser.driver.findElement(By.css("[formcontrolname='id']")).sendKeys("12");
          return this.org_name_input.sendKeys(org_name);
          
        //  // this.org_name_input.sendKeys(protractor.Key.TAB)
        //   this.org_id_input.sendKeys("12")
        //   this.org_name_input.sendKeys(protractor.Key.TAB)
    },

    getOrgId:function(){
        return this.org_id_input;
    },
    enterOrgId:function(org_id){
        this.org_id_input.sendKeys(org_id);
        //  this.org_id_input.sendKeys(org_id).then(text => {
        //     console.log('text')
        // });
    },

    getOrgType:function(){
        return this.org_type_dropdown;
    },
    clickOrgType:function(){
         return this.org_type_dropdown.click();
    },
    selectOrgType:function(org_type){
        this.clickOrgType();
        this.selectOptionInDropDown(org_type);              
    },
    
    selectDropdownOptions:function(option_name){       
        commonOperation.chooseOptionInSelect(this.dropDownList_option, option_name);
    },

    getDateFormat:function(){
        return this.dateFormat_dropdown;
    },
    getCalendarFormat:function(){
        return this.calendarFormat_dropdown;
    },
    getLocaleFormat:function(){
        return this.locale_dropdown;
    },

    selectOptionInDropDown:function(option){
        browser.executeScript('arguments[0].scrollIntoView(true);', element(by.cssContainingText(".mat-select-content .mat-option > span",option)));
        return element(by.cssContainingText(".mat-select-content .mat-option > span",option)).click();
    },

    clickDateFormat:function(){
         return this.dateFormat_dropdown.click();         
    },
    selectDateFormat:function(date_format){
        browser.sleep(3000);
        this.clickDateFormat(); 
        browser.sleep(3000);        
        this.selectOptionInDropDown(date_format);
    },
    clickCalendarFormat:function(){
         return this.calendarFormat_dropdown.click();
    },
    selectCalendarFormat:function(calendar_format){        
        browser.sleep(3000);
        this.clickCalendarFormat();       
        this.selectOptionInDropDown(calendar_format);        
        browser.sleep(3000);
    },
    clickLocaleFormat:function(){      
         return this.locale_dropdown.click();
    },
    selectLocale:function(locale){
        this.clickLocaleFormat();
        this.selectOptionInDropDown(locale); 
        browser.sleep(3000);
    },
    getSubscription:function(sub_name){
        let subscriptionName = "[formcontrolname='"+sub_name+"'] [type='checkbox']"
        return $(subscriptionName);
    },

   selectSubscription:function(sub_name){
       this.getSubscription(sub_name).click();
   },

    
    getCreateOrgBtn:function(){
        return this.create_organization_btn;
    },
    clickCreateOrgBtn:function(){
         this.create_organization_btn.click();
    },

    getRadioButtonValue:function(input_value){
        let radioValue = "mat-radio-button[value='"+input_value+"'] div.mat-radio-outer-circle";
        // commonOperation.waitForElementVisibility($(radioValue));
        browser.executeScript('arguments[0].scrollIntoView(true);', $(radioValue));
        return $(radioValue);
    },

    clickRadioButton:function(input_value){
         return this.getRadioButtonValue(input_value).click();
    },
    
    selectTimeFormat:function(input_value){
        browser.sleep(5000);
        this.getRadioButtonValue(input_value).click();
        browser.sleep(5000);
        
    },
    selectNumberFormat:function(input_value){
        if(input_value="1,234.00"){
            this.getRadioButtonValue("1").click();
        }
        if(input_value="1.234,00"){
            this.getRadioButtonValue("2").click();
        }
    },
    selectEnterExit:function(input_value){
        this.getRadioButtonValue(input_value).click();
        browser.sleep(5000);
    },

    enablePerimeter:function(){
        this.perimeter_checkbox.click();        
    },
    enableRealTimeTraffic:function(){
        this.realTimeTraffice_checkbox.click();
    },
    enableOccupancy:function(){
        this.occupancy_checkbox.click();
        browser.sleep(5000);
    },

    clickLogout:function(){
        return this.logout.click();
        browser.sleep(10000);
    }

    
};