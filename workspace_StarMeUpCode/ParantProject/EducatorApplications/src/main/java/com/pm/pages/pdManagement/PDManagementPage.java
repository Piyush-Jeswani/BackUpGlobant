package com.pm.pages.pdManagement;

import java.util.ArrayList;
import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.ui.ExpectedConditions;

import com.pm.pages.common.BasePage;

public class PDManagementPage extends BasePage{
	
	@FindBy(linkText = "Search")
	private WebElement searchButton;
	
	@FindBy(name = "person_person_id")
	private WebElement selectUser;
	
	@FindBy(linkText = "Select")
	private WebElement selectButton;
	
	@FindBy(linkText = "Finish")
	private WebElement finishButton;
	
	public PDManagementPage() {
		super();
	}

	public void clickAddButton(String title){
		String xpath = String.format("//td[@id='tnl-main-td']//td[contains(text(),'%s')]", title);
		WebElement pdPlaylist = driver.findElement(By.xpath(xpath));
		WebElement addButton = pdPlaylist.findElement(By.tagName("button"));
		clickElementByJSExecutor(addButton);
		waitForJSandJQueryToLoad();
	}
	
	public void switchToFrame(){
		driver.switchTo().frame(0);
		waitForJSandJQueryToLoad();
	}
	public void enterFirstName(String Fname) {
		WebElement firstName = driver.findElement(By.name("person_first_name"));
		firstName.clear();
		firstName.sendKeys(Fname);
	}
	
	public void enterLastName(String Lname) throws InterruptedException {
		WebElement lastName = driver.findElement(By.name("person_last_name"));
		lastName.clear();
		lastName.sendKeys(Lname);
	}
	
	public void clickSearchButton() {
		clickElementByJSExecutor(searchButton);
		waitForJSandJQueryToLoad();
	}
	
	public void selectUser(String firstName,String lastName) {
		WebElement table = driver.findElement(By.xpath("//table[@class='tnl-table']//tbody"));
		List<WebElement> tableData = table.findElements(By.xpath("//tr"));
		
		int tableDataCount = tableData.size();
		for (int row = 3; row < tableDataCount; row++) {
			if (tableData.get(row).findElement(By.xpath("//td[3]")).getText().contains(lastName) &&  tableData.get(row).findElement(By.xpath("//td[4]")).getText().contains(firstName)) {
				WebElement actionButton = tableData.get(row).findElement(By.xpath("//td[2]/input")); 
				wait.until(ExpectedConditions.visibilityOf(actionButton));
				actionButton.click();
				waitForJSandJQueryToLoad();
				break;
			}
		}
	}
	
	public void addModerator(String firstName,String lastName,String title) throws InterruptedException{
		
		clickAddButton(title);
		switchToFrame();
		enterFirstName(firstName);
		enterLastName(lastName);
		clickSearchButton();
		selectUser(firstName, lastName);
		clickSelectButton();
		clickFinishButton();
	}
	
	public void clickSelectButton() {
		clickElementByJSExecutor(selectButton);
		waitForJSandJQueryToLoad();
	}
	
	public void clickFinishButton() {
		clickElementByJSExecutor(finishButton);
		waitForJSandJQueryToLoad();
	}
	
	public String verifyUserAdded(String title,String firstName) {
		driver.switchTo().defaultContent();
		String userName = String.format("//td[contains(text(),'%s')]/ancestor::table[1]/following-sibling::table[1]//tr/td/a", title);
		List<WebElement> tableData = driver.findElements(By.xpath(userName));
		String result = "";
		int tableDataCount = tableData.size();
		for (int row = 0; row < tableDataCount; row++) {
			WebElement data = tableData.get(row);
			if (data.getText().contains(firstName)) {
				result =  data.getText();
				break;
			}
		}
		return result;
	}
	
	public void deleteUser(String title, String firstName) {
		String userName = String.format("//td[contains(text(),'%s')]/ancestor::table[1]/following-sibling::table[1]//tr/td[2]/a", title);
		List<WebElement> tableData = driver.findElements(By.xpath(userName));
		int tableDataCount = tableData.size();
		for (int row = 0; row < tableDataCount; row++) {
			WebElement data = tableData.get(row);
			if (data.getText().contains(firstName)) {
				String deleteButtonString = String.format("//td[contains(text(),'%s')]/ancestor::table[1]/following-sibling::table[1]//tr//td/button", title);
				List<WebElement> deleteButton = driver.findElements(By.xpath(deleteButtonString));
				
				wait.until(ExpectedConditions.visibilityOf(deleteButton.get(row)));
				clickElementByJSExecutor(deleteButton.get(row));
				
				waitForJSandJQueryToLoad();
				
				WebElement removeButton = driver.findElement(By.cssSelector(".btn-danger.boot-btn"));
				wait.until(ExpectedConditions.visibilityOf(removeButton));
				
				clickElementByJSExecutor(removeButton);
				waitForJSandJQueryToLoad();
				break;
			}
		}
	}
	
	public void clickDeleteButton() {
		WebElement removeButton = driver.findElement(By.cssSelector(".btn-danger.boot-btn"));
		wait.until(ExpectedConditions.visibilityOf(removeButton));
		clickElementByJSExecutor(removeButton);
	}
	
	public List<String> getPDUserList(String title) {
		String userNames = String.format("//td[@id='tnl-main-td']//td[contains(text(),'%s')]/ancestor::table/following-sibling::table[@class='tnl-table table-striped'][1]//td[2]/a", title);
		List<WebElement> userNamesList = driver.findElements(By.xpath(userNames));
		List<String> userNamesListText = new ArrayList<String>();
		
		for (WebElement string : userNamesList) {
			userNamesListText.add(string.getText());
		}
		
		return userNamesListText;
	}
	
	public boolean verifyDeleteIconForModerator(String firstName,String lastName) {
		String moderatorDeleteIcon = String.format("//td[contains(text(),'PD Playlists Moderator')]/ancestor::table/following-sibling::table//a[contains(text(),'%s, %s')]/ancestor::td[1]/preceding-sibling::td/button[@class='pm-btn-sm pm-error-btn']", lastName,firstName);
		boolean flag = false;
		if(elementPresent(By.xpath(moderatorDeleteIcon))){
			flag = true;
		}
		return flag;
	}
}
