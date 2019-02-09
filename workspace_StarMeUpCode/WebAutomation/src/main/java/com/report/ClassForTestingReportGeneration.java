package com.report;

import org.testng.Assert;
import org.testng.annotations.Test;

public class ClassForTestingReportGeneration {

	 @Test(priority = 0, description="This is just a testing of description" )
	    public void firstTestCase() throws Exception {
	        Thread.sleep(2000);
	        System.out.println("im in first test case from ClassForTestingReportGeneration Class");
	    }
	 
	 @Test
	    public void secondTestCase() throws Exception  {
	    	 Thread.sleep(500);
	        System.out.println("im in second test case from ClassForTestingReportGeneration Class");
	        Assert.fail("Failing this Test");
	    }
	 
	 @Test
	    public void thirdTestCase() throws Exception {
	        Thread.sleep(2000);
	        System.out.println("im in third test case from ClassTwo Class");
	    }
}
