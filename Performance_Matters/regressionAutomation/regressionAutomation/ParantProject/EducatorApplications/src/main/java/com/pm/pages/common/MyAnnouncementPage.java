package com.pm.pages.common;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

public class MyAnnouncementPage extends BasePage{
	
	@FindBy(xpath = "//div[@class='tnl-message-body']//div[@class='tnl-container-header']/h1")
	private WebElement announcementName;
	
	@FindBy(xpath = "//div[@id='box-ta']//div[@class='tnl-channel-4-header-text']")
	private WebElement pageHeader;
	
	public MyAnnouncementPage(){
		super();
	}
	
	public String getAnnounceMentName(){
		return announcementName.getText();
	}
	
	public String getPageheadertext(){
		return pageHeader.getText();
	}

}
