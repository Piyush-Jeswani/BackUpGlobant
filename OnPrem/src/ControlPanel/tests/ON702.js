const loginPage = require('../operations/LoginOperations.js');
const data = require('../resources/ON702.json');
const cong = require('../operations/CongratulationOperation.js');
const createOrgAction = require('../../ControlPanel/operations/DBOrganizationOperation.js')
const editSiteAction = require('../operations/editSiteSettingOperation.js')
const env = require( '../../../env.js');
const orgDetails = require('../resources/orgDetails.js')
const siteDetails = require('../resources/siteDetails.js')
var demoValid = require('../../../Practise/demoValid.js');
var siteData = require('../../../Practise/siteData.js');

demoValid = new demoValid();
siteData = new siteData();
const deviceDash = require('../operations/DeviceDashboardOperation.js');
const settingObj = require('../operations/settingsPageOperation.js');

describe("Scenario To Test All Values From UI and DB - ON739", function () {
    it("Read Organization and Read Site", function () {    

        Promise.all([            
            loginPage.loginSuccessful_ControlPanel(data.credentials.valid.user, data.credentials.valid.password),             
            deviceDash.settingOption(),    
            settingObj.clickOrganizationToEdit(), 
            /*This is where we read Organization Details from UI as well DB in common Json */ 
            createOrgAction.readAllOrganizationDetails().then(function(){
                console.log("------------------ORGANIZATION------------------------")                
                var allValues = Object.values(orgDetails);
                // console.log(" For Demo :AllOrganizationValues: ", allValues);
            }),
            demoValid.getOrgDetailsFromMongo(),
            createOrgAction.closeOrganizationForm(),   
            /*This is where we read Site Details from UI as well DB in common Json */
            siteData.getSiteDetailsFromMongo(),
            settingObj.clickSiteToEdit(),            
            editSiteAction.readAllSiteDetails().then(function(){
                var allValues = Object.values(siteDetails);
                console.log("------------------------SITE----------------------------")       
                // console.log(" For Demo :AllSiteValues: ", allValues);
            }),
            

        ]);       
    })

    it("Make Validations for Db and UI",function(){        

        expect(orgDetails.orgName.toLowerCase).toBe(orgDetails.res.name.toLowerCase);
        expect(orgDetails.orgType).toBe(orgDetails.res.portal_settings.organization_type);
        expect(orgDetails.orgFormat).toBe(orgDetails.res.portal_settings.organization_format);

        expect(orgDetails.dateFormat).toContain(orgDetails.res.localization.date_format.mask);
        expect(orgDetails.calendarFormat).toBe(orgDetails.res.localization.calendar_format.format);
        expect(orgDetails.Locale).toBe(orgDetails.res.localization.locale);
        expect(orgDetails.timeFormat).toBe(orgDetails.res.localization.time_format.format);
        expect(orgDetails.decimal_seperator).toBe(orgDetails.res.localization.number_format.decimal_separator);
        expect(orgDetails.thousands_seperator).toBe(orgDetails.res.localization.number_format.thousands_separator);

        expect(orgDetails.entersExits).toBe(orgDetails.res.portal_settings.enter_exit);
        expect(orgDetails.realtime).toBe(orgDetails.res.subscriptions.realtime_traffic);
        expect(orgDetails.occupancy).toBe(orgDetails.res.subscriptions.occupancy);

        expect(siteDetails.siteName.toLowerCase).toBe(siteDetails.res.name.toLowerCase);
        expect(parseInt(siteDetails.siteId)).toBe(siteDetails.res.site_id);
        expect(siteDetails.custId).toBe(siteDetails.res.customer_site_id);
        expect(siteDetails.reportingName).toBe(siteDetails.res.report_name);
        expect(siteDetails.siteType).toBe(siteDetails.res.type);
        expect(siteDetails.currency).toBe(siteDetails.res.currency);
        expect(parseInt(siteDetails.siteMidnight)).toBe(siteDetails.res.site_midnight_hour);
        expect(siteDetails.res.daily_acquisition_time).toContain(siteDetails.dailyAcquisitionHr); 
        expect(siteDetails.res.daily_acquisition_time).toContain(siteDetails.dailyAcquisitionMin);
    })
})