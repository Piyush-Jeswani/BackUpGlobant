var protractor_1 = require("protractor");
var loginPage = require("../operations/LoginOperations.js");
var loginData = require("../resources/LoginData.json");
var EC = protractor_1.ExpectedConditions;

describe("Login Test Scenario", function() {
  it("Test 1 : Valid Login Case ", function() {
    console.log("Entering FIRST spec block");
    browser.get("http://tgl-onprem11.rctanalytics.com/#/");
    loginPage.enterLogin(
      loginData.credentials.valid.user,
      loginData.credentials.valid.password
    );
    loginPage.clickSubmitBtn();
    console.log("First Test Case Is Completed");
  });
});
