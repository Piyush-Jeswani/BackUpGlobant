package com.pm.tests.roomManagement;

import static com.pm.data.testdata.TestData.TestData;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.core.IsEqual.equalTo;

import java.util.Date;

import org.testng.annotations.Test;

import com.pm.data.testdata.RoomBookingData;
import com.pm.pages.roomManagement.RoomManagementPage;
import com.pm.tests.base.BaseTest;

public class RoomManagementTestSuite extends BaseTest{
	RoomBookingData bookRoom = TestData.bookRoom();
	private static final Date currentDate = new Date();
	@Test(description = "EA-778 : Validate that Room Management links are displayed as expected", groups={"Principal","Room Management","PLMS","UrgentPriority"},priority=1)
	public void EA_778() {
		roomManagementPage = homepage.getNavigationMenu().clickRoomManagement();
		assertThat("Book Room link is not present", roomManagementPage.verifyLinkIsPresent("Book Room"),equalTo(true));
		assertThat("My Room Requests link is not present", roomManagementPage.verifyLinkIsPresent("My Room Requests"),equalTo(true));
		assertThat("My Events link is not present", roomManagementPage.verifyLinkIsPresent("My Events"),equalTo(true));
		assertThat("Manage Requests link is not present", roomManagementPage.verifyLinkIsPresent("Manage Requests"),equalTo(true));
		assertThat("View Schedule link is not present", roomManagementPage.verifyLinkIsPresent("View Schedule"),equalTo(true));
	}
	
	@Test(description="EA-779 : Validate that Book Room page loads successfully and user is able to see Create an Event page", groups={"Principal","Room Management","PLMS","UrgentPriority"},dependsOnMethods={"EA_778"},priority=1)
	public void EA_779(){
		String title = bookRoom.getEventTitle()+"_"+currentDate;
		String organization = bookRoom.getEventOrganization();
		String description = bookRoom.getEventDescription();
		String eventRequest = bookRoom.getEventRequest();
		String contact = bookRoom.getEventContact();
		roomManagementPage = new RoomManagementPage();
		
		roomManagementPage.clickBookRoom();
		assertThat("User not able to view Create Event page", roomManagementPage.verifyPageHeader(),equalTo("Edit Event"));
		roomManagementPage.bookRoom(title, organization, description, eventRequest, contact);
		assertThat("Failed to create Event", roomManagementPage.verifyEventCreated(),equalTo(title));
	}
}
