package com.pm.pages.PDPLaylist;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;

import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;

import com.pm.pages.common.BasePage;

public class PDPlaylistPage extends BasePage{
	
	private Participant participant = null;
	private Course course = null;
	private Discussion discussion = null;
	private Notification notification = null;
	
	public Participant participant() {
		return participant;
	}
	
	public Course course() {
		return course;
	}
	
	public Discussion discussion() {
		return discussion;
	}
	
	public Notification notification() {
		return notification;
	}
	@FindBy(css = ".tnlf-create-plc")
	private WebElement createPlaylistButton;
	
	public PDPlaylistPage() {
		super();
		participant = new Participant();
		course = new Course();
		discussion = new Discussion();
		notification = new Notification();
	}
	
	@FindBy(name = "plcPlanName")
	private WebElement playlistTitle;
	
	@FindBy(css = ".tnlf-add-plc-plan-button")
	private WebElement createButton;
	
	@FindBy(css = ".pmf-add-moderator")
	private WebElement addModerator;
	
	@FindBy(name = "startDate")
	private WebElement startDate;
	
	@FindBy(name = "endDate")
	private WebElement endDate;
	
	@FindBy(xpath = "//button[text()='Add Moderator(s)']")
	private WebElement addModerators;
	
	@FindBy(className = "tnlf-permanent-grid-search")
	private WebElement playlistSearchInput;
	
	@FindBy(xpath = "//iframe[@id='pmf-description-textarea_ifr']")
	private WebElement description;
	
	@FindBy(xpath = "//body[@id='tinymce']/p")
	private WebElement descriptionBody;
	
	@FindBy(id = "ui-id-1")
	private WebElement createPlaylistTitle;
	
	@FindBy(css = ".tnlf-cancel-plc-plan-button")
	private WebElement cancelButton;
	
	@FindBy(className = "pm-back-link-text")
	private WebElement backToDashboard;
	
	@FindBy(css = ".tnlf-delete-plc-plan-button")
	private WebElement deletePlaylist;
	
	@FindBy(css = ".btn-danger.boot-btn")
	private WebElement deleteButton;
	
	@FindBy(name = "activateCredits")
	private WebElement creditTransportCheckbox;
	
	@FindBy(css = ".tnlf-submit-for-approval")
	private WebElement submitApproval;
	
	@FindBy(xpath = "//div[@class='modal-content']//button[text()='Submit']")
	private WebElement submitButton;
	
	public void clickCreatePlayList() {
		clickElementByJSExecutor(createPlaylistButton);
		waitForJSandJQueryToLoad();
	}
	
	public void createPlaylist(String playlistName) {
		clickCreatePlayList();
		playlistTitle.clear();
		playlistTitle.sendKeys(playlistName);
		clickElementByJSExecutor(createButton);
		waitForJSandJQueryToLoad();
	}
	
	public void clickAddModerator() {
		clickElementByJSExecutor(addModerator);
		waitForJSandJQueryToLoad();
	}
	
	public List<String> getUserList() {
		List<WebElement> userNames = driver.findElements(By.xpath("//div[@class='modal-content']//table[@class='tnl-table tnlf-table table-striped']//td[2]"));
		List<String> userNameList = new ArrayList<String>();
		
		for (WebElement string : userNames) {
			userNameList.add(string.getText());
		}
		waitForJSandJQueryToLoad();
		return userNameList;
	}
	
	public boolean compareList(List<String> list1,List<String> list2) {
		return list2.equals(list1);
	}
	
	public void addModerator() {
		waitForJSandJQueryToLoad();
		List<WebElement> userCheckList = driver.findElements(By.xpath("//div[@class='modal-content']//input[@name='moderatorId']"));
		
		for (WebElement webElement : userCheckList) {
			clickElementByJSExecutor(webElement);
			waitForJSandJQueryToLoad();
		}
		waitForJSandJQueryToLoad();
		clickElementByJSExecutor(addModerators);
		waitForJSandJQueryToLoad();
	}
	
	public void addSingleModerator(String firstname,String lastname) {
		String userCheck = String.format("//div[@class='modal-content']//td[text()='%s, %s']/preceding-sibling::td/input[@name='moderatorId']", lastname,firstname);
		WebElement userCheckBox = driver.findElement(By.xpath(userCheck));
		clickElementByJSExecutor(userCheckBox);
		waitForJSandJQueryToLoad();
		clickElementByJSExecutor(addModerators);
		waitForJSandJQueryToLoad();
	}
	public boolean isDeleteIconDisplayedForMultiUsers(String firstName,String lastName) {
		boolean flag = false;
		List<WebElement> userNames = driver.findElements(By.xpath("//table[@class='tnl-table tnlf-table table-striped']//td[2]"));
		for (WebElement webElement : userNames) {
			if(!webElement.getText().equals(lastName+", "+firstName)) {
				String deleteIcon = String.format("//td[text()='%s']/preceding-sibling::td/div[@class='pm-icon-md removeModerator']", webElement.getText());
				WebElement deleteButton = driver.findElement(By.xpath(deleteIcon));
				if(deleteButton.isDisplayed()) {
					flag = true;
				}
				else {
					flag = false;
					break;
				}
			}
			
		}
		return flag;
	}
	
	public boolean isDeleteIconForSingleUser(String firstName,String lastName) {
		String user = String.format("//table[@class='tnl-table tnlf-table table-striped']//td[text()='%s, %s']/preceding::td[text()='--']", lastName,firstName);
		WebElement userDelete = driver.findElement(By.xpath(user));
		return userDelete.isDisplayed();
	}
	
	public void deleteModerator(String name) {
		String userDeleteIcon = String.format("//td[text()='%s']/preceding-sibling::td/div[@class='pm-icon-md removeModerator']", name);
		WebElement userDelete = driver.findElement(By.xpath(userDeleteIcon));
		clickElementByJSExecutor(userDelete);
		waitForJSandJQueryToLoad();
	}
	
	public boolean verifyUserDeleted(String name) {
		String userName = String.format("//td[text()='%s']", name);
		return elementPresent(By.xpath(userName));
	}
	
	public List<String> getModeratorList() {
		List<WebElement> userList = driver.findElements(By.xpath("//table[@class='tnl-table tnlf-table table-striped']//div[@class='pm-icon-md removeModerator']/ancestor::td/following-sibling::td[1]"));
		List<String> userNameList = new ArrayList<String>();
		for (WebElement string : userList) {
			userNameList.add(string.getText());
		}
		
		return userNameList;
	}
	
	public void clickPlayList(String listName) {
		playlistSearchInput.clear();
		playlistSearchInput.sendKeys(listName+Keys.ENTER);
		waitForJSandJQueryToLoad();
		String playListName = String.format("//table[@class='tnl-table tnlf-table table-striped']//span[text()='%s']/ancestor::a", listName);
		WebElement playList = driver.findElement(By.xpath(playListName));
		wait.until(ExpectedConditions.elementToBeClickable(playList));
		clickElementByJSExecutor(playList);
		waitForJSandJQueryToLoad();
	}
	
	public boolean isPlaylistPresent(String listName) {
		playlistSearchInput.clear();
		playlistSearchInput.sendKeys(listName + Keys.ENTER);
		waitForJSandJQueryToLoad();
		String playListName = String.format("//table[@class='tnl-table tnlf-table table-striped']//span[text()='%s']/ancestor::a", listName);
		WebElement playList = driver.findElement(By.xpath(playListName));
		return playList.isDisplayed();
	}
	
	public void editPlayList(String desc,String sDate,String eDate) throws InterruptedException {
		driver.switchTo().frame(description);
		Actions action= new Actions(driver);
		wait.until(ExpectedConditions.visibilityOf(descriptionBody));
		action.moveToElement(descriptionBody).click().sendKeys(desc);
		action.build().perform();
		waitForJSandJQueryToLoad();
		driver.switchTo().defaultContent();
		
		startDate.sendKeys(sDate);
		waitForJSandJQueryToLoad();
		
		endDate.sendKeys(eDate);
		waitForJSandJQueryToLoad();
		
		clickElementByJSExecutor(driver.findElement(By.xpath("//button[text()='Save']")));
		waitForJSandJQueryToLoad();
	}
	
	public String getDescriptionText() {
		driver.switchTo().frame(description);
		return descriptionBody.getText();
	}
	
	public String getStartDate(){
		driver.switchTo().defaultContent();
		return startDate.getAttribute("value");
	}
	
	public String getEndDate(){
		return endDate.getAttribute("value");
	}
	
	public void clearDates() {
		startDate.sendKeys(Keys.chord(Keys.CONTROL, "a"), Keys.DELETE);
		endDate.sendKeys(Keys.chord(Keys.CONTROL, "a"), Keys.DELETE);
		clickElementByJSExecutor(driver.findElement(By.xpath("//button[text()='Save']")));
		waitForJSandJQueryToLoad();
	}
	public void clickTab(String tabLink) {
		String tab = String.format("//a[text()='%s']", tabLink);
		WebElement tabelement = driver.findElement(By.xpath(tab));
		clickElementByJSExecutor(tabelement);
		waitForJSandJQueryToLoad();
	}
	
	public boolean verifyTabIsActive(String tabLink) {
		String tab = String.format("//a[text()='%s']/ancestor::li", tabLink);
		WebElement tabActive = driver.findElement(By.xpath(tab));
		return tabActive.getAttribute("class").contains("active");
	}
	
	public boolean verifyListContains(List<String> list1, List<String> list2) {
		Collections.sort(list1);
		Collections.sort(list2);
		return list1.containsAll(list2);
	}
	
	public void switchBrowser() {
		 Set<String> handles = driver.getWindowHandles();
	}
	
	public String verifyCreatePlaylist() {
		return createPlaylistTitle.getText();
	}
	
	public boolean verifyCreatButtonPresent() {
		return elementPresent(By.cssSelector(".tnlf-add-plc-plan-button"));
	}
	
	public boolean verifyPlaylistIsPresent() {
		return elementPresent(By.name("plcPlanName"));
	}
	
	public void clickCancelButton() {
		clickElementByJSExecutor(cancelButton);
		waitForJSandJQueryToLoad();
	}
		
	public void goBackToPlaylistDashboard() {
		clickElementByJSExecutor(backToDashboard);
		waitForJSandJQueryToLoad();
	}
	
	public void deletePlaylist(String playlistTitle) {
		String playlist = String.format("//span[text()='%s']/ancestor::td/preceding-sibling::td/input", playlistTitle);
		if(elementPresent(By.xpath(playlist))) {
			clickElementByJSExecutor(driver.findElement(By.xpath(playlist)));
			clickElementByJSExecutor(deletePlaylist);
			clickElementByJSExecutor(deleteButton);
			waitForJSandJQueryToLoad();
		}
	}
	
	public void addCredits(String creditType,String value,String testwn,String testValue,String testValueNew) {
		creditTransportCheckbox.click();
		String credit = String.format("//td[contains(text(),'%s')]/following-sibling::td/input[@name='creditAreaCreditType_1_1']", creditType);
		WebElement valueInput = driver.findElement(By.xpath(credit));
		valueInput.sendKeys("12");
		
		credit = String.format("//td[contains(text(),'%s')]/following-sibling::td/input[@name='creditAreaCreditType_1_11']", creditType);
		WebElement testwnInput = driver.findElement(By.xpath(credit));
		testwnInput.sendKeys("12");
		
		credit = String.format("//td[contains(text(),'%s')]/following-sibling::td/input[@name='creditAreaCreditType_1_14']", creditType);
		WebElement testValueInput = driver.findElement(By.xpath(credit));
		testValueInput.sendKeys("12");
		
		credit = String.format("//td[contains(text(),'%s')]/following-sibling::td/input[@name='creditAreaCreditType_1_19']", creditType);
		WebElement testValueNewInput = driver.findElement(By.xpath(credit));
		testValueNewInput.sendKeys("12");
		
		submitApproval.click();
		submitButton.click();
		waitForJSandJQueryToLoad();
	}
	
	public List<String> verifyColumnsText(String playlistName, String columnHeader) {
		playlistSearchInput.clear();
		playlistSearchInput.sendKeys(playlistName + Keys.ENTER);
		waitForJSandJQueryToLoad();
		List<WebElement> columns = driver.findElements(By.xpath("//form[@class='tnlf-view-plc-plan-form']//table//th"));
		List<String> creditList = new ArrayList<String>();
		int size = columns.size();
		for (int i=0; i<size;i++) {
			String header = columns.get(i).getText().toLowerCase(); 
			if(header.equals(columnHeader)) {
				String showMoreLink = String.format("//td[%d]/ul/li/a[text()='Show More...']",i+1);
				WebElement headeColumn = driver.findElement(By.xpath(showMoreLink));
				headeColumn.click();
				String creditText = String.format("//td[%d]/ul/li", i+1);
				List<WebElement> credits =  driver.findElements(By.xpath(creditText));
				int count = credits.size()-1;
				for(int k=0;k <count;k++) {
					creditList.add(credits.get(k).getText());
				}
				break;
			}
		}
		return creditList;
	}
	
	public String verifyHeaderText(String playlistName, String columnHeader) {
		playlistSearchInput.clear();
		playlistSearchInput.sendKeys(playlistName + Keys.ENTER);
		waitForJSandJQueryToLoad();
		String headerValue = "";
		List<WebElement> columns = driver.findElements(By.xpath("//form[@class='tnlf-view-plc-plan-form']//table//th"));
		int size = columns.size();
		for (int i=0; i<size;i++) {
			String header = columns.get(i).getText().toLowerCase(); 
			if(header.equals(columnHeader)) {
				String headerText= String.format("//td[%d]",i+1);
				WebElement text = driver.findElement(By.xpath(headerText));
				headerValue = text.getText();
				break;
			}
		}
		return headerValue;
	}
	
	public class Participant extends BasePage {
		
		@FindBy(css = ".tnlf-add-participants-by-name-button")
		private WebElement addParticipantButton;
		
		@FindBy(css = ".tnlf-delete-participants")
		private WebElement removeParticipants;
		
		public void addParticipant(String linktext) {
			clickElementByJSExecutor(driver.findElement(By.xpath("//span[text()='Add Participants']/ancestor::button")));
			waitForJSandJQueryToLoad();
			String link = String.format("//span[text()='%s']/ancestor::a", linktext);
			clickElementByJSExecutor(driver.findElement(By.xpath(link)));
			waitForJSandJQueryToLoad();
			
			WebElement checkUser = driver.findElement(By.xpath("//table[@class='tnl-table tnlf-table table-striped']//tr[1]/td/input"));
			clickElementByJSExecutor(checkUser);
			waitForJSandJQueryToLoad();
			
			clickElementByJSExecutor(addParticipantButton);
			waitForJSandJQueryToLoad();
		}
		
		public boolean getParticipantListCount() {
			boolean flag = false;
			if(elementPresent(By.xpath("//table[@class='tnl-table tnlf-table table-striped']//td[2]"))) {
				flag = true;
			}
			else {
				flag = false;
			}
			return flag;
		}
		
		public void removeParticipants() {
			clickElementByJSExecutor(driver.findElement(By.xpath("//table[@class='tnl-table tnlf-table table-striped']/thead//th/input")));
			waitForJSandJQueryToLoad();
			
			clickElementByJSExecutor(removeParticipants);
			waitForJSandJQueryToLoad();
			
			clickElementByJSExecutor(driver.findElement(By.xpath("//div[@class='ui-dialog-buttonset']//button[text()='Remove']")));
			waitForJSandJQueryToLoad();
		}
	}
	
	public class Course extends BasePage {
		
		@FindBy(css = ".tnlf-add-plc-course-list-btn")
		private WebElement addCourseButton;
		
		@FindBy(css = ".tnlf-delete-courses")
		private WebElement removeCourses;
		
		public void addCourse() {
			clickElementByJSExecutor(driver.findElement(By.xpath("//a[text()='Add Courses']")));
			waitForJSandJQueryToLoad();
			
			WebElement checkUser = driver.findElement(By.xpath("//table[@class='tnl-table tnlf-table table-striped']//tr[1]/td/input"));
			clickElementByJSExecutor(checkUser);
			waitForJSandJQueryToLoad();
			
			clickElementByJSExecutor(addCourseButton);
			waitForJSandJQueryToLoad();
			
			clickElementByJSExecutor(driver.findElement(By.linkText("Done")));
			waitForJSandJQueryToLoad();
		}
		
		public boolean verifyCourseRemoved() {
			boolean flag = false;
			if(elementPresent(By.xpath("//table[@class='tnl-table tnlf-table table-striped']//td[2]"))) {
				flag = true;
			}
			else {
				flag = false;
			}
			return flag;
		}
		
		public void removeCourse() {
			clickElementByJSExecutor(driver.findElement(By.xpath("//table[@class='tnl-table tnlf-table table-striped']/thead//th/input")));
			waitForJSandJQueryToLoad();
			clickElementByJSExecutor(removeCourses);
			waitForJSandJQueryToLoad();
			
			clickElementByJSExecutor(driver.findElement(By.xpath("//div[@class='modal-footer']//button[text()='Remove']")));
			waitForJSandJQueryToLoad();
		}
	}
	
	public class Discussion extends BasePage {
		
		public void addThread(String discussionTitle,String discussionComment) {
			clickElementByJSExecutor(driver.findElement(By.xpath("//span[text()='Create New Thread']/ancestor::a[contains(@class,'btn-default')]")));
			waitForJSandJQueryToLoad();
			
			Select entryTopic = new Select(driver.findElement(By.name("discussionEntryTopicId")));
			entryTopic.selectByVisibleText("General");
			
			WebElement title = driver.findElement(By.id("title"));
			title.clear();
			title.sendKeys(discussionTitle);
			
			WebElement comment = driver.findElement(By.name("comment"));
			comment.clear();
			comment.sendKeys(discussionComment);
			
			clickElementByJSExecutor(driver.findElement(By.xpath("//button[text()='Post']")));
			waitForJSandJQueryToLoad();
		}
		
		public boolean verifyThread() {
			boolean flag = false;
			if(elementPresent(By.xpath("//div[contains(@id,'pmf-discussion-post-')]")))
			{
				flag = true;
			}
			return flag;
		}
		
		public void deleteThread() {
			WebElement actionButton = driver.findElement(By.cssSelector(".pm-action-btn.dropdown-toggle"));
			clickElementByJSExecutor(actionButton);
			waitForJSandJQueryToLoad();
			
			WebElement deleteLink = driver.findElement(By.xpath("//span[text()='Delete Thread']/ancestor::a"));
			clickElementByJSExecutor(deleteLink);
			waitForJSandJQueryToLoad();
			clickElementByJSExecutor(driver.findElement(By.xpath("//div[@class='modal-footer']//button[text()='Delete']")));
			waitForJSandJQueryToLoad();
		}
	}
	
	public class Notification extends BasePage {
		
		public void addNotification(String notificationTitle, String notificationMessage) throws InterruptedException {
			WebElement particpantAddCheck = driver.findElement(By.name("participantsAdded"));
			clickElementByJSExecutor(particpantAddCheck);
			waitForJSandJQueryToLoad();
			WebElement addParticipantTitle = driver.findElement(By.name("addParticipantTitle"));
			addParticipantTitle.clear();
			addParticipantTitle.sendKeys(notificationTitle);
			driver.switchTo().frame(driver.findElement(By.xpath("//iframe[@id='tnlf-add-participant-message_ifr']")));
			WebElement message = driver.findElement(By.xpath("//body[@id='tinymce']/p"));
			Actions action= new Actions(driver);
			Thread.sleep(1000);
			action.moveToElement(message).click().sendKeys(notificationMessage);
			action.build().perform();
			waitForJSandJQueryToLoad();
			driver.switchTo().defaultContent();
			clickElementByJSExecutor(driver.findElement(By.xpath("//button[text()='Save']")));
			waitForJSandJQueryToLoad();
			
		}
		
		public String getTitleText() {
			waitForJSandJQueryToLoad();
			WebElement addParticipantTitle = driver.findElement(By.name("addParticipantTitle"));
			return addParticipantTitle.getAttribute("value");
		}
		
		public String getMessageText() {
			driver.switchTo().frame(driver.findElement(By.xpath("//iframe[@id='tnlf-add-participant-message_ifr']")));
			WebElement message = driver.findElement(By.xpath("//body[@id='tinymce']/p")); 
			return message.getText();
		}
		
		public void switchToDefault() {
			driver.switchTo().defaultContent();
			waitForJSandJQueryToLoad();
		}
	}
}


