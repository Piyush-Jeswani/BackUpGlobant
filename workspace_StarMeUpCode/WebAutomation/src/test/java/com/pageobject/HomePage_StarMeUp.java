package com.pageobject;

import java.util.ArrayList;
import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;




public class HomePage_StarMeUp{
	
WebDriver driver;
	
	public HomePage_StarMeUp(WebDriver driver){
		this.driver=driver;
		PageFactory.initElements(driver, this);
		
	}
	

	@FindBy(id="email")
	private WebElement useremail;
	@FindBy(css = "#rankPanel div h4")
	private WebElement topStarsHeading;
	@FindBy(css = "#rankPanel div .position")
	private List<WebElement> topStars;
	@FindBy(css=".media-body.name-comment.break-word .media-heading")
	private List<WebElement> topStarNames;
	@FindBy(css=".position .media-left.pic-small")
	private List<WebElement> topStarPicture;
	@FindBy(css=".personal-user-information .user-info .user-name-lname")
	private WebElement starName;
	@FindBy(css=".give-star-box.js-giveStar")
	private List<WebElement> categories;
	@FindBy(css=".give-star-box.js-giveStar .star-text-cont")
	private List<WebElement> categoryNames;
	@FindBy(css ="#selectedValueSection #selectedStarLabel")
	private WebElement popUpSelectedCategoryLabel;
	@FindBy(css=".media-body.name-comment .bold")
	private WebElement popUpStarName;
	@FindBy(css="#comments")
	private WebElement popUpComments;
	@FindBy(css="#innerfileupload")
	private WebElement popUpFileUpload;
	@FindBy(css="#saveBtn")
	private WebElement popUpSaveBtn;
	@FindBy(css=".new-panel .comment span")
	private List<WebElement> commentOnCards;
	
	
	
	public void clickImageUploadOnPopUp(){
		popUpFileUpload.click();
	}
	
	public String getTextOfTopStarsHeading(){
		return topStarsHeading.getText();
	}
	
	public String readTrendingHashtags(){
		return null;
	}
	
	public ArrayList getListOfNamesOfTopStars(){
		ArrayList<String> list = new ArrayList<String>();
		for (WebElement ele:topStarNames){
			list.add(ele.getText());
		}
		return list;
	}
	
	public void clickSpecificTopStar(String str){
		WebDriverWait wait = new WebDriverWait(driver, 20);		 
		wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("#rankPanel div h4")));
		int count =0;
		for (WebElement ele:topStarNames){	
			if (ele.getText().contains(str)){				
				topStarPicture.get(count).click();
				break;
				}
			count++;
		}
	}
	
	public ArrayList getListOfCategories(){
		ArrayList<String> list = new ArrayList<String>();
		for (WebElement ele:categoryNames){
			list.add(ele.getText());
		}
		return list;
	}
	
	public void clickSpecificCategory(String str){
		int count =0;
		for(WebElement ele:categoryNames){
			System.out.println(ele.getText());
			if (ele.getText().contains(str)){
				System.out.println("Inside IF");
				categories.get(count).click();
				break;
				}
			count++;
		}
	}
	
	public boolean validateStarNameInProfileDisplayed(String str){
		if (starName.getText().contains(str))
			return true;
		else
			return false;
	}
	
	public void enterCommentForStar(String str){
		popUpComments.sendKeys(str);
	}
	
	public void clickSaveBtnPopUp(){
		popUpSaveBtn.click();
	}
	
	public String readCommentOnCard(){
		return (commentOnCards.get(0).getText());
	}
	
	/*public boolean iSHomePageLoaded(){
		if (topStarsHeading.isDisplayed())
			return true;
		else
			return false;
	}*/
	
	public WebElement getTopStarsHeading(){
		return topStarsHeading;
	}
	//Whole profile of user is populated 
	//Pop up window 
	//Comment in pop up window should appear on page\Activity Feed 
	//Notification should only go to that user
	
	
	/*@Test
	public void first(){
		WebDriver driver;
		System.setProperty("webdriver.chrome.driver","D:\\Softwares\\selenium\\chromedriver_win32\\chromedriver.exe");
		driver = new ChromeDriver();
		driver.manage().window().maximize();
		driver.get("https://www.starmeup.com/login.html");
		
	}*/

}
