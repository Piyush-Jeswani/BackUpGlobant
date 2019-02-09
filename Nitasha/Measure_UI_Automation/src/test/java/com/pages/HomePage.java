package com.pages;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.How;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import com.Listener.TestListener;
import com.aventstack.extentreports.ExtentTest;
import com.aventstack.extentreports.Status;
import com.quantcast.utils.CommonUtils;
import com.quantcast.utils.SeleniumUtils;

public class HomePage {

	private WebDriver driver;

	@FindBy(how = How.CSS, using = "[class='nav__list__item nav__actions__search']")
	private WebElement searchglass;
	@FindBy(how = How.XPATH, using = "//div[@class='network-children']/div[1]//a")
	private WebElement appContainer;

	@FindBy(how = How.XPATH, using = ".//*[@id='globalHeader']/nav[1]/form/a")
	private WebElement top100link;

	@FindBy(how = How.XPATH, using = ".//*[@id='globalHeader']/nav[1]/a/div")
	private WebElement header;
	
	@FindBy(how = How.XPATH, using = "//div[@class='network-children']/div[1]//i[@class='fa fa-cog icon-actions-item-icon']")
	private WebElement editSettingButton;

	@FindBy(how = How.ID, using = "globalHeader")
	private WebElement globalHeader;

	@FindBy(how = How.ID, using = "globalFooter")
	private WebElement globalFooter;

	@FindBy(how = How.CSS, using = "#qcDashboard>header>h2")
	private WebElement properties;

	@FindBy(how = How.CSS, using = ".header-controls>a")
	private WebElement classicButton;

	@FindBy(how = How.XPATH, using = "//div[@class='menu']//button")
	private WebElement threeDots;

	@FindBy(how = How.CSS, using = ".onpage-content")
	private WebElement instructionsContainer;

	@FindBy(how = How.XPATH, using = "//div[@class='user-properties']//h5")
	private WebElement myPropertiesTitle;

	@FindBy(how = How.CSS, using = ".network-property-banner")
	private WebElement networkContainer;

	@FindBy(how = How.XPATH, using = "//p[@class='card-subheader' and text() = 'Site']")
	private WebElement sitePropertiesContainer;

	@FindBy(how = How.XPATH, using = "//p[@class='card-subheader' and text() = 'Mobile App']")
	private WebElement mobileAppsPropertiesContainer;

	@FindBy(how = How.XPATH, using = "//div[@id='intercom-container']/div[@class='intercom-launcher']")
	private WebElement chartIcon;

	@FindBy(how = How.XPATH, using = "//div[@class='lower']")
	private WebElement linksSection;

	@FindBy(how = How.ID, using = "searchSiteBar")
	private WebElement searchSiteBar;

	@FindBy(how = How.CSS, using = ".add-property-dropdown")
	private WebElement btnAddProperty;

	@FindBy(how = How.XPATH, using = "//div[@class='reveal-surprise']//li[2]")
	private WebElement lnkAddMobileApp;

	@FindBy(how = How.XPATH, using = "//div[@class='reveal-surprise']//li[1]")
	private WebElement lnkAddWebsite;
	@FindBy(how = How.XPATH, using = "//div[@class='network-property-header-controls']/a")
	private WebElement viewDataButton;

	@FindBy(how = How.CSS, using = ".fa.fa-cog.icon-actions-item-icon")
	private WebElement editSettingsWheelIcon;

	@FindBy(how = How.XPATH, using = "//div[@class='network-children']/div[1]//aside//a[2]")
	private WebElement viewYourDataLink;

	public HomePage(WebDriver driver) {
		this.driver = driver;
		PageFactory.initElements(driver, this);

	}

	public String getTitle() {
		SeleniumUtils.isVisible(searchglass, driver);
		return driver.getTitle();
	}

	public void openURL(String URL) {
		driver.get(URL);
	}

	public LoginPage clickOnSignOutButton() {

		/*
		 * SeleniumUtils.isClickable(signOutLink, driver); //
		 * SeleniumUtils.scrollToView(driver, signOutLink); signOutLink.click();
		 */
		return new LoginPage(driver);
	}

	public void clickOnSearchGlass() {

		SeleniumUtils.isClickable(searchglass, driver);
		// SeleniumUtils.scrollToView(driver, signOutLink);
		searchglass.click();

	}

	public TopSitesPage clickOnTop100Link() {

		SeleniumUtils.isClickable(top100link, driver);
		// SeleniumUtils.scrollToView(driver, signOutLink);
		top100link.click();
		return new TopSitesPage(driver);

	}

	public boolean isGlobalHeaderDisplayed()

	{

		return SeleniumUtils.isVisible(globalHeader, driver);

	}

	public boolean isGlobalFooterDisplayed()

	{

		return SeleniumUtils.isVisible(globalFooter, driver);

	}

	public String getPropertiesTitle() {

		return properties.getText();
	}

	public boolean isClassicButtonDisplayed() {

		return SeleniumUtils.isVisible(classicButton, driver);
	}

	public boolean isThreeDotsDisplayed() {

		return SeleniumUtils.isVisible(threeDots, driver);
	}

	public boolean isInstructionsContainerDisplayed() {

		return SeleniumUtils.isVisible(instructionsContainer, driver);
	}

	public String getMyProperties() {

		return myPropertiesTitle.getText();
	}

	public String getClassicButtonText() {

		return classicButton.getText();
	}

	public boolean isNetworkContainerDisplayed() {

		return SeleniumUtils.isVisible(instructionsContainer, driver);
	}

	public boolean isSitePropertiesContainerDisplayed() {

		return SeleniumUtils.isVisible(sitePropertiesContainer, driver);
	}

	public boolean isMobileAppContainerDisplayed() {

		return SeleniumUtils.isVisible(mobileAppsPropertiesContainer, driver);
	}

	public boolean isSearchSiteBarDisplayed() {

		return SeleniumUtils.isVisible(searchSiteBar, driver);
	}

	public boolean islinksDisplayed() {

		return SeleniumUtils.isVisible(linksSection, driver);
	}

	public boolean isChartIconDisplayed() {

		return SeleniumUtils.isVisible(chartIcon, driver);
	}

	public SubmitYourAppPage selectAddProperty() {
		SeleniumUtils.isVisible(btnAddProperty, driver);
		btnAddProperty.click();
		return new SubmitYourAppPage(this.driver);
	}

	public SubmitYourAppPage selectAddMobileApp() {
		SeleniumUtils.isVisible(lnkAddMobileApp, driver);
		lnkAddMobileApp.click();
		return new SubmitYourAppPage(this.driver);
	}

	public SubmitYourAppPage selectAddWebsite() {
		SeleniumUtils.isVisible(lnkAddWebsite, driver);
		lnkAddWebsite.click();
		return new SubmitYourAppPage(this.driver);
	}

	public NetworkProfilePage clickOnViewData() {
		SeleniumUtils.isVisible(viewDataButton, driver);
		viewDataButton.click();
		return new NetworkProfilePage(driver);
	}

	public SiteProfilePage clickOnViewYourData() {
		SeleniumUtils.isVisible(viewYourDataLink, driver);
	
		//new Actions(driver).moveToElement(viewYourDataLink).build().perform();
		new Actions(driver).moveToElement(viewYourDataLink).click(viewYourDataLink).build().perform();
		return new SiteProfilePage(driver);
	}
	
	public NetworkSettingsPage clickOnEditSettingsWheel() {
		SeleniumUtils.isVisible(editSettingsWheelIcon, driver);
		editSettingsWheelIcon.click();
		return new NetworkSettingsPage(driver);
	}

	public SiteProfilePage clickOnProfilePageURL(String profileName) {
		driver.get("https://test.quantcast.com/measure/" + profileName);
		return new SiteProfilePage(driver);
	}

	public void HoverOverContainer() {
		SeleniumUtils.isVisible(appContainer, driver);
		new Actions(driver).moveToElement(appContainer).build().perform();
	}
	
	public QuantcastSettingsPage editSettings() {
		SeleniumUtils.isClickable(editSettingButton, driver);
		editSettingButton.click();
		return new QuantcastSettingsPage(driver);
	}

}
