package com.pm.pages.administration;

import java.awt.AWTException;
import java.awt.Robot;
import java.awt.Toolkit;
import java.awt.datatransfer.StringSelection;
import java.awt.event.KeyEvent;
import java.io.IOException;

import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.ui.ExpectedConditions;

import com.pm.pages.common.BasePage;

public class CalibrationEventsPage extends BasePage{
	
	@FindBy(xpath = "//span[text()='Groups']/ancestor::a[1]")
	private WebElement groupsTab;
	
	@FindBy(name = "computedScoreReleaseDate")
	private WebElement scoreReleaseDateTxtBox;
	
	@FindBy(xpath = "//button[text()='Save Changes']")
	private WebElement saveChanesBtn;
	
	@FindBy(xpath = "//button[text()='Calculate Scores']")
	private WebElement calculatescoresBtn;
	
	@FindBy(css = ".pmf-new-resource-btn")
	private WebElement newResource;
	
	@FindBy(name = "title")
	private WebElement resourceTitle;
	
	@FindBy(css = ".pm-primary-btn")
	private WebElement saveButton;
	
	@FindBy(xpath = "//div[@class='app-body pm-app-body']//button[@class='pm-outline-btn pm-btn-lg']")
	private WebElement uploadFileButton;
	
	@FindBy(css = ".tnlf-file-upload")
	private WebElement attachFileButton;
	
	@FindBy(id = "searchCriteria")
	private WebElement searchInput;
	
	@FindBy(xpath = "//button[text()='Edit']")
	private WebElement editButton;
	
	@FindBy(xpath = "//label[text()='Score Release Date:']")
	private WebElement scoreReleaseDate;
	
	@FindBy(css = ".modal-body .tnlf-permanent-grid-search")
	private WebElement searchBoxModal;
	
	@FindBy(xpath = "//a[@class='pm-outline-btn pm-btn-lg']")
	private WebElement addNewButton;
	
	@FindBy(css = ".pm-error-btn")
	private WebElement deleteContinueButton;
	
	public CalibrationEventsPage(){
		super();
	}
	
	public CalibrationGroupsPage clickOnEventstab(){
		groupsTab.click();
		waitForJSandJQueryToLoad();
		return new CalibrationGroupsPage();
	}
	
	public void clickOwnerToSeeEvents(String ownerName){
		String xpathOfOwner = "//span[text()[contains(.,\"" + ownerName +"\")]]/ancestor::a[1]";
		clickElementByJSExecutor(driver.findElement(By.xpath(xpathOfOwner)));
		waitForJSandJQueryToLoad();
	}
	
	public void clickEditBtn(){
		clickElementByJSExecutor(editButton);
		waitForJSandJQueryToLoad();
	}
	
	public void setScoreReleasedate(String date){
		scoreReleaseDateTxtBox.clear();
		scoreReleaseDateTxtBox.sendKeys(date);
		scoreReleaseDate.click();
		waitForJSandJQueryToLoad();
	}
	
	public void saveChanges(){
		clickElementByJSExecutor(saveChanesBtn);
		waitForJSandJQueryToLoad();
	}
	
	public void calculateScores(){
		clickElementByJSExecutor(calculatescoresBtn);
		 wait.until(ExpectedConditions.alertIsPresent());
		driver.switchTo().alert().accept();
		waitForJSandJQueryToLoad();
	}
	
	public void clickAndGoToLink(String linkName){
		wait.until(ExpectedConditions.visibilityOf(driver.findElement(By.linkText(linkName))));
		clickElementByJSExecutor(driver.findElement(By.linkText(linkName)));
		waitForJSandJQueryToLoad();
	}
	
	public void clickOnLink(String linkText) {
		String link = String.format("//div[@class='pmf-left-navigation-page']//span[text()='%s']", linkText);
		WebElement linkElement = driver.findElement(By.xpath(link));
		clickElementByJSExecutor(linkElement);
		waitForJSandJQueryToLoad();
	}
	
	public void clickParticipantsForEvent(String eventName) {
		String participants = String.format("//*[text()='%s']//ancestor::td/following-sibling::td[2]/a", eventName);
		WebElement participantsLink = driver.findElement(By.xpath(participants));
		clickElementByJSExecutor(participantsLink);
		waitForJSandJQueryToLoad();
	}
	
	public void enterSearchText(String userName) {
		searchBoxModal.sendKeys(userName);
		waitForJSandJQueryToLoad();
		searchBoxModal.sendKeys(Keys.ENTER);
		waitForJSandJQueryToLoad();
	}
	
	public boolean verifyUserDisplayed(String userName) {
		String user = String.format("//table//td[text()='%s']", userName);
		return elementPresent(By.xpath(user));
	}
	
	public void manageUser(String firstName,String lastName) {
		String userName = String.format("//span[text()='%s, %s']/ancestor::a", lastName,firstName);
		clickElementByJSExecutor(driver.findElement(By.xpath(userName)));
		waitForJSandJQueryToLoad();
	}
	
	public void clickNewResource() {
		newResource.click();
		waitForJSandJQueryToLoad();
	}
	
	public void addNewResource(String title) {
		resourceTitle.clear();
		resourceTitle.sendKeys(title);
		
		clickElementByJSExecutor(saveButton);
		waitForJSandJQueryToLoad();
	}
	
	public void attachFile(String fileName) throws AWTException {
		Robot robot = new Robot();
		StringSelection selection = new StringSelection("");
		String systemPath = System.getProperty("user.dir");
		uploadFileButton.click();
		wait.until(ExpectedConditions.elementToBeClickable(attachFileButton));
    	attachFileButton.click();
		robot.setAutoDelay(1000);
		
		selection = new StringSelection(systemPath+"\\filesToUpload\\"+fileName);
        Toolkit.getDefaultToolkit().getSystemClipboard().setContents(selection,null);
        robot.setAutoDelay(1000);
        
        robot.keyPress(KeyEvent.VK_CONTROL);
        robot.keyPress(KeyEvent.VK_V);
 
        robot.keyRelease(KeyEvent.VK_CONTROL);
        robot.keyRelease(KeyEvent.VK_V);
 
        robot.setAutoDelay(1000);
 
        robot.keyPress(KeyEvent.VK_ENTER);
        robot.keyRelease(KeyEvent.VK_ENTER);
        waitForJSandJQueryToLoad();
	}
	
	public void searchResource(String resourceName) {
		searchInput.clear();
		searchInput.sendKeys(resourceName);
		clickAndGoToLink("Search");
	}
	
	public void performActionOnResource(String resourceName,String action) {
		String xpath = String.format("//button[@class='boot-btn dropdown-toggle btn-default']", resourceName);
		driver.findElement(By.xpath(xpath)).click();
		clickAndGoToLink(action);
	}
	
	public boolean verifyAddNewButtonIsPresent() {
		return elementPresent(By.xpath("//a[@class='pm-outline-btn pm-btn-lg']"));
	}
	
	public boolean verifyResourceIsPresent(String resourceTitle) {
		searchResource(resourceTitle);
		String xpath = String.format("//td[@id='tnl-main-td']//td/b[text()='%s']", resourceTitle);
		return elementPresent(By.xpath(xpath));
	}
	
	public String verifyAttachedFileName() {
		return driver.findElement(By.cssSelector(".tnlf-file-list-item a[class='tnlf-file-item']")).getText();
	}
	
	public void clickDeleteButton() {
		clickElementByJSExecutor(deleteContinueButton);
		waitForJSandJQueryToLoad();
	}
}
