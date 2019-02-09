// import { element } from "protractor";
var forgotPassComponent = require('../components/ForgotPassComponent.js');
var forgotPass = function(){

    this.getForgotPasswordLabel = function(){        
        return forgotPassComponent.pageHeader.getText();
    };

    this.enterUsername = function(text){
        forgotPassComponent.username.sendKeys(text);    
    };

    this.clickSendBtn = function(){
        forgotPassComponent.sendBtn.click();
    };

    this.getReceivedUsername = function(){
        forgotPassComponent.pageHeader.getText();
    };

    this.getEmailDisplayed = function(){
        forgotPassComponent.email.getText();
    };

    this.readThePara = function(){        
        return forgotPassComponent.para.getText();
    };

    this.getBackToLogin = function(){        
        return forgotPassComponent.back.getText();
    };
    
};
module.exports = new forgotPass();