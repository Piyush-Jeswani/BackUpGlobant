package com.report.extent;

import java.lang.reflect.Method;
import java.text.SimpleDateFormat;
import java.util.Calendar;

import org.testng.ITestResult;
import org.testng.annotations.AfterClass;
import org.testng.annotations.AfterTest;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.BeforeTest;

import com.relevantcodes.extentreports.ExtentReports;
import com.relevantcodes.extentreports.ExtentTest;
import com.relevantcodes.extentreports.LogStatus;

public class DmoExtentReport {

	static ExtentReports extent;
	static ExtentTest test;
	
	static{
		Calendar calendar = Calendar.getInstance();
		SimpleDateFormat formatter = new SimpleDateFormat("dd_MM_yyyy_hh_mm_ss");
		extent = new ExtentReports(System.getProperty("user.dir")+"/src/test/java/report/test"+formatter.format(calendar.getTime())+".html",false);
		
	}
	
	
	public void getresult(ITestResult result){
		if (result.getStatus()==ITestResult.SUCCESS){
			test.log(LogStatus.PASS, result.getName()+"Test is passed");
		}
		else if(result.getStatus()==ITestResult.FAILURE){
			test.log(LogStatus.FAIL, result.getName()+"Test is failed "+result.getThrowable());
		}
	}
	@BeforeTest
	public void beforeTest(){
		
	}
	@AfterClass()
	public void afterClass(){
		extent.endTest(test);
		extent.flush();
	}
	
	@BeforeMethod
	public void beforeMethod(Method result){
		test = extent.startTest(result.getName()+"test Started ***");
		
	}
	
	@AfterTest
	public void afterTest(ITestResult result){
		getresult(result);
	}
}
