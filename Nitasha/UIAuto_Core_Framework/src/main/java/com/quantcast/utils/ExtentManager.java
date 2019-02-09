package com.quantcast.utils;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import com.aventstack.extentreports.ExtentReports;
import com.aventstack.extentreports.ExtentTest;
import com.aventstack.extentreports.MediaEntityBuilder;
import com.aventstack.extentreports.Status;
import com.aventstack.extentreports.reporter.ExtentHtmlReporter;
import com.aventstack.extentreports.reporter.ExtentXReporter;
import com.aventstack.extentreports.reporter.configuration.ChartLocation;
import com.aventstack.extentreports.reporter.configuration.Theme;
import com.quantcast.constants.FrameworkConstants;

// TODO: Auto-generated Javadoc
/*import com.aventstack.extentreports.DisplayOrder;
import com.aventstack.extentreports.ExtentReports;
import com.aventstack.extentreports.ExtentTest;
import com.aventstack.extentreports.Status;
*/
// TODO: Auto-generated Javadoc
/**
 * The Class ExtentManager.
 */
public class ExtentManager {

	/** The extent. */
	private static ExtentReports extent;

	/**
	 * Gets the single instance of ExtentManager.
	 *
	 * @return single instance of ExtentManager
	 */
	public static ExtentReports getInstance() {
		if (extent == null)
			createInstance();
		return extent;
	}

	/**
	 * Creates the instance.
	 *
	 * @return the extent reports
	 */
	public static ExtentReports createInstance() {

		FrameworkConfigurationReader frameworkConfigurationReader = FrameworkConfigurationReader.getInstance();
		if (null != frameworkConfigurationReader) {
			String fileName = frameworkConfigurationReader.getProperty("extent.report.name")
					+ new SimpleDateFormat(frameworkConfigurationReader.getProperty("report.name.timestamp.format"))
							.format(new Date())
					+ "." + frameworkConfigurationReader.getProperty("extent.report.name.extension");

			ExtentHtmlReporter htmlReporter = new ExtentHtmlReporter(
					frameworkConfigurationReader.getProperty("extent.report.file.path") + fileName);
			

			htmlReporter.config().setTestViewChartLocation(ChartLocation.TOP);
			htmlReporter.config().setChartVisibilityOnOpen(true);
			htmlReporter.config().setTheme(Theme.STANDARD);
			htmlReporter.config().setDocumentTitle(fileName);
			htmlReporter.config().setEncoding("utf-8");
			htmlReporter.config().setReportName(fileName);
			extent = new ExtentReports();

			String reportAdditionalInfo = frameworkConfigurationReader.getProperty("extent.report.additional.info");
			if (null != reportAdditionalInfo) {
				String[] splitReportAdditionalInfo = reportAdditionalInfo.split(",");
				if (null != splitReportAdditionalInfo && splitReportAdditionalInfo.length > 0) {
					for (String individualInfo : splitReportAdditionalInfo) {
						if (null != individualInfo) {
							String[] splitIndividualInfo = individualInfo.split("-");
							if (null != splitIndividualInfo && splitIndividualInfo.length > 0) {
								extent.setSystemInfo(splitIndividualInfo[0], splitIndividualInfo[1]);
							}
						}
					}
				}
			}
			
				extent.attachReporter(htmlReporter);
			}

		
		return extent;
	}
}
