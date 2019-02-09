package com.pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.How;
import org.openqa.selenium.support.PageFactory;

import com.Listener.TestListener;
import com.aventstack.extentreports.ExtentTest;
import com.aventstack.extentreports.Status;
import com.quantcast.utils.SeleniumUtils;

import stepDefinition.Hooks;

public class LoginPage {

	private WebDriver driver;

	@FindBy(how = How.ID, using = "authn_email")
	private WebElement emailAddressTxtField;

	@FindBy(how = How.ID, using = "authn_rawPassword")
	private WebElement passwordTxtField;

	@FindBy(how = How.ID, using = "authn_loginBtn")
	private WebElement signInBtn;

	@FindBy(how = How.ID, using = "MainContent_lblErrorMessage")
	private WebElement loginErrTxt;

	@FindBy(how = How.ID, using = "MainContent_hlConstructionRegister")
	private WebElement registerBtn;

	@FindBy(how = How.ID, using = "MainContent_hlResetPassword")
	private WebElement resetPwd;

	public LoginPage(WebDriver driver) {
		this.driver = driver;
		PageFactory.initElements(driver, this);

	}

	public String getTitle() {
		return driver.getTitle();
	}

	public boolean isLoginErrorMessageDisplayed() {
		return loginErrTxt.isDisplayed();
	}

	public HomePage loginAs(String emailAddress, String password) {

		SeleniumUtils.isClickable(emailAddressTxtField, driver);
		emailAddressTxtField.clear();
		emailAddressTxtField.sendKeys(emailAddress);

		SeleniumUtils.isClickable(passwordTxtField, driver);
		passwordTxtField.clear();
		passwordTxtField.sendKeys(password);

		SeleniumUtils.isClickable(signInBtn, driver);
		signInBtn.click();
		return new HomePage(this.driver);

	}

	public void enterEmailAddress(String emailAddress) {

		emailAddressTxtField.sendKeys(emailAddress);
	}

	public void enterPassword(String password) {

		passwordTxtField.sendKeys(password);
	}

	public void clickOnSignInButton() {

		signInBtn.click();
	}

	public boolean isEmailAddressTxtFieldDisplayed() {
		return emailAddressTxtField.isDisplayed();
	}

	public boolean isPasswordTxtFieldDisplayed() {
		return passwordTxtField.isDisplayed();
	}

	public HomePage navigateToHomePage() {

		signInBtn.click();
		return new HomePage(this.driver);
	}

	public boolean isSignInButtonDisplayed() {

		return signInBtn.isDisplayed();
	}
}
