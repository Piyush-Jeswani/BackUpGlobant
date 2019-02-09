const wizardComponent = require('../components/WizardComponent.js');
const congratsComponent = require('../components/congratulationComponents.js');
const commonOperation =require('../operations/CommonOperation.js');

module.exports = {
    verifyCongratulationComponents:function(){
        expect(congratsComponent.readCongratsMessage()).toBe("Congratulations!");
        expect(congratsComponent.getSuccesslabeltext()).toBe("You successfully created your organization");        
        expect(congratsComponent.getNewSiteBtn().isDisplayed()).toBe(true);
    },
    clickCreateNewSiteBtn:function(){
        // commonOperation.customWait_visibilityOf(congratsComponent.getNewSiteBtn(),10000);
        // commonOperation.waitForElementVisibility(congratsComponent.getNewSiteBtn());
          congratsComponent.clickNewSite();        
    },
};