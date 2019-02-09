package com.pm.automation.webdriver;

import com.pm.automation.logging.*;
import com.pm.automation.config.Config;

import io.github.bonigarcia.wdm.*;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.HasCapabilities;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.remote.DesiredCapabilities;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import static io.github.bonigarcia.wdm.Architecture.x32;
import static io.github.bonigarcia.wdm.Architecture.x64;
import static java.lang.System.getProperty;

/**
 * Enumeration that defines the browsers supported by this framework
 *
 * @author Sunil Dalvi
 */

public enum Browser implements Logging, HasCapabilities {

	FIREFOX {
		@Override
		public Capabilities getCapabilities() {
			initialize(this);
			DesiredCapabilities capabilities = DesiredCapabilities.firefox();
			capabilities.setCapability("marionette", true);
			return capabilities;
		}
	},
	CHROME {
		@Override
		public Capabilities getCapabilities() {
			initialize(this);
			DesiredCapabilities capabilities = DesiredCapabilities.chrome();
			ChromeOptions options = new ChromeOptions();
			options.addArguments("disable-infobars");
			capabilities.setCapability(ChromeOptions.CAPABILITY, options);
			return capabilities;
		}
	},
	IE {
		@Override
		public Capabilities getCapabilities() {
			initialize(this);
			return DesiredCapabilities.internetExplorer();
		}
	},
	CHROME_GRID {
		@Override
		public Capabilities getCapabilities(){
			DesiredCapabilities capabilities = DesiredCapabilities.chrome();
			ChromeOptions options = new ChromeOptions();
			options.addArguments("disable-infobars");
			capabilities.setCapability(ChromeOptions.CAPABILITY, options);
			capabilities.setAcceptInsecureCerts(true);
			capabilities.setJavascriptEnabled(true);
			return capabilities;
		}
	};

	private static final String ARCH = getProperty("os.arch", "");
	private static final Architecture architecture = ARCH.contains("64") ? x64 : x32;
	private static final Map<Browser, Boolean> alreadyInitialized = new ConcurrentHashMap<>();
	private static final String proxy = String.format("%s:%s", Config.getProxy(), Config.getPort());

	private synchronized static void initialize(Browser browser) {
		if (alreadyInitialized.computeIfAbsent(browser, b -> false)) { // ||
																		// CONFIGURATION.WebDriver().isSeleniumGrid()
			return;
		}
		switch (browser) {
		case FIREFOX:
			FirefoxDriverManager.getInstance().setup();// (architecture,
														// LATEST);//"48.0.1"
			break;
		case CHROME:
			ChromeDriverManager.getInstance().setup();
			break;
		case IE:
			InternetExplorerDriverManager.getInstance().setup();
			break;
		}
		alreadyInitialized.put(browser, true);
	}
}
