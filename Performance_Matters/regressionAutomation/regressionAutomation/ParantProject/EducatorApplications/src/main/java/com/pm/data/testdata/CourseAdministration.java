package com.pm.data.testdata;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public class CourseAdministration {
	public static CourseAdministration DEFAULT = new CourseAdministration();
	
	@JsonProperty
	private String courseName;
	
	@JsonProperty
	private String firstSearchKeyWord;
	
	@JsonProperty
	private String secondSearchKeyWord;
	
	@JsonProperty
	private String sectionTitle;
		
	@JsonProperty
	private String numberOfParticipants;
	
	@JsonProperty
	private String courseTitle;
	
	@JsonProperty
	private String sectionName;
	
	@JsonProperty
	private String sectionNameId;
	
	@JsonProperty
	private String sectionStartTime;
	
	@JsonProperty
	private String sectionEndTime;
	
	@JsonProperty
	private List<String> fileNames;
	
	public String getCourseName() {
		return courseName;
	}

	public String getFirstSearchKeyWord() {
		return firstSearchKeyWord;
	}
	
	public String getSecondSearchKeyWord() {
		return secondSearchKeyWord;
	}

	public String getSectionTitle() {
		return sectionTitle;
	}

	public String getNumberOfParticipants() {
		return numberOfParticipants;
	}

	public String getCourseTitle() {
		return courseTitle;
	}

	public String getSectionName() {
		return sectionName;
	}

	public String getSectionNameId() {
		return sectionNameId;
	}

	public String getSectionStartTime() {
		return sectionStartTime;
	}

	public String getSectionEndTime() {
		return sectionEndTime;
	}

	public List<String> getFileNames() {
		return fileNames;
	}

}
