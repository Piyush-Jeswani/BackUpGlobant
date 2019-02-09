package com.pm.data.testdata;

import com.fasterxml.jackson.annotation.JsonProperty;

public class CourseCatalog {
	public static final CourseCatalog DEFAULT= new CourseCatalog();
	
	@JsonProperty
	private String courseTitle;
	
	@JsonProperty
	private String courseId;
	
	@JsonProperty
	private String courseDescription;
	
	@JsonProperty
	private String courseName;
	
	@JsonProperty
	private String recommendCourseName;
	
	@JsonProperty
	private String firstName;
	
	@JsonProperty
	private String lastName;

	public String getCourseTitle() {
		return courseTitle;
	}

	public String getCourseId() {
		return courseId;
	}

	public String getCourseDescription() {
		return courseDescription;
	}

	public String getCourseName() {
		return courseName;
	}

	public String getRecommendCourseName() {
		return recommendCourseName;
	}

	public String getFirstName() {
		return firstName;
	}

	public String getLastName() {
		return lastName;
	}
}
