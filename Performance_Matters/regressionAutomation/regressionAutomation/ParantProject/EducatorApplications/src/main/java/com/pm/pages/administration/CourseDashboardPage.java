package com.pm.pages.administration;

import java.util.ArrayList;
import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindAll;
import org.openqa.selenium.support.FindBy;

import com.pm.pages.common.BasePage;

public class CourseDashboardPage extends BasePage{

	public CourseDashboardPage() {
		super();
	}
	
	@FindBy(name = "course_course_number")
	private WebElement courseNumberElement;
	
	@FindBy(name = "course_course_title")
	private WebElement courseTitleElement;
	
	@FindBy(name = "sec_section_number")
	private WebElement sectionNumberElement;
	
	@FindBy(name = "sec_section_title")
	private WebElement sectionTitleElement;
	
	@FindBy(xpath = "//button[text()='Save']")
	private WebElement saveButton;
	
	@FindBy(xpath = "//button[text()='Search']")
	private WebElement searchButton;
	
	@FindBy(id = "saveGroupBtn")
	private WebElement saveGroupBtn;
	
	@FindBy(name = "name")
	private WebElement name;
	
	@FindBy(name = "description")
	private WebElement description;
	
	@FindBy(id = "editGroupBtn")
	private WebElement editGroupButton;
	
	@FindBy(id = "addSectionsBtn")
	private WebElement addSectionButton;
	
	@FindAll({@FindBy(name = "sec_section_id")})
	private List<WebElement> sectionsList;
	
	public String verifyPageHeader() {
		WebElement pageHeader = driver.findElement(By.tagName("h1"));
		return pageHeader.getText();
	}
	
	public void clickUserName(String userName) {
		String userNameLink = String.format("//li[contains(text(),'%s')]/input", userName);
		WebElement userNameElement = driver.findElement(By.xpath(userNameLink));
		clickElementByJSExecutor(userNameElement);
		waitForJSandJQueryToLoad();
	}
	
	public void searchGroup(String sectionNumber,String sectionTitle,String courseNumber,String courseTitle) {
		sectionNumberElement.sendKeys(sectionNumber);
		waitForJSandJQueryToLoad();
		
		sectionTitleElement.sendKeys(sectionTitle);
		waitForJSandJQueryToLoad();
		
		courseNumberElement.sendKeys(courseNumber);
		waitForJSandJQueryToLoad();
		
		courseTitleElement.sendKeys(courseTitle);
		waitForJSandJQueryToLoad();
		
		clickElementByJSExecutor(searchButton);
		waitForJSandJQueryToLoad();
	}
	
	public void clickSaveGroupButton() {
		clickElementByJSExecutor(saveGroupBtn);
		waitForJSandJQueryToLoad();
	}
	
	public void createGroup(String groupName,String groupDescription) {
		name.sendKeys(groupName);
		waitForJSandJQueryToLoad();
		
		description.sendKeys(groupDescription);
		waitForJSandJQueryToLoad();
		
		clickElementByJSExecutor(saveButton);
		waitForJSandJQueryToLoad();
		
		clickOnLink("Done");
	}
	
	public void clickEditGroupButton() {
		clickElementByJSExecutor(editGroupButton);
		waitForJSandJQueryToLoad();
	}
	
	public void clickAddSectionsButton() {
		clickElementByJSExecutor(addSectionButton);
		waitForJSandJQueryToLoad();
	}
	
	public void clickGroup(String groupName) {
		String groupLink = String.format("//li[text()='%s']",groupName);
		WebElement groupLinkElement = driver.findElement(By.xpath(groupLink));
		clickElementByJSExecutor(groupLinkElement);
		waitForJSandJQueryToLoad();
	}
	
	public void switchToFrame(){
		driver.switchTo().frame(0);
	}
	

	public List<String> addSection(String sectionNumber,String sectionName) {
		sectionNumberElement.sendKeys(sectionNumber);
		waitForJSandJQueryToLoad();
		
		sectionTitleElement.sendKeys(sectionName);
		waitForJSandJQueryToLoad();
		
		clickOnLink("Search");
		
		List<String> sectionID = new ArrayList<String>();
		String sections = "//table[@class='tnl-table']//td[3]";
		List<WebElement> sectionIds = driver.findElements(By.xpath(sections));
		
		for (WebElement webElement : sectionIds) {
			sectionID.add(webElement.getText());
		}
		
		for (WebElement webElement : sectionsList) {
			clickElementByJSExecutor(webElement);
			waitForJSandJQueryToLoad();
		}
		
		clickOnLink("Select");
		
		clickOnLink("Finish");
		driver.switchTo().defaultContent();
		
		
		clickElementByJSExecutor(saveButton);
		waitForJSandJQueryToLoad();
		return sectionID;
	}
	
	public List<String> getListOfAddedSections() {
		List<String> sectionIDList = new ArrayList<String>();
		List<WebElement> tableHeader = driver.findElements(By.xpath("//div[@id='memberList']//table[@class='tnl-table table-striped']//th"));
		int size = tableHeader.size();
		for(int i=0; i<size; i++) {
			if(tableHeader.get(i).getText().trim().equals("Section Number")){
				String xpath = String.format("//div[@id='memberList']//table[@class='tnl-table table-striped']//td[%d]", (i+1));
				List<WebElement> sectionList = driver.findElements(By.xpath(xpath));
				for (WebElement section : sectionList) {
					sectionIDList.add(section.getText());
				}
				break;
			}
		}
		
		return sectionIDList;
	}
	public boolean verifySectionsAddedArePresent(List<String> list1,List<String> list2) {
		return list1.containsAll(list2);
	}
}
