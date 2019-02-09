package com.pm.tests.calibration;

import java.io.IOException;
import java.util.List;

import org.testng.annotations.Test;

import com.pm.data.testdata.CalibrationGroup;
import com.pm.data.testdata.Event;
import com.pm.data.users.User;
import com.pm.pages.administration.CalibrationGroupsPage;
import com.pm.tests.base.BaseTest;

import static com.pm.data.testdata.TestData.TestData;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.allOf;
import static org.hamcrest.Matchers.equalTo;

public class CalibrationSuite extends BaseTest {

	CalibrationGroup createCalibrationGroup = TestData.CreateCalibrationGroup();
	CalibrationGroup editCalibrationGroup = TestData.EditCalibrationGroup();
	CalibrationGroup calibrationAdministration = TestData.calibrationAdministration();
	
	@Test(description = "EA-727 : Validate that Searching for User and viewing Calibration Status functions as expected", groups = {
			"Principal" })
	public void EA_727() throws InterruptedException, IOException {

		User principal = TestData.Principal();
		String lastname = principal.getLastName();
		String firstname = principal.getFirstName();

		administrationPage = homepage.getNavigationMenu().clickAdministrationTab();

		userAccountPage = administrationPage.clickUserAccountLink();

		userAccountPage.searchUserByName(firstname, lastname);

		calibrationSummaryPage = userAccountPage.clickViewCalibrationStatusLinkForUser(firstname, lastname);

		assertThat(calibrationSummaryPage.getCalibrationStatusHeader(),
				allOf(containsString(firstname), containsString(lastname)));

		assertThat("Event close date column is not displayed",calibrationSummaryPage.isEventCloseDateColumnDisplayed(), equalTo(true));
	}

	@Test(description = "EA-728 : Validate that Admin can view scores specified by release date", groups = { "Admin" })
	public void EA_728() throws InterruptedException, IOException {

		Event event = TestData.Event();

		administrationPage = homepage.getNavigationMenu().clickAdministrationTab();

		administrationPage.clickOnLink("Calibration Administration");

		calibrationGroupsPage = new CalibrationGroupsPage();

		calibrationEventsPage = calibrationGroupsPage.clickOnEventstab();

		calibrationEventsPage.clickOwnerToSeeEvents(event.getEventName());

		calibrationEventsPage.clickEditBtn();

		calibrationEventsPage.setScoreReleasedate(event.getScoreReleaseDateToSet());

		calibrationEventsPage.saveChanges();

		calibrationEventsPage.calculateScores();

		calibrationEventsPage.saveChanges();

		calibrationEventsPage.clickOnLink("Observer Certification Status");
	}

	@Test(description = "EA-1573 : Validate that Admin can Create and manage new group", groups = {
			"Admin" }, priority = 1)
	public void EA_1573() throws InterruptedException {

		administrationPage = homepage.getNavigationMenu().clickAdministrationTab();

		administrationPage.clickOnLink("Calibration Administration");

		calibrationGroupsPage = new CalibrationGroupsPage();

		calibrationGroupsPage.createNewGroup(createCalibrationGroup);

		calibrationGroupsPage.searchGroup(createCalibrationGroup.getGroupName()); // createCalibrationGroup.getGroupName();

		calibrationGroupsPage.editGroup(editCalibrationGroup);
	}

	@Test(description = "EA-1574 : Validate that User can add District to a calibration group", groups = {
			"Admin" }, dependsOnMethods = { "EA_1573" }, priority = 1)
	public void EA_1574() throws InterruptedException {

		calibrationGroupsPage.clickLink("Locations");

		calibrationGroupsPage.clickAddBtn("Add District");

		List<String> districts = editCalibrationGroup.getDistricts();

		for (String district : districts) {
			calibrationGroupsPage.addDistrict(district);
		}

		calibrationGroupsPage.clickDoneBtn();

		for (String district : districts) {
			calibrationGroupsPage.deleteDistrict(district);
		}

	}

	@Test(description = "EA-1575 : Validate that Admin can add a site to calibration group", groups = {
			"Admin" }, dependsOnMethods = { "EA_1573" }, priority = 1)
	public void EA_1575() throws InterruptedException {

		calibrationGroupsPage.clickLink("Locations");

		calibrationGroupsPage.clickAddBtn("Add Site");

		List<String> sites = editCalibrationGroup.getSites();

		for (String site : sites) {

//			calibrationGroupsPage.searchSite(site);
			
			calibrationGroupsPage.addSite(site);
		}

		calibrationGroupsPage.clickDoneBtn();

		for (String site : sites) {

			calibrationGroupsPage.deleteSite(site);
		}
	}

	@Test(description = "EA-1576 : Validate that User can Manage Access section and add Admin to a group", groups = {
			"Admin" }, dependsOnMethods = { "EA_1573" }, priority = 1)
	public void EA_1576() throws InterruptedException {

		calibrationGroupsPage.clickLink("Admins");

		calibrationGroupsPage.clickAddAdminButton();

		List<String> admins = editCalibrationGroup.getAdmins();

		for (String admin : admins) {

			calibrationGroupsPage.searchAdmin(admin);
			
			calibrationGroupsPage.addAdmin(admin);
		}

		calibrationGroupsPage.clickDoneBtn();

		for (String admin : admins) {

			calibrationGroupsPage.deleteAdmin(admin);
		}
	}
}
