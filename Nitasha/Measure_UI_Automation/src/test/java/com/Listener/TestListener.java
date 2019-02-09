package com.Listener;

import org.apache.log4j.Logger;
import org.testng.ITestContext;
import org.testng.ITestListener;
import org.testng.ITestResult;

public class TestListener implements ITestListener {

	static Logger log = Logger.getLogger(TestListener.class);

	@Override
	public synchronized void onStart(ITestContext context) {
		System.out.println("OnStart begin");
		System.out.println("OnStart end");
	}

	@Override
	public synchronized void onFinish(ITestContext context) {
		// extent.flush();
	}

	@Override
	public synchronized void onTestStart(ITestResult result) {
		System.out.println("On test Start begin");

	}

	@Override
	public synchronized void onTestSuccess(ITestResult result) {

	}

	@Override
	public synchronized void onTestFailure(ITestResult result) {
		System.out.println("On test Fail start");

	}

	@Override
	public synchronized void onTestSkipped(ITestResult result) {

	}

	@Override
	public synchronized void onTestFailedButWithinSuccessPercentage(ITestResult result) {

	}

}