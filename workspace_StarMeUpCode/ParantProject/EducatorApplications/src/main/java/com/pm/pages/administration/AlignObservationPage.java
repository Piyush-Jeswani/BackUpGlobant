package com.pm.pages.administration;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.ui.Select;

import com.pm.pages.common.BasePage;

public class AlignObservationPage extends BasePage{
	
	@FindBy(css = ".boot-btn.dropdown-toggle")
	private WebElement observationDropDown;
	
	@FindBy(xpath = "//form[@class='tnlf-align-observation-form']//select[@name='observationId']")
	private WebElement observationTemplateSelect;
	
	@FindBy(xpath = "//button[text()='Align']")
	private WebElement alignButton;
	
	@FindBy(name = "pageSize")
	private WebElement pageSizeSelect;
	
	public AlignObservationPage() {
		super();
	}
	
	public void clickDropDown(String title) {
		clickElementByJSExecutor(observationDropDown);
		waitForJSandJQueryToLoad();
		
		String observationValue = String.format("//li//span[text()='%s']", title);
		WebElement observationValueElement = driver.findElement(By.xpath(observationValue));
		clickElementByJSExecutor(observationValueElement);
		waitForJSandJQueryToLoad();
	}
	
	public String selectObservationTemplates(String observatioTemplate) {
		Select observationId = new Select(observationTemplateSelect);
		observationId.selectByIndex(1);
		return observationId.getFirstSelectedOption().getText();
	}
	
	public void clickAlignButton() {
		clickElementByJSExecutor(alignButton);
		waitForJSandJQueryToLoad();
	}
	public boolean verifyObservationTemplateAdded(String observationTemplate) {
		String observationTemplateName = String.format("//table//td[text()='%s']", observationTemplate);
		WebElement templateName = driver.findElement(By.xpath(observationTemplateName));
		return templateName.isDisplayed();
	}
	
	public List<String> getObservationTemplateHeader(String observationTemplate) {
		String observationTemplateHeader = String.format("//table//td[text()='%s']/ancestor::tbody/preceding-sibling::thead//th", observationTemplate);
		List<WebElement> templateHeader = driver.findElements(By.xpath(observationTemplateHeader));
		List<String> headers = new ArrayList<String>();
		for (WebElement webElement : templateHeader) {
			if(!webElement.getText().isEmpty()) {
				String text = webElement.getText().toLowerCase();
				headers.add(text);
			}
		}
		return headers;
	}
	
	public boolean getObservationTemplateRights(String colName,String observationTemplate,int index) {
		String observationTemplatecheckboxes = String.format("//th[contains(text(),'%s')]/ancestor::thead/following-sibling::tbody//td[text()='%s']/following-sibling::td[%d]",colName, observationTemplate,index);
		WebElement templateCheckboxes = driver.findElement(By.xpath(observationTemplatecheckboxes));
		return templateCheckboxes.isEnabled();
	}
	
	public void closeCurrentTab(){
		waitForJSandJQueryToLoad();
		String originalHandle = driver.getWindowHandle();

		for(String handle : driver.getWindowHandles()) {
	        if (!handle.equals(originalHandle)) {
	            driver.switchTo().window(handle);
	            driver.close();
	        }
	    }
	    driver.switchTo().window(originalHandle);
	}
	
	public void changePageSize() {
		Select pageSize = new Select(pageSizeSelect);
		pageSize.selectByVisibleText("100");
		waitForJSandJQueryToLoad();
	}
	
	public List<String> getAlignObservationList() {
		Select observationId = new Select(observationTemplateSelect);
		List<WebElement> observationList = observationId.getOptions();
		List<String> observations = new ArrayList<String>();
		for (int i=1;i<observationList.size();i++) {
			observations.add(observationList.get(i).getText());
		}
		return observations;
	}
	
	public boolean compareObservationList(List<String> list1,List<String> list2) {
		Collections.sort(list1);
		Collections.sort(list2);
		boolean flag = false;
		for(int i=0;i<list2.size();i++) {
			if(list1.contains(list2.get(i).trim())){
				flag = true;
			}else {
				flag = false;
				break;
			}
		}
		return flag;
	}
}
