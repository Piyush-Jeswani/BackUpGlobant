package com.pm.data.users;

import com.fasterxml.jackson.annotation.JsonProperty;

public class User {
	
	public static User DEFAULT = new User();
	
	@JsonProperty
	private String firstName;
	
	@JsonProperty
	private String lastName;
	
	@JsonProperty
	private String username;
	
	@JsonProperty
	private String password;

	public String getFirstName() {
		return firstName;
	}

	public String getLastName() {
		return lastName;
	}

	public String getUsername() {
		return username;
	}

	public String getPassword() {
		return password;
	}

}
