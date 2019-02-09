package com.pm.pages.myCredentials;

import org.openqa.selenium.By;

import com.pm.pages.common.BasePage;

public class MyCredentialsPage extends BasePage{

	public MyCredentialsPage() {
		super();
		// TODO Auto-generated constructor stub
	}
	
	public String verifyPageHeader() {
		return driver.findElement(By.tagName("h1")).getText();
	}
	
	public int getCredentialsTextCount() {
		int count = 0;
		if(elementPresent(By.xpath("//div[@id='credentialsBody']//table//td/a[@class='tnl-text-link']"))) {
			count = driver.findElements(By.xpath("//div[@id='credentialsBody']//table//td/a[@class='tnl-text-link']")).size();
		}
		return count;
	}
}
