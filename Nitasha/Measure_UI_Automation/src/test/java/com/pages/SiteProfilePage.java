package com.pages;

import java.util.List;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.How;
import org.openqa.selenium.support.PageFactory;

import com.Listener.TestListener;
import com.aventstack.extentreports.ExtentTest;
import com.aventstack.extentreports.Status;
import com.quantcast.utils.SeleniumUtils;

import stepDefinition.Hooks;

public class SiteProfilePage {

	private WebDriver driver;

	@FindBy(how = How.XPATH, using = ".//*[@id='globalHeader']/nav[1]/a/div")
	private WebElement globalHeader;

	@FindBy(how = How.ID, using = "navPanelToggle")
	private WebElement siteNameContainer;

	@FindBy(how = How.LINK_TEXT, using = "#ctl00_cplBody_lblError")
	private List<WebElement> errorMessage;

	@FindBy(how = How.ID, using = "globalFooter")
	private WebElement globalFooter;

	@FindBy(how = How.XPATH, using = "//div[@id='trafficCard']//*[@class='resize w']//*[@class='bar']")
	private WebElement trafficStartDateSelector;

	@FindBy(how = How.XPATH, using = "//div[@id='trafficCard']//*[@class='resize e']//*[@class='bar']")
	private WebElement trafficEndDateSelector;

	@FindBy(how = How.XPATH, using = "//div[@id='crossPlatformCard']//*[@class='resize w']//*[@class='bar']")
	private WebElement crossPlatformStartDateSelector;

	@FindBy(how = How.CSS, using = "[ng-bind='summaryInfo.profileStatus']")
	private WebElement sitelogo;

	@FindBy(how = How.CSS, using = "[ng-attr-title='{{ summaryInfo.descSanitized }}']")
	private WebElement sitedescription;

	@FindBy(how = How.XPATH, using = "//div[@id='trafficCard']//h4/span[1]")
	private WebElement trafficStartDateMap;

	@FindBy(how = How.XPATH, using = "//div[@id='trafficCard']//h4/span[2]")
	private WebElement trafficEndDateMap;

	@FindBy(how = How.XPATH, using = "//div[@id='trafficCard']//*[@id='customStart']")
	private WebElement customStartDate;

	@FindBy(how = How.ID, using = "customEnd")
	private WebElement customEndDate;

	@FindBy(how = How.XPATH, using = "//div[@id='trafficCard']//*[@class='brush']//*[@class='extent']")
	private WebElement blueHighlightedSection;

	@FindBy(how = How.XPATH, using = "//*[@id='trafficCard']//*[@class='y-axis axis']")
	private WebElement cursorElement;

	@FindBy(how = How.CSS, using = ".fa.fa-cog")
	private WebElement wheelIcon;

	@FindBy(how = How.LINK_TEXT, using = "Impersonate")
	private WebElement impersonateLink;
	
	@FindBy(how = How.LINK_TEXT, using = "Properties")
	private WebElement propertiesLink;

	public SiteProfilePage(WebDriver driver) {
		this.driver = driver;
		PageFactory.initElements(driver, this);

	}

	public boolean isGlobalHeaderDisplayed()

	{

		return SeleniumUtils.isVisible(globalHeader, driver);

	}

	public boolean isSiteNameDisplayed(String sitename)

	{

		SeleniumUtils.isVisible(siteNameContainer, driver);
		return siteNameContainer.getText().contains(sitename);

	}

	public boolean isQuantCastLogoDisplayed()

	{

		return SeleniumUtils.isVisible(sitelogo, driver);

	}

	public boolean isSiteDescriptionDisplayed(String sitedesc)

	{

		SeleniumUtils.isVisible(siteNameContainer, driver);
		return sitedescription.getText().contains(sitedesc);

	}

	public void changeTrafficHistoryStartDate() {

		new Actions(driver).dragAndDropBy(trafficStartDateSelector, -200, 0).build().perform();
	}

	public void changeTrafficHistoryEndDate() {

		new Actions(driver).dragAndDropBy(trafficEndDateSelector, -100, 0).build().perform();
	}

	public String getStartDateOnMap() {
		try {
			Thread.sleep(3000);
		} catch (InterruptedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		return trafficStartDateMap.getText();
	}

	public String getEndDateOnMap() {

		SeleniumUtils.isVisible(trafficEndDateMap, driver);
		return trafficEndDateMap.getText();
	}

	public Boolean isStartDateOnMapUpdated(String startDateBefore, String startDateAfter) {

		return (!(startDateBefore.equals(startDateAfter)));
	}

	public Boolean isEndDateOnMapUpdated(String endDateBefore, String endDateAfter) {

		return (!(endDateBefore.equals(endDateAfter)));
	}

	public void clickOnWheelIcon() {

		SeleniumUtils.isVisible(wheelIcon, driver);
		wheelIcon.click();
	}

	public void clickOnImpersonateLink() {

		SeleniumUtils.isVisible(impersonateLink, driver);
		impersonateLink.click();
	}
	
	public void clickOnPropertiesLink() {

		SeleniumUtils.isVisible(propertiesLink, driver);
		propertiesLink.click();
	}

	public String getCustomStartDate() {

		SeleniumUtils.isVisible(customStartDate, driver);
		return customStartDate.getAttribute("value");
	}

	public String getCustomEndDate() {

		SeleniumUtils.isVisible(customEndDate, driver);
		return customEndDate.getAttribute("value");
	}

	
	public String getTitle() {

		SeleniumUtils.isVisible(customEndDate, driver);
		return driver.getTitle();
	}
	public String getBlueHighlightedSectionWidth() {
		return blueHighlightedSection.getAttribute("width");
	}

	public Boolean isBlueHighlightedGraphExpanded(String initialWidth, String afterStartWidth) {

		if (Float.parseFloat(afterStartWidth) >= Float.parseFloat(initialWidth))
			return true;
		else
			return false;
	}

	public Boolean isBlueHighlightedGraphReduced(String afterStartWidth, String afterEndtWidth) {
		if (Float.parseFloat(afterEndtWidth) <= Float.parseFloat(afterStartWidth))
			return true;
		else
			return false;
	}
}
