

const env = require( '../../env.js');
const protractor_1 = require("protractor");
const loginPage = require('../operations/LoginOperations.js');
const deviceDashboardPage = require('../operations/DeviceDashboardOperation.js');
const dataValues = require('../resources/ON883.json');
const settingsPage = require('../operations/SettingsOperation.js');
const zoneEntrancePage = require('../operations/ControlPanelSettings/Zone/ZoneEntranceOperation.js');
const editEntrancePage = require('../operations/ControlPanelSettings/Zone/EditEntranceOperation.js');
const editZonePage = require('../operations/ControlPanelSettings/Zone/EditZoneOperation.js');
var EC = protractor_1.ExpectedConditions;
describe("Testing the application", function(){

    it("verify Organization Name, Organization ID, Organization Type and an option to edit the organization and three tabs", function(){
      loginPage.loginSuccessful_ControlPanel(dataValues.credentials.username, dataValues.credentials.password);
      deviceDashboardPage.settingOption();
      settingsPage.verifyOrganizationComponents("THE MALL LTD","ID","54998","ORGANIZATION TYPE","MALL","SITE SETTINGS","ZONE AND ENTRANCE","DEVICE SETTINGS","EDIT")
      settingsPage.selectSettingTab("ZONE AND ENTRANCE");

    })

       it("verify Zone and Entrance", function(){
        loginPage.loginSuccessful_ControlPanel(dataValues.credentials.username, dataValues.credentials.password);
        deviceDashboardPage.settingOption();
        settingsPage.selectSettingTab("ZONE AND ENTRANCE");
        zoneEntrancePage.verifyZoneEntranceComponent("create zone","create entrance");
      
  
         })
  


       fit("Verify Edit Zone", function(){
        loginPage.loginSuccessful_ControlPanel(dataValues.credentials.username, dataValues.credentials.password);
        deviceDashboardPage.settingOption();
        settingsPage.selectSettingTab("ZONE AND ENTRANCE");
        zoneEntrancePage.clickEditZone();
        editZonePage.verifyEditZoneComponent();
        })

        it("Verify Edit Entrance", function(){
            loginPage.loginSuccessful_ControlPanel(dataValues.credentials.username, dataValues.credentials.password);
            deviceDashboardPage.settingOption();
            settingsPage.selectSettingTab("ZONE AND ENTRANCE");
            zoneEntrancePage.clickEditEntrance();
            editEntrancePage.verifyEditEntranceComponent();
            browser.sleep(15000);
             })
    

    })