package com.pm.pages.common;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import com.pm.pages.Observation.ObservationPage;
import com.pm.pages.PDPLaylist.PDPlaylistPage;
import com.pm.pages.StaffManagement.StaffManagementPage;
import com.pm.pages.Transcript.TranscriptPage;
import com.pm.pages.administration.AdministrationPage;
import com.pm.pages.courseApprovalAdmin.CourseApprovalAdminPage;
import com.pm.pages.coursecatalog.CourseCatalogPage;
import com.pm.pages.myCredentials.MyCredentialsPage;
import com.pm.pages.newTeacherEvaluation.NewTeacherEvaluationPage;
import com.pm.pages.newparticipation.NewParticipationPage;
import com.pm.pages.roomManagement.RoomManagementPage;
import com.pm.pages.teacherEvaluation.TeacherEvaluationPage;

public class NavigationMenu extends BasePage {
	@FindBy(xpath = "//header[@class='pm-site-header']")
	private WebElement header;

	@FindBy(linkText = "Home")
	private WebElement homeTab;

	@FindBy(linkText = "Course Catalog")
	private WebElement courseCatalogTab;

	@FindBy(xpath = "//div[@id='PortalHeader_0']//nav/div/button")
	private WebElement hiddenNavToggleBtn;

	@FindBy(linkText = "Administration")
	private WebElement administrationTab;

	@FindBy(linkText = "New Participation")
	private WebElement newParticipationTab;
	
	@FindBy(xpath = "//a[text()='Propose a Course']")
	private WebElement proposeACourseTab;

	@FindBy(xpath = "//ul[@id='user-menu']/li/a")
	private WebElement userMenuBtn;

	@FindBy(xpath = "//ul[@id='user-menu']//span[text()='Logout']/ancestor::a[1]")
	private WebElement logoutBtn;
	
	@FindBy(xpath = "//div[@class='tnl-masquerading-bar']/a")
	private WebElement stopMasqueradingLink;
	
	@FindBy(linkText = "New Teacher Evaluations")
	private WebElement newTeacherEvaluation;
	
	@FindBy(linkText = "Teacher Evaluations")
	private WebElement teacherEvaluation;
	
	@FindBy(linkText = "Observation")
	private WebElement observation;
	
	@FindBy(linkText = "PD Playlist")
	private WebElement pdPlaylist;
	
	@FindBy(linkText = "Transcript")
	private WebElement transcript;
	
	@FindBy(linkText = "Staff Management")
	private WebElement staffManagement;
	
	@FindBy(linkText = "My Credentials")
	private WebElement myCredentials;
	
	@FindBy(linkText = "Room Management")
	private WebElement roomManagement;
	
	public NavigationMenu() {
		super();
		assertThat("Header is not displayed", header.isDisplayed(), equalTo(true));		
	}

	public AdministrationPage clickAdministrationTab() {
		clickElementByJSExecutor(hiddenNavToggleBtn);
		clickElementByJSExecutor(administrationTab);
		waitForJSandJQueryToLoad();
		return new AdministrationPage();
	}
	
	
	public NewParticipationPage clickNewParticipationTab() throws InterruptedException {
		clickElementByJSExecutor(hiddenNavToggleBtn);
		clickElementByJSExecutor(newParticipationTab);
		waitForJSandJQueryToLoad();
		return new NewParticipationPage();
	}

	public CourseCatalogPage clickCourseCatalogTab() throws InterruptedException {
		clickElementByJSExecutor(hiddenNavToggleBtn);
		clickElementByJSExecutor(courseCatalogTab);
		waitForJSandJQueryToLoad();
		return new CourseCatalogPage();
	}

	public HomePage clickHomeTab() {
		clickElementByJSExecutor(homeTab);
		waitForJSandJQueryToLoad();
		return new HomePage();
	}
	
	public CourseApprovalPage clickProposeACourseTab() {
		clickElementByJSExecutor(hiddenNavToggleBtn);
		waitForJSandJQueryToLoad();
		clickElementByJSExecutor(proposeACourseTab);
		waitForJSandJQueryToLoad();
		return new CourseApprovalPage();
	}

	public LoginPage logoutOfApplication() {
		clickElementByJSExecutor(userMenuBtn);
		clickElementByJSExecutor(logoutBtn);
		waitForJSandJQueryToLoad();
		return new LoginPage();
	}
	
	public void clickStopMasqueradingLink(){
		if (elementPresent(By.xpath("//div[@class='tnl-masquerading-bar']/a"))){
			clickElementByJSExecutor(stopMasqueradingLink);
			waitForJSandJQueryToLoad();
		}
	}
	
	public NewTeacherEvaluationPage clickNewTeacherEvaluationTab(){
		clickElementByJSExecutor(hiddenNavToggleBtn);
		clickElementByJSExecutor(newTeacherEvaluation);
		waitForJSandJQueryToLoad();
		return new NewTeacherEvaluationPage();
	}
	
	public TeacherEvaluationPage clickTeacherEvaluationTab(){
		clickElementByJSExecutor(hiddenNavToggleBtn);
		clickElementByJSExecutor(teacherEvaluation);
		waitForJSandJQueryToLoad();
		return new TeacherEvaluationPage();
	}
	
	public CourseApprovalAdminPage clickAdministration(){
		clickElementByJSExecutor(hiddenNavToggleBtn);
		clickElementByJSExecutor(administrationTab);
		waitForJSandJQueryToLoad();
		return new  CourseApprovalAdminPage();
	}
	
	public ObservationPage clickObservation(String linkText) {
		clickElementByJSExecutor(observation);
		waitForJSandJQueryToLoad();
		
		String observationLink = String.format("//span[text()='%s']",linkText);
		WebElement observationOfMe = driver.findElement(By.xpath(observationLink));
		clickElementByJSExecutor(observationOfMe);
		waitForJSandJQueryToLoad();
		return new ObservationPage();
	}
	
	public PDPlaylistPage clickPDPlayList() {
		clickElementByJSExecutor(hiddenNavToggleBtn);
		clickElementByJSExecutor(pdPlaylist);
		waitForJSandJQueryToLoad();
		return new PDPlaylistPage();
	}
	
	public TranscriptPage clickTranscript() {
		clickElementByJSExecutor(hiddenNavToggleBtn);
		clickElementByJSExecutor(transcript);
		waitForJSandJQueryToLoad();
		return new TranscriptPage();
	}
	
	public StaffManagementPage clickStaffManagement() {
		clickElementByJSExecutor(hiddenNavToggleBtn);
		clickElementByJSExecutor(staffManagement);
		waitForJSandJQueryToLoad();
		return new StaffManagementPage();
	}
	
	public MyCredentialsPage clickMyCredentials() {
		clickElementByJSExecutor(hiddenNavToggleBtn);
		clickElementByJSExecutor(myCredentials);
		waitForJSandJQueryToLoad();
		return new MyCredentialsPage();
	}
	
	public RoomManagementPage clickRoomManagement() {
		clickElementByJSExecutor(hiddenNavToggleBtn);
		clickElementByJSExecutor(roomManagement);
		return new RoomManagementPage();
	}
}
