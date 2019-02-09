package pageClasses;

import static org.testng.Assert.expectThrows;

import java.util.ArrayList;
import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;

public class HomePage_StarMeUp {
	
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
	@FindBy(css=".nav.navbar-nav.navbar-right.icovar .dropdown.js-notifications.navbar-right-side .alert-msj")
	private WebElement notificationAlert;
	@FindBy(css=".nav.navbar-nav.navbar-right.icovar .dropdown.js-notifications.navbar-right-side .fa.fa-bell.fa-1x")
	private WebElement notificationBellIcon;
	@FindBy(css="#generalSearchInput")
	private WebElement searchBar;
	@FindBy(css=".tt-dropdown-menu")
	private WebElement dropDownUserNames;
	@FindBy(css="#hashtagPanel")
	private WebElement divUserName;
	@FindBy(css=".block.col-lg-4.right")
	private WebElement firstRightBlock;
	@FindBy(css="giveStarFromProfile")
	private WebElement giveStarFromProfileBtn;
	@FindBy(css="#organizationValuesSection .give-star-title")
	private WebElement popWindowLabel;
	@FindBy(css="#organizationValuesSection .category-star .give-star-box.js-giveStar")
	private List<WebElement> categoriesPopUp;
	@FindBy(css="#organizationValuesSection .category-star .give-star-box.js-giveStar span")
	private List<WebElement> categoriesPopUpText;
	@FindBy(css="#fileUploadSelector a span")
	private WebElement uploadImage;
	@FindBy(css="#trendingPanel")
	private WebElement trendingHashtagPanel;
	@FindBy(css="#trendingPanel .list-group li div p")
	private List<WebElement> trendingHashtagsData;
	@FindBy(css=".time")
	private List<WebElement> timeOfEachActivity;
	@FindBy(css=".user .center.left")
	private List<WebElement> leftSideUSer;
	
	public boolean isTrendingHashTagPresent(){
		return trendingHashtagPanel.isDisplayed();
	}
	
	public int[] getTheHashTagValues(){
		int[] arr = new int[trendingHashtagsData.size()];
		int count =0;
		//String temp = null;
		for (WebElement ele : trendingHashtagsData){			
			arr[count++] = Integer.parseInt(ele.getText().split(" ")[0]);
		}
		return arr;
	}
	
	public boolean validateHashTagsAreinDescendingOrder(){
		int[] data = getTheHashTagValues();
		for (int i = 0; i < data.length-1; i++) {
		    if (data[i] < data[i+1]) {
		        return false;
		    }
		}
		return true;
		
	}
	
	public void clickUploadImageBtnOnPopUpWindow(){
		uploadImage.click();
	}
	
	public String getSelectedCategoryName(){
		return popUpSelectedCategoryLabel.getText();
	}
	
	public void selectCategoryByName(String str){
		for (WebElement ele : categoriesPopUpText){
			if (ele.getText().equalsIgnoreCase(str)){ele.click(); }
		}
	}
	
	
	public boolean validateAllcategoriesOnPopUpWindowArePresent(){
		if(categoriesPopUpText.get(1).getText().equalsIgnoreCase("Think big en update") && categoriesPopUpText.get(2).getText().equalsIgnoreCase("Act ethically en") && categoriesPopUpText.get(3).getText().equalsIgnoreCase("Constantly Innovate en") && categoriesPopUpText.get(4).getText().equalsIgnoreCase("Aim for excellence in your work en")
				&& categoriesPopUpText.get(5).getText().equalsIgnoreCase("Have Fun en") && categoriesPopUpText.get(6).getText().equalsIgnoreCase("Team Player en")){
			return true;			
		}
		else
			return false;
	}
	
	
	public boolean validateTheLabelOnPopUpWindow(){
		if (popWindowLabel.getText().equalsIgnoreCase("Select a star to give"))
			return true;
		else 
			return false;
	}
	
	public void clickGiveStarBtnFromProfile(){
		giveStarFromProfileBtn.click();
	}
	
	//Please confirm this for user profile
	public void clickFirstRightBlock(){
		firstRightBlock.click();
	}
	
	public boolean divContainsUserName(String str){
		if (divUserName.getText().contains(str))
			return true;
		else
			return false;
	}
	
	public void selectUserFromDropDown(String str){
		Select s = new Select(dropDownUserNames);
		s.selectByValue(str);
	}
	
	public void searchNameInSearchBar(String str){
		searchBar.sendKeys(str);
	}
	
	public String getNumberofNotification(){
		if(notificationAlert.isDisplayed()){
			return notificationAlert.getText();
		}
		else
			return null;
	}
	
	public void clickNotificationIcon(){
		if(notificationBellIcon.isDisplayed()){
			notificationBellIcon.click();
		}	
	}
	
	
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

}
