package com.pm.pages.common;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

public class MyTranscriptPage extends BasePage{
	
	@FindBy(id = "transcriptTable")
	private WebElement myTranscriptTable;
	
	public MyTranscriptPage(){
		super();
	}
	
	public boolean myTranscriptTableDisplayed(){
		return myTranscriptTable.isDisplayed();
	}
}
