package com.report.extent;

import static org.testng.Assert.assertTrue;

import org.testng.annotations.Test;

public class DemoTestForExtentReport {

	@Test(description="First Method")
	public void firstMethod(){
		assertTrue(true);
	}
	
	@Test(description="Second Method")
	public void secondMethod(){
		assertTrue(false);
	}
	
	@Test(description="Third Method")
	public void thirdMethod(){
		assertTrue(true);
	}
}
