package com.pm.pages.courseApprovalAdmin;

import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.ui.Select;

import com.pm.pages.common.BasePage;

public class CourseApprovalAdminPage extends BasePage {

	public CourseApprovalAdminPage() {
		super();
	}

	@FindBy(linkText = "Course Approval Administration")
	private WebElement courseApprovalAdminTab;

	@FindBy(linkText = "Administration")
	private WebElement administrationTab;

	@FindBy(xpath = "//div[@id='navigation']//a[text()='Manage Roles']")
	private WebElement manageRolesTab;

	@FindBy(linkText = "Assign Roles")
	private WebElement assignRolesTab;

	public CourseApprovalAdminPage clickAdministrationTab() throws InterruptedException {
		clickElementByJSExecutor(administrationTab);
		waitForJSandJQueryToLoad();
		return new CourseApprovalAdminPage();
	}

	public CourseApprovalAdminPage clickCourseApprovalAdminTab() {
		clickElementByJSExecutor(courseApprovalAdminTab);
		return new CourseApprovalAdminPage();
	}

	public CourseApprovalAdminPage clickManageRolesTab() {
		clickElementByJSExecutor(manageRolesTab);
		return new CourseApprovalAdminPage();
	}

	public CourseApprovalAdminPage clickstaffManageButton(String manageText) {
		WebElement staffManageButton = driver.findElement(By.xpath("//td[text()='"+manageText+"']/a"));
		clickElementByJSExecutor(staffManageButton);
		return new CourseApprovalAdminPage();
	}

	public CourseApprovalAdminPage clickAssignRolesTab() {
		clickElementByJSExecutor(assignRolesTab);
		return new CourseApprovalAdminPage();
	}

	public CourseApprovalAdminPage selectRole(String roleName) {
		Select roleDropDown = new Select(driver.findElement(By.name("viewrole")));
		roleDropDown.selectByVisibleText(roleName);
		return new CourseApprovalAdminPage();
	}
	
	public boolean verifyUserNameIsPresent(String userName) {
		String xpath = String.format("//table[@class='tnl-table']//td[text()='%s']", userName);
		return elementPresent(By.xpath(xpath));
	}
	
	public String getUserRole(String userName) {
		String userRole = String.format("//table[@class='tnl-table']//td[text()='%s']/preceding-sibling::td[1]", userName);
		return driver.findElement(By.xpath(userRole)).getText();
	}
	public CourseApprovalAdminPage deleteUser(String userName) {
		String xpath = String.format("//table[@class='tnl-table']//td[text()='%s']//following-sibling::td/button", userName);
			
		if(elementPresent(By.xpath(xpath))){
			WebElement deleteUser = driver.findElement(By.xpath(xpath));
			clickElementByJSExecutor(deleteUser);
			waitForJSandJQueryToLoad();
		}
		
		return new CourseApprovalAdminPage();
	}

	public CourseApprovalAdminPage clickAddUser() {
		clickElementByJSExecutor(driver.findElement(By.cssSelector(".tnlf-add-user")));
		return new CourseApprovalAdminPage();
	}

	public void searchUser(String userName) {
		WebElement searchInput = driver.findElement(By.className("tnlf-permanent-grid-search"));
		searchInput.sendKeys(userName);
		searchInput.sendKeys(Keys.ENTER);
		waitForJSandJQueryToLoad();
	}

	public CourseApprovalAdminPage addUser() {
		WebElement addUser = driver.findElement(By.className("tnlf-add-user-role"));
		clickElementByJSExecutor(addUser);
		waitForJSandJQueryToLoad();
		WebElement doneButton = driver.findElement(By.className("tnlf-find-user-done-btn"));
		clickElementByJSExecutor(doneButton);
		return new CourseApprovalAdminPage();
	}
		
	public void selectOffice(String officeName) {
		Select officeDropdown = new Select(driver.findElement(By.id("officeId")));
		officeDropdown.selectByVisibleText(officeName);
	}
	
	public void selectActionForUser(String courseTitle,String action) {
		String xpath = String.format("//td/b[text()='%s']/ancestor::td/preceding-sibling::td//button", courseTitle);
		WebElement actionButton = driver.findElement(By.xpath(xpath));
		actionButton.click();
		
		WebElement actionLink = driver.findElement(By.linkText(action));
		actionLink.click();
		
	}
}
