module.exports = {

    entrance_Form_Title:element(by.css(".form_title.ng-star-inserted")),
    entrance_Name_Input:element(by.css("[placeholder='entrance name']")),
    entrance_Id_Input:element(by.css("[placeholder='entrance id']")),
    entrance_Type_Dropdown:element(by.css("[placeholder='entrance type']")),
    effective_date_dropdown:element(by.css("[formcontrolname='effective_date']")),
    end_date_dropdown:element(by.css("[formcontrolname='end_date']")),
    optionToSelectSourceData_Radio:element.all(by.css('.mat-radio-input')),
    selectZoneOrSubzone:element(by.css("[placeholder='select zone or sub zone']")),
    selectedZoneorSubzone:element.all(by.css("div.item")),
    deleteZoneorSubzone:element.all(by.css("div.item .btn-icon")),
    createEntrance_btn:element(by.buttonText('CREATE ENTRANCE')),
    selectZoneOrSubzone_Popup:element.all(by.css("span.mat-option-text")),
    selectReversalSourceData_Popup:element.all(by.css("span.mat-option-text")),
    cancel_btn:element(by.buttonText('CANCEL')),
    close_Icon:element(by.css('.btn-dialog-close')),
    error_message:element(by.css("div.mat-form-field-subscript-wrapper .mat-error")),
    reversal_source_data_dropdown:element(by.css("[placeholder='select reversal source data']")),

    getEntranceFormTitle:function(){
        return this.entrance_Form_Title.getText();
    },
    enterEntranceName:function(entrance_name){
        this.entrance_Name_Input.sendKeys(entrance_name);
    },
    enterEntranceId:function(entrance_Id){
        this.entrance_Id_Input.sendKeys(entrance_Id);
    },
    selectEntranceType:function(entrance_type){
        this.entrance_Type_Dropdown.sendKeys(entrance_type);
    },
    selectEntranceEffectiveDate:function(effective_date){
        this.effective_date_dropdown.sendKeys(effective_date);
    },
    selectEntranceEndDate:function(end_date){
        this.end_date_dropdown.sendKeys(entrance_name);
    },
    selectSourceData:function(index){
        this.optionToSelectSourceData_Radio.get(index).click();
    },
    
    selectZoneOrSubzone_Option:function(zone_name){
        this.selectedZoneorSubzone.click();
        let rows = this.selectZoneOrSubzone_Popup;
        rows.filter(function(row, index){
            return row.getText().then(function(text) {
            return text.indexOf(zone_name) != -1;
            });
        }).first().click();
    },
    selectReversalData_Option:function(source_name){
        this.reversal_source_data_dropdown.click();
        let rows = this.selectReversalSourceData_Popup;
        rows.filter(function(row, index){
            return row.getText().then(function(text) {
            return text.indexOf(source_name) != -1;
            });
        }).first().click();
    },
    clickCancel:function(){
        this.cancel_btn.click();
    },
    clickCreateEntrance:function(){
        this.createEntrance_btn.click();
    },
    clickClose:function(){
        this.close_Icon.click();
    },
    deleteZoneorSubzone:function(delete_zone_name){
        let rows = this.deleteZoneorSubzone;
        rows.filter(function(row, index){
            return row.getText().then(function(text) {
            return text.indexOf(delete_zone_name) != -1;
            });
        }).first().click();
    }

};