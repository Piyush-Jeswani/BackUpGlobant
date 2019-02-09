
const organizationPage = require('../operations/organizationOperation.js');
const protractor_1 = require("protractor");
const loginPage = require('../operations/LoginOperations.js');
const homePage = require('../operations/homePageOperation.js');
const dataValues = require('../resources/ON167.json');
const env = require( '../../env.js');
const EC = protractor_1.ExpectedConditions;


describe('Validate that User can see data in right format from Traffic Table (Story # ON167)', function(){

    it('Validating the right format', function(){   

        loginPage.loginSuccessful_Stan(dataValues.credentials.username, dataValues.credentials.password);
        homePage.AddOrganizationandSite(dataValues.organisation.sitename,dataValues.organisation.propertyName);
        
        homePage.SelectValueinTrafficDropDown("Conversion","%");
        homePage.SelectValueinTrafficDropDown("Sales","$");
        homePage.SelectValueinTrafficDropDown("ATS","$");
       

        
        // Peel off     

        // homePage.clickTrafficDropDown();      
        // browser.sleep(8000);
        // homePage.clickOptionForTraffic(5);//trafficDropDownOption.peelOff
        // value = homePage.getValueFromSummaryContainer();
        // value.then(function(txt){
        //     console.log("Printing Peel Off value  ="+txt);            
        //     subs = String(txt);
        //     console.log("Printing Substring Peel Off  ="+subs.substring(txt.length-1,txt.length));            
        //     substr = subs.substring(txt.length-1,txt.length);
        //     expect(substr).toBe("%");
        // });  



        //ADS 

        // homePage.clickTrafficDropDown();      
        // browser.sleep(8000);
        // homePage.clickOptionForTraffic(3);//trafficDropDownOption.sales
        // value = homePage.getValueFromSummaryContainer();
        // value.then(function(txt){
        //     console.log("Printing ADS value  ="+txt);            
        //     subs = String(txt);
        //     console.log("Printing Substring ADS ="+subs.substring(0,1));            
        //     substr = subs.substring(0,1);
        //     expect(substr).toBe("$");
        // });  

        //Star 

        // homePage.clickTrafficDropDown();      
        // browser.sleep(8000);
        // homePage.clickOptionForTraffic(4);//trafficDropDownOption.sales
        // value = homePage.getValueFromSummaryContainer();
        // value.then(function(txt){
        //     console.log("Printing Star value  ="+txt);  
        //     expect(substr.length).toBe(1);
        // });  



       

    });

});