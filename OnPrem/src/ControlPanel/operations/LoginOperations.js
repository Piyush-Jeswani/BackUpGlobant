const loginComponents = require('../components/LoginComponents.js');
const loginData = require('../resources/LoginData.json')
var env = require( '../../../env.js');
module.exports = {

         loginSuccessful_Stan:function(userName,passWord){
            browser.get(env.baseUrl); 
            browser.driver.manage().window().maximize();
            loginComponents.loginToApplication(userName,passWord);
            browser.wait(protractor.ExpectedConditions.visibilityOf(element(by.css('.alert.alert-info')), 15000));
// remove css and create common wait
         },
    
    
       loginSuccessful_ControlPanel : function(username, password){
            browser.driver.manage().window().maximize();
            browser.get(env.controlPanelUrl); 
            loginComponents.loginToApplication_CP(username,password)
            // loginComponents.userNameCP.sendKeys(username);
            // loginComponents.passwordCP.sendKeys(password);
            // loginComponents.loginCP.click(); 
        }
    
    
    };

    