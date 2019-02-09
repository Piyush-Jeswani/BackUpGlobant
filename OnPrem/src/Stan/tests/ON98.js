
const organizationPage = require('../../Stan/operations/organizationOperation.js');
const protractor_1 = require("protractor");
const loginPage = require('../../Stan/operations/LoginOperations.js');
const homePage = require('../../Stan/operations/homePageOperation.js');
const dataValues = require('../../Stan/resources/ON96.json');
const env = require( '../../../env.js');
const EC = protractor_1.ExpectedConditions;

describe("As a customer, one can see max occupancy in Real Time Screen", function () {
    it("Validating the visibility of Max Occupancy", function () {

        loginPage.loginSuccessful_Stan(dataValues.credentials.username, dataValues.credentials.password);
        homePage.selectAdminOption();
        organizationPage.selectOrganizationToEdit("");
        organizationPage.selectAdvancedOption();

        organizationPage.selectSubscriptionSwitch("Realtime traffic","OFF");
        organizationPage.selectSubscriptionSwitch("Occupancy","ON");
        // homePage.clickAdminDropDown();
        // homePage.clickAdminOptionInDropDown();

        // organisationPage.enterSiteName(organisation.sitename);
        // organisationPage.clickEditBtn();
        // browser.sleep(2000);
        // organisationPage.clickAdvancedOption();
        // browser.sleep(15000);
        // organisationPage.switchRealTimeON();
        // organisationPage.switchOccupancyON();
       
        organisationPage.clickSaveBtn();
        //browser.sleep(10000);
        // browser.

    });
});