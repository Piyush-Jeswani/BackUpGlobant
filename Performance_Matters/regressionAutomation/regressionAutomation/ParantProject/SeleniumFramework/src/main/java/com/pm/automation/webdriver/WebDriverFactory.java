package com.pm.automation.webdriver;

import com.pm.automation.webdriver.Browser;
import com.pm.automation.logging.Logging;

import org.openqa.selenium.Proxy;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.ie.InternetExplorerDriver;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;
import com.pm.automation.config.Config;
import org.openqa.selenium.remote.RemoteWebDriver;

import java.io.File;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.HashMap;

import static java.util.concurrent.TimeUnit.SECONDS;
import static org.openqa.selenium.remote.CapabilityType.PROXY;

/**
 * @author Sunil Dalvi
 */
public class WebDriverFactory implements Logging {

	public WebDriver createFor(Browser browser) throws MalformedURLException {
		DesiredCapabilities capabilities = buildCapabilities(browser);
		WebDriver driver = null;

		if (driver == null) {
			switch (browser) {
			case FIREFOX:
				getLogger().info("Launching Firefox Browser");
				driver = new FirefoxDriver(capabilities);
				break;

			case CHROME:
				getLogger().info("Launching Chrome Browser");				
				String downloadFilepath = System.getProperty("user.dir");
				File file = new File(downloadFilepath+"\\CSVDownloads");
		        if (!file.exists()) {
		            file.mkdir();
		        }
				HashMap<String, Object> chromePrefs = new HashMap<String, Object>();
				chromePrefs.put("profile.default_content_settings.popups", 0);
				chromePrefs.put("download.default_directory", downloadFilepath+"\\CSVDownloads\\");
				chromePrefs.put("download.extensions_to_open", "text/csv");
				ChromeOptions options = new ChromeOptions();
				options.setExperimentalOption("prefs", chromePrefs);
				capabilities.setCapability(CapabilityType.ACCEPT_SSL_CERTS, true);
				capabilities.setCapability(ChromeOptions.CAPABILITY, options);
				driver = new ChromeDriver(capabilities);
				break;
			case IE:
				getLogger().info("Launching IE Browser");
				driver = new InternetExplorerDriver(capabilities);
				break;
			case CHROME_GRID:
				getLogger().info("Launching Chrome inside Selenium Grid");
				driver = new RemoteWebDriver(new URL(Config.getSeleniumGridUrl()),capabilities);
				break;
			default:
				getLogger().error("Invalid browser string. Pass the correct browser string");
				break;
			}

			setTimeOuts(browser, driver);
		}
		driver.manage().window().maximize();
		return driver;

	}

	private DesiredCapabilities buildCapabilities(Browser browser) {
		DesiredCapabilities capabilities = new DesiredCapabilities();
		capabilities.merge(browser.getCapabilities());

		return setProxySettings(capabilities);
	}

	private void setTimeOuts(Browser browser, WebDriver driver) {
		long implicitWait = Long.parseLong(Config.getImplicitWaitTime());
		long pageLoadTimeOut = Long.parseLong(Config.getPageLoadTimeOut());
		long scriptTimeOut = Long.parseLong(Config.getScriptTimeOut());

		driver.manage().timeouts().implicitlyWait(implicitWait, SECONDS);
		driver.manage().timeouts().pageLoadTimeout(pageLoadTimeOut, SECONDS);
		driver.manage().timeouts().setScriptTimeout(scriptTimeOut, SECONDS);

	}

	private DesiredCapabilities setProxySettings(DesiredCapabilities capabilities) {
		String proxyCfg = String.format("%s:%s", Config.getProxy(), Config.getPort());
		/*capabilities.setCapability(PROXY,
				new Proxy().setHttpProxy(proxyCfg).setFtpProxy(proxyCfg).setSslProxy(proxyCfg));*/
		return capabilities;
	}
}
