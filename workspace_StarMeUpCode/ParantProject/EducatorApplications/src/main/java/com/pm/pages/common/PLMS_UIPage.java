package com.pm.pages.common;

import java.util.ArrayList;
import java.util.List;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindAll;
import org.openqa.selenium.support.FindBy;

public class PLMS_UIPage extends BasePage{
	
	public PLMS_UIPage(){
		super();
	}
	
	@FindAll({@FindBy(xpath = "//div[@class='pm-pd-refine-section-heading']/ancestor::div[2]/following-sibling::div/div")})
    private List<WebElement> ListOfAllSectionLinks;
	
	public int getNumberOfDisplayedSectionLinks(){
		return ListOfAllSectionLinks.size();
	}
	
	public List<String> getSectionNames(){
		List<String> sectionNames = new ArrayList<String>();
		for(WebElement container :ListOfAllSectionLinks){
			sectionNames.add(container.getText());
		}
		return sectionNames;
	}

}
