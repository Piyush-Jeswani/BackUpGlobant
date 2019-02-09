package com.pm.tests.plms;

import java.util.List;

import org.testng.annotations.Test;

import com.pm.tests.base.BaseTest;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.hasItems;
import static org.hamcrest.Matchers.equalTo;


public class PLMSTestSuite extends BaseTest {
	
	@Test(description = "EA-772 : Validate that PLMS UI successfully loads from within Course Catalog", groups = {
			"Principal"})
	public void EA_772() throws InterruptedException {

		courseCatalogPage = homepage.getNavigationMenu().clickCourseCatalogTab();
		
		List<String> containerNames = courseCatalogPage.subjectAlignedCoursesSection().getContainerNames();

		assertThat(containerNames.size() > 0, equalTo(true));
		
		assertThat(containerNames, hasItems("Science","Engineering"));
		
		PLMS_UIPage = courseCatalogPage.subjectAlignedCoursesSection().clickMathLink();
		
		List<String> SectionNames = PLMS_UIPage.getSectionNames();

		assertThat(SectionNames.size() > 1, equalTo(true));
		
		assertThat(SectionNames, hasItems("Science","Engineering"));

	}

	@Test(description = "EA-773 : Validate that PLMS UI successfully loads when Explore button is clicked", groups = {
			"Principal" })
	public void EA_773() throws InterruptedException {

		courseCatalogPage = homepage.getNavigationMenu().clickCourseCatalogTab();

		courseCatalogPage.competencyAlignedCoursesSection().clickCharlotteDanielsonRubricOnlyLink();

		PLMS_UIPage = courseCatalogPage.competencyAlignedCoursesSection()
				.clickExploreBtnFor("PLANNING AND PREPARATION");
		
		List<String> SectionNames = PLMS_UIPage.getSectionNames();
		
		assertThat(SectionNames.size() > 1, equalTo(true));
		
		assertThat(SectionNames, hasItems("Science","Engineering"));
	}

}
