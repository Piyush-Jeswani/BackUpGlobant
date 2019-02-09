package com.pm.pages.administration;

import java.util.ArrayList;
import java.util.List;

import org.openqa.selenium.Alert;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindAll;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.FindBys;
import org.openqa.selenium.support.ui.Select;

import com.pm.pages.common.BasePage;

public class PerformanceManagementAdministrationPage extends BasePage{
	
	@FindBy(css = ".pmf-create-form2")
	private WebElement createV2FormButton;
	
	@FindBy(name = "gp.title")
	private WebElement programtitle;
	
	@FindBy(name = "gp.description")
	private WebElement programDescription;
	
	@FindBy(name = "gp.startDate")
	private WebElement programStartDate;
	
	@FindBy(name = "gp.endDate")
	private WebElement programEndDate;
	
	@FindBy(name = "gp.maxAttachments")
	private WebElement programAttachments;
	
	@FindBy(name = "gp.archivedDate")
	private WebElement programArchivedDate;
	
	@FindBy(name = "gp.printMenuTitle")
	private WebElement printMenuTitle;
	
	@FindBy(name = "gp.totalPossible")
	private WebElement totalPossible;
	
	@FindBy(name = "selectedPersonFieldIdList")
	private WebElement personFieldIdList;
	
	@FindBy(name = "save")
	private WebElement saveButton;
	
	@FindBy(xpath = "//h3[contains(text(),'Activity List')]//button")
	private WebElement activityListButton;
	
	@FindBy(xpath = "//div[@id='header']/span")
	private WebElement pageHeader;
	
	@FindBy(name = "activity.title")
	private WebElement title;
	
	@FindBy(name = "activity.instructions")
	private WebElement instructions;
	
	@FindBy(name = "activity.dueDate")
	private WebElement date;
	
	@FindBy(id = "activityTypeDropDown")
	private WebElement activityTypeSelect;
	
	@FindBy(name = "activity.printTitle")
	private WebElement printTitle;
	
	@FindAll({@FindBy(name = "gp.displayAllAttachments")})
	private List<WebElement> displayAttachments;
	
	@FindAll({@FindBy(name = "gp.purgeSignoff")})
	private List<WebElement> signoff;
	
	@FindAll( {@FindBy(name = "gp.keepSignatures")} )
	private List<WebElement> signature;
	
	@FindAll({@FindBy(name="gp.markCompleted")})
	private List<WebElement> completed;
	
	@FindAll({@FindBy(name="gp.isShared")})
	private List<WebElement> shared;
	
	@FindAll({@FindBy(name="gp.isArchived")})
	private List<WebElement> archived;
	
	@FindAll({@FindBy(name = "gp.showRawScore")})
	private List<WebElement> showRawScore;
	
	@FindAll({@FindBy(name="gp.showMappedScore")})
	private List<WebElement> showMappedScore;
	
	@FindAll({@FindBy(name="gp.autoStartTargetedPlan")})
	private List<WebElement> targetedPlan;
		
	public void switchToFormWindow() {
		ArrayList<String> windowHandles = new ArrayList<String> (driver.getWindowHandles());
		for(String window : windowHandles){
			driver.switchTo().window(window);
			if(driver.getTitle().contains("PrimaryDomain - External Channel")){
				break;
			}			
		}
	}
	
	public Formsv2Page clickV2FormButton() {
		clickElementByJSExecutor(createV2FormButton);
		waitForJSandJQueryToLoad();
		return new Formsv2Page();
	}
	
	public AlignObservationPage clickManageLink(String name) {
		String manageLink = String.format("//a[text()='%s']/ancestor::td/following-sibling::td//span[text()='Manage']", name);
		WebElement manageLinkElement = driver.findElement(By.xpath(manageLink));
		clickElementByJSExecutor(manageLinkElement);
		waitForJSandJQueryToLoad();
		return new AlignObservationPage();
	}
	
	public String getPageHeader() {
		return driver.findElement(By.tagName("h1")).getText();
	}
	
	public void clickCreateNewProgram(String programType) {
		String createProgram = String.format("//h3[contains(text(),'%s')]/ancestor::td/div//a[text()='Create a New Program']", programType);
		WebElement createProgramButton = driver.findElement(By.xpath(createProgram));
		createProgramButton.click();
	}
	
	public String verifyCreateProgramPageIsDisplayed() {
		return pageHeader.getText();
	}
	
	public void clickRadioButton(List<WebElement> name,String flag) {
		for (WebElement webElement : name) {
			if(webElement.getAttribute("value").equals(flag)){
				webElement.click();
				break;
			}
		}
	}
	
	public void createAndSaveProgram(String title, String description, String startDate, String endDate,
			String displayAllResult, String maxAttachments, String pureSignOff, String keepSignature,
			String markCompleted, String isShared, String isArchived, String archivedDate, String rawScore,
			String mappedScore, String autoStartTargetedPlan, String menuTitle, String totalPossibleValue,
			List<String> personFieldList) {
		programtitle.clear();
		programtitle.sendKeys(title);
		
		programDescription.clear();
		programDescription.sendKeys(description);
		
		programStartDate.clear();
		programStartDate.sendKeys(startDate);
		
		programEndDate.clear();
		programEndDate.sendKeys(endDate);
		
		clickRadioButton(displayAttachments, displayAllResult);
		programAttachments.clear();
		programAttachments.sendKeys(maxAttachments);
		
		clickRadioButton(signoff, pureSignOff);
		clickRadioButton(signature, keepSignature);
		clickRadioButton(completed,markCompleted);
		clickRadioButton(shared, isShared);
		
		clickRadioButton(archived, isArchived);
		programArchivedDate.clear();
		programArchivedDate.sendKeys(archivedDate);
		
		clickRadioButton(showRawScore, rawScore);
		clickRadioButton(showMappedScore, mappedScore);
		clickRadioButton(targetedPlan, autoStartTargetedPlan);
		
		
		printMenuTitle.clear();
		printMenuTitle.sendKeys(menuTitle);
		
		totalPossible.clear();
		totalPossible.sendKeys(totalPossibleValue);
		
		Select personFields = new Select(personFieldIdList);
		int fieldCount = personFieldList.size();
		if(personFields.isMultiple()){
			for (int i = 0; i < fieldCount; i++) {
				personFields.selectByVisibleText(personFieldList.get(i));
			}
		}
		saveButton.click();	
		waitForJSandJQueryToLoad();
	}
	
	public boolean verifyProgramCreated(String programName) {
		return elementPresent(By.linkText(programName));
	}
	
	public void clickArchivedProgram(String programType) {
		String archivedProgram = String.format("//h3[contains(text(),'%s')]/ancestor::td/div//a[text()='Archived Programs']", programType);
		WebElement archivedProgramButton = driver.findElement(By.xpath(archivedProgram));
		archivedProgramButton.click();
	}
	
	public void clickProgram(String programTitle) {
		WebElement programLink = driver.findElement(By.linkText(programTitle));
		programLink.click();
		waitForJSandJQueryToLoad();
	}
	
	public void clickActivityListButton() {
		clickElementByJSExecutor(activityListButton);
		waitForJSandJQueryToLoad();
	}
	
	public void createActivity(String activityTitle,String activityInstructions,String dueDate,String activityType,String membershipGroupId,String activityPrintTitle) {
		title.clear();
		title.sendKeys(activityTitle);
		
		instructions.clear();
		instructions.sendKeys(activityInstructions);
		
		date.clear();
		date.sendKeys(dueDate);
		
		Select activitytype = new Select(activityTypeSelect);
		activitytype.selectByVisibleText(activityType);
		
		printTitle.clear();
		printTitle.sendKeys(activityPrintTitle);
		
		saveButton.click();
		waitForJSandJQueryToLoad();
	}
	
	public boolean verifyActivityCreated(String activityTitle) {
		return elementPresent(By.linkText(activityTitle));
	}
	
	public void deleteProgram(String programTitle) {
		String programDelete = String.format("//a[text()='%s']/ancestor::td/following-sibling::td/a[text()='Delete']", programTitle);
		WebElement programDeleteButton = driver.findElement(By.xpath(programDelete));
		programDeleteButton.click();
		Alert alert = driver.switchTo().alert();
		alert.sendKeys("yes");
		alert.accept();
		waitForJSandJQueryToLoad();
	}
}
