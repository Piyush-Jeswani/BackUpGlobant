package com.pm.tests.plms;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;

import org.testng.annotations.Test;

import com.pm.pages.administration.CourseAdministrationPage;
import com.pm.tests.base.BaseTest;

public class PLMSCourseAdministrationTestSuite extends BaseTest {
	@Test(description="EA-785 : Validate that User can access the Course Administration link", groups = { "CourseAdmin" })
	public void EA_785() throws InterruptedException{
		
		administrationPage = homepage.getNavigationMenu().clickAdministrationTab();
		assertThat(administrationPage.getPageHeaderName(), equalTo("Administration"));
		
		administrationPage.clickOnLink("Course Administration");

		courseAdministrationPage = new CourseAdministrationPage();

		assertThat(courseAdministrationPage.getPageHeader(), equalTo("Search Learning Opportunities"));
		
		
	}
}
