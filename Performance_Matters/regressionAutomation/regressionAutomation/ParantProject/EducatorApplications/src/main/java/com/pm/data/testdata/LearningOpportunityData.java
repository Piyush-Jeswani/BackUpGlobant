package com.pm.data.testdata;

import com.fasterxml.jackson.annotation.JsonProperty;

public class LearningOpportunityData {
	public static LearningOpportunityData DEFAULT = new LearningOpportunityData();
	
	@JsonProperty
	private String courseExternal;
	
	@JsonProperty
	private String courseTitle;
	
	@JsonProperty
	private String courseDescription;
	
	@JsonProperty
	private String value;
	
	@JsonProperty
	private String testwn;
	
	@JsonProperty
	private String testValue;
	
	@JsonProperty
	private String creditType;
	
	@JsonProperty
	private String testValueNew;
	
	@JsonProperty
	private String firstName;
	
	@JsonProperty
	private String lastName;
	
	public String getCourseExternal() {
		return courseExternal;
	}

	public String getCourseTitle() {
		return courseTitle;
	}

	public String getCourseDescription() {
		return courseDescription;
	}

	public String getValue() {
		return value;
	}

	public String getTestwn() {
		return testwn;
	}

	public String getFirstName() {
		return firstName;
	}

	public String getLastName() {
		return lastName;
	}

	public String getTestValue() {
		return testValue;
	}

	public String getCreditType() {
		return creditType;
	}
	
	public String getTestValueNew() {
		return testValueNew;
	}

}
