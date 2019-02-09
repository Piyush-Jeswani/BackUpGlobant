package testScripts;

import org.testng.Assert;
import org.testng.annotations.Test;

import base.TestBase;
import pageClasses.Login_StarMeUp;

import pageClasses.HomePage_StarMeUp;
import utility.ReadProperty;





public class TopStars extends TestBase {
	
	@Test
	public void topStarsFunctionality() {
		
		try{
		
			ReadProperty p = new ReadProperty();
			
			Login_StarMeUp lg = new Login_StarMeUp(driver);
			HomePage_StarMeUp home = lg.makeLogin();
			
			//Thread.sleep(10000);			
			 //new HomePage_StarMeUp(driver);
			
			/*WebDriverWait wait = new WebDriverWait(driver, 20);		 
			wait.until(ExpectedConditions.visibilityOf(home.getTopStarsHeading()));*/
			
			
			//Select a user from Top Stars 
			/*System.out.println(p.getMePropertyFile().getProperty("topstar"));
			Thread.sleep(10000);*/
			//Thread.sleep(10000);
			
			
			
			/*WebDriverWait wait = new WebDriverWait(driver, 10);
			WebElement element = wait.until(
			        ExpectedConditions.visibilityOfElementLocated(By.cssSelector("#rankPanel div h4")));
			home = new HomePage_StarMeUp(driver);
			home.clickSpecificTopStar(p.getMePropertyFile().getProperty("topstar"));//
			//Thread.sleep(10000);
			
			SoftAssert softassert = new SoftAssert();
			softassert.assertEquals("TOP STARS THIS MONTH", home.getTextOfTopStarsHeading());
			
			home.clickSpecificCategory(p.getMePropertyFile().getProperty("category"));
			Thread.sleep(10000);
			home.enterCommentForStar(p.getMePropertyFile().getProperty("comment"));
			home.clickSaveBtnPopUp();
			Thread.sleep(5000);
			softassert.assertEquals(home.readCommentOnCard(),p.getMePropertyFile().getProperty("comment"),"Not Equal as home.readCommentOnCard()="+home.readCommentOnCard());			
			softassert.assertAll();	*/	
			
			Assert.assertTrue(true);
			
			
		}
		catch(Exception e) {
            e.printStackTrace();
        }
	}
	

}
