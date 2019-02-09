package com.pm.tests.newObservation;

import org.apache.commons.lang3.text.WordUtils;
import org.testng.annotations.Test;

import com.pm.data.testdata.NewObservationData;
import com.pm.pages.administration.PerformanceManagementAdministrationPage;
import com.pm.tests.base.BaseTest;
import static com.pm.data.testdata.TestData.TestData;
import static org.hamcrest.MatcherAssert.assertThat;

import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasItems;


import java.util.List;

public class NewObservationTestSuite extends BaseTest{

	NewObservationData observationData = TestData.newObservationData();
	
	
	 @Test(description = "EA-7164 : New Observations look & feel",groups="Teacher")
	public void EA_7164() throws InterruptedException {
		String dusdRubricName = observationData.getDusdRubricName();
		
		observationPage = homepage.getNavigationMenu().clickObservation("Observations of me");
		observationPage.clickOnLink(dusdRubricName);
		observationPage.expandStandards();
		
		assertThat(observationPage.expandStandards() > 0 , equalTo(true));
		assertThat(observationPage.collapseStandards() > 0, equalTo(true));
		assertThat(observationPage.clickNotes("notes"), containsString("active"));
		assertThat(observationPage.clickNotes("history"),containsString("active"));
		observationPage.closePanel();
		
		observationPage.clickOnTab("Evidence Session"); 
		assertThat(observationPage.isActiveTab("Evidence Session"), equalTo(true));
		
		observationPage.clickOnTab("Details");
		assertThat(observationPage.isActiveTab("Details"), equalTo(true));
		
		observationPage.clickOnTab("Discussion");
		assertThat(observationPage.isActiveTab("Discussion"), equalTo(true));
	}
	
	@Test(description="EA-7038 : New Observations can be aligned to access groups within legacy programs",groups="Admin") 
	public void EA_7038() throws InterruptedException{
		String hexawareTraining = observationData.getHexawareTraining();
		String programName = observationData.getProgramName();
		String observationTemplate =observationData.getObservationTemplate();
		
		
		observationPage = homepage.getNavigationMenu().clickObservation("Observation designer");
		observationPage.clickOnTab("All");
		observationPage.displayAllResults();
		List<String> activeObservationList = observationPage.getActiveObservations();
		
		administrationPage  = homepage.getNavigationMenu().clickAdministrationTab();
		administrationPage.clickOnLink("Program Management Administration");
		
		performanceManagementAdministrationPage  = new PerformanceManagementAdministrationPage();
		performanceManagementAdministrationPage.switchToFormWindow();
		performanceManagementAdministrationPage.clickOnLink(hexawareTraining);
		alignObservationPage = performanceManagementAdministrationPage.clickManageLink(programName);
		alignObservationPage.clickDropDown("Align Observation");
		List<String> observationList = alignObservationPage.getAlignObservationList();
		assertThat("All aligned observations are not active", alignObservationPage.compareObservationList(activeObservationList, observationList),equalTo(true));
		String templateName = alignObservationPage.selectObservationTemplates(observationTemplate);
		alignObservationPage.clickAlignButton();
		alignObservationPage.changePageSize();
		assertThat(alignObservationPage.verifyObservationTemplateAdded(templateName), equalTo(true));
		assertThat(alignObservationPage.getObservationTemplateHeader(templateName), hasItems("name","start","schedule","delete","reopen","manage view","manage delete","manage reopen","manage observers","manage sharing","report"));
		
		List<String> headerName = alignObservationPage.getObservationTemplateHeader(templateName);
		for(int i = 2;i<headerName.size();i++) {
			String text = WordUtils.capitalize(headerName.get(i)); 
			assertThat(alignObservationPage.getObservationTemplateRights(text, templateName, i), equalTo(true));
		}
		
		alignObservationPage.closeCurrentTab();
		
	}
}
