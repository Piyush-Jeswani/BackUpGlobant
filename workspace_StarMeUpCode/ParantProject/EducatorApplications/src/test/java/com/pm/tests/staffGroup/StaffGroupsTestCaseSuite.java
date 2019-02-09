package com.pm.tests.staffGroup;

import static com.pm.data.testdata.TestData.TestData;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.core.IsEqual.equalTo;

import java.text.ParseException;
import java.time.LocalDate;
import java.util.Date;
import java.util.List;

import org.testng.annotations.Test;

import com.pm.data.testdata.StaffManagement;
import com.pm.functions.CommonFunctions;
import com.pm.pages.administration.StaffGroupPage;
import com.pm.tests.base.BaseTest;

public class StaffGroupsTestCaseSuite extends BaseTest{
	
	StaffManagement staffGroup = TestData.staffGroup();
	private static final Date date = new Date();
	
	@Test(description = "EA-6995 : Staff Groups - Main Staff Groups Page", groups = {"Admin","Staff Groups","UrgentPriority"})
	public void EA_6995() throws InterruptedException, ParseException {
		String groupName = staffGroup.getStaffGroupName()+"_"+date;
		String groupDescription = staffGroup.getStaffGroupDescription();
		String editedGroupName = staffGroup.getStaffGroupName()+"_Edit_"+date;
		String editedGroupDescription = staffGroup.getStaffGroupDescription()+"_Edited";
		String editedGroupNameBySuperUser = staffGroup.getStaffGroupName()+"_Edit__SuperUser"+date;
		String editedGroupDescriptionBySuperUser = staffGroup.getStaffGroupDescription()+"_Edited_SuperUser";
		String firstName = staffGroup.getFirstName();
		String lastName = staffGroup.getLastName();
		String userName = lastName+", "+firstName;
		String deleteText = "Are you sure you want to delete this staff group?";
		staffGroupPage = new StaffGroupPage();
		commonFunctions = new CommonFunctions();
		
		administrationPage = homepage.getNavigationMenu().clickAdministrationTab();
		administrationPage.clickOnLink("Staff Groups");
		
		staffGroupPage.displayAllResults();
		
		
		List<LocalDate> list1 =  staffGroupPage.getDateListSorted();
		staffGroupPage.clickLastUpdated();
		List<LocalDate> list2 =  staffGroupPage.getDateList();
		boolean flag = staffGroupPage.compareDateLists(list1, list2);
		assertThat("Staff groups are not sorted in correct date order",flag, equalTo(true));
		
		staffGroupPage.clickCreateStaffGroup();
		staffGroupPage.createEditStaffGroup(groupName, groupDescription);
		staffGroupPage.displayAllResults();
		assertThat("Failed to add staff group",staffGroupPage.isStaffGroupPresent(groupName), equalTo(true));
		
		staffGroupPage.clickEditIcon(groupName);
		staffGroupPage.createEditStaffGroup(editedGroupName, editedGroupDescription);
		staffGroupPage.displayAllResults();
		assertThat("Failed to edit staff group",staffGroupPage.isStaffGroupPresent(editedGroupName), equalTo(true));
		
		String deletePopUpText = staffGroupPage.clickDeleteIcon(editedGroupName,"Do Not Delete");
		assertThat("Text for delete popup does not matches",deletePopUpText, equalTo(deleteText));
		
		assertThat("Failed to get staff group",staffGroupPage.isStaffGroupPresent(editedGroupName), equalTo(true));
		
		List<String> groupNameList1 = staffGroupPage.getStaffGroupsList();
		
		commonFunctions.masqueradeAs(firstName, lastName);
		homepage.getNavigationMenu().clickAdministrationTab();
		administrationPage.clickOnLink("Staff Groups");
		staffGroupPage.displayAllResults();
		List<String> groupNameList2 = staffGroupPage.getStaffGroupsList();
		
		staffGroupPage.clickEditIcon(editedGroupName);
		
		staffGroupPage.clickMakeMeOwner();
		assertThat("Owner not added to staff group",staffGroupPage.getOwnerName(), containsString(userName));
		staffGroupPage.createEditStaffGroup(editedGroupNameBySuperUser, editedGroupDescriptionBySuperUser);
		staffGroupPage.displayAllResults();
		assertThat("Failed to edit staff group when logged in with super user",staffGroupPage.isStaffGroupPresent(editedGroupNameBySuperUser), equalTo(true));
		commonFunctions.stopMasquerading();
		
		homepage.getNavigationMenu().clickAdministrationTab();
		administrationPage.clickOnLink("Staff Groups");
		staffGroupPage.displayAllResults();
		
		staffGroupPage.clickDeleteIcon(editedGroupNameBySuperUser,"Delete");
		assertThat("Failed to delete staff group",staffGroupPage.isStaffGroupPresent(editedGroupNameBySuperUser), equalTo(false));
		assertThat("Group names list doesn't match",staffGroupPage.compareGroupNameList(groupNameList1, groupNameList2), equalTo(true));
	}
}
