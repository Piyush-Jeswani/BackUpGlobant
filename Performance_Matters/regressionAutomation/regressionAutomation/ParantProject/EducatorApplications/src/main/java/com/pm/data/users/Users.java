package com.pm.data.users;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.pm.automation.logging.Logging;

public class Users implements Logging {
	
	@JsonIgnore
    public static final Users EMPTY = new Users();
    
    @JsonDeserialize(as = User.class)
    private User admin = User.DEFAULT;
    
    @JsonDeserialize(as = User.class)
    private User teacher = User.DEFAULT;
    
    @JsonDeserialize(as = User.class)
    private User principal = User.DEFAULT;
    
    @JsonDeserialize(as = User.class)
    private User courseAdmin = User.DEFAULT;
    
    @JsonDeserialize(as = User.class)
    private User courseSuperUser = User.DEFAULT;

	public User getAdmin() {
		return admin;
	}

	public User getTeacher() {
		return teacher;
	}

	public User getPrincipal() {
		return principal;
	}

	public User getCourseAdmin() {
		return courseAdmin;
	}

	public User getCourseSuperUser() {
		return courseSuperUser;
	}
    
}
