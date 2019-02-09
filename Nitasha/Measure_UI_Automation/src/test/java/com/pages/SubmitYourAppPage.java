package com.pages;

import java.util.List;
import java.util.Random;

import org.apache.poi.util.SystemOutLogger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.How;
import org.openqa.selenium.support.PageFactory;

import com.quantcast.utils.SeleniumUtils;

public class SubmitYourAppPage {

	private WebDriver driver;

	@FindBy(how = How.CSS, using = ".text-center")
	private WebElement submitMobileAppTitle;

	@FindBy(how = How.CSS, using = ".name-input")
	private WebElement appNameTxtField;

	@FindBy(how = How.ID, using = "websiteUrl")
	private WebElement webSiteUrlTxtField;

	@FindBy(how = How.ID, using = "navigationButtons")
	private WebElement navigationSubmitButton;

	@FindBy(how = How.XPATH, using = "//label[@for='isCoppaRestrictedTrue']")
	private WebElement radioButtonUnder13Yes;

	@FindBy(how = How.XPATH, using = "//label[@for='isCoppaRestrictedFalse']")
	private WebElement radioButtonUnder13No;

	@FindBy(how = How.XPATH, using = "//label[@for='coppaTrue']")
	private WebElement radioButtonUnder13YesWebSite;

	@FindBy(how = How.XPATH, using = "//label[@for='coppaFalse']")
	private WebElement radioButtonUnder13NoWebSite;

	@FindBy(how = How.CSS, using = ".button.action.submit-button")
	private WebElement submitButton;

	@FindBy(how = How.CSS, using = ".get-sdk>h2")
	private WebElement yourSdkTitle;

	@FindBy(how = How.CSS, using = ".button.action")
	private WebElement installedeTheSDKButton;

	@FindBy(how = How.XPATH, using = "//div[@class='network-children']/div[1]/h3")
	private WebElement appNameLabel;

	@FindBy(how = How.XPATH, using = "//div[@class='network-children']/div[1]/Label")
	private WebElement appStatusLabel;

	@FindBy(how = How.XPATH, using = "//div[@class='network-children']/div[1]//a[@class='button ghost']")
	private WebElement downloadSdkButton;

	@FindBy(how = How.XPATH, using = "//div[@class='network-children']/div[1]//a")
	private WebElement appContainer;

	@FindBy(how = How.CSS, using = "#taggingInstructions > h2")
	private WebElement addTrackingTagTitle;

	@FindBy(how = How.CSS, using = "#submitPropertyCard > h2")
	private WebElement submitSiteAddressTitle;

	@FindBy(how = How.XPATH, using = "//div[@class='network-children']/div[1]//i[@class='fa fa-trash icon-actions-item-icon']")
	private WebElement webSiteDeleteButton;

	@FindBy(how = How.XPATH, using = "//div[@class='network-children']/div[1]//i[@class='fa fa-cog icon-actions-item-icon']")
	private WebElement editSettingButton;

	@FindBy(how = How.XPATH, using = "//tr[@class='current']//a")
	private WebElement settingsTitle;

	@FindBy(how = How.XPATH, using = "//div[@class='path']//a[text()='Delete Mobile App']")
	private WebElement deleteMobileAppButton;

	@FindBy(how = How.CSS, using = ".property.card.is-delete-DELETE_PROPERTY_SUCCESS")
	private List<WebElement> deletedContainerList;
	
	@FindBy(how = How.CSS, using = ".property.card")
	private List<WebElement> ContainerList;

	@FindBy(how = How.XPATH, using = ".//div[@class='property card is-delete-DELETE_PROPERTY_SUCCESS']")
	private List<WebElement> deletedContainer;

	public SubmitYourAppPage(WebDriver driver) {
		this.driver = driver;
		PageFactory.initElements(driver, this);
	}

	public String getSubmitPageElementTitle() {
		SeleniumUtils.isVisible(submitMobileAppTitle, driver);
		return submitMobileAppTitle.getText();
	}

	public String getSubmitPagesiteTitle() {
		SeleniumUtils.isVisible(submitSiteAddressTitle, driver);
		return submitSiteAddressTitle.getText();
	}

	String randomString(final int length) {
		Random random = new Random(); // perhaps make it a class variable so you
										// don't make a new one every time
		StringBuilder sb = new StringBuilder();
		for (int i = 0; i < length; i++) {

			char c = (char) Math.floor(26 * random.nextDouble() + 65);
			sb.append(c);
		}
		return sb.toString();
	}

	public String enterMobileAppName(String appName) {
		SeleniumUtils.isClickable(appNameTxtField, driver);
		appName = appName + randomString(3);
		appNameTxtField.clear();
		appNameTxtField.sendKeys(appName);
		return appName;
	}

	public void selectRadioButton(String value) {
		if (value.equals("Yes")) {
			SeleniumUtils.isClickable(radioButtonUnder13Yes, driver);
			radioButtonUnder13Yes.click();
		} else {
			SeleniumUtils.isClickable(radioButtonUnder13No, driver);
			radioButtonUnder13No.click();
		}
	}

	public void selectSubmitButton() {
		SeleniumUtils.isClickable(submitButton, driver);
		submitButton.click();
	}

	public String getYourSdkTitle() {
		SeleniumUtils.isClickable(yourSdkTitle, driver);
		return yourSdkTitle.getText();

	}

	public void selectInstalledSdkButton() {
		SeleniumUtils.isClickable(installedeTheSDKButton, driver);
		installedeTheSDKButton.click();
	}

	public boolean isAppNameDisplayed(String appName) {
		SeleniumUtils.isVisible(appNameLabel, driver);
		if (appName.toLowerCase().contains(appNameLabel.getText().toLowerCase()))
			return true;
		else
			return false;
	}

	public boolean isAppStatusInYellow() {
		SeleniumUtils.isVisible(appStatusLabel, driver);
		String backgroundColor = appStatusLabel.getCssValue("background-color");
		if (backgroundColor.contains("rgba(249, 169, 12, 1)")
				&& (appStatusLabel.getText().toLowerCase().equals("waiting")))
			return true;
		else
			return false;
	}

	public boolean isDownloadSdkButtonDisplayed() {
		new Actions(driver).moveToElement(appContainer).build().perform();
		return SeleniumUtils.isVisible(downloadSdkButton, driver);
	}

	public boolean isContainerGetGreyedOut() {
		new Actions(driver).moveToElement(appContainer).build().perform();
		String backgroundColor = appContainer.getCssValue("background-color");
		if (backgroundColor.contains("rgba(0, 0, 0, 0)"))
			return true;
		else
			return false;
	}

	public String enterSiteAddress() {
		String siteAddress = GetRandomEmailAddress();
		SeleniumUtils.isClickable(webSiteUrlTxtField, driver);
		webSiteUrlTxtField.clear();
		webSiteUrlTxtField.sendKeys(siteAddress);
		return siteAddress;
	}

	protected String GetRandomEmailAddress() {
		return "www.test" + randomString(6) + ".com";
	}

	public String getTagPageTitle() {
		return addTrackingTagTitle.getText();
	}

	public void SelectSiteSubmitButton() {
		SeleniumUtils.isClickable(navigationSubmitButton, driver);
		navigationSubmitButton.click();
	}

	public void selectSiteRadioButton(String value) {
		if (value.equals("Yes")) {
			SeleniumUtils.isClickable(radioButtonUnder13YesWebSite, driver);
			radioButtonUnder13YesWebSite.click();
		} else {
			SeleniumUtils.isClickable(radioButtonUnder13NoWebSite, driver);
			radioButtonUnder13NoWebSite.click();
		}
	}

	public void HoverOverContainer() {
		SeleniumUtils.isVisible(appContainer, driver);
		new Actions(driver).moveToElement(appContainer).build().perform();
	}

	public void DeletewebSite() throws InterruptedException {
		SeleniumUtils.isClickable(webSiteDeleteButton, driver);

		webSiteDeleteButton.click();
		Thread.sleep(2000);
	}

	public int getDeletedPropSize() {

		return deletedContainerList.size();

	}
	
	public int getContainerSize() {

		return ContainerList.size();

	}

	public boolean isSiteContainerDeleted() throws InterruptedException {

		System.out.println("After Deletion" + getDeletedPropSize());
		if (getDeletedPropSize() == 1)
			return true;
		else
			return false;
	}
	
	public boolean isMobileAppContainerDeleted(int containerSize) throws InterruptedException {
		System.out.println(containerSize);
		System.out.println("After Deletion" + getContainerSize());
		if (containerSize -getContainerSize() == 1)
			return true;
		else
			return false;
	}



	public void editSettings() {
		SeleniumUtils.isClickable(editSettingButton, driver);
		editSettingButton.click();
	}

	public void SelectDeleteMobileApp() throws InterruptedException {
		SeleniumUtils.isClickable(deleteMobileAppButton, driver);
		deleteMobileAppButton.click();
		SeleniumUtils.clickOKInAlert(driver);
		Thread.sleep(2000);
	}

	public String getTitle() {
		SeleniumUtils.isVisible(settingsTitle, driver);
		return driver.getTitle();
	}
}
