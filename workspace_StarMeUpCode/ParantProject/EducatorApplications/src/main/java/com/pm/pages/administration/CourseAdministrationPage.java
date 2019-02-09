package com.pm.pages.administration;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.openqa.selenium.Alert;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindAll;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.ui.ExpectedConditions;
import com.pm.pages.common.BasePage;
import com.pm.pages.courseSection.CourseSectionPage;
import com.pm.pages.pdManagement.PDManagementPage;

public class CourseAdministrationPage extends BasePage {

	public CourseAdministrationPage() {
		super();
	}
	
	@FindBy(name = "title")
	private WebElement courseTitleTextBox;

	@FindBy(id = "tnl-find-courses-btn")
	private WebElement searchBtn;
	
	@FindBy(id = "course_title-infield-id")
	private WebElement courseTitleLabel;

	@FindBy(id = "tnl-list-all-courses-btn")
	private WebElement listAllBtn;

	@FindAll({ @FindBy(xpath = "//td[@id='tnl-main-td']//tr/td[3]/span/a") })
	private List<WebElement> listOfAllCourses;
	
	@FindBy(xpath = "//div[@id='navigation']//a[text()='Manage Components']")
	private WebElement manageComponentsLink;
	
	@FindBy(xpath = "//form[@id='searchComponent']//a[text()='List All']")
	private WebElement listAllComponentsBtn;
	
	@FindBy(xpath = "//div[@class='save-page-bar']//a[text()='Delete']")
	private WebElement deletebtn;
	
	@FindBy(css = ".tnl-message-warning")
	private WebElement warningMsg;
	
	@FindBy(className="app-heading")
	private WebElement pageHeader;
	
	@FindBy(linkText = "New Section")
	private WebElement newSection;
	
	@FindBy(name = "numberOfParticipants")
	private WebElement numberOfParticipants;
	
	@FindBy(xpath = "//form[@id='addRoom']//button")
	private WebElement addRoomButton;
	
	@FindBy(linkText = "Room Management Administration")
	private WebElement roomManagementAdministration;
	
	@FindAll({@FindBy(xpath = "//td[@id='tnl-main-td']//td/span/a")})
	private List<WebElement> listedCourses;
	
	@FindBy(name = "section_title")
	private WebElement sectionTitleInput;
	
	@FindBy(name = "creditArea_area_bankable")
	private WebElement creditArea;
	
	@FindBy(xpath = "//td[@class='app-heading']//button[@class='boot-btn dropdown-toggle btn-default']")
	private WebElement actionDropDown;
	
	@FindBy(xpath = "//td[@id='file_attachments-infield-id']//li/a")
	private WebElement attachedFileName;
	
	private static final Date currentDate = new Date();
		
	public void clickLinkFromNavigation(String linktext){
		String xpath= String.format("//div[@id='navigation']//a[text()='%s']", linktext);
		clickElementByJSExecutor(driver.findElement(By.xpath(xpath)));
		waitForJSandJQueryToLoad();
	}
	
	public void clickListAllComponentsBtn(){
		clickElementByJSExecutor(listAllComponentsBtn);
		waitForJSandJQueryToLoad();
	}
	
	public void clickTitleFromSearchComponentResults(String titleName){
		String xpath = String.format("//td[@id='tnl-main-td']//td/span/a[text()='%s']", titleName);
		clickElementByJSExecutor(driver.findElement(By.xpath(xpath)));
		waitForJSandJQueryToLoad();
	}
	
	public void clickDeleteBtnToDeleteComponent(){		
		clickElementByJSExecutor(deletebtn);
		driver.switchTo().alert().accept();
		waitForJSandJQueryToLoad();		
	}
	
	public String getWarningMsgText(){
		return warningMsg.getText();
	}
	
	public void clickListAllBtn(){
		clickElementByJSExecutor(listAllBtn);
		waitForJSandJQueryToLoad();
	}
	
	public int noOfListedCourses(){
		return listedCourses.size();
	}
	
	public void searchCourse(String courseName){
		courseTitleTextBox.clear();
		courseTitleTextBox.sendKeys(courseName);
		clickElementByJSExecutor(searchBtn);
		waitForJSandJQueryToLoad();
	}
	
	public void clickOnCourse(String coursename){
		String xpath = String.format("//td[@id='tnl-main-td']//td/span/a[text()=\"%s\"]", coursename);
		clickElementByJSExecutor(driver.findElement(By.xpath(xpath)));
		waitForJSandJQueryToLoad();
	}
	
	public String getCourseTitle(){
		return courseTitleLabel.getText();
	}
	
	public String getPageHeader(){
		return pageHeader.getText();
	}
	
	public CourseSectionPage clickNewSection() {
		clickElementByJSExecutor(newSection);
		waitForJSandJQueryToLoad();
		return new CourseSectionPage();
	}
	
	public String enterSectionTitle() {
		String sectionTitle = "Test_"+currentDate;
		sectionTitleInput.clear();
		sectionTitleInput.sendKeys(sectionTitle);
		return sectionTitle;
	}
	
	public void openNewTab(String linkName) throws InterruptedException {
		waitForJSandJQueryToLoad();
		clickElementByJSExecutor(driver.findElement(By.xpath("//div[@id='PortalHeader_0']//nav/div/button")));
		actions.keyDown(Keys.CONTROL).click(driver.findElement(By.linkText(linkName))).keyUp(Keys.CONTROL).build().perform();
		waitForJSandJQueryToLoad();
		
		ArrayList<String> windowHandles = new ArrayList<String> (driver.getWindowHandles());
		for(String window : windowHandles){
			driver.switchTo().window(window);
			if(driver.getTitle().contains("Administration")){
				break;
			}			
		}
	}
	
	public void clickActionMenu(String sectionName) {
		List<WebElement> sectionNameList = driver.findElements(By.xpath("//table[@class='tnl-table']//tr/td/span"));
		int sectionNameListCount = sectionNameList.size();
		for(int i=0 ;i<sectionNameListCount;i++) {
			if(sectionNameList.get(i).getText().contains(sectionName)){
				List<WebElement> actionButton = driver.findElements(By.xpath("//table[@class='tnl-table']//tr/td/span/../preceding-sibling::td//button"));
				clickElementByJSExecutor(actionButton.get(i));
				waitForJSandJQueryToLoad();
				break;
			}
		}
	}
	
	public void clickDeleteButton() {
		wait.until(ExpectedConditions.visibilityOf(driver.findElement(By.linkText("Delete"))));
		clickElementByJSExecutor(driver.findElement(By.linkText("Delete")));
		
		Alert alert = driver.switchTo().alert();
		alert.accept();
		waitForJSandJQueryToLoad();
	}
	
	public void deleteCourse(String courseName,String sectionName) {
		searchCourse(courseName);
		clickOnCourse(courseName);
		clickActionMenu(sectionName);
		clickDeleteButton();
	}
	public PDManagementPage clickOnTheLink(String Link){
		clickElementByJSExecutor(driver.findElement(By.linkText(Link)));
		waitForJSandJQueryToLoad();
		return new PDManagementPage();
	}
	
	public void clickOnLink(String linkText) {
		WebElement link = driver.findElement(By.linkText(linkText));
		clickElementByJSExecutor(link);
		waitForJSandJQueryToLoad();
	}
	
	public boolean verifySectionCreated(String sectionTitle) {
		String sectionNameLink = String.format("//table[@class='tnl-table']//tr/td/span[text()='%s']", sectionTitle);
		WebElement sectionName = driver.findElement(By.xpath(sectionNameLink));
		return sectionName.isDisplayed();
	}
	
	public void actionOnCourse(String action) {
		clickElementByJSExecutor(actionDropDown);
		waitForJSandJQueryToLoad();
		
		String courseAction = String.format("//td[@class='app-heading']//span[text()='%s']/ancestor::a",action);
		WebElement copyLink = driver.findElement(By.xpath(courseAction));
		copyLink.click();
		
		driver.switchTo().alert().accept();
		waitForJSandJQueryToLoad();
		
	}
	
	public String getAttachedFileName() {
		return attachedFileName.getText();
	}
	
	public boolean verifyCopiedCourseFileName(String filename) {
		return attachedFileName.getText().equals(filename);
	}
	
	public boolean verifycheckBoxEnabled(String courseMultiple) {
		WebElement courseEnroll = driver.findElement(By.name(courseMultiple));
		return courseEnroll.isSelected();
	}
	
	public void clickEditLink(String action) {
		clickElementByJSExecutor(actionDropDown);
		waitForJSandJQueryToLoad();
		
		String courseAction = String.format("//td[@class='app-heading']//span[text()='%s']/ancestor::a",action);
		WebElement copyLink = driver.findElement(By.xpath(courseAction));
		copyLink.click();
	}
	
	public void clickCheckbox(String name,String status) {
		WebElement courseEnroll = driver.findElement(By.name(name));
		String flag = Boolean.toString(courseEnroll.isSelected());
		if(!flag.equals(status)) {
			courseEnroll.click();
		}
	}
	
	public boolean verifyBankableCheckboxIsChecked() {
		return creditArea.isSelected();
	}
	
	public List<String> getSectionList(String sectionTitle) {
		String sectionName = String.format("//span[contains(text(),'%s')]", sectionTitle);
		List<WebElement> sectionList =  new ArrayList<WebElement>();
		List<String> sectionTitleList = new ArrayList<String>();
		if(elementPresent(By.xpath(sectionName))){
			sectionList = driver.findElements(By.xpath(sectionName));
			
			for (WebElement webElement : sectionList) {
				sectionTitleList.add(webElement.getText());
			}
		}
		return sectionTitleList;
	}
}
