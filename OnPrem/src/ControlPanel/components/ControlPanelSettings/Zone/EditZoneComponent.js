const commonOperation =require('../../../operations/CommonOperation.js');


module.exports = {

    formTitle:$("div.form_title"),
    subZoneTitle:$("div.form_title_2"),
    zone_labels:$$('.container.ng-pristine.ng-valid.ng-touched label.mat-form-field-label'),
    formZone_Labels:$("form.container.ng-pristine.ng-valid.ng-touched"),
    subZones_rows:$$("form[class='container ng-untouched ng-pristine ng-valid']"),
    Zone_Name_Input:element(by.css("[placeholder='zone name']")),
    Zone_Id_Input:element(by.css("[placeholder='zone id']")),
    Zone_Type_Dropdown:element(by.css("[placeholder='zone type']")),
    optionToCreateSubZone_Radio:element.all(by.css('.mat-radio-input')),

    zone_effective_and_end_date_dropdown:$$("div.site-modal-content>app-site-form-zones>form .mat-icon-button"),
    

    effective_date_dropdown:element.all(by.css("[formcontrolname='effective_date']")),
    end_date_dropdown:element.all(by.css("[formcontrolname='end_date']")),

    SubZone_Name_Input:$$("[placeholder='sub zone name']"),
    SubZone_Id_Input:element.all(by.css("[placeholder='sub zone id']")),
    SubZone_Type_Dropdown:element.all(by.css("[placeholder='sub zone type']")),
    subZoneEffective_Date:$$("app-site-form-subzones [formcontrolname='effective_date']"),
    subZoneEnd_Date:$$("app-site-form-subzones [formcontrolname='end_date']"),
    AddSubZone_Link:element(by.css('div.add-subzones a')),
    UpdateZone_btn:$(".btn-primary"),
    Cancel_btn:$(".btn-transparent"),
    
    close_Icon:element(by.css('.btn-dialog-close')),
    
    
    getSubZones:function(subZoneName){
        let rows = this.subZones_rows;
      return  rows.filter(function(row, index){
            return row.getText().then(function(text) {
                return text.indexOf(subZoneName) != -1;
              });
         }).first();
    },

    editZoneName:function(zone_name){
        this.Zone_Name_Input.clear();
        this.Zone_Name_Input.sendKeys(zone_name);
    },

    getZoneName:function(){
        return this.Zone_Name_Input;
    },

    getZoneId:function(){
        return this.Zone_Id_Input;
    },
    getZoneType:function(){
        return this.Zone_Type_Dropdown;
    },
    getZoneEffectiveDate:function(){
        return this.zone_effective_and_end_date_dropdown.get(0);
    },
    getZoneEndDate:function(){
        return this.zone_effective_and_end_date_dropdown.get(1);
    },
    getFormTitle:function(){
        return this.formTitle;
    },

    getSubZoneId:function(){
        return this.SubZone_Id_Input.get(0);
    },
    getSubZoneName:function(){
        return this.SubZone_Name_Input.get(0);
    },
    getSubZoneType:function(){
        return this.SubZone_Type_Dropdown.get(0);
    },
    getSubZoneEffectiveDate:function(){
        return this.subZoneEffective_Date.get(0);
    },
    getSubZoneEndDate:function(){
        return this.subZoneEnd_Date.get(0);
    },
    getUpdateZone:function(){
        return this.UpdateZone_btn;
    },
    getCancel:function(){
        return this.Cancel_btn;
    },
    getSubZoneTitle:function(){
        return this.subZoneTitle;
    },

    getEditZone_Name_Label:function(){
        return this.zone_labels.get(0);
        
    },
    getEditZone_Id_Label:function(){
        return this.zone_labels.get(1);
        
    },
    getEditZone_Type_Label:function(){
        return this.zone_labels.get(2);
        
    },
    getEditZone_Effective_Date_Label:function(){
        return this.zone_labels.get(3);
        
    },
    getEditZone_End_Date_Label:function(){
        return this.zone_labels.get(4);
        
    },
    getOptiontoCreateSubZone_No:function(){
        return this.optionToCreateSubZone_Radio.get(0);
    },
    getOptiontoCreateSubZone_Yes:function(){
        return this.optionToCreateSubZone_Radio.get(1);
    },
    clickZoneTypeDropDown:function(){
        this.Zone_Type_Dropdown.click();
    },
    selectZoneType:function(zone_type){
        commonOperation.customWait_visibilityOf(element(by.cssContainingText("mat-option span",zone_type)),10000);
        element(by.cssContainingText("mat-option span",zone_type)).click();
    },
    editZoneEffectiveDate:function(date){
        commonOperation.customWait_visibilityOf(this.zone_effective_and_end_date_dropdown.get(0),10000);
        this.zone_effective_and_end_date_dropdown.get(0).click();
        commonOperation.selectDate(date);
    },
    editZoneEndDate:function(date){
        commonOperation.customWait_visibilityOf(this.zone_effective_and_end_date_dropdown.get(1),10000);
        this.zone_effective_and_end_date_dropdown.get(1).click();
    },

   selectDate:function(date){
       commonOperation.selectDate(date);
   },
//    getSubZoneName:function(){
//     let rows = this.SubZone_Name_Input;
//     rows.filter(function(row, index){
//         return row.getText().then(function(text) {
//             return text.indexOf(organization_name) != -1;
//           });
//      }).first();

//        this.SubZone_Name_Input.getAttribute('value').then(function(value){
//            console.log(value);
           
//        })
//    }

        
};