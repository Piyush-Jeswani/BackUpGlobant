package com.pm.tests.newParticipation;

import static com.pm.data.testdata.TestData.TestData;
import org.testng.annotations.Test;
import com.pm.data.testdata.NewParticipation;
import com.pm.tests.base.BaseTest;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.equalTo;

public class NewParticipationTestSuite extends BaseTest{
	NewParticipation newParticipation = TestData.newParticipation();
	@Test(description="EA-1053 : Validate that User can access Form Template successfully", groups={"Principal","New Participation","Form","Management","Program","UrgentPriority"})
	public void EA_1053() throws InterruptedException {
		String evaluationProgramName = newParticipation.getEvaluationProgramName();
		String firstName = newParticipation.getFirstName();
		String lastName = newParticipation.getLastName();
		String activityName = newParticipation.getActivityName();
		String activityContainerName = newParticipation.getContainerName();
		newParticipationPage = homepage.getNavigationMenu().clickNewParticipationTab();
		newParticipationPage.selectEvaluationProgramFromAllEvaluations(evaluationProgramName);
		newParticipationPage.clickOnUserForSelectedProgram(lastName, firstName);
		newParticipationPage.clickOnActivityFromActivityContainer(activityName, activityContainerName);
		String administratorsName = newParticipationPage.getAdministratorsName();
		newParticipationPage.selectActionFromActionDropdown("Print Forms");
		
		assertThat("PDF Preview not loaded properly",newParticipationPage.verifyPDFPreviewTextVisible(), equalTo(true));
		assertThat("PDF Preview loaded with error's",newParticipationPage.getPDFAdministratorName(), containsString(administratorsName));
	}
	
	@Test(description = "EA-715 : Validate that User is able to see the My Reports channel under New Participation tab", groups = {"Admin","New Participation","Flow","Reports","UrgentPriority"})
	public void EA_715() throws InterruptedException {
		newParticipationPage = homepage.getNavigationMenu().clickNewParticipationTab();
		assertThat("My Reports channel not visible under New Participation tab", newParticipationPage.verifyMyReportSectionVisible(),equalTo(true));
	}
}
