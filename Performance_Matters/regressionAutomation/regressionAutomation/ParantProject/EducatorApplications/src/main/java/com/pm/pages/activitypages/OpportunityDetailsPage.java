package com.pm.pages.activitypages;

import org.openqa.selenium.By;

import com.pm.pages.common.BasePage;
import com.pm.pages.newparticipation.ActivityDetailsPage;

public class OpportunityDetailsPage extends BasePage {
	public OpportunityDetailsPage() {
		super();
	}

	public ActivityDetailsPage clickBrowserBackBtn() {
		driver.navigate().back();
		waitForJSandJQueryToLoad();
		return new ActivityDetailsPage();
	}

	public boolean pageHeaderContainsOpportunityName(String opportunityName) {
		String headerText = driver
				.findElement(By.xpath("//div[contains(@class,'pm-pd-course-banner-box')]/div[2]/div[2]/span"))
				.getText();
		return headerText.contains(opportunityName);
	}
}
