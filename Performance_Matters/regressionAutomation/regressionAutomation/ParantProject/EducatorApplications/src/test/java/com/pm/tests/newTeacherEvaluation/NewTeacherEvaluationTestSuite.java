package com.pm.tests.newTeacherEvaluation;

import static com.pm.data.testdata.TestData.TestData;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasItems;
import static org.hamcrest.Matchers.equalTo;

import java.util.List;

import org.testng.annotations.Test;

import com.pm.data.testdata.EvaluationProgram;
import com.pm.tests.base.BaseTest;

public class NewTeacherEvaluationTestSuite extends BaseTest{
	
	EvaluationProgram newTeacherEvaluation = TestData.newTeacherEvaluation();
	
	@Test(description = "EA-1215 : Validate that User can see Data populate in print", groups={"Teacher","New Teacher Evaluation","Program Management","fairfaxClient","UrgentPriority"})
	public void EA_1215() {
		String programName = newTeacherEvaluation.getProgramName();
		String containerName = newTeacherEvaluation.getContainerName();
		String activityName = newTeacherEvaluation.getActivityName();
		String text1 = newTeacherEvaluation.getText1();
		String text2 = newTeacherEvaluation.getText2();
		
		newTeacherEvaluationPage = homepage.getNavigationMenu().clickNewTeacherEvaluationTab();
		newTeacherEvaluationPage.clickTeacherEvaluationProgram(programName);
		newTeacherEvaluationPage.clickOnActivityFromActivityContainer(activityName, containerName);
		assertThat("User not able to access the print template for program", newTeacherEvaluationPage.getPrintTemplateText(),containsString(activityName));
		assertThat("Edit button for print template is not present", newTeacherEvaluationPage.verifyEditButtonIsPresent(),equalTo(true));
		assertThat("Delete button for print template is not present", newTeacherEvaluationPage.verifyDeleteButtonPresent(),equalTo(true));
		newTeacherEvaluationPage.editActivity(text1,text2);
		
		newTeacherEvaluationPage.clickPrintform();
		List<String> pdfContents = newTeacherEvaluationPage.getPDFContents();
		assertThat("Entered text is not present in the PDF", pdfContents,hasItems(text1,text2));
		newTeacherEvaluationPage.clickDoneButton();
	}
}
