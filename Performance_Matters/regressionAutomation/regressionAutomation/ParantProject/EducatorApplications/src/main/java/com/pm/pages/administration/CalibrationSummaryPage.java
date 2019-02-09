package com.pm.pages.administration;

import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.ui.ExpectedConditions;

import com.pm.pages.common.BasePage;

public class CalibrationSummaryPage extends BasePage {
	public CalibrationSummaryPage() {
		super();
	}

	@FindBy(css = ".tnl-portal-header>h2")
	private WebElement pageHeaderName;

	@FindBy(xpath = "//th[text()[contains(.,'Event Close Date')]]")
	private WebElement eventCloseDateColumn;

	public boolean isCalibrationHeaderContains(String firstname, String lastname) {
		String headerText = pageHeaderName.getText();

		if (headerText.contains(firstname) && headerText.contains(lastname)) {
			return true;
		} else {
			return false;
		}
	}
	
	public String getCalibrationStatusHeader(){
		return pageHeaderName.getText();
	}

	public boolean isEventCloseDateColumnDisplayed() {
		try {
			wait.until(ExpectedConditions.visibilityOf(eventCloseDateColumn));
			return true;
		} catch (NoSuchElementException e) {
			return false;
		}
	}
}
