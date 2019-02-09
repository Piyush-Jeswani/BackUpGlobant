package com.pm.tests.courseCatalog;

import org.testng.annotations.Test;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.equalTo;

import java.io.IOException;
import java.util.List;

import com.pm.data.testdata.CourseCatalog;
import com.pm.tests.base.BaseTest;
import static com.pm.data.testdata.TestData.TestData;
public class CourseCatalogTestSuite extends BaseTest{
	
	CourseCatalog courseCatalog = TestData.courseCatalog();
	
	@Test(description="EA-7462 : Pressing Enter key from keyboard initiates course searches",groups="Admin")
	public void EA_7462() throws InterruptedException {
		courseCatalogPage = homepage.getNavigationMenu().clickCourseCatalogTab();
		courseCatalogPage.learningOpportunitySearchSection().enterSearchText("test");
		
		assertThat(courseCatalogPage.learningOpportunitySearchSection().getResultText(), containsString("test"));
		
		assertThat(courseCatalogPage.learningOpportunitySearchSection().getSearchInputText(), equalTo("test"));
		
	}
	
	@Test(description = "EA-7483 : Validate if visual cues are provided noting which facets are driving results",groups="Admin")
	public void EA_7483() throws InterruptedException {
		courseCatalogPage = homepage.getNavigationMenu().clickCourseCatalogTab();
		courseCatalogPage.learningOpportunitySearchSection().clickShowAll();
		courseCatalogPage.learningOpportunitySearchSection().clickExpandIcon("Science");
		
		courseCatalogPage.learningOpportunitySearchSection().clickFilterValue("Science","Technology");
		assertThat(courseCatalogPage.learningOpportunitySearchSection().getResultText(), containsString("Technology"));
		
		courseCatalogPage.learningOpportunitySearchSection().clickFilterValue("Science","Engineering");
		assertThat(courseCatalogPage.learningOpportunitySearchSection().getResultText(), containsString("Engineering"));
		
		courseCatalogPage.learningOpportunitySearchSection().clickFilterValue("Science","Math");
		assertThat(courseCatalogPage.learningOpportunitySearchSection().getResultText(), containsString("Math"));
		
		courseCatalogPage.learningOpportunitySearchSection().clickExpandIcon("Rating");
		courseCatalogPage.learningOpportunitySearchSection().clickRating("2");
		assertThat(courseCatalogPage.learningOpportunitySearchSection().getResultText(), containsString(courseCatalogPage.learningOpportunitySearchSection().getRatings()));
		courseCatalogPage.learningOpportunitySearchSection().resetAllfilters();
	}
	
	@Test(description="EA-7499 : Section no should be displayed along with Section name when trying to view the course from Course Catalog", groups = "Admin")
	public void EA_7499() throws InterruptedException {
		String sectionName = TestData.SectionName();
		courseCatalogPage = homepage.getNavigationMenu().clickCourseCatalogTab();
		courseCatalogPage.learningOpportunitySearchSection().clickShowAll();
		courseCatalogPage.learningOpportunitySearchSection().displayAllResults();
		String sectionNoName = courseCatalogPage.learningOpportunitySearchSection().getSectionNoAndName(sectionName);
		assertThat(sectionNoName, equalTo(sectionName));
	}
}
