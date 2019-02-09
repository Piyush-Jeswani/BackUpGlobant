package com.glo.testone;


import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.testng.*;
//import org.testng.annotations.BeforeTest;
//import org.testng.annotations.Test;
import org.testng.annotations.*;

public class TestingSauceOne {

	WebDriver driver = new ChromeDriver();
	@BeforeTest
	public void checkBeforeTest(){
		
		driver.get("http://www.facebook.com");
		driver.manage().window().maximize();
		driver.quit();
	}
	@Test
	public void checkFirst(){
		driver.get("http://www.facebook.com");
		driver.manage().window().maximize();
		driver.quit();
	}
}
