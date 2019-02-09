package stepDefinition;

import org.junit.runner.RunWith;
import org.testng.annotations.Test;

import cucumber.api.CucumberOptions;
//import cucumber.api.junit.Cucumber;
import cucumber.api.junit.Cucumber;
import cucumber.api.testng.AbstractTestNGCucumberTests;

//@RunWith(Cucumber.class)
//@CucumberOptions(
//		plugin = { "html:target/cucumberHtmlReport" },
//		features = "Feature",
//		tags = "@smoke"
//)



@RunWith(Cucumber.class)
@CucumberOptions(plugin = {"pretty", "html:target/cucumber"},
     features = "Feature",
     tags = "@smoke",
     glue={"stepDefinition"}
  )

@Test
public class RunCukeTest  {
}
