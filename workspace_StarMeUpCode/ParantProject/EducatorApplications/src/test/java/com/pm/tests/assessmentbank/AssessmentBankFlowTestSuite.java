package com.pm.tests.assessmentbank;

import static com.pm.data.testdata.TestData.TestData;

import java.io.IOException;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;

import org.testng.annotations.Test;

import com.pm.data.testdata.AssessmentBank;
import com.pm.pages.administration.AssessmentBankPage;
import com.pm.tests.base.BaseTest;

public class AssessmentBankFlowTestSuite extends BaseTest{
	
	AssessmentBank assessmentBank = TestData.AssessmentBank();
	
	@Test(description = "EA-1564 : Validate that Admin can Access the Assessment bank", groups = {"Admin","Assessment Bank","UrgentPriority"})
	public void EA_1564() throws InterruptedException, IOException {
		
		administrationPage = homepage.getNavigationMenu().clickAdministrationTab();
		
		administrationPage.clickOnLink("Assessment Bank");
		
		assessmentBankPage = new AssessmentBankPage();
		assertThat("User not able to view Assessment Bank Page", assessmentBankPage.getPageHeader(),equalTo("Assessment Banks"));
		assessmentBankPage.resetPageSizeTo("100");
		
		assessmentBankPage.expandBank(assessmentBank.getBankName());
		
		assessmentBankPage.viewAssessment(assessmentBank.getAssessment());
	}
}
