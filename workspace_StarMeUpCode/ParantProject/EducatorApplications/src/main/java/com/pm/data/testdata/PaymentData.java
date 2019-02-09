package com.pm.data.testdata;

import com.fasterxml.jackson.annotation.JsonProperty;

public class PaymentData {
	public static PaymentData DEFAULT = new PaymentData();
	
	
	@JsonProperty
	private String paypalURL;
	
	@JsonProperty
	private String paypalUsername;
	
	@JsonProperty
	private String paypalPassword;
	
	@JsonProperty
	private String returnURL;
	
	@JsonProperty
	private String clientURL;
	
	@JsonProperty
	private String clientUsername;
	
	@JsonProperty
	private String clientPassword;
	
	@JsonProperty
	private String coursePayments;
	
	@JsonProperty
	private String paypalStandardName;
	
	@JsonProperty
	private String paypalStandardUserName;
	
	@JsonProperty
	private String courseName;
	
	@JsonProperty
	private String cardNumber;
	
	@JsonProperty
	private String cvv;
	
	@JsonProperty
	private String expiryDate;
	
	@JsonProperty
	private String firstName;
	
	@JsonProperty
	private String lastName;
	
	@JsonProperty
	private String streetAddress;
	
	@JsonProperty
	private String city;
	
	@JsonProperty
	private String state;
	
	@JsonProperty
	private String zipCode;
	
	@JsonProperty
	private String phoneNumber;
	
	@JsonProperty
	private String email;
	
	@JsonProperty
	private String countryName;

	public String getPaypalURL() {
		return paypalURL;
	}

	public String getPaypalUsername() {
		return paypalUsername;
	}

	public String getPaypalPassword() {
		return paypalPassword;
	}

	public String getReturnURL() {
		return returnURL;
	}

	public String getClientURL() {
		return clientURL;
	}

	public String getClientUsername() {
		return clientUsername;
	}

	public String getClientPassword() {
		return clientPassword;
	}

	public String getCoursePayments() {
		return coursePayments;
	}

	public String getPaypalStandardName() {
		return paypalStandardName;
	}

	public String getPaypalStandardUsername() {
		return paypalStandardUserName;
	}

	public String getCourseName() {
		return courseName;
	}
	
	public String getCardNumber() {
		return cardNumber;
	}

	public String getCvv() {
		return cvv;
	}

	public String getExpiryDate() {
		return expiryDate;
	}

	public String getFirstName() {
		return firstName;
	}

	public String getLastName() {
		return lastName;
	}

	public String getStreetAddress() {
		return streetAddress;
	}

	public String getCity() {
		return city;
	}

	public String getState() {
		return state;
	}

	public String getZipCode() {
		return zipCode;
	}

	public String getPhoneNumber() {
		return phoneNumber;
	}

	public String getEmail() {
		return email;
	}

	public String getCountryName() {
		return countryName;
	}
	
}
