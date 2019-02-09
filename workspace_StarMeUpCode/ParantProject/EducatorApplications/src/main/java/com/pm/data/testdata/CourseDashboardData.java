package com.pm.data.testdata;

import com.fasterxml.jackson.annotation.JsonProperty;

public class CourseDashboardData {
	public static CourseDashboardData DEFAULT = new CourseDashboardData();
	
	@JsonProperty
	private String firstName;
	
	@JsonProperty
	private String lastName;
	
	@JsonProperty
	private String sectionNumber;
	
	@JsonProperty
	private String sectionTitle;
	
	@JsonProperty
	private String courseNumber;
	
	@JsonProperty
	private String courseTitle;
	
	@JsonProperty
	private String groupName;
	
	@JsonProperty
	private String groupDescription;
	
	@JsonProperty
	private String sectionId;
	
	@JsonProperty
	private String sectionName;

	public String getFirstName() {
		return firstName;
	}

	public String getLastName() {
		return lastName;
	}

	public String getSectionNumber() {
		return sectionNumber;
	}

	public String getSectionTitle() {
		return sectionTitle;
	}

	public String getCourseNumber() {
		return courseNumber;
	}

	public String getCourseTitle() {
		return courseTitle;
	}

	public String getGroupName() {
		return groupName;
	}

	public String getGroupDescription() {
		return groupDescription;
	}

	public String getSectionId() {
		return sectionId;
	}

	public String getSectionName() {
		return sectionName;
	}
}
