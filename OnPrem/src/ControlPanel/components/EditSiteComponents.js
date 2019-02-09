const siteNameLoc = element(by.css(".breadcrumb .ng-star-inserted"));
const siteIdLoc = element(by.css("[placeholder='site id']"));
const custIdLoc = element(by.css("[placeholder='cust id']"));
const reportingNameLoc = element(by.css("[placeholder='reporting name']"));
const siteTypeLoc = element(by.css("[placeholder='site type']"));
const currencyLoc = element(by.css("[placeholder='currency']"));// div span span
const siteMidnightLoc = element(by.css("[placeholder='site midnight hour'] div span span"));
const dailyAcquasitionHr = element.all(by.css("[placeholder='Daily Acquisition Time'] div .mat-select-value span span:nth-child(1)")).first();
const dailyAcquasitionMin = element.all(by.css("[placeholder='Daily Acquisition Time'] div .mat-select-value span span:nth-child(1)")).last();
const effectiveDate = element(by.css("[placeholder='DD/MM/YYYY'][formcontrolname='effective_date']"));
const endDate = element(by.css("[placeholder='DD/MM/YYYY'][formcontrolname='end_date']"));
const compStartDate = element(by.css("[placeholder='DD/MM/YYYY'][formcontrolname='comp_start_date']"));
const trafficStartDate = element(by.css("[placeholder='DD/MM/YYYY'][formcontrolname='traffic_start_date']"));
const closeSiteDetails = element(by.css(".ng-star-inserted .btn-dialog-close"));


var siteDetails = require('../resources/siteDetails.js');

module.exports = (function () {

    var editSiteComponent = function () {
      this.orgId = element(by.css("input[placeholder='organization id']"));
      this.orgType = element(by.css("[placeholder='organization type'] div span span"));
      this.orgTypeCommon = ".cdk-overlay-connected-position-bounding-box span";
      this.optionsCss = ".mat-option.ng-star-inserted span";
    }

    editSiteComponent.prototype = {

        getSiteDetailsAndSetValue: function () {
            browser.sleep(3000);
          return siteNameLoc.getText()
            .then(function (text) {            
              siteDetails.siteName = text;
            })
            .then(function () {          
                siteIdLoc.getAttribute("value").then(function (text) {                   
                siteDetails.siteId = text;
              });
            })
            .then(function () {          
                custIdLoc.getAttribute("value").then(function (text) {                    
                    siteDetails.custId = text;
              });
            })            
            .then(function () {          
                reportingNameLoc.getAttribute("value").then(function (text) {                    
                    siteDetails.reportingName = text;
              });
            })
            .then(function () {          
                siteTypeLoc.getText().then(function (text) {  
                    if(text=="Retail Store"){}                
                    siteDetails.siteType = "Retailer";
              });
            })
            .then(function () {          
                currencyLoc.getText().then(function (text) {                   
                    siteDetails.currency = text;
              });
            })
            .then(function () {          
                siteMidnightLoc.getText().then(function (text) {                  
                    siteDetails.siteMidnight = text;
              });
            })
            .then(function () {          
                dailyAcquasitionHr.getText().then(function (text) {                  
                    siteDetails.dailyAcquisitionHr = text;
              });
            })
            .then(function () {          
                dailyAcquasitionMin.getText().then(function (text) {                   
                    siteDetails.dailyAcquisitionMin = text;
              });
            }) //effectiveDate
            .then(function () {          
                effectiveDate.getAttribute("value").then(function (text) {                    
                    siteDetails.effectiveDate = text;
              });
            }) 
            .then(function () {          
                endDate.getAttribute("value").then(function (text) {                    
                    siteDetails.endDate = text;
              });
            }) 
            .then(function () {          
                compStartDate.getAttribute("value").then(function (text) {                    
                    siteDetails.compStartDate = text;
              });
            }) 
            .then(function () {          
                trafficStartDate.getAttribute("value").then(function (text) {                    
                    siteDetails.trafficStartDate = text;
              });
            }) 
    
        },
    
        closeSiteDetailsForm:function(){
          closeSiteDetails.click();
        }
      }
      return editSiteComponent;
    })();