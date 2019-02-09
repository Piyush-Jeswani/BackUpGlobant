package com.pm.data.testdata;

import com.fasterxml.jackson.annotation.JsonProperty;

public class NewParticipation {
	public static NewParticipation DEFAULT = new NewParticipation();
	
	@JsonProperty
	private String evaluationProgramName;
	
	@JsonProperty
	private String activityName;
	
	@JsonProperty
	private String containerName;
	
	@JsonProperty
	private String firstName;
	
	@JsonProperty
	private String lastName;

	public String getEvaluationProgramName() {
		return evaluationProgramName;
	}

	public String getActivityName() {
		return activityName;
	}

	public String getContainerName() {
		return containerName;
	}

	public String getFirstName() {
		return firstName;
	}

	public String getLastName() {
		return lastName;
	}
}
