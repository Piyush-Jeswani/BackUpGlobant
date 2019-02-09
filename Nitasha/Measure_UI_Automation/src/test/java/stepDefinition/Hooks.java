package stepDefinition;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.testng.annotations.Listeners;

import com.aventstack.extentreports.ExtentReports;
import com.aventstack.extentreports.ExtentTest;
import com.browserstack.local.Local;
import com.pages.HomePage;
import com.pages.LoginPage;
import com.quantcast.helper.Browser;
import com.quantcast.utils.ConfigurationReader;
import cucumber.api.Scenario;
import cucumber.api.java.After;
import cucumber.api.java.Before;
import gherkin.formatter.model.Feature;



//@Listeners(TestListener.class)
public class Hooks {

	protected static Local local;
	protected String browserType;
	protected String applicationURL;
	public static Browser browser;
	protected static boolean isParallel = false;
	protected static ThreadLocal<Browser> browser1 = new ThreadLocal<>();
	private static ConfigurationReader configurationReader = ConfigurationReader.getInstance();
	protected String downloadDestination = "";
	protected int retryAttempts = 0;
	protected int retryDelay = 0;

	


	static {
		isParallel = Boolean.valueOf(configurationReader.getProperty("execute.test.parallel"));
	}

	@Before
	// @org.testng.annotations.Parameters(value = { "config", "environment" })
	public void setupSuite(Scenario scenario) throws Exception {
		System.out.println("Before Hook called..");

		ConfigurationReader configurationReader = ConfigurationReader.getInstance();
		browserType = configurationReader.getProperty("browser.type");
		applicationURL = configurationReader.getProperty("application.url");
		downloadDestination = configurationReader.getProperty("download.destination");
		retryAttempts = Integer.parseInt(configurationReader.getProperty("retry.attempts"));
		retryDelay = Integer.parseInt(configurationReader.getProperty("retry.delay.millisecs"));

		browser = new Browser();
		browser.initiateBrowser(browserType, applicationURL);
		getBrowser().initiateApplication(applicationURL);
		

		System.out.println("Before Hook Ended");
	}


	
	@After  
	public void embedScreenshot(Scenario scenario) throws Exception {  
	    if (scenario.isFailed()) {  
	        try {  
	            byte[] screenshot = ((TakesScreenshot) getDriver()).getScreenshotAs(OutputType.BYTES);  
	            scenario.embed(screenshot, "image/png");  
	        } catch (WebDriverException wde) {  
	            System.err.println(wde.getMessage());  
	        } catch (ClassCastException cce) {  
	            cce.printStackTrace();  
	        }  
	  
	    }  
	    else
	    
	    
		System.out.println("After Hook Started");
		
		

		getBrowser().tearDown();
		
		

		System.out.println("After Hook Ended");
	}  

	public static HomePage loginAs(String emailAddress, String password) {
		LoginPage loginPage = new LoginPage(getDriver());
		System.out.println(password);
		HomePage homePage = loginPage.loginAs(emailAddress, password);
		return homePage;
	}

	public HomePage getDriverfor() {
		getDriver();
		HomePage home = new HomePage(getDriver());
		return home;
	}

	public static WebDriver getDriver() {
		return getBrowser().getDriver();
	}

	public static Browser getBrowser() {
		if (isParallel) {
			return browser1.get();
		} else {
			return browser;
		}
	}
	

}
