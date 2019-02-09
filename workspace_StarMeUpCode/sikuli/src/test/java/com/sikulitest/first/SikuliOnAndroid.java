package com.sikulitest.first;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;

import org.junit.Test;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;
//import org.sikuli.api.Region;
import org.sikuli.script.FindFailed;
import org.sikuli.script.Match;
import org.sikuli.script.Pattern;
import org.sikuli.script.Screen;
import org.sikuli.script.Finder;

import io.appium.java_client.AppiumDriver;
import io.appium.java_client.AppiumDriver;
import io.appium.java_client.android.AndroidDriver;


public class SikuliOnAndroid {
	
	@Test
	public void testsikuli() {
		//Screen s = new Screen()
		
		
		/*Pattern signIn = new Pattern("D:\\workspace\\sikuli\\images\\signIn.PNG");
		Pattern email = new Pattern("D:\\workspace\\sikuli\\images\\emailID.PNG");
		//Pattern image2 = new Pattern("D:\\workspace\\sikuli\\images\\piyushJeswani.PNG");
		Pattern next = new Pattern("D:\\workspace\\sikuli\\images\\nextBtn.PNG");
		Pattern signInemail = new Pattern("D:\\workspace\\sikuli\\images\\signInBtn.PNG");
		Pattern pass = new Pattern("D:\\workspace\\sikuli\\images\\pass.PNG");
		Pattern mail = new Pattern("D:\\workspace\\sikuli\\images\\mail.PNG");*/
		
		/*System.setProperty("webdriver.chrome.driver","D:\\Softwares\\selenium\\chromedriver_win32\\chromedriver.exe");		
		WebDriver driver = new ChromeDriver();
		*/
		/*File app = new File("D:\\Meetags", "app-debug-2.1.0.apk");
		DesiredCapabilities capabilities = new DesiredCapabilities();
		capabilities.setCapability(CapabilityType.BROWSER_NAME, "");
		capabilities.setCapability("deviceName", "0244fe79504ed806");
		capabilities.setCapability("browserName", "Android");
		capabilities.setCapability(CapabilityType.VERSION, "6.0");
		capabilities.setCapability("platformName", "Android");
		capabilities.setCapability("appPackage", "com.globant.meetags.qa");
		capabilities.setCapability("appActivity", "com.globant.meetags.ui.activity.LoginActivity");//.activity
		capabilities.setCapability("app", "D:\\Meetags\\app-debug-2.1.0.apk");
		
		capabilities.setCapability("unicodeKeyboard", true);
		capabilities.setCapability("resetKeyboard", true);
		*/
		//AppiumDriver driver = new AppiumDriver(new URL("http://127.0.0.1:4723/wd/hub"), capabilities);
		
		/*Pattern pattern = new Pattern("E:\\Aadhar\\Aadhaar_piyushJeswani.JPG");
		Pattern pattern1 = new Pattern("E:\\Aadhar\\Aadhaar_piyushJeswani - Copy.JPG");
		
		Screen screen = new Screen();
		Match pass = screen.exists(pattern1);
		
		System.out.println(pass);
		if (screen.exists(pattern1) != null) {
		     System.out.println("true");
		}
		else{
		         System.out.println("false");
		}*/
		try {
			
			Pattern aadhar1 = new Pattern("E:\\Aadhar\\Aadhaar_piyushJeswani.JPG");
			Pattern aadhar2 = new Pattern("E:\\Aadhar\\Aadhaar_piyushJeswani - Copy.JPG");
			Finder f = new Finder(aadhar1.getImage());
			f.find(aadhar2);
			if (f.hasNext()){
				Match m = f.next();
				System.out.println("Match found with "+(m.getScore())*100+"%");
				f.destroy();
			}
			else{
				System.out.println("No Match Found");
			}
		}
		catch(Exception e){
			System.out.println(e.getMessage());
		}
		/*String img1 = "E:\\Aadhar\\Aadhaar_piyushJeswani.JPG";
		
		Finder f = new Finder(img1);
		f.find("E:\\Aadhar\\Aadhaar_piyushJeswani - Copy.JPG");
		while(f.hasNext()){

			 System.out.println("found");
			 Match m= f.next();
			 f.destroy();
			}
		}
		catch(Exception e){
			System.out.println("inside exception");
			e.printStackTrace();
		}*/
		
		
		
		
			/*driver.manage().window().maximize();
			driver.get("https://in.yahoo.com//");
			s.wait(signIn, 5);
			s.click(signIn);
			//s.click(email);
			s.wait(email, 10);
			s.type(email,"jeswani.piyush");
			s.click(next);
			//s.click(pass);
			s.wait(pass1, 5);
			s.type(pass1,"23mar=bb");
			s.click(signInemail);
			s.click(mail);
			
			
			Region reg = (Region) new Screen();
			Pattern p = new Pattern("someImage.png");
			//Match m = reg.find(p);
*/	}

}
