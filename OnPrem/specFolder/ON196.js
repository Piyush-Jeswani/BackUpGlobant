const loginPage = require('../pages/loginPage.js');
const homePage = require('../pages/homePage.js');
const organisationPage = require('../pages/organisationPage.js');
const dataValues = require('../data/dataValues.js');

const common = require('../common/functions.js');
const fileIO = require('../common/FileOperation.js');

describe("Exporting configura52tion of the organisation", function () {
    // var fileToOpen = '..//Users/piyush.jeswani/Bare-Escentuals-5455-2018-08-23-15-08.json';
    it("Exporting configuration of the organisation", function () {

        loginPage.openBrowser();
        loginPage.enterLogin(credentials.username, credentials.password);
        loginPage.clickSubmitBtn();

        homePage.clickAdminDropDown();
        homePage.clickAdminOptionInDropDown();

        organisationPage.enterSiteName(organisation.sitename);
        organisationPage.clickExportButton();

        browser.sleep(3000);
        // browser.actions().keyDown(protractor.Key.CONTROL).sendKeys('t').perform();
        // browser.actions().sendKeys(protractor.Key.CONTROL +'t').perform();
        // browser.sleep(10000);
        // common.newWindow();
        // browser.get('file:///C:/Users/piyush.jeswani/*.json');
        // browser.sleep(10000);
        // C:\Users\piyush.jeswani\Downloads\Bare-Escentuals-5455-2018-08-23-15-08.json
        fileIO.readAFile();
    });
});