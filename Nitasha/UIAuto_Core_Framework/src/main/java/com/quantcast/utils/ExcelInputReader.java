package com.quantcast.utils;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;

import org.apache.commons.io.FilenameUtils;
import org.apache.log4j.Logger;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import com.quantcast.constants.FrameworkConstants;

// TODO: Auto-generated Javadoc
/**
 * The Class ExcelInputReader.
 */
public class ExcelInputReader {

	/** The log4j logger instance. */
	static Logger log = Logger.getLogger(ExcelInputReader.class);

	/** The file input stream. */
	private FileInputStream fileInputStream = null;
	
	/** The workbook. */
	private XSSFWorkbook workbook = null;
	
	/** The worksheet. */
	private XSSFSheet worksheet = null;

	/**
	 * Gets the extension of file.
	 *
	 * @param filename the filename
	 * @return the extension
	 */
	public String getExtension(String filename) {
		if (filename == null) {
			return null;
		}
		return FilenameUtils.getExtension(filename);
	}

	/**
	 * Checks if the file extension valid extension.
	 *
	 * @param filename the filename
	 * @return the boolean
	 */
	public Boolean IsValidExtension(String filename) {
		String extension = getExtension(filename);
		log.info("The file extension is :" + extension);

		if (extension != null && extension.equalsIgnoreCase(FrameworkConstants.FILE_EXTENSION))
			return true;

		return false;
	}

	/**
	 * Instantiates a new excel input reader.
	 *
	 * @param testcaseInputFilePath the testcase input file path
	 * @param sheetIndex the sheet index
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	public ExcelInputReader(final String testcaseInputFilePath, int sheetIndex) throws IOException {

		if (!IsValidExtension(testcaseInputFilePath)) {
			log.error("Incorrect File Format - Please choose a .xlsx file format");
			throw new CoreFrameworkException("Incorrect File Format - Please choose a .xlsx file format");
		}

		ClassLoader classLoader = getClass().getClassLoader();
		fileInputStream = new FileInputStream(
				new File(classLoader.getResource("./testdata/" + testcaseInputFilePath).getFile()));
		log.info("Load Excel -> " + testcaseInputFilePath);
		workbook = new XSSFWorkbook(fileInputStream);
		worksheet = workbook.getSheetAt(sheetIndex);
	}

	/**
	 * Gets the test data from the test data file into a String array.
	 *
	 * @param tcID the tc ID
	 * @param readFirstParameterSet the read first parameter set
	 * @return the data
	 * @throws Exception the exception
	 */
	public String[][] getData(final String tcID, boolean readFirstParameterSet) throws Exception {
		String[][] data = null;
		int rowCount = 0;
		int colCount = 0;
		List<LinkedList<String>> allRows = readData(tcID, readFirstParameterSet);
		if (null != allRows && !allRows.isEmpty()) {
			rowCount = allRows.size();
			LinkedList<String> firstRowData = allRows.get(0);
			if (null != firstRowData && !firstRowData.isEmpty()) {
				log.info("Get data for the test case '" + tcID + "' from excel");
				colCount = firstRowData.size();
				data = new String[rowCount][colCount];
				for (int rowCnt = 0; rowCnt < allRows.size(); rowCnt++) {
					if (null != allRows.get(rowCnt) && !allRows.get(rowCnt).isEmpty()) {
						String[] rowData = allRows.get(rowCnt).toArray(new String[colCount]);
						rowData = Arrays.copyOfRange(rowData, 1, rowData.length);
						data[rowCnt] = rowData;
					}
				}
			}
		} else {
			log.error("Test Case Id '" + tcID + "' is not found in the sheet");
			throw new CoreFrameworkException("Test Case Id '" + tcID + "' is not found in the sheet");
		}
		System.out.println("data found..");
		return data;
	}

	/**
	 * Read test data from test data file.
	 *
	 * @param tcID the tc ID
	 * @param readFirstParameterSet the read first parameter set
	 * @return the list
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	private List<LinkedList<String>> readData(final String tcID, boolean readFirstParameterSet) throws IOException {
		List<LinkedList<String>> allRowData = new ArrayList<LinkedList<String>>();

		// Iterate through each rows one by one
		Iterator<Row> rowIterator = worksheet.iterator();
		while (rowIterator.hasNext()) {
			boolean readRow = false;
			Row row = rowIterator.next();
			// For each row, iterate through all the columns
			Iterator<Cell> cellIterator = row.cellIterator();
			List<String> rowData = null;
			while (cellIterator.hasNext()) {
				Cell cell = cellIterator.next();
				// Check the cell type and format accordingly
				switch (cell.getCellType()) {
				case Cell.CELL_TYPE_NUMERIC:

					break;
				case Cell.CELL_TYPE_STRING:
					String cellValue = cell.getStringCellValue();
					if (tcID != null && tcID.equalsIgnoreCase(cellValue)) {
						readRow = true;
						rowData = new LinkedList<>();
					}
					if (readRow && null != rowData) {
						rowData.add(cellValue);
					}
					break;
				}

				if (!readRow) {
					break;
				}
			}
			if (readRow && null != rowData)
				allRowData.add((LinkedList<String>) rowData);
		}
		fileInputStream.close();

		return allRowData;
	}
}
