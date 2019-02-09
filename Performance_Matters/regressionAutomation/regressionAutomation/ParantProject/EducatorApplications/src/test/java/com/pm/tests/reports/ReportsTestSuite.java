package com.pm.tests.reports;

import java.io.IOException;

import org.testng.annotations.Test;

import com.pm.tests.base.BaseTest;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;

public class ReportsTestSuite extends BaseTest {
	@Test(description = "EA-715 : Validate that User is able to see the My Reports channel under New Participation tab", groups = {
			"Admin" })
	public void EA_715() throws InterruptedException, IOException {

		newParticipationPage = homepage.getNavigationMenu().clickNewParticipationTab();

		assertThat("My Reports tab is not displayed on New participation page",
				newParticipationPage.myReportsTabDisplayed(), equalTo(true));
	}

	@Test(description = "EA-716 : Validate that User is able to create a new report from New Participation> My Reports", groups = {
			"Admin" })
	public void EA_716() throws InterruptedException, IOException {

		newParticipationPage.clickCreateReportLink();

		assertThat("Create Report template is not displayed", newParticipationPage.createReportTemplateDispleyed(),
				equalTo(true));
	}

}
