const deviceDashboardComponent = require('../components/DeviceDashboard/DeviceDashboardComponent.js');
const common = require('../operations/CommonOperation.js');

module.exports = {
settingOption:function(){
deviceDashboardComponent.clickSetting();
},
checkAllSiteInfoIsPresentOnLandingPage:function(){    
    // browser.sleep(5000);
    deviceDashboardComponent.validateSiteDetailsExist();

    /*.then(function(text){
        expect(text).toBe(true)
        })*/
}
};