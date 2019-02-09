package com.pm.tests.homepage;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.greaterThan;

import java.io.IOException;

import org.testng.annotations.Test;

import com.pm.pages.common.MyAnnouncementPage;
import com.pm.tests.base.BaseTest;

public class HomepageTestSuite extends BaseTest{
	
	@Test(description = "EA-1308 : Validate that User can access My course channel", groups = { "Teacher","Home Page","PLMS","UrgentPriority" })
	public void EA_1308() throws InterruptedException, IOException {

		int noOfCourses = homepage.MyCoursesSection().noOfCoursesDispleyed();

		assertThat("User does not see top 5 most recently viewed courses ", noOfCourses, equalTo(5));

		homepage.MyCoursesSection().clickShowAll();

		int noOfCoursesAfter = homepage.MyCoursesSection().noOfCoursesDisplayedAfterShowAll();

		assertThat("Show all link is not showing additional courses", noOfCoursesAfter, greaterThan(noOfCourses));

		homepage.MyCoursesSection().clickOnLink("Show Less");

		noOfCourses = homepage.MyCoursesSection().noOfCoursesDispleyed();

		assertThat("Show less link is not hiding additional courses", noOfCourses, equalTo(5));

		homepage.MyCoursesSection().clickOnLink("Show All");

		String courseName = homepage.MyCoursesSection().getTextOfCourseAt(1);

		homepage.MyCoursesSection().clickOnCourse(courseName);

		homepage.closeNewlyOpenedWindowIfAny();

		homepage.getNavigationMenu().clickHomeTab();

		assertThat("User does not see the course that they just clicked on at the top of the My Courses channel list",
				homepage.MyCoursesSection().getTextOfCourseAt(1), equalTo(courseName));
	}
	

	@Test(description = "EA-695 : Validate that user can view Announcements under My Announcements section", groups = {
			"Teacher","Home Page","Unified Portal","UrgentPriority" }, priority = 1)
	public void EA_695() throws InterruptedException, IOException {
		
		homepage.getNavigationMenu().clickHomeTab();
		
		String announcementclicked = homepage.clickAndGoToAnyAnnouncement();
		
		myAnnouncementPage = new MyAnnouncementPage();
		
		assertThat(myAnnouncementPage.getAnnounceMentName(), equalTo(announcementclicked));
		
		assertThat(myAnnouncementPage.getPageheadertext(), equalTo("My Announcements"));
	}

}
