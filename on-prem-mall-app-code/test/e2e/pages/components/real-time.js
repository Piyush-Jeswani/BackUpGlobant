'use strict';

let users = require('../../data/users');

module.exports = {

  orgUser: {
    userName: 'org-user-tester',
    password: 'shopper',
  },

  specParams: {
    siteCount: 121,
    pageTitle: 'RETAIL ORGANIZATION SUMMARY',
    pageHeader: 'North Face',
    realTimePageTitleForSite: 'SITE REAL TIME REPORTING',
    realTimePageTitle: 'REAL TIME REPORTING',
    site1Name: '01 North Face - San Francisco',
    site2Name: '04 North Face - Seattle',

  },

  getPageTitle() {
    return element(by.css('div.analytics-inner-container div.title-container span')).getText();
  },

  getPageTitleForSiteNavigation() {
    return element.all(by.css('div.analytics-inner-container div.title-container span')).getText();
  },

  getPageHeader() {
    return browser.waitForAngular().then(() => {
      return element(by.css('div.analytics-inner-container div.title-container > h1')).getText();
    });
  },

  clickShowRealTimeData() {
    return element(by.css('div.toolbars div.btn-group-date-range > button.sticon-real-time.btn-default.button-top0')).click();
  },

  validateShowRealTimeDataButton() {
    return element(by.css('div.toolbars div.btn-group-date-range > button.sticon-real-time.btn-default.button-top0.active')).isDisplayed();
  },

  validateClearButtonDisabled() {
    return element(by.css('div.filter-clear > button[disabled="disabled"]')).isDisplayed();
  },

  validateClearButtonEnabled() {
    return element(by.css('div.filter-clear > button')).isDisplayed();
  },

  ClickClearButton() {
    return element(by.css('div.analytics-inner-container div.pull-right.filter-clear > button')).click();
  },

  clickSelectSitesButton() {
    return element(by.css('div.select-sites-dropdown-wrapper span.sticon-search')).click();
  },

  validateSelectAllButton() {
    browser.sleep(2000);
    return element(by.css('div.site-selector-popover.site-selector > div.site-selector-content div.site-tree-container ul.site-tree li.select-all button')).isDisplayed();
    },

  clickSelectAllButton() {
    return element(by.css('div.site-selector-popover.site-selector > div.site-selector-content div.site-tree-container ul.site-tree li.select-all button')).click();
  },

  validateSelectedSiteCount() {
    return element.all(by.css('div.site-selector-popover.site-selector> div.site-selector-content div.site-tree-container ul.site-tree li[ng-repeat].is-selected')).count();
  },

  validateUnSelectedSiteCount() {
    return element.all(by.css('div.site-selector-popover.site-selector> div.site-selector-content div.site-tree-container ul.site-tree li[ng-repeat]:not(.is-selected)')).count();
  },

  selectSiteByName(siteName) {
    return element(by.cssContainingText('div.site-selector-popover.site-selector> div.site-selector-content div.site-tree-container ul.site-tree li > a', siteName)).click();
  },

  validateSelectedSite(siteName) {
    browser.sleep(2000);
    return element(by.cssContainingText('div.analytics-inner-container h3.title', siteName)).isDisplayed();
  },

  validateBlankPageHeaderForMultipleSitesSelected() {
    return element(by.css('div.analytics-inner-container h3.title')).isPresent();
  },

  validateRealTimeReportingWidget() {
    return element(by.css('real-time-data-widget div.widget-heading div.widget-title-part span.widget-title-name')).isDisplayed();
  },

  validateRealTimeDataBySiteWidget() {
    return element(by.css('real-time-interval-data-widget div.panel-heading div.widget-title-part span.widget-title-name')).isDisplayed();
  },

  navigateToSite(site) {
    return element(by.css('#site-picker > a > span')).click()
      .then(() =>{
        return element(by.cssContainingText('#site-picker > ul > li > a', site)).click();
      })

  },

};

