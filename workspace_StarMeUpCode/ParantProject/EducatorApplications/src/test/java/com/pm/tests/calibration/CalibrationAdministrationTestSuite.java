package com.pm.tests.calibration;

import static com.pm.data.testdata.TestData.TestData;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.equalTo;
import java.awt.AWTException;
import java.io.IOException;
import java.util.Date;
import java.util.List;

import org.testng.annotations.Test;

import com.pm.data.testdata.CalibrationGroup;
import com.pm.pages.administration.CalibrationGroupsPage;
import com.pm.tests.base.BaseTest;

public class CalibrationAdministrationTestSuite extends BaseTest{
	
	CalibrationGroup calibrationAdministration = TestData.calibrationAdministration();
	private static final Date currentDate = new Date();
	CalibrationGroup resourceData = TestData.resourceData();
	
	@Test(description = "EA-1206 : Validate that Admin can access Calibration Administration", groups={"Admin","Calibratopn Administration","UrgentPriority"})
	public void EA_1206() {
		String eventName = calibrationAdministration.getEventName();
		String firstName = calibrationAdministration.getFirstName();
		String lastName = calibrationAdministration.getLastName();
		String userName = lastName+", "+firstName;
		List<String> navigationSectionTitle = calibrationAdministration.getCalibrationNavigationTitle();
		
		administrationPage = homepage.getNavigationMenu().clickAdministrationTab();
		administrationPage.clickOnLink("Calibration Administration");

		calibrationGroupsPage = new CalibrationGroupsPage();
		
		assertThat(calibrationGroupsPage.getPageHeader(), equalTo("Calibration Administration"));
		
		calibrationGroupsPage.clickAndGoToLink("Default");
		
		for (int i = 0; i < navigationSectionTitle.size(); i++) {
			calibrationGroupsPage.clickLink(navigationSectionTitle.get(i));
			assertThat(navigationSectionTitle.get(i), containsString(calibrationGroupsPage.getSectionHeader()));
		}
		
		calibrationGroupsPage.clickAndGoToLink("Back to Groups");
		
		calibrationEventsPage = calibrationGroupsPage.clickOnEventstab();
		
		calibrationEventsPage.clickParticipantsForEvent(eventName);
		calibrationEventsPage.enterSearchText(userName);
		
		assertThat("Not able to view user after search",calibrationEventsPage.verifyUserDisplayed(userName), equalTo(true));
		
	}
	
	@Test(description = "EA-731 : Validate that User can Manage, add and delete resources in Events successfully", groups={"CourseAdmin","Calibration Administration","UrgentPriority"})
	public void EA_731() throws IOException, InterruptedException, AWTException {
		String firstName = resourceData.getResourceFirstName();
		String lastName = resourceData.getResourceLastName();
		String resourceTitle = resourceData.getResourceTitle()+"_"+currentDate;
		String fileNameWithExtension = resourceData.getFileNameWithExtension();
		String fileName = resourceData.getFileName();
		
		administrationPage = homepage.getNavigationMenu().clickAdministrationTab();
		administrationPage.clickOnLink("Calibration Administration");
		calibrationGroupsPage = new CalibrationGroupsPage();
		calibrationEventsPage = calibrationGroupsPage.clickOnEventstab();
		calibrationEventsPage.manageUser(firstName, lastName);
		calibrationEventsPage.clickOnLink("Manage Video");
		assertThat("Add new button is not visible.User not able to manage contents", calibrationEventsPage.verifyAddNewButtonIsPresent(),equalTo(true));
		calibrationEventsPage.clickAndGoToLink("Add New");
		calibrationEventsPage.clickNewResource();
		
		calibrationEventsPage.addNewResource(resourceTitle);
		calibrationEventsPage.clickAndGoToLink("Done");
		assertThat("Failed to add resource to calibration", calibrationEventsPage.verifyResourceIsPresent(resourceTitle),equalTo(true));
		calibrationEventsPage.performActionOnResource(resourceTitle,"Edit");
		
		calibrationEventsPage.attachFile(fileNameWithExtension);
		
		calibrationEventsPage.clickAndGoToLink("Done");
		calibrationEventsPage.searchResource(resourceTitle);
		calibrationEventsPage.performActionOnResource(resourceTitle,"Edit");
		assertThat("Failed to attach file to resource", calibrationEventsPage.verifyAttachedFileName(),equalTo(fileName));
		calibrationEventsPage.performActionOnResource(resourceTitle, "Delete");
		calibrationEventsPage.clickDeleteButton();
		assertThat("Failed to delete resource for calibration ", calibrationEventsPage.verifyResourceIsPresent(resourceTitle),equalTo(false));
	}
}
