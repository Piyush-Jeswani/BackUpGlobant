const protractor_1 = require("protractor");
const loginPage = require('../operations/LoginOperations.js');
const homePage = require('../operations/homePageOperation.js');
const dataValues = require('../resources/ON3.json');
const env = require( '../../env.js');
var EC = protractor_1.ExpectedConditions;

// ON3 and ON4

describe("ON-169 Testing the application", function(){

    it("1 Custom Dashboard test", function(){
      loginPage.loginSuccessful_Stan(dataValues.credentials.username, dataValues.credentials.password);
        homePage.AddOrganizationandSite(dataValues.organisation.org_name,dataValues.organisation.sitename);
        homePage.GotoCustomDashboard(dataValues.dashboard_name);
        homePage.setDefaultDashboard(dataValues.dashboard_label);
        homePage.logout();  
    })


    it("2 Custom Dashboard test", function(){
        console.log("Entering SECOND spec block");
        browser.get("http://tgl-onprem11.rctanalytics.com/#/");
        // browser.waitForAngular();
        // browser.sleep(5000);
        // browser.waitForAngularEnabled(false);
        browser.wait(EC.visibilityOf(element(by.model("vm.username"))),500000);
        element(by.model("vm.username")).sendKeys("development");
        element(by.model("vm.password")).sendKeys("myD3v3l0pm3ntP4ssw0rd!");
        element(by.name("submitButton")).click();
        console.log("submitButton");

        // browser.waitForAngular();

        
        browser.sleep(40000);
       // browser.waitForAngular();
        browser.wait(EC.visibilityOf(element(by.css('#navbar #organisation-picker'))),200000);
        browser.executeScript("document.getElementById('organisation-picker').focus();");
        browser.executeScript("document.getElementById('organisation-picker').click();");
        // element(by.css('#navbar #organisation-picker')).click();
        
        // browser.wait(EC.visibilityOf(element(by.css('#navbar #organisation-picker'))),20000).then(function(){
        //     //browser.executeScript("document.getElementById('organisation-picker').focus();");
        //     //browser.executeScript("document.getElementById('organisation-picker').click();");
        //     element(by.css('#navbar #organisation-picker')).click();
        // });

       
        //browser.waitForAngular();

        element.all(by.css("li[ng-click='onItemSelect(item)']")).map(function(ele, index){
            if(index==2){
                ele.click();
            }
        })
        console.log("onItemSelect");

        //browser.sleep(150000);
        browser.sleep(40000);

        element(by.css(".dashboard__title span")).getText().then(function(text){
            console.log("Printing text :: "+text);
            //expect(text).toBe("Demo Toggle Prueba Default");
        })
        // expect(element(by.css(".dashboard__title span")).getText()).toBe()
        console.log("dashboard__title span");
        // browser.waitForAngular();
        browser.sleep(90000);
        browser.executeScript("document.querySelector('.edit-custom-dashboard-button-top-right.ng-scope').click();");

        //.edit-custom-dashboard-button-top-right.ng-scope
        // element(by.css(".edit-custom-dashboard-button-top-right.ng-scope")).click();
        // element(by.css(".edit-custom-dashboard-button-top-right.ng-scope")).isDisplayed().then(function(text){
        //     expect(text).toBe(true);
        //     if(text==true){ 
        //         element(by.css(".edit-custom-dashboard-button-top-right.ng-scope")).click();
        //     }
        // })

        // element(by.css(".dashboard__title__buttons span.ui-switch")).isDisplayed().then(function(text){
        //     expect(text).toBe(true);
        // })
        element(by.css(".dashboard__title__buttons span.ui-switch")).click();
        
        // browser.sleep(5000);
        element(by.css(".btn.btn-primary")).click();
        // browser.sleep(5000);    
        browser.waitForAngularEnabled(false);    
        browser.wait(EC.presenceOf(element(by.css('.saveMessage.ng-hide'))),500000);
        //Logout functionality
        browser.sleep(100000);
        element(by.css(".nav-login-link")).click();
        browser.wait(EC.visibilityOf(element(by.css('.nav-logout'))),50000);
        
        element(by.css(".nav-logout")).click();

    })
    it("Testing ---- Custom Dashboard test", function(){});

    it("3 Custom Dashboard test", function(){
        console.log("Entering THIRD spec block");
        browser.get("http://tgl-onprem11.rctanalytics.com/#/");
        // browser.waitForAngular();
        browser.wait(EC.visibilityOf(element(by.model("vm.username"))),500000);
        element(by.model("vm.username")).sendKeys("development");
        element(by.model("vm.password")).sendKeys("myD3v3l0pm3ntP4ssw0rd!");
        element(by.name("submitButton")).click();

      
        browser.sleep(15000);

        element(by.css(".alert.alert-info")).getText().then(function(text){
            expect(text).toBe("This organization has no properties.");
        })        
        element(by.css(".navbar-brand")).getText().then(function(text){
            expect(text).toBe("ShopperTrak");
        })
        element(by.css(".nav-app-label")).getText().then(function(text){
            expect(text).toBe("Analytics");
        })
        element(by.css("#organisation-picker span[ng-if='currentItem']")).getText().then(function(text){
            expect(text).toBe("PORTO VENERE, S.A.");
        })
        
        browser.wait(EC.visibilityOf(element(by.css('#navbar #organisation-picker'))),200000);
        browser.executeScript("document.getElementById('organisation-picker').focus();");
        browser.executeScript("document.getElementById('organisation-picker').click();");
        //element(by.css("#organisation-picker']")).click();

        element.all(by.css("li[ng-click='onItemSelect(item)']")).map(function(ele, index){
            if(index==2){
                ele.click();
            }
        })

        browser.sleep(5000);


        element(by.css(".clearfix.analytics-header h1")).getText().then(function(text){
            expect(text).toBe("Site 1080042762");
        })

        // browser.waitForAngularEnabled(false);
        element.all(by.css(".analytics-menu-item--custom-dashboard")).map(function(ele, index){
            if(index==0){
                ele.click();
            }
        })

    })


})