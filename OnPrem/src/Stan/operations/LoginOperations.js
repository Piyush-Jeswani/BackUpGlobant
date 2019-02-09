var loginComponents = require('../components/LoginComponents.js');
var loginData = require('../resources/LoginData.json')
const env = require( '../../../env.js');

var loginPage = function(){

    this.openBrowser = function(url){
        browser.driver.manage().window().maximize();
        browser.get(url);  
    };
    this.loginSuccessful_Stan = function(userName,passWord){
        browser.get(env.baseUrl); 
        browser.driver.manage().window().maximize();
        loginComponents.loginToApplication(userName,passWord);
        browser.wait(protractor.ExpectedConditions.visibilityOf(element(by.css('.alert.alert-info')), 15000));
     };
            
        this.enterLogin = function(username, password){
            loginComponents.userName.sendKeys(username);
            loginComponents.password.sendKeys(password);
        };

        this.enterLoginControlPanel = function(url, username, password){
            this.openBrowser(url);
            loginComponents.userNameCP.sendKeys(username);
            loginComponents.passwordCP.sendKeys(password);
            this.clickLoginBtn();
        };
    
        this.clickSubmitBtn = function(){
            loginComponents.submitbtn.click();
            
            // Add Expected COndition For Wait - Analytics Element
        };

        this.clickLoginBtn = function(){
            loginComponents.loginCP.click();           
        };
    
    };
    module.exports = new loginPage();
    