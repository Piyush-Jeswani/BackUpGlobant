

const commonOperation =require('../operations/CommonOperation.js');
module.exports = {

//var homePageComponent = function() {
  
  adminDropDown : element(by.css(".dropdown[ng-if='adminToolAccess']")),
  organizationAlertInfo : element(by.css(".alert.alert-info")),
  shopperTrak_logo_link : element(by.css(".navbar-brand")),
 analytics_Label: element(by.css(".nav-app-label")),
 support_link:element(by.linkText("Support")),
 export_link:element(by.css(".dropdown-toggle-export")),
   organizationPicker:  element(by.css("#organisation-picker span[ng-if='currentItem']")),
  navigateToAdmin :element(by.css("[ng-click='navigateToAdmin()']")),
  siteDropDown:element.all(by.css("li[ng-click='onItemSelect(item)']")),
  siteLink:element(by.id("single-site-link")),
  addOrganizationBtn : element(by.css('.icon.icon-import')),
  navigateToAnalytics : element(by.css("[ng-click='navigateToAnalytics()']")),
  organizationDropDown : element(by.css("#organisation-picker")),
  sitePicker : element(by.css("#site-picker")),
  siteName_Header:element(by.css(".clearfix.analytics-header h1")),
  analytics_dashboard_icon:element(by.css("[class='analytics-menu-item__icon sticon sticon-dashboard']")),
  edit_dashboard_btn:element(by.css(".edit-custom-dashboard-button-top-right")),
  dashboard_title_span:element(by.css(".dashboard__title__buttons .pref-dash")),
  dashboard_title_btn:element(by.css(".dashboard__title__buttons span.ui-switch")),
  save_changes_btn:element(by.css(".btn.btn-primary")),
  toolbar_menu:element(by.css(".toolbar-section")),
  loading_icon:element(by.css("[ng-if='vm.isLoading']")),
  siteName : "[ng-if='itemUiSrefPattern']",
  organizationName:element.all(by.css("[ng-if='itemUiSrefPattern']")),
  realTimeData : element(by.css(".sticon-real-time")),
  realTimeDataDropDown : element(by.css(".real-time-actions .dropdown-toggle")),
  dropDown : ".dropdown-menu.show span",
  markers : element.all(by.css('.highcharts-markers')),
  timeIcon : element(by.css('.sticon-time')),
  optionTimeInterval : ".real-time-options .dropdown-menu.right span",
  showTableButton : element(by.css('.data-section.full-height .btn.btn-default span')),
  hideTableBtn : element(by.buttonText('Hide table')),
  tableHeaderRealTime :  element.all(by.css(' [ref="eText"]')),
  realTimeDropDown : element.all(by.xpath("//li[contains(@ng-repeat,'vm.items')]")),
  noOfRowsInRealData : element.all(by.css("div.ag-body-container[role='presentation'] [role='row']")),
  trafficDropDown : $("button[class='btn btn-default btn-xs dropdown-toggle']"),
  summaryAverage:$(".value.ng-scope.no-details span"),
  selectedPeriodChart : element(by.css('.line-high-chart-widget-summary-container')),
  isLoading : element(by.css("[ng-if='isLoading']")),
  optionOnTraffic : element(by.css('.dropdown.kpi-dropdown.btn-group.open .dropdown-menu li a')),
  allOptionsOnTraffic : element.all(by.css('.dropdown.kpi-dropdown.btn-group.open .dropdown-menu li a')),
  summaryContainer : element.all(by.css('.line-high-chart-widget-summary-container div.value.no-details span')),
  allValuesFromSummmaryContainer : element.all(by.css('.line-high-chart-widget-summary-container div.value.no-details span')),
  allRealRowTimeData : element.all(by.css(".ag-body-container [role='row']")),
  realtime_dropdown:element(by.css(".multi-select-list")),
  realtime_dropdown_options:element(by.css(".multi-select-list li")),
  
  logout_components:{
  logout_dropdown:element(by.css(".nav-login-link")),
  logout_link:element(by.css(".nav-logout"))
},

//===============================================================================================

verifyHomePageComponents:function(){
  expect(this.organizationAlertInfo.getText()).toBe("This organization has no properties.");
  expect(this.shopperTrak_logo_link.getText()).toBe("ShopperTrak");
  expect(this.analytics_Label.getText()).toBe("Analytics");
  expect(this.support_link.isDisplayed()).toBe(true);
  expect(this.export_link.isDisplayed()).toBe(true);
},

//===============================================================================================

clickAdminDropDown: function(){        
  this.adminDropDown.click();
  commonOperation.customWait_visibilityOf(this.navigateToAnalytics,10000);
  //browser.wait(protractor.ExpectedConditions.visibilityOf(homePageComponent.navigateToAnalytics, env.default_TimeOut));
},

//===============================================================================================

clickOrganisationDropDown:function(){
  this.organizationDropDown.click();
},

//===============================================================================================

selectOrganizationByName:function(org_name){
  let rows = element.all(by.css('#organisation-picker ul li'));
    rows.filter(function(row, index){
        return row.getText().then(function(text) {
            return text.indexOf(org_name) != -1;
          });
     }).first().click();
  commonOperation.customWait_visibilityOf(this.sitePicker,10000);
},

//===============================================================================================

clickSiteDropdown:function(){
  this.sitePicker.click();
},

//===============================================================================================

selectSiteByIndex:function(site_index){
  this.siteDropDown.map(function(ele, index){
   if(index==site_index){
        ele.click();
      }
      })

      commonOperation.customWait_visibilityOf(this.siteLink,10000);
//  browser.wait(protractor.ExpectedConditions.visibilityOf(homePageComponent.siteLink,env.default_TimeOut ));
},

//===============================================================================================

selectSiteByName:function(site_text){
  this.siteDropDown.map(function(ele, index){
      ele.getText().then(function(text){
          if(text==site_text){
              ele.click();
          }
      })
  
      })
      commonOperation.customWait_visibilityOf(this.toolbar_menu,10000);
 //     browser.wait(protractor.ExpectedConditions.visibilityOf(homePageComponent.toolbar_menu,env.default_TimeOut ));
},
//===============================================================================================

clickAnalyticsDashboard_Icon:function(dashboard_name){
  dashboard = "i[title='"+dashboard_name+"']"
  element(by.css(dashboard)).click();
},

//===============================================================================================
logout:function(){
  this.logout_components.logout_dropdown.click();
  this.logout_components.logout_link.click();
},
//===============================================================================================


clickAnalyticsOptionInDropDown : function(){
  this.navigateToAnalytics.click();
},
//===============================================================================================
clickAdminOptionInDropDown : function(){
  this.navigateToAdmin.click();
 
},
//===============================================================================================
getSiteName_Heading:function()
{
  return this.siteName_Header.getText();
},
//===============================================================================================
click_edit_dashboard_btn:function(){
  this.edit_dashboard_btn.click();
  commonOperation.customWait_visibilityOf(this.dashboard_title_span,10000);
  //browser.wait(protractor.ExpectedConditions.visibilityOf(homePageComponent.dashboard_title_span, env.default_TimeOut));
},   
//===============================================================================================
getdashboardTitle:function(){
  return this.dashboard_title_span.getText();
} ,
//===============================================================================================
click_dashboard_title_btn:function(){
  expect(this.dashboard_title_btn.isDisplayed(),true);
  this.dashboard_title_btn.click();
},
//===============================================================================================
click_saveChanges_btn:function(){
  this.save_changes_btn.click();
},
//===============================================================================================

clickRealTimeData: function(){
  this.realTimeData.click();
  // commonOperation.customWait_visibilityOf(this.isLoading,15000);
  browser.sleep(4000);
  //browser.wait(protractor.ExpectedConditions.visibilityOf(element(by.css("[ng-if='isLoading']")), 10000));

},
//===============================================================================================

  clickTimeIcon : function(){
this.timeIcon.click();
}  ,
//===============================================================================================
clickRealTimeDataDropDown:function(){
  this.realtime_dropdown.click();
},
//===============================================================================================
returnRealTimeDataDropDownOptions:function(option_name){
  let listOption = "li[title='"+option_name+"']";
  return $(listOption);
},
verifyIntervalElement:function(interval_text){
  let rows = element.all(by.css("[ng-repeat='option in vm.options'] span"));
   return rows.filter(function(row, index){
        return row.getText().then(function(text) {
            return text.indexOf(interval_text) != -1;
          });
     }).first();
     
},
getCountOfTotalMarkers:function(){
          return this.markers.length;
      },

      clickTrafficDropDown:function(){
        this.trafficDropDown.click();
        
      },
      selectValueinTrafficDropDown:function(value_name){
        commonOperation.customWait_visibilityOf(element(by.cssContainingText(".kpi-dropdown li",value_name)),10000);
       element(by.cssContainingText(".kpi-dropdown li",value_name)).click();
        
      },
      getSummaryAverage:function(value_name){
        this.selectValueinTrafficDropDown(value_name);
        browser.wait(protractor.ExpectedConditions.visibilityOf(this.summaryAverage,10000));
        return this.summaryAverage.getText();
      },
};

