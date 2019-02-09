package com.pm.pages.common;
import java.util.List;
import org.openqa.selenium.Alert;
import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.ui.ExpectedConditions;

public class CourseApprovalPage extends BasePage{
	
	@FindBy(name = "ctitle")
	private WebElement courseTitleTxtBox;
	
	@FindBy(id = "findCourses")
	private WebElement searchBtn;
	
	public CourseApprovalPage() {
		super();
	}
	
	public void searchCourse(String courseTitle){
		courseTitleTxtBox.clear();
		courseTitleTxtBox.sendKeys(courseTitle);
		clickElementByJSExecutor(searchBtn);
		waitForJSandJQueryToLoad();
	}
	
	public void copyCourse(String courseTitle){
		String xpathOfActionsBtn = String.format("//td[text()[contains(.,\"%s\")]]/preceding-sibling::td[2]//td[@class='menuheader']/img", courseTitle);
		
		clickElementByJSExecutor(driver.findElement(By.xpath(xpathOfActionsBtn)));
		
		String xpathOfCopyCourse = String.format("//td[text()[contains(.,\"%s\")]]/preceding-sibling::td[2]//td[@class='menunormal']/a[text()='Copy Course']", courseTitle);
		
		driver.findElement(By.xpath(xpathOfCopyCourse)).click();
		Alert alert = driver.switchTo().alert();
		alert.accept();
		waitForJSandJQueryToLoad();
	}
	
	public boolean isCourseDisplayed(String courseName){
		String xpath = String.format("//td/b[contains(text(),\"%s\")]", courseName);
		
		try{
			wait.until(ExpectedConditions.visibilityOf(driver.findElement(By.xpath(xpath))));
			List<WebElement> copiedCourses =driver.findElements(By.xpath(xpath));
			if(copiedCourses.size()>0){
			return true;
			}
			else{
				return false;
			}
		}
		catch(NoSuchElementException e){
			return false;			
		}		
	}
	
	public void deleteCourse(String courseName){
		
		String xpathOfActionsBtn = String.format("//b[text()=\"%s\"]/ancestor::tr[contains(@class,'rowcolor')]//td[@class='menuheader']/img", courseName);
		
		clickElementByJSExecutor(driver.findElement(By.xpath(xpathOfActionsBtn)));
		
		String xpathOfCopyCourse = String.format("//b[text()=\"%s\"]/ancestor::tr[contains(@class,'rowcolor')]//td[@class='menunormal']/a[text()='Delete Course']", courseName);
		
		clickElementByJSExecutor(driver.findElement(By.xpath(xpathOfCopyCourse)));
		
		driver.switchTo().alert().accept();
		
		waitForJSandJQueryToLoad();
	}
	
	public void selectCourseType(String courseType) {
		WebElement button = driver.findElement(By.xpath("//td[@id='tnl-main-td']//button"));
		button.click();
		
		String courseLink = String.format("//span[text()='%s']/ancestor::a", courseType);
		WebElement courseTypeLink = driver.findElement(By.xpath(courseLink));
		courseTypeLink.click();
	}
	
	public boolean verifyCourseCreated(String courseTitle) {
		String courseName = String.format("//td[contains(text(),'%s')]", courseTitle);
		return elementPresent(By.xpath(courseName));
	}
	
	public void selectNavigationMenu(String linkText) {
		String navigationMenu = String.format("//div[@id='navigation']/ul/li/a[text()='%s']", linkText);
		clickElementByJSExecutor(driver.findElement(By.xpath(navigationMenu)));
		waitForJSandJQueryToLoad();
	}
	
	public void performActionOnCourse(String courseTitle,String action) {
		String courseAction = String.format("//td[contains(text(),'%s')]/preceding-sibling::td//td[@class='menuheader']", courseTitle);
		driver.findElement(By.xpath(courseAction)).click();
		
		clickElementByJSExecutor(driver.findElement(By.linkText(action)));
		waitForJSandJQueryToLoad();
	}
	
	public void actionOnCourse(String courseTitle,String action) {
		String courseAction = String.format("//td/b[contains(text(),'%s')]/ancestor::td/preceding-sibling::td//td[@class='menuheader']", courseTitle);
		driver.findElement(By.xpath(courseAction)).click();
		
		clickElementByJSExecutor(driver.findElement(By.linkText(action)));
		waitForJSandJQueryToLoad();
	}
	
	public void deleteInstructorCourse() {
		clickElementByJSExecutor(driver.findElement(By.linkText("Delete Course")));
		Alert alert = driver.switchTo().alert();
		alert.accept();
		waitForJSandJQueryToLoad();
	}
}
