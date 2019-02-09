package com.pm.pages.administration;

import java.util.ArrayList;
import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;

import com.pm.pages.common.BasePage;

public class Formsv2Page  extends BasePage{

	@FindBy(css = ".pmf-create-form2")
	private WebElement createV2FormButton;
	
	@FindBy(name = "title")
	private WebElement formTitleInput;
	
	@FindBy(name = "label")
	private WebElement dateTimeInput;
	
	@FindBy(xpath = "//div[@class='pull-right']//button/span[text()='Add Field']")
	private WebElement addFieldButton;
	
	@FindBy(css = ".pmf-update-description")
	private WebElement updateButton;
	
	@FindBy(xpath = "//h3[contains(text(),'Activity List')]//button")
	private WebElement activityListButton;
	
	@FindBy(name = "title")
	private WebElement activityTitleInput;
	
	@FindBy(id = "pmf-add-form")
	private WebElement addFormButton;
	
	@FindBy(css = ".pmf-add-forms")
	private WebElement addButton;
	
	@FindBy(xpath = "//div[@class='pull-right']//a[text()='Done']")
	private WebElement doneButton;
	
	@FindBy(id = "pmf-add-locking-rules")
	private WebElement addLockingRules;
	
	@FindBy(linkText = "Done")
	private WebElement doneLink;
	
	public Formsv2Page() {
		super();
	}
	
	public void setUp(String regressionProgramName,String formTitle,String dateTimeLabel,String dataDisplayLabel,String dataDisplayDescription,String createFormActivity,String activityTitle,String containerName,String permissionType,String roleName,String permissionCompleteMark,String permissionReopen) throws InterruptedException {
		
		ArrayList<String> windowHandles = new ArrayList<String> (driver.getWindowHandles());
		for(String window : windowHandles){
			driver.switchTo().window(window);
			if(driver.getTitle().contains("PrimaryDomain - External Channel")){
				break;
			}			
		}
		
		clickOnLink(regressionProgramName);
		clickV2FormButton();
		
		setFormTitle(formTitle);
		
		clickOnLink("Form Fields");
		
		enterFieldLabels("Date-Time",dateTimeLabel);
		waitForJSandJQueryToLoad();
		
		
		enterFieldLabels("Data Display",dataDisplayLabel);
		waitForJSandJQueryToLoad();
		
		enterFieldDescription("Data Display", dataDisplayDescription);
		
		switchToDefaultContent();
		clickUpdateButton();
		
		
		clickDoneButton();
		
		clickActivityListButton();
		clickOnLink(createFormActivity);
		
		setActivityTitle(activityTitle);
		selectActivityContainer(containerName);
		waitForJSandJQueryToLoad();
		
		clickAddFormButton();
		
		selectForm(formTitle);
		clickAddButton();
		waitForJSandJQueryToLoad();
		
		WebElement editFormButton = driver.findElement(By.cssSelector(".pm-icon-action-edit-circle"));
		clickElementByJSExecutor(editFormButton);
		
		addPermissionsForUser("Date-Time");
		waitForJSandJQueryToLoad();
		
		addPermissionsForUser("Data Display");
		waitForJSandJQueryToLoad();
		
		clickDoneButton();
		
		selectActivityPermissions(permissionType);
		
		selectRolePermissions(roleName,permissionCompleteMark);
		selectRolePermissions(roleName, permissionReopen);
		
		clickElementByJSExecutor(addLockingRules);
		waitForJSandJQueryToLoad();
		
		clickElementByJSExecutor(doneLink);
		waitForJSandJQueryToLoad();
	}
	
	public void enterFieldLabels(String fieldName,String fieldValue) throws InterruptedException  {
		clickElementByJSExecutor(addFieldButton);
		waitForJSandJQueryToLoad();
		
		clickOnLink(fieldName);
		List<WebElement> fieldTitle = driver.findElements(By.xpath("//tbody[@id='pmf-field-table-body']//td//div[@class='form-control-static']"));
		int fieldTitleCount = fieldTitle.size();
		
		for(int i = 0; i<fieldTitleCount ; i++){
			if(fieldTitle.get(i).getText().equals(fieldName)){
				List<WebElement> fieldInputs = driver.findElements(By.xpath("//tbody[@id='pmf-field-table-body']//td//textarea"));
				fieldInputs.get(i).clear();
				fieldInputs.get(i).sendKeys(fieldValue);
				waitForJSandJQueryToLoad();
				Thread.sleep(1000);
//				wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("pmf-messages")));
				break;
			}
		}
		waitForJSandJQueryToLoad();
	}
	
	public void enterFieldDescription(String fieldName,String fieldValue) {
		List<WebElement> fieldTitle = driver.findElements(By.xpath("//tbody[@id='pmf-field-table-body']//td//div[@class='form-control-static']"));
		int fieldTitleCount = fieldTitle.size();
		
		for(int i = 0; i<fieldTitleCount ; i++){
			if(fieldTitle.get(i).getText().equals(fieldName)){
				List<WebElement> fieldInputs = driver.findElements(By.xpath("//tbody[@id='pmf-field-table-body']//td//a"));
				fieldInputs.get(i).click();
			
				driver.switchTo().frame(driver.findElement(By.xpath("(//iframe[@class='cke_wysiwyg_frame cke_reset'])[2]")));
				WebElement description = driver.findElement(By.xpath("//body/p"));
				try {
					Thread.sleep(5000);
					Actions action= new Actions(driver);
					action.moveToElement(description).click().sendKeys(fieldValue);
					action.build().perform();
					break;
				} catch (Exception e) {
					e.printStackTrace();
				}
			}
		}
	}
	
	public void selectActivityContainer(String containerActivity) {
		Select activityContainer = new Select(driver.findElement(By.name("containerGpActivityId")));
		activityContainer.selectByVisibleText(containerActivity);
		waitForJSandJQueryToLoad();
	}
	
	public void selectForm(String formTitle) {
		List<WebElement> formTitleList = driver.findElements(By.xpath("//form[@class='pmf-add-selected-forms']//label"));
		int formTitleListCount = formTitleList.size();
		
		for(int i = 0;i<formTitleListCount;i++){
			if(formTitleList.get(i).getText().equals(formTitle)) {
				waitForJSandJQueryToLoad();
				clickElementByJSExecutor(formTitleList.get(i).findElement(By.tagName("input")));
				waitForJSandJQueryToLoad();
//				clickElementByJSExecutor(formTitleList.get(i));
				break;
			}
		}
	}
	
	public void selectActivityPermissions(String permissionName) {
		permissionName = permissionName.toUpperCase();
		String permissionPath = String.format("//input[@value='%s']", permissionName);
		WebElement permissionButton = driver.findElement(By.xpath(permissionPath));
		clickElementByJSExecutor(permissionButton);
	}
	
	public void selectRolePermissions(String roleName,String permission) {
		String roleXpath = String.format("//strong[contains(text(),'%s')]//ancestor::div[1]//following-sibling::div//input[@name='%sAccessGroupIdList']", roleName,permission);
		WebElement roleElement = driver.findElement(By.xpath(roleXpath));
		clickElementByJSExecutor(roleElement);
	}
	
	public void openNewTab(String linkName) throws InterruptedException {
		ArrayList<String> windowHandles = new ArrayList<String> (driver.getWindowHandles());
		for(String window : windowHandles){
			driver.switchTo().window(window);
			if(driver.getTitle().contains("Administration")){
				break;
			}			
		}
	}
	
	public void addPermissionsForUser(String fieldType) {
		String xpath = String.format("//div[text()='%s']/ancestor::div[1]/div/span[@class='pmf-field-operation text-center']/span", fieldType);
		List<WebElement> permissionsList = driver.findElements(By.xpath(xpath));
		
		for (WebElement webElement : permissionsList) {
			clickElementByJSExecutor(webElement);
			waitForJSandJQueryToLoad();
		}
	}
	
	public void setFormTitle(String formTitle) {
		formTitleInput.clear();
		formTitleInput.sendKeys(formTitle);
		waitForJSandJQueryToLoad();
	}
	
	public void clickAddFieldButton() {
		clickElementByJSExecutor(addFieldButton);
		waitForJSandJQueryToLoad();
	}
	
	public void switchToFormWindow() {
		ArrayList<String> windowHandles = new ArrayList<String> (driver.getWindowHandles());
		for(String window : windowHandles){
			driver.switchTo().window(window);
			if(driver.getTitle().contains("PrimaryDomain - External Channel")){
				break;
			}			
		}
	}
	
	public void clickV2FormButton() {
		clickElementByJSExecutor(createV2FormButton);
		waitForJSandJQueryToLoad();
	}
	
	public void switchToDefaultContent() {
		driver.switchTo().defaultContent();
		waitForJSandJQueryToLoad();
	}
	
	public void clickUpdateButton() {
		Actions action= new Actions(driver);
		action.moveToElement(updateButton).click();
		action.build().perform();
		waitForJSandJQueryToLoad();
	}
	
	public void clickDoneButton() throws InterruptedException {
		wait.until(ExpectedConditions.elementToBeClickable(doneButton));
		waitForJSandJQueryToLoad();
		doneButton.click();
		//clickElementByJSExecutor(doneButton);
		//Thread.sleep(5000);
		waitForJSandJQueryToLoad();
	}
	
	public void clickActivityListButton() {
		clickElementByJSExecutor(activityListButton);
		waitForJSandJQueryToLoad();
	}
	
	public void setActivityTitle(String activityTitle) {
		activityTitleInput.clear();
		activityTitleInput.sendKeys(activityTitle);
		waitForJSandJQueryToLoad();
	}
	
	public void clickAddFormButton() {
		clickElementByJSExecutor(addFormButton);
		waitForJSandJQueryToLoad();
	}
	
	public void clickAddButton() {
		clickElementByJSExecutor(addButton);
	}
	
	public boolean getFieldIds(String fieldName) {
		List<WebElement> fieldTitle = driver.findElements(By.xpath("//tbody[@id='pmf-field-table-body']//td//div[@class='form-control-static']"));
		int fieldTitleCount = fieldTitle.size();
		String fieldID = "";
		for(int i = 0; i<fieldTitleCount ; i++){
			if(fieldTitle.get(i).getText().equals(fieldName)){
				List<WebElement> fieldInputs = driver.findElements(By.xpath("//tbody[@id='pmf-field-table-body']//td[2]"));
				waitForJSandJQueryToLoad();
				fieldID = fieldInputs.get(i).getText();
				break;
			}
		}
		waitForJSandJQueryToLoad();
		return fieldID.isEmpty();
		
//		return fieldID;
		
	}
	
	public String getFormIDFormPage(String formTitle) {
		String formId = String.format("//span[text()='%s']//ancestor::td//preceding-sibling::td", formTitle);
		WebElement formIDElement = driver.findElement(By.xpath(formId));
		return formIDElement.getText();
	}
	
	public String getFormIdActivityPage(String formTitle) {
		String formID = String.format("//label[text()='%s']//ancestor::div[2]/following-sibling::div[1]", formTitle);
		WebElement formIDElement = driver.findElement(By.xpath(formID));
		return formIDElement.getText();
	}
	
	public String getFormId(String formTitle) {
		String formID = String.format("//span[text()='%s']//ancestor::div[1]/preceding-sibling::div[1]", formTitle);
		WebElement formIDElement = driver.findElement(By.xpath(formID));
		return formIDElement.getText();
	}
	
	public void deleteForm(String formTitle) {
		String formDeleteButton = String.format("//span[text()='%s']//ancestor::td//following-sibling::td/a[text()='Delete']", formTitle);
		WebElement formIDElement = driver.findElement(By.xpath(formDeleteButton));
		formIDElement.click();
		driver.switchTo().alert().accept();
		waitForJSandJQueryToLoad();
	}
}
