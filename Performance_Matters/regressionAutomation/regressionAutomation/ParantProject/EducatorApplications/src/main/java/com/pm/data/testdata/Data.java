package com.pm.data.testdata;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.pm.automation.logging.Logging;
import com.pm.data.users.User;

public class Data implements Logging {
	
	 	@JsonIgnore
	    public static final Data EMPTY = new Data();
	    
	    @JsonDeserialize(as = EvaluationProgram.class)
	    private EvaluationProgram evaluationProgram = EvaluationProgram.DEFAULT;
	    
	    @JsonDeserialize(as = CalibrationGroup.class)
	    private CalibrationGroup createCalibrationGroup = CalibrationGroup.DEFAULT;
	    
	    @JsonDeserialize(as = CalibrationGroup.class)
	    private CalibrationGroup editCalibrationGroup = CalibrationGroup.DEFAULT;
	    
	    @JsonDeserialize(as = AssessmentBank.class)
	    private AssessmentBank assessmentBank = AssessmentBank.DEFAULT;
	    
	    @JsonDeserialize(as = Event.class)
	    private Event event = Event.DEFAULT;
	    
	    @JsonDeserialize(as = User.class)
	    private User searchTeacher = User.DEFAULT;
	    
	    @JsonProperty
		private String componentWithPendingCredit;
	    
	    @JsonDeserialize(as = EvaluationProgram.class)
	    private EvaluationProgram teacherEvaluationProgram = EvaluationProgram.DEFAULT;
	    
	    @JsonDeserialize(as = EvaluationProgram.class)
	    private EvaluationProgram principalEvaluationProgram = EvaluationProgram.DEFAULT;
	    
	    @JsonDeserialize(as = EvaluationProgram.class)
	    private EvaluationProgram principalSignOffProgram = EvaluationProgram.DEFAULT;
	    
	    @JsonDeserialize(as = CourseApprovalAdmin.class)
	    private CourseApprovalAdmin courseApprovalAdmin = CourseApprovalAdmin.DEFAULT;
	    
	    @JsonDeserialize(as = PDUserData.class)
	    private PDUserData pdUserData = PDUserData.DEFAULT;
	    
	    @JsonDeserialize(as = CourseAdministration.class)
	    private CourseAdministration courseAdministration = CourseAdministration.DEFAULT;
	    
	    @JsonDeserialize(as = FormsV2Data.class)
	    private FormsV2Data formsV2Data = FormsV2Data.DEFAULT;
	    
	    @JsonDeserialize(as = PaymentData.class)
	    private PaymentData paymentData = PaymentData.DEFAULT;
	    
	    @JsonDeserialize(as = RatingScaleAdministrationData.class)
	    private RatingScaleAdministrationData ratingScaleAdministrationData = RatingScaleAdministrationData.DEFAULT;
	    
	    @JsonDeserialize(as =CourseDashboardData.class)
	    private CourseDashboardData courseDashboardData = CourseDashboardData.DEFAULT;
	    
	    @JsonDeserialize(as = SectionList.class)
	    private SectionList sectionList = SectionList.DEFAULT;
	    
	    @JsonDeserialize(as = ProgramManagementDetails.class)
	    private ProgramManagementDetails programManagement = ProgramManagementDetails.DEFAULT;
	    
	    @JsonProperty
	    private String sectionNoName;
	    
	    @JsonProperty
	    private String courseName;
	    
	    @JsonDeserialize(as = NewObservationData.class)
	    private NewObservationData newObservationData = NewObservationData.DEFAULT;
	    
	    @JsonDeserialize(as = LearningOpportunityData.class)
	    private LearningOpportunityData learningOpportunityData = LearningOpportunityData.DEFAULT;
	    
	    @JsonDeserialize(as = InstructorLedCourseData.class)
	    private InstructorLedCourseData instructorLedCourseData = InstructorLedCourseData.DEFAULT;
	    
	    @JsonDeserialize(as = CourseCatalog.class)
	    private CourseCatalog courseCatalog = CourseCatalog.DEFAULT;
	    
	    @JsonDeserialize(as = StaffManagement.class)
	    private StaffManagement staffManagement = StaffManagement.DEFAULT;
	    
	    @JsonDeserialize(as = NewParticipation.class)
	    private NewParticipation newParticipation = NewParticipation.DEFAULT;
	    
	    @JsonDeserialize(as = CalibrationGroup.class)
	    private CalibrationGroup calibrationAdministration = CalibrationGroup.DEFAULT;
	    
	    @JsonDeserialize(as = StaffManagement.class)
	    private StaffManagement staffGroup = StaffManagement.DEFAULT;
	    
	    @JsonDeserialize(as = Transcript.class)
	    private Transcript transcript = Transcript.DEFAULT;
	    
	    @JsonDeserialize(as = CourseApprovalAdmin.class)
	    private CourseApprovalAdmin sectionCopy = CourseApprovalAdmin.DEFAULT;
	    
	    @JsonDeserialize(as = RoomBookingData.class)
	    private RoomBookingData roomBookingData = RoomBookingData.DEFAULT;
	    
	    @JsonDeserialize(as = NewObservationData.class)
	    private NewObservationData observationsTypeList = NewObservationData.DEFAULT;
	    
	    @JsonDeserialize(as  = CourseApprovalAdmin.class)
	    private CourseApprovalAdmin staffDevelopment = CourseApprovalAdmin.DEFAULT;

	    @JsonDeserialize(as = CalibrationGroup.class)
	    private CalibrationGroup resourceData = CalibrationGroup.DEFAULT;
	    
	    @JsonDeserialize(as = EvaluationProgram.class)
	    private EvaluationProgram newTeacherEvaluation = EvaluationProgram.DEFAULT;
	    
	    public CourseApprovalAdmin getCourseApprovalAdmin() {
			return courseApprovalAdmin;
		}

		public EvaluationProgram getPrincipalSignOffProgram() {
			return principalSignOffProgram;
		}

		public EvaluationProgram getPrincipalEvaluationProgram() {
			return principalEvaluationProgram;
		}

		public EvaluationProgram getTeacherEvaluationProgram() {
			return teacherEvaluationProgram;
		}

		public EvaluationProgram getEvaluationProgram() {
			return evaluationProgram;
		}

		public CalibrationGroup getCreateCalibrationGroup() {
			return createCalibrationGroup;
		}
		
		public CalibrationGroup getEditCalibrationGroup() {
			return editCalibrationGroup;
		}

		public AssessmentBank getAssessmentBank() {
			return assessmentBank;
		}

		public Event getEvent() {
			return event;
		}
		
		public User getSearchUser() {
			return searchTeacher;
		}

		public User getSearchTeacher() {
			return searchTeacher;
		}

		public String getComponentWithPendingCredit() {
			return componentWithPendingCredit;
		}

		public PDUserData getPdUserData() {
			return pdUserData;
		}

		public CourseAdministration getCourseAdministration() {
			return courseAdministration;
		}

		public FormsV2Data getFormsV2Data() {
			return formsV2Data;
		}

		public PaymentData getPaymentData() {
			return paymentData;
		}

		public RatingScaleAdministrationData getRatingScaleAdministrationData() {
			return ratingScaleAdministrationData;
		}

		public String getSectionNoName() {
			return sectionNoName;
		}

		public String getCourseName() {
			return courseName;
		}

		public CourseDashboardData getCourseDashboardData() {
			return courseDashboardData;
		}

		public NewObservationData getNewObservationData() {
			return newObservationData;
		}

		public LearningOpportunityData getLearningOpportunityData() {
			return learningOpportunityData;
		}

		public InstructorLedCourseData getInstructorLedCourseData() {
			return instructorLedCourseData;
		}

		public SectionList getSectionList() {
			return sectionList;
		}

		public CourseCatalog getCourseCatalog() {
			return courseCatalog;
		}

		public StaffManagement getStaffManagement() {
			return staffManagement;
		}

		public NewParticipation getNewParticipation() {
			return newParticipation;
		}

		public CalibrationGroup getCalibrationAdministration() {
			return calibrationAdministration;
		}

		public StaffManagement getStaffGroup() {
			return staffGroup;
		}

		public Transcript getTranscript() {
			return transcript;
		}

		public CourseApprovalAdmin getSectionCopy() {
			return sectionCopy;
		}

		public ProgramManagementDetails getProgramManagement() {
			return programManagement;
		}

		public RoomBookingData getBookRoom() {
			return roomBookingData;
		}

		public NewObservationData getObservationsTypeList() {
			return observationsTypeList;
		}

		public CourseApprovalAdmin getStaffDevelopment() {
			return staffDevelopment;

		}

		public CalibrationGroup getResourceData() {
			return resourceData;
		}

		public EvaluationProgram getNewTeacherEvaluation() {
			return newTeacherEvaluation;
		}
}
