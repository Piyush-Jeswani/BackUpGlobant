const organizationPage = require('../../Stan/operations/organizationOperation.js');
const loginPage = require('../../Stan/operations/LoginOperations.js');
const homePage = require('../../Stan/operations/homePageOperation.js');
const dataValues = require('../../Stan/resources/ON94.json');
const env = require( '../../../env.js');

describe('As a customer, one can see Occupancy Metric for Real Time Data', function(){
    
    fit('Validating the visibility of Occupancy Metric in drop down and graph', function() {        
        loginPage.loginSuccessful_Stan(dataValues.credentials.username, dataValues.credentials.password);
        homePage.selectAdminOption();
        organizationPage.selectOrganizationToEdit(dataValues.organisation.org_name);
        organizationPage.goToAdvancedOptions();
        organizationPage.selectMetricInAdvanceOption(dataValues.real_traffic_subscription,dataValues.real_traffic_subscription_status_ON);
        organizationPage.selectMetricInAdvanceOption(dataValues.occupancy_subscription,dataValues.occupancy_subscription_status_ON);
        homePage.selectAnalyticsOption() ;
        homePage.selectSite(dataValues.organisation.sitename); 
        homePage.showRealTimeData();
        homePage.verifyRealTimeData_Dropdown_Options(dataValues.dropdown_optiontobeValidated);

        //----Real time data is not available currently------
        // homePage.verifyOptionIsSelected(dataValues.dropdown_optiontobeValidated);
       // homePage.countMarkersInGraph();

    });
});