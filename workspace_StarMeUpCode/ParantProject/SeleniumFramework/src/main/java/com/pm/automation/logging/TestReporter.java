package com.pm.automation.logging;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Map;

import org.apache.commons.io.FileUtils;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.slf4j.Logger;
import org.testng.IReporter;
import org.testng.IResultMap;
import org.testng.ISuite;
import org.testng.ISuiteResult;
import org.testng.ITestContext;
import org.testng.ITestListener;
import org.testng.ITestResult;
import org.testng.Reporter;
import org.testng.xml.XmlSuite;

import com.aventstack.extentreports.ExtentReports;
import com.aventstack.extentreports.ExtentTest;
import com.aventstack.extentreports.Status;
import com.aventstack.extentreports.reporter.ExtentHtmlReporter;
import com.aventstack.extentreports.reporter.configuration.ChartLocation;
import com.aventstack.extentreports.reporter.configuration.Theme;
import com.pm.automation.config.Config;
import com.pm.automation.webdriver.TestContext;
import com.pm.automation.webdriver.TestContext.Context;

import static java.lang.String.format;
import static java.time.LocalDateTime.now;
import static java.time.format.DateTimeFormatter.ofPattern;

public class TestReporter implements IReporter, Logging, ITestListener {
	
	String REPORTS_DIRECTORY = null;
	String SCREENSHOTS_DIRECTORY = null;
	public Logger log = null;
	String dateTime = null;

	private static ExtentReports extentReport;

	public TestReporter() {
		log = getLogger();
		dateTime = now().format(ofPattern("dd-MM-yyyy-HH.mm.ss"));
		REPORTS_DIRECTORY = format("%s/%s", "Test Reports/", dateTime);
		SCREENSHOTS_DIRECTORY = REPORTS_DIRECTORY +"/Screenshots";
		try {
			Files.createDirectories(Paths.get(REPORTS_DIRECTORY));
		} catch (IOException e) {
			getLogger().error("Could not create directory!", e);
		}
	}

	@Override
	public void generateReport(List<XmlSuite> xmlSuites, List<ISuite> suites, String outputDirectory) {
		init();

		for (ISuite suite : suites) {
			Map<String, ISuiteResult> result = suite.getResults();

			for (ISuiteResult r : result.values()) {
				ITestContext context = r.getTestContext();

				buildTestNodes(context.getFailedTests(), Status.FAIL);
				buildTestNodes(context.getSkippedTests(), Status.SKIP);
				buildTestNodes(context.getPassedTests(), Status.PASS);

			}
		}

		for (String s : Reporter.getOutput()) {
			extentReport.setTestRunnerOutput(s);
		}

		extentReport.flush();
	}

	private void init() {
		String dateTime = now().format(ofPattern("dd-MM-yyyy-HH.mm.ss"));
		String browserName = Config.getBrowserName();
		String SuiteName = Config.getSuiteName();;
		String filePath = format("%s/%s_%s-%s.html", REPORTS_DIRECTORY,browserName, SuiteName, dateTime);

		ExtentHtmlReporter htmlReporter = new ExtentHtmlReporter(filePath);
		htmlReporter.config().setDocumentTitle("ExtentReports - Created by TestNG Listener");
		htmlReporter.config().setReportName("ExtentReports - Created by TestNG Listener");
		htmlReporter.config().setTestViewChartLocation(ChartLocation.BOTTOM);
		htmlReporter.config().setTheme(Theme.STANDARD);

		extentReport = new ExtentReports();
		extentReport.attachReporter(htmlReporter);
		extentReport.setReportUsesManualConfiguration(true);
	}

	private void buildTestNodes(IResultMap tests, Status status) {
		ExtentTest test;

		if (tests.size() > 0) {
			for (ITestResult result : tests.getAllResults()) {
				test = extentReport.createTest(result.getMethod().getDescription()); // getMethodName
				for (String group : result.getMethod().getGroups()){
					test.assignCategory(group);	
					}
					test.assignCategory(result.getTestClass().getName());
				if (result.getThrowable() != null) {
					test.log(status, result.getThrowable());
				} else {
					test.log(status, "Test " + status.toString().toLowerCase() + "ed");
				}

				test.getModel().setStartTime(getTime(result.getStartMillis()));
				test.getModel().setEndTime(getTime(result.getEndMillis()));
			}
		}
	}

	private Date getTime(long millis) {
		Calendar calendar = Calendar.getInstance();
		calendar.setTimeInMillis(millis);
		return calendar.getTime();
	}
	
	@Override
	public void onFinish(ITestContext arg0) {
		log.info(arg0.getName() + " - Finished");
		
	}

	@Override
	public void onStart(ITestContext arg0) {
		log.info(arg0.getName() + " - Started ");
		
	}

	@Override
	public void onTestFailedButWithinSuccessPercentage(ITestResult arg0) {
		log.error(arg0.getName() + "Failed within success percentage");
		
	}

	@Override
	public void onTestFailure(ITestResult arg0) {
		String methodName = arg0.getName();
		log.error(methodName + " - Failed" + arg0.getThrowable());
		takeScreenShot(methodName);
	}

	@Override
	public void onTestSkipped(ITestResult arg0) {
		log.error(arg0.getName() + " - Skipped" + arg0.getThrowable());
		
	}

	@Override
	public void onTestStart(ITestResult arg0) {
		log.info(arg0.getName() + " - Started");
		
	}

	@Override
	public void onTestSuccess(ITestResult arg0) {
		log.info(arg0.getName() + " - Passed");
		
	}
	
	public void takeScreenShot(String methodName) {	
		Context context = TestContext.get();
		WebDriver driver = context.getDriver();
    	 File scrFile = ((TakesScreenshot)driver).getScreenshotAs(OutputType.FILE);
            try {
				FileUtils.copyFile(scrFile, new File(SCREENSHOTS_DIRECTORY + "/" + methodName + ".png"));
			} catch (IOException e) {
				e.printStackTrace();
			}
    }
}
