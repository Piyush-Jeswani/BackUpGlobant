package com.pm.pages.common;

import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Set;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.slf4j.Logger;

import com.pm.automation.logging.Logging;
import com.pm.automation.webdriver.TestContext;
import com.pm.automation.webdriver.TestContext.Context;

public abstract class BasePage implements Logging {
	protected Logger log = getLogger();
	protected WebDriver driver = null;
	protected WebDriverWait wait = null;
	protected JavascriptExecutor jsExecutor = null;
	protected Actions actions = null;

	public BasePage() {
		Context context = TestContext.get();
		driver = context.getDriver();
		wait = context.getWebDriverWait();
		jsExecutor = context.getJavascriptExecutor();
		actions = context.getActions();
		PageFactory.initElements(driver, this);

	}

	public void clickElementByAction(WebElement element) {
		actions.moveToElement(element).click().build().perform();
	}

	public void clickElementByJSExecutor(WebElement element) {

		jsExecutor.executeScript("arguments[0].click();", element);
	}

	/**
	 * Waits for Javascript and jQuery to finish loading.
	 *
	 * @return a result true or false
	 */
	public boolean waitForJSandJQueryToLoad() {

		ExpectedCondition<Boolean> jQueryLoad = (driver) -> {
			try {
				return ((Long) ((JavascriptExecutor) driver).executeScript("return jQuery.active") == 0);
			} catch (Exception e) {
				return true;
			}
		};

		ExpectedCondition<Boolean> jsLoad = (driver) -> {
			return ((JavascriptExecutor) driver).executeScript("return document.readyState").toString()
					.equals("complete");
		};

		return wait.until(jQueryLoad) && wait.until(jsLoad);
	}

	public boolean elementPresent(By by) {
		try {
			wait.until(ExpectedConditions.presenceOfElementLocated(by));
			return true;
		} catch (TimeoutException e) {
			return false;
		}
	}
	
	public void closeNewlyOpenedWindowIfAny(){
		String winHandleBefore = driver.getWindowHandle();
		Set<String> windowHandles= driver.getWindowHandles();
		
		for(String winHandle :windowHandles){
			if(!winHandle.equals(winHandleBefore)){
				driver.switchTo().window(winHandle).close();
			}
		}
		driver.switchTo().window(winHandleBefore);
	}
	
	//For selecting date from calendar
	public void selectDate(String sectionDate) throws ParseException {
		
		DateFormat format = new SimpleDateFormat("d MMM yyyy");
		DateFormat formatDate = new SimpleDateFormat("d");
        DateFormat monthFormat = new SimpleDateFormat("MMM yyyy");
        Date d1 = format.parse(sectionDate);
        
        String presentDate = formatDate.format(d1);
        String month = monthFormat.format(d1);        
        WebElement monthName = driver.findElement(By.xpath("//div[@id='dateSelector']//tr[@class='calendarMonthYearTable']//td[3]"));
        
        while(!monthName.getText().contains(month)){
        	clickElementByJSExecutor(driver.findElement(By.xpath("//div[@id='dateSelector']//tr[1]//td[4]/img")));
        	monthName = driver.findElement(By.xpath("//div[@id='dateSelector']//tr[@class='calendarMonthYearTable']//td[3]"));
        }
        List<WebElement> dateList = driver.findElements(By.xpath("//div[@id='dateSelector']//table[@class='calendarBorderTable']//tr/td[contains(@class,'calendar')]"));
    	for (WebElement webElement : dateList) {
    		
    		if(presentDate.equals(webElement.getText())){
    			clickElementByJSExecutor(webElement);
					break;
				}
		}
	}
	
	public void clickOnLink(String linkText){
		clickElementByJSExecutor(driver.findElement(By.linkText(linkText)));
		waitForJSandJQueryToLoad();
	}
}
