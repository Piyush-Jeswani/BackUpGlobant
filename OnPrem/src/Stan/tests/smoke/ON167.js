
const loginPage = require('../../operations/LoginOperations.js');
const homePage = require('../../operations/homePageOperation.js');
const dataValues = require('../../resources/ON167.json');
var env = require( '../../../env.js');

describe('Validate that User can see data in right format from Traffic Table (Story # ON167)', function(){

    beforeAll(function(){loginPage.openBrowser(env.baseUrl);})
    afterEach(function () {
        browser.getAllWindowHandles().then(function (handles) {
            if(handles.length>0){
                
                
                browser.get(env.baseUrl+"8706");
            }
            else{
                console.log(env.baseUrl);

                loginPage.openBrowser(env.baseUrl);
 
            }
        })
 })

    it('Validating the right format', function(){   

             
        loginPage.enterLogin(dataValues.credentials.username, dataValues.credentials.password);
        loginPage.clickSubmitBtn();        
        

        homePage.clickAdminDropDown();
        homePage.clickAnalyticsOptionInDropDown();             
        homePage.clickOrganisationDropDown();       
        homePage.selectSiteName(dataValues.organisation.sitename);       
        
        homePage.clickSiteDropDown();        
        homePage.selectSiteName(dataValues.organisation.propertyName); 

        // browser.executeScript('window.scrollBy(0,500);').then(function(){ 
        //     browser.sleep(10000);
        //     console.log('++++++SCROLLED UP+++++'); 
        // });

        // browser.executeScript('arguments[0].scrollIntoView()',homePage.getPeriodChart()).then(function(){
        //     browser.executeScript('arguments[0].scrollIntoView()',homePage.getTrafficDropDownBtn())
        //     browser.sleep(10000);
        //     homePage.clickTrafficDropDown();    
        //     homePage.clickOptionForTraffic(2);              
        // })   


        //Conversion
        homePage.clickTrafficDropDown();      
        browser.sleep(8000);
        homePage.clickOptionForTraffic(2);
        value = homePage.getValueFromSummaryContainer();
        var subs;
        var substr;

        value.then(function(txt){
            console.log("Printing Value conversion  ="+txt);            
            subs = String(txt);
            console.log("Printing Substring conversion  ="+subs.substring(txt.length-1,txt.length));
            substr = subs.substring(txt.length-1,txt.length);
            expect(substr).toBe("%");
        });     
       
        
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


        //Sales 
        homePage.clickTrafficDropDown();      
        browser.sleep(8000);
        homePage.clickOptionForTraffic(1);//trafficDropDownOption.sales
        value = homePage.getValueFromSummaryContainer();
        value.then(function(txt){
            console.log("Printing Sales value  ="+txt);            
            subs = String(txt);
            console.log("Printing Substring Sales  ="+subs.substring(0,1));            
            substr = subs.substring(0,1);
            expect(substr).toBe("$");
        });  

        //ADS 

        homePage.clickTrafficDropDown();      
        browser.sleep(8000);
        homePage.clickOptionForTraffic(3);//trafficDropDownOption.sales
        value = homePage.getValueFromSummaryContainer();
        value.then(function(txt){
            console.log("Printing ADS value  ="+txt);            
            subs = String(txt);
            console.log("Printing Substring ADS ="+subs.substring(0,1));            
            substr = subs.substring(0,1);
            expect(substr).toBe("$");
        });  

        //Star 

        homePage.clickTrafficDropDown();      
        browser.sleep(8000);
        homePage.clickOptionForTraffic(4);//trafficDropDownOption.sales
        value = homePage.getValueFromSummaryContainer();
        value.then(function(txt){
            console.log("Printing Star value  ="+txt);  
            expect(substr.length).toBe(1);
        });  



       

    });

});