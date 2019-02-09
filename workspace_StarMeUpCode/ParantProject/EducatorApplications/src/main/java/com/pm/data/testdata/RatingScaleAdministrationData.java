package com.pm.data.testdata;

import com.fasterxml.jackson.annotation.JsonProperty;

public class RatingScaleAdministrationData {
	public static final RatingScaleAdministrationData DEFAULT = new RatingScaleAdministrationData();
	
	@JsonProperty
	private String name;

	public String getName() {
		return name;
	}
	
}
