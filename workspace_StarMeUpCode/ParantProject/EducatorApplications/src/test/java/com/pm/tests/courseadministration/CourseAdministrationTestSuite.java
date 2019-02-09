package com.pm.tests.courseadministration;

import org.testng.annotations.Test;
import com.pm.data.testdata.CourseAdministration;
import com.pm.data.testdata.InstructorLedCourseData;
import com.pm.data.testdata.LearningOpportunityData;
import com.pm.data.testdata.SectionList;
import com.pm.data.users.User;
import com.pm.functions.CommonFunctions;
import com.pm.pages.administration.AdministrationPage;
import com.pm.pages.administration.CourseAdministrationPage;
import com.pm.pages.administration.InstructorLEDCoursePage;
import com.pm.pages.administration.LearningOpportunityPage;
import com.pm.pages.administration.AdministerConfigurationPage;
import com.pm.pages.courseSection.CourseSectionPage;
import com.pm.pages.rosterSection.RosterSectionPage;
import com.pm.tests.base.BaseTest;
import static com.pm.data.testdata.TestData.TestData;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.core.IsEqual.equalTo;
import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.core.Is.is;

import java.awt.AWTException;
import java.io.IOException;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

public class CourseAdministrationTestSuite extends BaseTest {

	CourseAdministration courseAdministration = TestData.courseAdministration();
	User principal = TestData.Principal();
	LearningOpportunityData learningOpportunityData = TestData.learningOpportunityData();
	InstructorLedCourseData instructorLedCourseData = TestData.instructorLedCourseData();
	SectionList sectionList = TestData.sectionList();
	
	private static final Date currentDate = new Date();
	@Test(description = "EA-7200 : Course Searches retain search keywords", groups = "Admin")
	public void EA_7200() throws InterruptedException{
		
		String lastname = principal.getLastName();
		String firstname = principal.getFirstName();
		commonFunctions = new CommonFunctions();
		
		String firstSearchKeyWord = courseAdministration.getFirstSearchKeyWord();
		String secondSearchKeyword = courseAdministration.getSecondSearchKeyWord();
		
		commonFunctions.masqueradeAs(firstname, lastname);
		
		courseCatalogPage = homepage.getNavigationMenu().clickCourseCatalogTab();
		courseCatalogPage.learningOpportunitySearchSection().enterSearchText(firstSearchKeyWord);
		
		String searchInputText = courseCatalogPage.learningOpportunitySearchSection().getSearchInputText();
		assertThat(searchInputText,equalTo(firstSearchKeyWord));
		
		courseCatalogPage.learningOpportunitySearchSection().enterSearchText(secondSearchKeyword);
		
		String secondSearchInputText = courseCatalogPage.learningOpportunitySearchSection().getSearchInputText();
		assertThat(secondSearchInputText,equalTo(secondSearchKeyword));
		
		commonFunctions.stopMasquerading();
	}
	
	@Test(description = "EA-7202 : Section times can't be modified when an approved room is associated to the section", groups = "Admin")
	public void EA_7202() throws InterruptedException, ParseException {
		Calendar date = Calendar.getInstance();
		DateFormat formattedDate = new SimpleDateFormat("d MMM YYYY");
		date.setTime(currentDate);
		Date startDate = date.getTime();
		String formattedStartDate = formattedDate.format(startDate);
		
		date.add(Calendar.MONTH, 1);
		Date endDate = date.getTime();
		String formattedEndDate = formattedDate.format(endDate);
		String courseName = courseAdministration.getCourseName();
		String sectionTitle = courseAdministration.getSectionTitle()+"_"+currentDate;
		String sectionName = courseAdministration.getSectionTitle()+"_";
		String numberOfParticipants = courseAdministration.getNumberOfParticipants();
		String startTime = courseAdministration.getSectionStartTime();
		String endTime = courseAdministration.getSectionEndTime();
		String roomDate = formattedDate.format(currentDate);
		administrationPage  = homepage.getNavigationMenu().clickAdministrationTab();
		courseAdministrationPage = administrationPage.clickCourseAdministration();
		courseAdministrationPage.searchCourse(courseName);
		courseAdministrationPage.clickOnCourse(courseName);
		courseSectionPage = new CourseSectionPage();
		List<String> sectionTitleList = courseAdministrationPage.getSectionList(sectionName);
		int count = sectionTitleList.size();
		if(count > 0){
			for(int i=0; i<count;i++){
				courseSectionPage.copyOrDeleteSection(sectionTitleList.get(i),"Delete");
			}
		}
		courseSectionPage = courseAdministrationPage.clickNewSection();
		
		courseSectionPage.createSection(sectionTitle,formattedStartDate,formattedEndDate,startTime,endTime,numberOfParticipants);
		
		roomManagementPage = courseSectionPage.clickManageRoom();
		roomManagementPage.clickNextButton();
		requestRoomPage = courseSectionPage.clickRequestRoomButton();
		courseSectionPage = requestRoomPage.requestRoom(roomDate,"Date");
		courseAdministrationPage = new CourseAdministrationPage();
		courseAdministrationPage.openNewTab("Administration");
		administrationPage = new AdministrationPage();
		administrationPage.clickOnLink("Room Management Administration");
		
		roomManagementPage.clickManageRequest();
		roomManagementPage.selectStatus();
		roomManagementPage.selectRoomStatus(sectionTitle);
		roomManagementPage.clickSendEmailbutton();
		roomManagementPage.switchToParentWindow();
		courseSectionPage = roomManagementPage.backToSection();
		
		assertThat("Class time button is not disabled",courseSectionPage.checkClassTimeButtonDisable(),equalTo("true"));
		
		courseSectionPage.clickEditButton();
		
		assertThat("Start time for hours is not disable",courseSectionPage.checkSelectTimeDisable("section_start_time_hour"), equalTo("true"));
		
		assertThat("Start time for minutes is not disable",courseSectionPage.checkSelectTimeDisable("section_start_time_minute"),equalTo("true"));
		assertThat("Start time for time zone is not disable",courseSectionPage.checkSelectTimeDisable("section_start_time_ampm"),equalTo("true"));
		
		assertThat("End time for hour is not disable",courseSectionPage.checkSelectTimeDisable("section_end_time_hour"),equalTo("true"));
		assertThat("End time for minutes is not disable",courseSectionPage.checkSelectTimeDisable("section_end_time_minute"),equalTo("true"));
		assertThat("End time for time zone is not disable",courseSectionPage.checkSelectTimeDisable("section_end_time_ampm"),equalTo("true"));
		
		
		assertThat("Start date calendar is visible",courseSectionPage.checkDatePresence("Start Date"),is(equalTo(false)));
		assertThat("End date calendar is visible",courseSectionPage.checkDatePresence("End Date"),is(equalTo(false)));
		
		courseSectionPage.clickCancelButton();
		roomManagementPage = courseSectionPage.clickManageRoom();
		roomManagementPage.clickDeleteButton();
		
		courseSectionPage = roomManagementPage.backToSection();
		
		assertThat(courseSectionPage.checkClassTimeButtonEnable(),is(equalTo(true)));
		
		courseSectionPage.clickEditButton();
		
		assertThat(courseSectionPage.checkSelectTimeEnable("section_start_time_hour"),is(equalTo(true)));
		assertThat(courseSectionPage.checkSelectTimeEnable("section_start_time_minute"),is(equalTo(true)));
		assertThat(courseSectionPage.checkSelectTimeEnable("section_start_time_ampm"),is(equalTo(true)));
		
		assertThat(courseSectionPage.checkSelectTimeEnable("section_end_time_hour"),is(equalTo(true)));
		assertThat(courseSectionPage.checkSelectTimeEnable("section_end_time_minute"),is(equalTo(true)));
		assertThat(courseSectionPage.checkSelectTimeEnable("section_end_time_ampm"),is(equalTo(true)));
		
		assertThat(courseSectionPage.checkDatePresence("Start Date"),is(equalTo(true)));
		assertThat(courseSectionPage.checkDatePresence("End Date"),is(equalTo(true)));
		
		administrationPage  = homepage.getNavigationMenu().clickAdministrationTab();
		courseAdministrationPage = administrationPage.clickCourseAdministration();
		courseAdministrationPage.deleteCourse(courseName, sectionTitle);
	}
	
	@Test(description ="EA-6756 : PLC Courses can have more than one section.",groups="Admin")
	public void EA_6756() throws InterruptedException, ParseException {
		String formattedStartDate = "";
		String formattedEndDate = "";
		String courseExternal = learningOpportunityData.getCourseExternal();
		String courseTitle = learningOpportunityData.getCourseTitle()+"_"+currentDate;
		String courseDescription = learningOpportunityData.getCourseDescription();
		String value = learningOpportunityData.getValue();
		String testwn = learningOpportunityData.getTestwn();
		String testValue = learningOpportunityData.getTestValue();
		String testValueNew = learningOpportunityData.getTestValueNew();
		String creditType = learningOpportunityData.getCreditType();
		
		administrationPage  = homepage.getNavigationMenu().clickAdministrationTab();
		courseAdministrationPage = administrationPage.clickCourseAdministration();
		courseAdministrationPage.clickLinkFromNavigation("Create New Learning Opportunity");
		courseAdministrationPage.clickOnLink("PLC Learning Opportunity");
		learningOpportunityPage = new LearningOpportunityPage();
		learningOpportunityPage.createLearningOpportunityCourse(courseExternal, courseTitle, courseDescription,creditType,value,testwn,testValue,testValueNew);
		courseSectionPage = courseAdministrationPage.clickNewSection();
		
		List<String> sectionName = sectionList.getSectionTitle();
		List<String> numberOfParticipants = sectionList.getNumberOfParticipants();
		List<String> sectionStartTime = sectionList.getSectionStartTime();
		List<String> sectionEndTime = sectionList.getSectionEndTime();
		int size = sectionName.size();
		
		for(int i=0;i<size;i++) {

			Calendar date = Calendar.getInstance();
			DateFormat formattedDate = new SimpleDateFormat("d MMM YYYY");
			date.setTime(currentDate);
			date.add(Calendar.DATE, i+2);
			Date startDate = date.getTime();
			formattedStartDate = formattedDate.format(startDate);
			date.add(Calendar.MONTH, 2);
			Date endDate = date.getTime();
			formattedEndDate = formattedDate.format(endDate);
			courseSectionPage.createSection(sectionName.get(i),formattedStartDate,formattedEndDate,sectionStartTime.get(i),sectionEndTime.get(i),numberOfParticipants.get(i));
			courseSectionPage.clickDoneButton();
			assertThat(courseAdministrationPage.verifySectionCreated(sectionName.get(i)), equalTo(true));
			courseAdministrationPage.clickNewSection();
			
			
		}
		courseSectionPage.clickDoneButton();
		courseAdministrationPage.actionOnCourse("Delete");

	} 
	
	@Test(description="EA-6915 : Course Office options appear within a dropdown control",groups="Admin") 
	public void EA_6915() throws InterruptedException {
		administrationPage  = homepage.getNavigationMenu().clickAdministrationTab();
		courseCatalogPage = homepage.getNavigationMenu().clickCourseCatalogTab();
		courseCatalogPage.learningOpportunitySearchSection().clickAdvancedSearch();
		List<String> options = new ArrayList<String>();
		options.add("Equal To");
		options.add("Not Equal To");
		
		List<String> operationOptionsString = courseCatalogPage.learningOpportunitySearchSection().getOperationDropdown("operationSelect");
		List<String> officeNamesList = courseCatalogPage.learningOpportunitySearchSection().getOperationDropdown("valueSelect");
		
		assertThat(courseCatalogPage.learningOpportunitySearchSection().checkOfficeLabel(), equalTo(true));
		
		if(courseCatalogPage.learningOpportunitySearchSection().checkOfficeLabel()) {
			assertThat(courseCatalogPage.learningOpportunitySearchSection().verifyEqualityOfList(options, operationOptionsString),equalTo(true));
			
			administrationPage  = homepage.getNavigationMenu().clickAdministrationTab();
			
			administrationPage.clickOnLink("Administer Configuration Entity Operations");
			administerConfigurationPage = new AdministerConfigurationPage();
			administerConfigurationPage.clickConfigureButton("Course Education Agency");
			administerConfigurationPage.clickConfigureButton("Advanced Search");
			administerConfigurationPage.clickOnLink("Manage");
			
			List<String> officeNameList = administerConfigurationPage.getOfficeNameList();
				
			assertThat(courseCatalogPage.learningOpportunitySearchSection().verifyEqualityOfList(officeNamesList, officeNameList), equalTo(true));
		}
	}
	
	@Test(description = "EA-6924 : Allow Copying of Course Level Attachments",groups= "Admin") 
	public void EA_6924() throws InterruptedException, IOException{
		String courseName = "Test_6924";
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
		
		
		administrationPage  = homepage.getNavigationMenu().clickAdministrationTab();
		courseAdministrationPage = administrationPage.clickCourseAdministration();
		courseAdministrationPage.clickLinkFromNavigation("Create New Learning Opportunity");
		courseAdministrationPage.clickOnLink("Instructor Led Course");
		instructorLedCoursePage = new InstructorLEDCoursePage();
//		instructorLedCoursePage.createInstructorLedCourse(courseTitle, courseDescription, disclaimer, schoolCat, sectionTime, survey, creditType, value, testwn, testValue,testValueNew);
		
		
		administrationPage  = homepage.getNavigationMenu().clickAdministrationTab();
		courseAdministrationPage = administrationPage.clickCourseAdministration();
		courseAdministrationPage.searchCourse(courseName);
		courseAdministrationPage.clickOnCourse(courseName);
		
		String filename = courseAdministrationPage.getAttachedFileName();
		courseAdministrationPage.actionOnCourse("Copy");
		
		String copiedCourseTitle = courseAdministrationPage.getCourseTitle();
		String copyCourseName = courseName+" (Copy)";
		
		assertThat(copyCourseName, equalTo(copiedCourseTitle));
		assertThat(courseAdministrationPage.verifyCopiedCourseFileName(filename), equalTo(true));
		courseAdministrationPage.actionOnCourse("Delete");
		
	}
	
		@Test(description = "EA-6925 : Allow Copying of Section Level Attachments", groups= "Admin")
		public void EA_6925() throws InterruptedException {
		String courseName = "Test_6924";
		String sectionTitle = "Section_6924";
		
		administrationPage  = homepage.getNavigationMenu().clickAdministrationTab();
		courseAdministrationPage = administrationPage.clickCourseAdministration();
		courseAdministrationPage.searchCourse(courseName);
		courseAdministrationPage.clickOnCourse(courseName);
		courseSectionPage = new CourseSectionPage();
		courseSectionPage.actionOnSection(sectionTitle, "Manage");
		
		String originalSectionFileName = courseSectionPage.getAttachedFileName();
		String sectionName = "Copy of: "+courseSectionPage.getSectionTitle();
		
		courseSectionPage.clickDoneButton();		
		courseSectionPage.actionOnSection(sectionTitle, "Copy");
		
		String copiedSectionFileName = courseSectionPage.getAttachedFileName();
		String copiedSectionName = courseSectionPage.getSectionTitle();
		
		assertThat(sectionName,equalTo(copiedSectionName));
		
		assertThat(originalSectionFileName, equalTo(copiedSectionFileName));
		
		homepage.getNavigationMenu().clickAdministrationTab();
		courseAdministrationPage = administrationPage.clickCourseAdministration();
		courseAdministrationPage.searchCourse(courseName);
		courseAdministrationPage.clickOnCourse(courseName);
		courseSectionPage.copyOrDeleteSection(copiedSectionName,"Delete");
	} 
	
	@Test(description="EA-6926 : Error when attempting to update and then save changes to grade/roster status",groups="Admin") 
	public void EA_6926() throws InterruptedException {
		String courseName = "EA-6426 Test";
		String sectionTitle = "Section 4";
		String creditType = "Hourly";
		String userID = "05458";
		
		administrationPage  = homepage.getNavigationMenu().clickAdministrationTab();
		
		courseAdministrationPage = administrationPage.clickCourseAdministration();
		courseAdministrationPage.searchCourse(courseName);
		courseAdministrationPage.clickOnCourse(courseName);
		
		courseSectionPage = new CourseSectionPage();
		courseSectionPage.actionOnSection(sectionTitle, "View Roster");
		
		rosterSectionPage = new RosterSectionPage();
		rosterSectionPage.clickOnLink("Add Learner Advanced");
		rosterSectionPage.addLearnerAdvanced("05458",creditType);
		rosterSectionPage.clickOnLink("Grade / Roster Status");
		rosterSectionPage.updateGradeRosterStatus("Completed", "Pass");
		
		assertThat(rosterSectionPage.verifyStatus("Grade"), equalTo("Pass"));
		assertThat(rosterSectionPage.verifyStatus("Enrollment Status"),equalTo("Completed"));
		
		rosterSectionPage.clickActionForUser(userID);
		rosterSectionPage.removeFromRoster();
		
		assertThat(rosterSectionPage.verifyRosterRemoved(userID), equalTo(false));
	} 
	
	@Test(description="EA-7000 : User is able to register for other section of the course",groups="Admin")
	public void EA_7000() throws InterruptedException {
		String courseName = "EA-6426 Test";
		String sectionTitleId = "#41480 Section 4";
		String userID = "tnl.admin";
		String sectionTitle = "Section 4";
		
		administrationPage  = homepage.getNavigationMenu().clickAdministrationTab();
		
		courseAdministrationPage = administrationPage.clickCourseAdministration();
		courseAdministrationPage.searchCourse(courseName);
		courseAdministrationPage.clickOnCourse(courseName);
		courseAdministrationPage.clickEditLink("Edit");
		courseAdministrationPage.clickCheckbox("course_multiple_enroll", "true");
		courseAdministrationPage.clickCheckbox("forbidRegistrationWhenCourseComplete", "false");
		courseAdministrationPage.clickOnLink("Save Changes");
		
		courseCatalogPage = homepage.getNavigationMenu().clickCourseCatalogTab();
		courseCatalogPage.learningOpportunitySearchSection().enterSearchText('\"'+courseName+'\"');
		courseCatalogPage.learningOpportunitySearchSection().clickViewAllLink();
		courseCatalogPage.learningOpportunitySearchSection().clickRegisterButton(sectionTitleId);
		courseCatalogPage.learningOpportunitySearchSection().clickOnLink("Next");
		courseCatalogPage.learningOpportunitySearchSection().clickOnLink("Next");
		
		courseCatalogPage = homepage.getNavigationMenu().clickCourseCatalogTab();
		courseCatalogPage.learningOpportunitySearchSection().enterSearchText('\"'+courseName+'\"');
		courseCatalogPage.learningOpportunitySearchSection().clickViewAllLink();
		
		assertThat(courseCatalogPage.learningOpportunitySearchSection().verifyGotoCourseLabel(sectionTitleId), equalTo(true));
		assertThat(courseCatalogPage.learningOpportunitySearchSection().verifyRegisterButtonCount(), greaterThan(0));
		homepage.getNavigationMenu().clickAdministrationTab();
		courseAdministrationPage = administrationPage.clickCourseAdministration();
		courseAdministrationPage.searchCourse(courseName);
		courseAdministrationPage.clickOnCourse(courseName);
		
		courseSectionPage = new CourseSectionPage();
		courseSectionPage.actionOnSection(sectionTitle, "View Roster");
		rosterSectionPage = new RosterSectionPage();
		rosterSectionPage.clickActionForUser(userID);
		rosterSectionPage.removeFromRoster();
	}
	
	@Test(description="EA-6982 : Able to register for once section and not able to register for other section of the course", groups="Admin") 
	public void EA_6982() throws InterruptedException {
		String courseName = "EA-6426 Test";
		String sectionTitleId = "#41480 Section 4";
		String userID = "tnl.admin";
		String sectionTitle = "Section 4";
		
		administrationPage  = homepage.getNavigationMenu().clickAdministrationTab();
		
		courseAdministrationPage = administrationPage.clickCourseAdministration();
		courseAdministrationPage.searchCourse(courseName);
		courseAdministrationPage.clickOnCourse(courseName);
		courseAdministrationPage.clickEditLink("Edit");
		courseAdministrationPage.clickCheckbox("course_multiple_enroll", "false");
		courseAdministrationPage.clickCheckbox("forbidRegistrationWhenCourseComplete", "false");
		courseAdministrationPage.clickOnLink("Save Changes");
		
		courseCatalogPage = homepage.getNavigationMenu().clickCourseCatalogTab();
		courseCatalogPage.learningOpportunitySearchSection().enterSearchText('\"'+courseName+'\"');
		courseCatalogPage.learningOpportunitySearchSection().clickViewAllLink();
		courseCatalogPage.learningOpportunitySearchSection().clickRegisterButton(sectionTitleId);
		courseCatalogPage.learningOpportunitySearchSection().clickOnLink("Next");
		courseCatalogPage.learningOpportunitySearchSection().clickOnLink("Next");
		
		courseCatalogPage = homepage.getNavigationMenu().clickCourseCatalogTab();
		courseCatalogPage.learningOpportunitySearchSection().enterSearchText('\"'+courseName+'\"');
		courseCatalogPage.learningOpportunitySearchSection().clickViewAllLink();
		
		assertThat(courseCatalogPage.learningOpportunitySearchSection().verifyGotoCourseLabel(sectionTitleId), equalTo(true));
		assertThat(courseCatalogPage.learningOpportunitySearchSection().verifyRegisterButtonCount(), equalTo(0));
		
		homepage.getNavigationMenu().clickAdministrationTab();
		courseAdministrationPage = administrationPage.clickCourseAdministration();
		courseAdministrationPage.searchCourse(courseName);
		courseAdministrationPage.clickOnCourse(courseName);
		
		courseSectionPage = new CourseSectionPage();
		rosterSectionPage = new RosterSectionPage();
		courseSectionPage.actionOnSection(sectionTitle, "View Roster");
		rosterSectionPage.clickActionForUser(userID);
		rosterSectionPage.removeFromRoster();
	}
	
	@Test(description = "EA-7001 : User is not able to register for other section of the course, if he/she completed course in any other section.",groups="Admin") 
	public void EA_7001() throws InterruptedException {
		String courseName = courseAdministration.getCourseTitle();
		String sectionTitleID = courseAdministration.getSectionNameId();
		String sectionTitle = courseAdministration.getSectionName();
		String userID = "tnl.admin";
		
		administrationPage  = homepage.getNavigationMenu().clickAdministrationTab();
		
		courseAdministrationPage = administrationPage.clickCourseAdministration();
		courseAdministrationPage.searchCourse(courseName);
		courseAdministrationPage.clickOnCourse(courseName);
		courseAdministrationPage.clickEditLink("Edit");
		courseAdministrationPage.clickCheckbox("course_multiple_enroll", "true");
		courseAdministrationPage.clickCheckbox("forbidRegistrationWhenCourseComplete", "true");
		courseAdministrationPage.clickOnLink("Save Changes");
		
		courseCatalogPage = homepage.getNavigationMenu().clickCourseCatalogTab();
		courseCatalogPage.learningOpportunitySearchSection().enterSearchText('\"'+courseName+'\"');
		courseCatalogPage.learningOpportunitySearchSection().clickViewAllLink();
		courseCatalogPage.learningOpportunitySearchSection().clickRegisterButton(sectionTitleID);
		courseCatalogPage.learningOpportunitySearchSection().clickOnLink("Next");
		courseCatalogPage.learningOpportunitySearchSection().clickOnLink("Next");
		
		administrationPage  = homepage.getNavigationMenu().clickAdministrationTab();
		courseAdministrationPage = administrationPage.clickCourseAdministration();
		courseAdministrationPage.searchCourse(courseName);
		courseAdministrationPage.clickOnCourse(courseName);
		
		courseSectionPage = new CourseSectionPage();
		courseSectionPage.actionOnSection(sectionTitle, "View Roster");
		
		rosterSectionPage = new RosterSectionPage();
		rosterSectionPage.clickOnLink("Grade / Roster Status");
		rosterSectionPage.changeStatusForSingleUser(userID, "Pass","Completed");
		
		courseCatalogPage = homepage.getNavigationMenu().clickCourseCatalogTab();
		courseCatalogPage.learningOpportunitySearchSection().enterSearchText('\"'+courseName+'\"');
		courseCatalogPage.learningOpportunitySearchSection().clickViewAllLink();
		
		assertThat(courseCatalogPage.learningOpportunitySearchSection().verifyRegisterButtonCount(), equalTo(0));
		assertThat(courseCatalogPage.learningOpportunitySearchSection().verifyNoTextForSection(sectionTitleID), equalTo(true));
		
		homepage.getNavigationMenu().clickAdministrationTab();
		courseAdministrationPage = administrationPage.clickCourseAdministration();
		courseAdministrationPage.searchCourse(courseName);
		courseAdministrationPage.clickOnCourse(courseName);
		
		courseSectionPage.actionOnSection(sectionTitle, "View Roster");
		rosterSectionPage.clickActionForUser(userID);
		rosterSectionPage.removeFromRoster();
	}
	
	@Test(description = "EA-7002 : User is not able to registered for another section, when user has completed one section in the course (remanining Section kept to Dates are future date)",groups = "Admin") 
	public void EA_7002() throws InterruptedException {
		String courseName = courseAdministration.getCourseTitle();
		String sectionTitleID = courseAdministration.getSectionNameId();
		String sectionTitle = courseAdministration.getSectionName();
		String userID = "tnl.admin";
		
		administrationPage  = homepage.getNavigationMenu().clickAdministrationTab();
		
		courseAdministrationPage = administrationPage.clickCourseAdministration();
		courseAdministrationPage.searchCourse(courseName);
		courseAdministrationPage.clickOnCourse(courseName);
		courseAdministrationPage.clickEditLink("Edit");
		courseAdministrationPage.clickCheckbox("course_multiple_enroll", "false");
		courseAdministrationPage.clickCheckbox("forbidRegistrationWhenCourseComplete", "true");
		courseAdministrationPage.clickOnLink("Save Changes");
		
		courseCatalogPage = homepage.getNavigationMenu().clickCourseCatalogTab();
		courseCatalogPage.learningOpportunitySearchSection().enterSearchText('\"'+courseName+'\"');
		courseCatalogPage.learningOpportunitySearchSection().clickViewAllLink();
		courseCatalogPage.learningOpportunitySearchSection().clickRegisterButton(sectionTitleID);
		courseCatalogPage.learningOpportunitySearchSection().clickOnLink("Next");
		courseCatalogPage.learningOpportunitySearchSection().clickOnLink("Next");
		
		administrationPage  = homepage.getNavigationMenu().clickAdministrationTab();
		courseAdministrationPage = administrationPage.clickCourseAdministration();
		courseAdministrationPage.searchCourse(courseName);
		courseAdministrationPage.clickOnCourse(courseName);
		
		courseSectionPage = new CourseSectionPage();
		courseSectionPage.actionOnSection(sectionTitle, "View Roster");
		
		rosterSectionPage = new RosterSectionPage();
		rosterSectionPage.clickOnLink("Grade / Roster Status");
		rosterSectionPage.changeStatusForSingleUser(userID, "Pass","Completed");
		
		courseCatalogPage = homepage.getNavigationMenu().clickCourseCatalogTab();
		courseCatalogPage.learningOpportunitySearchSection().enterSearchText('\"'+courseName+'\"');
		courseCatalogPage.learningOpportunitySearchSection().clickViewAllLink();
		
		assertThat(courseCatalogPage.learningOpportunitySearchSection().verifyRegisterButtonCount(), equalTo(0));
		assertThat(courseCatalogPage.learningOpportunitySearchSection().verifyNoTextForSection(sectionTitleID), equalTo(true));
		
		homepage.getNavigationMenu().clickAdministrationTab();
		courseAdministrationPage = administrationPage.clickCourseAdministration();
		courseAdministrationPage.searchCourse(courseName);
		courseAdministrationPage.clickOnCourse(courseName);
		
		courseSectionPage.actionOnSection(sectionTitle, "View Roster");
		rosterSectionPage.clickActionForUser(userID);
		rosterSectionPage.removeFromRoster();
	}
	
	@Test(description= "EA-6949 : Searches including courses with many sections/users are displayed within seconds",groups="Admin")
	public void EA_6949() throws InterruptedException {
		String firstName = learningOpportunityData.getFirstName();
		String lastName  = learningOpportunityData.getLastName();
		String courseName = "EA-6426";
		commonFunctions = new CommonFunctions();
		
		
		commonFunctions.masqueradeAs(lastName, firstName);
		
		courseCatalogPage = homepage.getNavigationMenu().clickCourseCatalogTab();
		courseCatalogPage.learningOpportunitySearchSection().enterSearchText('\"'+courseName+'\"');
		commonFunctions.stopMasquerading();
	}
}
