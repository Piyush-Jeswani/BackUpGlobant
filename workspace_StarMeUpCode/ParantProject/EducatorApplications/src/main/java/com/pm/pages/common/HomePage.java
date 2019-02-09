package com.pm.pages.common;

import java.util.ArrayList;
import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindAll;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.ui.ExpectedConditions;

public class HomePage extends BasePage {

	private NavigationMenu navigationMenu = null;
	
	private MyCoursesSection myCoursesSection =null;
	
	private RecommendedTrainingSection recommendedTrainingSection=null;
	
	@FindAll({@FindBy(xpath = "//section/header/h2")})
    private List<WebElement> ListOfAllSectionNames;
	
	@FindBy(xpath = "//h2[text()='My Announcements']/ancestor::section[1]")
	private WebElement myAnnouncementsSection;
		
	public NavigationMenu getNavigationMenu() {
		return this.navigationMenu;
	}
	
	public MyCoursesSection MyCoursesSection() {
		return myCoursesSection;
	}
	
	public RecommendedTrainingSection RecommendedTrainingSection(){
		return recommendedTrainingSection;
	}
	
	public HomePage(){
		super();
		navigationMenu = new NavigationMenu();
		myCoursesSection = new MyCoursesSection();
		recommendedTrainingSection = new RecommendedTrainingSection();
	}
	
	public List<String> getAllSectionNames(){
		List<String> sectionNames= new ArrayList<String>();
		for(WebElement section : ListOfAllSectionNames){
			sectionNames.add(section.getText());
		}
		return sectionNames;
	}
	
	public String clickAndGoToAnyAnnouncement(){
		WebElement link = myAnnouncementsSection.findElement(By.tagName("a"));
		String linkaname = link.getText();
		clickElementByJSExecutor(link);
		waitForJSandJQueryToLoad();
		return linkaname;
	}
		
	public class MyCoursesSection extends BasePage{
		
		public MyCoursesSection(){
			super();
		}
		
		@FindBy(xpath = "//h2[text()='My Courses']/ancestor::section[1]")
		private WebElement myCoursesSection;
				
		public int noOfCoursesDispleyed(){
			return myCoursesSection.findElements(By.xpath(".//li[@class='has-icon space-left']//span[@class='title']/a")).size();
		}
		
		public int noOfCoursesDisplayedAfterShowAll() {
			return myCoursesSection.findElements(By.xpath(".//li[contains(@class,'has-icon space-left')]//span[@class='title']/a")).size();
		}
		
		public void clickOnCourse(String coursename){
			
			String xpathOfcorse = String.format(".//ul/li//span[@class='title']/a[text()=\"%s\"]", coursename);
			WebElement course = myCoursesSection.findElement(By.xpath(xpathOfcorse));
			clickElementByJSExecutor(course);
			waitForJSandJQueryToLoad();			
		}
		
		public void clickOnSection(String courseName) {
			String xpathOfcorse = String.format("//h2[text()='My Courses']/ancestor::section[1]//ul//a[text()='%s']/ancestor::div[1]/p/a", courseName);
			WebElement course = driver.findElement(By.xpath(xpathOfcorse));
			clickElementByJSExecutor(course);
			waitForJSandJQueryToLoad();
		}
		
		public String getTextOfCourseAt(int courseNoFromTop){
			String xpathOfcorse = String.format(".//ul/li[%s]//span[@class='title']/a", courseNoFromTop);
			String courseName = myCoursesSection.findElement(By.xpath(xpathOfcorse)).getText();
			return courseName;
		}
		
		public void clickShowAll() {
			WebElement showAllLink = driver.findElement(By.xpath("//div[@class='tnl-channel-container courses']//li[@class='show-all']/a"));
			clickElementByJSExecutor(showAllLink);
			waitForJSandJQueryToLoad();
		}
		
		public String getCourseTitle() {
			WebElement courseTitle = driver.findElement(By.className("pm-pd-cspb-course-title"));
			waitForJSandJQueryToLoad();
			return courseTitle.getText();
		}
		
		
		public boolean getDetails(String linkText) {
			WebElement detailsText = driver.findElement(By.linkText(linkText));
			waitForJSandJQueryToLoad();
			return detailsText.isDisplayed();
		}
		
		public void clickDetails(String linkText) {
			WebElement detailsText = driver.findElement(By.linkText(linkText));
			clickElementByJSExecutor(detailsText);
			waitForJSandJQueryToLoad();
			
		}
		
		public String getActiveTab() {
			WebElement activeTab = driver.findElement(By.xpath("//div[@id='tnlf-page-content']//li[contains(@class,'active')]/a"));
			return activeTab.getText();
		}
		
		public void showPDPlaylist() {
			WebElement pdPlayList = driver.findElement(By.xpath("//h2[contains(text(),'My PD Playlists')]/ancestor::div/preceding-sibling::div/span[@class='tnlf-show-plc-plans-span']/a"));
			clickElementByJSExecutor(pdPlayList);
			waitForJSandJQueryToLoad();
		}
				
		public void hidePlaylist(String courseName) {
			String hideIcon = String.format("//span[text()='%s']/ancestor::div/following-sibling::div/a", courseName);
			wait.until(ExpectedConditions.visibilityOf(driver.findElement(By.xpath(hideIcon))));
			WebElement hideIconElement = driver.findElement(By.xpath(hideIcon));
			clickElementByJSExecutor(hideIconElement);
			waitForJSandJQueryToLoad();
			
			
			WebElement hidePlaylist = driver.findElement(By.xpath("//button[text()='Hide PD Playlist']"));
			clickElementByJSExecutor(hidePlaylist);
			waitForJSandJQueryToLoad();
		}
		public void clickViewHiddenPlaylist() {
			if(!elementPresent(By.linkText("View Hidden PD Playlists"))) {
				showPDPlaylist();
				clickElementByJSExecutor(driver.findElement(By.linkText("View Hidden PD Playlists")));
				waitForJSandJQueryToLoad();
			}
			else {
				clickElementByJSExecutor(driver.findElement(By.linkText("View Hidden PD Playlists")));
				waitForJSandJQueryToLoad();
			}
		}
				
		public boolean verfiyCourseHidden(String name) {
			String courseName = String.format("//table//td//span[text()='%s']", name);
			return elementPresent(By.xpath(courseName));
		}
		
		public void showOnTeaser(String name) {
			String actionButton = String.format("//td//span[text()='%s']/ancestor::td/preceding-sibling::td", name);
			WebElement action = driver.findElement(By.xpath(actionButton));
			WebElement clickactionButton = action.findElement(By.cssSelector(".pmf-show-on-teaser"));
			clickElementByJSExecutor(clickactionButton);
			waitForJSandJQueryToLoad();
		}
		
		public void clickOnLink(String linkText){
			clickElementByJSExecutor(myCoursesSection.findElement(By.linkText(linkText)));
			waitForJSandJQueryToLoad();
		}
		
	}
	
	
public class RecommendedTrainingSection extends BasePage{
		
		public RecommendedTrainingSection(){
			super();
		}
		
		@FindBy(xpath = "//h2[text()='Recommended Training']/ancestor::section[1]")
		private WebElement recommendedTrainingSection;
				
		public int noOfAllTrainingsDispleyed(){
			return driver.findElements(By.xpath("//ul[@class='tnl-item-list']/li/span/a[@class='tnl-text-link']")).size(); 
		}
		
		public void clickOnTraining(String coursename){
			
			String xpathOfTraining = String.format("//ul[@class='tnl-item-list']//a[@class='tnl-text-link']/span[text()=\"%s\"]/ancestor::a", coursename);
			WebElement Training = driver.findElement(By.xpath(xpathOfTraining));
			clickElementByJSExecutor(Training);
			waitForJSandJQueryToLoad();			
		}
		
		public void clickOnLink(String linkText){
			clickElementByJSExecutor(recommendedTrainingSection.findElement(By.linkText(linkText)));
			waitForJSandJQueryToLoad();
		}
		
		public boolean verifyRecommendCourseIsDisplayed(String courseName) {
			String courseTitle = String.format("//ul[@class='tnl-item-list']/li/span/a[@class='tnl-text-link']/span[contains(text(),'%s')]", courseName);
			return elementPresent(By.xpath(courseTitle));
		}
	}

}
