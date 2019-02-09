package com.pm.tests.newParticipation;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;

import java.awt.AWTException;

import org.testng.annotations.Test;

import com.pm.pages.statusDashboardAdministration.StatusDashboardAdministration;
import com.pm.tests.base.BaseTest;

public class DemoClassSelenium extends BaseTest{
	
	@Test(description="EA-1004 : Validate that Principal/Status Dashboard Left to Right Scrolling works correctly", groups={"admin"})
	public void EA_1004() throws InterruptedException, AWTException {
		
		
		newParticipationPage = homepage.getNavigationMenu().clickNewParticipationTab();	
		newParticipationPage.selectActionFromAddFilterActionMenu("Manage Columns");
		
		StatusDashboardAdministration sba = new StatusDashboardAdministration();		
		assertThat("Status Dashboard Administration Table loaded properly", sba.validateStatusDashboardTable(), equalTo(true));
		sba.validateNoOfVisibleCheckBoxesWillBeGreaterThenGivenQuantity(10);
		newParticipationPage = homepage.getNavigationMenu().clickNewParticipationTab();
		newParticipationPage.newParticipationMinimizeBrowserWindow();
		newParticipationPage.scrollToBottomOfPage();
		assertThat("It scrolled Down successfully",newParticipationPage.verifyMyReportSectionVisible(),equalTo(true));		
		assertThat("Horizontal scroll is working properly",newParticipationPage.verifyHorizontalScrollPresent(),equalTo(true));
		newParticipationPage.maximizeWindow();
		
		
		
	}

}
