package com.pageobject;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.FindBy;
import org.testng.annotations.BeforeTest;
import org.testng.annotations.Test;

import com.starmeup.WebAutomation.ReadPropertyFile;

/*@FindBy(css="")
private WebElement topofstar;*/

public class TopStarThisMonth {
	private WebDriver driver;
	private ReadPropertyFile read;

	@BeforeTest
	public void Setup(){
		System.setProperty("webdriver.chrome.driver","D:\\Softwares\\selenium\\chromedriver_win32\\chromedriver.exe");
		driver = new ChromeDriver();
		driver.manage().window().maximize();
		
	}
	@Test
	public void firstTest(){
		
		driver.get(read.getURL());
		
	}
}
