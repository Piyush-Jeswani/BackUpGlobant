var loginPage = require('../Tyco/loginPage.js');
describe('test page object',function(){
it('page object', function(){
    loginPage.openBrowser();
    loginPage.enterLogin('development','myD3v3l0pm3ntP4ssw0rd');
    loginPage.clickSubmitBtn();
});

});