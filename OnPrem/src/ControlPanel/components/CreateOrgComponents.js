const orgNameLoc = element(by.css(".header_title"));
const orgIdLoc = element(by.css(".header_summary > .header_summary_item:first-child > .item-value"));
const orgTypeLoc = element(by.css("[placeholder='organization type'] div span span"));
const orgSingleSiteLoc = element(by.css("[value='SingleSite'] [class*='outer-circle']"));
const orgMultiSiteLoc = element(by.css("[value='MultiSite'] [class*='outer-circle']"));
const dateFormatLoc = element(by.css("[placeholder='date format'] div span span"));
const calendarFormatLoc = element(by.css("[placeholder='calendar format'] div span span"));
const localeLoc = element(by.css("[placeholder='locale'] div span span"));
const timeFormat12Loc = element(by.css("[value='12'] [class*='outer-circle']"));
const timeFormat24Loc = element(by.css("[value='24'] [class*='outer-circle']"));
const number1Format = element(by.css("[value='1'] [class*='outer-circle']"));
const number2Format = element(by.css("[value='2'] [class*='outer-circle']"));
const enterRadio = element(by.css("[value='Enters'] [class*='outer-circle']"));
const exitRadio = element(by.css("[value='Exits'] [class*='outer-circle']"));
const realTimeTrafficToggle = element(by.css("[formcontrolname='realtime_traffic'] [class='mat-slide-toggle-thumb']"));
const occupancyToggle = element(by.css("[formcontrolname='occupancy']"));
const closeOrgDetails = element(by.css(".ng-star-inserted .btn-dialog-close"));
const orgEdit = element(by.css('.header_summary .btn.link.btn-icon a'));
const commonOp = require('../operations/CommonOperation.js');



var orgDetails = require('../resources/orgDetails.js');

module.exports = (function () {

  var createOrgComponent = function () {
    this.orgId = element(by.css("input[placeholder='organization id']"));
    this.orgType = element(by.css("[placeholder='organization type'] div span span"));
    this.orgTypeCommon = ".cdk-overlay-connected-position-bounding-box span";
    this.optionsCss = ".mat-option.ng-star-inserted span";
  }

  createOrgComponent.prototype = {

    getOrgDetailsAndSetValue: function () {
      return orgNameLoc.getText()
        .then(function (text) {
          console.log("Testing :" + text);
          orgDetails.orgName = text;
        })
        .then(function () {          
          orgIdLoc.getText().then(function (text) {
          orgDetails.orgId = text;
          });
        })
        .then(function () {          
          orgTypeLoc.getText().then(function (text) {
          orgDetails.orgType = text;
          });
        })
        .then(function () {          
          orgSingleSiteLoc.getText().then(function () {
            if(orgSingleSiteLoc.isSelected()){orgDetails.orgFormat = "SingleSite"}
            else if(orgMultiSiteLoc.isSelected()){orgDetails.orgFormat = "MultiSite"}
          
          });
        })
        .then(function () {          
          dateFormatLoc.getText().then(function (text) {
          orgDetails.dateFormat = text;
          });
        })
        .then(function () {          
          calendarFormatLoc.getText().then(function (text) {
          orgDetails.calendarFormat = text;
          });
        })
        .then(function () {          
          localeLoc.getText().then(function (text) {
          orgDetails.Locale = text;
          });
        })
        .then(function () {          
          timeFormat12Loc.getText().then(function () {
            if(timeFormat12Loc.isSelected()){orgDetails.timeFormat = "12"}
            else if(timeFormat24Loc.isSelected()){orgDetails.timeFormat = "24"}
          
          });
        })
        .then(function () {          
          number1Format.getText().then(function () {
            if(number1Format.isSelected()){orgDetails.decimal_seperator = ".",
            orgDetails.thousands_seperator = ","}
            else if(number2Format.isSelected()){orgDetails.decimal_seperator = ",",
            orgDetails.thousands_seperator = "."}
          
          });
        })
        .then(function () {          
          enterRadio.getText().then(function () {
            if(enterRadio.isSelected()){orgDetails.entersExits = "Enters"}
            else if(exitRadio.isSelected()){orgDetails.entersExits = "Exits"}          
          });
        })
        .then(function () {          
          realTimeTrafficToggle.getText().then(function () {
            if(realTimeTrafficToggle.isSelected()){orgDetails.realtime = true}
            else {orgDetails.realtime = false}          
          });
        })
        .then(function () {          
          occupancyToggle.getAttribute("class").then(function (text) {
            if(text.includes("checked")){          
              orgDetails.occupancy = true}
            else {orgDetails.occupancy = false}          
          });
        })

    },

    closeOrgDetailsForm:function(){
      closeOrgDetails.click();      
      commonOp.waitForElementVisibility('.header_summary .btn.link.btn-icon a');
    }
  }
  return createOrgComponent;
})();
