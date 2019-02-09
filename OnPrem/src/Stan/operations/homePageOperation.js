const protractor_1 = require("protractor");
const EC = protractor_1.ExpectedConditions;

const loginComponent = require('../components/LoginComponents.js');
const homePageComponent = require('../components/HomePageComponents.js');
const organizationComponent = require('../components/OrganizationComponents.js');
const env = require( '../../../env.js');
const commonOperation =require('./CommonOperation.js');

    module.exports = {

        AddOrganizationandSite:function(organization_name,site_name){
            homePageComponent.verifyHomePageComponents();
            this.selectAnalyticsOption();   
            this.selectOrganization(organization_name);
            this.selectSite(site_name);
            expect(homePageComponent.getSiteName_Heading()).toBe(site_name);
        },

        selectAnalyticsOption:function(){
            homePageComponent.clickAdminDropDown();
            homePageComponent.clickAnalyticsOptionInDropDown(); 
        },


        selectOrganization:function(organization_name){
            homePageComponent.clickOrganisationDropDown();
            homePageComponent.selectOrganizationByName(organization_name);
        },

        selectSite(site_name){
            homePageComponent.clickSiteDropdown();
            homePageComponent.selectSiteByName(site_name);
        },

        GotoCustomDashboard:function(dashboard_name){
            homePageComponent.clickAnalyticsDashboard_Icon(dashboard_name);
           
        },

        setDefaultDashboard:function(dashboard_label){
            homePageComponent.click_edit_dashboard_btn();
            expect(homePageComponent.getdashboardTitle()).toBe(dashboard_label);
            homePageComponent.click_dashboard_title_btn();
            homePageComponent.click_saveChanges_btn();
        },

        logout:function(){
            homePageComponent.logout();
        },

        selectAdminOption:function(){
            homePageComponent.verifyHomePageComponents();
            homePageComponent.clickAdminDropDown();
            homePageComponent.clickAdminOptionInDropDown();
        },

        showRealTimeData:function(){
            homePageComponent.clickRealTimeData();
        },
       
        verifyRealTimeData_Dropdown_Options:function(option_name){
            homePageComponent.clickRealTimeDataDropDown();
           expect(homePageComponent.returnRealTimeDataDropDownOptions(option_name).isDisplayed()).toBe(true);
        },

        verifyTime_Options:function(time_option){
            homePageComponent.clickTimeIcon();
            expect(homePageComponent.verifyIntervalElement(time_option).isDisplayed()).toBe(true);
        },

        verifyOptionIsSelected:function(option_name){
            sizeBeforeOccupancy = homePageComponent.getCountOfTotalMarkers();
            homePageComponent.clickRealTimeDataDropDown();
            homePageComponent.returnRealTimeDataDropDownOptions().click();
            sizePostOccupancy = homePageComponent.getCountOfTotalMarkers();
   
           expect(sizePostOccupancy).toBeGreaterThan(sizeBeforeOccupancy);
        },

        SelectValueinTrafficDropDown:function(value_name,charToVertify,position){
            homePageComponent.clickTrafficDropDown();
         
            if(position=="right")
            {
                homePageComponent.getSummaryAverage(value_name).then(function(txt){
                    expect(txt.charAt(txt.length-1)).toBe(charToVertify);
                })
            }
            if(position=="left")
            {

                homePageComponent.getSummaryAverage(value_name).then(function(txt){
                    expect(txt.charAt(0)).toBe(charToVertify);
                })
            }
            
        }

//     this.clickAddOrganizationButton = function(){
//         homePageComponent.addOrganizationBtn.click();
//         // element(by.css('.icon.icon-import')).click();
//     }

 

//     this.clickOrganisationDropDown = function(){
//         homePageComponent.organizationDropDown.click();
//         // element(by.css("#organisation-picker")).click();
//     };
    
//     this.clickSiteDropDown = function(){
//         // browser.waitForAngular();
//         // var isSiteVisible = EC.visibilityOf(element(by.css('#site-picker')));
//         // browser.wait(isSiteVisible,1500000);
//         // browser.wait(function(){
//         //     return element(by.css('#site-picker')).isDisplayed();
//         // },2*60*1000).then(function(){
//         //     element(by.css("#site-picker")).click();
//         // });
//         //browser.sleep(500000);
//         // element(by.css("#site-picker")).click();
//         homePageComponent.sitePicker.click();
//     };

//     // This is used for organisation as well as property
//     this.selectSiteName = function(text){
//         element(by.cssContainingText(homePageComponent.siteName, text)).click();
//     };



//     this.clickRealTimeDataDropDown = function(){
//         homePageComponent.realTimeDataDropDown.click();
//         // element(by.css(".real-time-actions .dropdown-toggle")).click();
//     }

//     this.clickOccupancyInDropDown = function(){
//         element(by.cssContainingText(homePageComponent.dropDown,'Occupancy')).click();
//     }
    
//     this.getCountOfTotalMarkers = function(){
//         return homePageComponent.markers.length;
//     };

//     this.clickTimeIcon = function(){
//         homePageComponent.timeIcon.click();
//     }    

//     this.clickOptionForTimeinterval = function(text){
        
//         element(by.cssContainingText(homePageComponent.optionTimeInterval,text))
//     }

//     this.clickShowTableButton = function(){
//         // element(by.buttonText('Show table')).click();
//         homePageComponent.showTableButton.click();
//     }

//     this.clickHideTableButton = function(){
//         homePageComponent.hideTableBtn.click();
//     }

//     this.getindexOfTableHeaderRealTime = function(text){
//         homePageComponent.tableHeaderRealTime.map(function(ele,index){
//                 if(ele==text){
//                 return index;
//                 }
//         })
//     }

//     this.checkIfItemPresentInRealTimeDropDown = function(text){
//         homePageComponent.realTimeDropDown.map(function(ele,index){
//             if(ele==text){
//                 return true;
//             }
//         })
//     }

//     this.checkNumberOfRowsInRealDataTable = function(){
//         return (homePageComponent.noOfRowsInRealData.length());
//     }    

//     this.getTrafficDropDownBtn = function(){        
//         return (homePageComponent.trafficDropDown.get(1));
//     }
//     this.getPeriodChart = function(){
//         return (homePageComponent.selectedPeriodChart);        
//     }

//     this.clickTrafficDropDown = function(){        
//         homePageComponent.trafficDropDown.get(1).click().then(function(){
//             console.log("Inside Traffic click Promise");

//         });
//     }    

//     this.getOptionForTraffic = function(){
//         return (homePageComponent.optionOnTraffic);
//     }

//     this.clickOptionForTraffic = function(val){
//         homePageComponent.allOptionsOnTraffic.get(val).click();
//         //element(by.cssContainingText('.dropdown.kpi-dropdown.btn-group.open .dropdown-menu li a',text)).click();        
//     }

//     this.getValueFromSummaryContainer = function(){
//         return homePageComponent.allValuesFromSummmaryContainer.first().getText();
        
               
//     }
//     this.getCountOfRowsRealTimeData = function(){
//         return (homePageComponent.allRealRowTimeData);
//     }
    
//     this.getRowsRealTimeData = function(rowNum){
//         return homePageComponent.allRealRowTimeData.get(rowNum);
//     }

//     this.checkRowIsDisplayed = function(rowN){
//         return this.getRowsRealTimeData(rowN);
//     }
// // var hour = String(hour);
//     this.clickColumnForSorting = function(text){
//         if(text=="hour"){
//             element(by.css('.ag-header-cell.ag-header-cell-sortable .ag-header-cell-text')).click();
//         }
//         else{
//         element(by.cssContainingText('.ag-header-cell.ag-header-cell-sortable .ag-header-cell-text',text)).click();
//         }
//     }

    

//     this.getAllColumnValues = function(text){
//         let arr = [];
//         return element.all(by.css("div.ag-body-container[role='presentation'] [role='row'] [col-id='"+text+"']"))
//         .map((ele) => {
//             return ele.getText();
//         }).then((text)=>{
//             return arr.push(text);
//         }).then(() => {
//             return arr;
//         });
            
    
//     }

//     this.getRightClickOptions = function(text){
//         let ele = element(by.css("div.ag-body-container[role='presentation'] [role='row'] [col-id='"+text+"']"));
//         ele.sendKeys(protractor_1.Key.chord(protractor_1.Key.SHIFT, protractor_1.Key.F10));
//         return element.all(by.css('.ag-theme-balham .ag-menu .ag-menu-list .ag-menu-option #eName'));
//     }
};
//module.exports = new homePage();