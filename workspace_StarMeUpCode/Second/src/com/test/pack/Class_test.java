package com.test.pack;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.testng.annotations.Test;

import java.net.MalformedURLException;
import java.net.URL;

public class Class_test {
	
	public static final String URL = "https://" + "Piyush-Jeswani" + ":" + "89ec7a2f-9100-47ed-ba0d-1ac9969724b7" + "@ondemand.saucelabs.com:443/wd/hub";
	 
	
	@Test(groups ={"Car"})
	public void dofirst() throws Exception{
		System.setProperty("webdriver.chrome.driver","D:\\Softwares\\selenium\\chromedriver_win32\\chromedriver.exe");
		WebDriver driver = new ChromeDriver();
		DesiredCapabilities caps = DesiredCapabilities.chrome();
		caps.setCapability("platform", "Windows 7");
		caps.setCapability("version", "38.0");
		driver = new RemoteWebDriver(new URL(URL), caps);
		driver.get("http://www.facebook.com");
		System.out.println("title of page is: " + driver.getTitle());
		driver.quit();
	}
	
	@Test(groups = {"Scooter"})
	public void runSecondTest() throws Exception{
		System.setProperty("webdriver.chrome.driver","D:\\Softwares\\selenium\\chromedriver_win32\\chromedriver.exe");
		WebDriver driver = new ChromeDriver();
		DesiredCapabilities caps = DesiredCapabilities.chrome();
		caps.setCapability("platform", "Windows 7");
		caps.setCapability("version", "38.0");
		driver = new RemoteWebDriver(new URL(URL), caps);
		driver.get("http://www.facebook.com");
		System.out.println("title of page is: " + driver.getTitle());
		driver.quit();
	}
	
	@Test(groups = {"Car"})
	public void testGroupTest() throws Exception{
		System.setProperty("webdriver.chrome.driver","D:\\Softwares\\selenium\\chromedriver_win32\\chromedriver.exe");
		WebDriver driver = new ChromeDriver();
		DesiredCapabilities caps = DesiredCapabilities.chrome();
		caps.setCapability("platform", "Windows 7");
		caps.setCapability("version", "38.0");
		driver = new RemoteWebDriver(new URL(URL), caps);
		driver.get("http://www.facebook.com");
		System.out.println("title of page is: " + driver.getTitle());
		driver.quit();
	}

}
