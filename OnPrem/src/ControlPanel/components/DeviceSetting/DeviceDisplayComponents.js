const obj = "456";
const deviceId = ".mat-column-deviceId";
const macAddress = ".mat-column-MACAddress";
const deviceType = ".mat-column-DeviceType";
const lead = ".mat-column-LEAD";
const actions = ".mat-column-actions";
const  serialNum = ".mat-column-serialNumber";
const orbitNo = ".mat-column-orbitNo";
const model = ".mat-column-model";
const refreshBtn = ".fa-refresh";
const editBtn = ".fa-pencil-square-o";

module.exports = {

    data_acquisition_process_lbl:element(by.css(".table-highlight-row .label h4")),
    data_acquisition_process_edit:element(by.css(".actions .btn-icon")),
    create_Device_Btn :element.all(by.css(".action-row .btn.btn-primary-2")).first(),
    ip_Devices_Lbl : element(by.css(".field-name.field-title:nth-child(1)")),
    ip_Devices_DeviceId_Lbl : element(by.css(".mat-header-cell.mat-column-deviceId")),
    ip_Devices_MACAddress_Lbl : element(by.css(".mat-header-cell.mat-column-MACAddress")),
    ip_Devices_DeviceType_Lbl : element(by.css(".mat-header-cell.mat-column-DeviceType")),
    ip_Devices_Lead_Lbl : element(by.css(".mat-header-cell.mat-column-LEAD")),
    ip_Devices_table : element.all(by.css(".ng-star-inserted .field-info.clean table")).first(),
    ip_Devices_rows : element.all(by.css(".ng-star-inserted .field-info.clean table")).first().all(by.css("tbody tr")),//

    orbits_Devices_table : element.all(by.css(".ng-star-inserted .field-info.clean table")).last(),
    orbits_Devices_rows : element.all(by.css(".ng-star-inserted .field-info.clean table")).last().all(by.css("tbody tr")),

    //Create Device 
    orbitRadioBtn : element(by.css(".mat-radio-button[value='orbit'] .mat-radio-container")),

    clickCreateBtn:function(){
        this.create_Device_Btn.click();
    },

    chooseOrbitOption:function(){
        this.orbitRadioBtn.click();
    },

    getAllColValuesFromRow:function(rowLocator, columnValue, message){
        rowLocator.map(function(ele){
            ele.element(by.css(columnValue)).getText().then(function(text){
                console.log("Printing "+ message +" : "+text);   
            })
        })
    },


    getAllDeviceId_IpDevices:function(){
        this.getAllColValuesFromRow(this.ip_Devices_rows, deviceId, "Value of device Id from IP devices")
        // this.ip_Devices_rows.map(function(ele){
        //     ele.element(by.css(deviceId)).getText().then(function(text){
        //         console.log("Printing device ID :"+text);                                
        //     })
        // })
    },

    getAllDeviceId_OrbitDevices:function(){
        this.getAllColValuesFromRow(this.orbits_Devices_rows, deviceId, "Value of device Id from Orbit devices")       
    }




    };
