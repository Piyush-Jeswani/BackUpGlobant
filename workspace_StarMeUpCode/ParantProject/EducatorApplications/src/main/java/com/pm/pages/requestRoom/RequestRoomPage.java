package com.pm.pages.requestRoom;

import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;

import org.openqa.selenium.Alert;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.ui.Select;

import com.pm.pages.common.BasePage;
import com.pm.pages.courseSection.CourseSectionPage;

public class RequestRoomPage extends BasePage {
	DateFormat timeFormat = new SimpleDateFormat("hh:mm a");
    Date dateobj = new Date();
    
	@FindBy(xpath = "//form[@id='addRoom']//button")
	private WebElement addRoomButton;
	
	public RequestRoomPage() {
		super();
	}
	
	public CourseSectionPage requestRoom(String date,String title) throws ParseException {
		String windowBefore = driver.getWindowHandle();
		String startTime = "10,30,AM";
    	String endTime = "4,30,PM";
		ArrayList<String> windowHandles = new ArrayList<String> (driver.getWindowHandles());
	    driver.switchTo().window(windowHandles.get(1));
	    
	    Select roomId = new Select(driver.findElement(By.name("roomId")));
		roomId.selectByIndex(1);
		
		String dateXPath = String.format("//td[contains(text(),'%s')]//following-sibling::td/a[1]", title);
		clickElementByJSExecutor(driver.findElement(By.xpath(dateXPath)));
		
		selectDate(date);
        
		enterTime(startTime, "eventStartTime");
        enterTime(endTime, "eventEndTime");
        clickElementByJSExecutor(addRoomButton);
     
        driver.switchTo().window(windowBefore);
        return new CourseSectionPage();
    }
	
	public void enterTime(String roomTime,String name) {
		String[] time = roomTime.split(",");
		Select endTimeHour = new Select(driver.findElement(By.name(name+"_hour")));
		endTimeHour.selectByVisibleText(time[0]);
		
		Select endTimeMin = new Select(driver.findElement(By.name(name+"_minute")));
		endTimeMin.selectByVisibleText(time[1]);
		
		Select endTime = new Select(driver.findElement(By.name(name+"_ampm")));
		endTime.selectByVisibleText(time[2]);
	}
}