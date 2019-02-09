package com.third.maventest;


import static org.junit.Assert.*;

import java.net.URL;
import java.util.LinkedList;

import org.junit.After;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;

import com.saucelabs.common.SauceOnDemandAuthentication;
import com.saucelabs.common.SauceOnDemandSessionIdProvider;
import com.saucelabs.junit.ConcurrentParameterized;
import com.saucelabs.junit.SauceOnDemandTestWatcher;

import java.net.URL;

@RunWith(ConcurrentParameterized.class)
public class SampleSauceTest implements SauceOnDemandSessionIdProvider{
	
	/**
     * Constructs a {@link SauceOnDemandAuthentication} instance using the supplied user name/access key.  To use the authentication
     * supplied by environment variables or from an external file, use the no-arg {@link SauceOnDemandAuthentication} constructor.
     */
    public SauceOnDemandAuthentication authentication = new SauceOnDemandAuthentication("${userName}", "${accessKey}");
 
    /**
     * JUnit Rule which will mark the Sauce Job as passed/failed when the test succeeds or fails.
     */
    @Rule
    public SauceOnDemandTestWatcher resultReportingTestWatcher = new SauceOnDemandTestWatcher(this, authentication);
 
    /**
     * Represents the browser to be used as part of the test run.
     */
    private String browser;
    /**
     * Represents the operating system to be used as part of the test run.
     */
    private String os;
    /**
     * Represents the version of the browser to be used as part of the test run.
     */
    private String version;
    /**
     * Instance variable which contains the Sauce Job Id.
     */
    private String sessionId;
 
    /**
     * The {@link WebDriver} instance which is used to perform browser interactions with.
     */
    private WebDriver driver;
 
    /**
     * Constructs a new instance of the test.  The constructor requires three string parameters, which represent the operating
     * system, version and browser to be used when launching a Sauce VM.  The order of the parameters should be the same
     * as that of the elements within the {@link #browsersStrings()} method.
     * @param os
     * @param version
     * @param browser
     * @return 
     */
    public SampleSauceTest(String os, String version, String browser) {
        super();
        this.os = os;
        this.version = version;
        this.browser = browser;
    }
 
    /**
     * @return a LinkedList containing String arrays representing the browser combinations the test should be run against. The values
     * in the String array are used as part of the invocation of the test constructor
     */
    @ConcurrentParameterized.Parameters
    public static LinkedList<String[]> browsersStrings() {
        LinkedList<String[]> browsers = new LinkedList<String[]>();
        browsers.add(new String[]{"Windows 8.1", "11", "internet explorer"});
        browsers.add(new String[]{"OSX 10.8", "6", "safari"});
        return browsers;
    }
	
	
    //@Override
    public String getSessionId() {
        return sessionId;
    }
	
	
	
	
	public static final String URL = "https://" + "Piyush-Jeswani" + ":" + "89ec7a2f-9100-47ed-ba0d-1ac9969724b7" + "@ondemand.saucelabs.com:443/wd/hub";
	//WebDriver driver; 

	
	
	
	@Test
	public void makeFirst1()throws Exception {
		//System.out.println("title of page is: " + driver.getTitle());
		
		System.out.println("Checking Test Case 1");
		driver.get("http://www.amazon.com/");
        assertEquals("Amazon.com: Online Shopping for Electronics, Apparel, Computers, Books, DVDs & more", driver.getTitle());
	}
	
	
	@Before
	public void betup() throws Exception{
		DesiredCapabilities capabilities = new DesiredCapabilities();
        capabilities.setCapability(CapabilityType.BROWSER_NAME, browser);
        if (version != null) {
            capabilities.setCapability(CapabilityType.VERSION, version);
        }
        capabilities.setCapability(CapabilityType.PLATFORM, os);
        capabilities.setCapability("name", "Sauce Sample Test Modified");
        //"http://" + authentication.getUsername() + ":" + authentication.getAccessKey() + "@ondemand.saucelabs.com:80/wd/hub"
        this.driver = new RemoteWebDriver(
                new URL(URL),
                capabilities);
        this.sessionId = (((RemoteWebDriver) driver).getSessionId()).toString();
		//System.setProperty("webdriver.chrome.driver","D:\\Softwares\\selenium\\chromedriver_win32\\chromedriver.exe");
		//driver = new ChromeDriver();
        /*
		DesiredCapabilities caps = DesiredCapabilities.chrome();
		caps.setCapability("platform", "Windows 7");
		caps.setCapability("version", "38.0");
		caps.setCapability("name", "Sauce Sample test");
		driver = new RemoteWebDriver(new URL(URL), caps);
		driver.get("http://www.facebook.com"); */
		
		System.out.println("Testing Before ");
	}
	@After 
	public void AfterCheck(){
		System.out.println("Printing AFter ");
		driver.quit();
	}
}
