var loginPage = function(){

    this.openBrowser = function(){
        browser.get("http://tgl-onprem11.rctanalytics.com/");  
    };

    this.openBrowserWithLink = (link)=> browser.get(link);

    this.enterLogin = function(username, password){
        element(by.model("vm.username")).sendKeys(username);
        element(by.model("vm.password")).sendKeys(password);
    };

    this.clickSubmitBtn = function(){
        element(by.name("submitButton")).click();
        browser.driver.manage().window().maximize();
    };

    this.getForgotText = function(){
        return element(by.css("#passwordRecoveryBlock")).getText();
    };

    this.clickForgotPasswordLink = function(){
        element(by.css("#passwordRecoveryBlock")).click();
    };

};
module.exports = new loginPage();