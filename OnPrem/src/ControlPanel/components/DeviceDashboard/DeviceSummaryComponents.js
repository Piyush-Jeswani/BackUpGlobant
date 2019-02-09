//Device Summary
const siteNameLoc = element(by.css(".breadcrumb .ng-star-inserted"));
const siteIdLoc = element(by.css("[placeholder='site id']"));
const custIdLoc = element(by.css("[placeholder='cust id']"));
const reportingNameLoc = element(by.css("[placeholder='reporting name']"));
const siteTypeLoc = element(by.css("[placeholder='site type']"));
const currencyLoc = element(by.css("[placeholder='currency']"));// div span span
const siteMidnightLoc = element(by.css("[placeholder='site midnight hour'] div span span"));
const dailyAcquasitionHr = element.all(by.css("[placeholder='Daily Acquisition Time'] div .mat-select-value span span:nth-child(1)")).first();
const dailyAcquasitionMin = element.all(by.css("[placeholder='Daily Acquisition Time'] div .mat-select-value span span:nth-child(1)")).last();
const effectiveDate = element(by.css("[placeholder='DD/MM/YYYY'][formcontrolname='effective_date']"));
const endDate = element(by.css("[placeholder='DD/MM/YYYY'][formcontrolname='end_date']"));
const compStartDate = element(by.css("[placeholder='DD/MM/YYYY'][formcontrolname='comp_start_date']"));
const trafficStartDate = element(by.css("[placeholder='DD/MM/YYYY'][formcontrolname='traffic_start_date']"));
const closeSiteDetails = element(by.css(".ng-star-inserted .btn-dialog-close"));
//

const totalDevicesValue = element(by.css(".summary .total .value"));
const outOFDevicesLbl = element.all(by.css(".summary .total .label"));
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

const deviceNames = [];
const data = require('../../../ControlPanel/resources/ON1005.json');


module.exports = (function () {

        var editSiteComponent = function () {    
        }

        editSiteComponent.prototype = {

            getDeviceDetailsAndSetValue: function () {
              return siteNameLoc.getText()
                .then(function (text) {
                  console.log("Testing :" + text);
                  siteDetails.siteName = text;
                })
                .then(function () {          
                    siteIdLoc.getText().then(function (text) {
                    siteDetails.siteId = text;
                  });
                })
                .then(function () {          
                    custIdLoc.getText().then(function (text) {
                        siteDetails.custId = text;
                  });
                })            
                .then(function () {          
                    reportingNameLoc.getText().then(function (text) {
                        siteDetails.reportingName = text;
                  });
                })
                .then(function () {          
                    siteTypeLoc.getText().then(function (text) {
                        siteDetails.siteType = text;
                  });
                })
                .then(function () {          
                    currencyLoc.getText().then(function (text) {
                        siteDetails.currency = text;
                  });
                })
                .then(function () {          
                    siteMidnightLoc.getText().then(function (text) {
                        siteDetails.siteMidnight = text;
                  });
                })
                .then(function () {          
                    dailyAcquasitionHr.getText().then(function (text) {
                        siteDetails.dailyAcquisitionHr = text;
                  });
                })
                .then(function () {          
                    dailyAcquasitionMin.getText().then(function (text) {
                        siteDetails.dailyAcquisitionMin = text;
                  });
                }) //effectiveDate
                .then(function () {          
                    effectiveDate.getText().then(function (text) {
                        siteDetails.effectiveDate = text;
                  });
                }) 
                .then(function () {          
                    endDate.getText().then(function (text) {
                        siteDetails.endDate = text;
                  });
                }) 
                .then(function () {          
                    compStartDate.getText().then(function (text) {
                        siteDetails.compStartDate = text;
                  });
                }) 
                .then(function () {          
                    trafficStartDate.getText().then(function (text) {
                        siteDetails.trafficStartDate = text;
                  });
                }) 

            },

            closeSiteDetailsForm:function(){
              closeSiteDetails.click();
            }
          }
          return editSiteComponent;
        })();

 //---------------------------------------------------   

// module.exports = {

        
//         var editSiteComponent = function () {            
//         }
//         editSiteComponent.prototype = {
//             getDeviceDetailsAndSetValue: function () {
//                 return siteNameLoc.getText()
//                     .then(function (text) {
//                         console.log("Testing :" + text);
//                         siteDetails.siteName = text;
//                     })
//                     .then(function () {
//                         siteIdLoc.getText().then(function (text) {
//                             siteDetails.siteId = text;
//                         });
//                     })
//                     .then(function () {
//                         custIdLoc.getText().then(function (text) {
//                             siteDetails.custId = text;
//                         });
//                     })
//                     .then(function () {
//                         reportingNameLoc.getText().then(function (text) {
//                             siteDetails.reportingName = text;
//                         });
//                     })
//                     .then(function () {
//                         siteTypeLoc.getText().then(function (text) {
//                             siteDetails.siteType = text;
//                         });
//                     })
//                     .then(function () {
//                         currencyLoc.getText().then(function (text) {
//                             siteDetails.currency = text;
//                         });
//                     })
//                     .then(function () {
//                         siteMidnightLoc.getText().then(function (text) {
//                             siteDetails.siteMidnight = text;
//                         });
//                     })
//                     .then(function () {
//                         dailyAcquasitionHr.getText().then(function (text) {
//                             siteDetails.dailyAcquisitionHr = text;
//                         });
//                     })
//                     .then(function () {
//                         dailyAcquasitionMin.getText().then(function (text) {
//                             siteDetails.dailyAcquisitionMin = text;
//                         });
//                     }) //effectiveDate
//                     .then(function () {
//                         effectiveDate.getText().then(function (text) {
//                             siteDetails.effectiveDate = text;
//                         });
//                     })
//                     .then(function () {
//                         endDate.getText().then(function (text) {
//                             siteDetails.endDate = text;
//                         });
//                     })
//                     .then(function () {
//                         compStartDate.getText().then(function (text) {
//                             siteDetails.compStartDate = text;
//                         });
//                     })
//                     .then(function () {
//                         trafficStartDate.getText().then(function (text) {
//                             siteDetails.trafficStartDate = text;
//                         });
//                     })
//             },
//             closeSiteDetailsForm:function(){
//                 closeSiteDetails.click();
//               }
//             }
//             return editSiteComponent;
//         }();


        //----------------------------------------------------------------------------


        // var siteDetails = require('../resources/siteDetails.js');

        // module.exports = (function () {

        //     var editSiteComponent = function () {    
        //     }

        //     editSiteComponent.prototype = {

        //         getDeviceDetailsAndSetValue: function () {
        //           return siteNameLoc.getText()
        //             .then(function (text) {
        //               console.log("Testing :" + text);
        //               siteDetails.siteName = text;
        //             })
        //             .then(function () {          
        //                 siteIdLoc.getText().then(function (text) {
        //                 siteDetails.siteId = text;
        //               });
        //             })
        //             .then(function () {          
        //                 custIdLoc.getText().then(function (text) {
        //                     siteDetails.custId = text;
        //               });
        //             })            
        //             .then(function () {          
        //                 reportingNameLoc.getText().then(function (text) {
        //                     siteDetails.reportingName = text;
        //               });
        //             })
        //             .then(function () {          
        //                 siteTypeLoc.getText().then(function (text) {
        //                     siteDetails.siteType = text;
        //               });
        //             })
        //             .then(function () {          
        //                 currencyLoc.getText().then(function (text) {
        //                     siteDetails.currency = text;
        //               });
        //             })
        //             .then(function () {          
        //                 siteMidnightLoc.getText().then(function (text) {
        //                     siteDetails.siteMidnight = text;
        //               });
        //             })
        //             .then(function () {          
        //                 dailyAcquasitionHr.getText().then(function (text) {
        //                     siteDetails.dailyAcquisitionHr = text;
        //               });
        //             })
        //             .then(function () {          
        //                 dailyAcquasitionMin.getText().then(function (text) {
        //                     siteDetails.dailyAcquisitionMin = text;
        //               });
        //             }) //effectiveDate
        //             .then(function () {          
        //                 effectiveDate.getText().then(function (text) {
        //                     siteDetails.effectiveDate = text;
        //               });
        //             }) 
        //             .then(function () {          
        //                 endDate.getText().then(function (text) {
        //                     siteDetails.endDate = text;
        //               });
        //             }) 
        //             .then(function () {          
        //                 compStartDate.getText().then(function (text) {
        //                     siteDetails.compStartDate = text;
        //               });
        //             }) 
        //             .then(function () {          
        //                 trafficStartDate.getText().then(function (text) {
        //                     siteDetails.trafficStartDate = text;
        //               });
        //             }) 

        //         },

        //         closeSiteDetailsForm:function(){
        //           closeSiteDetails.click();
        //         }
        //       }
        //       return editSiteComponent;
        //     })();





        //--------------$$$$$$$$$$$$$$$$$$$$$$$$$


        // getIndexOfDeviceId: function (id) {
        //     allDeviceIds.map(function (ele, index) {
        //         if (ele.equals(id)) {
        //             return index
        //         };
        //     })
        // },

        // getAllDeviceNames: function (rowNum) {
        //     allDeviceNames.map(function (ele, index) {
        //         ele.getText().then(function (text) {
        //             // deviceNames.push(text);
        //             if (rowNum == index) {
        //                 data.deviceDetails.deviceName = text;
        //                 console.log("Printing device name :" + data.deviceDetails.deviceName);
        //             }


        //         })
        //         return deviceNames;
        //     })
        //     return deviceNames;
        // },

        // getAllDeviceID: function () {
        //     allDeviceIds.map(function (ele, index) {
        //         ele.getText().then(function (text) {

        //         })
        //     })
        // }
