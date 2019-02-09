package com.quantcast.utils;

import java.io.File;
import java.sql.Timestamp;
import java.text.NumberFormat;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
import java.util.Locale;
import java.util.Random;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.openqa.selenium.ElementNotVisibleException;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import com.aventstack.extentreports.ExtentTest;
import com.aventstack.extentreports.Status;

// TODO: Auto-generated Javadoc
/**
 * The Class CommonUtils.
 */
public class CommonUtils {

	/** The extent test. */
	private static ExtentTest extentTest;

	/** The old tab handle. */
	private static String oldTabHandle;

	/**
	 * Sort web elements.
	 *
	 * @param webElements
	 *            the web elements
	 * @param sortOrder
	 *            the sort order
	 * @return the list
	 */
	// To Sort the List in the sort order (Ascending/Descending) as specified
	public static List<String> sortWebElements(List<String> webElements, boolean sortOrder) {
		List<String> listElements = webElements;
		if (sortOrder) {
			Collections.sort(listElements, String.CASE_INSENSITIVE_ORDER);
		} else {
			Collections.sort(listElements, Collections.reverseOrder());
		}
		return listElements;
	}

	/**
	 * Sort a list of integers and get a new sorted list. The original list
	 * passed to the method will be in the same order but the method will return
	 * a new sorted list.
	 * 
	 * @param originalList
	 *            Original list of integers to sort
	 * @param sortOrder
	 *            true - Ascending order and false - Descending order.
	 * @return A new sorted list.
	 */
	// To Sort the List in the sort order (Ascending/Descending) as specified
	public static List<Integer> sortIntegerListAndGetSortedList(List<Integer> originalList, boolean sortOrder) {
		List<Integer> sortedList = new ArrayList<>(originalList);
		if (sortOrder) {
			Collections.sort(sortedList);
		} else {
			Collections.sort(sortedList, Collections.reverseOrder());
		}
		return sortedList;
	}

	/**
	 * Sort a list of double and get a new sorted list. The original list passed
	 * to the method will be in the same order but the method will return a new
	 * sorted list.
	 * 
	 * @param originalList
	 *            Original list of double to sort
	 * @param sortOrder
	 *            true - Ascending order and false - Descending order.
	 * @return A new sorted list.
	 */
	// To Sort the List in the sort order (Ascending/Descending) as specified
	public static List<Double> sortDoubleListAndGetSortedList(List<Double> originalList, boolean sortOrder) {
		List<Double> sortedList = new ArrayList<>(originalList);
		if (sortOrder) {
			Collections.sort(sortedList);
		} else {
			Collections.sort(sortedList, Collections.reverseOrder());
		}
		return sortedList;
	}

	// Convert List of WebElements to list in order to perform list related
	/**
	 * Gets the list from web elements.
	 *
	 * @param webElements
	 *            the web elements
	 * @return the list from web elements
	 */
	// operations
	public static List<String> getListFromWebElements(List<WebElement> webElements) {
		String defaultSaveSearch = "Default Saved Search";
		List<String> listElements = new ArrayList<String>();
		for (WebElement element : webElements) {
			if (!element.getText().equals(defaultSaveSearch)) {
				listElements.add(element.getText());
			}
		}
		return listElements;
	}

	/**
	 * *.
	 *
	 * @param webElements
	 *            : hold the list of webelement
	 * @param attributeName
	 *            : hold the attribute name of which list need to be return
	 * @return : return the result set
	 */
	public static List<String> getListFromWebElementsAttribute(List<WebElement> webElements, String attributeName) {
		List<String> listElements = new ArrayList<String>();
		for (WebElement element : webElements) {
			listElements.add(element.getAttribute(attributeName));
		}
		return listElements;
	}

	/**
	 * Iterate web elements list.
	 *
	 * @param webElements
	 *            the web elements
	 */
	// To iterate and view the contents in the List of WebElements
	public static void IterateWebElementsList(List<WebElement> webElements) {
		System.out.println("Iterating Web Elements...");
		IterateList(CommonUtils.getListFromWebElements(webElements));
	}

	/**
	 * Iterate list.
	 *
	 * @param list
	 *            the list
	 */
	// To Iterate and view contents in the list
	public static void IterateList(List<String> list) {
		Iterator itr = list.iterator();
		while (itr.hasNext()) {
			System.out.println(itr.next());
		}
	}

	/**
	 * Compare two list.
	 *
	 * @param List1
	 *            the list 1
	 * @param List2
	 *            the list 2
	 * @return true, if successful
	 */
	// To compare the two lists
	public static boolean CompareTwoList(List<String> List1, List<String> List2) {
		boolean flag = true;
		int max = List1.size() > List2.size() ? List1.size() : List2.size();
		System.out.println("max:" + max);
		for (int i = 0; i < max; i++) {
			if (!List1.get(i).toLowerCase().equals(List2.get(i).toLowerCase())) {
				flag = false;
				break;
			}
		}
		return flag;
	}

	/**
	 * Compare two list of Integer.
	 *
	 * @param List1
	 *            the list 1
	 * @param List2
	 *            the list 2
	 * @return true, if successful
	 */
	// To compare the two lists
	public static boolean compareTwoIntegerList(List<Integer> List1, List<Integer> List2) {
		boolean flag = true;
		int max = List1.size() > List2.size() ? List1.size() : List2.size();
		for (int i = 0; i < max; i++) {
			if (!List1.get(i).equals(List2.get(i))) {
				flag = false;
				break;
			}
		}
		return flag;
	}

	/**
	 * Compare two list of Double.
	 *
	 * @param List1
	 *            the list 1
	 * @param List2
	 *            the list 2
	 * @return true, if successful
	 */
	// To compare the two lists
	public static boolean compareTwoDoubleList(List<Double> List1, List<Double> List2) {
		boolean flag = true;
		int max = List1.size() > List2.size() ? List1.size() : List2.size();
		for (int i = 0; i < max; i++) {
			if (!List1.get(i).equals(List2.get(i))) {
				flag = false;
				break;
			}
		}
		return flag;
	}



	/**
	 * Verify list size.
	 *
	 * @param list
	 *            the list
	 * @return true, if successful
	 */
	// check the list contain any data element.
	public static boolean verifyListSize(List<WebElement> list) {
		System.out.println("in verifylistsize common util " + list.size());
		if (list.size() > 0) {
			return true;
		} else {
			return false;
		}
	}

	/**
	 * Check string contains.
	 *
	 * @param containString
	 *            the contain string
	 * @param actualString
	 *            the actual string
	 * @return true, if successful
	 */
	// return the result of string contain.
	public static boolean checkStringContains(String containString, String actualString) {

		return actualString.toUpperCase().trim().contains(containString.toUpperCase().trim());
	}

	/**
	 * Append date time stamp.
	 *
	 * @param Name
	 *            the name
	 * @return the string
	 */
	// Append Date/TimeStamp in order to have a unique name
	public static String appendDateTimeStamp(String Name) {
		return Name + new SimpleDateFormat("yyyyy-mm-dd hh:mm:ss").format(new Date());
	}

	/**
	 * Checks if is checkbox selected.
	 *
	 * @param checkbox
	 *            the checkbox
	 * @return true, if is checkbox selected
	 */
	// return the selection of the checkbox.
	public static boolean isCheckboxSelected(WebElement checkbox) {
		return checkbox.isSelected();
	}

	/**
	 * Checks if is checkbox list selected.
	 *
	 * @param checkboxList
	 *            the checkbox list
	 * @return true, if is checkbox list selected
	 */
	// return the selection of the checkbox list.
	public static boolean isCheckboxListSelected(List<WebElement> checkboxList) {

		int size = checkboxList.size();
		for (int i = 0; i < size; i++) {
			if (checkboxList.get(i).isSelected()) {
				return false;
			}
		}
		return true;
	}

	/***
	 * Check the send contain string the each element of the list.
	 * 
	 * @param containString
	 *            : hold the string contain which need to check
	 * @param list
	 *            : list of element to be check
	 * @return : return the boolean result
	 */
	public static boolean checkStringContainInCompleteList(String containString, List<WebElement> list) {
		List<String> listString = getListFromWebElements(list);

		for (String eachString : listString) {
			if (!eachString.toUpperCase().trim().contains(containString.toUpperCase().trim())) {
				return false;
			}
		}
		return true;
	}

	/**
	 * Check expected string contain in complete list.
	 *
	 * @param containString
	 *            the contain string
	 * @param list
	 *            the list
	 * @return true, if successful
	 */
	public static boolean checkExpectedStringContainInCompleteList(String containString, List<WebElement> list) {
		List<String> listString = getListFromWebElements(list);
		boolean result = false;
		for (String eachString : listString) {
			if (eachString.replaceAll("\\s+","").toUpperCase().trim().contains(containString.replaceAll("\\s+","").toUpperCase().trim())) {
				result = true;
				break;
			}
		}
		return result;
	}

	/**
	 * Scroll down till element.
	 *
	 * @param element
	 *            the element
	 * @param driver
	 *            the driver
	 */
	public static void scrollDownTillElement(WebElement element, WebDriver driver) {
		JavascriptExecutor je = (JavascriptExecutor) driver;

		je.executeScript("arguments[0].scrollIntoView(true)", element);
	}

	/**
	 * *.
	 *
	 * @param noOfDateFromCurrentDate
	 *            : hold the count to add the next number of date in the list
	 * @return return the new created date list
	 */
	public static List<String> getListOfDate(int noOfDateFromCurrentDate) {
		List<String> dateList = new ArrayList<>();
		SimpleDateFormat dateFormat = new SimpleDateFormat("MM/dd/yyyy");
		Date date = new Date();
		Calendar cal = Calendar.getInstance();
		try {
			cal.setTime(dateFormat.parse(dateFormat.format(date)));
		} catch (ParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		dateList.add(dateFormat.format(date));
		for (int i = 1; i <= noOfDateFromCurrentDate; i++) {
			cal.add(Calendar.DATE, 1); // number of days to add
			dateList.add(dateFormat.format(cal.getTime())); // new date is added
															// to list
		}
		return dateList;
	}

	/**
	 * Compare two list for string contains.
	 *
	 * @param containList
	 *            the contain list
	 * @param compareList
	 *            the compare list
	 * @return true, if successful
	 */
	public static boolean compareTwoListForStringContains(List<String> containList, List<String> compareList) {
		boolean compareFlag;
		for (String containString : containList) {
			compareFlag = false;
			for (String compareString : compareList) {
				if (compareString.toUpperCase().trim().contains(containString.toUpperCase().trim())) {
					compareFlag = true;
					break;
				}
			}
			if (!compareFlag) {
				extentTest.log(Status.ERROR, "Date : " + containString + " is not present in the expected list.");
				return false;
			}
		}
		return true;
	}

	/**
	 * *.
	 *
	 * @param element
	 *            : hold the element which existance need to check
	 * @param driver
	 *            : instance of current running browser
	 * @return : return the status.
	 */
	public static boolean checkElementExist(WebElement element, WebDriver driver) {
		try {
			element.isDisplayed();
		} catch (NoSuchElementException e) {
			return false;
		} catch (ElementNotVisibleException e) {
			return false;
		}
		return true;
	}

	/**
	 * *.
	 *
	 * @param Name
	 *            the name
	 * @return : return the boolean result of isDisplayed of element.
	 */
	/*
	 * public static boolean checkArrowDownIconStatus(WebElement element,
	 * WebDriver driver){ try{ element.isDisplayed();
	 * }catch(NoSuchElementException e){ return false; } return true; }
	 * 
	 *//***
		 * 
		 * @param element
		 *            : hold the arrow Up icon webelement
		 * @param driver
		 *            : hold the current broweser driver
		 * @return : return the boolean result of isDisplayed of element.
		 *//*
		 * public static boolean checkArrowUpIconStatus(WebElement element,
		 * WebDriver driver){ try{ element.isDisplayed();
		 * }catch(NoSuchElementException e){ return false; } return true; }
		 */

	// `s into AlphaNumeric Characters
	public static String formatIntoAlphanumeric(String Name) {
		return Name.replaceAll("[^A-Za-z0-9]", "");
	}

	/**
	 * Format into characters only.
	 *
	 * @param Name
	 *            the name
	 * @return the string
	 */
	// Formats into Characters only
	public static String formatIntoCharactersOnly(String Name) {
		return Name.replaceAll("[^A-Za-z]", "");
	}

	/**
	 * Format into characters only with space.
	 *
	 * @param Name
	 *            the name
	 * @return the string
	 */
	// Formats into Characters only with space
	public static String formatIntoCharactersOnlyWithSpace(String Name) {
		return Name.replaceAll("[^A-Za-z ]", "");
	}

	/**
	 * Format into numbers only.
	 *
	 * @param Name
	 *            the name
	 * @return the string
	 */
	// Formats into Numbers only
	public static String formatIntoNumbersOnly(String Name) {
		return Name.replaceAll("[^0-9]", "");
	}

	/**
	 * Switch to new tab.
	 *
	 * @param driver
	 *            the driver
	 */
	public static void switchToNewTab(WebDriver driver) {
		try {
			oldTabHandle = driver.getWindowHandle();
			ArrayList<String> newTab = new ArrayList<String>(driver.getWindowHandles());
			newTab.remove(oldTabHandle);

			// change focus to new tab
			driver.switchTo().window(newTab.get(0));
		} catch (Exception ex) {

		}
	}

	/**
	 * Switch to home tab.
	 *
	 * @param driver
	 *            the driver
	 */
	public static void switchToHomeTab(WebDriver driver) {
		driver.close();
		// change focus back to old tab
		driver.switchTo().window(oldTabHandle);
	}

	/**
	 * Gets the time stamp.
	 *
	 * @return the time stamp
	 */
	// Return the timestamp in String format.
	public static String getTimeStamp() {
		return new SimpleDateFormat("yyyyMMddHHmmss").format(new Timestamp(System.currentTimeMillis()));
	}

	/**
	 * Checks if is font bold.
	 *
	 * @param driver
	 *            the driver
	 * @param webElement
	 *            the web element
	 * @return true, if is font bold
	 */
	public static boolean isFontBold(WebDriver driver, WebElement webElement) {
		JavascriptExecutor js = (JavascriptExecutor) driver;

		String fontWeight = (String) js
				.executeScript("return getComputedStyle(arguments[0]).getPropertyValue('font-Weight');", webElement);
		if (fontWeight.trim().equals("bold")) {
			System.out.println("Is Bold");
			return true;
		} else {
			System.out.println("Not Bold - " + fontWeight);
			return false;
		}
	}

	/**
	 * Refresh page.
	 *
	 * @param driver
	 *            the driver
	 */
	public static void refreshPage(WebDriver driver) {
		driver.navigate().refresh();
	}

	/**
	 * Gets the USA date format.
	 *
	 * @param date
	 *            the date
	 * @return the USA date format
	 */
	public static String getUSADateFormat(Date date) {
		SimpleDateFormat sdf = new SimpleDateFormat(ConfigurationReader.getInstance().getProperty("Date_Format"));
		System.out.println("Today is " + sdf.format(date));
		return sdf.format(date);
	}

	/**
	 * Append random number in string.
	 *
	 * @param name
	 *            the name
	 * @return the string
	 */
	public static String appendRandomNumberInString(String name) {
		return name + String.valueOf(new Date().getTime());
	}

	/**
	 * Retrieve regex match string.
	 *
	 * @param regex
	 *            the regex
	 * @param Sentence
	 *            the sentence
	 * @return the string
	 */
	public static String retrieveRegexMatchString(String regex, String Sentence) {
		Pattern p = Pattern.compile(regex);
		Matcher m = p.matcher(Sentence);
		String s = "";
		if (m.find()) {
			s = m.group(1);
		}
		return s;
	}

	/**
	 * Gets the string from JSON.
	 *
	 * @param json
	 *            the json
	 * @param jsonAttr
	 *            the json attr
	 * @return the string from JSON
	 * @throws ParseException
	 *             the parse exception
	 */
	public static String getStringFromJSON(String json, String jsonAttr) throws org.json.simple.parser.ParseException {
		JSONParser parser = new JSONParser();
		JSONObject jsonObject = (JSONObject) parser.parse(json);
		System.out.println("jsonobj : " + jsonObject);
		String name = (String) jsonObject.get(jsonAttr).toString();
		System.out.println("jsonAttr : " + name);
		return name;
	}

	/*
	 * public static void switchToNewTab1(WebDriver driver) { ArrayList<String>
	 * tabs = new ArrayList<String>(driver.getWindowHandles());
	 * driver.switchTo().window(tabs.get(1)); System.out.println("new tab :  " +
	 * tabs.get(1)); }
	 * 
	 * public static void switchToDefault(WebDriver driver) { ArrayList<String>
	 * tabs = new ArrayList<String>(driver.getWindowHandles()); driver.close();
	 * driver.switchTo().window(tabs.get(0)); }
	 */

	/**
	 * Checks if is word pattern in braces.
	 *
	 * @param name
	 *            the name
	 * @return the boolean
	 */
	public static Boolean isWordPatterninBraces(String name) {
		boolean isMatch = false;
		Pattern logEntry = Pattern.compile("\\((.*?)\\)");
		Matcher matchPattern = logEntry.matcher(name);

		while (matchPattern.find()) {
			System.out.println("match : " + matchPattern.group(1));
			isMatch = true;
		}
		return isMatch;
	}

	/**
	 * Checks if is file downloaded.
	 *
	 * @param downloadPath
	 *            the download path
	 * @param fileName
	 *            the file name
	 * @param retryAttempts
	 *            the retry attempts
	 * @param retryDelayInMilliSecs
	 *            the retry delay in milli secs
	 * @return true, if is file downloaded
	 * @throws InterruptedException
	 *             the interrupted exception
	 */
	public static boolean isFileDownloaded(String downloadPath, String fileName, int retryAttempts,
			int retryDelayInMilliSecs) throws InterruptedException {
		for (int retryCntr = 0; retryCntr < retryAttempts; retryCntr++) {
			File dir = new File(downloadPath);
			File[] dirContents = dir.listFiles();

			for (int i = 0; i < dirContents.length; i++) {
				if (dirContents[i].getName().equals(fileName))
					return true;
			}
			Thread.sleep(retryDelayInMilliSecs);
		}
		return false;
	}

	/**
	 * Checks if is file downloaded.
	 *
	 * @param downloadPath the download path
	 * @param lastModifiedFileTime the last modified file time
	 * @param retryAttempts the retry attempts
	 * @param retryDelayInMilliSecs the retry delay in milli secs
	 * @return true, if is file downloaded
	 * @throws InterruptedException the interrupted exception
	 */
	public static boolean isFileDownloaded(String downloadPath, long lastModifiedFileTime, int retryAttempts,
			int retryDelayInMilliSecs) throws InterruptedException {
		for (int retryCntr = 0; retryCntr < retryAttempts; retryCntr++) {
			File lastestFile = getLatestDownloadedFile(downloadPath);
			if ((lastestFile.lastModified() > lastModifiedFileTime) && !(lastestFile.getName().contains("Unconfirmed"))
					&& !(lastestFile.getName().contains("crdownload")) && !(lastestFile.getName().contains(".tmp"))) {
				return true;
			}
			Thread.sleep(retryDelayInMilliSecs);
		}
		return false;
	}

	/**
	 * Gets the latest downloaded file.
	 *
	 * @param dirPath the dir path
	 * @return the latest downloaded file
	 */
	public static File getLatestDownloadedFile(String dirPath) {
		File dir = new File(dirPath);
		File[] files = dir.listFiles();
		if (files == null || files.length == 0) {
			return null;
		}

		File lastModifiedFile = files[0];
		for (int i = 1; i < files.length; i++) {
			if (lastModifiedFile.lastModified() < files[i].lastModified()) {
				lastModifiedFile = files[i];
			}
		}

		return lastModifiedFile;
	}

	/**
	 * Delete file.
	 *
	 * @param dirPath the dir path
	 * @param fileNameToDelete the file name to delete
	 * @return true, if successful
	 */
	public static boolean deleteFile(String dirPath, String fileNameToDelete) {
		File dir = new File(dirPath);
		File[] files = dir.listFiles();
		if (files == null || files.length == 0) {
			return false;
		}

		File FilesUnderDir = files[0];
		for (int i = 1; i < files.length; i++) {
			if (FilesUnderDir.getName().equals(fileNameToDelete)) {
				FilesUnderDir.delete();
			}
		}
		return true;
	}

	/**
	 * Gets the current timestamp in specific format.
	 *
	 * @param dateFormat
	 *            the date format
	 * @return the current timestamp in specific format
	 */
	public static String getCurrentTimestampInSpecificFormat(String dateFormat) {
		SimpleDateFormat sdf = new SimpleDateFormat(dateFormat);
		return sdf.format(new Date());
	}

	/**
	 * Gets the system date.
	 *
	 * @return the system date
	 */
	// Retun the current system date
	public static String getSystemDate() {
		DateFormat dateFormat = new SimpleDateFormat("MM/dd/yyyy");
		Date date = new Date();
		return dateFormat.format(date);
	}

	// Sort the Date which is given in the String format and return the sorting
	/**
	 * Sort date list in reverse.
	 *
	 * @param elementList the element list
	 * @return the list
	 */
	// list of date in string.
	public static List<String> sortDateListInReverse(List<String> elementList) {

		Collections.sort(elementList, new Comparator<String>() {
			DateFormat f = new SimpleDateFormat("M/dd/yyyy hh:mm:ss a");

			@Override
			public int compare(String o1, String o2) {
				try {
					return f.parse(o1).compareTo(f.parse(o2));
				} catch (ParseException e) {
					throw new IllegalArgumentException(e);
				}
			}
		});
		Collections.reverse(elementList);
		return elementList;
	}

	/**
	 * Click on element using javascript.
	 *
	 * @param webElement the web element
	 * @param driver the driver
	 */
	public static void clickOnElementUsingJavascript(WebElement webElement, WebDriver driver) {
		JavascriptExecutor executor = (JavascriptExecutor) driver;
		executor.executeScript("arguments[0].click();", webElement);
	}

	/**
	 * Generate string.
	 *
	 * @param sampleString the sample string
	 * @param strLength the str length
	 * @return the string
	 */
	public static String generateString(final String sampleString, final int strLength) {
		final StringBuilder testString = new StringBuilder("");
		while (testString.length() < strLength) {
			testString.append(sampleString);
		}
		return testString.substring(0, strLength);
	}
	
	/**
	 * Gets the last index of character.
	 *
	 * @param sampleString the sample string
	 * @param stringToBeVerified the string to be verified
	 * @return the last index of character
	 */
	public static int getLastIndexOfCharacter(final String sampleString, final String stringToBeVerified) {
		int charIndex = 0;
		if(sampleString.contains(stringToBeVerified)){
			charIndex = sampleString.lastIndexOf(stringToBeVerified);
		}
		return charIndex;
	}
}
