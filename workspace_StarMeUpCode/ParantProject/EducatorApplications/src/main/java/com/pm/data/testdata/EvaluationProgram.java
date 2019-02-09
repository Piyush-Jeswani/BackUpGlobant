package com.pm.data.testdata;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

public class EvaluationProgram {

	public static EvaluationProgram DEFAULT = new EvaluationProgram();

	@JsonProperty
	private String evaluationProgramName;

	@JsonProperty
	private String lastnameForUser;

	@JsonProperty
	private String firstnameForUser;

	@JsonDeserialize(as = Activity.class)
	private Activity assessmentSelectorActivity = Activity.DEFAULT;

	@JsonDeserialize(as = Activity.class)
	private Activity learningOpportunityActivity = Activity.DEFAULT;

	@JsonProperty
	private String teacherEvaluationProgramName;

	@JsonProperty
	private String principalEvaluationProgramName;
	
	@JsonProperty
	private String principalSignOffProgramName;

	@JsonDeserialize(as = Activity.class)
	private Activity assessmentSelectorForActivity = Activity.DEFAULT;
	
	@JsonProperty
	private String programName;
	
	@JsonProperty
	private String activityName;
	
	@JsonProperty
	private String containerName;
	
	@JsonProperty
	private String text1;
	
	@JsonProperty
	private String text2;

	public String getEvaluationProgramName() {
		return evaluationProgramName;
	}

	public String getTeacherEvaluationProgramName() {
		return teacherEvaluationProgramName;
	}

	public String getPrincipalEvaluationProgramName() {
		return principalEvaluationProgramName;
	}

	public String getPrincipalSignOffProgramName() {
		return principalSignOffProgramName;
	}

	public String getLastnameForUser() {
		return lastnameForUser;
	}

	public String getFirstnameForUser() {
		return firstnameForUser;
	}

	public Activity getAssessmentSelectorActivity() {
		return assessmentSelectorActivity;
	}

	public Activity getLearningOpportunityActivity() {
		return learningOpportunityActivity;
	}

	public Activity getAssessmentSelectorForActivity() {
		return assessmentSelectorForActivity;
	}

	public String getProgramName() {
		return programName;
	}

	public String getActivityName() {
		return activityName;
	}

	public String getContainerName() {
		return containerName;
	}

	public String getText1() {
		return text1;
	}

	public String getText2() {
		return text2;
	}
}
