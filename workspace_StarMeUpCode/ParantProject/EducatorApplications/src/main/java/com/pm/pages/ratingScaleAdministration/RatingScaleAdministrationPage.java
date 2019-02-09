package com.pm.pages.ratingScaleAdministration;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import com.pm.pages.common.BasePage;

public class RatingScaleAdministrationPage extends BasePage{

	public RatingScaleAdministrationPage() {
		super();
	}
	
	public void clickActionButton(String name) {
		String xpath = String.format("//td[text()='%s']/preceding-sibling::td//td[@class='menuheader']", name);
		WebElement actionButton = driver.findElement(By.xpath(xpath));
		clickElementByJSExecutor(actionButton);
		waitForJSandJQueryToLoad();
	}
}
