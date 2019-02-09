package com.pm.automation.webdriver;

import com.pm.automation.webdriver.Browser;
import com.pm.automation.logging.*;

import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.net.MalformedURLException;
import java.util.function.Supplier;

import static com.pm.automation.webdriver.Lazy.lazily;
import static java.util.Optional.ofNullable;

/**
 * @author Sunil Dalvi
 */
public class TestContext {

	private static final ThreadLocal<Context> CONTEXT_PER_THREAD = new ThreadLocal<>();

	public static Context get() {
		return CONTEXT_PER_THREAD.get();
	}

	public static void set(Context context) {
		CONTEXT_PER_THREAD.set(context);
	}

	public static void remove() {
		ofNullable(get()).ifPresent(context -> ofNullable(context.getDriver()).ifPresent(WebDriver::quit));
		CONTEXT_PER_THREAD.remove();
	}

	public static Context with(Browser browser) {
		return new Context(browser);
	}

	public static class Context implements Logging {

        private static final WebDriverFactory WEB_DRIVER_FACTORY = new WebDriverFactory();

        private final Browser browser;
        private final Supplier<WebDriver> driver;
        private final WebDriverWait wait;
        private final JavascriptExecutor JsExecutor;
        private final Actions actions;

        private Context(Browser browser ) {
            this.browser = browser;
            this.driver = lazily(() -> {
                try {
                    return WEB_DRIVER_FACTORY.createFor(browser);
                } catch (MalformedURLException e) {
                    getLogger().error("Could not create WebDriver instance!", e);
                    return null;
                }
            });
            
            this.wait = new WebDriverWait(driver.get(), 40);
            this.JsExecutor = (JavascriptExecutor)driver.get();
            this.actions = new Actions(driver.get());
            
        }

        public Browser getBrowser() {
            return browser;
        }        
        
        public WebDriver getDriver() {
            return driver.get();
        }
        
        public WebDriverWait getWebDriverWait() {
            return wait;
        }
        
        public JavascriptExecutor getJavascriptExecutor() {
            return JsExecutor;
        }
        
        public Actions getActions() {
            return actions;
        }
    }

}
