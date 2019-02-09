/*package com.report;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;

import org.testng.IReporter;
import org.testng.ISuite;
import org.testng.ITestContext;
import org.testng.xml.XmlSuite;

public class OneMoreClassForReport implements IReporter {

	private static PrintWriter f_out;
	private static final String OUT_FOLDER = "custom-test-report";

	@Override
	public void generateReport(List<XmlSuite> xmlSuites, List<ISuite> suites, String outputDirectory) {
		// TODO Auto-generated method stub
		
		try
		{
		f_out = createWriter(OUT_FOLDER);
		} catch (IOException e)
		{
		e.printStackTrace();
		}
		
		startHtmlPage(f_out);

	generateTestExecutionStatus(List<ISuite> suites);

	endHtmlPage(f_out);

		f_out.flush();
		f_out.close();
		
	}

	*//** Starts HTML Stream *//*
	private void startHtmlPage(PrintWriter out) {
		out.println(
				"<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.1//EN http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd\">");
		out.println("<html xmlns=\"http://www.w3.org/1999/xhtml\">");
		out.println("<head>");
		out.println("<title> My Custom Report </title>");

		 Include Java Script and JQuery 
		out.println("<script type=\"text/javascript\" src=\"stylesheets/jquery-latest.js\"></script>");

		 Include Style Sheets 
		out.println("<link rel=\"stylesheet\" href=\"stylesheets/sexybuttons.css\" type=\"text/css\" />");
		out.println("<link rel=\"stylesheet\" href=\"stylesheets/custom-report-stylesheet.css\" type=\"text/css\" />");

		out.println("</head>");
		out.println("<body><br/>");

		Calendar cal = Calendar.getInstance();
		out.println("<br/><div align=\"right\">Report generated on: " + cal.getTime() + "</div><br/><br/>");

		out.flush();
	}

	private void endHtmlPage(PrintWriter out) {
		out.println("</div></div></div></div>");
		out.println(
				"<div class=\"footer\"> &copy; <a href=\"https://seleniumexperience.wordpress.com\">2013 WordPress.com</a></div>");
		out.println("</body></html>");
	}

	private void generateTestExecutionStatus(List<ISuite> suites) {
		String testName = "";

		int totalPassedMethods = 0;
		int totalFailedMethods = 0;
		int totalSkippedMethods = 0;
		int totalSkippedConfigurationMethods = 0;
		int totalFailedConfigurationMethods = 0;
		int totalMethods = 0;

		int suite_totalPassedMethods = 0;
		int suite_totalFailedMethods = 0;
		int suite_totalSkippedMethods = 0;

		String suite_passPercentage = "";
		String suiteName = "";
		
		ITestContext overview = null;
		HashMap<String, String> dashboardReportMap = new HashMap<String, String>();
		
		for (ISuite suite : suites)
		{
		suiteName = suite.getName();
		logger.info(">> " + suiteName + " <<");
		Map<String, ISuiteResult> tests = suite.getResults();
		
		for (ISuiteResult r : tests.values())
		{
		overview = r.getTestContext();
		testName = overview.getName();
		
		totalPassedMethods = overview.getPassedTests().getAllMethods().size();
		totalFailedMethods = overview.getFailedTests().getAllMethods().size();
		totalSkippedMethods = overview.getSkippedTests().getAllMethods().size();
		
		totalMethods = overview.getAllTestMethods().length;
		
		NumberFormat nf = NumberFormat.getInstance();
		nf.setMaximumFractionDigits(2);
		nf.setGroupingUsed(true);
		
		String includedModule = "";
		String includedGroup = "";
	}
}
*/