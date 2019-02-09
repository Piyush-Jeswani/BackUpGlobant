package com.pm.tests.transcript;

import static com.pm.data.testdata.TestData.TestData;

import org.testng.annotations.Test;

import com.pm.data.testdata.Transcript;
import com.pm.functions.CommonFunctions;
import com.pm.tests.base.BaseTest;

public class TranscriptTestCaseSuite extends BaseTest{
	
	Transcript transcript = TestData.transcript();
	@Test(description = "EA-1338 : Validate that User can access and edit Transcript Layout", groups = {"Admin","Transcript","UrgentPriority"})
	public void EA_1338() throws InterruptedException {
		String firstName = transcript.getFirstName();
		String lastName = transcript.getLastName();
		String title = transcript.getTranscriptTitle();
		String key = transcript.getTranscriptKey();
		commonFunctions = new CommonFunctions();
		
		commonFunctions.masqueradeAs(firstName, lastName);
		transcriptPage = homepage.getNavigationMenu().clickTranscript();
		transcriptPage.editOfficialTranscriptLayout(title,key);
		commonFunctions.stopMasquerading();
	}
}
