package listener;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Calendar;

import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.testng.ITestContext;
import org.testng.ITestListener;
import org.testng.ITestResult;



import base.TestBase;
import screenshot.GetScreenshot;



public class TestListener extends TestBase implements ITestListener {

	public void onFinish(ITestContext arg0) {
		// TODO Auto-generated method stub
		
	}

	public void onStart(ITestContext arg0) {
		// TODO Auto-generated method stub
		
	}

	public void onTestFailedButWithinSuccessPercentage(ITestResult arg0) {
		// TODO Auto-generated method stub
		
	}

	public void onTestFailure(ITestResult arg0) {
		// TODO Auto-generated method stub
		System.out.println("Inside onTestFailure :"+arg0.getName());	
		try {
            GetScreenshot.capture(arg0.getName());
        } catch (IOException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
		
	}

	public void onTestSkipped(ITestResult arg0) {
		// TODO Auto-generated method stub
		
	}

	public void onTestStart(ITestResult arg0) {
		// TODO Auto-generated method stub
		
	}

	public void onTestSuccess(ITestResult arg0) {
		// TODO Auto-generated method stub
		
	}

	

	/*@Override
	public void onTestFailure(ITestResult result) {
		
		System.out.println("Inside onTestFailure :"+result.getName());	
		try {
            GetScreenshot.capture(result.getName());
        } catch (IOException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }

	}*/



}
