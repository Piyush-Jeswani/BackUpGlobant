package com.pm.tests.formsv2;

import org.testng.annotations.Test;

import com.pm.data.testdata.FormsV2Data;
import com.pm.pages.administration.Formsv2Page;
import com.pm.pages.administration.PerformanceManagementAdministrationPage;
import com.pm.tests.base.BaseTest;
import static org.hamcrest.MatcherAssert.assertThat;

import static org.hamcrest.core.IsEqual.equalTo;

import static com.pm.data.testdata.TestData.TestData;

import java.util.Date;

public class FormsV2TestSuite extends BaseTest{
	
	FormsV2Data formData = TestData.formsV2Data();
	private static final Date date = new Date();
	
	@Test(description = "EA-7455 : RE:New Forms Display ID's", groups = "Admin")
	public void EA_7455() throws InterruptedException {
		String regressionProgramName = formData.getRegressionProgramName();
		String formTitle = formData.getFormTitle()+"_"+date;
		String dataDisplayDescription = formData.getDataDisplayDescription();
		String dataDisplayLabel = formData.getDataDisplayLabel();
		String dateTimeLabel = formData.getDateTimeLabel();
		String personDataLabel = formData.getPersonDataLabel();
		String whoAndWhenLabel = formData.getWhoAndWhenLabel();
		String richTextAreaLabel = formData.getRichTextAreaLabel();
		String createFormActivity = formData.getCreateFormActivity();
		String activityTitle = formData.getActivityTitle()+"_"+date;
		String containerName = formData.getContainerName();
		
		administrationPage  = homepage.getNavigationMenu().clickAdministrationTab();
		administrationPage.clickOnLink("Program Management Administration");
		formsv2Page = new Formsv2Page();
		performanceManagementAdministrationPage = new PerformanceManagementAdministrationPage();
		
		performanceManagementAdministrationPage.switchToFormWindow();
		performanceManagementAdministrationPage.clickOnLink(regressionProgramName);
		
		formsv2Page = performanceManagementAdministrationPage.clickV2FormButton();
		formsv2Page.setFormTitle(formTitle);
		
		formsv2Page.clickOnLink("Form Fields");
		
		formsv2Page.enterFieldLabels("Date-Time",dateTimeLabel);
		assertThat(formsv2Page.getFieldIds("Date-Time"),equalTo(false));
		
		
		formsv2Page.enterFieldLabels("Data Display",dataDisplayLabel);
		assertThat(formsv2Page.getFieldIds("Data Display"),equalTo(false));
		
		formsv2Page.enterFieldDescription("Data Display", dataDisplayDescription);
		formsv2Page.switchToDefaultContent();
		formsv2Page.clickUpdateButton();
		
		
		
		formsv2Page.enterFieldLabels("Who and When",whoAndWhenLabel);
		assertThat(formsv2Page.getFieldIds("Who and When"),equalTo(false));
		
		
		formsv2Page.enterFieldLabels("Rich text area",richTextAreaLabel);
		assertThat(formsv2Page.getFieldIds("Rich text area"),equalTo(false));
		
		
		formsv2Page.enterFieldLabels("Person Data Persisted",personDataLabel);
		assertThat(formsv2Page.getFieldIds("Person Data Persisted"),equalTo(false));
		
		formsv2Page.clickAddFieldButton();
		formsv2Page.clickDoneButton();
		
		String formIDFormPage = formsv2Page.getFormIDFormPage(formTitle);
		formsv2Page.clickActivityListButton();
		formsv2Page.clickOnLink(createFormActivity);
		formsv2Page.setActivityTitle(activityTitle);
		formsv2Page.selectActivityContainer(containerName);
		formsv2Page.clickAddFormButton();
		String formIDActivityPage = formsv2Page.getFormIdActivityPage(formTitle);
		assertThat(formIDFormPage, equalTo(formIDActivityPage));
		formsv2Page.selectForm(formTitle);
		formsv2Page.clickAddButton();
		String formID = formsv2Page.getFormId(formTitle);
		assertThat(formIDFormPage, equalTo(formID));
		formsv2Page.clickOnLink("Done");
		formsv2Page.deleteForm(formTitle);
	}
}
