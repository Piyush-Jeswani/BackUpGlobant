package utility;

import java.io.File;
import java.io.FileInputStream;
import java.util.Iterator;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;



public class ReadExcel {
	
private static final String FILE_NAME = System.getProperty("user.dir")+"/Test.xlsx";
	
	
	public int getCountOfRows(String filePath, String sheet){
		int No_of_rows=0;
		try {
			FileInputStream excelFile = new FileInputStream(new File(filePath));
            Workbook workbook = new XSSFWorkbook(excelFile);
            Sheet datatypeSheet = workbook.getSheet(sheet);
            No_of_rows = datatypeSheet.getLastRowNum()+1;
           // System.out.println("Total no of rows : "+No_of_rows);
            
		}
		catch(Exception e){
			
		}
		return No_of_rows;
	}
	
	public int getCountOfColunms(String filePath, String sheet){
		int no_of_Columns=0;
		try {
			FileInputStream excelFile = new FileInputStream(new File(filePath));
            Workbook workbook = new XSSFWorkbook(excelFile);
            Sheet datatypeSheet = workbook.getSheet(sheet);
            //int No_of_rows = datatypeSheet.getLastRowNum()+1;
            //System.out.println("Total no of rows : "+No_of_rows);
            Row row = datatypeSheet.getRow(1);
            no_of_Columns = row.getLastCellNum();
            //System.out.println("Total no of columns : ");
            
		}
		catch(Exception e){
			
		}
		return no_of_Columns;
	}
	
	public String getCellData(String filePath, String sheet, int col, int r){
		String val = null;
		try {
			FileInputStream excelFile = new FileInputStream(new File(filePath));
			Workbook workbook = new XSSFWorkbook(excelFile);
            Sheet datatypeSheet = workbook.getSheet(sheet);
            
            //System.out.println("Inside getCallData");
           
            Row row = datatypeSheet.getRow(r);
            
            Cell cell = row.getCell(col);
            try{
            val = cell.getStringCellValue();
            }
            catch(Exception e){
            	val = String.valueOf( cell.getNumericCellValue());
            }
            System.out.println("Printing Value from Cell :"+val);
            System.out.println("---------------------------");
            
            
           
            
		}
		catch(Exception e){
			e.printStackTrace();
			System.out.println("Inside Catch");
		}
		return (val);
	}
	 
	public static void main(String[] args) {	
		
		ReadExcel r= new ReadExcel();
		
		
		try {
			FileInputStream excelFile = new FileInputStream(new File(FILE_NAME));
            Workbook workbook = new XSSFWorkbook(excelFile);
            Sheet datatypeSheet = workbook.getSheetAt(0);
            
            System.out.println("getCellData value ="+r.getCellData(FILE_NAME,"Datatypes in Java",1,1));
            
            int No_of_rows = datatypeSheet.getLastRowNum()+1;
            System.out.println("Total no of rows : "+No_of_rows);
            Row row = datatypeSheet.getRow(0);
            int no_of_Columns = row.getLastCellNum()+1;
            System.out.println("Total no of columns : "+no_of_Columns);
            Iterator<Row> iterator = datatypeSheet.iterator();
            
            while (iterator.hasNext()) {
            	Row currentRow = iterator.next();
                Iterator<Cell> cellIterator = currentRow.iterator();
                while (cellIterator.hasNext()) {
                	Cell currentCell = cellIterator.next();
                	if (currentCell.getCellTypeEnum() == CellType.STRING) {
                        System.out.print(currentCell.getStringCellValue() + "--");
                    } else if (currentCell.getCellTypeEnum() == CellType.NUMERIC) {
                        System.out.print(currentCell.getNumericCellValue() + "--");
                    }
                }
                System.out.println();
            }

		}
		catch(Exception e){
			
		}

	}

}
