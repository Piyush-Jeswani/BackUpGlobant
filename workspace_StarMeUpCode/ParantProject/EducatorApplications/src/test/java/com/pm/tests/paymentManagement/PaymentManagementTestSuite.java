package com.pm.tests.paymentManagement;

import org.testng.annotations.Test;

import com.pm.data.testdata.PaymentData;
import static com.pm.data.testdata.TestData.TestData;

import java.io.IOException;

import static org.hamcrest.MatcherAssert.assertThat;

import static org.hamcrest.core.IsEqual.equalTo;

import com.pm.pages.common.HomePage;
import com.pm.pages.paymentManagement.PaypalPage;
import com.pm.tests.base.BaseTest;

public class PaymentManagementTestSuite extends BaseTest{
	
	PaymentData paymentData = TestData.paymentData();
	
	@Test(description = "EA-7284 : Verify the PayPal Payment for Guest users", groups="Admin")
	public void EA_7284() throws InterruptedException, IOException {
		String paypalURL = paymentData.getPaypalURL();
		String paypalUsername = paymentData.getPaypalUsername();
		String paypalPassword = paymentData.getPaypalPassword();
		String returnURL = paymentData.getReturnURL();
		String clientURL = paymentData.getClientURL();
		String clientUsername = paymentData.getClientUsername();
		String clientPassword = paymentData.getClientPassword();
		String coursePayments = paymentData.getCoursePayments();
		String paypalStandardName = paymentData.getPaypalStandardName();
		String paypalStandardUsername = paymentData.getPaypalStandardUsername();
		String courseName = paymentData.getCourseName();
		
		String cardNumber = paymentData.getCardNumber();
		String cvv = paymentData.getCvv();
		String expiryDate = paymentData.getExpiryDate();
		String firstName = paymentData.getFirstName();
		String lastName = paymentData.getLastName();
		String streetAddress = paymentData.getStreetAddress();
		String city = paymentData.getCity();
		String state = paymentData.getState();
		String zipCode = paymentData.getZipCode();
		String phoneNumber = paymentData.getPhoneNumber();
		String email = paymentData.getEmail();
		String countryName = paymentData.getCountryName();
		
		paypalPage = new PaypalPage();
		String buyNowInstructions = paypalPage.setup(paypalURL,paypalUsername,paypalPassword,returnURL,clientURL,clientUsername,clientPassword,coursePayments,paypalStandardName,paypalStandardUsername);
		
		homepage = new HomePage();
		courseCatalogPage = homepage.getNavigationMenu().clickCourseCatalogTab();
		courseCatalogPage.learningOpportunitySearchSection().clickShowAll();
//		courseCatalogPage.learningOpportunitySearchSection().selectPageSize();
		courseCatalogPage.learningOpportunitySearchSection().clickRegisterButton(courseName);
		courseCatalogPage.learningOpportunitySearchSection().clickOnLink("Accept");
		courseCatalogPage.learningOpportunitySearchSection().clickNoCredit();
		courseCatalogPage.learningOpportunitySearchSection().clickOnLink("Next");
		courseCatalogPage.learningOpportunitySearchSection().clickOnLink("Paypal");
		
		String paypalBuyNowText = courseCatalogPage.learningOpportunitySearchSection().getBuyNowText();
		assertThat(paypalBuyNowText, equalTo(buyNowInstructions));
		
		courseCatalogPage.learningOpportunitySearchSection().clickSubmitButton();
		
		paypalPage.clickPayWithDebitButton();
		paypalPage.setPaymentDetails(countryName,cardNumber,expiryDate,cvv,firstName,lastName,streetAddress,city,state,zipCode,phoneNumber,email);
	}
}
