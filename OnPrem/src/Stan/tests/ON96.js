const organizationPage = require('../operations/organizationOperation.js');
const protractor_1 = require("protractor");
const loginPage = require('../operations/LoginOperations.js');
const homePage = require('../operations/homePageOperation.js');
const dataValues = require('../resources/ON96.json');
const env = require( '../../env.js');
const EC = protractor_1.ExpectedConditions;

describe("As a customer, one can see Occupancy Metric for Real Time Screen", function () {
  it("Validating the visibility of Occupancy Metric", function () {

    loginPage.loginSuccessful_Stan(dataValues.credentials.username, dataValues.credentials.password);
        homePage.selectAdminOption();
        organizationPage.selectOrganizationToEdit(dataValues.organisation.org_name);
        organizationPage.selectMetricInAdvanceOption(dataValues.real_traffic_subscription,dataValues.real_traffic_subscription_status_ON);
        organizationPage.selectMetricInAdvanceOption(dataValues.occupancy_subscription,dataValues.occupancy_subscription_status_ON);
        homePage.selectAnalyticsOption() ;
        homePage.selectSite(dataValues.organisation.sitename); 
        homePage.showRealTimeData();
        homePage.verifyRealTimeData_Dropdown_Options(dataValues.dropdown_optiontobeValidated);
        homePage.verifyTime_Options(dataValues.time_optiontobeValidated);
		
		// Flow is not yet completed
		
        homePage.logout();
  });
});
