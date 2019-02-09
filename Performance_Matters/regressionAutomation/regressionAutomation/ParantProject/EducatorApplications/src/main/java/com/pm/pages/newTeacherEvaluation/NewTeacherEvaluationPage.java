package com.pm.pages.newTeacherEvaluation;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.ui.ExpectedConditions;

import com.pm.pages.common.BasePage;

public class NewTeacherEvaluationPage extends BasePage {
	
	@FindBy(xpath = "//header[@id='tnlf-page-header']//h1")
	private WebElement pageTitle;
	
	@FindBy(xpath = "//div[@class='tnl-current-step alert alert-success']/div")
	private WebElement activitySubmit;
	
	@FindBy(xpath = "//div[@id='gptabs']//li//span[text()='Evaluation Participation']")
	private WebElement evaluationParticipation;
	
	@FindBy(css = ".tnlf-edit-form-button")
	private WebElement activityEditButton;
	
	@FindBy(name = "_22191")
	private WebElement textArea1;
	
	@FindBy(name = "_22190")
	private WebElement textArea2;
	
	@FindBy(id = "saveAnswersBtn")
	private WebElement saveAndExitButton;
	
	@FindBy(css = ".pm-outline-btn.pm-btn-lg")
	private WebElement printDoneButton;
	
	@FindBy(css = ".tnl-no-print>span")
	private WebElement printTemplateHeader;
	
	@FindBy(css = ".pm-error-btn")
	private WebElement deleteButton;
	
	public NewTeacherEvaluationPage() {
		super();
	}
	
	public String getPageTitle(){
		return pageTitle.getText();
	}
	
	public NewTeacherEvaluationPage clickTeacherEvaluationProgram(String programName) {
		clickElementByJSExecutor(driver.findElement(By.linkText(programName)));
		waitForJSandJQueryToLoad();
		return new NewTeacherEvaluationPage();
	}
	
	public WebElement clickActivityContainer(String ContainerName) {
		String xpath = "//span[text()='" + ContainerName + "']/ancestor::div[2]";
		wait.until(ExpectedConditions.visibilityOf(driver.findElement(By.xpath(xpath))));
		WebElement activityContainer = driver.findElement(By.xpath(xpath));
		activityContainer.click();
		return driver.findElement(By.xpath(xpath));
	}

	public NewTeacherEvaluationPage clickOnActivityFromActivityContainer(String activityname, String ActivityContainerName) {
		waitForJSandJQueryToLoad();
		WebElement activityContainer = clickActivityContainer(ActivityContainerName);
		waitForJSandJQueryToLoad();
		clickElementByJSExecutor(activityContainer.findElement(By.linkText(activityname)));
		waitForJSandJQueryToLoad();
		return new NewTeacherEvaluationPage();
	}
	
	public void clickDropDown() {
		WebElement dropDown = driver.findElement(By.xpath("//div[@class='btn-group tnl-button-menu']/button"));
		clickElementByJSExecutor(dropDown);
	}
	
	public void submitButton() {
		WebElement submitButton = driver.findElement(By.xpath("//td[@id='actionMenuCell']//span[text()='Submit']//parent::a"));
		clickElementByJSExecutor(submitButton);
	}
		
	public void clickDateInput() {
		WebElement datePicker = driver.findElement(By.xpath("//form[@class='pmf-form-autosave']//input[@type='datetime-local']"));
		clickElementByJSExecutor(datePicker);
		waitForJSandJQueryToLoad();
	}
	
	public void selectDateTime(Calendar calendar,String hourTime,String hourMinute) {
		DateFormat formatDate = new SimpleDateFormat("dd");
        DateFormat monthFormat = new SimpleDateFormat("MMM yyyy");
        
        Date currentDate = calendar.getTime();
        String presentDate = formatDate.format(currentDate);
        String month = monthFormat.format(currentDate);
        
        WebElement monthName = driver.findElement(By.xpath("//form[@class='pmf-form-autosave']//div[@class='datepicker-days']//th[@class='picker-switch']"));
        
        while(!monthName.getText().equals(month)){
        	clickElementByJSExecutor(driver.findElement(By.xpath("//form[@class='pmf-form-autosave']//div[@class='datepicker-days']//th[@class='next']")));
        	monthName = driver.findElement(By.xpath("//form[@class='pmf-form-autosave']//div[@class='datepicker-days']//th[@class='picker-switch']"));
        }
        
		List<WebElement> dateList = driver.findElements(By.xpath("//form[@class='pmf-form-autosave']//div[@class='datepicker-days']//td[@class != 'day new' and @class != 'day new weekend']"));
				
		for (WebElement webElement : dateList) {
			if(presentDate.contains(webElement.getText())) {
				clickElementByJSExecutor(webElement);
				waitForJSandJQueryToLoad();
				break;
			}
		}
		
		clickElementByJSExecutor(driver.findElement(By.xpath("//span[@class='timepicker-hour']")));
		waitForJSandJQueryToLoad();
		
		List<WebElement> hourList = driver.findElements(By.xpath("//div[@class='timepicker-hours']//td"));
		
		for (WebElement webElement : hourList) {
			if(hourTime.contains(webElement.getText())){
				clickElementByJSExecutor(webElement);
				waitForJSandJQueryToLoad();
				break;
			}
		}
		
		clickElementByJSExecutor(driver.findElement(By.xpath("//span[@class='timepicker-minute']")));
		waitForJSandJQueryToLoad();
		
		List<WebElement> minuteList = driver.findElements(By.xpath("//div[@class='timepicker-minutes']//td"));
		
		for (WebElement webElement : minuteList) {
			if(hourMinute.contains(webElement.getText())){
				clickElementByJSExecutor(webElement);
				waitForJSandJQueryToLoad();
				break;
			}
		}
		
		WebElement periodButton = driver.findElement(By.xpath("//button[@title = 'Toggle Period']"));
		
		if(periodButton.getText().equals("AM")){
			clickElementByJSExecutor(periodButton);
			waitForJSandJQueryToLoad();
		}
	}
	
	public String getDataDisplayDescription() {
		WebElement dataDescription = driver.findElement(By.xpath("//span[@class='help-block']/p"));
		return dataDescription.getText() ;
	}
	
	public void enterDateTime() {
		WebElement dateTime = driver.findElement(By.name("fieldAnswerList[0].valueList"));
		dateTime.sendKeys("02-12-2017 12:30");
	}
	
	public void editActivity(String text1,String text2) {
		clickElementByJSExecutor(activityEditButton);
		waitForJSandJQueryToLoad();
		
		textArea1.clear();
		textArea1.sendKeys(text1);
		
		textArea2.clear();
		textArea2.sendKeys(text2);
		
		clickElementByJSExecutor(saveAndExitButton);
		waitForJSandJQueryToLoad();
	}
	
	public void clickPrintform() {
		clickOnLink("Print Form - Fairfax Print Template");
	}
	
	public List<String> getPDFContents() {
		List<WebElement> pdfContentList = driver.findElements(By.xpath("//div[@id='pdfContent']//td[2]//span"));
		List<String> pdfContents = new ArrayList<String>();
		for (WebElement webElement : pdfContentList) {
			pdfContents.add(webElement.getText());
		}
		return pdfContents;
	}
	
	public void clickDoneButton() {
		clickElementByJSExecutor(printDoneButton);
		waitForJSandJQueryToLoad();
	}
	
	public String getPrintTemplateText() {
		return printTemplateHeader.getText();
	}
	
	public boolean verifyEditButtonIsPresent() {
		return elementPresent(By.cssSelector(".tnlf-edit-form-button"));
	}
	
	public boolean verifyDeleteButtonPresent() {
		return elementPresent(By.cssSelector(".pm-error-btn"));
	}
}
