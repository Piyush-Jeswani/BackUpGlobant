package utility;

import java.io.File;
import java.io.FileInputStream;
import java.util.Properties;

public class ReadProperty {

	public Properties getMePropertyFile(){
		try {
			File file = new File("test.properties");
			FileInputStream fileInput = new FileInputStream(file);
			Properties properties = new Properties();
			properties.load(fileInput);
			fileInput.close();
			return properties;
			}
			catch (Exception e) {
				e.printStackTrace();
				return null;
			}
	}
}
