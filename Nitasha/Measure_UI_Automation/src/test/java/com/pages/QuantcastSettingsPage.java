package com.pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.How;
import org.openqa.selenium.support.PageFactory;

import com.quantcast.utils.SeleniumUtils;

public class QuantcastSettingsPage {
	
	private WebDriver driver;
	
	@FindBy(how = How.LINK_TEXT, using = "Settings")
	private WebElement settingsLink;
	
	public QuantcastSettingsPage(WebDriver driver) {
		this.driver = driver;
		PageFactory.initElements(driver, this);		
	}

	public String getTitle() {
		SeleniumUtils.isVisible(settingsLink, driver);
		return driver.getTitle();
	}
}
