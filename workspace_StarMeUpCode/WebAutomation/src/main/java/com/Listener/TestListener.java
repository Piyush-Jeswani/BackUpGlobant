package com.Listener;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Calendar;

import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.testng.ITestContext;
import org.testng.ITestListener;
import org.testng.ITestResult;

import com.screenshot.GetScreenshot;

import root.TestBase;

public class TestListener extends TestBase implements ITestListener {

	@Override
	public void onTestStart(ITestResult result) {
		// TODO Auto-generated method stub
		//System.out.println(result.getName()+" test case started");		

	}

	@Override
	public void onTestSuccess(ITestResult result) {
		// TODO Auto-generated method stub
		 System.out.println("The name of the testcase passed is :"+result.getName());	

	}

	@Override
	public void onTestFailure(ITestResult result) {
		
		System.out.println("Inside onTestFailure :"+result.getName());	
		try {
            GetScreenshot.capture(result.getName());
        } catch (IOException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
		
		
		
		
		// TODO Auto-generated method stub
		/*if (!result.isSuccess()) {
			Calendar calendar = Calendar.getInstance();
			SimpleDateFormat formater = new SimpleDateFormat("dd_MM_yyyy_hh_mm_ss");

			String methodName = result.getName();
			File scrFile = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
			try {
				
				String reportDirectory = new File(System.getProperty("user.dir")).getAbsolutePath()+"/src/main/java";
				File destFile = new File((String)reportDirectory + "/failed_screenshots/"+methodName+"_"+)

			} catch (Exception e) {
				e.printStackTrace();

			}
		}
*/
	}

	@Override
	public void onTestSkipped(ITestResult result) {
		// TODO Auto-generated method stub
		System.out.println("The name of the testcase Skipped is :"+result.getName());	

	}

	@Override
	public void onTestFailedButWithinSuccessPercentage(ITestResult result) {
		// TODO Auto-generated method stub

	}

	@Override
	public void onStart(ITestContext context) {
		// TODO Auto-generated method stub
		

	}

	@Override
	public void onFinish(ITestContext context) {
		// TODO Auto-generated method stub

	}

}
