package testScripts;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.annotations.Test;

import base.TestBase;
import pageClasses.HomePage_StarMeUp;
import pageClasses.Login_StarMeUp;
import utility.ReadProperty;

public class SearchBar extends TestBase {

	Login_StarMeUp lg;
	HomePage_StarMeUp home;

	@Test
	public void searchBarFunctionality() {

		try {

			ReadProperty p = new ReadProperty();

			lg = new Login_StarMeUp(driver);
			home = lg.makeLogin();
			WebDriverWait wait = new WebDriverWait(driver, 10);
			WebElement element = wait
					.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("#rankPanel div h4")));
			home = new HomePage_StarMeUp(driver);
			home.searchNameInSearchBar("#user3");
			home.selectUserFromDropDown("#user3");
			Assert.assertTrue(home.divContainsUserName("user3"));
			home.clickFirstRightBlock();// validate
			Assert.assertTrue(home.validateStarNameInProfileDisplayed("user3"));
			home.clickGiveStarBtnFromProfile();
			Assert.assertTrue(home.validateTheLabelOnPopUpWindow());
			Assert.assertTrue(home.validateAllcategoriesOnPopUpWindowArePresent());
			home.selectCategoryByName("THINK BIG EN UPDATE");
			Assert.assertTrue(home.getSelectedCategoryName().equalsIgnoreCase("Think big en update"));
			home.enterCommentForStar("Testing Comments in Pop Up Window");
			home.clickUploadImageBtnOnPopUpWindow();

			Runtime.getRuntime().exec("D:\\Softwares\\AutoIT\\ImageUploadScript.exe");
			home.clickSaveBtnPopUp();

		} catch (Exception e) {
			e.printStackTrace();
		}

	}
}
