

const commonOperation =require('../operations/CommonOperation.js');

module.exports = {
  siteName : element(by.css("input[name='sitename']")),
  editBtn : element(by.css('.table.table-striped tbody tr[ng-repeat] td.org-actions span.icon.icon-edit')),
  exportBtn : element(by.css('.org-actions .icon-edit .sticon.sticon-export-fat')),
  advancedOption : element(by.css("[heading='ADVANCED OPTIONS']")),
  occupancyIcon : element(by.css(".exclamation-mark.occupancy-info")),  
  
  toolTip : element(by.css('.tooltip.in.am-fade')),
  organization_table : element(by.css('table.table')),
  organization_table_repeater:element.all(by.repeater('organization in vm.organizations | filter: { name:vm.orgsearch } track by organization.id')),
  site_table:element(by.css('div.admin-organization-edit-sites')),
  suAdvanced_div:element(by.css('div#su-advanced')),
  occupancy_radio:element(by.css('.occupancy-info')),
  advancedOptions_subscriptions:$$(".row.options .option"), 
  save_btn:element(by.css("form[name='dwellTimeForm'] .btn-primary")),
  save_alert_msg:element(by.css("div[class='toast-alert-ui']")),
  tag_heading:element(by.cssContainingText(".nav-link","TAGS")),
  subscriptionLbl:element(by.cssContainingText(".org-subscriptions h1","Subscriptions")),

  

  enterSiteName : function (text) {
    this.siteName.sendKeys(text);
},

clickEditBtn:function(organization_name){
  let rows = this.organization_table_repeater;
  rows.filter(function(row, index){
      return row.getText().then(function(text) {
          return text.indexOf(organization_name) != -1;
        });
   }).first().all(By.css('td')).get(2).$("[data-title='Edit organization']").click();
   commonOperation.customWait_visibilityOf(this.site_table,10000);
},

findSubscriptions:function(subscription_name){
  let rows = this.advancedOptions_subscriptions;
     return rows.filter(function(row, index){
        return row.$('h3').getText().then(function(text) {            
            
            return text.indexOf(subscription_name) != -1;
            });
        }).first();

},



toggleSwitch:function(subscription_name){
    this.findSubscriptions(subscription_name).$$("span[role='button']").click();
},
findSwitchStatus:function(subscription_name){
 return this.findSubscriptions(subscription_name).$$("span[role='button']").getAttribute("class").then(function(attribute){

        if(attribute[0]=='ui-switch'){
            return "OFF";
        }
        else if(attribute[0]=='ui-switch chosen'){
            return "ON";
        }
        else if(attribute[0]=='ui-switch disabled'){
            return "Disabled";
        }
        })   
},



  clickExportButton : function(){
      this.exportBtn.click();
  },

  clickAdvancedOption : function () {
      this.advancedOption.click();
      browser.sleep(3000);
    //   commonOperation.customWait_visibilityOf(this.suAdvanced_div,10000);
  },

  checkIfOccupancyIconIsDisplayed: function () {
      return this.occupancyIcon.isDisplayed();
  },

  validateInfoOnToolTip : function(){
      return this.occupancyIcon.getAttribute('data-title');
  },

  checkOccupancyIsDisabled:function () {        
      let a = element(by.cssContainingText('.disabled-text', 'Occupancy')).isDisplayed().
          then(() => true)
          .catch(err => false);                        
          return a ;
  },

  checkRealTimeTrafficExists :function () {
      return element(by.cssContainingText('.option>h3', 'Realtime traffic')).isDisplayed();
  },
  checkRealTimeIsOff :function () {
      let ret = false;
      if (this.realTimeOff.isDisplayed()) {
          ret = true;
      }
  },

  checkRealTimeIsOn : function () {
      return this.realTimeOn.isDisplayed();
  },

  switchRealTimeON: function () {
      this.realTimeOff.click()
          .then(() => console.log("Real Time Switch is Off"))
                  .catch(err => console.log("Element Already Clicked Before"));
  },

  switchRealTimeOFF : function () {
      this.realTimeOn.click().
          then(() => console.log('Real Time Switch is made Off'))
                  .catch(err => console.log('Real Time Switch if already off'));
  },

  checkOccupancyIsOff : function () {
      return this.occupancyOff.isDisplayed();
  },

  switchOccupancyON : function () {
      let e = element(by.xpath("//div[contains(@class,'option')]//h3[contains(text(),'Occupancy')]/parent::div//span[@class='ui-switch']"))
      e.click().then(() => console.log("Occupancy Switch is in Off State"))
          .catch(err => console.log("Occupancy Element Already Clicked Before"));
  },

  switchOccupancyOFF : function () {
      this.occupancyOn.click();
  },

  checkOccupancyIsOn : function () {        
      return this.occupancyOn.isDisplayed();
  },

  clickSaveBtn : function () {
    this.save_btn.click();
   // browser.wait(protractor.ExpectedConditions.visibilityOf(orgComponent.save_alert_msg,env.default_TimeOut ));
   
  },

//   scrollToAdvanceOption:function(){
//     browser.executeScript("arguments[0].scrollIntoView();", this.advancedOption);
//     commonOperation.waitForElementVisibility(this.advancedOption);
//   },

//   clickAdvancedOption : function(){
//     this.clickAdvancedOption();
//   },

  validateToolTipExists : function(){          
      return this.toolTip.isDisplayed();
  },

};

