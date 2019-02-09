package com.pm.pages.administration;

import java.util.ArrayList;
import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.ui.Select;

import com.pm.pages.common.BasePage;

/**
 * @author sunil.dalvi
 *
 */
public class UserAccountsPage extends BasePage {

	public UserAccountsPage() {
		super();
	}

	@FindBy(id = "person-search-term-input")
	private WebElement searchTxtBox;

	@FindBy(css = ".tnlf-search-button.pm-primary-btn.pm-btn-lg")
	private WebElement searchBtn;
	
	@FindBy(linkText = "Set Locations")
	private WebElement setLocationsBtn;
	
	@FindBy(xpath = "//div[@class='save-page-bar']/a[text()='Assume Identity']")
	private WebElement assumeIdentityBtn;
	
	@FindBy(xpath = "//form[@id='doAdvancedPersonSearch']//select[@id='district']")
	private WebElement selectDistrictDropDown;
	
	@FindBy(xpath = "//form[@id='personForm']//select[@id='site']")
	private WebElement selectSiteDropDown;
	
	@FindBy(xpath = "//form[@id='personForm']//a[text()='Add']")
	private WebElement addLocationBtn;
	
	@FindBy(xpath = "//form[@id='personForm']//a[text()='Done']")
	private WebElement doneBtn;
	
	@FindBy(xpath = "//td[@id='tnl-main-td']/div[@class='app-heading']")
	private WebElement pageHeader;
	
	public void searchUserByName(String firstname, String lastname) {
		firstname = firstname.trim();
		lastname = lastname.trim();
		searchTxtBox.clear();
		String usertoSearch = lastname + ", " + firstname;
		searchTxtBox.sendKeys(usertoSearch);
		searchBtn.click();
	}
	
	public void clickOnUser(String firstname, String lastname){
		String fname = firstname.trim();
		String lname = lastname.trim();
		String linkText =String.format("%s%s%s",lname,", ", fname);
		clickElementByJSExecutor(driver.findElement(By.linkText(linkText)));
	}
	
	public void clickAssumeIdendityBtn(){
		clickElementByJSExecutor(assumeIdentityBtn);
		waitForJSandJQueryToLoad();
	}
	
	public void clickSetLocationsBtn(){
		
		clickElementByJSExecutor(setLocationsBtn);
		waitForJSandJQueryToLoad();
	}
	
	public List<String> getAllLocations(){
		List<String> locationNames = new ArrayList<>();
		List<WebElement> locations = driver.findElements(By.xpath("//form[@id='delSiteForm']/table/tbody/tr/td[2]"));
		if (locations.size() > 0) {
			for (WebElement location : locations) {
				locationNames.add(location.getText());
			}
		}
		else{
			
		}
		return locationNames;
	}
	
	public void deleteLocation(String location){
		String splittedLocation[]= location.split(",");
		String district= splittedLocation[0];
		String splittedSite[]=splittedLocation[splittedLocation.length-1].split("- ");
		String site=splittedSite[splittedSite.length-1];
		String xpathOfDeletebtn = String.format("//td[text()[contains(.,\"%s\")][contains(.,\"%s\")]]/preceding-sibling::td[@class='pm-delete-btn']/a", district,site);
		clickElementByJSExecutor(driver.findElement(By.xpath(xpathOfDeletebtn)));
		waitForJSandJQueryToLoad();
	}
	
	public void AddLocation(String location) {
		String splittedLocation[]= location.split(",");
		String district= splittedLocation[0];
		String splittedSite[]=splittedLocation[splittedLocation.length-1].split("- ");
		String site=splittedSite[splittedSite.length-1];	
		selectDistrict(district);
		waitForJSandJQueryToLoad();
		selectSite(site);
		clickElementByJSExecutor(addLocationBtn);	
		waitForJSandJQueryToLoad();
	}
	
	public void clickDoneBtn(){
		clickElementByJSExecutor(doneBtn);
		waitForJSandJQueryToLoad();
	}
	public void selectDistrict(String district){
		new Select(selectDistrictDropDown).selectByVisibleText(district);
	}
	
	public void selectSite(String site){
		Select siteDropDown = new Select(selectSiteDropDown);
		List<WebElement> siteOptions = siteDropDown.getOptions();
		for(WebElement siteOption : siteOptions){
			String siteOptiontext = siteOption.getText();
			if(siteOptiontext.contains(site)){
				siteDropDown.selectByVisibleText(siteOptiontext);
				break;
			}
		}		
	}

	public CalibrationSummaryPage clickViewCalibrationStatusLinkForUser(String firstname, String lastname)
			throws InterruptedException {
		clickActionMenuForUser(firstname, lastname);
		waitForJSandJQueryToLoad();
		String xpath = "//td[1]/div/ul[contains(@style,'top')]/li//span[text()[contains(.,'View Calibration Status')]]/ancestor::a[1]";
		clickElementByJSExecutor(driver.findElement(By.xpath(xpath)));
		waitForJSandJQueryToLoad();
		return new CalibrationSummaryPage();

	}

	public void clickActionMenuForUser(String firstname , String lastname) {

		String linkText = lastname + ", " + firstname;
		
		String xpath = String.format("//span[text()[contains(.,'%s')]]/ancestor::tr[1]/td[1]//button", linkText);
		clickElementByJSExecutor(driver.findElement(By.xpath(xpath)));
	}
	
	public int getAllDistrictSchoolsListCount() {
		return new  Select(selectDistrictDropDown).getOptions().size();
	}
	
	public String getPageHeader() {
		return pageHeader.getText();
	}
	
	public void clickUserAccountLink() {
		WebElement userAccountLink = driver.findElement(By.xpath("//div[@id='navigation']//span[text()='User Accounts']/ancestor::a"));
		clickElementByJSExecutor(userAccountLink);
		waitForJSandJQueryToLoad();
	}
}
