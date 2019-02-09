package com.pm.pages.coursecatalog;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;

import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindAll;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;

import com.google.common.collect.Ordering;
import com.pm.pages.common.BasePage;
import com.pm.pages.common.PLMS_UIPage;

public class CourseCatalogPage extends BasePage {

	private SubjectAlignedCoursesSection subjectAlignedCoursesSection = null;

	private CompetencyAlignedCoursesSection competencyAlignedCoursesSection = null;
	private LearningOpportunitySearchSection learningOpportunitySearchSection = null;

	public SubjectAlignedCoursesSection subjectAlignedCoursesSection() {
		return subjectAlignedCoursesSection;
	}

	public CompetencyAlignedCoursesSection competencyAlignedCoursesSection() {
		return competencyAlignedCoursesSection;
	}
	
	public LearningOpportunitySearchSection learningOpportunitySearchSection() {
		return learningOpportunitySearchSection;
	}
	public CourseCatalogPage() {
		super();
		subjectAlignedCoursesSection = new SubjectAlignedCoursesSection();
		competencyAlignedCoursesSection = new CompetencyAlignedCoursesSection();
		learningOpportunitySearchSection = new LearningOpportunitySearchSection();
	}

	public class SubjectAlignedCoursesSection extends BasePage {
		@FindBy(xpath = "//h2[text()='Subject Aligned Courses']/ancestor::section[1]")
		private WebElement subjectAlignedCoursesSection;

		@FindBy(xpath = "//h2[text()='//h1[text()='Science']/ancestor::div[2]")
		private WebElement scienceSectoin;

		@FindBy(xpath = "//h1[text()='Science']/ancestor::div[2]/div[2]//li[4]/a")
		private WebElement mathLink;

		@FindAll({
				@FindBy(xpath = "//h2[text()='Subject Aligned Courses']/ancestor::section[1]//div[@class='tnl-facets-header']/h1") })
		private List<WebElement> ListOfAllContainers;

		public void clickLinkFromSection(String section, String link) {

			String linkXpathTemplate = "//h1[text()='%s']/ancestor::div[@class='tnl-facets']//a[@class='tnl-text-link']";
			driver.findElements(By.xpath(String.format(linkXpathTemplate, section)));

		}
		
		public List<String> getContainerNames(){
			List<String> containerNames = new ArrayList<String>();
			for(WebElement container :ListOfAllContainers){
				containerNames.add(container.getText());
			}
			return containerNames;
		}

		public PLMS_UIPage clickMathLink() throws InterruptedException {
			waitForJSandJQueryToLoad();
			mathLink.click();
			waitForJSandJQueryToLoad();
			return new PLMS_UIPage();
		}

	}

	public class CompetencyAlignedCoursesSection extends BasePage {

		public CompetencyAlignedCoursesSection() {
			super();
		}

		@FindBy(xpath = "//h2[text()='Competency Aligned Courses']/ancestor::section[1]")
		private WebElement competencyAlignedCoursesSection;

		@FindBy(xpath = ".//div[@id='main-assessments']//tr/td/div[1]/a")
		private WebElement charlotteDanielsonRubricOnlyLink;

		public void clickCharlotteDanielsonRubricOnlyLink() {
			waitForJSandJQueryToLoad();
			charlotteDanielsonRubricOnlyLink.click();
		}

		public PLMS_UIPage clickExploreBtnFor(String domainName) {
			WebElement row = getRowForDomain(domainName);
			waitForJSandJQueryToLoad();
			row.findElement(By.xpath("//td[2]/button")).click();
			return new PLMS_UIPage();
		}

		public WebElement getRowForDomain(String domainName) {
			waitForJSandJQueryToLoad();
			String xpath = "//td/a[text()[contains(.,'" + domainName + "')]]/ancestor::tr[1]";
			return driver.findElement(By.xpath(xpath));
		}

	}
	
	public class LearningOpportunitySearchSection extends BasePage {
		
		@FindBy(id = "box-9")
		private WebElement noCredit;
		
		@FindBy(xpath = "//form//input[@name='submit']")
		private WebElement submitButton;
		
		@FindBy(css = ".pm-pd-course-title a")
		private WebElement courseTitleId;
		
		@FindBy(css = ".pm-rm-text.pm-read-more-text")
		private WebElement courseDescription;
		
		@FindBy(name = "searchString")
		private WebElement searchInput;
		
		@FindBy(className = "tnlf-course-search-btn")
		private WebElement searchButton;
		
		@FindBy(css = ".tnlf-listall-course-teaser>span")
		private WebElement showAllLink;
		
		@FindBy(linkText = "Advanced Search")
		private WebElement advancedSearchLink;
		
		@FindBy(name = "first_name")
		private WebElement firstNameInput;
		
		@FindBy(name = "last_name")
		private WebElement lastNameInput;
		
		@FindBy(xpath = ".//div[@id='tnlf-page-content']//button[text()='Finish']")
		private WebElement finishButton;
		
		@FindBy(xpath = "//button[text()='Yes']")
		private WebElement yesButton;
		
		@FindBy(linkText = "Search")
		private WebElement searchLink;
		
		@FindBy(linkText = "Done")
		private WebElement doneLink;
		
		@FindBy(linkText = "OK")
		private WebElement okLink;
		
		public LearningOpportunitySearchSection() {
			super();
		}
		
		public void enterSearchText(String searchKeyword) {
			searchInput.clear();
			searchInput.sendKeys(searchKeyword);
			searchInput.sendKeys(Keys.ENTER);
			waitForJSandJQueryToLoad();
		}
		public void clickSearchButton() {
			clickElementByJSExecutor(searchButton);
		}
		
		public String getSearchInputText() {
			return searchInput.getAttribute("value");
		}
		
		public void clickShowAll() {
			clickElementByJSExecutor(showAllLink);
			waitForJSandJQueryToLoad();
		}
		
		public void clickAdvancedSearch() {
			clickElementByJSExecutor(advancedSearchLink);
			waitForJSandJQueryToLoad();
		}
		
		public void clickRegisterButton(String courseName) {
			String xpath = String.format("//span[text()='%s']/ancestor::td/following-sibling::td//a[text()='Register']", courseName);
			WebElement registerButton = driver.findElement(By.xpath(xpath));
			clickElementByJSExecutor(registerButton);
			waitForJSandJQueryToLoad();
		}
		
		public void selectPageSize() {
			Select pageSize = new Select(driver.findElement(By.name("pageSize")));
			pageSize.selectByVisibleText("100");
			waitForJSandJQueryToLoad();
		}
				
		public void clickNoCredit() {
			clickElementByJSExecutor(noCredit);
		}
		
		public String getBuyNowText() {
			WebElement buyNowText = driver.findElement(By.xpath("//form"));
			return buyNowText.getText();
		}
		
		public void clickSubmitButton() {
			clickElementByJSExecutor(submitButton);
			waitForJSandJQueryToLoad();
		}
		
		public void clickExpandIcon(String name) {
			String xpath = String.format("//div[text()='%s']/ancestor::div[contains(@class,'pmf-expand-heading')]//div[contains(@class,'pmf-expand-heading-icon-down')]", name);
			WebElement expandIcon = driver.findElement(By.xpath(xpath));
			clickElementByJSExecutor(expandIcon);
			waitForJSandJQueryToLoad();
		}
		
		public void clickFilterValue(String name,String value) {
			String xpath = String.format("//div[text()='%s']/ancestor::div[contains(@class,'pmf-expand-heading')]/following-sibling::div[contains(@class,'pmf-expand-contents')]//label[text()='%s']", name,value);
			WebElement valueClick = driver.findElement(By.xpath(xpath));
			wait.until(ExpectedConditions.elementToBeClickable(valueClick));
			clickElementByJSExecutor(valueClick);
			waitForJSandJQueryToLoad();
			
		}
		
		public String getResultText() {
			WebElement resultElement = driver.findElement(By.xpath("//div[@class='tnlf-course-search-results-data-panel']/preceding-sibling::div[1]//div[@class='row']/div[@class='col-xs-6']"));
			return resultElement.getText();
		}
		
		public void clickRating(String starCount) {
			String stars = String.format("//div[@class='tnl-facets-content']//li[%s]/div", starCount);
			WebElement ratings = driver.findElement(By.xpath(stars));
			clickElementByJSExecutor(ratings);
			waitForJSandJQueryToLoad();
		}
		
		public String  getRatings() {
			List<WebElement> selectedRating = driver.findElements(By.xpath("//div[@class='tnl-facets-content']//li[@class='on']//span[@class='tnl-icon-sm tnl-icon-rate-full-sm']"));
			int count = selectedRating.size();
			return String.valueOf(count);
		}
		
		public String getSectionNoAndName(String sectionName) {
			String xpath = String.format("//div[@class='pmf-sections-content']//table[@class='pm-pd-course-section-table']//a[@class='tnl-text-link']//span[text()='%s']", sectionName);
			WebElement sectionNoName = driver.findElement(By.xpath(xpath));
			return sectionNoName.getText();
		}
		
		public void displayAllResults() {
			Select pageSize = new Select(driver.findElement(By.name("pageSize")));
			pageSize.selectByVisibleText("100");
			waitForJSandJQueryToLoad();
		}
		
		public boolean checkOfficeLabel() {
			WebElement officeLabel = driver.findElement(By.xpath("//label[text()='Office 2:']"));
			return officeLabel.isDisplayed();
		}
		
		public List<String> getOperationDropdown(String name) {
			String operationSelectName = String.format("//label[text()='Office 2:']/ancestor::div[@class='tnl-label pm-label']/following-sibling::div//select[@name='%s']",name );
			Select operationSelect = new Select(driver.findElement(By.xpath(operationSelectName)));
			List<WebElement> optionsList = operationSelect.getOptions();
			List<String> optionsListString = new ArrayList<String>();
			for (int i=1; i<optionsList.size(); i++) {
				optionsListString.add(optionsList.get(i).getText());
			}
			Collections.sort(optionsListString);
			return optionsListString;
		}
		
		public boolean verifyEqualityOfList(List<String> list1,List<String> list2) {
			return list1.equals(list2);
		}
		
		public boolean verifyGotoCourseLabel(String sectionName) {
			String xpath = String.format("//span[text()='%s']/ancestor::td/following-sibling::td//span[text()='Go to My Course']", sectionName);
			WebElement gotoCourseLabel = driver.findElement(By.xpath(xpath));
			return gotoCourseLabel.isDisplayed();
		}
		
		public int verifyRegisterButtonCount() {
			int size = 0;
			if(elementPresent(By.xpath("//table[@class='pm-pd-course-section-table']//a[@class='tnl-text-link']//ancestor::td/following-sibling::td//a[text()='Register']"))) {
				List<WebElement> registerButton = driver.findElements(By.xpath("//table[@class='pm-pd-course-section-table']//a[@class='tnl-text-link']//ancestor::td/following-sibling::td//a[text()='Register']"));
				size = registerButton.size();
			}
			return size;
		}
		
		public void clickViewAllLink() {
			
			if(elementPresent(By.linkText("View All Sections"))){
				clickOnLink("View All Sections");
			}
		}
		
		public boolean verifyNoTextForSection(String sectionName) {
			String sectionPath = String.format("//span[text()='%s']/ancestor::td/following-sibling::td/div[@class='pm-pd-section-no-button']", sectionName);
			WebElement sectioncourseText = driver.findElement(By.xpath(sectionPath));
			return sectioncourseText.getText().isEmpty();
		}
		
		public String getCourseTitle() {
			return courseTitleId.getText();
		}
		
		public String getCourseId() {
			return courseTitleId.getText();
		}
		
		public String getCourseDescription() {
			return courseDescription.getText();
		}
		
		public List<String> getSectionTitleList() {
			List<WebElement> sectionTitle = driver.findElements(By.xpath("//td[1]//a[@class='tnl-text-link']/span"));
			
			List<String> sectionTitleList = new ArrayList<String>();
			for (WebElement webElement : sectionTitle) {
				sectionTitleList.add(webElement.getText());
			}
			return sectionTitleList;
		}
		
		public List<String> getDatesOfSection() {
			List<WebElement> dateList = driver.findElements(By.xpath("//td[@class='text-center']"));
			List<String> datesList = new ArrayList<String>();
			for (WebElement webElement : dateList) {
				datesList.add(webElement.getText());
			}
			return datesList;
		}
		
		public boolean checkListIsSorted(List<String> list) {
			return Ordering.natural().isOrdered(list);
		}
		
		public void switchToNewlyOpenedWindow() {
			Set<String> windowHandles= driver.getWindowHandles();
			for (String string : windowHandles) {
				driver.switchTo().window(string);
			}
			waitForJSandJQueryToLoad();
		}
		
		public void recommendCourseToUser(String courseName,String firstName,String lastName) throws InterruptedException {
			String courseRecommend = String.format("//*[contains(text(),'%s')]/ancestor::div[@class='row'][1]/following-sibling::div//div[@class='pmf-recommend-course']", courseName);
			WebElement recommendLink = driver.findElement(By.xpath(courseRecommend));
			recommendLink.click();
			
			String winHandleBefore = driver.getWindowHandle();
			switchToNewlyOpenedWindow();
			String secondWindowHandle = driver.getWindowHandle();
			driver.findElement(By.xpath("//span[text()=' Set People']")).click();
			
			switchToNewlyOpenedWindow();
			
			firstNameInput.clear();
			firstNameInput.sendKeys(firstName);
			
			lastNameInput.clear();
			lastNameInput.sendKeys(lastName);
			
			searchLink.click();
			
			String userName = String.format("//td[text()='%s %s']/preceding-sibling::td/input", firstName,lastName);
			WebElement userNameCheck = driver.findElement(By.xpath(userName));
			userNameCheck.click();
			
			doneLink.click();
			driver.switchTo().window(secondWindowHandle);
			
			clickElementByJSExecutor(finishButton);
			clickElementByJSExecutor(yesButton);
			waitForJSandJQueryToLoad();
			
			okLink.click();
			
			driver.switchTo().window(winHandleBefore);
		}
		
		public void resetAllfilters() {
			clickElementByJSExecutor(driver.findElement(By.cssSelector(".pmf-reset-limiters")));
			waitForJSandJQueryToLoad();
		}
		
		public void clickOnSection(String sectionTitle) {
			String section = String.format("//a/span[contains(text(),'%s')]", sectionTitle);
			clickElementByJSExecutor(driver.findElement(By.xpath(section)));
			waitForJSandJQueryToLoad();
		}
	}

}
