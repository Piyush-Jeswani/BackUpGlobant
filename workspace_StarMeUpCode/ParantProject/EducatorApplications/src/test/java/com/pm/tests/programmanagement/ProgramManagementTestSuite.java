package com.pm.tests.programmanagement;

import java.io.IOException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

import org.testng.annotations.Test;
import com.pm.data.testdata.Activity;
import com.pm.data.testdata.CourseApprovalAdmin;
import com.pm.data.testdata.EvaluationProgram;
import com.pm.data.testdata.ProgramManagementDetails;
import com.pm.pages.administration.PerformanceManagementAdministrationPage;
import com.pm.tests.base.BaseTest;

import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.MatcherAssert.assertThat;
import static com.pm.data.testdata.TestData.TestData;

public class ProgramManagementTestSuite extends BaseTest {

	EvaluationProgram evaluationProgram = TestData.EvaluationProgram();
	EvaluationProgram teacherEvaluationProgram = TestData.TeacherEvaluationProgram();
	EvaluationProgram principalEvaluationProgram = TestData.PrincipalEvaluationProgram();
	EvaluationProgram principalSignOffProgram = TestData.PrincipalSignOffProgram();
	ProgramManagementDetails programManagement = TestData.programManagement();
	CourseApprovalAdmin staffDevelopment = TestData.staffDevelopment();
	private static final Date currentDate = new Date();
	
	@Test(description = "EA-818 : Validate that user can Select Category and Subcategory from Dropdown", groups = { "Admin" }) 
	 public void EA_818() throws InterruptedException,IOException { 
		 String program =  evaluationProgram.getEvaluationProgramName(); 
		 String lastname = evaluationProgram.getLastnameForUser(); 
		 String firstname = evaluationProgram.getFirstnameForUser(); 
		 
		 Activity activity = evaluationProgram.getAssessmentSelectorActivity(); 
		 String container = activity.getContainer(); 
		 String activityName =  activity.getActivityName(); 
		 String catagory = activity.getCategory();
		 String subcatagory = activity.getSubCatagory();
		 
		 newParticipationPage = homepage.getNavigationMenu().clickNewParticipationTab();
		 newParticipationPage = newParticipationPage.selectEvaluationProgramFromAllEvaluations(program);
		 evaluationPage = newParticipationPage.clickOnUserForSelectedProgram(lastname, firstname);
		 activityDetailsPage = evaluationPage.clickOnActivityFromActivityContainer(activityName,container);
		 activityDetailsPage.clickEditButtonForActivity();
		 activityDetailsPage.selectCatagoryForActivity(catagory);
		 activityDetailsPage.selectSubCatagoryForActivity(subcatagory);
		 assertThat(activityDetailsPage.questionFieldAutopopulated(),equalTo(true));
		 activityDetailsPage.clickSaveAnwerBtn(); 
	 }
	 
	 @Test(description ="EA-917 : Validate that Learning Opportunities page displays successfully", groups = { "Admin" }) 
	 public void EA_917() throws InterruptedException,IOException { 
		 String program = evaluationProgram.getEvaluationProgramName(); 
		 String lastname = evaluationProgram.getLastnameForUser(); 
		 String firstname = evaluationProgram.getFirstnameForUser(); 
		 Activity activity = evaluationProgram.getLearningOpportunityActivity(); 
		 String container = activity.getContainer(); 
		 String activityName = activity.getActivityName();
		 newParticipationPage = homepage.getNavigationMenu().clickNewParticipationTab();
		 newParticipationPage = newParticipationPage.selectEvaluationProgramFromAllEvaluations(program);
		 evaluationPage =newParticipationPage.clickOnUserForSelectedProgram(lastname, firstname);
		 activityDetailsPage = evaluationPage.clickOnActivityFromActivityContainer(activityName,container);
		 List<String> OpportunityLinks = activityDetailsPage.getAllOpportunityLinks();
		 
		 for (String link : OpportunityLinks) {
			 opportunityDetailsPage = activityDetailsPage.clickOnOpportunityLink(link);
			 assertThat(opportunityDetailsPage.pageHeaderContainsOpportunityName(link), equalTo(true));
			 activityDetailsPage = opportunityDetailsPage.clickBrowserBackBtn(); }
	  }
	 
	 @Test(description = "EA-918 : Validate that Done button navigates back to the main evaluation screen", groups = { "Admin" }) 
	 public void EA_918() throws InterruptedException,IOException {
		 String container = TestData.EvaluationProgram().getAssessmentSelectorActivity().getContainer();
		 evaluationPage = activityDetailsPage.clickDoneBtn();
		 assertThat(evaluationPage.containerIsPresent(container), equalTo(true));
	  }
	 
	 @Test(description = "EA-868 : Validate that tester could click reject from the Action Menu",groups = "Principal") 
	  public void EA_868() throws InterruptedException {
	  String program = principalEvaluationProgram.getPrincipalEvaluationProgramName(); 
	  Activity activity = principalEvaluationProgram.getAssessmentSelectorForActivity();
	  String container = activity.getContainer(); 
	  String activityName = activity.getActivityName(); String lastname =
	  principalEvaluationProgram.getLastnameForUser(); 
	  String firstname = principalEvaluationProgram.getFirstnameForUser();
	  
	  newParticipationPage = homepage.getNavigationMenu().clickNewParticipationTab();
	  newParticipationPage = newParticipationPage.selectEvaluationProgramFromAllEvaluations(program);
	  evaluationPage = newParticipationPage.clickOnUserForSelectedProgram(lastname, firstname);
	  
	  newParticipationPage = newParticipationPage.clickOnActivityFromActivityContainer(activityName,container); 
	  newParticipationPage.clickActionDropdown("Reject");
	  newParticipationPage.acceptAlert(); 
	}
	 

	 @Test(description ="EA_869 : Validate that user can Submit an Activity through the action drop down", groups = "Teacher") 
	 public void EA_869() { 
		 String program = teacherEvaluationProgram.getTeacherEvaluationProgramName(); 
		 Activity activity = teacherEvaluationProgram.getAssessmentSelectorForActivity();
		 String container = activity.getContainer(); 
		 String activityName = activity.getActivityName();
		 newTeacherEvaluationPage = homepage.getNavigationMenu().clickNewTeacherEvaluationTab();
		 assertThat(newTeacherEvaluationPage.getPageTitle(),equalTo("My Evaluations 2")); 
		 newTeacherEvaluationPage = newTeacherEvaluationPage.clickTeacherEvaluationProgram(program);
		 newTeacherEvaluationPage = newTeacherEvaluationPage.clickOnActivityFromActivityContainer(activityName, container);
		 newTeacherEvaluationPage.clickDropDown();
		 newTeacherEvaluationPage.submitButton(); 
	}
	 

	@Test(description = "EA-885 : Validate that User can do a force signoff",groups = "Principal") 
	public void EA_885() throws InterruptedException {
	 String program =principalSignOffProgram.getPrincipalSignOffProgramName(); 
	 Activity activity = principalSignOffProgram.getAssessmentSelectorForActivity();
	 String container = activity.getContainer(); 
	 String activityName = activity.getActivityName(); 
	 String lastname = principalSignOffProgram.getLastnameForUser(); 
	 String firstname = principalSignOffProgram.getFirstnameForUser();
	 newParticipationPage = homepage.getNavigationMenu().clickNewParticipationTab();
	 newParticipationPage = newParticipationPage.selectEvaluationProgramFromAllEvaluations(program);
	 evaluationPage = newParticipationPage.clickOnUserForSelectedProgram(lastname, firstname);
	 newParticipationPage = newParticipationPage.clickOnActivityFromActivityContainer(activityName,container); 
	 newParticipationPage.approve();
	 newParticipationPage.clickCancelButton();
	}
}
