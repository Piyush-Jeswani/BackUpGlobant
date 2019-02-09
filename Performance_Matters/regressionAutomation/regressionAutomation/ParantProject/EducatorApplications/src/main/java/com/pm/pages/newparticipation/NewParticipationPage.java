package com.pm.pages.newparticipation;

import java.awt.AWTException;
import java.awt.Robot;
import java.awt.event.KeyEvent;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.Iterator;
import java.util.List;
import java.util.Set;

import org.openqa.selenium.Alert;
import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.ui.Select;

import com.pm.pages.common.BasePage;

public class NewParticipationPage extends BasePage {

	@FindBy(xpath = "//span[text()='All Evaluations']/preceding-sibling::div/span")
	private WebElement allEvaluationsMenuBtn;

	@FindBy(xpath = "//span[text()='All Evaluations']/preceding-sibling::div[1]/div")
	private WebElement allEvaluationsMenu;
	
	@FindBy(css = ".btn-default.boot-btn.btn-sm.tnlf-add-filter")
	private WebElement addFilterBtn;
	
	@FindBy(xpath = "//span[text()='Add Filter']/ancestor::a[1]/following-sibling::button[1]")
	private WebElement addFilterActionMenu;
	
	@FindBy(xpath = "//h2[text()='My Reports']/ancestor::section[1]")
	private WebElement myReportsSection;
	
	@FindBy(id = "module-id")
	private WebElement createReportlink;
	
	@FindBy(name = "module-id")
	private WebElement selectModuleDropDown;
	
	@FindBy(name = "report-id")
	private WebElement selectReportDropDown;
	
	@FindBy(id="Approve")
	private WebElement approveButton;
	
	@FindBy(xpath = "//button[text()='Confirm']")
	private WebElement confirmButton;
	
	@FindBy(xpath = "//button[text()='Confirm']")
	private WebElement cancelButton;
	
	@FindBy(xpath = "//td[@id='actionMenuCell']/div/button")
	private WebElement actionButton;
	
	@FindBy(css = "div[class='table-responsive']")
	private WebElement horizontalScroll;
		
	public NewParticipationPage() {
		super();
	}

	public NewParticipationPage selectEvaluationProgramFromAllEvaluations(String evaluationProgramName) {
		clickElementByJSExecutor(allEvaluationsMenuBtn);
		waitForJSandJQueryToLoad();
		clickElementByJSExecutor(allEvaluationsMenu.findElement(By.linkText(evaluationProgramName)));
		waitForJSandJQueryToLoad();
		return new NewParticipationPage();
	}

	public EvaluationPage clickOnUserForSelectedProgram(String lastname, String firstname) {
		String userName = lastname + ", " + firstname;		
		String xpath = String.format("//td/span/a[text()='%s']", userName);
		clickElementByJSExecutor(driver.findElement(By.xpath(xpath)));
		waitForJSandJQueryToLoad();
		return new EvaluationPage();
	}
	
	public WebElement clickActivityContainer(String ContainerName) {
		String xpath = String.format("//span[text()='%s']/ancestor::div[2]", ContainerName);
		WebElement activityContainer = driver.findElement(By.xpath(xpath));
		activityContainer.click();
		return driver.findElement(By.xpath(xpath));
	}	

	public NewParticipationPage clickOnActivityFromActivityContainer(String activityname, String ActivityContainerName) {
		waitForJSandJQueryToLoad();
		WebElement activityContainer = clickActivityContainer(ActivityContainerName);
		waitForJSandJQueryToLoad();
		clickElementByJSExecutor(activityContainer.findElement(By.linkText(activityname)));
		return new NewParticipationPage();
	}
	
	public void selectActionFromAddFilterActionMenu(String action){
		addFilterActionMenu.click();
		String xpath = String.format("//ul[@role='menu']//span[text()='%s']/ancestor::a[1]", action);
		driver.findElement(By.xpath(xpath)).click();
		
	}
	
	public boolean myReportsTabDisplayed(){
		return myReportsSection.isDisplayed();
	}
	
	public void clickCreateReportLink(){		
		clickElementByJSExecutor(myReportsSection.findElement(By.linkText("Create Report")));
		waitForJSandJQueryToLoad();
	}
	
	public boolean createReportTemplateDispleyed(){
		return (selectModuleDropDown.isDisplayed() && selectReportDropDown.isDisplayed());
	}
	
	public NewParticipationPage clickActionDropdown(String actionValue) {
		WebElement dropDown = driver.findElement(By.xpath("//td[@id='actionMenuCell']/div/button"));
		clickElementByJSExecutor(dropDown);
		String xpath = String.format("//td[@id='actionMenuCell']//ul//span[text()='%s']", actionValue);
		WebElement dropDownValue = driver.findElement(By.xpath(xpath));
		clickElementByJSExecutor(dropDownValue);
		return new NewParticipationPage();
	}
	
	public NewParticipationPage dismissAlert() {
		Alert alert = driver.switchTo().alert();
		alert.dismiss();
		return new NewParticipationPage();
	}
	
	public NewParticipationPage acceptAlert() {
		Alert alert = driver.switchTo().alert();
		alert.accept();
		return new NewParticipationPage();
	}
	
	public ActivityDetailsPage approve() {
		clickElementByJSExecutor(approveButton);
		return new ActivityDetailsPage();
	}
	
	public ActivityDetailsPage clickConfirmButton() {
		clickElementByJSExecutor(confirmButton);
		return new ActivityDetailsPage();
	}
	
	public ActivityDetailsPage clickCancelButton() {
		clickElementByJSExecutor(cancelButton);
		return new ActivityDetailsPage();
	}
	
	public String getAdministratorsName() {
		return driver.findElement(By.xpath("//div[@class='tnl-grouped-row'][1]//div[@class='tnl-value']")).getText();
	}
	public boolean verifyPDFPreviewTextVisible() {
		return elementPresent(By.xpath("//span[text()='PDF Preview']"));
	}
	
	public void selectActionFromActionDropdown(String action){
		clickElementByJSExecutor(actionButton);
		String actionLink = String.format("//td[@id='actionMenuCell']//ul/li/a/span[text()='%s']", action);
		WebElement actionLinkText = driver.findElement(By.xpath(actionLink));
		clickElementByJSExecutor(actionLinkText);
		waitForJSandJQueryToLoad();
	}
	
	public String getPDFAdministratorName() {
		return driver.findElement(By.xpath("//table[@class='inputborder'][1]//tr[1]/td")).getText();
	}
	
	public void scrollToBottomOfPage() throws InterruptedException {
		//Dimension dim = new Dimension(994, 718);
		//driver.manage().window().setSize(dim);		
		//int h =  getheightOfBrowser();
		jsExecutor.executeScript("window.scrollTo(0, "+25000+")");
		Thread.sleep(2000);
	}
	public void scrollPage() throws InterruptedException {
//		jsExecutor.executeScript("window.scrollBy(1000,0)", "");
		jsExecutor.executeScript("scroll(0, 1000);");
		Thread.sleep(2000);
	}
	
	public void maximizeWindow() {
		driver.manage().window().maximize();
	}
	public void makeColumnVisible(String columnName) {
		String column = String.format("//span[text()='%s']/ancestor::td/following-sibling::td//input", columnName);
		WebElement columnCheck = driver.findElement(By.xpath(column));
		String flag = Boolean.toString(columnCheck.isSelected());
		if(flag.equals("false")){
			clickElementByJSExecutor(columnCheck);
			waitForJSandJQueryToLoad();
		}
	}
	
	public boolean verifyColumnPresent(String columnName) {
		String column = String.format("//th[contains(text(),'%s')]", columnName);
		return driver.findElement(By.xpath(column)).isDisplayed();
	}
	
	public boolean verifyHorizontalScrollPresent() {
		/*waitForJSandJQueryToLoad();
		boolean scrollBarPresent = (boolean) jsExecutor.executeScript("return document.documentElement.scrollWidth>document.documentElement.clientWidth;",driver.findElement(By.xpath("//div[@class='table-responsive']")));
		return scrollBarPresent;*/
		
		jsExecutor.executeScript("document.querySelector('table th:last-child').scrollIntoView();");
		waitForJSandJQueryToLoad();
		jsExecutor.executeScript("document.querySelector('table th:first-child').scrollIntoView();");
		
		return horizontalScroll.isDisplayed();
	}
	
	public void isHorizontalScrollMovingForTable(){
		jsExecutor.executeScript("document.querySelector('table th:last-child').scrollIntoView();");
		waitForJSandJQueryToLoad();
		jsExecutor.executeScript("document.querySelector('table th:first-child').scrollIntoView();");
	}
	
	public void clickReportIcon(String linkText) {
		WebElement report = driver.findElement(By.cssSelector(".tnl-advanced-popup-panel .im-stats"));
		clickElementByJSExecutor(report);
		clickElementByJSExecutor(driver.findElement(By.linkText(linkText)));
		waitForJSandJQueryToLoad();
	}
	
	public void selectPlanForEvaluationCompletionStatus(String planName) {
		Select evaluationPlan = new Select(driver.findElement(By.xpath("//form[@id='DD3']//select[@name='gp_id']")));
		evaluationPlan.selectByVisibleText(planName);
		waitForJSandJQueryToLoad();
	}
	
	public boolean verifyLocationColumnPresent() {
		return elementPresent(By.xpath("//th[text()='Location']"));
	}
	
	public boolean verifyMyReportSectionVisible() {
		return elementPresent(By.xpath("//h2[text()='My Reports']"));
	}
	
	public void downloadCSV() {
		WebElement csvDownloadLink = driver.findElement(By.xpath("//table[@id='GpStatusDetailsTable']/caption/span/a/img"));
		clickElementByJSExecutor(csvDownloadLink);
		waitForJSandJQueryToLoad();
		Set windowids = driver.getWindowHandles();
		Iterator iter= windowids.iterator();
		iter= windowids.iterator();
		iter.next();
	}
	
	public boolean verifyFileDownloaded() {
		String downloadPath = System.getProperty("user.dir")+"/CSVDownloads";
		File uploadDirectory = new File(downloadPath);
	    File[] downloadedFiles = uploadDirectory.listFiles();
	    
	    Arrays.sort(downloadedFiles, new Comparator<File>() {
	        @Override
	        public int compare(File fileOne, File fileTwo) {
	            return Long.valueOf(fileOne.lastModified()).compareTo(fileTwo.lastModified());
	        }
	    });
	    int downloadedFilesCount = downloadedFiles.length;
	    String fileName = downloadedFiles[downloadedFilesCount-1].getName();
	    if(fileName.startsWith("GpStatusDetailsTable")) {
	    	return true;
	    }else {
	    	return false;
	    }
	}
	public List<String> verifyCSVFileHeader() throws IOException {
		String downloadPath = System.getProperty("user.dir")+"/CSVDownloads";
		File uploadDirectory = new File(downloadPath);
	    File[] downloadedFiles = uploadDirectory.listFiles();
	    String[] columns = {};
	    List<String> columnHeaders = new ArrayList<String>();
	    Arrays.sort(downloadedFiles, new Comparator<File>() {
	        @Override
	        public int compare(File fileOne, File fileTwo) {
	            return Long.valueOf(fileOne.lastModified()).compareTo(fileTwo.lastModified());
	        }
	    });
	    int downloadedFilesCount = downloadedFiles.length;
	    String fileName = downloadedFiles[downloadedFilesCount-1].getName();
	    if(fileName.startsWith("GpStatusDetailsTable")) {
	    	String downloadFilePath = downloadedFiles[downloadedFilesCount-1].getAbsolutePath();
		    BufferedReader br = new BufferedReader(new FileReader(downloadFilePath));
	        String header = br.readLine();
	        if (header != null) {
	            columns = header.split(",");
	            for (int i = 0; i < columns.length; i++) {
					columnHeaders.add(columns[i]);
				}
	        }
	        br.close();
	    }
	    return columnHeaders;
	}
	
	public boolean verifyColumnHeader(List<String> header,List<String> header2) {
		return header.containsAll(header2);
	}
	
	public void newParticipationMinimizeBrowserWindow() throws AWTException{
		
		minimizeBrowserWindow();
	}
	public void newParticipationMinimizeScrollDown() throws AWTException{
		 Robot robot=new Robot();
		 robot.keyPress(KeyEvent.VK_PAGE_DOWN);	 
		 waitForJSandJQueryToLoad();
	}
}
