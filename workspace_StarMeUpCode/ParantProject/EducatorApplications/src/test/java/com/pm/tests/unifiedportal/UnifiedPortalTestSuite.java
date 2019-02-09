package com.pm.tests.unifiedportal;

import java.io.IOException;
import java.util.List;

import org.testng.annotations.Test;

import com.pm.pages.activitypages.MyLearningOpportunitiesPage;
import com.pm.pages.common.MyAnnouncementPage;
import com.pm.pages.common.MyTranscriptPage;
import com.pm.tests.base.BaseTest;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.hasItems;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.greaterThan;

public class UnifiedPortalTestSuite extends BaseTest {

	@Test(description = "EA-694 : Validate that when application loads all the appropriate tabs are displayed for user", groups = {
			"Teacher","Layout Management","Unified Portal" }, priority = 1)
	public void EA_694() throws InterruptedException, IOException {
		homepage.getNavigationMenu().clickHomeTab();
		
		List<String> sections = homepage.getAllSectionNames();
		
		assertThat(sections, hasItems("Welcome","Required Training","My Surveys","My Plans Teaser (ALL)","Courses I'm Teaching","My Announcements","Link to GP Field","Courses by Subject","Welcome","My Reports","Recommended Training","My Courses"));
		
		administrationPage = homepage.getNavigationMenu().clickAdministrationTab();
				
	}

	@Test(description = "EA-696 : Validate that when user selects show all under My Courses expands and shows all courses available to user", groups = {
			"Teacher" }, priority = 1)
	public void EA_696() throws InterruptedException, IOException {
		
		navigationMenu.clickHomeTab();
		
		int noOfCourses = homepage.MyCoursesSection().noOfCoursesDispleyed();
		
		if(noOfCourses < 5){
			assertThat("No Of courses in My courses is less than 5.", false);
		}
		else{
			homepage.MyCoursesSection().clickOnLink("Show All");
			
			int noOfCoursesAfter = homepage.MyCoursesSection().noOfCoursesDisplayedAfterShowAll();
			
			 assertThat(noOfCoursesAfter, greaterThan(noOfCourses));
		}	

	}
	
	@Test(description = "EA-698 : Validate that Administration tab is available for tnl.admin users", groups = {
			"Admin" }, priority = 2)
	public void EA_698() throws InterruptedException, IOException {
		
		administrationPage = homepage.getNavigationMenu().clickAdministrationTab();
		
		assertThat(administrationPage.getPageHeaderName(), equalTo("Administration"));

	}

	@Test(description = "EA-815 : Validate that User is able to see Learning Opportunity and My Transcript links", groups = {
			"Admin" }, priority = 2)
	public void EA_815() throws InterruptedException, IOException {
		
		homepage = navigationMenu.clickHomeTab();
		
		homepage.MyCoursesSection().clickOnLink("My Transcript");
		
		myTranscriptPage = new MyTranscriptPage();
		
		assertThat(myTranscriptPage.myTranscriptTableDisplayed(), equalTo(true));
		
		homepage = navigationMenu.clickHomeTab();
		
		homepage.MyCoursesSection().clickOnLink("Learning Opportunity");
		
		myLearningOpportunitiesPage = new MyLearningOpportunitiesPage();
		
		assertThat(myLearningOpportunitiesPage.getPageTitle(), equalTo("My Learning Opportunities"));
		
		homepage = navigationMenu.clickHomeTab();

	}
}
