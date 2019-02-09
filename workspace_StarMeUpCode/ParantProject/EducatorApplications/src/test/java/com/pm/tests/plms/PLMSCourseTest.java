package com.pm.tests.plms;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.greaterThan;
import java.io.IOException;

import org.testng.annotations.Test;

import com.pm.pages.administration.CourseAdministrationPage;
import com.pm.tests.base.BaseTest;

public class PLMSCourseTest extends BaseTest {

	@Test(description = "EA-737 : Validate that User can Make a copy of a course and deleting a copied course", groups = {
			"Principal" })
	public void EA_737() throws InterruptedException, IOException {
		String courseName = "Test EA 1703 735";

		courseApprovalPage = homepage.getNavigationMenu().clickProposeACourseTab();

		courseApprovalPage.searchCourse(courseName);

		courseApprovalPage.copyCourse(courseName);

		String copiedCourseName = courseName + " (Copy)";

		assertThat("Course is not copied", courseApprovalPage.isCourseDisplayed(copiedCourseName), equalTo(true));

		courseApprovalPage.deleteCourse(copiedCourseName);

		assertThat("Course is not deleted", courseApprovalPage.isCourseDisplayed(copiedCourseName), equalTo(false));
	}

	@Test(description = "EA-740 : Validate that List All courses functions as expected", groups = { "Principal" })
	public void EA_740() throws InterruptedException, IOException {

		administrationPage = navigationMenu.clickAdministrationTab();

		administrationPage.clickOnLink("Course Administration");

		courseAdministrationPage = new CourseAdministrationPage();

		courseAdministrationPage.clickListAllBtn();

		assertThat("All courses are not listed", courseAdministrationPage.noOfListedCourses(), greaterThan(1));

	}

	@Test(description = "EA-745 : Validate that User can Copy a Course successfully and displaying the copied course correctly", groups = {
			"Principal" })
	public void EA_745() throws InterruptedException, IOException {

		administrationPage = navigationMenu.clickAdministrationTab();

		administrationPage.clickOnLink("Course Administration");

		courseAdministrationPage = new CourseAdministrationPage();

		courseAdministrationPage.searchCourse("**Regression Test Course Sept 29");

		courseAdministrationPage.clickOnCourse("**Regression Test Course Sept 29");

		assertThat(courseAdministrationPage.getCourseTitle(), equalTo("**Regression Test Course Sept 29"));
	}
	
	
}
