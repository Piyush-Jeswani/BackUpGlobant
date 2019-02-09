package com.pm.pages.administration;

import com.pm.pages.common.BasePage;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

public class AdministerConfigurationPage extends BasePage{

	public AdministerConfigurationPage() {
		super();
	}
	
	public void clickConfigureButton(String name) {
		String label = String.format("//td[text()='%s']/preceding-sibling::td/a[text()='Configure']", name);
		WebElement configureButton = driver.findElement(By.xpath(label));
		clickElementByJSExecutor(configureButton);
		waitForJSandJQueryToLoad();
	}
	public List<String> getOfficeNameList() {
		List<WebElement> officeList = driver.findElements(By.xpath("//table[@class='tnl-table']//td[2]"));
		List<String> officeNameList = new ArrayList<String>();
		for (WebElement element : officeList) {
			officeNameList.add(element.getText());
		}
		Collections.sort(officeNameList);
		return officeNameList;
	}
}
