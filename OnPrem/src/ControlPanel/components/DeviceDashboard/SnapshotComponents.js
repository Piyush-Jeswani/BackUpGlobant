
module.exports={
    deviceName:element(by.css(".snapshot-site-info .name h1")),
    device_Site_Summary:element(by.css(".snapshot-site-info .site-summary span")),
    schedule_Snapshot_button:element(by.css("[class='snapshot-button']")),
    take_a_snapshot_btn:element(by.css(".take-snapshot-button")),
    snapShotName_Frame:element(by.css(".historical-snapshot-title.main-image-date")),
    navigation_left:element(by.cssContainingText(".historical-snapshot-main-image-arrow mat-icon","keyboard_arrow_left")),
    navigation_right:element(by.cssContainingText(".historical-snapshot-main-image-arrow mat-icon","keyboard_arrow_right")),
    system_Parameters_Lbl:element(by.cssContainingText(".center-info","system parameters")),
    show_Zones_Lbl:element(by.cssContainingText(".center-info","show zones")),
    selected_History_snapshot:element(by.css(".historical-snapshot-item.historical-snapshot-item-marked")),
    checkbox_Selected_Snapshot:element(by.css(".historical-snapshot-item.historical-snapshot-item-marked input")),
    on_the_device_Lbl:element.all(by.css(".table_cel .column_name")).first(),
    scheduled_Lbl:element.all(by.css(".table_cel .column_name")).last(),
    new_dialog_container_NewScheduleSnapshot:element(by.css("mat-dialog-container.mat-dialog-container")),
    schedule_new_snapshot_Lbl:element(by.css(".mat-dialog-container h2")),
    calendar_Dialog_Btn:element(by.css(".fa.fa-calendar")),
    select_hours:element.all(by.css(".select-arrow.material-icons")).first(),
    // select_min:element.all(by.css(".select-arrow.material-icons")).get(1),
    // select_sec:element.all(by.css(".select-arrow.material-icons")).get(2),
    image_type:element.all(by.css(".select-arrow.material-icons")).last(),
    cancelBtn:element(by.cssContainingText(".btn-clean-transparent","Cancel")),
    create_Schedule_Btn:element(by.cssContainingText(".btn.btn-primary","Create Schedule")),

    verifyNewDialogOpensAfterClickingScheduleSnapshot:function(){
        expect(this.new_dialog_container_NewScheduleSnapshot.isVisible()).toBe(true);
    },

    clickDialogCancelBtn:function(){
        this.cancelBtn.click();
    },

    clickCreateScheduleBtn:function(){
        this.create_Schedule_Btn.click();
    },

    clickScheduleSnapshot:function(){
        this.schedule_Snapshot_button.click();
    }, 

    clickTakeASnapShot:function(){
        this.take_a_snapshot_btn.click();
    },

    getRecentSnapShotDetails:function(){
        return this.snapShotName_Frame.getText().then(function(text){
            return text;
        })
    }




}