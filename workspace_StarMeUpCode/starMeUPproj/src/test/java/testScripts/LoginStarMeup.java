package testScripts;

import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

import base.TestBase;
import pageClasses.HomePage_StarMeUp;
import pageClasses.Login_StarMeUp;
import utility.ReadExcel;
import utility.ReadProperty;

//extends TestBase

public class LoginStarMeup   {
	
	/*@DataProvider(name="userdata")
	public Object[][] userFormData() throws Exception
    {
        Object[][] data = testData(FILE_NAME, "Datatypes in Java");
        return data;
    }
	
	 public Object[][] testData(String xlFilePath, String sheetName) throws Exception
	    {
	        Object[][] excelData = null;
	        eat = new ReadExcel();
	        int rows = eat.getCountOfRows(FILE_NAME, sheet);
	        //System.out.println("No of rows :"+rows);
	        int columns = eat.getCountOfColunms(FILE_NAME, sheet);
	        //System.out.println("No of columns :"+columns);         
	        excelData = new Object[rows-1][columns];
	         
	        for(int i=1; i<rows; i++)
	        {
	            for(int j=0; j<columns; j++)
	            {
	            	//System.out.println("Going to call getCallData");
	                excelData[i-1][j] = eat.getCellData(xlFilePath, sheetName, j, i);
	            }
	             
	        }
	        return excelData;
	    }*/
	
	
	@Test(dataProvider="userdata")		
	public void topStarsFunctionality(String userName, String passWord, String Size) {
		System.out.println("Username ="+userName);
		System.out.println("Password ="+passWord);
		System.out.println("Size ="+Size);
		System.out.println("***************************");
		/*try{
		
			ReadProperty p = new ReadProperty();
			
			Login_StarMeUp lg = new Login_StarMeUp(driver);
			HomePage_StarMeUp home = lg.makeLogin();
		}
		catch(Exception e){
			e.printStackTrace();
		}*/
	}

}
