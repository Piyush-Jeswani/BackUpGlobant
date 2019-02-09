package com.pm.tests.staffManagement;

import org.testng.annotations.Test;
import static com.pm.data.testdata.TestData.TestData;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.core.IsEqual.equalTo;
import static org.hamcrest.core.StringContains.containsString;
import com.pm.data.testdata.StaffManagement;
import com.pm.data.users.User;
import com.pm.functions.CommonFunctions;
import com.pm.pages.StaffManagement.StaffManagementPage;
import com.pm.tests.base.BaseTest;

public class StaffManagementTestSuite extends BaseTest{
	StaffManagement staffManagement  = TestData.staffManagement();
	User teacher = TestData.Teacher();
	User admin = TestData.Admin();
	@Test(description ="EA-1264 : Validate that User cannot see Staff Management tab", groups = {"Admin","Staff Management","UrgentPriority"})
	public void EA_1264() throws InterruptedException {
		String lastName = staffManagement.getCourseUserLastName();
		String firstName = staffManagement.getCourseUserFirstName();
		commonFunctions = new CommonFunctions();
		staffManagementPage = new StaffManagementPage();
		commonFunctions.masqueradeAs(firstName, lastName);
		assertThat("Staff Management link present for course super user",staffManagementPage.isStaffManagementPresent(), equalTo(false));
		commonFunctions.stopMasquerading();
	}
	
	@Test(description = "EA-1159 : Validate that User can Access Administration Staff Management", groups = {"Principal","Staff Management","UrgentPriority"})
	public void EA_1159() {
		String firstName = admin.getFirstName();
		String lastName = admin.getLastName();
		String userName = lastName+", "+firstName;
		staffManagementPage = homepage.getNavigationMenu().clickStaffManagement();
		staffManagementPage.clickOnLink("Staff Details");
		staffManagementPage.clickOnLink("Administration Staff Management");
		assertThat("Administrator, TrueNorth not present", staffManagementPage.isAdministratorPresent(userName),equalTo(true));
	}
	
	@Test(description = "EA-400 : Staff Learning Pop-up - shows list of registered learning opportunities", groups= {"Admin","Staff Management","PLMS","UrgentPriority"})
	public void EA_400() {
		String firstName = teacher.getFirstName();
		String lastName = teacher.getLastName();
		staffManagementPage = homepage.getNavigationMenu().clickStaffManagement();
		staffManagementPage.clickOnLink("Staff Learning");
		staffManagementPage.clickUserAction(firstName, lastName, "Registered Learning Opportunities");
		assertThat("Registered learning opportunities are equal to zero",staffManagementPage.getRegisteredLearningOpportunitiesCount(), greaterThan(0));
	}
	
	@Test(description = "EA-337 : Starting a Program via Staff Management tab", groups = {"Principal","Staff Management","PM","UrgentPriority"})
	public void EA_337() {
		String programName = staffManagement.getStaffProgramName();
		String firstName = staffManagement.getStaffFirstName();
		String lastName = staffManagement.getStaffLastName();
		String userName = firstName+" "+lastName;
		String evaluationPersonName = lastName+", "+firstName;
		staffManagementPage = homepage.getNavigationMenu().clickStaffManagement();
		staffManagementPage.selectProgram(programName);
		staffManagementPage.selectActionForUser(userName, "Edit");
		assertThat("Cannot edit program for given user", staffManagementPage.getEvaluationPersonName(),containsString(evaluationPersonName));
	}
	
}
