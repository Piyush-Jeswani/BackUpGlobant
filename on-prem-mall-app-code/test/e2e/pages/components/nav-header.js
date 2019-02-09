'use strict';

const orgData = require('../../data/orgs.js');

module.exports = {

  logout() {
    const collapsedNav = element(by.css('button.navbar-toggle.collapsed'));
    return collapsedNav.isDisplayed().then(isMenuButtonPresent => {
      if (isMenuButtonPresent) {
        collapsedNav.click();
        const dropDown = element(by.css('.nav-login-link'));
        const logoutButton = element(by.className('nav-logout'));

        dropDown.click();
        logoutButton.click();
      } else {
        const dropDown = element(by.css('.nav-login-link'));
        const logoutButton = element(by.className('nav-logout'));

        dropDown.click();
        logoutButton.click();
      }
    });
  },

  pickMSOrg() {
    navToOrgOrSite('organisation-picker', orgData.MSOrg.name);
  },

  navToMSOrgSite() {
    navToOrgOrSite('site-picker', orgData.MSOrgSite.name);
  },

  pickSSOrg() {
    navToOrgOrSite('organisation-picker', orgData.SSOrg.name);
  },

  pickRetailOrg() {
    navToOrgOrSite('organisation-picker', orgData.MSRetailOrg.name);
  },

  pickRetailCachedOrg() {
    navToOrgOrSite('organisation-picker', orgData.RetailCachedOrg.name);
  },

  navToRetailOrgSite() {
    navToOrgOrSite('site-picker', orgData.MSRetailSite.testSiteName);
  },

  getOrgName() {
    const collapsedNav = element(by.css('button.navbar-toggle.collapsed'));
    return collapsedNav.isDisplayed().then(isMenuButtonPresent => {
      if (isMenuButtonPresent) {
        collapsedNav.click();
        const orgName = element(by.id('organisation-picker')).element(by.className('dropdown-toggle')).getText();
        collapsedNav.click();
        return orgName;
      }
      return element(by.id('organisation-picker')).element(by.className('dropdown-toggle')).getText();
    });
  },

  getSiteName() {
    const collapsedNav = element(by.css('button.navbar-toggle.collapsed'));
    return collapsedNav.isDisplayed().then(isMenuButtonPresent => {
      if (isMenuButtonPresent) {
        collapsedNav.click();
        const siteName = element(by.id('site-picker')).element(by.className('dropdown-toggle')).getText();
        collapsedNav.click();
        return siteName;
      }
      return element(by.id('site-picker')).element(by.className('dropdown-toggle')).getText();
    });
  },

  getSingleOrgName() {
    const collapsedNav = element(by.css('button.navbar-toggle.collapsed'));
    return collapsedNav.isDisplayed().then(isMenuButtonPresent => {
      if (isMenuButtonPresent) {
        collapsedNav.click();
        const orgName = element(by.id('single-org-link')).getText();
        collapsedNav.click();
        return orgName;
      }
      return element(by.id('single-org-link')).getText();
    });
  },

  getSingleSiteName() {
    const collapsedNav = element(by.css('button.navbar-toggle.collapsed'));
    return collapsedNav.isDisplayed().then(isMenuButtonPresent => {
      if (isMenuButtonPresent) {
        collapsedNav.click();
        const siteName = element(by.id('single-site-link')).getText();
        collapsedNav.click();
        return siteName;
      }
      return element(by.id('single-site-link')).getText();
    });
  },

  navToExportCSV() {
    openExportDropdown();
    navToExportFeature('navbar-export-csv');
  },

  navToExportPDFView() {
    openExportDropdown();
    navToExportFeature('navbar-export-current-view');
  },

  navToExportSelected() {
    openExportDropdown();
    navToExportFeature('navbar-export-selected');
  },

  isExportSelectedEnabled() {
    return openExportDropdown().then(() => {
      return element(by.id('navbar')).element(by.className('navbar-export-selected')).getAttribute('disabled');
    }).then(disabledFlag => {
      return openExportDropdown().then(() => {
        return disabledFlag !== 'true';
      });
    });
  },

  getHeaderBar() {
    return element(by.id('navbar'));
  }
};

function navToOrgOrSite(pickerId, linkText) {
  const collapsedNav = element(by.css('button.navbar-toggle.collapsed'));
  return collapsedNav.isDisplayed().then(isMenuButtonPresent => {
    if (isMenuButtonPresent) {
      collapsedNav.click();
      const picker = element(by.id(pickerId));
      picker.click();
      const loc = picker.element(by.className('dropdown-menu')).element(by.linkText(linkText));
      loc.click();
      browser.waitForAngular();
      const dropdown = element(by.id('navbar'));
      return dropdown.isDisplayed().then(isDropdownPresent => { // necessary because dropdown sometimes retracts on its own (when nav-ing from export page), so click is not always needed
        if (isDropdownPresent) {
          element(by.css('button.navbar-toggle.collapsed')).click();
        }
      });
    }
    const picker = element(by.id(pickerId));
    picker.click();
    browser.waitForAngular();
    const loc = picker.element(by.className('dropdown-menu')).element(by.linkText(linkText));
    loc.click();
  });
}

function openExportDropdown() {
  const collapsedNav = element(by.css('button.navbar-toggle.collapsed'));
  return collapsedNav.isDisplayed().then(isMenuButtonPresent => {
    if (isMenuButtonPresent) {
      return collapsedNav.click().then(() => {
        browser.waitForAngular();
        const picker = element(by.id('navbar')).element(by.className('dropdown-toggle-export'));
        picker.click();
      });
    }
    const picker = element(by.id('navbar')).element(by.className('dropdown-toggle-export'));
    picker.click();
  });
}

function navToExportFeature(exportFeatureClassName) {
  element(by.id('navbar')).element(by.className(exportFeatureClassName)).click();
}

