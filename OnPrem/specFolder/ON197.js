const loginPage = require('../pages/loginPage.js');
const homePage = require('../pages/homePage.js');
const organisationPage = require('../pages/organisationPage.js');
const dataValues = require('../data/dataValues.js');

describe("As a super user,  occupancy metric on Add Organization Page", function () {
    it("Occupancy on Add Organization Page", function () {

        loginPage.openBrowser();
        loginPage.enterLogin(credentials.username, credentials.password);
        loginPage.clickSubmitBtn();

        homePage.clickAdminDropDown();
        homePage.clickAdminOptionInDropDown();
        homePage.clickAddOrganizationButton();

        organisationPage.switchRealTimeOFF();
        expect(organisationPage.checkOccupancyIsDisabled()).toBe(true);
        expect(organisationPage.checkIfOccupancyIconIsDisplayed()).toBe(true);
        browser.sleep(8000);

        // click , send keys , drop down goes in baseWeb Operations 
        browser.actions().mouseMove(element(by.css('.exclamation-mark.occupancy-info'))).perform().
        then(function () {
            browser.sleep(5000);
        }).
        then(function () {
            expect(organisationPage.validateToolTipExists()).toBe(true);
        })

        expect(organisationPage.validateInfoOnToolTip()).toBe("To enable occupancy, you need to enable the Realtime Traffic button.");

        browser.sleep(10000);
        organisationPage.switchRealTimeON();
        browser.sleep(10000);

        expect(organisationPage.checkOccupancyIsDisabled()).toBe(false);
        expect(organisationPage.checkIfOccupancyIconIsDisplayed()).toBe(true);
        browser.actions().mouseMove(element(by.css('.exclamation-mark.occupancy-info'))).perform().
        then(function () {
            browser.sleep(5000);
        }).
        then(function () {
            expect(organisationPage.validateToolTipExists()).toBe(true);
        })
        expect(organisationPage.validateInfoOnToolTip()).toBe("To enable occupancy, you need to enable the Realtime Traffic button.");

        organisationPage.switchOccupancyON();
    });
});