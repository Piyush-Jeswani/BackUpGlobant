const env = require( '../../../env.js');
const protractor_1 = require("protractor");
const loginPage = require('../operations/LoginOperations.js');
const dataValues = require('../../ControlPanel/resources/ON1005.json');
const EC = protractor_1.ExpectedConditions;
const wizardPage = require('../../ControlPanel/operations/WizardOperation.js');
const congratsPage = require('../../ControlPanel/operations/CongratulationOperation.js');
const createOrganizationPage = require('../../ControlPanel/operations/CreateOrganizationOperation.js');
const createSitePage = require('../../ControlPanel/operations/CreateSiteOperation.js');



const deviceComp = require('../../ControlPanel/components/DeviceDashboard/DeviceSummaryComponents.js');


// describe("1 Testing the application", function(){

//     beforeEach(function () {
//         browser.ignoreSynchronization = false;
//         browser.manage().timeouts().implicitlyWait(5000);
//         });
//     it("verify Create Organization Components", function(){  
//             loginPage.loginSuccessful_ControlPanel(dataValues.credentials.username, dataValues.credentials.password);   
//     })
// })

// describe("2 Testing the application", function(){

//     beforeEach(function () {
//         browser.ignoreSynchronization = false;
//         browser.manage().timeouts().implicitlyWait(5000);
//         });
//     it("verify Create Organization Components", function(){    
//             wizardPage.clickLetsStart();           
//     })
// })

// describe("3 No Organization Created", function(){

//     beforeEach(function () {
//         browser.ignoreSynchronization = true;
//         });
//     it("verify Create Organization Components", function(){  
//             createOrganizationPage.verifyCreateOrganizationComponents();        
            // createOrganizationPage.fillOrganizationDetails();  
//             createOrganizationPage.logoutOfApplication();
//     })

// })

// describe("4 login to site where Organization is Created", function(){

//     beforeEach(function () {
//         browser.ignoreSynchronization = false;
//         browser.manage().timeouts().implicitlyWait(5000);
//         });
//     it("verify Create Organization Components", function(){   
//             loginPage.loginSuccessful_ControlPanel(dataValues.credentials.username1, dataValues.credentials.password);              
//     })

// })

// describe("5 Congratulations Screen", function(){

//     beforeEach(function () {
//         browser.ignoreSynchronization = false;
//         browser.manage().timeouts().implicitlyWait(5000);
//         });
//     it("verify Create Organization Components", function(){    
//         congratsPage.verifyCongratulationComponents();
//         congratsPage.clickCreateNewSiteBtn();   
//     })
// })

// describe("6 Site Creation", function(){

//     beforeEach(function () {
//         browser.ignoreSynchronization = true;
//         });
//     it("verify Create Organization Components", function(){  
//         browser.sleep(5000);
        // createSitePage.fillSiteDetails();     
//         browser.sleep(5000);              
//     })

// })

describe("7 login to where device dashboard is visible", function(){

    beforeEach(function () {
        browser.ignoreSynchronization = false;
        browser.manage().timeouts().implicitlyWait(5000);
        });
    it("verify Create Organization Components", function(){   
            loginPage.loginSuccessful_ControlPanel(dataValues.credentials.username1, dataValues.credentials.password);           
            browser.sleep(5000);   
    })

})

describe("8 Device Dashboard", function(){

    beforeEach(function () {
        browser.ignoreSynchronization = false;
        browser.manage().timeouts().implicitlyWait(5000);
        });
    it("verify Create Organization Components", function(){    
        var res=[]
         res= deviceComp.getAllDeviceNames(0);
         res.map(function(ele,index){
            // console.log("gggggggggggggggggggggg ggggggggggggg -----"+ele);
         })
         console.log("Printing from script :"+data.deviceDetails.deviceName);
         
        browser.sleep(5000);   
    })
})