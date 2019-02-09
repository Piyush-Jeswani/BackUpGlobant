package com.pm.data.testdata;

import com.fasterxml.jackson.annotation.JsonProperty;

public class AssessmentBank {

	public static final AssessmentBank DEFAULT = new AssessmentBank();

	@JsonProperty
	private String bankName;

	@JsonProperty
	private String assessment;

	@JsonProperty
	private String category;

	@JsonProperty
	private String standard;

	@JsonProperty
	private String element;
	
	@JsonProperty
	private String question;
	
	public String getBankName() {
		return bankName;
	}

	public String getAssessment() {
		return assessment;
	}

	public String getCategory() {
		return category;
	}

	public String getStandard() {
		return standard;
	}

	public String getElement() {
		return element;
	}

	public String getQuestion() {
		return question;
	}
}
