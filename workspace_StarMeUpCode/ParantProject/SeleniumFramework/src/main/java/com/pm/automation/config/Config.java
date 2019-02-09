package com.pm.automation.config;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.Properties;

import com.pm.automation.webdriver.Browser;

public class Config {

	private static Properties config = loadProperties("/config.properties");

	public static Properties loadProperties(String fileName) {
		Properties newProperties = new Properties();
		try {
			newProperties.load(Config.class.getResourceAsStream(fileName));
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}

		return newProperties;
	}

	public static String getApplicationUrl() {
		return config.getProperty("app.url");
	}

	public static Browser getBrowserType() {
		String browserType =  config.getProperty("browser.type").toLowerCase();
		
		Browser browser = null;
		switch (browserType) {
		case "chrome":
			browser = Browser.CHROME;
			break;

		case "firefox":
			browser = Browser.FIREFOX;
			break;

		case "ie":
			browser = Browser.IE;
			break;		
			
		case "chrome_grid":
			browser = Browser.CHROME_GRID;
			break;
		}
		return browser;

	}
	
	public static String getBrowserName(){
		return config.getProperty("browser.type");
	}
	
	public static String getSuiteName(){
		return config.getProperty("testngXml");
	}
	
	public static String getProxy() {
		return config.getProperty("proxy");
	}

	public static String getPort() {
		return config.getProperty("port");
	}

	public static String getImplicitWaitTime() {
		return config.getProperty("implicitWaitTimeOut");
	}
	
	public static String getPageLoadTimeOut() {
		return config.getProperty("pageLoadTimeOut");
	}
	
	public static String getScriptTimeOut() {
		return config.getProperty("scriptTimeOut");
	}
	
	public static String getExplicitWaitTimeOut() {
		return config.getProperty("explicitWaitTimeOut");
	}

	public static String getSeleniumGridUrl() {
		return config.getProperty("seleniumGridUrl");
	}
}
