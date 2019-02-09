package com.quantcast.utils;

import java.io.InputStream;
import java.util.Properties;

// TODO: Auto-generated Javadoc
/**
 * The Class ConfigurationReader.
 */
public class ConfigurationReader {

	/** The instance. */
	private static ConfigurationReader instance = null;

	/** The properties. */
	private Properties properties = null;

	/**
	 * Instantiates a new configuration reader.
	 */
	private ConfigurationReader() {
		properties = new Properties();
		try {
			InputStream inputStream = getClass().getClassLoader().getResourceAsStream("config.properties");
			if(null!=inputStream){
				properties.load(inputStream);
			}
		} catch (Exception e) {
			// File not found.
		}
	}

	/**
	 * Gets the single instance of ConfigurationReader.
	 *
	 * @return single instance of ConfigurationReader
	 */
	public synchronized static ConfigurationReader getInstance() {
		if (instance == null)
			instance = new ConfigurationReader();
		return instance;
	}

	/**
	 * Gets the properties for framework.
	 *
	 * @param key the key
	 * @return the property
	 */
	// get property value by name
	public String getProperty(String key) {
		String value = null;
		if (properties.containsKey(key))
			value = (String) properties.get(key);
		else {
			// the property is absent
		}
		return value;
	}

}
