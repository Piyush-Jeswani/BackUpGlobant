const env = require( '../../../env.js');
const orgComponent = require('../components/OrganizationComponents.js');

   module.exports = {

   selectOrganizationToEdit:function(org_name){
       orgComponent.clickEditBtn(org_name);
   },

   goToAdvancedOptions:function(){
    orgComponent.clickAdvancedOption();
   },

   selectMetricInAdvanceOption:function(subscription_name,switch_State){
    
        this.selectSubscriptionSwitch(subscription_name,switch_State);
        orgComponent.clickSaveBtn();
        // orgComponent.scrollToAdvanceOption();
        //scroll to advacne
        
        // browser.sleep(3000);
        // common.waitForElementVisibility(orgComponent.advancedOption);
        // orgComponent.tag_heading.click();

   },



  selectSubscriptionSwitch:function(subscription_name,switch_State){
      
    orgComponent.findSwitchStatus(subscription_name).then((actualStatus) => {
        if(actualStatus == "ON"){
        }
        else if(actualStatus == "OFF"){
            orgComponent.toggleSwitch(subscription_name);
        }
    });
    
  }

   
};




