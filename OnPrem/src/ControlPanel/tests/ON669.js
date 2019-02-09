const loginPage = require('../operations/LoginOperations.js');
var env = require( '../../../env.js');
const deviceAction = require('../operations/DeviceSummaryOperation.js');
const deviceDashboard = require('../operations/DeviceDashboardOperation.js')
const deviceList = require('../operations/DeviceListOperation.js')
const data = require('../resources/ON669.json');
// var deviceDetails = require('../resources/devices.js');
// var siteData = require('../../../Practise/siteData.js');
// var siteData = new siteData();


describe("Validate values for Devices", function () {
    it("Validate UI and DB values for devices", function () {    

        Promise.all([
            loginPage.loginSuccessful_ControlPanel(data.credentials.valid.user, data.credentials.valid.password),
            //screen displays the site information
            // browser.sleep(100000),
            deviceDashboard.checkAllSiteInfoIsPresentOnLandingPage(),
            deviceList.validateElementsArePresent(),

          
            // browser.sleep(3000),
            // deviceAction.readAllDeviceDetails().then(function(){
            //     //console.log("values:",values)
            //     var allValues = Object.values(orgDetails);
            //     console.log(orgDetails," :AllDeviceValues: ", allValues);
            // }),
            // siteData.getSiteDetailsFromMongo()
        ]);       
    })
})