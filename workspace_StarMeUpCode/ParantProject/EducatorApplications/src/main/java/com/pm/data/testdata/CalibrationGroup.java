package com.pm.data.testdata;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public class CalibrationGroup {

	public static final CalibrationGroup DEFAULT= new CalibrationGroup();
	
	@JsonProperty
	private String groupName;

	@JsonProperty
	private String description;
	
	@JsonProperty
	private String lincenceLimit;
	
	@JsonProperty
    private List<String> districts;
	
	@JsonProperty
    private List<String> sites;
	
	@JsonProperty
    private List<String> admins;
	
	@JsonProperty
	private String eventName;
	
	@JsonProperty
	private String firstName;
	
	@JsonProperty
	private String lastName;
	
	@JsonProperty
	private String resourceFirstName;
	
	@JsonProperty
	private String resourceLastName;
	
	@JsonProperty
	private String resourceTitle;
	
	@JsonProperty
	private List<String> calibrationNavigationTitle;
	
	@JsonProperty
	private String fileName;
	
	@JsonProperty
	private String fileNameWithExtension;

	public String getGroupName() {
		return groupName;
	}

	public String getDescription() {
		return description;
	}

	public String getLincenceLimit() {
		return lincenceLimit;
	}

	public List<String> getDistricts() {
		return districts;
	}

	public List<String> getSites() {
		return sites;
	}

	public List<String> getAdmins() {
		return admins;
	}

	public String getEventName() {
		return eventName;
	}

	public String getFirstName() {
		return firstName;
	}

	public String getLastName() {
		return lastName;
	}

	public List<String> getCalibrationNavigationTitle() {
		return calibrationNavigationTitle;
	}

	public String getResourceFirstName() {
		return resourceFirstName;
	}

	public String getResourceLastName() {
		return resourceLastName;
	}

	public String getResourceTitle() {
		return resourceTitle;
	}

	public String getFileName() {
		return fileName;
	}

	public String getFileNameWithExtension() {
		return fileNameWithExtension;
	}	
}
