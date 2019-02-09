package com.pm.pages.rosterSection;

import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.ui.Select;

import com.pm.pages.common.BasePage;

public class RosterSectionPage extends BasePage{
	
	@FindBy(id="identifiers")
	private WebElement identifiers;
	
	@FindBy(css = ".tnlf-preview-results")
	private WebElement previewButton;
	
	@FindBy(css = ".tnlf-add-users")
	private WebElement addUserButton;
	
	@FindBy(id = "_rosterStatusAll")
	private WebElement rosterStatusId;
	
	@FindBy(id = "_rosterGradeAll")
	private WebElement rosterGradeId;
	
	public RosterSectionPage() {
		super();
	}
	
	public void clickAction() {
		WebElement actionButton = driver.findElement(By.className("menuheader"));
		actionButton.click();
	}
	
	public void addLearnerAdvanced(String userId,String creditType) {
		identifiers.sendKeys(userId);
		waitForJSandJQueryToLoad();
		
		selectCreditType(creditType);
		
		clickElementByJSExecutor(previewButton);
		waitForJSandJQueryToLoad();
		
		clickElementByJSExecutor(addUserButton);
		waitForJSandJQueryToLoad();
	}
	
	public void updateGradeRosterStatus(String rosterstatus,String gradestatus) {
		Select rosterStatus = new Select(rosterStatusId);
		rosterStatus.selectByVisibleText(rosterstatus);
		
		Select gradeStatus = new Select(rosterGradeId);
		
		gradeStatus.selectByVisibleText(gradestatus);
		clickOnLink("Save This Page");
	}
	
	public String verifyStatus(String gradeRoster) {
		List<WebElement> tableHeader = driver.findElements(By.xpath("//table[@id='rosterTable']/tbody/tr/th//span"));
		String status = "";
		for(int i= 0;i<tableHeader.size();i++) {
			if(tableHeader.get(i).getText().equals(gradeRoster)) {
				String grade = String.format("//table[@id='rosterTable']//td[%s]", (i+1));
				WebElement gradeStatus = driver.findElement(By.xpath(grade));
				status = gradeStatus.getText();
				break;
			}
		}
		return status;
	}
	
	public void removeFromRoster() throws InterruptedException {
		WebElement removeRoster = driver.findElement(By.linkText("Remove from Roster"));
		removeRoster.click();
		Thread.sleep(2000);
		driver.switchTo().alert().accept();
		waitForJSandJQueryToLoad();
	}
	
	public boolean verifyRosterRemoved(String userId) {
		String user = String.format("//span[text()='%s']", userId);
		return elementPresent(By.xpath(user));
	}
	
	public void changeStatusForSingleUser(String userID,String grade,String enrollment) {
		String userGradeStatus = String.format("//span[text()='%s']/ancestor::td[1]/following-sibling::td//select[contains(@id,'_rosterGrade')]", userID);
		String userEnrollmentStatus = String.format("//span[text()='%s']/ancestor::td[1]/following-sibling::td//select[contains(@id,'_rosterStatus')]", userID);
		
		Select gradeStatus = new Select(driver.findElement(By.xpath(userGradeStatus)));
		gradeStatus.selectByVisibleText(grade);
		
		Select enrollmentStatus = new Select(driver.findElement(By.xpath(userEnrollmentStatus)));
		enrollmentStatus.selectByVisibleText(enrollment);
		clickOnLink("Save This Page");
		clickOnLink("Done");
	}
	
	public void clickActionForUser(String userId) {
		String  userpath = String.format("//span[text()='%s']/ancestor::td/preceding-sibling::td//*[@class='menuheader']", userId);
		WebElement userAction = driver.findElement(By.xpath(userpath));
		clickElementByJSExecutor(userAction);
		waitForJSandJQueryToLoad();
	}
	
	public void selectCreditType(String creditType) {
		String credit = String.format("//td[text()='%s']/preceding-sibling::td/input", creditType);
		WebElement checkCredit = driver.findElement(By.xpath(credit));
		checkCredit.click();
		waitForJSandJQueryToLoad();
	}
}
