const protractor_1 = require("protractor");
const loginPage = require('../operations/LoginOperations.js');
const homePage = require('../operations/homePageOperation.js');
const dataValues = require('../resources/ON167.json');
const organizationPage = require('../operations/organizationOperation.js');
const EC = protractor_1.ExpectedConditions;
const orgComponent = require('../components/OrganizationComponents.js');

var icon = $(".occupancy-info");
var isIconVisible = EC.visibilityOf(icon);

describe('As a customer, one can see Occupancy Metric for Real Time Data', function(){

    it('Validating the visibility of Occupancy Metric', function(){
        loginPage.loginSuccessful_Stan(dataValues.credentials.username, dataValues.credentials.password);
        homePage.selectAdminOption();
        organizationPage.selectOrganizationToEdit(dataValues.organisation.org_name);
        organizationPage.selectMetricInAdvanceOption(dataValues.real_traffic_subscription,dataValues.real_traffic_subscription_status);
        organizationPage.selectMetricInAdvanceOption(dataValues.occupancy_subscription,dataValues.occupancy_subscription_status);
        homePage.selectAnalyticsOption() ;
        homePage.selectSite(dataValues.organisation.sitename); 
    // if(organisationPage.checkRealTimeIsOff()){
        //     organisationPage.switchRealTimeON();
        // }
        // if(organisationPage.checkOccupancyIsOff()){
        //     organisationPage.switchOccupancyON();
        // }
        //organizationPage.clickSaveBtn();
        

       // browser.sleep(5000);
        // homePage.clickAdminDropDown();
        // homePage.clickAnalyticsOptionInDropDown();  
        // homePage.clickSiteDropdown();
        // //homePage.selectSiteName(organisation.propertyName);
        // homePage.selectSiteByName("8 - Guns Vaskor");
        homePage.clickRealTimeData();

        // Validating Occupancy markers Starts
        sizeBeforeOccupancy = homePage.getCountOfTotalMarkers();
        homePage.clickRealTimeDataDropDown();
        homePage.clickOccupancyInDropDown();
        sizePostOccupancy = homePage.getCountOfTotalMarkers();
        expect(sizePostOccupancy).toBeGreaterThan(sizeBeforeOccupancy);
        // Validating Occupancy markers Ends

        // Validate time interval Starts
        homePage.clickTimeIcon();
        homePage.clickOptionForTimeinterval(timeInterval.minutes);
        expect(homePage.getCountOfTotalMarkers).toBe(2);              
        // Validate time interval Ends


        // Start 
        homePage.clickShowTableButton();
        index_traffic = homePage.getindexOfTableHeaderRealTime(tableHeader.traffic);
        index_occupancy = homePage.getindexOfTableHeaderRealTime(tableHeader.occupancy);
        index_sales = homePage.getindexOfTableHeaderRealTime(tableHeader.sales);
        expect(index_sales).toBe(index_occupancy+1);
        expect(index_occupancy).toBe(index_traffic+1);
        // End

        // Removing Occupancy to off and Checking it now 
        homePage.clickAdminDropDown();
        homePage.clickAdminOptionInDropDown();
        organisationPage.enterSiteName(organisation.sitename);
        organisationPage.clickEditBtn();
        browser.sleep(15000);
        organisationPage.clickAdvancedOption();
        browser.wait(isIconVisible,150000);


        organisationPage.switchOccupancyOFF();
        organisationPage.switchRealTimeOFF();
        organisationPage.clickSaveBtn();
        browser.sleep(5000);
       
        homePage.clickAdminDropDown();
        homePage.clickAnalyticsOptionInDropDown();        
        homePage.clickSiteDropDown();
        homePage.selectSiteName(organisation.propertyName);
        homePage.clickRealTimeData();

        homePage.clickRealTimeDataDropDown();
        expect(homePage.checkIfItemPresentInRealTimeDropDown('Occupancy')).toBe(false);




    });
});