package com.sa.tests.base;

import org.slf4j.Logger;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.BeforeMethod;

import java.io.IOException;
import java.lang.reflect.Method;

import com.pm.automation.config.Config;
import com.pm.automation.logging.Logging;
import com.pm.automation.webdriver.TestContext;
import com.sa.pages.common.LandingPage;
import com.sa.pages.common.LoginPage;

public abstract class BaseTest extends PageReferances implements Logging {
	public LandingPage landingpage =null;
	public LoginPage loginpage = null;
	public Logger log = getLogger();
	boolean isAnyUserLoggedin = false;
	String loggedInUser = null;	

	@BeforeClass(alwaysRun = true)
	public void openBrowserAndLoadUrl() throws InterruptedException {
		TestContext.set(TestContext.with(Config.getBrowserType()));
		TestContext.get().getDriver().get(Config.getApplicationUrl());		
	}

	@BeforeMethod(alwaysRun = true)
	public void loginAndGoToHomePage(Method method) throws InterruptedException, IOException {
		//To be done
	}

	@AfterClass(alwaysRun = true)
	public void quitBrowser() {
		TestContext.remove();
	}
}
