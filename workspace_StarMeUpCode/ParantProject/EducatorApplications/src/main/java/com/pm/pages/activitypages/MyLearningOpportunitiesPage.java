package com.pm.pages.activitypages;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import com.pm.pages.common.BasePage;

public class MyLearningOpportunitiesPage extends BasePage {

	public MyLearningOpportunitiesPage() {
		super();
	}
	
	@FindBy(css = ".pmf-page-title")
	private WebElement pageTitle;
	
	public String getPageTitle(){
		return pageTitle.getText();
	}
}