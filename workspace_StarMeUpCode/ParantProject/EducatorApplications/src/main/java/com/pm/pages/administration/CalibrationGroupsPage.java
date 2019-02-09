package com.pm.pages.administration;

import java.text.SimpleDateFormat;
import java.util.Date;

import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import com.pm.data.testdata.CalibrationGroup;
import com.pm.pages.common.BasePage;

public class CalibrationGroupsPage extends BasePage{
	
	private static final Date currentDate = new Date();
	String format = new SimpleDateFormat("MMddyy").format(currentDate);
	
	@FindBy(linkText = "Events")
	private WebElement eventsTab;
	
	@FindBy(xpath = "//span[text()='New Group']/ancestor::a[1]")
	private WebElement newGroupBtn;
	
	@FindBy(name = "calibrationGroupName")
	private WebElement calibrationGroupName;
	
	@FindBy(name = "description")
	private WebElement calibrationGroupDescription;
	
	@FindBy(name = "licensedUserLimit")
	private WebElement licenseLimit;
	
	@FindBy(xpath = "//button[text()='Create Group']")
	private WebElement createGroupBtn;
	
	@FindBy(xpath = "//span[text()='Cancel']/ancestor::a[1]")
	private WebElement cancelGroupLink;
	
	@FindBy(xpath = "//button[text()='Save Changes']")
	private WebElement saveChangesBtn;
	
	@FindBy(xpath = "//label[text()='Search Group:']/following-sibling::input")
	private WebElement searchGroupTxtBox;
	
	@FindBy(xpath = "//label[text()='Search Site:']/following-sibling::input")
	private WebElement searchSiteTxtBox;
	
	@FindBy(xpath = "//div[@class='tnlf-find-admin']//label[text()='Search Name:']/following-sibling::input")
	private WebElement searchAdminNameTxtBox;
	
	@FindBy(xpath = "//button[text()='Continue']")
	private WebElement deleteButton;
	
	@FindBy(xpath = "//button[text()='Edit']")
	private WebElement editButton;
	
	@FindBy(xpath = "//button[text()='Done']")
	private WebElement doneButton;
	
	@FindBy(xpath = "//h1[@class='pmf-page-title']")
	private WebElement pageHeader;
	
	@FindBy(xpath = "//div[contains(@class,'tnlf-view-calibration-group')]//h3")
	private WebElement sectionHeader;
	
	@FindBy(css = ".pmf-calibration-group-add-admin")
	private WebElement addAdminButton;
	
	public CalibrationGroupsPage(){
		super();
	}
	
	public CalibrationEventsPage clickOnEventstab(){
		clickElementByJSExecutor(eventsTab);
		waitForJSandJQueryToLoad();
		return new CalibrationEventsPage();
	}
	
	public void createNewGroup(CalibrationGroup calibrationGroup){
		String groupName = calibrationGroup.getGroupName()+"_"+format;
		String groupDescription = calibrationGroup.getDescription();
		String lincenceLimit = calibrationGroup.getLincenceLimit();
		newGroupBtn.click();
		waitForJSandJQueryToLoad();
		calibrationGroupName.clear();
		calibrationGroupName.sendKeys(groupName);
		calibrationGroupDescription.clear();
		calibrationGroupDescription.sendKeys(groupDescription);
		licenseLimit.clear();
		licenseLimit.sendKeys(lincenceLimit);
//		cancelGroupLink.click();//create new group
		createGroupBtn.click();
		waitForJSandJQueryToLoad();
	}
	
	public CalibrationGroupsPage searchGroup(String groupName){
		groupName = groupName+"_"+format;
		searchGroupTxtBox.clear();
		searchGroupTxtBox.sendKeys(groupName);
		searchGroupTxtBox.sendKeys(Keys.ENTER);
		waitForJSandJQueryToLoad();
		clickElementByJSExecutor(driver.findElement(By.linkText(groupName)));
		waitForJSandJQueryToLoad();
		return new CalibrationGroupsPage();
	}
	
	public void editGroup(CalibrationGroup calibrationGroup) throws InterruptedException{
		
		String groupName = calibrationGroup.getGroupName()+"_"+format;
		String groupDescription = calibrationGroup.getDescription();
		String lincenceLimit = calibrationGroup.getLincenceLimit();
		
		clickElementByJSExecutor(editButton);
		waitForJSandJQueryToLoad();
		calibrationGroupName.clear();
		calibrationGroupName.sendKeys(groupName);
		calibrationGroupDescription.clear();
		calibrationGroupDescription.sendKeys(groupDescription);
		licenseLimit.clear();
		licenseLimit.sendKeys(lincenceLimit);
//		cancelGroupLink.click();
		saveChangesBtn.click();
		waitForJSandJQueryToLoad();
	}
	public void clickAndGoToLink(String linkName){
		clickElementByJSExecutor(driver.findElement(By.linkText(linkName)));
		waitForJSandJQueryToLoad();
	}
	
	public void clickAddBtn(String btnName){
		String xpath = String.format("//span[text()='%s']/ancestor::a[1][@type='button']", btnName);
		clickElementByJSExecutor(driver.findElement(By.xpath(xpath)));
		waitForJSandJQueryToLoad();
	}
	
	public void addDistrict(String districtName){
		String xpathOfAddbtn = String.format("//td[text()='%s']/preceding-sibling::td//button[contains(@class,'tnlf-add-district-to-group')]", districtName);
		clickElementByJSExecutor(driver.findElement(By.xpath(xpathOfAddbtn)));
		waitForJSandJQueryToLoad();
	}
	
	public void clickDoneBtn(){
		clickElementByJSExecutor(doneButton);
		waitForJSandJQueryToLoad();
	}
	
	public void deleteDistrict(String districtName){
		String xpathOfDeletebtn = String.format("//td[text()='%s']/preceding-sibling::td//button[contains(@class,'tnlf-delete-district-from-group')]", districtName); //Engineering Public Schools
		clickElementByJSExecutor(driver.findElement(By.xpath(xpathOfDeletebtn)));
		clickElementByJSExecutor(deleteButton);
		waitForJSandJQueryToLoad();
	}
	
	public void addSite(String siteName){
		String xpathOfAddbtn = String.format("//td[contains(text(),'%s')]/preceding-sibling::td//button[contains(@class,'tnlf-add-site-to-group')]", siteName);
		clickElementByJSExecutor(driver.findElement(By.xpath(xpathOfAddbtn)));
		waitForJSandJQueryToLoad();
	}
	
	public void searchSite(String siteName){
		searchSiteTxtBox.clear();
		searchSiteTxtBox.sendKeys(siteName);
		searchSiteTxtBox.sendKeys(Keys.ENTER);
		waitForJSandJQueryToLoad();
	}
	
	public void deleteSite(String siteName){
		String xpathOfDeletebtn = String.format("//td[contains(text(),'%s')]/preceding-sibling::td//button[contains(@class,'tnlf-delete-site-from-group')]", siteName);
		clickElementByJSExecutor(driver.findElement(By.xpath(xpathOfDeletebtn)));
		clickElementByJSExecutor(deleteButton);
		waitForJSandJQueryToLoad();
	}
	
	public void searchAdmin(String adminName){
		searchAdminNameTxtBox.clear();
		searchAdminNameTxtBox.sendKeys(adminName);
		searchAdminNameTxtBox.sendKeys(Keys.ENTER);
		waitForJSandJQueryToLoad();
	}
	
	public void addAdmin(String adminName){
		String xpathOfAddbtn = "//td[text()[contains(.,\"" + adminName+"\")]]/preceding-sibling::td[1]/button[contains(@class,'add-admin-to-group')]";
		clickElementByJSExecutor(driver.findElement(By.xpath(xpathOfAddbtn)));
		waitForJSandJQueryToLoad();
	}
	
	public void deleteAdmin(String adminName){
		String xpathOfDeletebtn = String.format("//td[contains(text(),'%s')]/preceding-sibling::td//button[contains(@class,'tnlf-delete-admin-from-group')]", adminName);
		clickElementByJSExecutor(driver.findElement(By.xpath(xpathOfDeletebtn)));
		clickElementByJSExecutor(deleteButton);
		waitForJSandJQueryToLoad();
	}
	
	public void clickLink(String linkText) {
		String link = String.format("//div[@class='pmf-left-navigation-page']//span[text()='%s']", linkText);
		WebElement linkElement = driver.findElement(By.xpath(link));
		clickElementByJSExecutor(linkElement);
		waitForJSandJQueryToLoad();
	}
	
	public void clickAddAdminButton() {
		clickElementByJSExecutor(addAdminButton);
		waitForJSandJQueryToLoad();
	}
	
	public String getPageHeader() {
		return pageHeader.getText();
	}
	
	public String getSectionHeader() {
		return sectionHeader.getText();
	}
}
