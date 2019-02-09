package com.pm.pages.administration;

import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.ui.Select;

import com.pm.pages.common.BasePage;

public class AssessmentBankPage extends BasePage{
	
	@FindBy(id = "pageSize")
	private WebElement pageSizeTxtBox;
	
	@FindBy(xpath = "//input[@id='page_size']/following-sibling::a")
	private WebElement resetPageSizeLink;
	
	@FindBy(className = "app-heading")
	private WebElement pageHeader;
	
	public AssessmentBankPage(){
		super();
	}
	
	public void expandBank(String bankName){
		String xpath = String.format("//a/span[text()[contains(.,'%s')]]/ancestor::td/a[contains(@id,'expandlink')]", bankName);
		driver.findElement(By.xpath(xpath)).click();
		waitForJSandJQueryToLoad();		
	}
	
	public void resetPageSizeTo(String pageSize){
		Select pageSizeSelect = new Select(pageSizeTxtBox);
		pageSizeSelect.selectByVisibleText(pageSize);
		waitForJSandJQueryToLoad();
	}
	
	public void viewAssessment(String assessmentName) throws InterruptedException{
		String xpathOfOptionLink = String.format("//td[text()[contains(.,'%s')]]/preceding-sibling::td//div[@title='Menu']/a", assessmentName);
		clickElementByJSExecutor(driver.findElement(By.xpath(xpathOfOptionLink)));
		waitForJSandJQueryToLoad();
		String xpathOfViewLink = String.format("//td[text()[contains(.,'%s')]]/preceding-sibling::td//li/a[text()='View']", assessmentName);
		clickElementByJSExecutor(driver.findElement(By.xpath(xpathOfViewLink)));
		waitForJSandJQueryToLoad();
	}
	
	public boolean isCatagoriesDisplayed(){
		List<WebElement> categories =  driver.findElements(By.xpath("//tr[contains(@id,'deleteCategory')]"));
		return categories.size() > 0 && categories.get(0).isDisplayed();
	}
	
	public void expandCatagory(String catagoryName){
		String xpath = String.format("//a/b[text()='%s']/ancestor::td[contains(@id,'title')]/a[contains(@href,'toggle')]", catagoryName);
		clickElementByJSExecutor(driver.findElement(By.xpath(xpath)));
		waitForJSandJQueryToLoad();
	}
	
	public boolean isStandardsDisplayed(){
		List<WebElement> standerds = driver.findElements(By.xpath("//td[contains(@id,'subcat')]"));
		return standerds.size() > 0 && standerds.get(0).isDisplayed();
	}
	
	public void expandStandard(String standardName){
		String xpath = String.format("//td[contains(@id,'subcat')]//b[text()[contains(.,'%s')]]/preceding-sibling::a", standardName);
		clickElementByJSExecutor(driver.findElement(By.xpath(xpath)));
	}
	
	public boolean isElementsDisplayed(){
		List<WebElement> elements = driver.findElements(By.xpath("//td[contains(@id,'question_')]"));
		return elements.size() > 0 && elements.get(0).isDisplayed();
	}
	
	public void expandElement(String elementName){
		String xpath = String.format("//td[contains(@id,'question_')]//b[text()[contains(.,'%s')]]/preceding-sibling::a", elementName);
		clickElementByJSExecutor(driver.findElement(By.xpath(xpath)));
	}
	
	public boolean isQuestionsDisplayedFor(String elementName){
		//need to implement
		String xpath = String.format("//b[text()[contains(.,'%s')]]/following-sibling::div//input[@type='checkbox']", elementName);
		List<WebElement> questions = driver.findElements(By.xpath(xpath));
		return questions.size() > 0 && questions.get(0).isDisplayed();
	}
	
	public void clickEditQuestion(String question){
		String xpathOfOption = String.format("//b[text()[contains(.,'%s')]]/ancestor::tr[1]/td[contains(@id,'questionList')]/div/a", question);
		clickElementByJSExecutor(driver.findElement(By.xpath(xpathOfOption)));
		
		String xpathOfEdit = String.format("//b[text()[contains(.,'%s')]]/ancestor::tr[1]/td[contains(@id,'questionList')]//li/a[text()='Edit']", question);
		clickElementByJSExecutor(driver.findElement(By.xpath(xpathOfEdit)));
		driver.switchTo().alert().accept();
		waitForJSandJQueryToLoad();
	}
	
	public void clickSaveChangesBtn(){
		clickElementByJSExecutor(driver.findElement(By.xpath("//div[@class='save-page-bar']/a[text()='Save Changes']")));
	}
	
	public boolean isSelectedByDefaultColumnDispleyed(){
		return	driver.findElement(By.xpath("//form[@id='saveForm']//td/b[text()='Selected by Default:']")).isDisplayed();
	}
	
	public void clickQuestion(String question) {
		String questionCheck = String.format("//td[contains(@id,'question_')]//td[contains(text(),'%s')]/ancestor::tr[1]/td/input", question);
		WebElement questionCheckBox = driver.findElement(By.xpath(questionCheck));
		clickElementByJSExecutor(questionCheckBox);
		waitForJSandJQueryToLoad();
	}
	
	public void clickEdit(String element,String action) {
		String edit = String.format("//b[text()='%s']//ancestor::td[@id='question_']/preceding-sibling::td/div//ul/li/a[text()='%s']", element,action);
		WebElement editButton = driver.findElement(By.xpath(edit));
		clickElementByJSExecutor(editButton);
		
		driver.switchTo().alert().accept();
		waitForJSandJQueryToLoad();
	}
	
	public String getPageHeader() {
		return pageHeader.getText();
	}
}
