package com.pm.data.testdata;

import com.fasterxml.jackson.annotation.JsonProperty;

public class StaffManagement {
	public static final StaffManagement DEFAULT= new StaffManagement();
	
	@JsonProperty
	private String programName;
	
	@JsonProperty
	private String staffGroupName;
	
	@JsonProperty
	private String firstName;
	
	@JsonProperty
	private String lastName;
	
	@JsonProperty
	private String staffGroupDescription;
		
	@JsonProperty
	private String courseUserFirstName;
	
	@JsonProperty
	private String courseUserLastName;
	
	@JsonProperty
	private String staffProgramName;
	
	@JsonProperty
	private String staffFirstName;
	
	@JsonProperty
	private String staffLastName;

	public String getProgramName() {
		return programName;
	}

	public String getStaffGroupName() {
		return staffGroupName;
	}

	public String getFirstName() {
		return firstName;
	}

	public String getLastName() {
		return lastName;
	}
	
	public String getStaffGroupDescription() {
		return staffGroupDescription;
	}

	public String getCourseUserFirstName() {
		return courseUserFirstName;
	}

	public String getCourseUserLastName() {
		return courseUserLastName;
	}

	public String getStaffProgramName() {
		return staffProgramName;
	}

	public String getStaffFirstName() {
		return staffFirstName;
	}

	public String getStaffLastName() {
		return staffLastName;
	}
}
