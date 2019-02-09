const loginPage = require('../operations/LoginOperations.js');
var env = require( '../../env.js');
const data = require('../resources/ON702.json');
// const devicePage = require('../operations/deviceListPageOperation.js');
// const settingsPage = require('../operations/settingsPageOperation.js');
const deviceSetting = require('../components/DeviceSetting/DeviceDisplayComponents.js')
const deviceTab = "DEVICE SETTINGS";
describe("Scenario to test flow for Zones Creation", function () {
    it("Create Zones and Edit Them", function () {    

        Promise.all([
            loginPage.openBrowser(env.controlPanelUrl),
            loginPage.enterLoginControlPanel(data.controlPanel.user, data.controlPanel.password),
            loginPage.clickLoginBtn(),   
            browser.sleep(3000),         
            element(by.css(".site-summary .material-icons")).click(),
            browser.sleep(10000),
            element(by.cssContainingText(".mat-tab-label.mat-ripple.ng-star-inserted .mat-tab-label-content",deviceTab)).click(),
            browser.sleep(3000),
            deviceSetting.getAllDeviceId_OrbitDevices(),
            browser.sleep(10000),
            deviceSetting.clickCreateBtn(),
            browser.sleep(5000),
            deviceSetting.chooseOrbitOption(),
            browser.sleep(10000)


            

            
        ]);
    })
})