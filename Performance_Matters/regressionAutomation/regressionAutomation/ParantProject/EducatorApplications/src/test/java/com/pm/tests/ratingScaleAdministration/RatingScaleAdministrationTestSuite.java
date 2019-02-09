package com.pm.tests.ratingScaleAdministration;

import org.testng.annotations.Test;

import com.pm.data.testdata.RatingScaleAdministrationData;
import com.pm.pages.ratingScaleAdministration.RatingScaleAdministrationPage;
import com.pm.tests.base.BaseTest;
import static com.pm.data.testdata.TestData.TestData;

public class RatingScaleAdministrationTestSuite extends BaseTest{

	RatingScaleAdministrationData ratingScaleData = TestData.ratingScaleAdministrationData();
		
	@Test(description="EA-7484 : Rating Scale Admin - Cannot Add Rating Periods",groups="Admin")
	public void EA_7484() throws InterruptedException {
		String name = ratingScaleData.getName();
		administrationPage  = homepage.getNavigationMenu().clickAdministrationTab();
		administrationPage.clickOnLink("Rating Scale Administration");
		ratingScaleAdministrationPage = new RatingScaleAdministrationPage();
		ratingScaleAdministrationPage.clickActionButton(name);
		ratingScaleAdministrationPage.clickOnLink("Manage Periods");
	}
}
