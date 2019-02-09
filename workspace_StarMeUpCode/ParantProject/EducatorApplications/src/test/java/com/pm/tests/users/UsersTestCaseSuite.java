package com.pm.tests.users;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;

import org.testng.annotations.Test;

import com.pm.pages.administration.CourseAdministrationPage;
import com.pm.tests.base.BaseTest;

public class UsersTestCaseSuite extends BaseTest{
	
	@Test(description = "EA-698 : Validate that Administration tab is available for tnl.admin users", groups= {"Admin","Users","UnifiedPortal","UrgentPriority"})
	public void EA_698() {
		administrationPage = homepage.getNavigationMenu().clickAdministrationTab();
		
		assertThat(administrationPage.getPageHeaderName(), equalTo("Administration"));
	}
	
	@Test(description = "EA-785 : Validate that User can access the Course Administration link", groups = {"Admin","Users","PLMS","UrgentPriority"})
	public void EA_785() {
		administrationPage = homepage.getNavigationMenu().clickAdministrationTab();
		
		assertThat(administrationPage.getPageHeaderName(), equalTo("Administration"));
		
		administrationPage.clickCourseAdministration();
		courseAdministrationPage = new CourseAdministrationPage();
		assertThat(courseAdministrationPage.getPageHeader(), equalTo("Search Learning Opportunities"));
	}
}
