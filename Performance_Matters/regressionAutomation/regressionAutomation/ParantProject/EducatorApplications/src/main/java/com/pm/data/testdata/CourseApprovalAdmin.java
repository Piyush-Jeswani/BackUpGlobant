package com.pm.data.testdata;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public class CourseApprovalAdmin {
	
	public static CourseApprovalAdmin DEFAULT = new CourseApprovalAdmin();
	
	@JsonProperty
	private String officeName;
	
	@JsonProperty
	private String firstNameForUser;
	
	@JsonProperty
	private String lastNameForUser;
	
	@JsonProperty
	private String courseRequester;
	
	@JsonProperty
	private String finalApprover;
	
	@JsonProperty
	private String courseTitle;
	
	@JsonProperty
	private String sectionTitle;
	
	@JsonProperty
	private List<String> roles;
	
	@JsonProperty
	private List<String> officeNames;
	
	@JsonProperty
	private List<String> userNames;

	public String getOfficeName() {
		return officeName;
	}

	public String getFirstNameForUser() {
		return firstNameForUser;
	}

	public String getLastNameForUser() {
		return lastNameForUser;
	}

	public String getCourseRequester() {
		return courseRequester;
	}

	public String getFinalApprover() {
		return finalApprover;
	}

	public String getCourseTitle() {
		return courseTitle;
	}

	public String getSectionTitle() {
		return sectionTitle;
	}

	public List<String> getRoles() {
		return roles;
	}

	public List<String> getOfficeNames() {
		return officeNames;
	}

	public List<String> getUserNames() {
		return userNames;
	}
}
