package com.pm.tests.PDManagement;

import static com.pm.data.testdata.TestData.TestData;

import org.testng.annotations.Test;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.core.IsEqual.equalTo;
import java.io.IOException;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import com.pm.data.testdata.PDUserData;
import com.pm.data.users.User;
import com.pm.functions.CommonFunctions;
import com.pm.pages.administration.UserAccountsPage;
import com.pm.tests.base.BaseTest;

public class PDPlaylistTestSuite extends BaseTest{
	
	User principal = TestData.Principal();
	PDUserData userData = TestData.PDUserData();
	private static final Date date = new Date();
	
	
	@Test(description="EA-7480 : RE:Allow users to hide or show completed playlist from teaser" , groups = "Admin")
	public void EA_7480() throws InterruptedException{
		String lastname = "1";
		String firstname = "test";
		
		String courseName = TestData.CourseName();
		commonFunctions = new CommonFunctions();
		commonFunctions.masqueradeAs(firstname, lastname);
		
		homepage.MyCoursesSection().showPDPlaylist();
		homepage.MyCoursesSection().hidePlaylist(courseName);
		homepage.MyCoursesSection().clickViewHiddenPlaylist();
		
		assertThat("Course is not added to hidden playlist",homepage.MyCoursesSection().verfiyCourseHidden(courseName), equalTo(true));
		homepage.MyCoursesSection().showOnTeaser(courseName);
		
		commonFunctions.stopMasquerading();
	}
	
	@Test(description="EA-6750 : Secondary moderators can be added/removed on playlists", groups = "Admin",priority=1)
	public void EA_6750() throws InterruptedException {
		String firstname = userData.getFirstName();
		String lastname = userData.getLastName();
		String moderator = userData.getModerator();
		String playlistName = userData.getPlaylistName()+"_"+date;
		commonFunctions = new CommonFunctions();
		
		commonFunctions.stopMasquerading();
		administrationPage  = homepage.getNavigationMenu().clickAdministrationTab();
		courseAdministrationPage = administrationPage.clickCourseAdministration();
		pdManagementPage = courseAdministrationPage.clickOnTheLink("Manage Administrators");
		pdManagementPage.deleteUser(moderator, firstname);
		List<String> userNamesList = pdManagementPage.getPDUserList(moderator);
		
		
		
		pdManagementPage.addModerator(firstname, lastname,moderator);
		
		String firstName = pdManagementPage.verifyUserAdded(moderator,firstname);
		assertThat(firstName, containsString(firstname));
		
		commonFunctions.masqueradeAs(firstname, lastname);
		
		pdPlaylistPage = homepage.getNavigationMenu().clickPDPlayList();
//		pdPlaylistPage.clickOnLink("Manage PD Playlists");
		pdPlaylistPage.createPlaylist(playlistName);
		pdPlaylistPage.clickAddModerator();
		
		List<String> list2 = pdPlaylistPage.getUserList();
		assertThat("User list are different for superuser and moderator",pdPlaylistPage.compareList(userNamesList, list2), equalTo(true));
		
		pdPlaylistPage.addModerator();
		assertThat("Delete icon is present for all users",pdPlaylistPage.isDeleteIconDisplayedForMultiUsers(firstname, lastname), equalTo(true));
		assertThat("Delete icon is present for given user",pdPlaylistPage.isDeleteIconForSingleUser(firstname, lastname), equalTo(true));
		
		pdPlaylistPage.deleteModerator(list2.get(1));
		pdPlaylistPage.deleteModerator(list2.get(2));
		pdPlaylistPage.deleteModerator(list2.get(3));
		assertThat("Failed to delete user",pdPlaylistPage.verifyUserDeleted(list2.get(1)), equalTo(false));
	}
	
	@Test(description ="EA-6751 : Secondary moderators can edit pd playlists",groups = "Admin",dependsOnMethods = { "EA_6750" }, priority = 1)
	public void EA_6751() throws InterruptedException, IOException, ParseException {
		String playlistName = userData.getPlaylistName()+"_"+date;
		String description = userData.getDescription();
		
		Date date = new Date();
		DateFormat dateFormatForSendKeys = new SimpleDateFormat("dd/MM/yyyy");
		DateFormat dateFormatForVerification = new SimpleDateFormat("yyyy-MM-dd");
		String startDate  = dateFormatForSendKeys.format(date);
		String endDate = dateFormatForSendKeys.format(date);
		String sDate = dateFormatForVerification.format(date);
		String eDate = dateFormatForVerification.format(date);
		
		String discussionTitle = userData.getDiscussionTitle();
		String discussionComment = userData.getDiscussionComment();
		String notificationTitle = userData.getNotificationTitle();
		String notificationMessage = userData.getNotificationMessage();
		commonFunctions = new CommonFunctions();
		
		pdPlaylistPage.getModeratorList();
		
		List<String> userNameList = pdPlaylistPage.getModeratorList();
		String userName[] = userNameList.get(1).split(",");
		String fName = userName[0];
		String lName = userName[1];
		
		userAccountPage = new UserAccountsPage();
		commonFunctions.stopMasquerading();
		
		commonFunctions.masqueradeAs(lName, fName);
		
		pdPlaylistPage = homepage.getNavigationMenu().clickPDPlayList();
		assertThat("Not able to find given playlist",pdPlaylistPage.isPlaylistPresent(playlistName), equalTo(true));
		pdPlaylistPage.clickPlayList(playlistName);
		pdPlaylistPage.editPlayList(description,startDate,endDate);
		
		assertThat(pdPlaylistPage.getDescriptionText(), equalTo(description));
		assertThat(pdPlaylistPage.getStartDate(), equalTo(sDate));
		assertThat(pdPlaylistPage.getEndDate(), equalTo(eDate));
		
		pdPlaylistPage.clickTab("Participants");
		assertThat("Participants tab is not active",pdPlaylistPage.verifyTabIsActive("Participants"), equalTo(true));
		
		//Add Participant and verify added
		pdPlaylistPage.participant().addParticipant("Add Participants by Name");
		assertThat("Failed to add participant",pdPlaylistPage.participant().getParticipantListCount(), equalTo(true));
		
		//Remove Participant and verify removed
		pdPlaylistPage.participant().removeParticipants();
		assertThat("Failed to remove participant",pdPlaylistPage.participant().getParticipantListCount(), equalTo(false));
		
		pdPlaylistPage.clickTab("Courses");
		assertThat("Courses tab is not active",pdPlaylistPage.verifyTabIsActive("Courses"), equalTo(true));
		
		//Add Course and verify added
		pdPlaylistPage.course().addCourse();
		assertThat("Failed to add course",pdPlaylistPage.course().verifyCourseRemoved(), equalTo(true));
		
		//Remove Course and verify removed
		pdPlaylistPage.course().removeCourse();
		assertThat("Failed to remove course",pdPlaylistPage.course().verifyCourseRemoved(), equalTo(false));
		
		
		pdPlaylistPage.clickTab("Discussion");
		assertThat("Discussion tab is not active",pdPlaylistPage.verifyTabIsActive("Discussion"), equalTo(true));
		
		pdPlaylistPage.discussion().addThread(discussionTitle,discussionComment);
		assertThat("Failed to add thread",pdPlaylistPage.discussion().verifyThread(), equalTo(true));
		
		pdPlaylistPage.clickTab("Notifications");
		assertThat("Notifications tab is not active",pdPlaylistPage.verifyTabIsActive("Notifications"), equalTo(true));
		pdPlaylistPage.notification().addNotification(notificationTitle,notificationMessage);
		
		
		pdPlaylistPage.clickTab("Discussion");
		pdPlaylistPage.clickTab("Notifications");
		assertThat("Notification title is not added",pdPlaylistPage.notification().getTitleText(), equalTo(notificationTitle));
		assertThat("Notification message not added",pdPlaylistPage.notification().getMessageText(), equalTo(notificationMessage));
		pdPlaylistPage.notification().switchToDefault();
		commonFunctions.stopMasquerading();
		
	}
	
	@Test(description = "EA-6752 : Secondary moderators can add additional moderators", groups = "Admin",dependsOnMethods = { "EA_6750" }, priority = 1)
	public void EA_6752() throws InterruptedException {
		String moderator = userData.getModerator();
		String firstname = userData.getFirstName();
		String lastname = userData.getLastName();
		String playlistName = userData.getPlaylistName()+"_"+date;
		commonFunctions = new CommonFunctions();
		
		commonFunctions.stopMasquerading();
		administrationPage  = homepage.getNavigationMenu().clickAdministrationTab();
		courseAdministrationPage = administrationPage.clickCourseAdministration();
		pdManagementPage = courseAdministrationPage.clickOnTheLink("Manage Administrators");
		
		List<String> userNamesList = pdManagementPage.getPDUserList(moderator);
		
		commonFunctions.masqueradeAs(firstname, lastname);
		
		pdPlaylistPage = homepage.getNavigationMenu().clickPDPlayList();
		assertThat("Not able to find playlist",pdPlaylistPage.isPlaylistPresent(playlistName), equalTo(true));
		pdPlaylistPage.clickPlayList(playlistName);
		pdPlaylistPage.clickTab("Details");
		pdPlaylistPage.clickAddModerator();
		List<String> userList = pdPlaylistPage.getUserList();
		pdPlaylistPage.addModerator();
		
		List<String> moderatorList = pdPlaylistPage.getModeratorList();
		pdPlaylistPage.verifyListContains(moderatorList, userList);
		assertThat("User list and moderator list are different",pdPlaylistPage.verifyListContains(moderatorList, userList),equalTo(true));
		assertThat("Moderator lists for secondary moderator and admin user are different",pdPlaylistPage.verifyListContains(userNamesList, userList),equalTo(true));
		commonFunctions.stopMasquerading();
	}
	
	@Test(description = "EA-6753 : Superusers who are not tnl.admin can't delete PD playlist creators", groups = "Admin",dependsOnMethods = { "EA_6750" }, priority = 1)
	public void EA_6753() throws InterruptedException {
		String firstName = "SuperUser";
		String lastName = "Test";
		commonFunctions = new CommonFunctions();
		
		commonFunctions.stopMasquerading();
		commonFunctions.masqueradeAs(lastName, firstName);
		
		administrationPage  = homepage.getNavigationMenu().clickAdministrationTab();
		courseAdministrationPage = administrationPage.clickCourseAdministration();
		pdManagementPage = courseAdministrationPage.clickOnTheLink("Manage Administrators");
		assertThat("No delete icon for moderator when logged in with super user",pdManagementPage.verifyDeleteIconForModerator(firstName, lastName),equalTo(false));
		commonFunctions.stopMasquerading();
	}
	
	@Test(description = "EA-6754 : Secondary moderators are automatically removed from Details tab when rights are removed",groups = "Admin",dependsOnMethods = { "EA_6750" }, priority = 1)
	public void EA_6754() throws InterruptedException {
		String moderatorFName = userData.getModeratorFName();
		String moderatorLName = userData.getModeratorLName();
		String moderator = userData.getModerator();
		String firstname = userData.getFirstName();
		String lastname = userData.getLastName();
		String playlistName = userData.getPlaylistName()+"_"+date;
		String moderatorName = moderatorLName+", "+moderatorLName;
		commonFunctions = new CommonFunctions();
		
		commonFunctions.stopMasquerading();
		userAccountPage = new UserAccountsPage();
		
		administrationPage  = homepage.getNavigationMenu().clickAdministrationTab();
		courseAdministrationPage = administrationPage.clickCourseAdministration();
		pdManagementPage = courseAdministrationPage.clickOnTheLink("Manage Administrators");
		
		pdManagementPage.deleteUser(moderator, moderatorFName);
		pdManagementPage.addModerator(moderatorFName, moderatorLName,moderator);
		
		commonFunctions.masqueradeAs(firstname, lastname);
		
		pdPlaylistPage = homepage.getNavigationMenu().clickPDPlayList();
		assertThat("Not able to search playlist",pdPlaylistPage.isPlaylistPresent(playlistName), equalTo(true));
		pdPlaylistPage.clickPlayList(playlistName);
		pdPlaylistPage.clickAddModerator();
		pdPlaylistPage.addSingleModerator(moderatorFName, moderatorLName);
		
		userAccountPage = new UserAccountsPage();
		commonFunctions.stopMasquerading();
		
		administrationPage  = homepage.getNavigationMenu().clickAdministrationTab();
		courseAdministrationPage = administrationPage.clickCourseAdministration();
		pdManagementPage = courseAdministrationPage.clickOnTheLink("Manage Administrators");
		
		pdManagementPage.deleteUser(moderator, moderatorFName);
		
		commonFunctions.masqueradeAs(firstname, lastname);
		
		pdPlaylistPage = homepage.getNavigationMenu().clickPDPlayList();
		assertThat("Failed to find playlist",pdPlaylistPage.isPlaylistPresent(playlistName), equalTo(true));
		pdPlaylistPage.clickPlayList(playlistName);
		assertThat("Failed to delete moderator",pdPlaylistPage.verifyUserDeleted(moderatorName), equalTo(false));
		

		userAccountPage = new UserAccountsPage();
		commonFunctions.stopMasquerading();
		
		administrationPage  = homepage.getNavigationMenu().clickAdministrationTab();
		courseAdministrationPage = administrationPage.clickCourseAdministration();
		pdManagementPage = courseAdministrationPage.clickOnTheLink("Manage Administrators");
		
		pdManagementPage.deleteUser(moderator, firstname);
	}
}