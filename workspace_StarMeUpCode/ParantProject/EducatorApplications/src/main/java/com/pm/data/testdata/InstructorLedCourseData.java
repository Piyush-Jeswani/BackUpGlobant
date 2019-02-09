package com.pm.data.testdata;

import com.fasterxml.jackson.annotation.JsonProperty;

public class InstructorLedCourseData {
	public static InstructorLedCourseData DEFAULT = new InstructorLedCourseData();
	
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
	private String disclaimer;
	
	@JsonProperty
	private String schoolCat;
	
	@JsonProperty
	private String survey;
	
	@JsonProperty
	private String sectionTime;
	
	@JsonProperty
	private String testValueNew;
	
	@JsonProperty
	private String sectionStartTime;
	
	@JsonProperty
	private String sectionEndTime;

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

	public String getTestValue() {
		return testValue;
	}

	public String getCreditType() {
		return creditType;
	}

	public String getDisclaimer() {
		return disclaimer;
	}

	public String getSchoolCat() {
		return schoolCat;
	}

	public String getSurvey() {
		return survey;
	}

	public String getSectionTime() {
		return sectionTime;
	}

	public String getTestValueNew() {
		return testValueNew;
	}

	public String getSectionStartTime() {
		return sectionStartTime;
	}

	public String getSectionEndTime() {
		return sectionEndTime;
	}
}
