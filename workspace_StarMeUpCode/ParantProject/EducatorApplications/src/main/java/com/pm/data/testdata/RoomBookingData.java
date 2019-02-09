package com.pm.data.testdata;

import com.fasterxml.jackson.annotation.JsonProperty;

public class RoomBookingData {
	public static final RoomBookingData DEFAULT = new RoomBookingData();
	
	@JsonProperty
	private String eventTitle;
	
	@JsonProperty
	private String eventOrganization;
	
	@JsonProperty
	private String eventDescription;
	
	@JsonProperty
	private String eventContact;
	
	@JsonProperty
	private String eventRequest;

	public String getEventTitle() {
		return eventTitle;
	}

	public String getEventOrganization() {
		return eventOrganization;
	}

	public String getEventDescription() {
		return eventDescription;
	}

	public String getEventContact() {
		return eventContact;
	}

	public String getEventRequest() {
		return eventRequest;
	}
}
