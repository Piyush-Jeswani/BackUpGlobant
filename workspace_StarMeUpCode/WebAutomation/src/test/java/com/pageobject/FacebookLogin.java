package com.pageobject;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.testng.annotations.Test;
import root.TestBase;





public class FacebookLogin extends TestBase{
	
	@FindBy(id="email")
	private WebElement useremail;
	
	@FindBy(id="pass")
	private WebElement password;
	
	
	public FacebookLogin(WebDriver driver){
		this.driver=driver;
	}
	
	@Test
	public void first(){
		driver.get("https://www.facebook.com/");
		useremail.sendKeys("piyushjes@gmail.com");
		password.sendKeys("13apr=home");
		
		
		
		
		driver.findElement(By.id("loginbutton")).click();
	}

}
