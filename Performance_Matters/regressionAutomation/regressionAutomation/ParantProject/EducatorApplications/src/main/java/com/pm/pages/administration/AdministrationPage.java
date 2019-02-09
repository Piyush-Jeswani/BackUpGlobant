package com.pm.pages.administration;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import com.pm.pages.common.BasePage;

public class AdministrationPage extends BasePage {

	@FindBy(linkText = "User Accounts")
	private WebElement userAccountsLink;

	@FindBy(linkText = "Course Administration")
	private WebElement courseAdministrationLink;
	
	@FindBy(xpath = "//header[@class='tnl-page-header']//h1")
	private WebElement pageHeader;
	
	@FindBy(linkText = "Administration")
	private WebElement administrationTab;

	public AdministrationPage() {
		super();
//		assertThat("Administration page is not displayed", driver.getTitle(), containsString("Administration"));		
	}

	public UserAccountsPage clickUserAccountLink() {
		clickElementByJSExecutor(userAccountsLink);
		waitForJSandJQueryToLoad();
		return new UserAccountsPage();
	}
		
	public String getPageHeaderName(){
		return pageHeader.getText();
	}
	
	public CourseAdministrationPage clickCourseAdministration() {
		clickElementByJSExecutor(courseAdministrationLink);
		waitForJSandJQueryToLoad();
		return new CourseAdministrationPage();
	}
}
