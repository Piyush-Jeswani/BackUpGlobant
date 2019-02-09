package com.pm.tests.proposeCourse;

import static com.pm.data.testdata.TestData.TestData;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.core.IsEqual.equalTo;

import java.io.IOException;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;

import org.testng.annotations.Test;

import com.pm.data.testdata.CourseAdministration;
import com.pm.data.testdata.InstructorLedCourseData;
import com.pm.pages.administration.CourseAdministrationPage;
import com.pm.pages.administration.InstructorLEDCoursePage;
import com.pm.pages.courseSection.CourseSectionPage;
import com.pm.tests.base.BaseTest;

public class ProposeCourseTestSuite extends BaseTest{
	InstructorLedCourseData instructorLedCourseData = TestData.instructorLedCourseData();
	CourseAdministration courseAdministration = TestData.courseAdministration();
	private static final Date currentDate = new Date();
	
	@Test(description = "EA-736 : Validate that User can Create a course successfully", groups={"Principal","Propose a Course","UrgentPriority"},priority=1)
	public void EA_736() throws InterruptedException, IOException, ParseException {
		String courseTitle = instructorLedCourseData.getCourseTitle()+"_"+currentDate;
		String courseDescription = instructorLedCourseData.getCourseDescription();
		String value = instructorLedCourseData.getValue();
		String testwn = instructorLedCourseData.getTestwn();
		String testValue = instructorLedCourseData.getTestValue();
		String creditType = instructorLedCourseData.getCreditType();
		String disclaimer = instructorLedCourseData.getDisclaimer();
		String schoolCat = instructorLedCourseData.getSchoolCat();
		String survey = instructorLedCourseData.getSurvey();
		String sectionTime = instructorLedCourseData.getSectionTime();
		String testValueNew = instructorLedCourseData.getTestValueNew();
		String sectionStartTime = instructorLedCourseData.getSectionStartTime();
		String sectionEndTime = instructorLedCourseData.getSectionEndTime();
		
		Calendar date = Calendar.getInstance();
		DateFormat formattedDate = new SimpleDateFormat("d MMM YYYY");
		date.setTime(currentDate);
		Date startDate = date.getTime();
		String formattedStartDate = formattedDate.format(startDate);
		
		date.add(Calendar.MONTH, 2);
		Date endDate = date.getTime();
		String formattedEndDate = formattedDate.format(endDate);
		
		
		String sectionTitle = courseAdministration.getSectionTitle()+"_"+currentDate;
		String numberOfParticipants = courseAdministration.getNumberOfParticipants();
		
		courseApprovalPage = homepage.getNavigationMenu().clickProposeACourseTab();
		courseApprovalPage.selectNavigationMenu("Propose A Course");
		courseApprovalPage.selectCourseType("New Instructor Led Course");
		instructorLedCoursePage = new InstructorLEDCoursePage();
		instructorLedCoursePage.createInstructorLedCourse(courseTitle, courseDescription, disclaimer, schoolCat, sectionTime, survey, creditType, value, testwn, testValue,testValueNew);
		assertThat("Failed to create Course", instructorLedCoursePage.verifyInstructorLEDCourseCreated(),equalTo(courseTitle));
		
		instructorLedCoursePage.clickOnLink("New Section");
		courseSectionPage = new CourseSectionPage();
		courseSectionPage.createSection(sectionTitle,formattedStartDate,formattedEndDate,sectionStartTime,sectionEndTime,numberOfParticipants);
		assertThat("Failed to create section", courseSectionPage.getSectionTitle(),equalTo(sectionTitle));
		courseSectionPage.addDayToClassTime();
	}
	
	@Test(description = "EA-737 : Validate that User can Make a copy of a course and deleting a copied course",groups = {"Principal","Courses","UrgentPriority"},dependsOnMethods = {"EA_736"},priority=1)
	public void EA_737() {
		String courseTitle = instructorLedCourseData.getCourseTitle()+"_"+currentDate;
		String copiedCourseTitle = courseTitle+" (Copy)";
		
		courseApprovalPage = homepage.getNavigationMenu().clickProposeACourseTab();
		courseApprovalPage.searchCourse(courseTitle);
		courseApprovalPage.copyCourse(courseTitle);
		assertThat("Instructor LED course is not copied", courseApprovalPage.isCourseDisplayed(copiedCourseTitle),equalTo(true));
		courseApprovalPage.actionOnCourse(copiedCourseTitle, "Edit Course");
		courseApprovalPage.clickOnLink("Edit Course");
		courseAdministrationPage = new CourseAdministrationPage();
		courseAdministrationPage.clickEditLink("Edit");
		assertThat("Bankable checkbox is not checked", courseAdministrationPage.verifyBankableCheckboxIsChecked(),equalTo(true));
		courseAdministrationPage.clickOnLink("Cancel");
		courseAdministrationPage.clickOnLink("Done");
		courseAdministrationPage.clickOnLink("Done");
		courseApprovalPage.deleteCourse(copiedCourseTitle);
		assertThat("Instructor LED course is not deleted", courseApprovalPage.isCourseDisplayed(copiedCourseTitle),equalTo(false));
		
	}
	
	@Test(description = "EA-738 : Validate that User can Create, delete a Course and copied sections", groups = {"Principal","Courses","UrgentPriority"},dependsOnMethods = {"EA_736"},priority =1)
	public void EA_738() {
		String courseTitle = instructorLedCourseData.getCourseTitle()+"_"+currentDate;
		String sectionTitle = courseAdministration.getSectionTitle()+"_"+currentDate;
		String copiedSectionName = "Copy of: "+sectionTitle;
		
		courseApprovalPage = homepage.getNavigationMenu().clickProposeACourseTab();
		courseApprovalPage.searchCourse(courseTitle);
		courseApprovalPage.performActionOnCourse(courseTitle, "Edit Course");
		courseApprovalPage.clickOnLink("Edit");
		courseSectionPage = new CourseSectionPage();
		courseSectionPage.performAction(sectionTitle, "Copy");
		assertThat("Failed to copy section", courseSectionPage.verifySectionCopied(copiedSectionName),equalTo(true));
		courseSectionPage.performAction(copiedSectionName, "Delete");
		assertThat("Failed to delete section", courseSectionPage.verifySectionCopied(copiedSectionName),equalTo(false));
		courseSectionPage.clickOnLink("Continue");
		courseApprovalPage.deleteInstructorCourse();
		assertThat("Failed to delete course", courseApprovalPage.isCourseDisplayed(courseTitle),equalTo(false));
	}
}
