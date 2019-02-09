package dataExternal;

import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

import utility.ReadExcel;



public class ExcelToDataProvider {
	
	
	
private  final String FILE_NAME = System.getProperty("user.dir")+"/Test.xlsx";
	
	private  final String sheet = "Datatypes in Java";
	ReadExcel  eat = null;
	
	@Test(dataProvider="userdata")
	public void fillUserForm(String userName, String passWord, String Size){
		System.out.println("Username ="+userName);
		System.out.println("Password ="+passWord);
		System.out.println("Size ="+Size);
		System.out.println("***************************");
	}
	
	@DataProvider(name="userdata")
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
	    }

}
