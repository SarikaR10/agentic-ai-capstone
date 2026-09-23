package com.company.framework.hooks;

import com.company.framework.drivers.DriverFactory;
import io.cucumber.java.After;
import io.cucumber.java.Before;

public class Hooks {
	@Before
	public void startDriver() {
		DriverFactory.start();
	}

	@After
	public void stopDriver() {
		DriverFactory.stop();
	}
}