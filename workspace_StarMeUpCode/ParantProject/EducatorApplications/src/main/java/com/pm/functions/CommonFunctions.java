package com.pm.functions;

import com.pm.pages.administration.AdministrationPage;
import com.pm.pages.administration.UserAccountsPage;
import com.pm.pages.common.HomePage;

public class CommonFunctions {

	public void masqueradeAs(String firstname, String lastname) throws InterruptedException {
		HomePage homepage = new HomePage();

		AdministrationPage administrationPage = homepage.getNavigationMenu().clickAdministrationTab();

		UserAccountsPage userAccountPage = administrationPage.clickUserAccountLink();

		userAccountPage.searchUserByName(firstname, lastname);

		userAccountPage.clickOnUser(firstname, lastname);

		userAccountPage.clickAssumeIdendityBtn();
	}

	public void stopMasquerading() throws InterruptedException {
		HomePage homepage = new HomePage();

		homepage.getNavigationMenu().clickStopMasqueradingLink();
	}

}
