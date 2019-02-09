package com.pm.automation.logging;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Implement this interface in any class to enable logging in it.
 * 
 *
 * @author Sunil dalvi
 */
public interface Logging {
	default Logger getLogger() {
		return LoggerFactory.getLogger(getClass());
	}
}
