package com.sa.pages.common;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

public class LoginPage extends BasePage {

	@FindBy(name = "username")
	private WebElement usernameTxtBox;

	@FindBy(name = "password")
	private WebElement passwordTxtBox;

	@FindBy(xpath = "//input[@value='Login']")
	private WebElement loginBtn;
	
	public LoginPage() {
		super();
	}
	
	public void login(String username, String password) throws InterruptedException {

		usernameTxtBox.clear();
		usernameTxtBox.sendKeys(username);
		passwordTxtBox.clear();
		passwordTxtBox.sendKeys(password);
		loginBtn.click();
	}

}
