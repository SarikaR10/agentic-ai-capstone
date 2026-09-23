package com.company.framework.utils;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

public final class ConfigReader {
	private static final Properties PROPERTIES = loadProperties();

	private ConfigReader() {
	}

	public static String get(String key) {
		return System.getProperty(key, PROPERTIES.getProperty(key));
	}

	private static Properties loadProperties() {
		Properties properties = new Properties();
		try (InputStream input = ConfigReader.class.getClassLoader()
				.getResourceAsStream("config/config.properties")) {
			if (input != null) {
				properties.load(input);
			}
		} catch (IOException exception) {
			throw new IllegalStateException("Unable to load test configuration", exception);
		}
		return properties;
	}
}