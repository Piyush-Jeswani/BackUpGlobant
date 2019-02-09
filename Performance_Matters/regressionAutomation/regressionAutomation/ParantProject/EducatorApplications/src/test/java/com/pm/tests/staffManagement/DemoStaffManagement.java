package com.pm.tests.staffManagement;

import static com.pm.data.testdata.TestData.TestData;

import org.jsoup.select.Evaluator.ContainsText;
import org.testng.annotations.Test;

import com.pm.data.testdata.StaffManagement;
import com.pm.data.users.User;
import com.pm.tests.base.BaseTest;

public class DemoStaffManagement extends BaseTest{
	StaffManagement staffManagement  = TestData.staffManagement();
	User teacher = TestData.Teacher();
	User admin = TestData.Admin();
	
	@Test(description = "EA-700 : Validate that Dashboard should successfully load all the data", groups = {"Principal","Staff Management","Management","Program"})
	public void EA_700() throws InterruptedException {
		String programName = staffManagement.getProgramName(); // Regression Program #1 
		String[] activitiesId = {"278","279","280","41301","41302"}; 
		staffManagementPage = homepage.getNavigationMenu().clickStaffManagement();
		staffManagementPage.clickOnLink("Dynamic Dashboards");
		//assertThat(staffManagementPage.getPageHeader(),  ContainsText(staffManagementPage.getSelectedSite()));
		staffManagementPage.selectProgramPlan(programName);
		staffManagementPage.deselectAll();
		staffManagementPage.selectActivities(activitiesId);
		staffManagementPage.clickOnLink("Refresh");
		
		staffManagementPage.clickDownloadLink("Evaluation Completion/Status");
		//staffManagementPage.downloadCSV();
		//assertThat("CSV file not downloaded .",staffManagementPage.verifyFileDownloaded(), equalTo(true));
		//assertThat("File not deleted", staffManagementPage.verifyFileCountAfterDeletion(),equalTo(0));
	}
	

}
