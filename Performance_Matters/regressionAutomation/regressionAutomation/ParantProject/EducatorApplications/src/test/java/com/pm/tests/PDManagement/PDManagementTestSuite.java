package com.pm.tests.PDManagement;

import org.testng.annotations.Test;

import static com.pm.data.testdata.TestData.TestData;

import com.pm.data.testdata.PDUserData;
import com.pm.tests.base.BaseTest;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.equalTo;

public class PDManagementTestSuite extends BaseTest{
	
	PDUserData userData = TestData.PDUserData();
	
	
	@Test(description = "EA-7205 : RE:Allow PD Super Users to add PD Playlist Moderators and Credit Approvers", groups = "Admin")
	public void EA_7205() throws InterruptedException {
		String firstname = userData.getFirstName();
		String lastname = userData.getLastName();
		
		String creditor = userData.getCreditor();
		String moderator = userData.getModerator();
		String firstName;
		
		administrationPage  = homepage.getNavigationMenu().clickAdministrationTab();
		courseAdministrationPage = administrationPage.clickCourseAdministration();
		pdManagementPage = courseAdministrationPage.clickOnTheLink("Manage Administrators");
		
		pdManagementPage.addModerator(firstname, lastname, moderator);
		
		firstName = pdManagementPage.verifyUserAdded(moderator,firstname);
		assertThat(firstName, containsString(firstname));
		pdManagementPage.deleteUser(moderator, firstname);
				
		pdManagementPage.addModerator(firstname, lastname, creditor);
		firstName = pdManagementPage.verifyUserAdded(creditor,firstname);
		assertThat(firstName, containsString(firstname));
		pdManagementPage.deleteUser(creditor, firstname);
	}
	
	@Test(description="EA-7501 : Adjust navigation to course and section pages in MyCourses Teaser", groups="Admin")
	public void EA_7501() throws InterruptedException {
		String courseName = userData.getCourseName();
		String sectionName = userData.getSectionName();
		String resourceName = userData.getResourceName();
		
		homepage  = homepage.getNavigationMenu().clickHomeTab();
		homepage.MyCoursesSection().clickShowAll();
		
		homepage.MyCoursesSection().clickOnCourse(courseName);
		String courseTitle = homepage.MyCoursesSection().getCourseTitle();
		assertThat(courseTitle, containsString(courseName));
		assertThat(homepage.MyCoursesSection().getActiveTab(), equalTo("Course Details"));
		assertThat(homepage.MyCoursesSection().getDetails("Course Details"), equalTo(true));
		homepage.MyCoursesSection().clickDetails("Section Details");
		assertThat(homepage.MyCoursesSection().getDetails("Section Details"), equalTo(true));
		
		homepage.getNavigationMenu().clickHomeTab();
		homepage.MyCoursesSection().clickShowAll();
		homepage.MyCoursesSection().clickOnSection(sectionName);
		String sectionTitle = homepage.MyCoursesSection().getCourseTitle();
		assertThat(sectionTitle, containsString(sectionName));
		assertThat(homepage.MyCoursesSection().getActiveTab(), equalTo("Section Details"));
		assertThat(homepage.MyCoursesSection().getDetails("Section Details"), equalTo(true));
		
		homepage.getNavigationMenu().clickHomeTab();
		homepage.MyCoursesSection().clickShowAll();
		homepage.MyCoursesSection().clickOnCourse(resourceName);
		String resourceTitle = homepage.MyCoursesSection().getCourseTitle();
		assertThat(resourceTitle, containsString(resourceName));
		assertThat(homepage.MyCoursesSection().getActiveTab(), equalTo("Resources"));
		
	}
}