package com.pm.tests.coursedashboard;

import org.testng.annotations.Test;

import com.pm.data.testdata.CourseDashboardData;
import com.pm.pages.administration.CourseDashboardPage;
import com.pm.tests.base.BaseTest;
import static com.pm.data.testdata.TestData.TestData;

import static org.hamcrest.MatcherAssert.assertThat;

import static org.hamcrest.Matchers.equalTo;

import java.util.Date;
import java.util.List;

public class CourseDashboardTestSuite extends BaseTest{
	
	private static final Date date = new Date();
	CourseDashboardData courseDashboardData = TestData.courseDashboardData();
	
	@Test(description="EA-7563 : Course Dashboards - Browse Learning Opportunities by Instructor",groups = "Admin")
	public void EA_7563() throws InterruptedException {
		String firstName = courseDashboardData.getFirstName();
		String lastName = courseDashboardData.getLastName();
		String userName = firstName+", "+lastName;
		
		administrationPage = homepage.getNavigationMenu().clickAdministrationTab();
		administrationPage.clickOnLink("Course Dashboards");
		courseDashboardPage = new CourseDashboardPage();
		assertThat(courseDashboardPage.verifyPageHeader(),equalTo("Learning Opportunity Dashboard"));
		courseDashboardPage.clickOnLink("Browse Learning Opportunities by Instructor");
		courseDashboardPage.clickUserName(userName);
	}
	
	@Test(description = "EA-7564 : Course Dashboards - Search Learning Opportunities and Save Group",groups = "Admin")
	public void EA_7564() throws InterruptedException {
		String sectionNumber = courseDashboardData.getSectionNumber();
		String sectionTitle = courseDashboardData.getSectionTitle();
		String courseNumber = courseDashboardData.getCourseNumber();
		String courseTitle = courseDashboardData.getCourseTitle();
		String groupName = courseDashboardData.getGroupName()+"_"+date;
		String groupDescription = courseDashboardData.getGroupDescription();
		
		administrationPage = homepage.getNavigationMenu().clickAdministrationTab();
		administrationPage.clickOnLink("Course Dashboards");
		courseDashboardPage = new CourseDashboardPage();
		assertThat(courseDashboardPage.verifyPageHeader(),equalTo("Learning Opportunity Dashboard"));
		courseDashboardPage.clickOnLink("Search Learning Opportunities");
		courseDashboardPage.searchGroup(sectionNumber, sectionTitle, courseNumber, courseTitle);
		courseDashboardPage.clickSaveGroupButton();
		courseDashboardPage.createGroup(groupName, groupDescription);
		
	}
	
	@Test(description = "EA-7565 : Course Dashboards - Saved Learning Opportunity Groups",groups = "Admin")
	public void EA_7565() throws InterruptedException {
		String groupName = courseDashboardData.getGroupName()+"_"+date;
		String sectionNumber = courseDashboardData.getSectionId();
		String sectionName = courseDashboardData.getSectionName();
		
		administrationPage = homepage.getNavigationMenu().clickAdministrationTab();
		administrationPage.clickOnLink("Course Dashboards");
		courseDashboardPage = new CourseDashboardPage();
		assertThat(courseDashboardPage.verifyPageHeader(),equalTo("Learning Opportunity Dashboard"));
		courseDashboardPage.clickOnLink("Saved Learning Opportunity Groups");
		courseDashboardPage.clickGroup(groupName);
		courseDashboardPage.clickEditGroupButton();
		courseDashboardPage.clickAddSectionsButton();
		courseDashboardPage.switchToFrame();
		List<String> sectionIds = courseDashboardPage.addSection(sectionNumber, sectionName);
		List<String> addedSectionId = courseDashboardPage.getListOfAddedSections();
		assertThat("Failed to add section",courseDashboardPage.verifySectionsAddedArePresent(sectionIds, addedSectionId),equalTo(true));
		
	}
	
	@Test(description = "EA-7566 : Course Dashboards - Generate the Reports",groups = "Admin")
	public void EA_7566() throws InterruptedException {
		String groupName = courseDashboardData.getGroupName()+"_"+date;
		administrationPage = homepage.getNavigationMenu().clickAdministrationTab();
		administrationPage.clickOnLink("Course Dashboards");
		courseDashboardPage = new CourseDashboardPage();
		assertThat(courseDashboardPage.verifyPageHeader(),equalTo("Learning Opportunity Dashboard"));
		courseDashboardPage.clickOnLink("Saved Learning Opportunity Groups");
		courseDashboardPage.clickGroup(groupName);
	}
}
