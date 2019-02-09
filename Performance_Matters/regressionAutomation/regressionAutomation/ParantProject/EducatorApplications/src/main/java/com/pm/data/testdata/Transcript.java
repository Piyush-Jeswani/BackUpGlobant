package com.pm.data.testdata;

import com.fasterxml.jackson.annotation.JsonProperty;

public class Transcript {
	public static final Transcript DEFAULT= new Transcript();
	
	@JsonProperty
	private String firstName;
	
	@JsonProperty
	private String lastName;
	
	@JsonProperty
	private String transcriptTitle;
	
	@JsonProperty
	private String transcriptKey;

	public String getFirstName() {
		return firstName;
	}

	public String getLastName() {
		return lastName;
	}

	public String getTranscriptTitle() {
		return transcriptTitle;
	}

	public String getTranscriptKey() {
		return transcriptKey;
	}
}
