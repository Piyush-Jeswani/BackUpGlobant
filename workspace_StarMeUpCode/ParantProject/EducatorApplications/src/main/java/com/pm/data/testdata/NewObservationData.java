package com.pm.data.testdata;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public class NewObservationData {
	public static NewObservationData DEFAULT = new NewObservationData();
	
	@JsonProperty
	private String firstName;
	
	@JsonProperty
	private String teacherLastName;
	
	@JsonProperty
	private String dusdRubricName;
	
	@JsonProperty
	private String hexawareTraining;
	
	@JsonProperty
	private String programName;
	
	@JsonProperty
	private String observationTemplate;
	
	@JsonProperty
	private String principalLastName;
	
	@JsonProperty
	private String testUserLastName;
	
	@JsonProperty
	private String templateName;
	
	@JsonProperty
	private String activityName;
	
	@JsonProperty
	private String rubricName;
	
	@JsonProperty
	private List<String> observationTypes;
	
	@JsonProperty
	private List<String> observationSort;
	
	public String getFirstName() {
		return firstName;
	}

	public String getTeacherLastName() {
		return teacherLastName;
	}
	
	public String getDusdRubricName() {
		return dusdRubricName;
	}
	
	public String getHexawareTraining() {
		return hexawareTraining;
	}

	public String getProgramName() {
		return programName;
	}

	public String getObservationTemplate() {
		return observationTemplate;
	}

	public String getPrincipalLastName() {
		return principalLastName;
	}

	public String getTestUserLastName() {
		return testUserLastName;
	}

	public String getTemplateName() {
		return templateName;
	}

	public String getActivityName() {
		return activityName;
	}

	public String getRubricName() {
		return rubricName;
	}

	public List<String> getObservationsTypeList() {
		return observationTypes;
	}

	public List<String> getObservationSort() {
		return observationSort;
	}
}
