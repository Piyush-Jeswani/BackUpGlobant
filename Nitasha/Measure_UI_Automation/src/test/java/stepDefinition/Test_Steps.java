package stepDefinition;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

import org.testng.Assert;

import com.pages.HomePage;
import com.pages.NetworkProfilePage;
import com.pages.NetworkSettingsPage;
import com.pages.QuantcastSettingsPage;
import com.pages.SiteProfilePage;
import com.pages.SubmitYourAppPage;
import com.pages.TopSitesPage;
import cucumber.api.DataTable;
import cucumber.api.java.en.Given;
import cucumber.api.java.en.Then;
import cucumber.api.java.en.When;

public class Test_Steps {

	TopSitesPage topsitespage;
	SiteProfilePage siteprofilepage;
	NetworkProfilePage networkProfilePage;
	NetworkSettingsPage networkSettingsPage;
	QuantcastSettingsPage quantcastSettingsPage;

	HomePage homePage;
	SubmitYourAppPage submitYourAppPage;
	String startDateBefore, startDateAfter, endDateBefore, endDateAfter, initialWidth, afterStartWidth, afterEndWidth;
	String pageTitle = "Quantcast - Dashboard";
	String newAppName = "", siteAddress = "";
	int containersize;

	@Given("^I am at the Top Websites page$")
	public void i_am_at_the_Top_Websites_page() throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		// //Write the code to handle Data Table
		homePage.clickOnSearchGlass();
		topsitespage = homePage.clickOnTop100Link();
	}

	@When("^I navigate to the site profile page$")
	public void i_navigate_to_the_site_profile_page(DataTable siteAddress) throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		// For automatic transformation, change DataTable to one of
		// List<YourType>, List<List<E>>, List<Map<K,V>> or Map<K,V>.
		// E,K,V must be a scalar (String, Integer, Date, enum etc)
		List<List<String>> data = siteAddress.raw();
		siteprofilepage = topsitespage.clickOnSite(data.get(0).get(0));
	}

	@When("^I navigate to the site profile page through url$")
	public void i_navigate_to_the_site_profile_page_through_url(DataTable siteAddress) throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		// For automatic transformation, change DataTable to one of
		// List<YourType>, List<List<E>>, List<Map<K,V>> or Map<K,V>.
		// E,K,V must be a scalar (String, Integer, Date, enum etc)
		List<List<String>> data = siteAddress.raw();
		siteprofilepage = homePage.clickOnProfilePageURL(data.get(0).get(0));
	}

	@Then("^I will see the Global header$")
	public void i_will_see_the_Global_header() throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		Assert.assertTrue(siteprofilepage.isGlobalHeaderDisplayed());
	}

	@Then("^I will see the Profile header with the site_logo$")
	public void i_will_see_the_Profile_header_with_the_site_logo(DataTable siteAddress) throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		List<List<String>> data = siteAddress.raw();
		Assert.assertTrue(siteprofilepage.isSiteNameDisplayed(data.get(0).get(0)));
	}

	@Then("^the site name$")
	public void the_site_name(DataTable siteAddress) throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		List<List<String>> data = siteAddress.raw();
		Assert.assertTrue(siteprofilepage.isSiteNameDisplayed(data.get(0).get(0)));
	}

	@Then("^the Quantcast logo$")
	public void the_Quantcast_logo() throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		Assert.assertTrue(siteprofilepage.isQuantCastLogoDisplayed());

	}

	@Then("^its site description$")
	public void its_site_description() throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		Assert.assertTrue(siteprofilepage.isSiteDescriptionDisplayed("today.com reaches over"));
	}

	@Given("^I log into Quantcast Meaure with a valid user and password$")
	public void i_log_into_Quantcast_Meaure_with_a_valid_user_and_password(DataTable usercredentials) throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		// Write the code to handle Data Table
		List<List<String>> data = usercredentials.raw();
		homePage = stepDefinition.Hooks.loginAs(data.get(0).get(0), data.get(0).get(1));
	}

	@When("^I land on my Dashboard$")
	public void i_land_on_my_Dashboard() throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		Assert.assertEquals(homePage.getTitle(), pageTitle);
	}

	@Then("^I will see the Global Header and Footer$")
	public void i_will_see_the_Global_Header_and_Footer() throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		Assert.assertTrue(homePage.isGlobalHeaderDisplayed());
		Assert.assertTrue(homePage.isGlobalFooterDisplayed());

	}

	@Then("^I will see the dashboard header with the \"([^\"]*)\" title, the \"([^\"]*)\" button and the \"([^\"]*)\" button$")
	public void i_will_see_the_dashboard_header_with_the_title_the_button_and_the_button(String arg1, String arg2,
			String arg3) throws Throwable {
		// Write code here that turns the phrase above into concrete actions

		Assert.assertEquals(homePage.getPropertiesTitle(), "Properties");
		Assert.assertTrue(homePage.isClassicButtonDisplayed());
		Assert.assertEquals(homePage.getClassicButtonText(), "CLASSIC");
		Assert.assertTrue(homePage.isThreeDotsDisplayed());
	}

	@Then("^I will see the \"([^\"]*)\"$")
	public void i_will_see_the(String arg1) throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		Assert.assertTrue(homePage.isInstructionsContainerDisplayed());
	}

	@Then("^I will see the \"([^\"]*)\" title$")
	public void i_will_see_the_title(String arg1) throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		Assert.assertEquals(homePage.getMyProperties(), "MY PROPERTIES");
	}

	@Then("^I will see the Network container$")
	public void i_will_see_the_Network_container() throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		Assert.assertTrue(homePage.isNetworkContainerDisplayed());
	}

	@Then("^I will see my site properties containers$")
	public void i_will_see_my_site_properties_containers() throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		Assert.assertTrue(homePage.isSitePropertiesContainerDisplayed());
	}

	@Then("^I will see my mobile app properties containers$")
	public void i_will_see_my_mobile_app_properties_containers() throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		Assert.assertTrue(homePage.isMobileAppContainerDisplayed());
	}

	@Then("^I will se the right side component with the search bar and its links$")
	public void i_will_se_the_right_side_component_with_the_search_bar_and_its_links() throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		Assert.assertTrue(homePage.isSearchSiteBarDisplayed());
		Assert.assertTrue(homePage.islinksDisplayed());
	}

	@Then("^I will see the chat icon at the bottom right hand corner$")
	public void i_will_see_the_chat_icon_at_the_bottom_right_hand_corner() throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		Assert.assertTrue(homePage.isChartIconDisplayed());
	}

	/* FOR GRAPH HISTORY */

	@When("^I drag and drop the Start date selector$")
	public void i_drag_and_drop_the_Start_date_selector() throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		startDateBefore = siteprofilepage.getStartDateOnMap();
		endDateBefore = siteprofilepage.getEndDateOnMap();
		initialWidth = siteprofilepage.getBlueHighlightedSectionWidth();
		siteprofilepage.changeTrafficHistoryStartDate();
		afterStartWidth = siteprofilepage.getBlueHighlightedSectionWidth();
	}

	@Then("^the blue highlighted section of the graph will expand up to the point I dropped the Start date selector$")
	public void the_blue_highlighted_section_of_the_graph_will_expand_up_to_the_point_I_dropped_the_Start_date_selector()
			throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		Assert.assertTrue(siteprofilepage.isBlueHighlightedGraphExpanded(initialWidth, afterStartWidth));
	}

	@Then("^the main graph above the History graph will be updated with the new start dates selected from the History graph$")
	public void the_main_graph_above_the_History_graph_will_be_updated_with_the_new_start_dates_selected_from_the_History_graph()
			throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		startDateAfter = siteprofilepage.getStartDateOnMap();
		Assert.assertTrue(siteprofilepage.isStartDateOnMapUpdated(startDateBefore, startDateAfter));
	}

	@Then("^the start From date field in the Custom section on the right will update with the date selected in the graph$")
	public void the_start_From_date_field_in_the_Custom_section_on_the_right_will_update_with_the_date_selected_in_the_graph()
			throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		Date sdate = new SimpleDateFormat("MM/dd/yyyy").parse(siteprofilepage.getCustomStartDate());

		String[] startDate = sdate.toString().split(" ");
		for (String part : startDate) {
			Assert.assertTrue(sdate.toString().contains(part));
		}
	}

	@When("^I drag and drop the End date selector$")
	public void i_drag_and_drop_the_End_date_selector() throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		endDateBefore = siteprofilepage.getEndDateOnMap();
		siteprofilepage.changeTrafficHistoryEndDate();
		afterEndWidth = siteprofilepage.getBlueHighlightedSectionWidth();
	}

	@Then("^the blue highlighted section of the graph will expand up to the point I dropped the End date selector$")
	public void the_blue_highlighted_section_of_the_graph_will_expand_up_to_the_point_I_dropped_the_End_date_selector()
			throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		Assert.assertTrue(siteprofilepage.isBlueHighlightedGraphReduced(afterStartWidth, afterEndWidth));
		// Assert.assertTrue(siteprofilepage.isMapUpdated());
	}

	@Then("^the main graph above the History graph will be updated with the new end dates selected from the History graph$")
	public void the_main_graph_above_the_History_graph_will_be_updated_with_the_new_end_dates_selected_from_the_History_graph()
			throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		endDateAfter = siteprofilepage.getEndDateOnMap();
		Assert.assertTrue(siteprofilepage.isEndDateOnMapUpdated(endDateBefore, endDateAfter));
	}

	@Then("^the end To date field in the Custom section on the right will update with the date selected in the graph$")
	public void the_end_To_date_field_in_the_Custom_section_on_the_right_will_update_with_the_date_selected_in_the_graph()
			throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		Date sdate = new SimpleDateFormat("MM/dd/yyyy").parse(siteprofilepage.getCustomEndDate());

		String[] endDate = sdate.toString().split(" ");
		for (String part : endDate) {
			Assert.assertTrue(sdate.toString().contains(part));
		}
	}

	/// For add property

	@Given("^I am logged into Quantcast Measure with a valid user and password$")
	public void i_am_logged_into_Quantcast_Measure_with_a_valid_user_and_password(DataTable usercredentials)
			throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		// For automatic transformation, change DataTable to one of
		// List<YourType>, List<List<E>>, List<Map<K,V>> or Map<K,V>.
		// E,K,V must be a scalar (String, Integer, Date, enum etc)
		List<List<String>> data = usercredentials.raw();
		homePage = stepDefinition.Hooks.loginAs(data.get(0).get(0), data.get(0).get(1));
		Assert.assertEquals(homePage.getTitle(), pageTitle);
	}

	@Given("^I click the ADD PROPERTY button$")
	public void i_click_the_ADD_PROPERTY_button() throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		submitYourAppPage = homePage.selectAddProperty();
	}

	@Given("^I click the Add Mobile app option from the displayed menu$")
	public void i_click_the_Add_Mobile_app_option_from_the_displayed_menu() throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		submitYourAppPage = homePage.selectAddMobileApp();
	}

	@Given("^I navigate to the Submit Your mobile app$")
	public void i_navigate_to_the_Submit_Your_mobile_app() throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		Assert.assertEquals(submitYourAppPage.getSubmitPageElementTitle(), "Submit your mobile app");
	}

	@Given("^I navigate to the Submit Your Site page$")
	public void i_navigate_to_the_Submit_Your_Site_page() throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		Assert.assertEquals(submitYourAppPage.getSubmitPagesiteTitle(), "Submit your site");
	}

	@Given("^I enter the appname of my mobile app to be quantified$")
	public void i_enter_the_appname_of_my_mobile_app_to_be_quantified(DataTable appName) throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		// For automatic transformation, change DataTable to one of
		// List<YourType>, List<List<E>>, List<Map<K,V>> or Map<K,V>.
		// E,K,V must be a scalar (String, Integer, Date, enum etc)
		List<List<String>> data = appName.raw();
		newAppName = submitYourAppPage.enterMobileAppName(data.get(0).get(0));
	}

	@Given("^I select underThirteen\\? in the underThirteen website radio button$")
	public void i_select_underThirteen_in_the_underThirteen_website_radio_button(DataTable arg1) throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		// For automatic transformation, change DataTable to one of
		// List<YourType>, List<List<E>>, List<Map<K,V>> or Map<K,V>.
		// E,K,V must be a scalar (String, Integer, Date, enum etc)
		List<List<String>> data = arg1.raw();
		submitYourAppPage.selectSiteRadioButton(data.get(0).get(0));
	}

	@Given("^I select underThirteen\\? in the underThirteen Mobile radio button$")
	public void i_select_underThirteen_in_the_underThirteen_Mobile_radio_button(DataTable arg1) throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		// For automatic transformation, change DataTable to one of
		// List<YourType>, List<List<E>>, List<Map<K,V>> or Map<K,V>.
		// E,K,V must be a scalar (String, Integer, Date, enum etc)
		List<List<String>> data = arg1.raw();
		submitYourAppPage.selectRadioButton(data.get(0).get(0));
	}

	@Given("^I click the SUBMIT button$")
	public void i_click_the_SUBMIT_button() throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		submitYourAppPage.selectSubmitButton();
	}

	@Given("^I navigate to the \"([^\"]*)\"Your SDK\"([^\"]*)\" page$")
	public void i_navigate_to_the_Your_SDK_page(String arg1, String arg2) throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		Assert.assertEquals(submitYourAppPage.getYourSdkTitle(), "Your SDK");
	}

	@When("^I click the I've installed the SDK button$")
	public void i_click_the_I_ve_installed_the_SDK_button() throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		submitYourAppPage.selectInstalledSdkButton();
	}

	@Then("^I navigate back to my Dashboard$")
	public void i_navigate_back_to_my_Dashboard() throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		Assert.assertEquals(homePage.getTitle(), pageTitle);
	}

	@Then("^the new mobile app property appears with app_name in the container and the \"([^\"]*)\" label in yellow$")
	public void the_new_mobile_app_property_appears_with_app_name_in_the_container_and_the_label_in_yellow(String arg1,
			DataTable arg2) throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		// For automatic transformation, change DataTable to one of
		// List<YourType>, List<List<E>>, List<Map<K,V>> or Map<K,V>.
		// E,K,V must be a scalar (String, Integer, Date, enum etc)
		Assert.assertTrue(submitYourAppPage.isAppNameDisplayed(newAppName));
		Assert.assertTrue(submitYourAppPage.isAppStatusInYellow());
		containersize = submitYourAppPage.getContainerSize();
	}

	@Then("^upon hovering over the container it will get greyed out and display the \"([^\"]*)\"Download SDK\"([^\"]*)\" button$")
	public void upon_hovering_over_the_container_it_will_get_greyed_out_and_display_the_Download_SDK_button(String arg1,
			String arg2) throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		Assert.assertTrue(submitYourAppPage.isDownloadSdkButtonDisplayed());
		Assert.assertTrue(submitYourAppPage.isContainerGetGreyedOut());
	}

	@Given("^I click the Add Website option from the displayed menu$")
	public void i_click_the_Add_Website_option_from_the_displayed_menu() throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		homePage.selectAddWebsite();
	}

	@Given("^I enter valid url of a valid site$")
	public void i_enter_valid_url_of_a_valid_site() throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		// For automatic transformation, change DataTable to one of
		// List<YourType>, List<List<E>>, List<Map<K,V>> or Map<K,V>.
		// E,K,V must be a scalar (String, Integer, Date, enum etc)
		siteAddress = submitYourAppPage.enterSiteAddress();
	}

	@Given("^I click the site SUBMIT button$")
	public void i_click_the_site_SUBMIT_button() throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		submitYourAppPage.SelectSiteSubmitButton();
	}

	@Given("^I navigate to the Add Tag page$")
	public void i_navigate_to_the_Add_Tag_page() throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		Assert.assertEquals(submitYourAppPage.getTagPageTitle(), "Add tag with");
	}

	@When("^I click the \"([^\"]*)\" button$")
	public void i_click_the_button(String arg1) throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		submitYourAppPage.selectInstalledSdkButton();
	}

	@Then("^the new property appears with url in the container and the \"([^\"]*)\" label in yellow$")
	public void the_new_property_appears_with_url_in_the_container_and_the_label_in_yellow(String arg1)
			throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		Assert.assertTrue(submitYourAppPage.isAppNameDisplayed(siteAddress));
		Assert.assertTrue(submitYourAppPage.isAppStatusInYellow());

		System.out.println("Before Deletion" + containersize);
	}

	@Then("^I have NOT added the tag to my site$")
	public void i_have_NOT_added_the_tag_to_my_site() throws Throwable {
		// Write code here that turns the phrase above into concrete actions

	}

	@Then("^I hover over my property's container$")
	public void i_hover_over_my_property_s_container() throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		homePage.HoverOverContainer();
	}

	@When("^I click the Trash delete icon$")
	public void i_click_the_Trash_delete_icon() throws Throwable {
		// Write code here that turns the phrase above into concrete actions

		submitYourAppPage.DeletewebSite();
	}

	@Then("^the site property is deleted and its container removed from my Dashboard$")
	public void the_site_property_is_deleted_and_its_container_removed_from_my_Dashboard() throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		Assert.assertTrue(submitYourAppPage.isSiteContainerDeleted());
	}

	@Then("^I click the Edit Setting wheel icon$")
	public void i_click_the_Edit_Setting_wheel_icon() throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		quantcastSettingsPage = homePage.editSettings();
	}

	@Then("^I navigate to the mobile app's setting page$")
	public void i_navigate_to_the_mobile_app_s_setting_page() throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		Assert.assertEquals(submitYourAppPage.getTitle(), "Quantcast - Settings");
	}

	@When("^click the Delete Mobile App button and I confirm the warning modal$")
	public void click_the_Delete_Mobile_App_button_and_I_confirm_the_warning_modal() throws Throwable {
		// Write code here that turns the phrase above into concrete actions

		submitYourAppPage.SelectDeleteMobileApp();
	}

	@Then("^the mobile app property is deleted and its container removed from my Dashboard$")
	public void the_mobile_app_property_is_deleted_and_its_container_removed_from_my_Dashboard() throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		Assert.assertTrue(submitYourAppPage.isMobileAppContainerDeleted(containersize));
	}

	@When("^I click the \"([^\"]*)\" button from the Network container$")
	public void i_click_the_button_from_the_Network_container(String arg1) throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		networkProfilePage = homePage.clickOnViewData();
	}

	@Then("^I navigate to the Network Profile page$")
	public void i_navigate_to_the_Network_Profile_page() throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		Assert.assertEquals(networkProfilePage.getTitle(), "Testing Network Audience Insights - Quantcast");
	}

	@When("^I click the \"([^\"]*)\" wheel icon from the Network container$")
	public void i_click_the_wheel_icon_from_the_Network_container(String arg1) throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		networkSettingsPage = homePage.clickOnEditSettingsWheel();
	}

	@Then("^I navigate to the Publisher Network Settings page$")
	public void i_navigate_to_the_Publisher_Network_Settings_page() throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		Assert.assertEquals(networkSettingsPage.getTitle(), "Quantcast - Settings");
	}

	@When("^I click on the view wheel icon dropdownk$")
	public void i_click_on_the_view_wheel_icon_dropdownk() throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		siteprofilepage.clickOnWheelIcon();
	}

	@When("^I click the Impersonate option$")
	public void i_click_the_Impersonate_option() throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		siteprofilepage.clickOnImpersonateLink();
	}

	@When("^I navigate to the Dashboard$")
	public void i_navigate_to_the_Dashboard() throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		siteprofilepage.clickOnPropertiesLink();
	}

	@Then("^I will land in the Dashboard as though I were the <profile>'s publisher$")
	public void i_will_land_in_the_Dashboard_as_though_I_were_the_profile_s_publisher() throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		// throw new PendingException();
	}

	/*
	 * @Given("^I am logged into Quantcast Measure with a valid <user> and <password>$"
	 * ) public void
	 * i_am_logged_into_Quantcast_Measure_with_a_valid_user_and_password()
	 * throws Throwable { // Write code here that turns the phrase above into
	 * concrete actions throw new PendingException(); }
	 * 
	 * @Given("^I am at my Dashboard$") public void i_am_at_my_Dashboard()
	 * throws Throwable { // Write code here that turns the phrase above into
	 * concrete actions throw new PendingException(); }
	 * 
	 * @Given("^I have added a Site property$") public void
	 * i_have_added_a_Site_property() throws Throwable { // Write code here that
	 * turns the phrase above into concrete actions throw new
	 * PendingException(); }
	 * 
	 * @Given("^my property is active$") public void my_property_is_active()
	 * throws Throwable { // Write code here that turns the phrase above into
	 * concrete actions throw new PendingException(); }
	 */

	@Given("^I click the VIEW DATA button$")
	public void i_click_the_VIEW_DATA_button() throws Throwable {
		// Write code here that turns the phrase above into concrete actions
		siteprofilepage = homePage.clickOnViewYourData();
	}

	@Given("^I will navigate to my site's Profile page$")
	public void i_will_navigate_to_my_site_s_Profile_page(DataTable SiteTitle) throws Throwable {

		List<List<String>> data = SiteTitle.raw();
		Assert.assertEquals(siteprofilepage.getTitle(), data.get(0).get(0));
	}

	@When("^I will navigate to my site's Settings edition page$")
	public void i_will_navigate_to_my_site_s_Settings_edition_page(DataTable SiteHeader) throws Throwable {
		List<List<String>> data = SiteHeader.raw();
		Assert.assertEquals(quantcastSettingsPage.getTitle(), data.get(0).get(0));
	}
}
