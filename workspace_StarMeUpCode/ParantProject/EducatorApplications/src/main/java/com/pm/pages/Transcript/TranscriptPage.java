package com.pm.pages.Transcript;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import com.pm.pages.common.BasePage;

public class TranscriptPage extends BasePage{

	public TranscriptPage() {
		super();
	}
	
	@FindBy(name = "templateTitle")
	private WebElement templateTitle;
	
	@FindBy(name = "templateKey")
	private WebElement templateKey;
	
	public void editOfficialTranscriptLayout(String title,String key) {
		clickElementByJSExecutor(driver.findElement(By.linkText("Edit Official Transcript Layout")));
		waitForJSandJQueryToLoad();
		
		templateTitle.clear();
		templateTitle.sendKeys(title);
		waitForJSandJQueryToLoad();
		
		templateKey.clear();
		templateKey.sendKeys(key);
		waitForJSandJQueryToLoad();
		
		clickElementByJSExecutor(driver.findElement(By.linkText("Save")));
		waitForJSandJQueryToLoad();
	}
	
	public void printOfficialTranscript() {
		clickElementByJSExecutor(driver.findElement(By.linkText("Print Official Transcript")));
		waitForJSandJQueryToLoad();
	}
}
