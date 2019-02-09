package root;

import org.testng.annotations.BeforeTest;

import Utility.ReadProperty;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.PageFactory;
import org.testng.annotations.AfterTest;

public class TestBase {
	
	public static WebDriver driver;
	
	/*public TestBase(WebDriver driver){
		this.driver=driver;
		
	}*/
	
	@BeforeTest
	public void Setup(){
		
		System.setProperty("webdriver.chrome.driver","D:\\Softwares\\selenium\\chromedriver_win32\\chromedriver.exe");
		driver = new ChromeDriver();
		//driver.manage().window().maximize();
		PageFactory.initElements(driver, this);
		ReadProperty p = new ReadProperty();
		driver.get(p.getMePropertyFile().getProperty("URL"));
	}
	
	@AfterTest
	public void TearDown(){
		driver.quit();
	}

}
