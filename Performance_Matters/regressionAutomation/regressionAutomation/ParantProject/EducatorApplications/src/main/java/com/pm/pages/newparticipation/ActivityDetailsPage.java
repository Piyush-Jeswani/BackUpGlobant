package com.pm.pages.newparticipation;

import java.util.ArrayList;
import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.ui.Select;

import com.pm.pages.activitypages.OpportunityDetailsPage;
import com.pm.pages.common.BasePage;

public class ActivityDetailsPage extends BasePage {
	
	@FindBy(linkText = "Done")
	private WebElement doneBtn;
	
	@FindBy(id = "saveAnswersBtn")
	private WebElement saveAnswerButton;

	public ActivityDetailsPage() {
		super();
	}

	public void clickEditButtonForActivity() {
		waitForJSandJQueryToLoad();
		clickElementByJSExecutor(driver.findElement(By.xpath("//button[text()='Edit']")));
		waitForJSandJQueryToLoad();
	}

	public void selectCatagoryForActivity(String catagoryName) {
		waitForJSandJQueryToLoad();
		new Select(driver.findElement(By.xpath("//td[text()='Category']/ancestor::tr[1]/td[2]/select")))
				.selectByVisibleText(catagoryName);
		waitForJSandJQueryToLoad();
		log.info("User is able to select the catagory");
	}

	public void selectSubCatagoryForActivity(String subCatagoryName) {

		new Select(driver.findElement(By.xpath("//td[text()='SubCategory']/ancestor::tr[1]/td[2]/select")))
				.selectByVisibleText(subCatagoryName);
		waitForJSandJQueryToLoad();
		log.info("User is able to select the SubCatagory");
	}

	public boolean questionFieldAutopopulated() {
		String questionText = driver.findElement(By.xpath("//td[text()='Question']/ancestor::tr[1]/td[2]")).getText();
		if (questionText.equals("")) {
			return false;
		} else {
			return true;
		}
	}

	public void clickCancelBtn() {
		clickElementByJSExecutor( driver.findElement(By.xpath("//button[@id='cancelSaveAnswersBtn']")));
		waitForJSandJQueryToLoad();

	}
	
	public void clickSaveAnwerBtn() {
		clickElementByJSExecutor(saveAnswerButton);
		waitForJSandJQueryToLoad();
	}

	/* Learning Opportunity Page */

	public OpportunityDetailsPage clickOnOpportunityLink(String opportunityName) {
		waitForJSandJQueryToLoad();
		clickElementByJSExecutor(driver.findElement(By.linkText(opportunityName)));
		waitForJSandJQueryToLoad();
		return new OpportunityDetailsPage();
	}

	public List<String> getAllOpportunityLinks() {
		waitForJSandJQueryToLoad();
		List<WebElement> links = driver
				.findElements(By.xpath("//th[text()[contains(.,'Learning Opportunity')]]/ancestor::table[1]//td[3]/a"));
		List<String> linkNames = new ArrayList<>();

		for (WebElement link : links) {
			String linktext = link.getText();
			linkNames.add(linktext);
		}
		return linkNames;
	}

	public EvaluationPage clickDoneBtn() {
		clickElementByJSExecutor(driver.findElement(By.xpath("//a[@type='button'][text()='Done']")));
		waitForJSandJQueryToLoad();
		return new EvaluationPage();
	}

}
