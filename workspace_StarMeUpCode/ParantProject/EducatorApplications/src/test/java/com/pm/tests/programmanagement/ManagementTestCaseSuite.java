package com.pm.tests.programmanagement;

import static com.pm.data.testdata.TestData.TestData;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

import org.testng.annotations.Test;

import com.pm.data.testdata.CourseApprovalAdmin;
import com.pm.data.testdata.ProgramManagementDetails;
import com.pm.pages.administration.PerformanceManagementAdministrationPage;
import com.pm.tests.base.BaseTest;

public class ManagementTestCaseSuite extends BaseTest{
	
	ProgramManagementDetails programManagement = TestData.programManagement();
	private static final Date currentDate = new Date();
	
	@Test(description = "EA-1166 : Validate that Admin can Access Program Management directed to a new tab", groups = {"Admin","Program Management","UrgentPriority"},priority=1)
	public void EA_1166() {
		administrationPage = homepage.getNavigationMenu().clickAdministrationTab();
		administrationPage.clickOnLink("Program Management Administration");
		performanceManagementAdministrationPage = new PerformanceManagementAdministrationPage();
		performanceManagementAdministrationPage.switchToFormWindow();
		assertThat("Page Header is not displayed.Gives error while loading program managemetn administration", performanceManagementAdministrationPage.getPageHeader(),equalTo("Performance Management Administration"));
	}
	
	@Test(description = "EA-1167 : Validate that Admin can Create New Program", groups = {"Admin","Program Management","UrgentPriority"},dependsOnMethods={"EA_1166"},priority=1)
	public void EA_1167() {
		DateFormat formattedDate = new SimpleDateFormat("dd MMM YYYY");
		String startDate = formattedDate.format(currentDate);
		String endDate = formattedDate.format(currentDate);
		String archivedDate = formattedDate.format(currentDate);
		String title = programManagement.getTitle()+"_"+currentDate;
		String description = programManagement.getDescription();
		String maxAttachedValue = programManagement.getMaxAttachmentValue();
		String menuTitle = programManagement.getMenuTitle();
		String totalPossible = programManagement.getTotalPossible();
		boolean isArchived = Boolean.valueOf(programManagement.getIsArchived());
		String archived = programManagement.getIsArchived();
		String displayAllResult = programManagement.getDisplayAllAtachments();
		String pureSignOff = programManagement.getPuresignOff();
		String keepSignature = programManagement.getKeepSignatures();
		String markCompleted = programManagement.getMarkCompleted();
		String isShared = programManagement.getIsShared();
		String rawScore = programManagement.getShowRawScore();
		String mappedScore = programManagement.getShowMappedScore();
		String autoStartTargetedPlan = programManagement.getAutoStartTargetedPlan();
		List<String> personFieldList = programManagement.getPersonFieldList();
		
		performanceManagementAdministrationPage.clickCreateNewProgram("Evaluation");
		assertThat("Error while loading create new program page", performanceManagementAdministrationPage.verifyCreateProgramPageIsDisplayed(),equalTo("Create/Update a Program"));
		performanceManagementAdministrationPage.createAndSaveProgram(title, description, startDate, endDate,displayAllResult, maxAttachedValue,pureSignOff,keepSignature,markCompleted,isShared,archived,archivedDate,rawScore,mappedScore,autoStartTargetedPlan,menuTitle,totalPossible,personFieldList);
		if(isArchived) {
			performanceManagementAdministrationPage.clickArchivedProgram("Evaluation");
		}
		
		assertThat("Failed to create program", performanceManagementAdministrationPage.verifyProgramCreated(title),equalTo(true));
	}
	
	@Test(description = "EA-1168 : Validate that Admin can Creates a New Activity", groups={"Admin","Program Management","UrgentPriority"},dependsOnMethods={"EA_1167"}, priority=1)
	public void EA_1168() {
		DateFormat formattedDate = new SimpleDateFormat("dd MMM YYYY");
		String title = programManagement.getTitle()+"_"+currentDate;
		String activityTitle = programManagement.getActivityTitle();
		String activityInstruction = programManagement.getActivityInstruction();
		String activityType = programManagement.getActivityType();
		String membershipGroup = programManagement.getMembershipGroup();
		String printTitle = programManagement.getPrintTitle();
		String dueDate = formattedDate.format(currentDate);
		
		performanceManagementAdministrationPage.clickProgram(title);
		performanceManagementAdministrationPage.clickActivityListButton();
		performanceManagementAdministrationPage.clickOnLink("Create a New Activity");
		performanceManagementAdministrationPage.createActivity(activityTitle, activityInstruction, dueDate, activityType, membershipGroup, printTitle);
		assertThat("Failed to create activity for program", performanceManagementAdministrationPage.verifyActivityCreated(activityTitle),equalTo(true));
	}
	
	@Test(description = "EA-1169 : Validate that Admin can Delete the New Program", groups={"Admin","Program Management","UrgentPriority"},dependsOnMethods={"EA_1168"},priority=1)
	public void EA_1169() {
		String title = programManagement.getTitle()+"_"+currentDate;
		boolean archivedFlag = Boolean.valueOf(programManagement.getIsArchived());
		performanceManagementAdministrationPage.clickOnLink("Program List");
		if(archivedFlag) {
			performanceManagementAdministrationPage.clickArchivedProgram("Evaluation");
		}
		performanceManagementAdministrationPage.deleteProgram(title);
		if(archivedFlag) {
			performanceManagementAdministrationPage.clickArchivedProgram("Evaluation");
		}
		assertThat("Failed to delete program", performanceManagementAdministrationPage.verifyProgramCreated(title),equalTo(false));
	}
}
