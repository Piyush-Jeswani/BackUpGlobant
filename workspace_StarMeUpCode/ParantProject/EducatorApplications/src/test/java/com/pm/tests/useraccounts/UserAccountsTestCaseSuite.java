package com.pm.tests.useraccounts;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;

import org.testng.annotations.Test;

import com.pm.functions.CommonFunctions;
import com.pm.pages.administration.UserAccountsPage;
import com.pm.tests.base.BaseTest;

public class UserAccountsTestCaseSuite extends BaseTest{
	
	@Test(description="EA-1263 : Validate that User can access Administration tab successfully", groups={"Admin","UserAccounts","UrgentPriority"})
	public void EA_1263() throws InterruptedException {
		String firstName = "Test";
		String lastName = "Course Super User";
		commonFunctions = new CommonFunctions();
		
		commonFunctions.masqueradeAs(firstName, lastName);
		
		administrationPage = homepage.getNavigationMenu().clickAdministrationTab();
		assertThat(administrationPage.getPageHeaderName(), equalTo("Administration"));
		
		commonFunctions.stopMasquerading();
	}
	
	@Test(description = "EA-1618 : Validate that User can access User accounts", groups = {"Admin","UserAccounts","Administration","UrgentPriority"})
	public void EA_1618() {
		administrationPage = homepage.getNavigationMenu().clickAdministrationTab();
		administrationPage.clickOnLink("User Accounts");
		userAccountPage = new UserAccountsPage();
		
		assertThat(userAccountPage.getPageHeader(), equalTo("User Accounts"));
		
		administrationPage.clickOnLink("Advanced Search");
		assertThat("District school list is less than 4",userAccountPage.getAllDistrictSchoolsListCount(), greaterThanOrEqualTo(4));
		
		userAccountPage.clickUserAccountLink();
		assertThat(userAccountPage.getPageHeader(), equalTo("User Accounts"));
	}
}
