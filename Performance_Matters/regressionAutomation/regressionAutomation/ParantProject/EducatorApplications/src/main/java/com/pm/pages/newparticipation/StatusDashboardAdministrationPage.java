package com.pm.pages.newparticipation;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import com.pm.pages.common.BasePage;

public class StatusDashboardAdministrationPage extends BasePage {
	@FindBy(xpath = "//span[text()='Add Column']/ancestor::a[1]")
	private WebElement addColumnBtn;
	
	@FindBy(id="addDashboardColumnForm")
	private WebElement addDashboardColumnForm;
	
	//form[@id='addDashboardColumnForm']//label[text()='Label']/following-sibling::input
	
	public StatusDashboardAdministrationPage(){
		super();
	}
	
	public void clickAddColumnBtn(){
		clickElementByJSExecutor(addColumnBtn);
		waitForJSandJQueryToLoad();
		
	}
}
