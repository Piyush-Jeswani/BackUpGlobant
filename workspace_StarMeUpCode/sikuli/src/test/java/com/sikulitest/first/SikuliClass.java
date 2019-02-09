package com.sikulitest.first;

import java.awt.Dimension;
import java.awt.image.BufferedImage;

import org.junit.Test;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.sikuli.script.FindFailed;
import org.sikuli.script.Pattern;
import org.sikuli.script.Screen;
//import org.sikuli.api.Screen;

public class SikuliClass {

	
	
	
	@Test
	public void testsikuli() throws FindFailed{
		Screen s = new Screen();
		
		
		Pattern signIn = new Pattern("D:\\workspace\\sikuli\\images\\signIn.PNG");
		Pattern email = new Pattern("D:\\workspace\\sikuli\\images\\emailID.PNG");
		//Pattern image2 = new Pattern("D:\\workspace\\sikuli\\images\\piyushJeswani.PNG");
		Pattern next = new Pattern("D:\\workspace\\sikuli\\images\\nextBtn.PNG");
		Pattern signInemail = new Pattern("D:\\workspace\\sikuli\\images\\signInBtn.PNG");
		Pattern pass = new Pattern("D:\\workspace\\sikuli\\images\\pass.PNG");
		Pattern mail = new Pattern("D:\\workspace\\sikuli\\images\\mail.PNG");
		
		System.setProperty("webdriver.chrome.driver","D:\\Softwares\\selenium\\chromedriver_win32\\chromedriver.exe");
		//driver = new ChromeDriver();
		WebDriver driver = new ChromeDriver();
			driver.manage().window().maximize();
			driver.get("https://in.yahoo.com//");
			s.wait(signIn, 5);
			s.click(signIn);
			//s.click(email);
			s.wait(email, 10);
			s.type(email,"jeswani.piyush");
			s.click(next);
			//s.click(pass);
			s.wait(pass, 5);
			s.type(pass,"23mar=bb");
			s.click(signInemail);
			s.click(mail);
	}
	
}
