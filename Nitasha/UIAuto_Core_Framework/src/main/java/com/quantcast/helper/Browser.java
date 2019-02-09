package com.quantcast.helper;

import java.io.FileReader;
import java.net.URL;
import java.util.Arrays;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import org.apache.log4j.Logger;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.ie.InternetExplorerDriver;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.safari.SafariDriver;

import com.quantcast.constants.FrameworkConstants;

// TODO: Auto-generated Javadoc
/**
 * The Class Browser.
 */
public class Browser {
	// private Local l;
	/** The log4j Logger instance. */
	static Logger log = Logger.getLogger(Browser.class);

	/** The webDriver driver. */
	private WebDriver driver;

	/** The web driver. */
	private ThreadLocal<WebDriver> webDriver = new ThreadLocal<WebDriver>();

	/** The username. */
	private String username = System.getenv("BROWSERSTACK_USERNAME");
	
	/** The access key. */
	private String accessKey = System.getenv("BROWSERSTACK_ACCESS_KEY");
	
	/** The capabilities. */
	private DesiredCapabilities capabilities = new DesiredCapabilities();
	
	/** The config. */
	private JSONObject config = new JSONObject();
	
	/** The envs. */
	private JSONObject envs = new JSONObject();

	/**
	 * Sets the up.
	 *
	 * @param config_file the config file
	 * @param environment the environment
	 * @param methodName the method name
	 * @param features the features
	 * @throws Exception the exception
	 */
	public void setUp(String config_file, String environment,String methodName, Map<String, Object> features) throws Exception {
		JSONParser parser = new JSONParser();
		JSONObject config = (JSONObject) parser.parse(new FileReader("src/main/resources/conf/" + config_file));
		JSONObject envs = (JSONObject) config.get("environments");

		DesiredCapabilities capabilities = new DesiredCapabilities();

		for(Map.Entry<String, Object> featureEntry : features.entrySet()){
			capabilities.setCapability(featureEntry.getKey(), featureEntry.getValue().toString());
		}
		
		Map<String, String> envCapabilities = (Map<String, String>) envs.get(environment);
		Iterator it = envCapabilities.entrySet().iterator();
		while (it.hasNext()) {
			Map.Entry pair = (Map.Entry) it.next();
			capabilities.setCapability(pair.getKey().toString(), pair.getValue().toString());
		}

		Map<String, String> commonCapabilities = (Map<String, String>) config.get("capabilities");
		it = commonCapabilities.entrySet().iterator();
		while (it.hasNext()) {
			Map.Entry pair = (Map.Entry) it.next();
			if (capabilities.getCapability(pair.getKey().toString()) == null) {
				capabilities.setCapability(pair.getKey().toString(), pair.getValue().toString());
			}
		}

		String username = System.getenv("BROWSERSTACK_USERNAME");
		if (username == null) {
			username = (String) config.get("user");
		}

		String accessKey = System.getenv("BROWSERSTACK_ACCESS_KEY");
		if (accessKey == null) {
			accessKey = (String) config.get("key");
		}
		capabilities.setCapability("name", methodName);
		driver = new RemoteWebDriver(
				new URL("http://" + username + ":" + accessKey + "@" + config.get("server") + "/wd/hub"), capabilities);
	}
	

	/**
	 * Sets the capability.
	 *
	 * @param environment the new capability
	 */
	public void setCapability(String environment) {
		Map<String, String> envCapabilities = (Map<String, String>) envs.get(environment);
		Iterator it = envCapabilities.entrySet().iterator();
		while (it.hasNext()) {
			Map.Entry pair = (Map.Entry) it.next();
			capabilities.setCapability(pair.getKey().toString(), pair.getValue().toString());
		}
	}

	/**
	 * Initiate browser and open the application URL in Web Browser.
	 *
	 * @param browserType            the browser type on which the test will be run
	 * @param applicationURL            the application (AUT) URL
	 */

	public void initiateBrowser(final String browserType, final String applicationURL) {
		if (null != browserType) {
			switch (browserType) {
			case FrameworkConstants.BROWSER_FIREFOX:
				log.info("Initiating firefox...");
				driver = new FirefoxDriver();
				break;

			case FrameworkConstants.BROWSER_INTERNET_EXPLORER:
				log.info("Initiating IE...");
				System.setProperty("webdriver.ie.driver",
						getClass().getClassLoader().getResource("IEDriverServer.exe").getPath());
				driver = new InternetExplorerDriver();
				break;

			case FrameworkConstants.BROWSER_CHROME:
				log.info("Initiating chrome...");
				System.setProperty("webdriver.chrome.driver", "chromedriver.exe");
				System.setProperty("webdriver.chrome.driver",
						getClass().getClassLoader().getResource("chromedriver.exe").getPath());
				DesiredCapabilities capabilities = DesiredCapabilities.chrome();
				capabilities.setCapability(CapabilityType.ForSeleniumServer.ENSURING_CLEAN_SESSION, true);
				capabilities.setCapability("chrome.switches", Arrays.asList("--incognito"));
				driver = new ChromeDriver(capabilities);
				break;
			case FrameworkConstants.BROWSER_SAFARI:
				driver = new SafariDriver();
				break;
			default:
				break;
			}

			if (null != driver) {
				driver.manage().timeouts().implicitlyWait(10, TimeUnit.SECONDS);
				driver.manage().window().maximize();
				driver.manage().deleteAllCookies();
				log.info("Starting application with url: " + applicationURL);
				driver.get(applicationURL);
			}
		}
	}

	/**
	 * Gets the web driver.
	 *
	 * @return the web driver
	 */
	public WebDriver getWebDriver() {
		return driver;
		// return webDriver.get();
	}

	/**
	 * Sets the up driver.
	 *
	 * @throws Exception the exception
	 */
	public void setUpDriver() throws Exception {
		System.out
				.println("server : " + "http://" + username + ":" + accessKey + "@" + config.get("server") + "/wd/hub");
		// this.driver = new RemoteWebDriver(
		// new URL("http://" + username + ":" + accessKey + "@" +
		// config.get("server") + "/wd/hub"), capabilities);
		this.webDriver.set(new RemoteWebDriver(
				new URL("http://" + username + ":" + accessKey + "@" + config.get("server") + "/wd/hub"),
				capabilities));
	}


	/**
	 * Initiate application.
	 *
	 * @param applicationURL the application URL
	 */
	public void initiateApplication(final String applicationURL) {
		if (null != getWebDriver()) {
			getWebDriver().manage().timeouts().implicitlyWait(10, TimeUnit.SECONDS);
			getWebDriver().manage().window().maximize();
			getWebDriver().manage().deleteAllCookies();
			log.info("Starting application with url: " + applicationURL);
			getWebDriver().get(applicationURL);
		}
	}

	/**
	 * Quit browser.
	 * 
	 */

	public void quitBrowser() {
		getWebDriver().quit();
	}

	/**
	 * Tear down.
	 *
	 * @throws Exception the exception
	 */
	public void tearDown() throws Exception {
		getWebDriver().quit();
	}
	
	/**
	 * Close browser.
	 *
	 * @return the driver
	 */
	/*
	 * public void closeBrowser() { if (null != driver) {
	 * log.info("Closing browser."); driver.close(); driver = null; } }
	 */

	/**
	 * Gets the driver.
	 *
	 * @return the driver
	 */
	public WebDriver getDriver() {
		return driver;
	}
}
