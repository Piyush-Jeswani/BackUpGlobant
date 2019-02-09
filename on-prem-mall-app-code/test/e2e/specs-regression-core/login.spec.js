'use strict';


const login = require('../pages/login.js');
const nav = require('../pages/components/nav-header.js');

let loginURL;

describe('Authentication capabilities', () => {
  beforeEach(() => {
    login.go();
    loginURL = browser.getCurrentUrl();
  });

  it('should redirect to the login page if trying to load protected page while not authenticated', () => {
    // should already be on login page (beforeEach statement)

    browser.get('#/account');
    expect(browser.getCurrentUrl()).toEqual(loginURL);
  });

  it('should warn on missing/malformed credentials (when both username and password are provided)', () => {
    login.fields.username.clear();
    login.fields.password.clear();

    login.fields.password.sendKeys('test');
    login.fields.username.sendKeys('test');

    login.fields.loginButton.click();
    expect(login.fields.error.getText()).toMatch('Please check your credentials and try again.');
  });

  it('should warn on missing/malformed credentials (when some login fields are missing)', () => {
    login.fields.username.clear();
    login.fields.password.clear();

    login.fields.password.sendKeys('test');
    login.fields.loginButton.click();
    expect(login.fields.error.getText()).toMatch('Please check your credentials and try again.');

    login.fields.username.sendKeys('test');
    login.fields.password.clear();
    login.fields.loginButton.click();
    expect(login.fields.error.getText()).toMatch('Please check your credentials and try again.');
  });

  it('should accept a valid username and password', () => {
    login.loginAsSuperUser();
    expect(browser.getCurrentUrl()).not.toEqual(loginURL);
    nav.logout();
  });

  it('should return to the login page after logout', () => {
    login.loginAsSuperUser();
    nav.logout();
    expect(browser.getCurrentUrl()).toEqual(loginURL);
  });
});
