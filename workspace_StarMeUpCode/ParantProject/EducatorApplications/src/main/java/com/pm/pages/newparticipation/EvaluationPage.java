package com.pm.pages.newparticipation;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import com.pm.pages.Observation.ObservationPage;
import com.pm.pages.common.BasePage;

public class EvaluationPage extends BasePage {
	
	public EvaluationPage() {
		super();
	}
	
	
	public WebElement clickActivityContainer(String ContainerName) {
		String xpath = "//span[text()='" + ContainerName + "']/ancestor::div[2]";
		WebElement activityContainer = driver.findElement(By.xpath(xpath));
		activityContainer.click();
		return driver.findElement(By.xpath(xpath));
	}

	public ActivityDetailsPage clickOnActivityFromActivityContainer(String activityname, String ActivityContainerName) {
		waitForJSandJQueryToLoad();
		WebElement activityContainer = clickActivityContainer(ActivityContainerName);
		waitForJSandJQueryToLoad();
		clickElementByJSExecutor(activityContainer.findElement(By.linkText(activityname)));
		return new ActivityDetailsPage();
	}

	public boolean containerIsPresent(String ContainerName) {
		String xpath = "//span[text()='" + ContainerName + "']/ancestor::div[2]";
		By by = By.xpath(xpath);
		return elementPresent(by);
	}
	
	public ObservationPage clickOnActivity(String activityName) {
		WebElement activityLink = driver.findElement(By.linkText(activityName));
		clickElementByJSExecutor(activityLink);
		waitForJSandJQueryToLoad();
		return new ObservationPage();
	}
}
