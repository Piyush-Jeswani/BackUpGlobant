const loginPage = require('../../operations/LoginOperations.js');
const homePage = require('../../operations/homePageOperation.js');
const organisationPage = require('../../operations/organizationOperation.js');
const dataValues = require('../../resources/ON197.json');
var env = require( '../../../env.js');

describe("As a super user, validate occupancy metric is visible on Add Organization Page(Story#ON-197)", function () {
    beforeAll(function(){loginPage.openBrowser(env.baseUrl);})
    afterEach(function () {
        browser.getAllWindowHandles().then(function (handles) {
            if(handles.length>0){
                
                
                browser.get(env.baseUrl+"8706");
            }
            else{
                console.log(env.baseUrl);

                loginPage.openBrowser(env.baseUrl);
 
            }
        })
 })
    it("Occupancy on Add Organization Page", function () {

        // loginPage.openBrowser();
     //   loginPage.enterLogin(dataValues.credentials.username, dataValues.credentials.password);
      //  loginPage.clickSubmitBtn();

        homePage.clickAdminDropDown();
        homePage.clickAdminOptionInDropDown();
        homePage.clickAddOrganizationButton();

        organisationPage.switchRealTimeOFF();
        expect(organisationPage.checkOccupancyIsDisabled()).toBe(true);
        expect(organisationPage.checkIfOccupancyIconIsDisplayed()).toBe(true);
        browser.sleep(8000);
       
        browser.actions().mouseMove(element(by.css('.exclamation-mark.occupancy-info'))).perform().
            then(function(){
                browser.sleep(5000);
            }).
                then(function(){
                    expect(organisationPage.validateToolTipExists()).toBe(true);                    
                })
            
        expect(organisationPage.validateInfoOnToolTip()).toBe("To enable occupancy, you need to enable the Realtime Traffic button.");
        
        browser.sleep(10000);
        organisationPage.switchRealTimeON();
        browser.sleep(10000);

        expect(organisationPage.checkOccupancyIsDisabled()).toBe(false);
        expect(organisationPage.checkIfOccupancyIconIsDisplayed()).toBe(true);
        browser.actions().mouseMove(element(by.css('.exclamation-mark.occupancy-info'))).perform().
            then(function(){
                browser.sleep(5000);
            }).
                then(function(){
                    expect(organisationPage.validateToolTipExists()).toBe(true);                    
                })
        expect(organisationPage.validateInfoOnToolTip()).toBe("To enable occupancy, you need to enable the Realtime Traffic button.");

        organisationPage.switchOccupancyON();
    });
});