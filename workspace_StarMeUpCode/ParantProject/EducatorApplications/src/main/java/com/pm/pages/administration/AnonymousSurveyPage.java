package com.pm.pages.administration;

import java.util.ArrayList;
import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import com.pm.pages.common.BasePage;

public class AnonymousSurveyPage extends BasePage{

	public AnonymousSurveyPage() {
		super();
	}
	
	@FindBy(xpath = "//div[@class='pm-page-content']/h2")
	private WebElement pageHeader;
	
	@FindBy(id = "numberOfAccounts")
	private WebElement numberOfAccounts;
	
	@FindBy(xpath = "//div[@class='pm-page-content']/h4")
	private WebElement permissionHeader;
	
	@FindBy(id = "tnlf-remove-selected-rights")
	private WebElement removeRights;
	
	@FindBy(css = ".tnl-table-search input")
	private WebElement searchBox;
	
	@FindBy(className = "tnlf-permanent-grid-search")
	private WebElement searchInput;
	
	@FindBy(css = ".tnlf-create-anonymous-accounts")
	private WebElement createAnonymousAccount;
	
	@FindBy(name = "firstNameSearch")
	private WebElement firstNameSearch;
	
	@FindBy(name = "lastNameSearch")
	private WebElement lastNameSearch;
	
	@FindBy(css = ".tnlf-managePermissionsSearch-btn")
	private WebElement searchButton;
	
	@FindBy(id = "tnlf-add-selected-rights")
	private WebElement addRightsButton;
	
	@FindBy(id = "tnlf-remove-selected-rights")
	private WebElement removeRightsButton;
	
	@FindBy(id = "createAccountsButton")
	private WebElement createAccountButton;
	
	public void clickTabLink(String linkText) {
		WebElement tabLink = driver.findElement(By.linkText(linkText));
		clickElementByJSExecutor(tabLink);
		waitForJSandJQueryToLoad();
	}
	
	public String getAllAccountsHeaderDescription() {
		return pageHeader.getText();
	}
	
	public String getPermissionsHeaderDescription() {
		return permissionHeader.getText();
	}
	
	public void removeSurveyCoordinators(String firstName,String lastName) {
		String user = String.format("//td[text()='%s, %s']/preceding-sibling::td/input", lastName,firstName);
		WebElement userCheckbox = driver.findElement(By.xpath(user));
		userCheckbox.click();
		waitForJSandJQueryToLoad();
		
		clickElementByJSExecutor(removeRights);
		waitForJSandJQueryToLoad();
	}
	
	public boolean verifySurveyCoordinatorRemoved(String firstName,String lastName) {
		String user = String.format("//td[text()='%s, %s']", lastName,firstName);
		return elementPresent(By.xpath(user));
	}
	
	public void searchUser(String firstName,String lastName) {
		String userName = lastName+", "+firstName;
		searchInput.clear();
		searchInput.sendKeys(userName+Keys.ENTER);
		waitForJSandJQueryToLoad();
	}
	
	public void selectUserForAnonymousAccount(String firstName,String lastName) {
		String userName = lastName+", "+firstName;
		List<WebElement> headerList = driver.findElements(By.xpath("//form[@name='createAccountsForm']//table//th"));
		int headerSize = headerList.size();
		for(int i=0;i<headerSize;i++) {
			String headerText = headerList.get(i).getText().trim().toLowerCase(); 
			if(headerText.equals("name")) {
				String userData = String.format("//table[@class='tnl-table tnlf-table table-striped']//td[%d]", i+1);
				List<WebElement> userNames = driver.findElements(By.xpath(userData));
				int userDataSize = userNames.size();
				for(int j=0;j<userDataSize;j++) {
					String userNameText = userNames.get(j).getText().trim();
					if(userNameText.equals(userName)) {
						String userCheck = String.format("//form[@name='createAccountsForm']//table//tr[%d]/td/input[@name='personId']", j+1);
						clickElementByJSExecutor(driver.findElement(By.xpath(userCheck)));
						waitForJSandJQueryToLoad();
						break;
					}
				}
				break;
			}
			
		}
		clickElementByJSExecutor(createAnonymousAccount);
		waitForJSandJQueryToLoad();
	}
	
	public void createAnonymousAccount() {
		numberOfAccounts.clear();
		numberOfAccounts.sendKeys("11");
		
		createAccountButton.click();
		waitForJSandJQueryToLoad();
	}
	
	public void addRightsToUser(String firstName,String lastName) {
		firstNameSearch.clear();
		firstNameSearch.sendKeys(firstName);
		
		lastNameSearch.clear();
		lastNameSearch.sendKeys(lastName);
		
		searchButton.click();
		waitForJSandJQueryToLoad();
		
		String userCheck = String.format("//form[@class='tnlf-update-survey-coordinator-person-form']//td[text()='%s, %s']/preceding-sibling::td/input", lastName,firstName);
		clickElementByJSExecutor(driver.findElement(By.xpath(userCheck)));
		
		clickElementByJSExecutor(addRightsButton);
		waitForJSandJQueryToLoad();
	}
	
	public void removeRightsForUser(String firstName,String lastName) {
		String userCheck = String.format("//form[@class='tnlf-all-survey-coordinator-permissions-form']//td[text()='%s, %s']/preceding-sibling::td/input", lastName,firstName);
		if(elementPresent(By.xpath(userCheck))) {
			clickElementByJSExecutor(driver.findElement(By.xpath(userCheck)));
			
			clickElementByJSExecutor(removeRightsButton);
			waitForJSandJQueryToLoad();
		}
	}
	
	public boolean verifySurveyCoordinatorIsPresent(String firstName,String lastName) {
		String userCheck = String.format("//form[@class='tnlf-all-survey-coordinator-permissions-form']//td[text()='%s, %s']", lastName,firstName);
		return elementPresent(By.xpath(userCheck));
	}
}
