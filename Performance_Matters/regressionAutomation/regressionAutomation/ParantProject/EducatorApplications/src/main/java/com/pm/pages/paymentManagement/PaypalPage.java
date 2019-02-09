package com.pm.pages.paymentManagement;

import java.util.ArrayList;

import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.ui.Select;
import com.pm.pages.common.BasePage;

public class PaypalPage extends BasePage{
	
	@FindBy(id = "ul-btn")
	private WebElement loginButton;
	
	@FindBy(id = "email")
	private WebElement emailIdField;
	
	@FindBy(id = "password")
	private WebElement passwordField;
	
	@FindBy(id = "btnLogin")
	private WebElement loginbutton;
	
	@FindBy (className = "mer-settings-wrapper")
	private WebElement settingsIcon;
	
	@FindBy(linkText = "Profile and settings")
	private WebElement profileSettingsTab;
	
	@FindBy(id = "mytools")
	private WebElement mysellingTool;
	
	@FindBy(id = "closeInfo")
	private WebElement closeInfoButton;
	
	@FindBy(id = "auto_return_on")
	private WebElement autoReturnOn;
	
	@FindBy(id = "payment_data_transfer_on")
	private WebElement paymentDataTranferOn;
	
	@FindBy(xpath = "//div[@class='mer-global-links-holder']//a[text()='Log out']")
	private WebElement paypalLogoutButton;
	

	
	
	public PaypalPage() {
		super();
	}
	
	public String setup(String paypalURL,String paypalUsername,String paypalPassword,String returnURL,String clientURL,String clientUsername,String clientPassword,String coursePayments,String paypalStandardName,String paypalStandardUsername) {
		WebElement link = driver.findElement(By.linkText("My Reports"));
		actions.keyDown(Keys.CONTROL).click(link).keyUp(Keys.CONTROL).build().perform();
		
		ArrayList<String> windowHandles = new ArrayList<String> (driver.getWindowHandles());
		for(String window : windowHandles){
			driver.switchTo().window(window);
			if(driver.getTitle().contains("My Reports")){
				break;
			}			
		}
		
		driver.get(paypalURL);
		clickSignInButton();
		enterEmailId(paypalUsername);
		enterPassword(paypalPassword);
		clickLoginButton();
		clickSettingsIcon();
		clickProfileSettings();
		clickCloseInfoButton();
		clickMySellingTool();
		clickUpdateButton();
		clickElementByJSExecutor(autoReturnOn);
		driver.findElement(By.name("return")).clear();
		driver.findElement(By.name("return")).sendKeys(returnURL);
		clickElementByJSExecutor(paymentDataTranferOn);
		
		String token = driver.findElement(By.xpath("//form[@id='parentForm']/p[6]")).getText();
		String[] word = token.split(":");
		
		clickElementByJSExecutor(driver.findElement(By.id("paypal_account_on")));
		
		WebElement paypalsaveButton = driver.findElement(By.name("save.x"));
		clickElementByJSExecutor(paypalsaveButton);
		waitForJSandJQueryToLoad();
		
		clickCloseInfoButton();
		
		
		clickElementByJSExecutor(paypalLogoutButton);
		
		driver.get(clientURL);
		
		WebElement clientloginId = driver.findElement(By.id("Username"));
		clientloginId.clear();
		clientloginId.sendKeys(clientUsername);
		
		WebElement clientLoginPassword = driver.findElement(By.id("Password"));
		clientLoginPassword.clear();
		clientLoginPassword.sendKeys(clientPassword);
		
		WebElement clientLoginButton = driver.findElement(By.xpath("//form[@id='tnl-login-form']//button[@type='submit']"));
		clickElementByJSExecutor(clientLoginButton);
		
		clickOnLink("Administration");
		
		clickOnLink("Configuration Management");
		
		WebElement searchString = driver.findElement(By.id("searchString"));
		searchString.clear();
		searchString.sendKeys(coursePayments);
		
		WebElement searchButton = driver.findElement(By.xpath("//button[text()='Search']"));
		clickElementByJSExecutor(searchButton);
		
		clickOnLink(coursePayments);
		
		String paypalProductionMode = verifyFieldValue("Paypal Standard Payment Processor Mode", "paypalProductionMode");
		String buyNowInstructions = verifyFieldValue("Paypal Standard Payment Processor Mode", "buyNowInstructions");
		String paymentSuccessMessage = verifyFieldValue("Paypal Standard Payment Processor Mode", "paymentSuccessMessage");
		
		/*assertThat(paypalProductionMode, equalTo(true));
		assertThat(buyNowInstructions, equalTo(true));
		assertThat(paymentSuccessMessage, equalTo(true));*/
		
		clickOnLink("Administration");
		clickOnLink("Course Administration");
		clickOnLink("Manage Global Payment Processors");
		clickOnLink("PayPal Standard");
		
		WebElement paypalStandardname = driver.findElement(By.name("name"));
		paypalStandardname.clear();
		paypalStandardname.sendKeys(paypalStandardName);
		
		WebElement isActive = driver.findElement(By.name("visible"));
		clickElementByJSExecutor(isActive);
		
		WebElement userName = driver.findElement(By.name("paypal-standard-username"));
		userName.clear();
		userName.sendKeys(paypalStandardUsername);
		
		WebElement tokenText = driver.findElement(By.name("paypal-standard-pdt-token"));
		tokenText.clear();
		tokenText.sendKeys(word[1]);
		
		WebElement saveButton = driver.findElement(By.cssSelector(".tnlf-save-button"));
		clickElementByJSExecutor(saveButton);
		waitForJSandJQueryToLoad();
		
		return buyNowInstructions;
	}
	public void clickSignInButton() {
		loginButton.click();;
	}
	
	public void enterEmailId(String email) {
		emailIdField.clear();
		emailIdField.sendKeys(email);
	}
	
	public void enterPassword(String password) {
		passwordField.clear();
		passwordField.sendKeys(password);
	}
	
	public void clickLoginButton() {
		loginbutton.click();
	}
	
	public void clickSettingsIcon() {
		settingsIcon.click();
	}
	
	public void clickProfileSettings() {
		clickElementByJSExecutor(profileSettingsTab);
		waitForJSandJQueryToLoad();
	}
	
	public void clickCloseInfoButton() {
		clickElementByJSExecutor(closeInfoButton);
	}
	
	public void clickMySellingTool() {
		clickElementByJSExecutor(driver.findElement(By.id("mytools")));
		clickCloseInfoButton();
	}
	
	public void clickUpdateButton() {
		WebElement updateButton = driver.findElement(By.cssSelector("#websitePreferences a"));
		clickElementByJSExecutor(updateButton);
	}
	
	public String verifyFieldValue(String paymentMode,String id) {
		String xpath = String.format("//div[text()='%s']/ancestor::table//tr[@id='course.payment.paypalStandard.%s_TR']//td[2]",paymentMode, id);
		WebElement fieldValue = driver.findElement(By.xpath(xpath));
		return fieldValue.getText();
	}
	
	public void clickOnLink(String linkText){
		WebElement administrationLink = driver.findElement(By.linkText(linkText));
		clickElementByJSExecutor(administrationLink);
		waitForJSandJQueryToLoad();
	}
	
	public void closeCurrentTab() throws InterruptedException {
		ArrayList<String> windowHandles = new ArrayList<String> (driver.getWindowHandles());
		for(String window : windowHandles){
			driver.switchTo().window(window);
			if(!driver.getTitle().contains("Administration")){
				driver.close();
				break;
			}			
		}
	}
	
	public void clickPayWithDebitButton() {
		WebElement payNow = driver.findElement(By.id("checkoutAsAGuestBtn"));
		clickElementByJSExecutor(payNow);
		waitForJSandJQueryToLoad();
	}
	
	public void setPaymentDetails(String countryName,String cardNumber,String expiryDate,String cvv,String firstName,String lastName,String streetAddress,String city,String state,String zipCode,String phoneNumber,String email) {
		Select countrySelector = new Select(driver.findElement(By.id("countrySelector")));
		countrySelector.selectByVisibleText(countryName);
		
		WebElement cardnumber = driver.findElement(By.id("cc"));
		cardnumber.clear();
		cardnumber.sendKeys(cardNumber);
		
		WebElement expirydate = driver.findElement(By.id("expiry_value"));
		expirydate.clear();
		expirydate.sendKeys(expiryDate);
		
		WebElement cvvNumber = driver.findElement(By.id("cvv"));
		cvvNumber.clear();
		cvvNumber.sendKeys(cvv);
		
		
		
		WebElement firstname = driver.findElement(By.id("firstName"));
		firstname.clear();
		firstname.sendKeys(firstName);
		
		WebElement lastname = driver.findElement(By.id("firstName"));
		lastname.clear();
		lastname.sendKeys(lastName);
		
		WebElement address = driver.findElement(By.id("billingLine1"));
		address.clear();
		address.sendKeys(streetAddress);
		
		WebElement cityName = driver.findElement(By.id("billingCity"));
		cityName.clear();
		cityName.sendKeys(city);
		
		Select stateName = new Select(driver.findElement(By.id("billingState")));
		stateName.selectByVisibleText(state);
		
		WebElement postalCode = driver.findElement(By.id("billingPostalCode"));
		postalCode.clear();
		postalCode.sendKeys(zipCode);
		
		WebElement telephone = driver.findElement(By.id("telephone"));
		telephone.clear();
		telephone.sendKeys(phoneNumber);
		
		WebElement emailId = driver.findElement(By.id("email"));
		emailId.clear();
		emailId.sendKeys(phoneNumber);
		
		clickElementByJSExecutor(driver.findElement(By.id("guestTerms")));
		waitForJSandJQueryToLoad();
		
		WebElement  paynowButton = driver.findElement(By.id("guestSubmit"));
		clickElementByJSExecutor(paynowButton);
		waitForJSandJQueryToLoad();
	}
	
	public void returnToMerchant() {
		clickElementByJSExecutor(driver.findElement(By.id("merchantReturnBtn")));
		waitForJSandJQueryToLoad();
	}
	
}
