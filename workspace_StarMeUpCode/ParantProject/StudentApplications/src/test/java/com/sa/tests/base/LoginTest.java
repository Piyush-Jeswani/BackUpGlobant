package com.sa.tests.base;

import java.io.IOException;

import org.testng.annotations.Test;

import com.sa.pages.common.LandingPage;

public class LoginTest extends BaseTest{
	@Test
	public void Testlogin() throws InterruptedException, IOException {

		landingpage = new LandingPage();
		loginpage = landingpage.clickCustomerloginBtn();
		loginpage.login("sunil.dalvi", "Weld@123");
	}
}
