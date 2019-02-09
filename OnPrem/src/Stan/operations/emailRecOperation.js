
var emailRecComponent = require('../components/EmailRecComponents.js');
var emailRec = function(){

    this.openBrowser = function(){
        browser.get("http://www.gmail.com");  
    };

    this.enterEmail = function(email){        
        emailRecComponent.email.sendKeys(email);    
    };

    this.clickNextBtn = function(){
        emailRecComponent.nextBtn.click();
    };

    this.enterPassword = function(password){
        emailRecComponent.password.sendKeys(password);
    };

    this.clickPasswordNext = function(){
        emailRecComponent.passwordNext.click();
    };

    this.clickUnreadMail = function(){
        emailRecComponent.unreadMail.click();
    };

    this.clickChangePasswordBtn = function(){
        emailRecComponent.changePswdBtn.click();
    };
    
    this.getChangePassword = function(){
        emailRecComponent.changePasswrd.getText();
    };


    this.newWindow = function(){       
            browser.getAllWindowHandles().then(function (handles) {
                   var secondWindow = handles[1];                  
                   browser.switchTo().window(secondWindow).then(function () {                    
                    browser.getTitle().then(function(txt){
                        console.log("#################  "+ txt+"     #########");
                        return txt;
                    })                       
                   });
            });  
    };


    this.enterNewPassword = function(text){
        emailRecComponent.newPasswrd.sendKeys(text)
    };


    this.enterNewPasswordConfirmation = function(text){
        emailRecComponent.newPasswrdConfirm.sendKeys(text)
    };

    this.clickSavePasswordBtn = function(text){
        emailRecComponent.submitBtn.click();
    }

        this.oldWindow = function(){       
            browser.getAllWindowHandles().then(function (handles) {
                var firstWindow = handles[0];                  
                browser.switchTo().window(firstWindow).then(function () {                    
                    browser.getTitle().then(function(txt){
                        console.log("############OLD WINDOW #####  "+ txt+"     #########");
                    })                       
                });
            });  
    };

this.deleteReadEmail = function(){
    
    emailRecComponent.inbox.click();
    browser.sleep(5000);
    emailRecComponent.checkbox.click();
    browser.sleep(5000);
    emailRecComponent.delete.click();    
    browser.sleep(5000);
}
    
    
    
    
};

module.exports = new emailRec();