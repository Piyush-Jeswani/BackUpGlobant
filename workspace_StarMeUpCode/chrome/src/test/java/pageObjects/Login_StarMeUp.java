package pageObjects;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.testng.annotations.Test;




public class Login_StarMeUp {
	WebDriver driver;
	
	@FindBy(css="#gSignInWrapper")
	private WebElement signInBtn;
	@FindBy(css ="#username")
	private WebElement userEmail;
	@FindBy(css=".btn.btn-login")
	private WebElement nextBtn;
	@FindBy(css ="#identifierId")
	private WebElement emailEnter;
	@FindBy(css="#identifierNext")
	private WebElement next;
	@FindBy(css="#password")
	private WebElement password;
	@FindBy(css="#passwordNext")
	private WebElement passwordNext;
	
	public Login_StarMeUp(WebDriver driver){
		this.driver = driver;
		
		PageFactory.initElements(driver, this);
	}
	
	
	public void userEmail(String str){
		userEmail.sendKeys(str);
	}
	public void clickLogin(){
		nextBtn.click();
	}
	
	public void enterEmail(String str){
		emailEnter.sendKeys(str);
	}
	
	public void clickEmailNext(){
		next.click();
	}
	public void enterPassword(String str){
		password.sendKeys(str);
	}
	public void clickPassNext(){
		passwordNext.click();
	}
	
	
	/*@Test
	public void first() {
		try{
			WebDriver driver;
			
			System.setProperty("webdriver.chrome.driver","D:\\Softwares\\selenium\\chromedriver_win32\\chromedriver.exe");
			driver = new ChromeDriver();
			driver.manage().window().maximize();		
			PageFactory.initElements(driver, this);
		driver.get("https://www.starmeup.com/login.html");
		Thread.sleep(2000);
		userEmail("piyush.jeswani@globant.com");
		clickLogin();
		}
		catch(Exception e) {
            e.printStackTrace();
        }
	}*/
	
	
	public void LoginStarMeup() throws InterruptedException{
		driver.get("https://www.starmeup.com/login.html");
		Thread.sleep(2000);
		userEmail("piyush.jeswani@globant.com");
		clickLogin();
	}
	
	

}
