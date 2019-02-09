package com.pm.data.testdata;

import com.fasterxml.jackson.annotation.JsonProperty;


public class PDUserData {
	public static PDUserData DEFAULT = new PDUserData();
	
	@JsonProperty
	private String moderator;
	
	@JsonProperty
	private String creditor;
	
	@JsonProperty
	private String firstName;
	
	@JsonProperty
	private String lastName;
	
	@JsonProperty
	private String courseName;
	
	@JsonProperty
	private String sectionName;
	
	@JsonProperty
	private String resourceName;
	
	@JsonProperty
	private String playlistName;
	
	@JsonProperty
	private String description;
		
	@JsonProperty
	private String moderatorFName;
	
	@JsonProperty
	private String moderatorLName;
	
	@JsonProperty
	private String discussionTitle;
	
	@JsonProperty
	private String discussionComment;
	
	@JsonProperty
	private String notificationTitle;
	
	@JsonProperty
	private String notificationMessage;

	public String getFirstName() {
		return firstName;
	}

	public String getLastName() {
		return lastName;
	}

	public String getModerator() {
		return moderator;
	}

	public String getCreditor() {
		return creditor;
	}

	public String getCourseName() {
		return courseName;
	}

	public String getSectionName() {
		return sectionName;
	}

	public String getResourceName() {
		return resourceName;
	}

	public String getPlaylistName() {
		return playlistName;
	}

	public String getDescription() {
		return description;
	}

	public String getModeratorFName() {
		return moderatorFName;
	}

	public String getModeratorLName() {
		return moderatorLName;
	}

	public String getDiscussionTitle() {
		return discussionTitle;
	}

	public String getDiscussionComment() {
		return discussionComment;
	}

	public String getNotificationTitle() {
		return notificationTitle;
	}

	public String getNotificationMessage() {
		return notificationMessage;
	}
}
