var commonOperation = require("../operations/CommonOperation.js");
var deviceSumCom = require('../components/DeviceDashboard/DeviceSummaryComponents.js');
var deviceSumCom = new deviceSumCom();

var deviceSummary = function(){

    this.readAllDeviceDetails = function(){     
        return deviceSumCom.getDeviceDetailsAndSetValue();   
   }

//    this.checkAllSiteInfoIsPresentOnLandingPage:function(){
//        return deviceSumCom.validateSiteDetailsExist();
//    }

  

//    this.closeOrganizationForm = function(){
//        return createOrgCom.closeOrgDetailsForm();   
//    }
};

module.exports = new deviceSummary();