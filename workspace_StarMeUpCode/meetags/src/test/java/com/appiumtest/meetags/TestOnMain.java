package com.appiumtest.meetags;

import java.io.File;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

import org.apache.commons.io.FileUtils;
import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.Keys;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Action;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;

import io.appium.java_client.AppiumDriver;
import io.appium.java_client.TouchAction;
import io.appium.java_client.android.AndroidDriver;
import org.sikuli.script.FindFailed;
import org.sikuli.script.Pattern;
import org.sikuli.script.Screen;

//import com.android.dx.rop.cst.CstArray.List;
//import com.android.dx.util.FileUtils;

public class TestOnMain {
	private static AppiumDriver driver;

	public static void main(String[] args) throws MalformedURLException, Exception {
		// TODO Auto-generated method stub
		
		String str = "Testing&1";
		File app = new File("D:\\Meetags", "app-debug-2.1.0.apk");
		DesiredCapabilities capabilities = new DesiredCapabilities();
		capabilities.setCapability(CapabilityType.BROWSER_NAME, "");//TA9330B8XY
		capabilities.setCapability("deviceName", "TA9330B8XY");//2b8bc6377d34 //Nexus : 0244fe79504ed806 
		capabilities.setCapability("browserName", "Android");
		capabilities.setCapability(CapabilityType.VERSION, "6.0");
		capabilities.setCapability("platformName", "Android");
		capabilities.setCapability("appPackage", "com.globant.meetags.qa");
		capabilities.setCapability("appActivity", "com.globant.meetags.ui.activity.LoginActivity");//.activity
		capabilities.setCapability("app", "D:\\Meetags\\app-debug-2.1.0.apk");
		
		capabilities.setCapability("unicodeKeyboard", true);
		capabilities.setCapability("resetKeyboard", true);
		
		driver = new AppiumDriver(new URL("http://127.0.0.1:4723/wd/hub"), capabilities);
		driver.manage().timeouts().implicitlyWait(20, TimeUnit.SECONDS);
		//driver = new AndroidDriver(new URL("http://127.0.0.1:4723/wd/hub"), capabilities);
		
		//Screen s = new Screen();
		/*Pattern signIn = new Pattern("D:\\workspace\\sikuli\\images\\appium\\LogIn.PNG");
		s.click(signIn);*/
		
		
		
		/*System.out.println(s.getNumberScreens());
		System.out.println(s.getPrimaryScreen());
		System.out.println(s.getPrimaryId());*/
		//System.out.println(s.);
		
		//System.out.println(" s.capture()--> "+s.capture());
		
		//s.click(signIn);
		
		//s.set
		/*File srcFiler=((TakesScreenshot)driver).getScreenshotAs(OutputType.FILE);
		FileUtils.copyFile(srcFiler, new File("D:\\workspace\\sikuli\\images\\appium\\screenshot1_home.png"));
		*/
		driver.findElementById("com.globant.meetags.qa:id/fragment_login_edit_text_identification").sendKeys("user33@qastarmeup.com");
		try {
            driver.hideKeyboard();
            } catch (Exception e) {
            }
		
		driver.findElementById("com.globant.meetags.qa:id/text_input_password_toggle").click();
		
		
		WebElement element =  driver.findElementById("com.globant.meetags.qa:id/fragment_login_edit_text_password");
		
	
		element.sendKeys("Testing&1");
		
		try {
            driver.hideKeyboard();
            } catch (Exception e) {
            }
		driver.findElementById("com.globant.meetags.qa:id/fragment_login_button_login").click();
		
		//Here try SCROLL
		/*Dimension dimensions = driver.manage().window().getSize();
		Double screenHeightStart = dimensions.getHeight() * 0.5;
		int scrollStart = screenHeightStart.intValue();
		
		Double screenHeightEnd = dimensions.getHeight() * 0.2;
				int scrollEnd = screenHeightEnd.intValue();
				driver.swipe(0,scrollStart,0,scrollEnd,1000);*/
		try{
			driver.wait(5000);
			List<WebElement> list = driver.findElements(By.id("com.globant.meetags.qa:id/list_item_post_main_image_square"));
			//com.globant.meetags.qa:id/list_item_feed_view_content
			//com.globant.meetags.qa:id/list_item_post_main_image_square
			System.out.println(list.size());
			//list.get(2);
			//driver.scrollTo(list.get(2));
			//((AppiumDriver) driver).scrollToExact("Text");
			
			int x = list.get(1).getLocation().getX();
			int y = list.get(1).getLocation().getY();
			TouchAction action = new TouchAction(driver);
			action.press(x,y).moveTo(x+90,y).release().perform(); 
			
		}
		catch(Exception e){
			
		}
		
				
				
				
		//NEW FLOW 
				
		try{
			
		//com.globant.meetags.qa:id/list_item_feed_view_content
		driver.findElement(By.id("com.globant.meetags.qa:id/list_item_feed_view_content")).click();
		}
		catch(NoSuchElementException e){
			driver.findElement(By.id("com.globant.meetags.qa:id/list_item_post_main_image_square")).click();
		}
		
		driver.findElement(By.id("com.globant.meetags.qa:id/fragment_post_detail_main_image")).click();
		
		File srcFiler=((TakesScreenshot)driver).getScreenshotAs(OutputType.FILE);
		FileUtils.copyFile(srcFiler, new File("D:\\workspace\\sikuli\\images\\appium\\Image_Clicked_1.png"));
		
		driver.findElement(By.id("com.globant.meetags.qa:id/fragment_fullscreen_photo_close")).click();
		driver.findElement(By.id("com.globant.meetags.qa:id/view_header_view_back_button")).click();
		
		
		
		
		
		
		
		
		
		driver.findElementById("com.globant.meetags.qa:id/view_bottom_navigation_image_view_5").click();
		driver.findElementById("com.globant.meetags.qa:id/fragment_menu_events").click();
		
		driver.findElementById("com.globant.meetags.qa:id/view_header_view_custom_action").click();
		driver.findElementById("com.globant.meetags.qa:id/fragment_view_why").click();
		
		driver.findElementById("com.globant.meetags.qa:id/fragment_section_why_title").sendKeys("Testing");
		driver.hideKeyboard();
		driver.findElementById("com.globant.meetags.qa:id/fragment_section_why_description").sendKeys("Testing Desc");
		//driver.findElementById("com.globant.meetags.qa:id/fragment_section_why_ok").click();
		driver.findElementById("com.globant.meetags.qa:id/fragment_give_star_section_why_text_view_main_image").click();
		
		
		/*Screen s = new Screen();
		
		Pattern signIn = new Pattern("D:\\workspace\\sikuli\\images\\appium\\image_1.PNG");
		s.click(signIn);*/
		/*File srcFiler=((TakesScreenshot)driver).getScreenshotAs(OutputType.FILE);
		FileUtils.copyFile(srcFiler, new File("D:\\workspace\\sikuli\\images\\appium\\screenshot1.png"));
		*/
		/*Screen s = new Screen();
		System.out.println(s.getNumberScreens());*/
		
		/*s = new Screen();
		Pattern signIn = new Pattern("D:\\workspace\\sikuli\\images\\appium\\ImageSelect.PNG");
		s.click(signIn);*/
		//List<WebElement> listt =  driver.findElementsById("com.globant.meetags.qa:id/iv_thumbnail");
		//driver.findElementsById("com.globant.meetags.qa:id/iv_thumbnail").get(4);
		
		
		/*File srcFiler=((TakesScreenshot)driver).getScreenshotAs(OutputType.FILE);
		FileUtils.copyFile(srcFiler, new File("D:\\workspace\\sikuli\\images\\appium\\Image_Chosen_NewEvent.png"));
		*/
		//Clicking the image to create event
		List<WebElement> lst = driver.findElements(By.id("com.globant.meetags.qa:id/iv_thumbnail"));
		lst.get(3).click();
		
		
		
		
		//driver.findElementById("com.globant.meetags.qa:id/iv_thumbnail").click();
		
		//com.android.camera2:id/shutter_button
		
		
		
		driver.findElementById("com.globant.meetags.qa:id/crop_image_menu_crop").click();
		driver.findElementById("com.globant.meetags.qa:id/fragment_section_why_ok").click();
		
		
		//where 
		driver.findElementById("com.globant.meetags.qa:id/fragment_view_where").click();
		
		//When
		
		driver.findElement(By.id("com.globant.meetags.qa:id/fragment_view_when")).click();
		//Start Date 
		driver.findElement(By.id("com.globant.meetags.qa:id/fragment_section_when_start_date")).click();
		//ok on calendar 
		driver.findElement(By.id("com.globant.meetags.qa:id/ok"));
		//Time
		driver.findElement(By.id("com.globant.meetags.qa:id/minutes"));
		WebElement ele = driver.findElement(By.id("com.globant.meetags.qa:id/time_picker"));
		//ele.getAttribute(name)
		
		
		
		
		
		
		

	}

}
