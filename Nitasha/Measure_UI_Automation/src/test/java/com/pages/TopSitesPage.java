package com.pages;

import java.util.ArrayList;
import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.How;
import org.openqa.selenium.support.PageFactory;

import com.Listener.TestListener;
import com.aventstack.extentreports.ExtentTest;
import com.aventstack.extentreports.Status;
import com.quantcast.utils.CommonUtils;
import com.quantcast.utils.SeleniumUtils;

import stepDefinition.Hooks;

public class TopSitesPage {

	private WebDriver driver;
	
	
	@FindBy(how = How.LINK_TEXT, using ="#ctl00_cplBody_lblError")
	private List<WebElement> errorMessage;
	
	public TopSitesPage(WebDriver driver) {
		this.driver = driver;
		PageFactory.initElements(driver, this);
		
	}
	
	public SiteProfilePage clickOnSite(String sitelink) {
		
		SeleniumUtils.isClickable(driver.findElement(By.linkText(sitelink)), driver);
		// SeleniumUtils.scrollToView(driver, signOutLink);
		driver.findElement(By.linkText(sitelink)).click();
		return new SiteProfilePage(driver);

	}

	
}
