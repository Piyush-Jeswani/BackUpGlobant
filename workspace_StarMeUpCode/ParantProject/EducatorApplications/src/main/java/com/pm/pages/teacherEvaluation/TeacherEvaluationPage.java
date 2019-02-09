package com.pm.pages.teacherEvaluation;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import com.pm.pages.common.BasePage;
import com.pm.pages.newTeacherEvaluation.NewTeacherEvaluationPage;

public class TeacherEvaluationPage extends BasePage {
	
	@FindBy(xpath = "//div[@id='gptabs']//li//span[text()='Evaluation Participation']")
	private WebElement evaluationParticipation;
	
	@FindBy(xpath = "//div[@id='gpTable_plan_participation_tab_86']//tr[@class='rowcolor1'][1]//button")
	private WebElement actionButton;
	
	@FindBy(xpath = "//div[@id='gpTable_plan_participation_tab_86']//tr[@class='rowcolor1'][1]//span[text()='Edit']")
	private WebElement editActionButton;
	
	
	public TeacherEvaluationPage() {
		super();
	}
	
	public TeacherEvaluationPage clickEvaluationParticipation() {
		clickElementByJSExecutor(evaluationParticipation);
		return new TeacherEvaluationPage();
	}
	
	public NewTeacherEvaluationPage clickActionButton(String programName,String firstName,String lastName) {
		String userName = firstName+" "+lastName;
		String xpath = String.format("//h3[text()='%s']/ancestor::div[@class='panel-heading']/following-sibling::div[1]//table//td[contains(text(),'%s')]/preceding-sibling::td//button", programName,userName);
		WebElement program = driver.findElement(By.xpath(xpath));
		clickElementByJSExecutor(program);
		clickOnLink("Edit");
		return new NewTeacherEvaluationPage();
	}
	
	public NewTeacherEvaluationPage clickEditButton() {
		clickElementByJSExecutor(editActionButton);
		return new NewTeacherEvaluationPage();
	}
}