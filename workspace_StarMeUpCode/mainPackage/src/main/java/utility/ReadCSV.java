package utility;

import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;

public class ReadCSV {

	public String[] getCSVdetails(){
		String csvFile = System.getProperty("user.dir") +"/browser_Ver_os.csv";
        BufferedReader br = null;
        String line = "";
        String cvsSplitBy = ",";
        
        System.out.println("Working Directory = " +
                System.getProperty("user.dir"));
        
        try {

            br = new BufferedReader(new FileReader(csvFile));
            while ((line = br.readLine()) != null) {

                // use comma as separator
                String[] user_input = line.split(cvsSplitBy);

                System.out.println("OS= " + user_input[0] + " , Browser=" + user_input[2]);
                return user_input;                

            }

        } catch (FileNotFoundException e) {
            e.printStackTrace();
            return null;
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
        
        finally {
            if (br != null) {
                try {
                    br.close();
                    
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
        return null;
	}
	

	public static void main(String[] args) {
		// TODO Auto-generated method stub
		// This is the class where we will be reading CSV data
	
		

	}

}
