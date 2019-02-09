package com.pm.automation.testdata;

import static java.lang.Thread.currentThread;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;
import com.fasterxml.jackson.core.JsonFactory;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pm.automation.logging.Logging;

public class DataReader implements Logging {
	private static final String Test_data = "TestData.json";
	private static final String Login_data = "LoginData.json";

	public static HashMap<String, String> getTestData(String testName) throws IOException {

		ObjectMapper objectMapper = new ObjectMapper(new JsonFactory());
		HashMap<String, String> myMap = new HashMap<String, String>();

		InputStream jsonData = currentThread().getContextClassLoader().getResourceAsStream(Test_data);
		try {
			JsonNode rootNode = objectMapper.readTree(jsonData);
			JsonNode testNode = rootNode.path(testName);

			JsonParser parser = objectMapper.treeAsTokens(testNode);
			myMap = parser.readValueAs(new TypeReference<Map<String, ?>>() {
			});
		} catch (Exception e) {
			//log.error("Error parsing framework config!. Re-check!",e);

		}
		return myMap;
	}
	
	public static HashMap<String, String> getLoginData(String User) throws IOException {

		ObjectMapper objectMapper = new ObjectMapper(new JsonFactory());
		HashMap<String, String> myMap = new HashMap<String, String>();

		InputStream jsonData = currentThread().getContextClassLoader().getResourceAsStream(Login_data);
		try {
			JsonNode rootNode = objectMapper.readTree(jsonData);
			JsonNode testNode = rootNode.path(User);

			JsonParser parser = objectMapper.treeAsTokens(testNode);
			myMap = parser.readValueAs(new TypeReference<Map<String, ?>>() {
			});
		} catch (Exception e) {
			// getLogger().error("Error parsing framework config!. Re-check!", e);

		}
		return myMap;
	}
}
