package com.pm.pages.common;

import java.io.IOException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import com.pm.data.users.User;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.containsString;
import static com.pm.data.testdata.TestData.TestData;

public class LoginPage extends BasePage {

	@FindBy(id = "Username")
	private WebElement usernameTxtBox;

	@FindBy(id = "Password")
	private WebElement passwordTxtBox;

	@FindBy(xpath = "//form[@id='tnl-login-form']//button[@type='submit']")
	private WebElement loginBtn;

	public LoginPage() {
		super();
		assertThat("Login page is not displayed", driver.getTitle(), containsString("Performance Matters"));
	}

	public HomePage login(String username, String password) throws InterruptedException {

		usernameTxtBox.clear();
		usernameTxtBox.sendKeys(username);
		passwordTxtBox.clear();
		passwordTxtBox.sendKeys(password);
		loginBtn.click();
		return new HomePage();
	}

	public HomePage loginAs(String user) throws InterruptedException, IOException {
		User userObj = null;
		user = user.toLowerCase();
		String username, password;

		switch (user) {
		case "admin":
			userObj = TestData.Admin();
			break;
		case "principal":
			userObj = TestData.Principal();
			break;
		case "teacher":
			userObj = TestData.Teacher();
			break;
		case "courseadmin":
			userObj = TestData.courseAdmin();
			break;
		case "coursesuperuser":
			userObj = TestData.CourseSuperUser();
			break;
		default:
			log.error("User details to login are not present in the list");

		}

		username = userObj.getUsername();
		password = userObj.getPassword();
		
		return login(username, password);

	}

}
