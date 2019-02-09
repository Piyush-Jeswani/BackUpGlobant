package com.pm.pages.administration;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import com.pm.pages.common.BasePage;

public class UIManagerPage extends BasePage{
	
	@FindBy(xpath = "//li[@id='root_GENERIC_UI_MANAGER_item']/a")
	private WebElement GenericUIManagerLink;
	
	@FindBy(xpath = "//li[@id='root_GENERIC_UI_MANAGER_course_item']/a")
	private WebElement courseLink;
	
	@FindBy(xpath = "//li[@id='GENERIC_UI_MANAGER_course_EditCourse']/a")
	private WebElement editCourseLink;
	
	@FindBy(xpath = "//div[@id='masterUi']/div[@class='CodeMirror']")
	private WebElement masterUISection;
	
	@FindBy(xpath = "//div[@id='currentUi']/div[@class='CodeMirror']")
	private WebElement currentUISection;	
	
	public UIManagerPage(){
		super();
	}
	
	public void clickEditCourseLink(){
		clickElementByJSExecutor(GenericUIManagerLink);
		waitForJSandJQueryToLoad();
		clickElementByJSExecutor(courseLink);
		waitForJSandJQueryToLoad();
		clickElementByJSExecutor(editCourseLink);
		waitForJSandJQueryToLoad();
	}
	
	public boolean masterUIMangerCodeDisplayed(){
		return masterUISection.isDisplayed();
	}
	
	public boolean currentUIMangerCodeDisplayed(){
		return currentUISection.isDisplayed();
	}
}
