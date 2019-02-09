package com.pm.tests.courseadministration;

import static com.pm.data.testdata.TestData.TestData;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.core.IsEqual.equalTo;

import java.awt.AWTException;
import java.io.IOException;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

import org.testng.annotations.Test;

import com.pm.data.testdata.CourseAdministration;
import com.pm.pages.administration.CourseAdministrationPage;
import com.pm.pages.courseSection.CourseSectionPage;
import com.pm.tests.base.BaseTest;

public class PLMSCourseAdministrationTestSuite extends BaseTest{
	
	CourseAdministration courseAdministration = TestData.courseAdministration();
	private static final Date currentDate = new Date();
	
	@Test(description = "EA-740 : Validate that List All courses functions as expected", groups= {"Principal","Course Administration","PLMS","UrgentPriority"})
	public void EA_740() {
		administrationPage = homepage.getNavigationMenu().clickAdministrationTab();
		administrationPage.clickOnLink("Course Administration");
		courseAdministrationPage = new CourseAdministrationPage();
		courseAdministrationPage.clickListAllBtn();
		
		assertThat(courseAdministrationPage.noOfListedCourses(), greaterThan(0));
	}
	
	@Test(description = "EA-7004 : Create New Section", groups={"Admin","Course Administration","UrgentPriority"})
	public void EA_7004() throws ParseException, InterruptedException, IOException, AWTException {
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
		String numberOfParticipants = courseAdministration.getNumberOfParticipants();
		String startTime = courseAdministration.getSectionStartTime();
		String endTime = courseAdministration.getSectionEndTime();
		List<String> fileNames = courseAdministration.getFileNames();
				
		administrationPage  = homepage.getNavigationMenu().clickAdministrationTab();
		courseAdministrationPage = administrationPage.clickCourseAdministration();
		courseAdministrationPage.searchCourse(courseName);
		courseAdministrationPage.clickOnCourse(courseName);
		courseSectionPage = new CourseSectionPage();
		
		courseSectionPage = courseAdministrationPage.clickNewSection();
		
		assertThat("File attach label is not displayed", courseSectionPage.verifyFileAttachFieldIsPresent(),equalTo(true));
		assertThat("Attach file button is not displayed", courseSectionPage.verifyAttachFileButtonIsPresent(),equalTo(true));
		
		courseSectionPage.createSectionWithFileupload(sectionTitle,formattedStartDate,formattedEndDate,startTime,endTime,numberOfParticipants,fileNames);
		List<String> fileNamesText = courseSectionPage.verifyFileNames();
		int size = fileNamesText.size();
		for(int i=0;i<size;i++) {
			assertThat("File not uploaded for instructor course", fileNamesText.get(i),equalTo(fileNames.get(i)));
		}
		courseSectionPage.clickDoneButton();
		
		assertThat("Section Created", courseSectionPage.verifySectionCopied(sectionTitle),equalTo(true));
		courseCatalogPage = homepage.getNavigationMenu().clickCourseCatalogTab();
		courseCatalogPage.learningOpportunitySearchSection().enterSearchText("\""+sectionTitle+"\"");
		courseCatalogPage.learningOpportunitySearchSection().clickViewAllLink();
		courseCatalogPage.learningOpportunitySearchSection().clickOnSection(sectionTitle);
		for(int i=0;i<size;i++) {
			assertThat("File not uploaded for instructor course", fileNamesText.get(i),equalTo(fileNames.get(i)));
		}
		
		homepage.getNavigationMenu().clickAdministrationTab();
		courseAdministrationPage = administrationPage.clickCourseAdministration();
		courseAdministrationPage.searchCourse(courseName);
		courseAdministrationPage.clickOnCourse(courseName);
		
		courseSectionPage.copyOrDeleteSection(sectionTitle, "Delete");
		
		assertThat("Section Deleted", courseSectionPage.verifySectionCopied(sectionTitle),equalTo(false));
		
	}
}
