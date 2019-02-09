package com.pm.pages.administration;

import java.io.IOException;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import com.pm.pages.common.BasePage;

public class InstructorLEDCoursePage  extends BasePage{

	public InstructorLEDCoursePage() {
		super();
	}
	
	@FindBy(name="course_external_id")
	private WebElement courseExternal;
	
	@FindBy(name = "course_title")
	private WebElement courseName;
	
	@FindBy(id = "course_desc_ifr")
	private WebElement courseDescription;
	
	@FindBy(xpath = "//body[@id='tinymce']/p")
	private WebElement descriptionBody;
		
	@FindBy(name="course_disclaimer")
	private WebElement courseDisclaimer;
	
	@FindBy(name = "schoolWorldCategory")
	private WebElement schoolWorldCategory;
	
	@FindBy(name="sectionStartTimeReq")
	private WebElement sectionStartTimeReq;
	
	@FindBy(name="course_multiple_enroll")
	private WebElement courseMultipleEnroll;
	
	@FindBy(name = "courseSurvey")
	private WebElement courseSurvey;
	
	@FindBy(css = ".tnlf-file-upload")
	private WebElement uploadFileButton;
	
	@FindBy(linkText="Create Instructor Led Course")
	private WebElement createCourseButton;
	
	@FindBy(id = "course_title-infield-id")
	private WebElement courseTitle;
	
	public void createInstructorLedCourse(String courseTitle,String description,String disclaimer,String schoolCat,String sectionTime,String survey,String creditType,String valueText,String testwnText,String testValueText,String newValue) throws InterruptedException, IOException {
			
		courseName.clear();
		courseName.sendKeys(courseTitle);
		
		waitForJSandJQueryToLoad();
		wait.until(ExpectedConditions.visibilityOf(courseDescription));
		driver.switchTo().frame("course_desc_ifr");
		actions.moveToElement(descriptionBody).click().sendKeys(description).build().perform();
		
		driver.switchTo().defaultContent();
		
		courseDisclaimer.clear();
		courseDisclaimer.sendKeys(disclaimer);
		
		Select schoolCategory = new Select(schoolWorldCategory);
		schoolCategory.selectByVisibleText(schoolCat);
		
		waitForJSandJQueryToLoad();
		
		String credit = String.format("//label[text()='%s']/ancestor::td[1]/preceding-sibling::td//input", creditType);
		WebElement creditCheckBox = driver.findElement(By.xpath(credit));
		clickElementByJSExecutor(creditCheckBox);
		waitForJSandJQueryToLoad();
		
		String value = String.format("//label[text()='%s']/ancestor::td[1]/following-sibling::td//input[@name='creditArea_area1_vt1']", creditType);
		WebElement valueElement = driver.findElement(By.xpath(value));
		valueElement.clear();
		valueElement.sendKeys(valueText);
		
		String testwn = String.format("//label[text()='%s']/ancestor::td[1]/following-sibling::td//input[@name='creditArea_area1_vt11']", creditType);
		WebElement testwnElement = driver.findElement(By.xpath(testwn));
		testwnElement.clear();
		testwnElement.sendKeys(testwnText);
		
		String testValue = String.format("//label[text()='%s']/ancestor::td[1]/following-sibling::td//input[@name='creditArea_area1_vt14']", creditType);
		WebElement testValueElement = driver.findElement(By.xpath(testValue));
		testValueElement.clear();
		testValueElement.sendKeys(testValueText);
		
		String testValueNew = String.format("//label[text()='%s']/ancestor::td[1]/following-sibling::td//input[@name='creditArea_area1_vt19']", creditType);
		WebElement testValueNewElement = driver.findElement(By.xpath(testValueNew));
		testValueNewElement.clear();
		testValueNewElement.sendKeys(newValue);
		
		String bankable = String.format("//label[text()='%s']/ancestor::td[1]/following-sibling::td//input[@name='creditArea_area_bankable']", creditType);
		WebElement bankableCheckBox = driver.findElement(By.xpath(bankable));
		bankableCheckBox.click();
		
		Select sectionStartTime = new Select(sectionStartTimeReq);
		sectionStartTime.selectByVisibleText(sectionTime);
		
		clickElementByJSExecutor(courseMultipleEnroll);
		waitForJSandJQueryToLoad();
		
		Select coursesurvey = new Select(courseSurvey);
		coursesurvey.selectByVisibleText(survey);
		clickElementByJSExecutor(createCourseButton);
		waitForJSandJQueryToLoad();
	}
	
	public String verifyInstructorLEDCourseCreated() {
		return courseTitle.getText();
	}
	
}
