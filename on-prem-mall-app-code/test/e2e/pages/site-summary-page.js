'use strict';

const orgData = require('../data/orgs.js');

module.exports = {

  // for "usage of areas" tab - these are pre-determined location types, NOT button text
  areaTypeFilterButtons: ['store', 'corridor', 'entrance', 'all'],

  siteTitle() {
    return element(by.className('title-specifier'));
  },

  getAreaName() {
    return element(by.className('title-container')).element(by.className('title')).getText();
  },

  // for "usage of areas" tab
  getAreaTypeFilter(selectorText) {
    const selector = `selector-item-location-type-${selectorText}`;
    return element(by.className('location-type-selector')).element(by.className(selector));
  },

  // for "usage of areas" tab
  clickAreaTypeFilter(selectorText) {
    browser.executeScript('window.scrollTo(0,0);').then(function () {
      this.getAreaTypeFilter(selectorText).click();
    }.bind(this));
  },

  navToTestArea() {
    navToSelectArea(orgData.SSOrg.testArea);
  },

  navToZone() {
    navToZone(orgData.MSOrgSite.testZone);
  },

  // used in translation checks
  getZonePickerTitleText() {
    // multiple instances of class "toolbar-label" - this should reference the first instance
    return element(by.className('analytics-header')).element(by.className('toolbar')).all(by.className('toolbar-label')).first()
      .getText();
  },

  // used in translation checks
  getZonePickerSearchText() {
    const picker = element(by.className('analytics-header')).element(by.css('button.zone-selector'));
    picker.click();
    const searchText = element(by.className('analytics-header')).element(by.css('div.zone-selector-header')).element(by.css('input'))
      .getAttribute('placeholder');
    picker.click();
    return searchText;
  },

  // used in translation checks
  getAreaPickerSearchText() {
    const picker = element(by.className('analytics-header')).element(by.css('button.area-selector'));
    picker.click();
    const searchText = element(by.className('analytics-header')).element(by.css('div.location-selector-header')).element(by.css('input'))
      .getAttribute('placeholder');
    picker.click();
    return searchText;
  },

  // used in translation checks
  getHoursSwitchTitleText() {
    return element(by.className('analytics-header')).element(by.className('date-range-detail-selector')).element(by.className('operating-hours-title'))
      .getText();
  },

  getCompStoresSelectorText() {
    return element(by.className('retail-organization-comp-stores')).getText();
  }
};

function navToSelectArea(areaName) {
  const picker = element(by.className('toolbar')).element(by.className('title'));
  picker.click();
  browser.waitForAngular();
  const loc = element(by.className('toolbar')).element(by.className('location-navigation-popover')).element(by.partialLinkText(areaName));
  loc.click();
  browser.waitForAngular();
}

function navToZone(zoneName) {
  const picker = element(by.className('analytics-header')).element(by.css('button.zone-selector'));
  picker.click();
  browser.waitForAngular();
  const zone = element(by.className('analytics-header')).element(by.css('div.zone-tree-container')).element(by.partialLinkText(zoneName));
  zone.click();
  browser.waitForAngular();
}
