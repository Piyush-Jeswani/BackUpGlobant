package com.pm.data.testdata;

import com.fasterxml.jackson.annotation.JsonProperty;

public class Activity {
	
	public static Activity DEFAULT = new Activity();

	@JsonProperty
	private String activityName;
	
	@JsonProperty
	private String container;
	
	@JsonProperty
	private String category;
	
	@JsonProperty
	private String subCatagory;

	public String getActivityName() {
		return activityName;
	}

	public String getContainer() {
		return container;
	}

	public String getCategory() {
		return category;
	}

	public String getSubCatagory() {
		return subCatagory;
	}

}
