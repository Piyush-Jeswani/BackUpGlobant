package com.starmeup.WebAutomation;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.Enumeration;
import java.util.Properties;

public class ReadPropertyFile {
	
	public Properties getpropertyInstance(){
		try {
			File file = new File("test.properties");
			FileInputStream fileInput = new FileInputStream(file);
			Properties properties = new Properties();
			properties.load(fileInput);
			fileInput.close();
			return properties;
		}
		catch(Exception e){
			e.printStackTrace();
			return null;
		}
		
	}
	
	public String getURL(){
		Properties p= getpropertyInstance();
		return(p.getProperty("URL"));
	}
	public String getBrowser(){
		Properties p= getpropertyInstance();
		return(p.getProperty("browser"));
	}

	
		public static void main(String[] args) {
			// TODO Auto-generated method stub
			/*try {
				File file = new File("test.properties");
				FileInputStream fileInput = new FileInputStream(file);
				Properties properties = new Properties();
				properties.load(fileInput);
				fileInput.close();		

				Enumeration enuKeys = properties.keys();
				while (enuKeys.hasMoreElements()) {
					String key = (String) enuKeys.nextElement();
					String value = properties.getProperty(key);
					System.out.println(key + ": " + value);
				}				
				 
			}  catch (Exception e) {
				e.printStackTrace();
			}
*/
		}
	
}
