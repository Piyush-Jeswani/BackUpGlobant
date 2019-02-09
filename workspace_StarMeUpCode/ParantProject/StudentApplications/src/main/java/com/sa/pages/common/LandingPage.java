package com.sa.pages.common;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

public class LandingPage extends BasePage{
	
	@FindBy(id = "pmlogin")
	private WebElement customerLoginBtn;

	@FindBy(xpath = "//button[text()='Go']")
	private WebElement goBtn;

	@FindBy(name = "idp")
	private WebElement districtLoginTxtBox;
	
	public LandingPage() {
		super();
	}
	
	public LoginPage clickCustomerloginBtn(){
		
		clickElementByJSExecutor(customerLoginBtn);
		return new LoginPage();
	}

}
