package com.forth.clean;

import static org.junit.Assert.*;

import java.awt.List;
import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URL;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.Properties;

import org.junit.After;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;

import com.saucelabs.common.SauceOnDemandAuthentication;
import com.saucelabs.common.SauceOnDemandSessionIdProvider;
import com.saucelabs.junit.SauceOnDemandTestWatcher;
import com.saucelabs.junit.ConcurrentParameterized;

@RunWith(ConcurrentParameterized.class)
public class SampleSauceTest implements SauceOnDemandSessionIdProvider {
	


   /**
    * Constructs a {@link SauceOnDemandAuthentication} instance using the supplied user name/access key.  To use the authentication
    * supplied by environment variables or from an external file, use the no-arg {@link SauceOnDemandAuthentication} constructor.
    */
   public SauceOnDemandAuthentication authentication = new SauceOnDemandAuthentication("${userName}", "${accessKey}");

   /**
    * JUnit Rule which will mark the Sauce Job as passed/failed when the test succeeds or fails.
    */
   @Rule
   public SauceOnDemandTestWatcher resultReportingTestWatcher = new SauceOnDemandTestWatcher(this, authentication);

   /**
    * Represents the browser to be used as part of the test run.
    */
   private String browser;
   /**
    * Represents the operating system to be used as part of the test run.
    */
   private String os;
   /**
    * Represents the version of the browser to be used as part of the test run.
    */
   private String version;
   /**
    * Instance variable which contains the Sauce Job Id.
    */
   private String sessionId;

   /**
    * The {@link WebDriver} instance which is used to perform browser interactions with.
    */
   private WebDriver driver;

   /**
    * Constructs a new instance of the test.  The constructor requires three string parameters, which represent the operating
    * system, version and browser to be used when launching a Sauce VM.  The order of the parameters should be the same
    * as that of the elements within the {@link #browsersStrings()} method.
    * @param os
    * @param version
    * @param browser
    */
   public SampleSauceTest(String os, String version, String browser) {
       super();
       this.os = os;
       this.version = version;
       this.browser = browser;
   }
   
 
   
   public static LinkedList giveMeBrowsers() throws Exception{
	   String csvFile = System.getProperty("user.dir") +"/browser_Ver_os.csv";
       BufferedReader br = null;
       String line = "";
       String cvsSplitBy = ",";      
       LinkedList<String[]> browsers = new LinkedList<String[]>();
       
       try {

           br = new BufferedReader(new FileReader(csvFile));
           while ((line = br.readLine()) != null) {

               // use comma as separator
               String[] user_input = line.split(cvsSplitBy);   
               System.out.println("user_input[0], user_input[1], user_input[2]--->"+user_input[0]+ user_input[1]+ user_input[2]);
               String[] mystr = {user_input[0], user_input[1], user_input[2]};
               browsers.add(user_input);  
               System.out.println("browsers.size()-->"+browsers.size());
           }

       } 
       catch (FileNotFoundException e) {
           e.printStackTrace();
       } catch (IOException e) {
           e.printStackTrace();
       }
       /*finally {
           if (br != null) {
               try {
                   br.close();
               } catch (IOException e) {
                   e.printStackTrace();
               }
               catch(Exception e){
            	   e.printStackTrace();
               }
           }
           br.close();
       }*/
	   return browsers;

   }
   
   @ConcurrentParameterized.Parameters
   public static LinkedList browsersStrings () throws Exception{
	   
	   //return giveMeBrowsers();
	   
	   String csvFile = System.getProperty("user.dir") +"/browser_Ver_os.csv";
       BufferedReader br = null;
       String line = "";
       String cvsSplitBy = ",";      
       LinkedList<String[]> browsers = new LinkedList<String[]>();
       
       try {

           br = new BufferedReader(new FileReader(csvFile));
           while ((line = br.readLine()) != null) {

               // use comma as separator
               String[] user_input = line.split(cvsSplitBy);   
               System.out.println("user_input[0], user_input[1], user_input[2]--->"+user_input[0]+ user_input[1]+ user_input[2]);
               String[] mystr = {user_input[0], user_input[1], user_input[2]};
               browsers.add(user_input);  
               System.out.println("browsers.size()-->"+browsers.size());
           }

       } 
       catch (FileNotFoundException e) {
           e.printStackTrace();
       } catch (IOException e) {
           e.printStackTrace();
       }
       return browsers;

   }
   
   public static String[] str1 = {"Windows 8.1", "11", "internet explorer"};
   public static String[] str2 = {"Windows 10", "60", "chrome"};
   
  // public static ArrayList[] str3 = giveMeStringArray();

   /**
    * @return a LinkedList containing String arrays representing the browser combinations the test should be run against. The values
    * in the String array are used as part of the invocation of the test constructor
    */
   /*
   
   @ConcurrentParameterized.Parameters
   public static LinkedList browsersStrings() {
       LinkedList browsers = new LinkedList();
       //getStringofUserInput
       //LinkedList browsers =getStringofUserInput(); 
       
       //browsers.add(new String[]{"Windows 8.1", "11", "internet explorer"});
       //browsers.add(new String[]{"Windows 10", "60", "chrome"});
       browsers.add(str1);
       browsers.add(str2);
       
       //browsers.add(new String[]{"Linux", "45", "Firefox"});
       return browsers;
   }
   */


   /**
    * Constructs a new {@link RemoteWebDriver} instance which is configured to use the capabilities defined by the {@link #browser},
    * {@link #version} and {@link #os} instance variables, and which is configured to run against ondemand.saucelabs.com, using
    * the username and access key populated by the {@link #authentication} instance.
    *
    * @throws Exception if an error occurs during the creation of the {@link RemoteWebDriver} instance.
    */
   @Before
   public void setUp() throws Exception {
	   

       DesiredCapabilities capabilities = new DesiredCapabilities();
       capabilities.setCapability(CapabilityType.BROWSER_NAME, browser);
       if (version != null) {
           capabilities.setCapability(CapabilityType.VERSION, version);
       }
       capabilities.setCapability(CapabilityType.PLATFORM, os);
       capabilities.setCapability("name", "Sauce Sample 8_nov_csv ");
       this.driver = new RemoteWebDriver(
               new URL("https://" + "piyushsauce" + ":" + "59e79d53-c95d-4cf1-8085-375065026aa5" + "@ondemand.saucelabs.com:443/wd/hub"),
               capabilities); 
	   //System.setProperty("webdriver.chrome.driver","D:\\Softwares\\selenium\\chromedriver_win32\\chromedriver.exe");
       //this.driver = new ChromeDriver();
       this.sessionId = (((RemoteWebDriver) driver).getSessionId()).toString();

   }

   /**
    * Runs a simple test verifying the title of the amazon.com homepage.
    * @throws Exception
    */
   @Test
   public void amazon() throws Exception {
       driver.get("http://www.amazon.com/");
       System.out.println("TITLE : "+driver.getTitle());
       assertEquals("Amazon.com: Online Shopping for Electronics, Apparel, Computers, Books, DVDs & more", driver.getTitle());
   }

   /**
    * Closes the {@link WebDriver} session.
    *
    * @throws Exception
    */
   @After
   public void tearDown() throws Exception {
	   try{
       driver.quit();
	   }
	   catch(Exception e){
		   //driver.quit();
	   }
   }

   /**
    *
    * @return the value of the Sauce Job id.
    */
   //@Override
   public String getSessionId() {
       return sessionId;
   }
}
