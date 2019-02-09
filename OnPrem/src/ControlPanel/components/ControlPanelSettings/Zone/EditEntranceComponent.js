module.exports = {

    entrance_Name_Input:$("[placeholder='entrance name']"),
    entrance_Id_Input:$("[placeholder='entrance id']"),
    entrance_Type_Dropdown:$("[placeholder='entrance type']"),
    effective_date_dropdown:$("[formcontrolname='effective_date']"),
    end_date_dropdown:$("[formcontrolname='end_date']"),
    optionToSelectSourceData_Radio:element.all(by.css('.mat-radio-input')),
    selectZoneOrSubzone:$("[placeholder='select zone or sub zone']"),
    selectedZoneorSubzone:element.all(by.css("div.item")),
    deleteZoneorSubzone:element.all(by.css("div.item .btn-icon")),
    updateEntrance_btn:$('.btn-primary'),
    selectZoneOrSubzone_Popup:element.all(by.css("span.mat-option-text")),
    cancel_btn:$('.btn-transparent'),
    close_Icon:element(by.css('.btn-dialog-close')),

    getEntranceName:function(){
        return this.entrance_Name_Input;
    },
    getEntranceId:function(){
        return this.entrance_Id_Input
    },
    getEntranceType:function(){
        return this.entrance_Type_Dropdown;
    },

    getEntrance_EffectiveDate:function(){
        return this.effective_date_dropdown;
    },
    getEntrance_EndDate:function(){
        return this.end_date_dropdown;
    },

    getSourceData_TrafficCounters:function(){
        return this.optionToSelectSourceData_Radio.get(0);
    },
    getSourceData_Reversal:function(){
        return this.optionToSelectSourceData_Radio.get(1);
    },
    getZoneorSubZoneDropDown:function(){
        return this.selectZoneOrSubzone;
    },
    getUpdateEntrance:function(){
        return this.updateEntrance_btn;
    },
    getCancelEntrance:function(){
        return this.cancel_btn;
    },
};