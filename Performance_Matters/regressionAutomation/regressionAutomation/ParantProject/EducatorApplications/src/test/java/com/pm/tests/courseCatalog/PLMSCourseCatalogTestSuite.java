package com.pm.tests.courseCatalog;

import static com.pm.data.testdata.TestData.TestData;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.equalTo;

import java.io.IOException;
import java.util.List;

import org.testng.annotations.Test;

import com.pm.data.testdata.CourseCatalog;
import com.pm.tests.base.BaseTest;

public class PLMSCourseCatalogTestSuite extends BaseTest{

	CourseCatalog courseCatalog = TestData.courseCatalog();
	
	@Test(description = "EA-1374 : Validate that user can Search course(s)", groups={"Teacher","Course Catalog","PLMS","UrgentPriority"})
	public void EA_1374() throws InterruptedException {
		String courseTitle = courseCatalog.getCourseTitle();
		String courseId = courseCatalog.getCourseId();
		String courseDescription = courseCatalog.getCourseDescription();
		courseCatalogPage = navigationMenu.clickCourseCatalogTab();
		
		//Search by Course Title
		courseCatalogPage.learningOpportunitySearchSection().enterSearchText('\"'+courseTitle+'\"');
		assertThat(courseCatalogPage.learningOpportunitySearchSection().getCourseTitle(), containsString(courseTitle));
		
		//Search by Course Id
		courseCatalogPage.learningOpportunitySearchSection().enterSearchText(courseId);
		assertThat(courseCatalogPage.learningOpportunitySearchSection().getCourseId(), containsString(courseId));
		
		//Search by Course Description 
		courseCatalogPage.learningOpportunitySearchSection().enterSearchText('\"'+courseDescription+'\"');
		assertThat(courseCatalogPage.learningOpportunitySearchSection().getCourseDescription(), containsString(courseDescription));
		
	}
	
	@Test(description = "EA-762 : Validate that User can Recommend courses to other users successfully", groups = {"Principal","Course Catalog","PLMS","UrgentPriority"},priority=1)
	public void EA_762() throws InterruptedException {
		String courseName = courseCatalog.getRecommendCourseName();
		String firstName = courseCatalog.getFirstName();
		String lastName = courseCatalog.getLastName();
		
		courseCatalogPage = homepage.getNavigationMenu().clickCourseCatalogTab();
		courseCatalogPage.learningOpportunitySearchSection().clickShowAll();
		courseCatalogPage.learningOpportunitySearchSection().selectPageSize();
		courseCatalogPage.learningOpportunitySearchSection().recommendCourseToUser(courseName, firstName, lastName);
	}
	

	@Test(description = "EA-1311 : Validate that User can see Course recommend", groups = { "Teacher","Home Page","PLMS","UrgentPriority"},dependsOnMethods={"EA_762"},priority=1)
	public void EA_1311() throws InterruptedException, IOException {
		String courseName = courseCatalog.getRecommendCourseName();
		
		homepage.RecommendedTrainingSection().clickOnLink("Show All");

		homepage.RecommendedTrainingSection().noOfAllTrainingsDispleyed();
		
		assertThat("Recommended Course is not displayed", homepage.RecommendedTrainingSection().verifyRecommendCourseIsDisplayed(courseName),equalTo(true));
		homepage.RecommendedTrainingSection().clickOnTraining("Test Self Paced Course");

		homepage.getNavigationMenu().clickHomeTab();
	}
	
	@Test(description = "EA-1466 : Validate that User can View all section", groups = {"Teacher","Course Catalog","PLMS","UrgentPriority"})
	public void EA_1466() throws InterruptedException {
		String courseName = courseCatalog.getCourseName();
		courseCatalogPage = homepage.getNavigationMenu().clickCourseCatalogTab();
		courseCatalogPage.learningOpportunitySearchSection().clickShowAll();
		courseCatalogPage.learningOpportunitySearchSection().enterSearchText("\""+courseName+"\"");
		courseCatalogPage.learningOpportunitySearchSection().clickViewAllLink();
		List<String> sectionTitles = courseCatalogPage.learningOpportunitySearchSection().getDatesOfSection();
		assertThat("Section titles are not sorted in chronological order", courseCatalogPage.learningOpportunitySearchSection().checkListIsSorted(sectionTitles),equalTo(true));
	}
}
