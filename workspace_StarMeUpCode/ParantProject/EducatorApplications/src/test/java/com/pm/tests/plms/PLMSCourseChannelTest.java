package com.pm.tests.plms;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.greaterThan;

import java.io.IOException;

import org.testng.annotations.Test;

import com.pm.pages.administration.UIManagerPage;
import com.pm.tests.base.BaseTest;

public class PLMSCourseChannelTest extends BaseTest {

	@Test(description = "EA-1302 : Validate that Admin can access UI Manager", groups = { "Admin" })
	public void EA_1302() throws InterruptedException, IOException {

		administrationPage = homepage.getNavigationMenu().clickAdministrationTab();

		administrationPage.clickOnLink("UI Manager");

		UIManagerPage = new UIManagerPage();

		UIManagerPage.clickEditCourseLink();

		assertThat("Master UI manager code is not displayed", UIManagerPage.masterUIMangerCodeDisplayed(),
				equalTo(true));

		assertThat("Current UI manager code is not displayed", UIManagerPage.currentUIMangerCodeDisplayed(),
				equalTo(true));

	}

	
}
