package com.quantcast.utils;

import java.io.InputStream;
import java.util.Properties;

import org.apache.log4j.Logger;

// TODO: Auto-generated Javadoc
/**
 * The Class FrameworkConfigurationReader.
 */
public class FrameworkConfigurationReader {

	/** The instance. */
	private static FrameworkConfigurationReader instance = null;

	/** The log. */
	static Logger log = Logger.getLogger(ExcelInputReader.class);

	/** The properties. */
	private Properties properties = null;

	/**
	 * Instantiates a new framework configuration reader.
	 */
	private FrameworkConfigurationReader() {
		properties = new Properties();
		try {
			InputStream inputStream = getClass().getClassLoader().getResourceAsStream("framework-config.properties");
			if (null != inputStream) {
				properties.load(inputStream);
			}
		} catch (Exception excep) {
			log.error("", excep);
		}
	}

	/**
	 * Gets the single instance of FrameworkConfigurationReader.
	 *
	 * @return single instance of FrameworkConfigurationReader
	 */
	public synchronized static FrameworkConfigurationReader getInstance() {
		if (instance == null)
			instance = new FrameworkConfigurationReader();
		return instance;
	}

	/**
	 * Gets the property.
	 *
	 * @param key
	 *            the property name
	 * @return the property
	 */
	// get property value by name
	public String getProperty(String key) {
		String value = null;
		if (properties.containsKey(key))
			value = (String) properties.get(key);
		else {
			log.warn("Property value with key: " + key + " not found.");
		}
		return value;
	}

}
