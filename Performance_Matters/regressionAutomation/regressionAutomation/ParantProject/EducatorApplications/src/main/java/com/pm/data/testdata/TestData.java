package com.pm.data.testdata;

import static java.lang.Thread.currentThread;

import java.io.InputStream;
import java.util.Optional;

import com.fasterxml.jackson.core.JsonFactory;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pm.automation.logging.Logging;
import com.pm.data.users.User;
import com.pm.data.users.Users;
import com.pm.pages.newTeacherEvaluation.NewTeacherEvaluationPage;

public enum TestData implements Logging{
	TestData;
	
	private static final String Data_FILE = "TestData.json";
	private static final String Users_FILE = "LoginData.json";
	private final Data data;
	private final Users users;

	TestData() {
        this.data = readTestData();
        this.users = readUsersData();
    }
	
	private Users readUsersData() {
		ObjectMapper om = new ObjectMapper(new JsonFactory()).configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);;
        Users users = null;
        InputStream usersFile = currentThread().getContextClassLoader().getResourceAsStream(Users_FILE);
        try {
        	users = om.readValue(usersFile, Users.class);
        } catch (Exception e) {
            getLogger().error("Error parsing Login data!. Re-check!", e);
        }
        return Optional.ofNullable(users).orElse(Users.EMPTY);
	}

	private Data readTestData() {
		   ObjectMapper om = new ObjectMapper(new JsonFactory()).configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);;
	        Data data = null;
	        InputStream dataFile = currentThread().getContextClassLoader().getResourceAsStream(Data_FILE);
	        try {
	        	data = om.readValue(dataFile, Data.class);
	        } catch (Exception e) {
	            getLogger().error("Error parsing data!. Re-check!", e);
	        }
	        return Optional.ofNullable(data).orElse(Data.EMPTY);
		}
	
	public EvaluationProgram EvaluationProgram() {
		return data.getEvaluationProgram();
	}
	
	public EvaluationProgram TeacherEvaluationProgram() {
		return data.getTeacherEvaluationProgram();
	}
	
	public EvaluationProgram PrincipalEvaluationProgram() {
		return data.getPrincipalEvaluationProgram();
	}
	
	public EvaluationProgram PrincipalSignOffProgram() {
		return data.getPrincipalSignOffProgram();
	}
	
	public CalibrationGroup CreateCalibrationGroup(){
		return data.getCreateCalibrationGroup();
	}
	
	public CalibrationGroup EditCalibrationGroup(){
		return data.getEditCalibrationGroup();
	}
	
	public User Admin(){		
		return users.getAdmin();
	}
	
	public User Principal(){		
		return users.getPrincipal();
	}
	
	public User Teacher(){		
		return users.getTeacher();
	}
	public User courseAdmin(){
		return users.getCourseAdmin();
	}
	
	public User CourseSuperUser() {
		return users.getCourseSuperUser();
	}
	public AssessmentBank AssessmentBank(){
		return data.getAssessmentBank();
	}
	
	public Event Event(){
		return data.getEvent();
	}
	
	public User SearchUser() {
		return data.getSearchUser();
	}
	
	public String ComponentWithPendingCredit() {
		return data.getComponentWithPendingCredit();
	}
		
	public PDUserData PDUserData() {
		return data.getPdUserData();
	}
		
	public CourseAdministration courseAdministration() {
		return data.getCourseAdministration();
	}
	
	public FormsV2Data formsV2Data() {
		return data.getFormsV2Data();
	}
	
	public PaymentData paymentData() {
		return data.getPaymentData();
	}
	
	public RatingScaleAdministrationData ratingScaleAdministrationData() {
		return data.getRatingScaleAdministrationData();
	}
	
	public String SectionName() {
		return data.getSectionNoName();
	}
	
	public String CourseName() {
		return data.getCourseName();
	}
	
	public CourseDashboardData courseDashboardData() {
		return data.getCourseDashboardData();
	}
	
	public NewObservationData newObservationData() {
		return data.getNewObservationData();
	}
	
	public LearningOpportunityData learningOpportunityData() {
		return data.getLearningOpportunityData();
	}
	
	public InstructorLedCourseData instructorLedCourseData() {
		return data.getInstructorLedCourseData();
	}
	
	public SectionList sectionList() {
		return data.getSectionList();
	}
	
	public CourseCatalog courseCatalog() {
		return data.getCourseCatalog();
	}
	
	public StaffManagement staffManagement() {
		return data.getStaffManagement();
	}
	
	public NewParticipation newParticipation() {
		return data.getNewParticipation();
	}
	
	public CalibrationGroup calibrationAdministration() {
		return data.getCalibrationAdministration();
	}
	
	public StaffManagement staffGroup() {
		return data.getStaffGroup();
	}
	
	public Transcript transcript() {
		return data.getTranscript();
	}
	
	public CourseApprovalAdmin sectionCopy() {
		return data.getSectionCopy();
	}
	
	public ProgramManagementDetails programManagement() {
		return data.getProgramManagement();
	}
	
	public RoomBookingData bookRoom() {
		return data.getBookRoom();
	}
	
	public NewObservationData observationsTypeList() {
		return data.getObservationsTypeList();
	}
	
	public CourseApprovalAdmin staffDevelopment() {
		return data.getStaffDevelopment();
	}
	
	public CalibrationGroup resourceData() {
		return data.getResourceData();
	}
	
	public EvaluationProgram newTeacherEvaluation() {
		return data.getNewTeacherEvaluation();
	}
}
