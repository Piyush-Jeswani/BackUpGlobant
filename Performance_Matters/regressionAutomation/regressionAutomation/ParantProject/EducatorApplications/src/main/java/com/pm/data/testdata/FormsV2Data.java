package com.pm.data.testdata;

import com.fasterxml.jackson.annotation.JsonProperty;

public class FormsV2Data {
	public static FormsV2Data DEFAULT = new FormsV2Data();
	
	@JsonProperty
	private String formTitle;
	
	@JsonProperty
	private String dateTimeLabel;
	
	@JsonProperty
	private String dataDisplayLabel;
	
	@JsonProperty 
	private String dataDisplayDescription;
	
	@JsonProperty
	private String createFormActivity;
	
	@JsonProperty
	private String activityTitle;
	
	@JsonProperty
	private String containerName;
	
	@JsonProperty
	private String permissionType;
	
	@JsonProperty
	private String roleName;
	
	@JsonProperty
	private String permissionMarkComplete;
	
	@JsonProperty
	private String permissionReopen;
	
	@JsonProperty
	private String regressionProgramName;
	
	@JsonProperty
	private String dateTime;
	
	@JsonProperty
	private String personDataLabel;
	
	@JsonProperty
	private String whoAndWhenLabel;
	
	@JsonProperty
	private String richTextAreaLabel;
	
	public String getFormTitle() {
		return formTitle;
	}

	public String getDateTimeLabel() {
		return dateTimeLabel;
	}

	public String getDataDisplayLabel() {
		return dataDisplayLabel;
	}

	public String getDataDisplayDescription() {
		return dataDisplayDescription;
	}

	public String getCreateFormActivity() {
		return createFormActivity;
	}

	public String getActivityTitle() {
		return activityTitle;
	}

	public String getContainerName() {
		return containerName;
	}

	public String getPermissionType() {
		return permissionType;
	}

	public String getRoleName() {
		return roleName;
	}

	public String getPermissionMarkComplete() {
		return permissionMarkComplete;
	}

	public String getPermissionReopen() {
		return permissionReopen;
	}

	public String getRegressionProgramName() {
		return regressionProgramName;
	}

	public String getDateTime() {
		return dateTime;
	}

	public String getPersonDataLabel() {
		return personDataLabel;
	}

	public String getWhoAndWhenLabel() {
		return whoAndWhenLabel;
	}

	public String getRichTextAreaLabel() {
		return richTextAreaLabel;
	}
}
