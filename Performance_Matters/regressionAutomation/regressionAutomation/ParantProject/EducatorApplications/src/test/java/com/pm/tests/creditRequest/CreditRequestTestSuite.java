package com.pm.tests.creditRequest;

import static com.pm.data.testdata.TestData.TestData;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.core.IsEqual.equalTo;

import java.io.IOException;

import org.testng.annotations.Test;

import com.pm.data.users.User;
import com.pm.pages.administration.CredentialRequestPage;
import com.pm.tests.base.BaseTest;

public class CreditRequestTestSuite extends BaseTest{
	User principal = TestData.Principal();
	@Test(description= "EA-384 : Course Superuser - ADD rights within Manage Credit Requests menu", groups = {"courseSuperUser","Credit Request", "UrgentPriority"},priority=1)
	public void EA_384() throws InterruptedException {
		String firstName = principal.getFirstName();
		String lastName = principal.getLastName();
		administrationPage = homepage.getNavigationMenu().clickAdministrationTab();
		credentialRequestPage = new CredentialRequestPage();
		administrationPage.clickOnLink("Credit Request");
		assertThat("Not able to view Manage Credit Request", credentialRequestPage.verifyPageHeader(),equalTo("Manage Credit Requests"));
		credentialRequestPage.clicManageFilterMenu("Manage Admin Rights");
		credentialRequestPage.searchForUser(firstName, lastName);
		credentialRequestPage.addRightsForUser(firstName, lastName);
		assertThat("Not able to add rights to the user",credentialRequestPage.verifyRightsTextForUser(firstName, lastName),equalTo("Remove Rights"));
	}
	
	@Test(description = "EA-383 : Credit Requests - Ability to Manage", groups={"Principal","Credit Request","UrgentPriority"}, dependsOnMethods = {"EA_384"}, priority = 1)
	public void EA_383() throws InterruptedException, IOException {
		String user = "courseSuperUser";
		String firstName = principal.getFirstName();
		String lastName = principal.getLastName();
		
		administrationPage = homepage.getNavigationMenu().clickAdministrationTab();
		credentialRequestPage = new CredentialRequestPage();
		administrationPage.clickOnLink("Credit Request");
		assertThat("User does not have rights to manage credit request", credentialRequestPage.verifyUserManageCreditRequestRight("Manage Credit Requests"),equalTo(true));
		loginpage = navigationMenu.logoutOfApplication();
		loginpage.loginAs(user);
		
		administrationPage = homepage.getNavigationMenu().clickAdministrationTab();
		credentialRequestPage = new CredentialRequestPage();
		administrationPage.clickOnLink("Credit Request");
		
		credentialRequestPage.clicManageFilterMenu("Manage Admin Rights");
		credentialRequestPage.searchForUser(firstName, lastName);
		credentialRequestPage.addRightsForUser(firstName, lastName);
		assertThat("Not able to add rights to the user",credentialRequestPage.verifyRightsTextForUser(firstName, lastName),equalTo("Add Rights"));
	}
}
