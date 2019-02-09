/**
 * 
 */
package com.pm.tests.staffGroup;

import java.util.Date;
import java.text.ParseException;
import java.time.LocalDate;
import java.util.List;
import static com.pm.data.testdata.TestData.TestData;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.core.IsEqual.equalTo;
import static org.hamcrest.Matchers.containsString;
import org.testng.annotations.Test;
import com.pm.data.testdata.StaffManagement;
import com.pm.functions.CommonFunctions;
import com.pm.pages.administration.StaffGroupPage;
import com.pm.tests.base.BaseTest;

/**
 * @author ankita.patil
 *
 */
public class StaffGroupTestSuite extends BaseTest{
	StaffManagement staffGroup = TestData.staffGroup();
	private static final Date date = new Date();
		
	@Test(description = "EA-7464 : Staff groups can be sorted on 'Last Updated' column",groups = {"Admin", "Staff Groups"})
	public void EA_7464() throws InterruptedException, ParseException {
		administrationPage = homepage.getNavigationMenu().clickAdministrationTab();
		administrationPage.clickOnLink("Staff Groups");
		staffGroupPage = new StaffGroupPage();
		staffGroupPage.displayAllResults();
		List<LocalDate> list1 =  staffGroupPage.getDateListSorted();
		staffGroupPage.clickLastUpdated();
		List<LocalDate> list2 =  staffGroupPage.getDateList();
		boolean flag = staffGroupPage.compareDateLists(list1, list2);
		assertThat("Staff groups are not sorted in correct date order",flag, equalTo(true));
	}
}
