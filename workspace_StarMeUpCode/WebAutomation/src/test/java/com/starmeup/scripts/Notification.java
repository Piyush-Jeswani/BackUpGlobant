package com.starmeup.scripts;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.annotations.Test;


import com.pageobject.HomePage_StarMeUp;
import com.pageobject.Login_StarMeUp;

import Utility.ReadProperty;
import root.TestBase;

public class Notification extends TestBase{
	
	Login_StarMeUp lg;
	HomePage_StarMeUp home;
	
	
	@Test(dataProvider="SearchProvider")
	public void notificationFunctionality() {
		
		try{
			
			ReadProperty p = new ReadProperty();
			
			lg = new Login_StarMeUp(driver);
			home = lg.makeLogin();
			WebDriverWait wait = new WebDriverWait(driver, 10);
			WebElement element = wait.until(
			        ExpectedConditions.visibilityOfElementLocated(By.cssSelector("#rankPanel div h4")));
			home = new HomePage_StarMeUp(driver);
		}
		catch(Exception e){
			e.printStackTrace();
		}
		
	}

}
