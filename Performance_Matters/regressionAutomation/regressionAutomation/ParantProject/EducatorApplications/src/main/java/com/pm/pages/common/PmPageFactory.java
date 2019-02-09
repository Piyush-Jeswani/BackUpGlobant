package com.pm.pages.common;

import org.openqa.selenium.support.PageFactory;

import com.pm.automation.webdriver.TestContext;

public class PmPageFactory {
	public static <T extends BasePage> T getPage(Class<T> pageClass){
		return PageFactory.initElements(TestContext.get().getDriver(), pageClass);
	}
}
