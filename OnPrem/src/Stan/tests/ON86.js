var loginPage = require('../pages/loginPage.js');
var forgotPass = require('../pages/forgotPass.js');
var emailRec = require('../pages/emailRec.js');
describe('Forgot password link expired functionality', () => {
    it('Link expired functionality', () => {
        loginPage.openBrowser();
        var forgotLink = loginPage.getForgotText();
        expect(forgotLink).toBe("Forgot your password? Reset it here.");
        loginPage.clickForgotPasswordLink();

        var forgotLabel = forgotPass.getForgotPasswordLabel();
        expect(forgotLabel).toBe("Forgot Password?");
        forgotPass.enterUsername("e2eOnPrem");
        forgotPass.clickSendBtn();

        var receivedUsernameLabel = forgotPass.getReceivedUsername();
        expect(receivedUsernameLabel).toBe("Received username");

        var email = forgotPass.getEmailDisplayed();
        expect(email).toContain("@gmail.com");

        var backLogin = forgotPass.getBackToLogin();
        expect(backLogin).toBe("< Back to login");
        browser.waitForAngularEnabled(false);
        emailRec.openBrowser();

        emailRec.enterEmail("e2eonprem@gmail.com");
        emailRec.clickNextBtn();
        browser.sleep(5000);
        emailRec.enterPassword("Test123!@#");
        emailRec.clickPasswordNext();
        browser.sleep(15000);
        emailRec.clickUnreadMail();
        emailRec.clickChangePasswordBtn();
        browser.sleep(15000);
        emailRec.newWindow();
        browser.waitForAngularEnabled(true);

        // browser.get(actualUrl1).then(function(actualUrl1){
            //browser.get(modifiedURL).then()
            // var r = "";
            // browser.get(r+"a").then(function(r){
            //     browser.getCurrentUrl().then(function(actualUrl){
            //         r = actualUrl;
            //         return actualUrl;                       
            //      })
            //      return r;
            // })




            browser.getCurrentUrl().then(function(actualUrl){
                return browser.get(actualUrl + 'a')
                // .then(() => {
                    // return browser.wait(protractor.ExpectedConditions.visibilityOf($('.home .toast-alert .toast-container.error')))
                    // .then(()=>{
                        // element(by.css('.toast-container.error')).getText()
                        //     .then((text)=>{
                        //         console.log("Printing alert message :: "+text);
                        //     });
                    // });     
                // });   
             })
            
             element(by.css('.toast-container.error')).getText()
             .then((text)=>{
                 console.log("Printing alert message :: "+text);
             });
        




    });
});