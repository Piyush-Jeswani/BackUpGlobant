const wizardComponent = require('../components/WizardComponent.js');
const commonOperation =require('../operations/CommonOperation.js');

module.exports = {
    verifyWizardComponents:function(){
        expect(wizardComponent.getWelcomeText()).toBe("WELCOME TO");
        expect(wizardComponent.getShopperTrakText()).toBe("ShopperTrak");
        expect(wizardComponent.getLabel1Text()).toBe("There is a special tool created to help you with the set up process.");
        expect(wizardComponent.getLabel2Text()).toBe("So let´s start creating your organization!");
        expect(wizardComponent.getletStart().isDisplayed()).toBe(true);
    },
    clickLetsStart:function(){
        commonOperation.customWait_visibilityOf(wizardComponent.getletStart(),10000);
        wizardComponent.clickLetStart();
    },
};