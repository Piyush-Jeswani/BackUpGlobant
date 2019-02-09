package com.pm.data.testdata;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ProgramManagementDetails {
	public static final ProgramManagementDetails DEFAULT = new ProgramManagementDetails();
	
	@JsonProperty
	private String title;
	
	@JsonProperty
	private String description;
	
	@JsonProperty
	private String maxAttachmentValue;
	
	@JsonProperty
	private String menuTitle;
	
	@JsonProperty
	private String totalPossible;
		
	@JsonProperty
	private List<String> personFieldList;
	
	@JsonProperty
	private String activityTitle;
	
	@JsonProperty
	private String activityInstructions;
	
	@JsonProperty
	private String activityType;
	
	@JsonProperty
	private String membershipGroup;
	
	@JsonProperty
	private String printTitle;
	
	@JsonProperty
	private String displayAllAtachments;
	
	@JsonProperty
	private String puresignOff;
	
	@JsonProperty
	private String keepSignatures;
	
	@JsonProperty
	private String markCompleted;
	
	@JsonProperty
	private String isShared;
	
	@JsonProperty
	private String isArchived;
	
	@JsonProperty
	private String showRawScore;
	
	@JsonProperty
	private String showMappedScore;
	
	@JsonProperty
	private String autoStartTargetedPlan;

	public String getTitle() {
		return title;
	}

	public String getDescription() {
		return description;
	}

	public String getMaxAttachmentValue() {
		return maxAttachmentValue;
	}

	public String getMenuTitle() {
		return menuTitle;
	}

	public String getTotalPossible() {
		return totalPossible;
	}

	public List<String> getPersonFieldList() {
		return personFieldList;
	}

	public String getActivityTitle() {
		return activityTitle;
	}

	public String getActivityInstruction() {
		return activityInstructions;
	}

	public String getActivityType() {
		return activityType;
	}

	public String getMembershipGroup() {
		return membershipGroup;
	}

	public String getPrintTitle() {
		return printTitle;
	}

	public String getDisplayAllAtachments() {
		return displayAllAtachments;
	}

	public String getPuresignOff() {
		return puresignOff;
	}

	public String getKeepSignatures() {
		return keepSignatures;
	}

	public String getMarkCompleted() {
		return markCompleted;
	}

	public String getIsShared() {
		return isShared;
	}

	public String getIsArchived() {
		return isArchived;
	}

	public String getShowRawScore() {
		return showRawScore;
	}

	public String getShowMappedScore() {
		return showMappedScore;
	}

	public String getAutoStartTargetedPlan() {
		return autoStartTargetedPlan;
	}
}
