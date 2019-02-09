package com.pm.data.testdata;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public class SectionList {
	public static SectionList DEFAULT = new SectionList();
	
	@JsonProperty
	private List<String> sectionTitle;
		
	@JsonProperty
	private List<String> numberOfParticipants;
	
	@JsonProperty
	private List<String> sectionStartTime;
	
	@JsonProperty
	private List<String> sectionEndTime;

	public List<String> getSectionTitle() {
		return sectionTitle;
	}

	public List<String> getNumberOfParticipants() {
		return numberOfParticipants;
	}

	public List<String> getSectionStartTime() {
		return sectionStartTime;
	}

	public List<String> getSectionEndTime() {
		return sectionEndTime;
	}
	
}
