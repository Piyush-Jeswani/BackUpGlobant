package com.pm.tests.PDManagement;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.core.IsEqual.equalTo;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.testng.annotations.Test;

import com.pm.tests.base.BaseTest;

public class PDPlansTestSuite extends BaseTest{
	@Test(description = "EA-1782 : Validate that you should be able to create a new PD Plan via Dashboard", groups = {"Admin","PD Playlist","UrgentPriority"})
	public void EA_1782() {
		pdPlaylistPage = homepage.getNavigationMenu().clickPDPlayList();
		String playListName = "PlaylistName _1782";
		String creditType = "District";
		String value = "12.0";
		String testwn = "12.0";
		String testValue = "12.0";
		String testValueNew = "12.0";
		
		List<String> creditList = new ArrayList<>(Arrays.asList(creditType+" - "+value+" Value",creditType+" - "+testwn+" testwn",creditType+" - "+testValue+" test value",creditType+" - "+testValueNew+" Test Value New"));
		pdPlaylistPage.clickCreatePlayList();
		assertThat("No pop up opened for playlist", pdPlaylistPage.verifyCreatePlaylist(),equalTo("Create PD Playlist"));
		assertThat("Create button for playlist is not present", pdPlaylistPage.verifyCreatButtonPresent(),equalTo(true));
		assertThat("Playlist input not present", pdPlaylistPage.verifyPlaylistIsPresent(),equalTo(true));
		pdPlaylistPage.clickCancelButton();
		pdPlaylistPage.deletePlaylist(playListName);
		pdPlaylistPage.createPlaylist(playListName);
		pdPlaylistPage.addCredits(creditType,value,testwn,testValue,testValueNew);
		List<String> list2 = pdPlaylistPage.verifyColumnsText(playListName, "credit");
		assertThat("Credit Values are not added :", pdPlaylistPage.verifyListContains(creditList, list2),equalTo(true));
		assertThat("No release column present for playlist", pdPlaylistPage.verifyHeaderText(playListName, "released"),equalTo("No"));
		assertThat("Not able to find PD Playlist created", pdPlaylistPage.isPlaylistPresent(playListName),equalTo(true));
		pdPlaylistPage.deletePlaylist(playListName);
	}
}
