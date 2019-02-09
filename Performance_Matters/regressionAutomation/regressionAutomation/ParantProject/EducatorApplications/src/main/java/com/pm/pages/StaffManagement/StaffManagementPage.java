package com.pm.pages.StaffManagement;

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
import java.util.Date;
import java.util.List;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindAll;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.ui.Select;
import com.pm.pages.common.BasePage;

public class StaffManagementPage extends BasePage{

	public StaffManagementPage() {
		super();
	}
	
	@FindBy(xpath = "//form[@id='DD3']//select[@name='gp_id']")
	private WebElement programPlanForEvaluation;
	
	@FindAll({@FindBy(xpath = "//form[@id='DD3']//table//td/input[@type='checkbox']")})
	private List<WebElement> activitiesListCheck;
	
	@FindBy(css = ".pmf-print-submit-button")
	private WebElement printButton;
	
	@FindBy(xpath = "//table[@id='GpStatusDetailsTable']//span/a/img")
	private WebElement csvDownloadLink;
	
	@FindBy(id = "currentPlan")
	private WebElement programSelect;
	
	@FindBy(className = "evaluation-person-name")
	private WebElement evaluationProgramName;
	
	@FindBy(xpath = "//div[@id='PortalHeader_0']//nav/div/button")
	private WebElement navigationMenu;
	
	@FindBy(css = ".ui-dialog-titlebar-close")
	private WebElement closeIcon;
	
	@FindBy(id = "site")
	private WebElement site;
	
	@FindBy(className = "app-heading")
	private WebElement pageHeader;
	
	public boolean isStaffManagementPresent() {
		clickElementByJSExecutor(driver.findElement(By.xpath("//div[@id='PortalHeader_0']//nav/div/button")));
		waitForJSandJQueryToLoad();
		return elementPresent(By.linkText("Staff Management"));
	}
		
	public boolean isAdministratorPresent(String userName) {
		String user = String.format("//table[@class='tnl-table tnlf-table table-striped']//td[text()='%s']", userName);
		return elementPresent(By.xpath(user));
	}
	
	public void clickUserAction(String firstName,String lastName,String linkText) {
		String userActionButton = String.format("//td[text()='%s, %s']/preceding-sibling::td//button", lastName,firstName);
		clickElementByJSExecutor(driver.findElement(By.xpath(userActionButton)));
		waitForJSandJQueryToLoad();
		
		clickElementByJSExecutor(driver.findElement(By.linkText(linkText)));
		waitForJSandJQueryToLoad();
	}
	
	public int getRegisteredLearningOpportunitiesCount() {
		List<WebElement> registeredLearningOpportunities = driver.findElements(By.xpath("//table[@id='userCourses']/tbody/tr/td[2]"));
		return registeredLearningOpportunities.size();
	}
	
	public void selectProgramPlan(String programName) {//#DD3 select
		Select planSelect = new Select(driver.findElement(By.cssSelector("#DD3 select")));
		planSelect.selectByVisibleText(programName);
		waitForJSandJQueryToLoad();
	}
	
	public void deselectAll() {
		clickOnLink("Deselect All");
	}
	
	public void selectActivities(String[] activitiesId) {
		List<WebElement> activitiesList = driver.findElements(By.cssSelector("#DD3 input[type='checkbox']"));
		for (WebElement webElement : activitiesList) {
			for (int i = 0; i < activitiesId.length; i++) {
				if(activitiesId[i].equals(webElement.getAttribute("value"))) {
					clickElementByJSExecutor(webElement);
					waitForJSandJQueryToLoad();
				}
			}
		}
	}
	
	public void clickDownloadLink(String sectionHeader) {
		String download = String.format("//td[text()='%s']/following-sibling::td/a[@class='tnl-text-link tnl-pdf-link tnl-icon-link']", sectionHeader);
		WebElement downloadLink = driver.findElement(By.xpath(download));
		clickElementByJSExecutor(downloadLink);
		waitForJSandJQueryToLoad();
		
		WebElement printButton = driver.findElement(By.xpath("//div[@id='pdfModalDialog']/div/button"));
		clickElementByJSExecutor(printButton);
		waitForJSandJQueryToLoad();
	}
	
	public void downloadCSV() throws InterruptedException, AWTException{
		WebElement csvDownloadLink = driver.findElement(By.xpath("//table[@id='GpStatusDetailsTable']/caption/span/a/img"));
		clickElementByJSExecutor(csvDownloadLink);
		waitForJSandJQueryToLoad();
		Robot robot = new Robot();	
		robot.keyPress(KeyEvent.VK_ENTER);	 
		
	}
	
	public void selectProgram(String programName) {
		Select program = new Select(driver.findElement(By.id("currentPlan")));
		program.selectByVisibleText(programName);
		waitForJSandJQueryToLoad();
	}
	
	public void selectActionForUser(String userName,String action) {
		String actionButton = String.format("//*[text()='%s']/ancestor::td/preceding-sibling::td//button", userName);
		WebElement button = driver.findElement(By.xpath(actionButton));
		clickElementByJSExecutor(button);
		
		clickElementByJSExecutor(driver.findElement(By.linkText(action)));
		waitForJSandJQueryToLoad();
	}
	
	public String getEvaluationPersonName() {
		return driver.findElement(By.className("evaluation-person-name")).getText();
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
	    return fileName.startsWith("GpStatusDetailsTable");
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
	    
	    Date date = new Date();
	    File newfile = new File(downloadPath+"/GpStatusDetailsTable_"+date+".csv");
	    
	    File oldFileName = new File(downloadedFiles[downloadedFilesCount-1].getAbsolutePath());
	    System.out.println("Old file Name : "+oldFileName+" File Path : "+oldFileName.renameTo(newfile)+" New File Name : "+newfile);
	    
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
	public File[] sortFileList() {
		String downloadPath = System.getProperty("user.dir")+"/CSVDownloads";
		try {
			Thread.sleep(1000);
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
		File uploadDirectory = new File(downloadPath);
	    File[] downloadedFiles = uploadDirectory.listFiles();
	    
	    
	    Arrays.sort(downloadedFiles, new Comparator<File>() {
	        @Override
	        public int compare(File fileOne, File fileTwo) {
	            return Long.valueOf(fileOne.lastModified()).compareTo(fileTwo.lastModified());
	        }
	    });
	    return downloadedFiles;
	}
	
	public int verifyFileCountAfterDeletion() {
		File[] downloadedFiles = sortFileList();
	    int downloadedFilesCount = downloadedFiles.length;
	    downloadedFiles[downloadedFilesCount-1].delete();
	    
	    downloadedFiles = sortFileList();
	    return downloadedFiles.length;
	    
	}
	
	public String getSelectedSite() {
		Select siteSelect = new Select(site);
		return siteSelect.getFirstSelectedOption().getText();
	}
	
	public String getPageHeader() {
		return pageHeader.getText();
	}
}
