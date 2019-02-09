package com.pm.pages.Observation;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindAll;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.FindBys;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;

import com.pm.pages.common.BasePage;

public class ObservationPage extends BasePage{
		
	@FindBy(xpath = "//ul[@class='pagination']/li/a")
	private List<WebElement> pages;
	
	@FindAll({@FindBy(css = ".fa-plus-square")})
	private List<WebElement> standardExpand;
	
	@FindAll({@FindBy(css = ".fa-minus-square")})
		private List<WebElement> standardCollapse;
	
	@FindBy(css = ".tnlf-close-minor-pane")
	private WebElement closePanel;
	
	@FindBy(name = "observationId")
	private WebElement observationIdSelect;
	
	@FindBy(xpath = "//div[@id='s2id_ObserveePersons']/a")
	private WebElement userDropdown;
	
	@FindBy(id = "s2id_Observations")
	private WebElement templateDropdown;
	
	@FindBy(xpath = "//button[text()='Start']")
	private WebElement startButton;
	
	@FindBy(className = "tnl-row-selector")
	private WebElement pageClass;
	
	@FindBy(id = "FilterByObservationSelectItems")
	private WebElement observationTypeSelect;
	
	@FindAll({@FindBy(xpath = "//div[@id='tObservationDesignerAll']//table//td//span[@class='tnl-menu-text']")})
	private List<WebElement> activeObservation;
	
	@FindAll({@FindBy(xpath = "//header[@class='well-header']//a")})
	private List<WebElement> observationList;
	
	@FindBy(id = "ObservationSort")
	private WebElement observationSortId;
	
	public int expandStandards() {
		
		for (WebElement webElement : standardExpand) {
			clickElementByJSExecutor(webElement);
			waitForJSandJQueryToLoad();
		}
		
		return standardCollapse.size();
	}
	
	public int collapseStandards() {
		for (WebElement webElement : standardCollapse) {
			clickElementByJSExecutor(webElement);
			waitForJSandJQueryToLoad();
		}
		
		return standardExpand.size();
	}
	
	public String clickNotes(String title) {
		String className = String.format("//a[contains(@class,'tnl-observation-%s-link')]", title);
		WebElement notes = driver.findElement(By.xpath(className));
		clickElementByJSExecutor(notes);
		waitForJSandJQueryToLoad();
		return notes.getAttribute("class");
	}
	
	public void closePanel() {
		clickElementByJSExecutor(closePanel);
		waitForJSandJQueryToLoad();
	}
	
	public void clickOnTab(String linkText) throws InterruptedException {
		String link = String.format("//a[contains(text(),'%s')][@class='tab-ajax']",linkText);
		WebElement tabLink = driver.findElement(By.xpath(link));
		clickElementByJSExecutor(tabLink);
		waitForJSandJQueryToLoad();
	}
	
	public boolean isActiveTab(String linkText) {
		String tabs = String.format("//a[contains(text(),'%s')][@class='tab-ajax']/ancestor::li",linkText);
		WebElement tabElement = driver.findElement(By.xpath(tabs));
		return tabElement.getAttribute("class").equals("active");
	}
	public void switchToFormWindow() {
		ArrayList<String> windowHandles = new ArrayList<String> (driver.getWindowHandles());
		for(String window : windowHandles){
			driver.switchTo().window(window);
			if(driver.getTitle().contains("PrimaryDomain - External Channel")){
				break;
			}			
		}
	}
	
	public void clickOnButton(String buttonText) {
		String button = String.format("//button[text()='%s']",buttonText);
		WebElement unlinkButton = driver.findElement(By.xpath(button));
		clickElementByJSExecutor(unlinkButton);
		waitForJSandJQueryToLoad();
	}
	
	public void selectObservationTemplate(String templateName) {
		Select observationId = new Select(observationIdSelect);
		observationId.selectByVisibleText(templateName);
	}
	
	public void selectUser(String userName,String templateName) throws InterruptedException {
		wait.until(ExpectedConditions.elementToBeClickable(userDropdown));
		waitForJSandJQueryToLoad();
		userDropdown.click();
		waitForJSandJQueryToLoad();
		
		
		String userNameLabel = String.format("//ul[@class='select2-results']//div[contains(text(),'%s')]", userName);
		WebElement user = driver.findElement(By.xpath(userNameLabel));
		waitForJSandJQueryToLoad();
		user.click();
		waitForJSandJQueryToLoad();
		templateDropdown.click();
		waitForJSandJQueryToLoad();
		
		String templateLabel = String.format("//ul[@class='select2-results']//div[contains(text(),'%s')]", templateName);
		WebElement template = driver.findElement(By.xpath(templateLabel));
		waitForJSandJQueryToLoad();
		template.click();
		waitForJSandJQueryToLoad();
		
		clickElementByJSExecutor(startButton);
		waitForJSandJQueryToLoad();
	}
	
	public void displayAllResults() {
		Select results = new Select(pageClass);
		results.selectByVisibleText("100");
		waitForJSandJQueryToLoad();
	}
	
	public List<String> getActiveObservations() {
		List<String> activeObservationsList = new ArrayList<String>();
		
		for (WebElement element : activeObservation) {
			activeObservationsList.add(element.getText());
		}
		return activeObservationsList;
	}
	
	public int verifyObservationsListPresent() {
		return observationList.size();
	}
	
	public void sortByObservationType(String observationType) {
		Select observation = new Select(observationTypeSelect);
		observation.selectByVisibleText(observationType);
		waitForJSandJQueryToLoad();
	}
	
	public List<String> getObservationsList() {
		wait.until(ExpectedConditions.visibilityOf(driver.findElement(By.xpath("//header[@class='well-header']//a"))));
		List<String> observations = new ArrayList<String>();
		
		for (WebElement webElement : observationList) {
			String[] observationName = webElement.getText().split(" on ");
			observations.add(observationName[0]);
		}
		return observations;
	}
	
	public void sortByNameDate(String sortType) {
		Select observation = new Select(observationSortId);
		observation.selectByVisibleText(sortType);
		waitForJSandJQueryToLoad();
	}
	
	public List<WebElement> getPages() {
		return pages;
	}
	
	public List<String> getObservationNamesList() throws InterruptedException{
		List<String> observationsList = new ArrayList<String>();
		if(elementPresent(By.xpath("//ul[@class='pagination']/li/a"))){
			List<WebElement> pages = getPages();
			int size = pages.size()-1;
			if(size > 0) {
				for(int i=1; i<=size; i++) {
					int pageNumber = Integer.valueOf(pages.get(i).getText().trim());
					if(pageNumber == i) {
						observationsList.addAll(getObservationsList());
						clickElementByJSExecutor(pages.get(i));
						waitForJSandJQueryToLoad();
						}
				}
			}
		}
		return observationsList;
	}
	
	public boolean verifyListSortOrder(String order,List<String> list1,List<String> list2) {
		if(order == "asc") {
			Collections.sort(list1);
		}else if(order == "desc"){
			Collections.sort(list1, Collections.reverseOrder());
		}
		
		return list1.equals(list2);
	}
}
