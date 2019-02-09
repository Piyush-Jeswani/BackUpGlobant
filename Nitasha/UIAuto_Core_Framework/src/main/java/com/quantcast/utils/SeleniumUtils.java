package com.quantcast.utils;

import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;

// TODO: Auto-generated Javadoc
/**
 * The Class SeleniumUtils.
 */
public class SeleniumUtils {

	/**
	 * Checks if is clickable.
	 *
	 * @param element the element
	 * @param driver the driver
	 * @return true, if is clickable
	 */
	public static boolean isClickable(WebElement element, WebDriver driver) {
		try {
			WebDriverWait wait = new WebDriverWait(driver, 20);
			wait.until(ExpectedConditions.elementToBeClickable(element));
			return true;
		} catch (Exception e) {
			return false;
		}
	}

	/**
	 * Wait for list of web elements to be present.
	 *
	 * @param driver the driver
	 * @param webElements the web elements
	 */
	// To wait for List of WebElements To be Present
	public static void waitForListOfWebElementsToBePresent(WebDriver driver, List<WebElement> webElements) {
		WebDriverWait wait = new WebDriverWait(driver, 20);
		wait.until(new ExpectedCondition<Boolean>() {
			public Boolean apply(WebDriver webDriver) {
				return verifyWebElementListIsPresent(webElements);
			}
		});
	}

	/**
	 * Checks if is visible.
	 *
	 * @param element the element
	 * @param driver the driver
	 * @return true, if is visible
	 */
	public static boolean isVisible(WebElement element, WebDriver driver) {
		try {
			WebDriverWait wait = new WebDriverWait(driver, 20);
			wait.until(ExpectedConditions.visibilityOf(element));
			return true;
		} catch (Exception e) {
			return false;
		}
	}
	
	/**
	  * Checks if is iVisible.
	  *
	  * @param element the element
	  * @param driver the driver
	  * @return true, if is visibles
	  */
	 public static boolean isInVisible(WebElement element, WebDriver driver) {
	  try {
	   WebDriverWait wait = new WebDriverWait(driver, 20);
	   wait.until(ExpectedConditions.invisibilityOf(element));
	   return true;
	  } catch (Exception e) {
	   return false;
	  }
	 }

	/**
	 * Verify web element list is present.
	 *
	 * @param element the element
	 * @return true, if successful
	 */
	public static boolean verifyWebElementListIsPresent(List<WebElement> element) {
		List<WebElement> webElement = element;
		if (webElement.size() > 0) {
			return true;
		} else {
			return false;
		}
	}

	/**
	 * Checks if is loading icon invisible.
	 *
	 * @param element the element
	 * @param driver the driver
	 * @return true, if is loading icon invisible
	 */
	public static boolean isLoadingIconInvisible(List<WebElement> element, WebDriver driver) {
		try {
			WebDriverWait wait = new WebDriverWait(driver, 30);
			wait.until(ExpectedConditions.invisibilityOfAllElements(element));
			return true;
		} catch (Exception e) {
			return false;
		}
	}

	/**
	 * Scroll to view.
	 *
	 * @param driver the driver
	 * @param webElement the web element
	 */
	public static void scrollToView(WebDriver driver, WebElement webElement) {
		JavascriptExecutor je = (JavascriptExecutor) driver;
		je.executeScript("arguments[0].scrollIntoView(true);", webElement);
	}

	/**
	 * Checks if is vertical scroll present.
	 *
	 * @param driver the driver
	 * @return true, if is vertical scroll present
	 */
	public static boolean isVerticalScrollPresent(WebDriver driver) {
		JavascriptExecutor javascript = (JavascriptExecutor) driver;
		return (Boolean) javascript
				.executeScript("return document.documentElement.scrollHeight>document.documentElement.clientHeight;");
	}

	/**
	 * Checks if is cursor focus present.
	 *
	 * @param webElement the web element
	 * @param driver the driver
	 * @return true, if is cursor focus present
	 */
	// To verify cursor focus present on the web element
	public static boolean isCursorFocusPresent(WebElement webElement, WebDriver driver) {
		return webElement.equals(driver.switchTo().activeElement());
	}

	/**
	 * Switch to popup.
	 *
	 * @param driver the driver
	 */
	public static void switchToPopup(WebDriver driver) {
		String mainWinHandle = driver.getWindowHandle();
		System.out.println("size" + driver.getWindowHandles().size());
		for (String winHandle : driver.getWindowHandles()) {
			if (!mainWinHandle.equals(winHandle)) {
				driver.switchTo().window(winHandle);
				break;
			}
		}
	}

	/**
	 * Switch to parent.
	 *
	 * @param driver the driver
	 */
	public static void switchToParent(WebDriver driver) {
		driver.switchTo().defaultContent();
	}

	/**
	 * Go to back page.
	 *
	 * @param driver the driver
	 */
	public static void goToBackPage(WebDriver driver) {
		driver.navigate().back();
	}

	/**
	 * Gets the background color.
	 *
	 * @param webElement the web element
	 * @return the background color
	 */
	// Get Background color of a webelement in hexadecimal
	public static String getBackgroundColor(WebElement webElement) {

		String color = webElement.getCssValue("background-color").toString();
		// Split css value of rgb
		String[] numbers = color.replace("rgba(", "").replace(")", "").split(",");
		int number1 = Integer.parseInt(numbers[0]);
		numbers[1] = numbers[1].trim();
		int number2 = Integer.parseInt(numbers[1]);
		numbers[2] = numbers[2].trim();
		int number3 = Integer.parseInt(numbers[2]);
		System.out.println("Color : ");
		String hex = String.format("#%02x%02x%02x", number1, number2, number3);
		System.out.println(hex);
		return hex;
	}

	/**
	 * Switch to frame.
	 *
	 * @param driver the driver
	 * @param webElement the web element
	 */
	public static void switchToFrame(WebDriver driver, WebElement webElement) {
		driver.switchTo().defaultContent();
		driver.switchTo().frame(webElement);
	}

	/**
	 * Select by visible text.
	 *
	 * @param webElement the web element
	 * @param text the text
	 */
	public static void selectByVisibleText(WebElement webElement, String text) {
		webElement.click();
		Select se = new Select(webElement);
		se.selectByVisibleText(text); 
	}
	
	
	/**
	 * Gets the selected text.
	 *
	 * @param webElement the web element
	 * @param text the text
	 * @return the selected text
	 */
	public static String getSelectedText(WebElement webElement, String text) {
		webElement.click();
		Select se = new Select(webElement);
		return se.getFirstSelectedOption().getText(); 
	}
	
	/**
	 * Click OK in alert.
	 *
	 * @param driver the driver
	 */
	public static void clickOKInAlert(WebDriver driver) {
		driver.switchTo().alert().accept();
	}
	
	/**
	 * Click cancel in alert.
	 *
	 * @param driver the driver
	 */
	public static void clickCancelInAlert(WebDriver driver) {
		driver.switchTo().alert().dismiss();
	}
	
	
}
