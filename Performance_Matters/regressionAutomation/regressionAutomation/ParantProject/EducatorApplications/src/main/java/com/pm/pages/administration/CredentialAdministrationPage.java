package com.pm.pages.administration;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import com.pm.pages.common.BasePage;

public class CredentialAdministrationPage extends BasePage{
	
	@FindBy(name = "firstName")
	private WebElement firstNameTxtBox;
	
	@FindBy(name = "lastName")
	private WebElement lastNameTxtBox;
	
	@FindBy(linkText = "Search")
	private WebElement searchBtn;
	
	public CredentialAdministrationPage(){
		super();
	}
	
	public void searchUser(String firstname, String lastname){		
		firstNameTxtBox.clear();
		firstNameTxtBox.sendKeys(firstname);
		lastNameTxtBox.clear();
		lastNameTxtBox.sendKeys(lastname);
		clickElementByJSExecutor(searchBtn);
		waitForJSandJQueryToLoad();
	}
	
	public String getSchoolForSearchedUser(String firstName, String lastname){
		
		String xpath = String.format("//td[text() [contains(.,'%s%s%s')]]/following-sibling::td[2]", lastname, ", ", firstName);
		return driver.findElement(By.xpath(xpath)).getText();
	}

}
