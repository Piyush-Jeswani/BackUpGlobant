package com.pm.tests.courseApprovalAdministration;
import static com.pm.data.testdata.TestData.TestData;
import org.testng.annotations.Test;
import com.pm.data.testdata.CourseApprovalAdmin;
import com.pm.pages.courseApprovalAdmin.CourseApprovalAdminPage;
import com.pm.pages.courseSection.CourseSectionPage;
import com.pm.tests.base.BaseTest;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;

import java.util.List;

public class CourseApprovalAdministrationTestSuite extends BaseTest{
	CourseApprovalAdmin sectionCopy = TestData.sectionCopy();
	CourseApprovalAdmin staffDevelopment = TestData.staffDevelopment();
	
	@Test(description = "EA-1387 : Validate that Admin can copy section for Approved course", groups = {"Admin","Course Approval Administration","UrgentPriority"})
	public void EA_1387() {
		String courseTitle = sectionCopy.getCourseTitle();
		String officeName = sectionCopy.getOfficeName();
		String sectionTitle = sectionCopy.getSectionTitle();
		administrationPage = homepage.getNavigationMenu().clickAdministrationTab();
		administrationPage.clickOnLink("Course Approval Administration");
		courseApprovalAdminPage = new CourseApprovalAdminPage();
		courseApprovalAdminPage.clickOnLink("Approved Courses");
		courseApprovalAdminPage.selectOffice(officeName);
		courseApprovalAdminPage.selectActionForUser(courseTitle, "Manage Course");
		courseApprovalAdminPage.clickOnLink("Edit Course");
		courseSectionPage = new CourseSectionPage();
		courseSectionPage.actionOnSection(sectionTitle, "Copy");
		String copiedSectionTitle = courseSectionPage.getSectionTitle();
		courseSectionPage.clickDoneButton();
		courseApprovalAdminPage.clickOnLink("Edit Course");

		assertThat("Failed to copy course section from course approval",courseSectionPage.verifySectionCopied(copiedSectionTitle), equalTo(true));
		courseSectionPage.copyOrDeleteSection(copiedSectionTitle, "Delete");
		assertThat("Failed to delete course section from course approval",courseSectionPage.verifySectionCopied(copiedSectionTitle), equalTo(false));
	}
	
	@Test(description = "EA-915 : Validate that Office Roles can be set in Course Approval", groups = {"Admin","UrgentPriority"})
	public void EA_915() throws InterruptedException {
		List<String> roles = staffDevelopment.getRoles();
		List<String> officeNames = staffDevelopment.getOfficeNames();
		List<String> userName = staffDevelopment.getUserNames();
		
		courseApprovalAdminPage = homepage.getNavigationMenu().clickAdministration();
		courseApprovalAdminPage = courseApprovalAdminPage.clickCourseApprovalAdminTab();
		
		for (String officeName : officeNames) {
			courseApprovalAdminPage.clickManageRolesTab();
			courseApprovalAdminPage.clickstaffManageButton(officeName);
			courseApprovalAdminPage.clickAssignRolesTab();
			
			for(int i=0;i<roles.size();i++) {
				courseApprovalAdminPage.selectRole(roles.get(i));
				courseApprovalAdminPage.deleteUser(userName.get(i));
				assertThat(courseApprovalAdminPage.verifyUserNameIsPresent(userName.get(i)),equalTo(false));
				courseApprovalAdminPage.clickAddUser();
				courseApprovalAdminPage.searchUser(userName.get(i));
				courseApprovalAdminPage.addUser();
				assertThat(courseApprovalAdminPage.verifyUserNameIsPresent(userName.get(i)),equalTo(true));
				assertThat(courseApprovalAdminPage.getUserRole(userName.get(i)), equalTo(roles.get(i)));
			}
			
		}	
	}

}
