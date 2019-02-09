package pageClasses;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.testng.annotations.Test;

import pageClasses.HomePage_StarMeUp;
import utility.ReadProperty;




public class Login_StarMeUp {
	
	WebDriver driver;
	HomePage_StarMeUp hme;
	
	public Login_StarMeUp(WebDriver driver){
		this.driver=driver;
		PageFactory.initElements(driver, this);
		
	}
	
	
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
	
	@FindBy(css=".not-mobile.li_media")
	public WebElement loginBtnQA;
	
	@FindBy(id="loginInputBtn")
	private WebElement loginPassQA;
	
	
	
	
	
	
	
	/*public WebDriver clickSignInBtn(){
		signInBtn.click();
		return driver;
	}*/
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
		/*WebDriverWait wait = new WebDriverWait(driver, 10);		 
		 WebElement element = wait.until(ExpectedConditions.visibilityOf(password));*/
		password.sendKeys(str);
	}
	public void clickPassNext(){
		passwordNext.click();
	}
	
	public void clickLoginBtnQA(){
		 /*WebDriverWait wait = new WebDriverWait(driver, 10);		 
		 WebElement element = wait.until(ExpectedConditions.elementToBeClickable(loginBtnQA));*/
		 loginBtnQA.click();
	}
	
	public void userEmailQA(String str){
		/*WebDriverWait wait = new WebDriverWait(driver, 10);		 
		wait.until(ExpectedConditions.visibilityOf(userEmail));//WebElement element =//.visibilityOf(userEmail) 
*/		userEmail.sendKeys(str);
	}
	public void clickLoginBtnPassQA(){
		/*WebDriverWait wait = new WebDriverWait(driver, 10);		 
		 WebElement element = wait.until(ExpectedConditions.elementToBeClickable(loginPassQA));*/
		
		loginPassQA.click();
	}
	
	
	public HomePage_StarMeUp makeLogin(){
		try{	
			ReadProperty p = new ReadProperty();
			//p.getMePropertyFile().getProperty("URL")
			//https://qa.starmeup.com/landing.html
			clickLoginBtnQA();
			userEmailQA(p.getMePropertyFile().getProperty("useremail"));//user32@qastarmeup.com//p.getMePropertyFile().getProperty("useremail")
			nextBtn.click();
			Thread.sleep(3000);
			enterPassword(p.getMePropertyFile().getProperty("password"));
			clickLoginBtnPassQA();
			return hme;
		}
		catch(Exception e){
			e.printStackTrace();
			return null;
		}
	}
	
	
	
	
	//@Test(dataProvider="SearchProvider",dataProviderClass=DataproviderClass.class)
	/*@Test
	public void first(String author,String searchKey) {
		try{	
			System.setProperty("webdriver.chrome.driver","D:\\Softwares\\selenium\\chromedriver_win32\\chromedriver.exe");
			driver = new ChromeDriver();
			//driver.manage().window().maximize();
			PageFactory.initElements(driver, this);
			ReadProperty p = new ReadProperty();
			driver.get(p.getMePropertyFile().getProperty("URL"));
			//ReadProperty p = new ReadProperty();
		driver.get("https://qa.starmeup.com/landing.html");
		Thread.sleep(2000);
		clickLoginBtnQA();
		userEmailQA(author);
		
		nextBtn.click();
		Thread.sleep(3000);
		enterPassword(searchKey);
		clickLoginBtnPassQA();
		//userEmail("piyush.jeswani@globant.com");
		clickLogin();
		}
		catch(Exception e) {
            e.printStackTrace();
        }
	}*/

}
