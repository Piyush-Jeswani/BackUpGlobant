package com.appiumtest.meetags;

import java.io.File;
import java.net.MalformedURLException;
import java.net.URL;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;

import io.appium.java_client.android.AndroidDriver;

public class TestAndroidAppium {
	private static AndroidDriver driver;
	
@Before
public void setup() throws MalformedURLException{
	File app = new File("D:\\Meetags", "app-debug-2.1.0.apk");
	DesiredCapabilities capabilities = new DesiredCapabilities();
	capabilities.setCapability(CapabilityType.BROWSER_NAME, "");
	capabilities.setCapability("deviceName", "0244fe79504ed806");
	capabilities.setCapability("browserName", "Android");
	capabilities.setCapability(CapabilityType.VERSION, "6.0");
	capabilities.setCapability("platformName", "Android");
	capabilities.setCapability("appPackage", "com.globant.meetags.qa");
	capabilities.setCapability("appActivity", "com.globant.meetags.ui.activity.LoginActivity");//.activity
	capabilities.setCapability("app", "D:\\Meetags\\app-debug-2.1.0.apk");
	
	driver = new AndroidDriver(new URL("http://127.0.0.1:4723/wd/hub"), capabilities);
	
	
}

@Test
public void testMeetags(){
	driver.findElementById("com.globant.meetags.qa:id/fragment_login_edit_text_identification").sendKeys("hello");
	
//	Webdriver driver = new 
}

@After
public void afterTest(){
	
}



}
