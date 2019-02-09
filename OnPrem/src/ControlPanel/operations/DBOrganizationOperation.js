var commonOperation = require("../operations/CommonOperation.js");
var createOrgCom = require('../components/CreateOrgComponents.js');
var createOrgCom = new createOrgCom();

var createOrganization = function(){


    
    // describe("Organization Details in Control Panel",function(){

    //     it('Get All Organization Details', () => {
    //         admin.getSiteCountFromTable().then(text => {
    //         admin.setParamSiteCount(text);
    //         });
    //         });

            

    // });
    // var orgDetails = new Array();
    

    this.readAllOrganizationDetails = function(){     
         return createOrgCom.getOrgDetailsAndSetValue();   
    }

    this.closeOrganizationForm = function(){
        return createOrgCom.closeOrgDetailsForm();   
    }
};

module.exports = new createOrganization();