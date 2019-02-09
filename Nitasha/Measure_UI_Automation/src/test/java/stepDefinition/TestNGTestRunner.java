package stepDefinition;

import org.testng.annotations.Test;

import cucumber.api.CucumberOptions;
//import cucumber.api.junit.Cucumber;

import cucumber.api.testng.AbstractTestNGCucumberTests;

@CucumberOptions(
		plugin = { "html:target/cucumberHtmlReport" },
		features = "Feature",
		tags = "@db"
)

@Test
public class TestNGTestRunner extends AbstractTestNGCucumberTests {
	
}
