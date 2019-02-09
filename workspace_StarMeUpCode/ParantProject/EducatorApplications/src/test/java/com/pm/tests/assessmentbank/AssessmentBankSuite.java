package com.pm.tests.assessmentbank;
import static com.pm.data.testdata.TestData.TestData;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;

import java.io.IOException;

import org.testng.annotations.Test;

import com.pm.data.testdata.AssessmentBank;
import com.pm.pages.administration.AssessmentBankPage;
import com.pm.tests.base.BaseTest;

public class AssessmentBankSuite extends BaseTest{
	
	AssessmentBank assessmentBank = TestData.AssessmentBank();
	
	@Test(description = "EA-1565 : Validate that Admin can access Categories and edit Elements in Assessment Bank", groups = {"Admin" })
	public void EA_1565() throws InterruptedException, IOException {
		administrationPage = homepage.getNavigationMenu().clickAdministrationTab();
		
		administrationPage.clickOnLink("Assessment Bank");
		
		assessmentBankPage = new AssessmentBankPage();
		
		assessmentBankPage.resetPageSizeTo("100");
		
		assessmentBankPage.expandBank(assessmentBank.getBankName());
		
		assessmentBankPage.viewAssessment(assessmentBank.getAssessment());
		
		assertThat("Catagories are not displayed", assessmentBankPage.isCatagoriesDisplayed(),equalTo(true));
		
		assessmentBankPage.expandCatagory(assessmentBank.getCategory());
				
		assertThat("Assessment bank standards is not displayed",assessmentBankPage.isStandardsDisplayed(),equalTo(true));
		
		assessmentBankPage.expandStandard(assessmentBank.getStandard());		
				
		assertThat("Assessment bank elements are not displayed",assessmentBankPage.isElementsDisplayed(),equalTo(true));
		
		assessmentBankPage.expandElement(assessmentBank.getElement());
						
		assertThat("Question not displayed for given assessment bank",assessmentBankPage.isQuestionsDisplayedFor(assessmentBank.getElement()),equalTo(true));
	}
}
