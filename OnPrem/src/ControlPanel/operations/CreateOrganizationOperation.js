


const commonOperation = require("../operations/CommonOperation.js");
const createOrganizationCom = require('../components/CreateOrganizationComponents.js');
const dataValues = require('../resources/ON1005.json');

module.exports = {


    verifyCreateOrganizationComponents:function(){
        commonOperation.customWait_visibilityOf(createOrganizationCom.create_organization_btn,10000);
        //Title
        expect(createOrganizationCom.getTitle().getText()).toBe(dataValues.labels.title);
        //expect(createOrganizationCom.getSubTitle().getText()).toBe("");
        expect(createOrganizationCom.getOrgSettingLabel().getText()).toBe(dataValues.labels.org_settings);
        expect(createOrganizationCom.getFormatSettingLabel().getText()).toBe(dataValues.labels.format_settings);
        expect(createOrganizationCom.getSubscriptionLabel().getText()).toBe(dataValues.labels.subscription);


        //Labels
        expect(createOrganizationCom.getLabel(dataValues.labels.org_name).isDisplayed()).toBe(true);
        expect(createOrganizationCom.getLabel(dataValues.labels.org_id).isDisplayed()).toBe(true);
        expect(createOrganizationCom.getLabel(dataValues.labels.org_type).isDisplayed()).toBe(true);
        expect(createOrganizationCom.getLabelsInsideDiv(dataValues.labels.org_format).isDisplayed()).toBe(true);
        expect(createOrganizationCom.getLabel(dataValues.labels.date_format).isDisplayed()).toBe(true);
        expect(createOrganizationCom.getLabel(dataValues.labels.calendar_format).isDisplayed()).toBe(true);
        expect(createOrganizationCom.getLabel(dataValues.labels.locale).isDisplayed()).toBe(true);
        expect(createOrganizationCom.getLabelsInsideDiv(dataValues.labels.time_format).isDisplayed()).toBe(true);
        expect(createOrganizationCom.getLabelsInsideDiv(dataValues.labels.number_format).isDisplayed()).toBe(true);
        expect(createOrganizationCom.getLabelsInsideDiv(dataValues.labels.enter_exits).isDisplayed()).toBe(true);
        
        

    },

    fillOrganizationDetails:function(){
        createOrganizationCom.enterOrgName(dataValues.organization.org_name);
        createOrganizationCom.enterOrgId(dataValues.organization.org_id);
        createOrganizationCom.selectOrgType(dataValues.organization.org_type);
        createOrganizationCom.selectDateFormat(dataValues.organization.date_format);
        createOrganizationCom.selectCalendarFormat(dataValues.organization.calendar_format);
        createOrganizationCom.selectLocale(dataValues.organization.locale);
        createOrganizationCom.selectTimeFormat(dataValues.organization.time_format);
        createOrganizationCom.selectNumberFormat(dataValues.organization.number_format);
        createOrganizationCom.selectEnterExit(dataValues.organization.enter_exit); 
        createOrganizationCom.enablePerimeter();
        createOrganizationCom.enableRealTimeTraffic();
        createOrganizationCom.enableOccupancy();
    },

    logoutOfApplication:function(){
        createOrganizationCom.clickLogout();
    }
};