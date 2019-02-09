
var getStarted = function(){

    this.createNewSite = element(by.buttonText("Create new site"));
    this.editOrganization = element(by.buttonText("Edit organization"));
    this.congratulationText = element(by.css("[class*='success-card'] [class='shoppertrak']"));

};

module.exports = new getStarted();