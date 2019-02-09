//Device_List_Lbl
//row1_DeviceName_DeviceId_DeviceType_search
//show-Non-sccess-
//Show-25devices
//Show-25devices_dropDown
//Show-25devices_dropDownVaues
//2 Devices Found
//Table with Headings
//Navigation
//Support - COntact number and Email


const allDeviceNames = element.all(by.css(".mat-cell.mat-column-name"));
const allDeviceIds = element.all(by.css(".mat-cell.mat-column-id"));
const allDeviceType = element.all(by.css(".mat-cell.mat-column-type"));
const allDeviceSuccessRate = element.all(by.css(".mat-cell.mat-column-successfully"));
const allDeviceStatus = element.all(by.css(".mat-cell.mat-column-status"));
const allDeviceMac = element.all(by.css(".mat-cell.mat-column-mac"));
const searchDeviceName = element(by.css("input.mat-input-element"));
const showOnlyNonSuccess = element(by.css("div.mat-checkbox-frame"));
const showLabel = element(by.css("div.mat-select-value mat-select-trigger span.bold"));
const devicesLabel = element(by.css("div.mat-select-value mat-select-trigger span span"));
const showSelectedDevicesForDiplay = element.all(by.css("div.mat-select-value mat-select-trigger span")).get(2);
const totalDevicesFound = element(by.css("div.total_devices"));
const allRowsForDevices = element.all(by.css("tr[class='mat-row ng-tns-c15-91 ng-star-inserted'][role='row']"));
const allCameraIconInRows = element.all(by.css("[class='mat-row ng-tns-c15-6 ng-star-inserted'] td.mat-column-menu mat-icon")).first();
const allSnapShotIcon = element.all(by.cssContainingText("[class='mat-row ng-tns-c15-6 ng-star-inserted'] td.mat-column-menu mat-icon","camera_alt"));
const allVideoIcon = element.all(by.cssContainingText("[class='mat-row ng-tns-c15-6 ng-star-inserted'] td.mat-column-menu mat-icon","videocam"));

const deviceNames = [];
const data = require('../../../ControlPanel/resources/ON1005.json');

module.exports = {

    checkAllElementsArePresent:function(){        
        expect(allDeviceNames.count()).toBeGreaterThan(0);
        expect(allDeviceIds.count()).toBeGreaterThan(0);
        expect(allDeviceType.count()).toBeGreaterThan(0);
        expect(allDeviceSuccessRate.count()).toBeGreaterThan(0);
        expect(allDeviceStatus.count()).toBeGreaterThan(0);
        expect(allDeviceMac.count()).toBeGreaterThan(0);
        expect(allSnapShotIcon.count()).toBeGreaterThan(0);
        expect(allVideoIcon.count()).toBeGreaterThan(0);
    },

    checkSnapShotIconAreVisible:function(){
        expect(allSnapShotIcon.isDisplayed()).toBe(true);
        expect(allVideoIcon.isDisplayed()).toBe(true);
    },
    

    clickFirstCamera:function(){
        allCameraIconInRows.click();
    },

    getIndexOfDeviceId:function(id){
        allDeviceIds.map(function(ele,index){
            if(ele.equals(id)){ return index};
        })            
    },

    getAllDeviceNames:function(rowNum){
        allDeviceNames.map(function(ele,index){            
            ele.getText().then(function(text){
                // deviceNames.push(text);
                if(rowNum==index){
                data.deviceDetails.deviceName = text;   
                console.log("Printing device name :"+data.deviceDetails.deviceName);   
            }

                               
            }) 
            return deviceNames;           
        })
        return deviceNames;
    },

    getAllDeviceID:function(){
        allDeviceIds.map(function(ele,index){
            ele.getText().then(function(text){

            })
        })
    }

};

