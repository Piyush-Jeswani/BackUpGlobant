package com.pm.pages.statusDashboardAdministration;

import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import com.pm.pages.common.BasePage;

public class StatusDashboardAdministration extends BasePage{
	
	public StatusDashboardAdministration() {
		super();
	}
	
	public static final String  tableContainer =  ".tnl-table-container";
	
	@FindBy(css=".tnl-table-container")
	private WebElement table_container;
	
	@FindBy(css=".tnl-table-container tbody tr input[checked='checked']")
	private List<WebElement> visibleOnlyChecked;
	
	@FindBy(xpath="//h2[contains(text(),'My Reports')]")
	private WebElement myReportsBottom;
	
	@FindBy(css= ".tnl-table-container tbody tr input")
	private List<WebElement> alCheckBoxesVisible;
	
	public boolean validateStatusDashboardTable(){		
		return elementPresent(By.cssSelector(tableContainer));		
	}
	
	public int getTheNoOfCheckedCheckBoxesForVisible(){
		return visibleOnlyChecked.size();
	}	
	
	public void validateNoOfVisibleCheckBoxesWillBeGreaterThenGivenQuantity(int n){		
			int count =0;
			while (getTheNoOfCheckedCheckBoxesForVisible()< n){				
				
				if (alCheckBoxesVisible.get(count).getAttribute("checked")==null){
					waitForJSandJQueryToLoad();
					clickElementByJSExecutor(alCheckBoxesVisible.get(count));					
				}		
			count++;
			}
		}	
}
