package com.pm.pages.administration;

import java.text.ParseException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.ui.Select;

import com.pm.pages.common.BasePage;

public class StaffGroupPage extends BasePage{

	@FindBy(linkText = "Create Staff Group")
	private WebElement createStaffGroup;
	
	@FindBy(id = "userGroupName")
	private WebElement userGroupName;
	
	@FindBy(id = "userGroupDescription")
	private WebElement userGroupDescription;
	
	public StaffGroupPage() {
		super();
	}
	
	public void displayAllResults() {
		Select pageSize = new Select(driver.findElement(By.name("pageSize")));
		pageSize.selectByVisibleText("100");
		waitForJSandJQueryToLoad();
	}
	
	public List<LocalDate> getDateList() {
		List<WebElement> staffGroupList = driver.findElements(By.xpath("//table[@class='tnl-table tnlf-table table-striped']/tbody//td[6]"));
		List<LocalDate> dateList = new ArrayList<LocalDate>();
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM/dd/yyyy");
		
		for (WebElement webElement : staffGroupList) {
			String datetxt = webElement.getText();
			if(!datetxt.equals("")){
				LocalDate formattedDate = LocalDate.parse(datetxt, formatter);
				dateList.add(formattedDate);
			}
		}
		waitForJSandJQueryToLoad();
		return dateList;
	}
	public void clickLastUpdated() {
		WebElement lastUpdatedColumn = driver.findElement(By.xpath("//th[contains(text(),'Last Updated')]"));
		clickElementByJSExecutor(lastUpdatedColumn);
		waitForJSandJQueryToLoad();
	}
	
	public List<LocalDate> getDateListSorted() throws ParseException {
		List<WebElement> staffGroupList = driver.findElements(By.xpath("//table[@class='tnl-table tnlf-table table-striped']/tbody//td[6]"));
		List<LocalDate> dateList = new ArrayList<LocalDate>();
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM/dd/yyyy");
		
		for (WebElement webElement : staffGroupList) {
			String datetxt = webElement.getText();
			if(!datetxt.equals("")){
				LocalDate formattedDate = LocalDate.parse(datetxt, formatter);
				dateList.add(formattedDate);
			}
		}
		dateList.sort(new SortOrder());
		waitForJSandJQueryToLoad();
		return dateList;
	}
	
	public boolean compareDateLists(List<LocalDate> list1,List<LocalDate> list2) {
		boolean flag = list1.equals(list2);
		return flag;
	}
	
	public void clickCreateStaffGroup() {
		clickElementByJSExecutor(createStaffGroup);
		waitForJSandJQueryToLoad();
	}
	public void createEditStaffGroup(String groupName,String groupDescription) throws InterruptedException {
		userGroupName.clear();
		userGroupName.sendKeys(groupName);
		waitForJSandJQueryToLoad();
		Thread.sleep(1000);
		
		userGroupDescription.clear();
		userGroupDescription.sendKeys(groupDescription);
		waitForJSandJQueryToLoad();
		Thread.sleep(1000);
		
		WebElement staffGroup = driver.findElement(By.xpath("//div[@class='pm-breadcrumb']//li/a[text()='Staff Groups']"));
		clickElementByJSExecutor(staffGroup);
		waitForJSandJQueryToLoad();
	}
	
	public void clickCoursTargetCheck() throws InterruptedException {
		clickElementByJSExecutor(driver.findElement(By.id("courseTarget")));
		driver.findElement(By.id("courseTarget")).isEnabled();
		waitForJSandJQueryToLoad();
		Thread.sleep(1000);
	}
	
	public void clickEditIcon(String groupName) {
		String groupEdit = String.format("//span[text()='%s']/ancestor::td/preceding-sibling::td//span[@class='tnl-fn-grp-edit']/a", groupName);
		WebElement groupEditButton = driver.findElement(By.xpath(groupEdit));
		clickElementByJSExecutor(groupEditButton);
		waitForJSandJQueryToLoad();
	}
	
	public String clickDeleteIcon(String groupName,String deleteText) {
		String groupDelete = String.format("//span[text()='%s']/ancestor::td/preceding-sibling::td//span[@class='pmf-fn-grp-delete']/a", groupName);
		WebElement groupDeleteButton = driver.findElement(By.xpath(groupDelete));
		clickElementByJSExecutor(groupDeleteButton);
		waitForJSandJQueryToLoad();
		
		String deletePopupText = driver.findElement(By.xpath("//div[@class='modal-body']/h3")).getText();
		String deleteButton = String.format("//button[text()='%s']", deleteText);
		WebElement deletebutton = driver.findElement(By.xpath(deleteButton));
		clickElementByJSExecutor(deletebutton);
		waitForJSandJQueryToLoad();
		return deletePopupText;
	}
		
	public boolean isStaffGroupPresent(String groupName) {
		return elementPresent(By.linkText(groupName));
	}
	
	public void clickMakeMeOwner() {
		WebElement deletebutton = driver.findElement(By.xpath("//button[text()='Make me Owner']"));
		clickElementByJSExecutor(deletebutton);
		waitForJSandJQueryToLoad();
	}
	
	public String getOwnerName() {
		WebElement ownerName = driver.findElement(By.xpath("//form[@class='pmf-form-autosave']//div[3]"));
		return ownerName.getText();
	}
	
	public List<String> getStaffGroupsList() {
		List<WebElement> groupNameList = driver.findElements(By.xpath("//table[@class='tnl-table tnlf-table table-striped']//td/a[@class='tnl-text-link']/span"));
		List<String> groupNamesListString = new ArrayList<String>();
		
		for (WebElement string : groupNameList) {
			groupNamesListString.add(string.getText());
		}
		Collections.sort(groupNamesListString);
		return groupNamesListString;
	}
	
	public boolean compareGroupNameList(List<String> list1,List<String> list2) {
		boolean flag = list1.equals(list2);
		return flag;
	}
}

class SortOrder implements Comparator<LocalDate> {
	@Override
	public int compare(LocalDate a, LocalDate b) {
		
		return a.compareTo(b);
	}
}
