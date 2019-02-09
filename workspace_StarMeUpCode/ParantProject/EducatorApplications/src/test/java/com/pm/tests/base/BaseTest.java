package com.pm.tests.base;

import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.io.IOException;
import java.lang.reflect.Method;

import org.slf4j.Logger;

import com.pm.automation.config.Config;
import com.pm.automation.logging.Logging;
import com.pm.automation.webdriver.TestContext;
import com.pm.pages.common.*;

public abstract class BaseTest extends PageReferances implements Logging {
	public Logger log = getLogger();
	boolean isAnyUserLoggedin = false;
	String loggedInUser = null;

	@BeforeClass(alwaysRun = true)
	public void openBrowserAndLoadUrl() throws InterruptedException {
		TestContext.set(TestContext.with(Config.getBrowserType()));
		TestContext.get().getDriver().get(Config.getApplicationUrl());
		loginpage = new LoginPage();
	}

	@BeforeMethod(alwaysRun = true)
	public void loginAndGoToHomePage(Method method) throws InterruptedException, IOException {
		Test t = method.getAnnotation(Test.class);
		String user = t.groups()[0];
		if (!isAnyUserLoggedin) {
			homepage = loginpage.loginAs(user);
			navigationMenu = new NavigationMenu();
			loggedInUser = user;
			isAnyUserLoggedin = true;
		}

		if (!loggedInUser.equals(user)) {

			loginpage = navigationMenu.logoutOfApplication();
			homepage = loginpage.loginAs(user);
			navigationMenu = new NavigationMenu();
			loggedInUser = user;
			isAnyUserLoggedin = true;
		}
	}

	public String getTestName() {
		
		return Thread.currentThread().getStackTrace()[2].getMethodName();
	}

	@AfterClass(alwaysRun = true)
	public void quitBrowser() {
		TestContext.remove();
	}
}
