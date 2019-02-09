package com.pm.pages.administration;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import com.pm.pages.common.BasePage;

public class LearningOpportunityPage  extends BasePage{

	public LearningOpportunityPage() {
		super();
	}
	
	@FindBy(name="course_external_id")
	private WebElement courseExternal;
	
	@FindBy(name = "course_title")
	private WebElement courseName;
	
	@FindBy(name="course_desc")
	private WebElement courseDesc;
	
	@FindBy(linkText="Create PLC Learning Opportunity")
	private WebElement createCourseButton;
	
	public void createLearningOpportunityCourse(String courseId,String courseTitle,String description,String creditType,String valueText,String testwnText,String testValueText,String newValue) {
		courseExternal.clear();
		courseExternal.sendKeys(courseId);
		
		courseName.clear();
		courseName.sendKeys(courseTitle);
		
		courseDesc.clear();
		courseDesc.sendKeys(description);
		
		waitForJSandJQueryToLoad();
		
		String credit = String.format("//label[text()='%s']/ancestor::td[1]/preceding-sibling::td//input", creditType);
		WebElement creditCheckBox = driver.findElement(By.xpath(credit));
		clickElementByJSExecutor(creditCheckBox);
		waitForJSandJQueryToLoad();
		
		String value = String.format("//label[text()='%s']/ancestor::td[1]/following-sibling::td//input[@name='creditArea_area2_vt1']", creditType);
		WebElement valueElement = driver.findElement(By.xpath(value));
		valueElement.clear();
		valueElement.sendKeys(valueText);
		
		String testwn = String.format("//label[text()='%s']/ancestor::td[1]/following-sibling::td//input[@name='creditArea_area2_vt11']", creditType);
		WebElement testwnElement = driver.findElement(By.xpath(testwn));
		testwnElement.clear();
		testwnElement.sendKeys(testwnText);
		
		String testValue = String.format("//label[text()='%s']/ancestor::td[1]/following-sibling::td//input[@name='creditArea_area2_vt14']", creditType);
		WebElement testValueElement = driver.findElement(By.xpath(testValue));
		testValueElement.clear();
		testValueElement.sendKeys(testValueText);
		
		String testValueNew = String.format("//label[text()='%s']/ancestor::td[1]/following-sibling::td//input[@name='creditArea_area2_vt19']", creditType);
		WebElement testValueNewElement = driver.findElement(By.xpath(testValueNew));
		testValueNewElement.clear();
		testValueNewElement.sendKeys(newValue);
		
		clickElementByJSExecutor(createCourseButton);
		waitForJSandJQueryToLoad();
	}
	
}
