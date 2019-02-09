const siteNameLoc = element(by.css("[placeholder='site name']"));
const siteIdLoc = element(by.css("[placeholder='site id']"));
const custIdLoc = element(by.css("[placeholder='cust id']"));
const reportingNameLoc = element(by.css("[placeholder='reporting name']"));
// const siteTypeLoc = element(by.css("[placeholder='site type'] div span span"));
const siteTypeArrow = $("[placeholder='site type']");// div.mat-select-arrow-wrapper
const currencyLoc = element(by.css("[placeholder='currency']"));// div.mat-select-arrow-wrapper
const siteMidnightLoc = element(by.css("[placeholder='site midnight hour'] "));//div.mat-select-arrow-wrapper
const dailyAcquasitionHr = element.all(by.css("[placeholder='Daily Acquisition Time'] mat-form-field mat-select")).first();
const dailyAcquasitionMin = element.all(by.css("[placeholder='Daily Acquisition Time'] mat-form-field mat-select")).last();
const effectiveDate = element.all(by.css(".mat-datepicker-toggle .mat-icon.material-icons")).first();
const endDate = element(by.css("[placeholder='DD/MM/YYYY'][formcontrolname='end_date']"));
const compStartDate = element.all(by.css(".mat-datepicker-toggle .mat-icon.material-icons")).get(1);
const trafficStartDate = element.all(by.css(".mat-datepicker-toggle .mat-icon.material-icons")).get(2);
const closeSiteDetails = element(by.css(".ng-star-inserted .btn-dialog-close"));
const timeZone = element(by.css("[placeholder='time zone']"));
const startTimeHr = element.all(by.css("[placeholder='start Time'] mat-form-field mat-select")).first();
const startTimeMin = element.all(by.css("[placeholder='start Time'] mat-form-field mat-select")).last();
const endTimeHr = element.all(by.css("[placeholder='end Time'] mat-form-field mat-select")).first();
const endTimeMin = element.all(by.css("[placeholder='end Time'] mat-form-field mat-select")).last();
const country = element(by.css("[placeholder='country']"));
const address1 = element(by.css("[placeholder='address 1']"));
const address2 = element(by.css("[placeholder='address 2']"));
const postalCode = element(by.css("[placeholder='postal code']"));
const state = element(by.css("[placeholder='state']"));
const city = element(by.css("[placeholder='city']"));
const longitude = element(by.css("[placeholder='longitude']"));
const latitude = element(by.css("[placeholder='latitude']"));
const type = element(by.css("[placeholder='type']"));


const commonOperation = require("../operations/CommonOperation.js");

module.exports = {

    setSiteName:function(name){
        browser.sleep(2000);
        // commonOperation.customWait_visibilityOf(siteNameLoc,3000);
        siteNameLoc.click();
        return siteNameLoc.sendKeys(name);
        browser.sleep(2000);
    },
    setSiteId:function(name){
        siteIdLoc.click();
        return siteIdLoc.sendKeys(name);
        browser.sleep(2000);
    },
    setCustId:function(id){
        custIdLoc.click();
        return custIdLoc.sendKeys(id);
        browser.sleep(2000);
    },
    setReportingName:function(name){
        reportingNameLoc.click();
        browser.sleep(2000);
        return reportingNameLoc.sendKeys(name);
        
    },
    selectOptionInDropDown:function(option){
        // browser.executeScript('arguments[0].scrollIntoView(true);', element(by.cssContainingText(".mat-select-content .mat-option > span",option)));
        return element(by.cssContainingText(".mat-select-content .mat-option > span",option)).click();
    },
    setSiteType:function(option){
        browser.sleep(3000);
        siteTypeArrow.click();
        browser.sleep(2000);
        this.selectOptionInDropDown(option);
    },
    setCurrencyType:function(option){
        browser.sleep(2000);
        currencyLoc.click();
        browser.sleep(2000);
        this.selectOptionInDropDown(option);
    },
    setSiteMidnightHour:function(option){
        siteMidnightLoc.click();
        this.selectOptionInDropDown(option);
    },
    setDailyAcquasitionHr:function(option){
        browser.sleep(2000);
        dailyAcquasitionHr.click();
        browser.sleep(1000);
        // element.all(by.css('div.mat-select-content mat-option.mat-option span')).first().click(); 
        this.selectOptionInDropDown(option);
    },
    setDailyAcquasitionMin:function(option){
        dailyAcquasitionMin.click();
        browser.sleep(1000);
        this.selectOptionInDropDown(option);
    },

    getTodayDate:function(){
        var today = new Date();      
        var temp = today.toString();        
        var arr = temp.split(" ");        
        // console.log("arr -1 :"+arr[1].toUpperCase());//OCT
        // console.log("arr -2 :"+arr[2]);//26
        // console.log("arr -3 :"+arr[3]);//2018
        var currentDate = arr[2]+"-"+arr[1].toUpperCase()+"-"+arr[3];
        // console.log("currentDate :"+currentDate);
        return currentDate;
    },


    setEffectiveDate:function(date){
        // browser.executeScript('arguments[0].scrollIntoView(true);', effectiveDate);
        browser.sleep(1000);
        browser.executeScript('arguments[0].scrollIntoView(true);', timeZone);
        browser.executeScript('arguments[0].scrollIntoView(true);', currencyLoc);
        browser.sleep(5000);
        effectiveDate.click();        
        commonOperation.selectDate(date);
    },
    setCompStartTime:function(date){
        compStartDate.click();
        commonOperation.selectDate(date);
    },
    setTrafficStartDate:function(date){
        trafficStartDate.click();
        commonOperation.selectDate(date);
    },



    

    setTimeZone:function(option){
        browser.executeScript('arguments[0].scrollIntoView(true);', timeZone);
        timeZone.click();
        browser.sleep(1000);
        this.selectOptionInDropDown(option);
    },
    setStartTimeHr:function(option){
        startTimeHr.click();
        browser.sleep(3000);
        this.selectOptionInDropDown(option);
    },
    setStartTimeMin:function(option){
        startTimeMin.click();
        browser.sleep(3000);
        this.selectOptionInDropDown(option);
    },
    setEndTimeHr:function(option){
        endTimeHr.click();
        browser.sleep(3000);
        this.selectOptionInDropDown(option);
    },
    setEndTimeMin:function(option){
        endTimeMin.click();
        browser.sleep(3000);
        this.selectOptionInDropDown(option);
    },
    setCountry:function(option){
        country.click();
        browser.sleep(3000);
        this.selectOptionInDropDown(option);
    },
    setAddress1:function(name){
        address1.click();
        browser.sleep(3000);
        address1.sendKeys(name);
    },
    setAddress2:function(name){
        address2.click();
        browser.sleep(3000);
        address2.sendKeys(name);
    },
    setPostalCode:function(name){
        browser.executeScript('arguments[0].scrollIntoView(true);', postalCode);
        postalCode.click();
        browser.sleep(3000);
        postalCode.sendKeys(name);
    },
    setState:function(name){
        state.click();
        browser.sleep(3000);
        state.sendKeys(name);
    },
    setCity:function(name){
        city.click();
        browser.sleep(3000);
        city.sendKeys(name);
    },
    setlongitude:function(name){
        browser.executeScript('arguments[0].scrollIntoView(true);', longitude);
        longitude.click();
        browser.sleep(3000);
        longitude.sendKeys(name);
    },
    setlatitude:function(name){
        latitude.click();
        browser.sleep(3000);
        latitude.sendKeys(name);
    },
    setType:function(option){
        type.click();
        browser.sleep(3000);
        this.selectOptionInDropDown(option);
    }



};