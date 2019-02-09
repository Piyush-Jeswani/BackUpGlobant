package com.pm.tests.anonymousSurvey;

import org.testng.annotations.Test;

import static com.pm.data.testdata.TestData.TestData;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;

import com.pm.data.users.User;
import com.pm.pages.administration.AnonymousSurveyPage;
import com.pm.tests.base.BaseTest;

public class AnonymousSurveyTestCaseSuite  extends BaseTest{
	User teacher = TestData.Teacher();
	@Test(description = "EA-1536 : Validate that Tabs Description are updated and admin can Remove Survey Coordinator", groups = {"Admin"})
	public void EA_1536() throws InterruptedException {
		String firstName = teacher.getFirstName();
		String lastName = teacher.getLastName();
		String allAccountDescription = "View, Manage, and Print all anonymous survey accounts in the system"; 
		String permissionHeaderDescription = "Assign Survey Coordinator rights to system users. Survey Coordinators are able create anonymous accounts for users within the system.";
		administrationPage = homepage.getNavigationMenu().clickAdministrationTab();
		administrationPage.clickOnLink("Anonymous Surveys");
		anonymousSurveyPage = new AnonymousSurveyPage();
		
		anonymousSurveyPage.clickTabLink("All Accounts");	
		assertThat(anonymousSurveyPage.getAllAccountsHeaderDescription(), equalTo(allAccountDescription));
		
		anonymousSurveyPage.clickTabLink("Permissions");
		assertThat(anonymousSurveyPage.getPermissionsHeaderDescription(), equalTo(permissionHeaderDescription));
		anonymousSurveyPage.removeRightsForUser(firstName, lastName);
		
		anonymousSurveyPage.clickTabLink("Select Accounts");
		anonymousSurveyPage.searchUser(firstName, lastName);
		anonymousSurveyPage.selectUserForAnonymousAccount(firstName,lastName);
		anonymousSurveyPage.createAnonymousAccount();
		
		anonymousSurveyPage.clickTabLink("Permissions");
		anonymousSurveyPage.addRightsToUser(firstName, lastName);
		assertThat("Failed to add survey coordinator rights to user",anonymousSurveyPage.verifySurveyCoordinatorIsPresent(firstName, lastName), equalTo(true));
		
		anonymousSurveyPage.removeRightsForUser(firstName, lastName);
		assertThat("Failed to remove survey coordinator rights for user",anonymousSurveyPage.verifySurveyCoordinatorIsPresent(firstName, lastName), equalTo(false));
	}
}
