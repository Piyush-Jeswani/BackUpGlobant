package com.pm.data.testdata;

import com.fasterxml.jackson.annotation.JsonProperty;

public class Event {
	
	public static final Event DEFAULT = new Event();
	
	@JsonProperty
	private String eventName;
	
	@JsonProperty
	private String program;
	
	@JsonProperty
	private String scoreReleaseDateToSet;

	public String getEventName() {
		return eventName;
	}

	public String getProgram() {
		return program;
	}

	public String getScoreReleaseDateToSet() {
		return scoreReleaseDateToSet;
	}

}
