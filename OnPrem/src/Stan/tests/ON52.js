var loginPage = require('../pages/loginPage.js');
var forgotPass = require('../Tyco/forgotPass.js');
var emailRec = require('../pages/emailRec.js');
describe("Forgot Password functionality", function(){

    it("Forgot password", function(){

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

        // var para = forgotPass.readThePara();
        // expect(para).toContain("We have sent a link to generate your new password to the following email address:");

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
    emailRec.enterNewPassword("Test123!@#$");
    emailRec.enterNewPasswordConfirmation("Test123!@#$");
    emailRec.clickSavePasswordBtn();
    browser.sleep(15000);  

    loginPage.enterLogin("e2eOnPrem","Test123!@#$");
    loginPage.clickSubmitBtn();
    browser.sleep(10000);  

    emailRec.oldWindow();
    browser.sleep(10000);  
    emailRec.deleteReadEmail();

    browser.sleep(100000);  
    })
})