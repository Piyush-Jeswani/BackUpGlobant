package com.pm.tests.plms;

import static com.pm.data.testdata.TestData.TestData;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;
import java.util.List;
import org.testng.annotations.Test;

import com.pm.data.users.User;
import com.pm.pages.administration.CourseAdministrationPage;
import com.pm.pages.administration.CredentialAdministrationPage;
import com.pm.pages.administration.UserAccountsPage;
import com.pm.tests.base.BaseTest;

public class PLMSSearchTeacher extends BaseTest {
	
	User searchUser = TestData.SearchUser();
	String firstName = searchUser.getFirstName();
	String lastname = searchUser.getLastName();
	List<String> existingLocations = null;

	@Test(description = "EA-1390 : Validate that Admin can Search for Joanna Teacher in Credential Administration", groups = {
			"Admin" })
	public void EA_1390() throws InterruptedException {

		administrationPage = homepage.getNavigationMenu().clickAdministrationTab();

		administrationPage.clickOnLink("Credential Administration");

		credentialAdministrationPage = new CredentialAdministrationPage();

		credentialAdministrationPage.searchUser(firstName, lastname);

		String schoolName = credentialAdministrationPage.getSchoolForSearchedUser(firstName, lastname);

		assertThat(schoolName, equalTo(""));

	}

	@Test(description = "EA-1391 : Validate that Admin can Search for Joanna Teacher within User Accounts", groups = {
			"Admin" })
	public void EA_1391() throws InterruptedException {

		administrationPage = homepage.getNavigationMenu().clickAdministrationTab();

		administrationPage.clickOnLink("User Accounts");

		userAccountPage = new UserAccountsPage();

		userAccountPage.searchUserByName(firstName, lastname);

		userAccountPage.clickOnUser(firstName, lastname);

		userAccountPage.clickSetLocationsBtn();

		existingLocations = userAccountPage.getAllLocations();

		for (String location : existingLocations) {

			userAccountPage.deleteLocation(location);
		}

		List<String> locations = userAccountPage.getAllLocations();

		assertThat(locations.size(), equalTo(0));

	}

	@Test(description = "EA-1392 : Validate that Admin can Search for Joanna Teacher without the location", groups = {
			"Admin" })
	public void EA_1392() throws InterruptedException {

		administrationPage = homepage.getNavigationMenu().clickAdministrationTab();

		administrationPage.clickOnLink("Credential Administration");

		credentialAdministrationPage = new CredentialAdministrationPage();

		credentialAdministrationPage.searchUser(firstName, lastname);

		String schoolName = credentialAdministrationPage.getSchoolForSearchedUser(firstName, lastname);

		assertThat(schoolName, equalTo(""));

		administrationPage = homepage.getNavigationMenu().clickAdministrationTab();

		administrationPage.clickOnLink("User Accounts");

		userAccountPage = new UserAccountsPage();

		userAccountPage.searchUserByName(firstName, lastname);

		userAccountPage.clickOnUser(firstName, lastname);

		userAccountPage.clickSetLocationsBtn();

		for (String location : existingLocations) {

			userAccountPage.AddLocation(location);
		}

		List<String> locations = userAccountPage.getAllLocations();

		assertThat(locations.size(), equalTo(existingLocations.size()));

		userAccountPage.clickDoneBtn();
	}

	@Test(description = "EA-1393 : Validate that Admin cannot delete component that has pending credit request", groups = {
			"Admin" })
	public void EA_1393() throws InterruptedException {

		administrationPage = homepage.getNavigationMenu().clickAdministrationTab();

		administrationPage.clickOnLink("Course Administration");

		courseAdministrationPage = new CourseAdministrationPage();

		courseAdministrationPage.clickLinkFromNavigation("Manage Components");

		courseAdministrationPage.clickListAllComponentsBtn();

		courseAdministrationPage.clickTitleFromSearchComponentResults(TestData.ComponentWithPendingCredit());

		courseAdministrationPage.clickDeleteBtnToDeleteComponent();

		String warningMsg = courseAdministrationPage.getWarningMsgText();

		assertThat(warningMsg, equalTo("This component is associated with a credit request and cannot be deleted."));

	}
}
