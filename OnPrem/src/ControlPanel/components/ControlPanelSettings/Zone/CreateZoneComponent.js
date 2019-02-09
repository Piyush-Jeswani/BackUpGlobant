module.exports = {

    zone_Name_Input:element(by.css("[placeholder='zone name']")),
    zone_Id_Input:element(by.css("[placeholder='zone id']")),
    zone_Type_Dropdown:element(by.css("[placeholder='zone type']")),
    optionToCreateSubZone_Radio:element.all(by.css('.mat-radio-input')),
   
    subZone_Name_Input:element.all(by.css("[placeholder='sub zone name']")),
    subZone_Id_Input:element.all(by.css("[placeholder='subzone id']")),
    subZone_Type_Dropdown:element.all(by.css("[placeholder='sub zone type']")),
    addSubZone_Link:element(by.css('div.add-subzones a')),
    createZone_btn:element(by.buttonText('CREATE ZONE')),
    cancel_btn:element(by.buttonText('CANCEL')),
    effective_date_dropdown:element.all(by.css("[formcontrolname='effective_date']")),

};