package testScripts;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.annotations.Test;

import base.TestBase;
import pageClasses.HomePage_StarMeUp;
import pageClasses.Login_StarMeUp;
import utility.ReadProperty;





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
			String no_of_notif = home.getNumberofNotification();
			home.clickNotificationIcon();
			//Click again to make it dissappear
			home.clickNotificationIcon();
			Assert.assertFalse(home.getNumberofNotification().equals(no_of_notif));
		}
		catch(Exception e){
			e.printStackTrace();
		}
		
	}

}
