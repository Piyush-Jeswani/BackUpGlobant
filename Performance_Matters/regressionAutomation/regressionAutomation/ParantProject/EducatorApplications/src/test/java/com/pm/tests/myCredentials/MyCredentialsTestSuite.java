package com.pm.tests.myCredentials;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.core.IsEqual.equalTo;
import org.testng.annotations.Test;
import com.pm.tests.base.BaseTest;

public class MyCredentialsTestSuite extends BaseTest{
	@Test(description = "EA-1280 : Validate that Credentials tab renders data when clicked", groups = {"Teacher","My Credentials","PLMS","UrgentPriority"})
	public void EA_1280() {
		myCredentialsPage = homepage.getNavigationMenu().clickMyCredentials();
		assertThat("Page header is different", myCredentialsPage.verifyPageHeader(),equalTo("My Credentials"));
		assertThat("Credentials are not present", myCredentialsPage.getCredentialsTextCount(),greaterThan(0));
	}
}
