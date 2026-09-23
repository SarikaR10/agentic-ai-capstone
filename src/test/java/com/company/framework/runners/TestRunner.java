package com.company.framework.runners;

import io.cucumber.testng.AbstractTestNGCucumberTests;
import io.cucumber.testng.CucumberOptions;

@CucumberOptions(
		features = "src/test/resources/features",
		glue = "com.company.framework",
		plugin = {"pretty", "html:build/reports/cucumber.html"})
public class TestRunner extends AbstractTestNGCucumberTests {
}