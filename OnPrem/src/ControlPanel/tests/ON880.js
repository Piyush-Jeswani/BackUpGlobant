const loginPage = require('../operations/LoginOperations.js');
const data = require('../resources/ON880.json');
// const deviceList = require('../operations/DeviceListPageOperation.js')
const common = require('../operations/CommonOperation.js')
//Temporary
const deviceListOperation = require('../operations/DeviceListOperation.js')
//temporary
describe("Snapshot Functionality",function(){
    it("Validate the snapshots in UI and DB",function(){
        loginPage.loginSuccessful_ControlPanel(data.credentials.valid.user, data.credentials.valid.password);
        common.waitForElementVisibility()
        browser.sleep(5000);
        // deviceList.clickSnapShotForDevice();
        deviceListOperation.clickSnapshot();
        browser.sleep(10000);
    })
})