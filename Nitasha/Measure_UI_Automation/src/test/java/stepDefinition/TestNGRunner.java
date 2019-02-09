package stepDefinition;

import org.testng.annotations.Test;

import cucumber.api.CucumberOptions;
//import cucumber.api.junit.Cucumber;

import cucumber.api.testng.AbstractTestNGCucumberTests;

@CucumberOptions(
		plugin = { "html:target/cucumberHtmlReport" },
		features = "Feature",
		tags = "@smokedev"
)

@Test
public class TestNGRunner extends AbstractTestNGCucumberTests {
	
}
