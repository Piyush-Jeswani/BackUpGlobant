package com.pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.How;
import org.openqa.selenium.support.PageFactory;

import com.quantcast.utils.SeleniumUtils;

public class NetworkProfilePage {
	
	private WebDriver driver;
	
	@FindBy(how = How.CSS, using = "[class='nav__list__item nav__actions__search']")
	private WebElement searchglass;
	
	public NetworkProfilePage(WebDriver driver) {
		this.driver = driver;
		PageFactory.initElements(driver, this);		
	}

	public String getTitle() {
		SeleniumUtils.isVisible(searchglass, driver);
		return driver.getTitle();
	}
}
