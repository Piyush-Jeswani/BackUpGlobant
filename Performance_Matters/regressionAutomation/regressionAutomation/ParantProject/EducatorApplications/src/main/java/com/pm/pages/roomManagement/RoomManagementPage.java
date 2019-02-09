package com.pm.pages.roomManagement;

import java.util.ArrayList;
import java.util.List;

import org.openqa.selenium.Alert;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import com.pm.pages.common.BasePage;
import com.pm.pages.courseSection.CourseSectionPage;

public class RoomManagementPage extends BasePage{
	
	@FindBy(linkText = "Room Management Administration")
	private WebElement roomManagementAdministration;
	
	@FindBy(linkText = "Next >>")
	private WebElement nextButton;
	
	@FindBy(linkText = "Delete")
	private WebElement deleteButton;
	
	@FindBy(xpath = "//td[@class='left-navigation']//a[text() = 'Manage Requests']")
	private WebElement manageRequestLink;
	
	@FindBy(className = "tnlf-permanent-grid-search")
	private WebElement selectValue;
	
	@FindBy(css = ".pm-outline-btn.pm-btn-lg")
	private WebElement sendEmailButton;
	
	@FindBy(css = ".btn-big.back-to-section")
	private WebElement backToSectionLink;
	
	@FindBy(xpath = "//td[@id='tnl-main-td']//a[text()='Book Room']")
	private WebElement bookRoomButton;
	
	@FindBy(name = "title")
	private WebElement eventTitle;
	
	@FindBy(name = "organization")
	private WebElement eventOrganization;
	
	@FindBy(name = "description")
	private WebElement eventDescription;
	
	@FindBy(name = "specialRequests")
	private WebElement eventSpecialRequest;
	
	@FindBy(id = "eventContacts_text")
	private WebElement eventContact;
	
	@FindBy(className = "input-title-bar")
	private WebElement pageHeader;
	
	public RoomManagementPage() {
		super();
	}
	
	public void clickRoomManagementAdministration() {
		clickElementByJSExecutor(roomManagementAdministration);
		waitForJSandJQueryToLoad();
	}
	
	public void clickManageRequest() {
		clickElementByJSExecutor(manageRequestLink);
		waitForJSandJQueryToLoad();
	}
	
	public void selectStatus() {
		wait.until(ExpectedConditions.elementToBeClickable(selectValue));
		clickElementByJSExecutor(selectValue);
		Select statusValue= new Select(selectValue);
		statusValue.selectByVisibleText("Pending");
		waitForJSandJQueryToLoad();
	}
	
	public void selectRoomStatus(String sectionName) {
		List<WebElement> tableData = driver.findElements(By.xpath("//table[@class='tnl-table tnlf-table table-striped']//tbody/tr/td/a[1]/span"));
		
		int tableDataCount = tableData.size();
		for (int row = 0; row < tableDataCount; row++) {
			if (tableData.get(row).getText().contains(sectionName)) {
				WebElement actionButton = driver.findElement(By.xpath("//table[@class='tnl-table tnlf-table table-striped']//tbody/tr/td[2]/div/button")); 
				wait.until(ExpectedConditions.visibilityOf(actionButton));
				clickElementByJSExecutor(actionButton);
				waitForJSandJQueryToLoad();
				WebElement actionStatus = driver.findElement(By.xpath("//table[@class='tnl-table tnlf-table table-striped']//tbody/tr/td[2]//span[text()='Approve']"));
				wait.until(ExpectedConditions.visibilityOf(actionStatus));
				clickElementByJSExecutor(actionStatus);
				waitForJSandJQueryToLoad();
				break;
			}
		}
	}

	public void clickSendEmailbutton() {
		clickElementByJSExecutor(sendEmailButton);
		waitForJSandJQueryToLoad();
	}
	
	public void switchToParentWindow() {
		ArrayList<String> windowHandles = new ArrayList<String> (driver.getWindowHandles());
	    driver.switchTo().window(windowHandles.get(0));
	}
	
	public CourseSectionPage backToSection() {
		clickElementByJSExecutor(backToSectionLink);
		waitForJSandJQueryToLoad();
		return new CourseSectionPage();
	}
	
	public void clickNextButton() {
		clickElementByJSExecutor(nextButton);
		waitForJSandJQueryToLoad();
	}
	
	public void editButton() {
		clickElementByJSExecutor(driver.findElement(By.linkText("Edit")));
	}
	
	public void clickDeleteButton() {
		clickElementByJSExecutor(deleteButton);
		Alert alert = driver.switchTo().alert();
		alert.accept();
		waitForJSandJQueryToLoad();
	}
	
	public boolean verifyLinkIsPresent(String linkText) {
		String link = String.format("//td[@id='tnl-main-td']//a[text()='%s']", linkText);
		return elementPresent(By.xpath(link));
	}
	
	public void clickBookRoom() {
		clickElementByJSExecutor(bookRoomButton);
		waitForJSandJQueryToLoad();
	}
	public void bookRoom(String title,String organization,String description,String request,String contact) {
		
		
		eventTitle.clear();
		eventTitle.sendKeys(title);
		
		eventOrganization.clear();
		eventOrganization.sendKeys(organization);
		
		eventDescription.clear();
		eventDescription.sendKeys(description);
		
		eventSpecialRequest.clear();
		eventSpecialRequest.sendKeys(request);
		
		eventContact.clear();
		eventContact.sendKeys(contact);
		
		nextButton.click();
		waitForJSandJQueryToLoad();
	}
	
	public String verifyPageHeader() {
		return pageHeader.getText();
	}
	public String verifyEventCreated(){
		return driver.findElement(By.tagName("h1")).getText();
	}
}
