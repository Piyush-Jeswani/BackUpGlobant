package com.pm.pages.courseSection;

import java.awt.AWTException;
import java.awt.Robot;
import java.awt.Toolkit;
import java.awt.datatransfer.StringSelection;
import java.awt.event.KeyEvent;
import java.io.File;
import java.io.IOException;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;

import com.pm.pages.common.BasePage;
import com.pm.pages.requestRoom.RequestRoomPage;
import com.pm.pages.roomManagement.RoomManagementPage;

public class CourseSectionPage  extends BasePage{
	@FindBy(linkText = "Manage Room")
	private WebElement manageRoom;
	
	@FindBy(linkText = "Request a Room")
	private WebElement requestroom;
	
	@FindBy(linkText = "Edit")
	private WebElement editButton;
	
	@FindBy(linkText = "Cancel")
	private WebElement cancelButton;
	
	@FindBy(className = "tnl-text-link")
	private WebElement doneButton;
	
	@FindBy(css = ".tnlf-file-upload")
	private WebElement attachFileButton;
	
	@FindBy(css = ".tnlf-save-or-create")
	private WebElement createSectionButton;
	
	public CourseSectionPage() {
		super();
	}
	public String enterSectionTitle(String sectionTitle) {
		WebElement section_title = driver.findElement(By.name("section_title"));
		section_title.clear();
		section_title.sendKeys(sectionTitle);
		return sectionTitle;
	}
	
	public void enterDate(String dateLabel,String sectionDate) throws ParseException {
	        
			String date = String.format("//td[contains(text(),'%s')]//following-sibling::td/a[1]", dateLabel);
	        clickElementByJSExecutor(driver.findElement(By.xpath(date)));
	        
	        selectDate(sectionDate);
	}
	
	public void enterNumberOfParticipants(String number) {
		WebElement numberOfParticipants = driver.findElement(By.name("section_seats"));
		numberOfParticipants.clear();
		numberOfParticipants.sendKeys(number);
	}
	
	public void clickCreateButton() {
		clickElementByJSExecutor(createSectionButton);
		waitForJSandJQueryToLoad();
	}
	
	public void createSection(String sectionTitle,String startDate,String endDate,String startTime,String endTime,String numOfParticipants) throws ParseException {
		enterSectionTitle(sectionTitle);
		enterDate("Start Date", startDate);
		enterDate("End Date", endDate);
		enterNumberOfParticipants(numOfParticipants);
		enterTime(startTime,"section_start_time");
		enterTime(endTime,"section_end_time");
		clickCreateButton();
		
	}
	public RoomManagementPage clickManageRoom() {
		clickElementByJSExecutor(manageRoom);
		waitForJSandJQueryToLoad();
		return new RoomManagementPage();
	}
	
	public RequestRoomPage clickRequestRoomButton() {
		clickElementByJSExecutor(requestroom);
		waitForJSandJQueryToLoad();
		return new RequestRoomPage();
	}
	
	public String checkClassTimeButtonDisable() {
		WebElement checkClassTime =  driver.findElement(By.xpath("//a[text()='Class Times']"));
		wait.until(ExpectedConditions.visibilityOf(checkClassTime));
		return checkClassTime.getAttribute("disabled");
		
	}
	
	public boolean checkClassTimeButtonEnable() {
		WebElement checkClassTime =  driver.findElement(By.xpath("//a[text()='Class Times']"));
		wait.until(ExpectedConditions.visibilityOf(checkClassTime));
		return checkClassTime.isEnabled();
	}
	
	public void clickEditButton() {
		clickElementByJSExecutor(editButton);
		waitForJSandJQueryToLoad();
	}
	
	public String checkSelectTimeDisable(String className) {
		WebElement endTime = driver.findElement(By.name(className));
		return endTime.getAttribute("disabled");
	}
	
	public boolean checkSelectTimeEnable(String className) {
		WebElement time = driver.findElement(By.name(className));
		return time.isEnabled();
		
	}
	
	public void clickCancelButton() {
		clickElementByJSExecutor(cancelButton);
		waitForJSandJQueryToLoad();
	}
		
	public void clickDoneButton() {
		clickElementByJSExecutor(doneButton);
		waitForJSandJQueryToLoad();
	}
	
	// For selecting  time from drop down
	public void enterTime(String sectionTime,String name) {
		String[] time = sectionTime.split(",");
		Select endTimeHour = new Select(driver.findElement(By.name(name+"_hour")));
		endTimeHour.selectByVisibleText(time[0]);
		
		Select endTimeMin = new Select(driver.findElement(By.name(name+"_minute")));
		endTimeMin.selectByVisibleText(time[1]);
		
		Select endTime = new Select(driver.findElement(By.name(name+"_ampm")));
		endTime.selectByVisibleText(time[2]);
	}
	
	public boolean checkDatePresence(String title) {
		String webElement = String.format("//td[contains(text(),'%s')]//following-sibling::td/div", title);
		return elementPresent(By.xpath(webElement));
	}
	
	public void actionOnSection(String sectionTitle,String actionTitle) {
		String action = String.format("//*[contains(text(),'%s')]/ancestor::td[1]/preceding-sibling::td//button", sectionTitle);
		WebElement actionButton = driver.findElement(By.xpath(action));
		actionButton.click();
		
		String link = String.format("//*[contains(text(),'%s')]/ancestor::td[1]/preceding-sibling::td//span[text()='%s']/ancestor::a", sectionTitle,actionTitle);
		WebElement actionLink =  driver.findElement(By.xpath(link));
		actionLink.click();
		
	}
	
	public String getAttachedFileName() {
		WebElement  fileName = driver.findElement(By.xpath("//li[@class='file tnlf-file-list-item pm-file-list-item']//a"));
		return fileName.getText();
	}
	
	public boolean verifyCopiedSectionfileName(String filename) {
		WebElement  fileName = driver.findElement(By.xpath("//li[@class='file tnlf-file-list-item']/span[2]//a"));
		return fileName.equals(filename);
	}
	
	public String getSectionTitle() {
		WebElement sectionTitle = driver.findElement(By.xpath("//table[@class='tnl-table']//td[text()='Section Title:']/following-sibling::td"));
		return sectionTitle.getText();
	}
	
	public void copyOrDeleteSection(String sectionTitle,String actionTitle) {
		String action = String.format("//*[contains(text(),'%s')]/ancestor::td[1]/preceding-sibling::td//button", sectionTitle);
		WebElement actionButton = driver.findElement(By.xpath(action));
		actionButton.click();
		
		String link = String.format("//*[contains(text(),'%s')]/ancestor::td[1]/preceding-sibling::td//span[text()='%s']/ancestor::a", sectionTitle,actionTitle);
		WebElement actionLink =  driver.findElement(By.xpath(link));
		actionLink.click();
		
		driver.switchTo().alert().accept();
		waitForJSandJQueryToLoad();
	}
	
	public boolean verifySectionCopied(String sectionName) {
		String sectionLink = String.format("//*[contains(text(),'%s')]", sectionName);
		return elementPresent(By.xpath(sectionLink));
	}
	
	public void addDayToClassTime() {
		clickOnLink("Class Times");
		clickOnLink("Add New Day");
		clickOnLink("Add New Day");
		clickOnLink("Add New Day");
		clickOnLink("Save & Exit");
	}
	
	public void performAction(String sectionTitle,String action){
		String actionButton = String.format("//td[contains(text(),'%s')]/preceding-sibling::td//button", sectionTitle);
		WebElement button = driver.findElement(By.xpath(actionButton));
		button.click();
		
		
		String link = String.format("//td[contains(text(),'%s')]/preceding-sibling::td//span[text()='%s']/ancestor::a", sectionTitle,action);
		WebElement actionLink =  driver.findElement(By.xpath(link));
		actionLink.click();
		
		driver.switchTo().alert().accept();
		waitForJSandJQueryToLoad();
	}
	
	public void createSectionWithFileupload(String sectionTitle,String startDate,String endDate,String startTime,String endTime,String numOfParticipants,List<String> fileNames) throws ParseException, IOException, InterruptedException, AWTException {
		enterSectionTitle(sectionTitle);
		enterDate("Start Date", startDate);
		enterDate("End Date", endDate);
		enterNumberOfParticipants(numOfParticipants);
		enterTime(startTime,"section_start_time");
		enterTime(endTime,"section_end_time");
		
		
		multipleFileUpload(fileNames);
		
		wait.until(ExpectedConditions.elementToBeClickable(createSectionButton));
		clickCreateButton();
	}
	
	public boolean verifyFileAttachFieldIsPresent() {
		return elementPresent(By.xpath("//td[text()='File Attachments']"));
	}
	
	public boolean verifyAttachFileButtonIsPresent() {
		return elementPresent(By.cssSelector(".tnlf-file-upload"));
	}
	
	public List<String> verifyFileNames() {
		List<WebElement> fileNameList = driver.findElements(By.cssSelector(".tnlf-file-list-item a"));
		List<String> fileNamesText = new ArrayList<String>();
		for (WebElement webElement : fileNameList) {
			fileNamesText.add(webElement.getText());
		}
		return fileNamesText;
	}
	
	
	public void multipleFileUpload(List<String> fileNames) throws AWTException, InterruptedException {
		Robot robot = new Robot();
		StringSelection selection = new StringSelection("");
		String systemPath = System.getProperty("user.dir");
		systemPath = systemPath+"\\filesToUpload\\";
		
		
		for(int i=0; i<fileNames.size(); i++) {
        	wait.until(ExpectedConditions.elementToBeClickable(attachFileButton));
        	attachFileButton.click();
    		robot.setAutoDelay(1000);
    		
    		selection = new StringSelection(systemPath+fileNames.get(i));
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
    }
}
