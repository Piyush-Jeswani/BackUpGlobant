var loginPage = require('../Tyco/loginPage.js');
var dataValues = require('../Tyco/dataValues.js');
var homePage = require('../../Stan/operations/homePageOperation.js');
var protractor_1 = require("protractor");

var EC = protractor_1.ExpectedConditions;
var icon = $(".occupancy-info");
var isIconVisible = EC.visibilityOf(icon);

describe('As a customer, one can see 1 hour intervals Displayed for Real Time Data', function(){
    it('Validating the visibility of 1 hour intervals', function(){

       loginPage.loginSuccessful_Stan(dataValues.credentials.username, dataValues.credentials.password);
        homePage.selectAnalyticsOption();  
        homePage.selectSite(organisation.propertyName);
        homePage.showRealTimeData();


        // homePage.clickTimeIcon();
        homePage.verifyTime_Options(timeInterval.minutes)
        // homePage.clickOptionForTimeinterval(timeInterval.minutes);
        expect(homePage.getCountOfTotalMarkers).toBe(1);  
        homePage.clickTimeIcon();
        homePage.clickOptionForTimeinterval(timeInterval.hour);
        expect(homePage.getCountOfTotalMarkers).toBe(1);          


    });
});