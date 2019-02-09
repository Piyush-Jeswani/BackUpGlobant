var commonOperation = require("../operations/CommonOperation.js");
var editSiteCom = require('../components/EditSiteComponents.js');
var editSiteCom = new editSiteCom();

var editSite = function(){

    this.readAllSiteDetails = function(){     
        return editSiteCom.getSiteDetailsAndSetValue();   
   }

   this.closeSiteDetailsForm = function(){
       return editSiteCom.closeSiteDetailsForm();   
   }
};

module.exports = new editSite();