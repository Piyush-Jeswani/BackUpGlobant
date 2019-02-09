package com.pm.pages.administration;

import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.ui.ExpectedConditions;

import com.pm.pages.common.BasePage;

public class CredentialRequestPage extends BasePage{
	@FindBy(id = "tnl-filter-menu")
	private WebElement manageFilterMenu;
	
	public void clicManageFilterMenu(String linkText) {
		manageFilterMenu.click();
		
		String menuLinkText = String.format("//a/span[text()='%s']", linkText);
		WebElement menuLink = driver.findElement(By.xpath(menuLinkText));
		menuLink.click();
	}
	
	public void searchForUser(String firstName,String lastName) {
		WebElement searchInput = driver.findElement(By.xpath("//div[@class='tnl-table-search pull-right']/input"));
		searchInput.clear();
		searchInput.sendKeys(lastName+", "+firstName);
		searchInput.sendKeys(Keys.ENTER);
	}
	
	public void addRightsForUser(String firstName,String lastName) {
		String rightsButton = String.format("//td[text()='%s, %s']/preceding-sibling::td/button", lastName,firstName);
		WebElement userRightsButton = driver.findElement(By.xpath(rightsButton));
		clickElementByJSExecutor(userRightsButton);
		waitForJSandJQueryToLoad();
	}
	
	public String verifyPageHeader() throws InterruptedException {
		WebElement pageHeader = driver.findElement(By.xpath("//span[@class='title']"));
		waitForJSandJQueryToLoad();
		return pageHeader.getText();
	}
	
	public String verifyRightsTextForUser(String firstName,String lastName){
		String userRights = String.format("//td[text()='%s, %s']/preceding-sibling::td/button", lastName,firstName);
		return driver.findElement(By.xpath(userRights)).getText();
	}
	
	public boolean verifyUserManageCreditRequestRight(String linkText) {
		manageFilterMenu.click();
		return elementPresent(By.linkText(linkText));
	}
}
