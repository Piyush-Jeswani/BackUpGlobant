const commonOperation = require("../operations/CommonOperation.js");
const createSiteCom = require('../components/SiteDetailsComponents.js');
const dataValues = require('../resources/ON1005.json');


module.exports = {

    fillSiteDetails:function(){
        console.log("Checking ----------------"+dataValues.sites.site_name);
        // createSiteCom.setSiteName(dataValues.sites.site_name);
        // createSiteCom.setSiteId(dataValues.sites.site_Id);
        // createSiteCom.setCustId(dataValues.sites.cust_Id);
        // createSiteCom.setReportingName(dataValues.sites.reportingName);
        // createSiteCom.setSiteType(dataValues.sites.siteType);
        // createSiteCom.setCurrencyType(dataValues.sites.currency);
        // createSiteCom.setSiteMidnightHour(dataValues.sites.siteMidnightHr);
        createSiteCom.setDailyAcquasitionHr(dataValues.sites.dailyAcquasitionHour);
        createSiteCom.setDailyAcquasitionMin(dataValues.sites.dailyAcquasitionMin);
        createSiteCom.setEffectiveDate(createSiteCom.getTodayDate());
        createSiteCom.setCompStartTime(createSiteCom.getTodayDate());
        createSiteCom.setTrafficStartDate(createSiteCom.getTodayDate());


        createSiteCom.setTimeZone(dataValues.sites.time_zone);
        createSiteCom.setStartTimeHr(dataValues.sites.start_time_Hr);
        createSiteCom.setStartTimeMin(dataValues.sites.start_time_Min);
        createSiteCom.setEndTimeHr(dataValues.sites.end_time_Hr);
        createSiteCom.setEndTimeMin(dataValues.sites.end_time_Min);
        createSiteCom.setCountry(dataValues.sites.country);
        createSiteCom.setAddress1(dataValues.sites.address1);
        createSiteCom.setAddress2(dataValues.sites.address2);
        createSiteCom.setPostalCode(dataValues.sites.postal_code);
        createSiteCom.setState(dataValues.sites.state);
        createSiteCom.setCity(dataValues.sites.city);
        createSiteCom.setlongitude(dataValues.sites.longitude);
        createSiteCom.setlatitude(dataValues.sites.latitude);
        createSiteCom.setType(dataValues.sites.type);


    }


};