'use strict';

let users = require('../../data/users');
const rp = require('request-promise');

module.exports = {

  orgUser: {
    userName: 'org-user-tester',
    password: 'shopper',
  },

  specParams: {
    siteCount: 0,
    landingPageTitle: 'RETAIL ORGANIZATION SUMMARY',
    firstOrgName: '12 North Face - New York',
    kpiUINameEditted: 'ATS Editted',
    kpiUIName: 'ATS',
    siteLandingPageTitle: 'TRAFFIC',
    userAccessFlagOneSite: '1 | 1 | 1',
    userAccessFlagAllSite: '1 | 1 | ',
    tag1Id: '',
  },

  setParamSiteCount(val) {
    this.specParams.siteCount = val;
  },

  getParamSiteCount() {
    return this.specParams.siteCount;
  },

  navigateTo(menuLink) {
    element(by.css('#navbar > ul.nav.navbar-nav.navbar-nav--areas> li > a > span.nav-item-icon')).click().then(() => {
      return browser.waitForAngular();
    }).then(() => {
      element(by.cssContainingText('#navbar > ul.nav.navbar-nav.navbar-nav > li > ul > li > a', menuLink)).click().then(() => {
        return browser.waitForAngular();
      });
    });
  },

  clickUserManagement() {
     return element(by.css('section.analytics-menu-items article.analytics-menu-item > a[href*="usermanagement"] > i[title*="User management"]')).click().then(() => {
      return browser.sleep(4000);
      }).then(()=> {
        return element(by.css('div.analytics-inner-container div.content-container > div.table-responsive.ng-isolate-scope')).isDisplayed()
     })
  },

  clickOrganizationManagement() {
    return element(by.css('section.analytics-menu-items article.analytics-menu-item > a[href*="organizations"] > i[title*="Organization management"]')).click()
      .then(() => {
      return browser.waitForAngular();
      })
      .then(() => {
      return element(by.css('div.admin-organization-management div.admin-organizations > div.table-responsive')).isDisplayed();
      });
  },

  addNewUser() {
    return element(by.css('div.action-bar.action-bar-header > div.add-user > button > span')).click()
      .then(() => {
        return browser.waitForAngular();
      });
  },

  enterNewUserDetails(user) {
    let fullname = element(by.css('input[name="fullname"]'));
    browser.wait(protractor.ExpectedConditions.elementToBeClickable(element(by.css('input[name="fullname"]'))), 5000).then(() => {
      element(by.css('input[name="fullname"]')).sendKeys(user.fullname);
      element(by.css('input[name="username"]')).sendKeys(user.userName);
      element(by.css('input[name="email"]')).sendKeys(user.email);
      element(by.css('input[name="title"]')).sendKeys(user.title);
      element(by.css('input[name="password"]')).sendKeys(user.password);
      element(by.css('input[name="passwordConfirmation"]')).sendKeys(user.password);
    });
  },

  validateSuccessMessage() {
    return browser.wait(protractor.ExpectedConditions.elementToBeClickable(element(by.cssContainingText('div.analytics-inner-container div.add-org-success.alert.alert-success', 'Save was successful'))), 5000).then(() => {
      return browser.waitForAngular();
    });
  },

  addNewUserPageHeader() {
    return element(by.cssContainingText('div.analytics-inner-container div.editor-user > h1.ng-binding', 'Add New User')).isDisplayed();
  },

  enterUserNameInSearchBox(user) {
    return element(by.css('div.search-bar input[type="text"][placeholder="Search"]')).clear()
      .then(() => {
      return element(by.css('div.search-bar input[type="text"][placeholder="Search"]')).sendKeys(user.userName)
        .then(() => {
        return browser.waitForAngular();
      });
    });
  },

  validateUserNameFromTable(user) {
    return element(by.cssContainingText('div.content-container > div.table-responsive.ng-isolate-scope > table > tbody > tr > td:nth-child(2)', user.userName)).isDisplayed().then(() => {
      return browser.waitForAngular();
    });
  },

  validateFullNameFromTable(user) {
    return element(by.cssContainingText('div.content-container > div.table-responsive.ng-isolate-scope > table > tbody > tr > td > label', user.fullname)).isDisplayed().then(() => {
      return browser.waitForAngular();
    });
  },

  deleteNewlyCreatedUser() {
    return element(by.css('div.content-container > div.table-responsive.ng-isolate-scope > table > tbody > tr > td span.sticon.sticon-delete-small')).click().then(() => {
      return browser.waitForAngular();
    }).then(() => {
      return element(by.cssContainingText('confirmation-modal div.modal-dialog div.modal-footer > button', 'Delete')).click().then(() => {
        return browser.waitForAngular();
      });
    });
  },

  enterOrgNameInSearchBox(orgName) {
    return element(by.css('div input[type="text"][placeholder="Search organizations..."]')).sendKeys(orgName).then(() => {
      return browser.waitForAngular().then(() => {
        return element(by.css('div.admin-organization-management div.admin-organizations > div.table-responsive> table > tbody > tr:nth-child(2) > td:nth-child(1)')).getText();
      });
    });
  },

  editOrganization() {
    return element(by.css('div.admin-organization-management div.admin-organizations > div.table-responsive > table > tbody > tr:nth-child(2) > td:nth-child(3)> span.icon.icon-edit')).click().then(() => {
      browser.sleep(4000).then(() => {
        return browser.waitForAngular();
      });
    });
  },

  navigateToUsersTab() {
    return element(by.css('div.analytics-inner-container div[ui-view="adminTabs"] section.admin-tabs > div> ul.nav-tabs > li.super-admin-tab > a[data-target="#su-users"]')).click().then(() => {
      browser.sleep(3000).then(() => {
        return browser.waitForAngular();
      });
    });
  },

  navigateToKPILibraryTab() {
    return element(by.css('div[ui-view="adminTabs"] section.admin-tabs ul.nav-tabs > li.super-admin-tab > a[data-target="#su-kpi"]')).click().then(() => {
      return browser.waitForAngular();
    });
  },

  editKPIByIndex(index) {
    return element(by.css(`#su-kpi div.table-responsive > table > tbody > tr:nth-child(${index}) > td > a > span.sticon-edit-small`)).click().then(() => {
      return browser.waitForAngular();
    });
  },

  getKPIUIName() {
    return element(by.css('#su-kpi div.table-responsive > table > tbody > tr:nth-child(1) > td:nth-child(2)')).getText().then(() => {
      return browser.waitForAngular();
    });
  },

  clickSaveKPIButton() {
    return element(by.css('div.analytics-inner-container form button.btn-primary')).click().then(() => {
      return browser.waitForAngular();
    });
  },

  setKPIUIName(text) {
    return element(by.css('div.analytics-inner-container form > input[name="ui-name"]')).clear()
      .then(() => {
      return element(by.css('div.analytics-inner-container form > input[name="ui-name"]')).sendKeys(text);
    }).then(() => {
      return browser.waitForAngular();
    });
  },

  clearKPIUIName() {
    return element(by.css('div.analytics-inner-container form > input[name="ui-name"]')).clear();
  },

  searchUserInUserTab(user) {
    return element(by.css('input[placeholder="Search users..."][name="username"]')).sendKeys(user.userName);
  },

  clickEditUser() {
    return element(by.css('div.table-responsive > table > tbody > tr > td.users-actions > span.icon.icon-edit > span')).click().then(() => {
      return browser.waitForAngular();
    });
  },

  toggleOffApplyFullAccess() {
    return element(by.css('div.container-fluid div.analytics-inner-container ui-switch[chosen="vm.accessTypeFull"] > span.ui-switch.chosen')).click().then(() => {
      return browser.sleep(2000);
    });
  },

  selectCustomTags(index) {
    return element(by.css(`#currentTags > option:nth-child(${index})`)).click().then(() => {
      return browser.waitForAngular();
    }).then(() => {
      return element(by.css('i.sticon.sticon-arrow-right')).click().then(() => {
        return browser.waitForAngular();
      });
    });
  },

  selectCustomTagByName(tagName) {
    return browser.executeScript('arguments[0].scrollIntoView(true);', element(by.css('admin-user-tag-access')))
      .then(() => {
        return element(by.cssContainingText('admin-user-tag-access div.center-block.multiSelect #currentTags > option', tagName)).click()
      })
      .then(() => {
        return browser.waitForAngular();
      })
      .then(() => {
        return element(by.css('i.sticon.sticon-arrow-right')).click()
      })
      .then(() => {
        return browser.waitForAngular();
      });
  },

  selectAllSites() {
    return element.all(by.css('div.analytics-inner-container admin-user-access table > tbody > tr > td.site-actions > ui-switch > span'))
      .map((item, index) => {
        if (index !== 0) {
          item.click().then(() => {
            browser.sleep(60);
          });
        }
      });
  },

  getSiteCountFromTable() {
    return element.all(by.css('div.analytics-inner-container admin-user-access table > tbody > tr > td.site-actions > ui-switch > span')).count();
  },

  selectSiteByIndex(index) {
    return element.all(by.css('div.analytics-inner-container admin-user-access table > tbody > tr > td.site-actions > ui-switch > span')).then(item => {
      item[index].click().then(() => {
        return browser.waitForAngular();
      });
    });
  },

  removeCustomTags(index) {
    return element(by.css(`#multiSelectAvailable > option:nth-child(${index})`)).click().then(() => {
      return browser.waitForAngular();
    }).then(() => {
      return element(by.css('i.sticon.sticon-arrow-left')).click().then(() => {
        return browser.waitForAngular();
      });
    });
  },

  clickAddNewUser() {
    return element(by.cssContainingText('div.admin-organization-edit-users div.add-new-action span.label-text', 'Add New User')).click().then(() => {
      return browser.waitForAngular();
    });
  },

  addUserDetails() {
    return element(by.css('input[name="username"]')).sendKeys(users.orgSuperUser.userName)
      .then(() => {
        return element(by.css('input[name="password"]')).click()
      })
      .then(() => {
        return element(by.css('div > div.access-option > ui-switch[chosen="vm.orgAdmin"] > span.ui-switch')).click()
      })
      .then(() => {
        return browser.waitForAngular();
      });
  },


  navigateToTags() {
    return element(by.css('div.analytics-inner-container div[ui-view="adminTabs"] section.admin-tabs > div> ul.nav-tabs > li.super-admin-tab > a[data-target="#su-tags"]')).click().then(() => {
      return browser.waitForAngular();
    });
  },

  clickAddNew() {
    let addNewButton = element(by.css('div.tab-pane.fade.active.in custom-tags > div.action-bar.sites-action-bar > div > span > span')).then(() => {
      return browser.waitForAngular();
    });
    browser.wait(protractor.ExpectedConditions.elementToBeClickable(addNewButton), 5000).then(() => {
      addNewButton.click();
    })
    .then(() => {
      return browser.waitForAngular();
    });
  },

  setTagValue() {
    return element(by.css('input[name="values"]')).click().then(() => {
      let valu = element(by.css('input[name="values"]'));
      browser.executeScript("arguments[0].value='test1';", valu).then(() => {
        browser.executeScript("arguments[0].setAttribute('class','form-control custom-tags-input ng-valid-pattern ng-not-empty ng-dirty ng-valid-parse ng-valid ng-valid-required ng-animate ng-touched-add ng-untouched-remove ng-touched ng-touched-add-active ng-untouched-remove-active');", valu);
      });
    });
  },

  clickSaveUser() {
    return element(by.css('div.analytics-inner-container div.actions.actionButtons button.btn.btn-primary')).click().then(() => {
      return browser.waitForAngular();
    });
  },

  getLandingPageHeader() {
    return element(by.css('div.analytics-inner-container div.title-container > h1')).getText();
  },

  enterNewPassword() {
    return element(by.css('input[name="password"]')).sendKeys(users.orgSuperUser.newPassword)
      .then(() => {
        return element(by.css('input[name="passwordConfirmation"]')).sendKeys(users.orgSuperUser.newPassword)
      })
      .then(() => {
        element(by.cssContainingText('div.actionButtons > button.btn-primary', 'Save User')).click();
      })
      .then(() => {
        return browser.waitForAngular();
      });
  },

  getLandingPageTitle() {
    return browser.waitForAngular().then(() => {
      return element(by.css('div.analytics-inner-container div.title-container span.ng-binding')).getText();
    });
  },

  getOrgUserFullname() {
    return browser.waitForAngular().then(() => {
      return element(by.css('#su-users div.table-responsive.ng-isolate-scope > table > tbody > tr > td.user-fullname.table-selector > label')).getText();
    });
  },

  getOrgUserName() {
    return browser.waitForAngular().then(() => {
      return element(by.css('#su-users div.table-responsive.ng-isolate-scope > table > tbody > tr > td:nth-child(2)')).getText();
    });
  },

  getOrgUserAccess() {
    return browser.waitForAngular().then(() => {
      return element(by.css('#su-users div.table-responsive.ng-isolate-scope > table > tbody > tr > td:nth-child(3)')).getText();
    });
  },

  getOrgUserRole() {
    return browser.waitForAngular().then(() => {
      return element(by.css('#su-users div.table-responsive.ng-isolate-scope > table > tbody > tr > td:nth-child(4)')).getText();
    });
  },

  clickCancel() {
    return element(by.css('div.container-fluid div.analytics-inner-container div.actions.actionButtons button.btn.btn-default')).click().then(() => {
      return browser.waitForAngular();
    });
  },

  deleteOrgUSer() {
    return element(by.css('#su-users div.table-responsive.ng-isolate-scope > table > tbody > tr > td:nth-child(6) > span.icon-remove')).click()
      .then(() => {
      return browser.waitForAngular();
    })
      .then(() => {
        return element(by.css('confirmation-modal div.modal-dialog div.modal-footer > button')).click();
      })
      .then(() => {
        return browser.waitForAngular();
        });
  },

  searchOrgName(orgname) {
    return element(by.css('div input[type="text"][placeholder="Search organizations..."]')).sendKeys(orgname).then(() => {
      return browser.waitForAngular().then(() => {
        return element(by.css('div.admin-organization-management div.admin-organizations > div.table-responsive> table > tbody > tr:nth-child(2) > td:nth-child(1)')).getText();
      });
    });
  },

  getSiteCount() {
    return element(by.css('#site-picker > a > span.ng-binding')).click().then(() => {
        return element.all(by.css('#site-picker > ul > li> a')).count();
    });
  },

  validateAllSites(){
    return element.all(by.css('#site-picker > ul > li> a')).getText();
  },

  clickFilters() {
    return element(by.css('div.analytics-inner-container organization-filter-widget div.filter-header div.filter-title.filter-main-title span')).click();
  },

  validatePowerHoursKPI(kpiName) {
    return element(by.css('power-hours-widget metric-selector multi-select-list button > span:nth-child(1)')).click()
      .then(() => {
        return element(by.cssContainingText('power-hours-widget metric-selector multi-select-list ul li',kpiName)).isDisplayed();
      })
  },

  validateDailyAveragesKPI() {
    return element(by.css('traffic-per-weekday-widget div.panel-heading.widget-heading.clearfix span.btn-group.select-chart-metric-dropdown > button> span:nth-child(1)')).click()
      .then(() => {
        browser.sleep(50000);
        return element.all(by.css('traffic-per-weekday-widget div.panel-heading.widget-heading.clearfix span.btn-group.select-chart-metric-dropdown > ul> li > a'))
        //.all(by.repeater('metric in vm.availableMetrics'))
          .getText();
      })
  },

  validateOrganisationSummaryKPI(kpiName) {
    return element(by.css('retail-organization-table-widget h2 div.no-padding.widget-actions-part.clearfix multi-select-list button')).click()
      .then(() => {
        return element(by.cssContainingText('retail-organization-table-widget h2 div.no-padding.widget-actions-part.clearfix multi-select-list ul > li > a span',kpiName)).isDisplayed();
      })
  },

  validateTagInFilters() {
    return element.all(by.css('div.container-fluid div.analytics-inner-container organization-filter-widget div.filter-group-wrapper > div.row.filter-group-content div.filter-title-wrapper > span'))
      .map(text => {
        return text.getText();
    })
  },

  getFilterSiteCount() {
    return element(by.css('div.analytics-inner-container organization-filter-widget div.filter-header > div.filter-title.filter-showing.uppercase > span.filter-num-showing.ng-binding')).getText();
  },

  clickTag1DropDown() {
    return element(by.cssContainingText('div.container-fluid div.analytics-inner-container organization-filter-widget div.filter-group-wrapper > div.row.filter-group-content div.filter-title-wrapper > span','Donot delete 1')).click();
  },

  clickTag1DropDownValue() {
    return element(by.css('div.analytics-inner-container organization-filter-widget div.filter-group-wrapper div.tag-wrapper.open > ul.filter-tag > li > span')).click();
  },

  clickApplyFilter() {
    return element(by.css('div.analytics-inner-container organization-filter-widget div.filter-group-wrapper div.filter-footer-wrapper button.btn-primary.action-btn')).click();
  },

  clickClearFilter() {
    return element(by.css('div.analytics-inner-container organization-filter-widget div.filter-group-wrapper div.filter-footer-wrapper button.btn-default.action-btn')).click();
  },

  navigateToSite(siteName) {
    return element(by.css('#site-picker > a > span.ng-binding')).click().then(() => {
      return element(by.cssContainingText('#site-picker > ul > li> a',siteName)).click();
    })
  },

  clickAddToExportByWidgetIndex(i) {
    return element.all(by.css('div.analytics-inner-container div.pull-right.export-widget.inline-block.widget-heading__export-icon > a > span')).map((element,index) => {
      if(i == index){
        return element.click();
      }
    })
  },

  clickExportPDFButton() {
    return element(by.cssContainingText('ul.nav.navbar-nav.navbar-right.nav-shoppertrak.navbar-nav-shoppertrak > li.dropdown > a > span','Export')).click();
  },

  clickExportSelected() {
    return element(by.cssContainingText('ul.nav.navbar-nav.navbar-right.nav-shoppertrak.navbar-nav-shoppertrak > li.dropdown.open > ul > li:nth-child(3) > a > span','Export selected')).click();
  },

  validateWidgetCountOnExportSelectedButton() {
    return element(by.css('ul.nav.navbar-nav.navbar-right.nav-shoppertrak.navbar-nav-shoppertrak > li.dropdown.open > ul > li:nth-child(3) > a > span:nth-child(2)')).getText();
  },

  clickClearExport() {
    return element(by.css('ul.nav.navbar-nav.navbar-right.nav-shoppertrak.navbar-nav-shoppertrak > li.dropdown.open > ul > li > a.navbar-export-clear')).click();
  },

  clickBackButtonOnExportPDFPage() {
    return element(by.css('div.container-fluid div.modal-footer button.pull-right.btn.btn-link.pdf-export-clear-export.back-button')).click();
  },

  clickClearExportButtonOnExportPDFPage() {
    return element(by.css('div.container-fluid div.modal-footer button.btn.btn-link.pdf-export-clear-export[ng-switch-when="true"]')).click();
  },

  validateExportWidgetList() {
    return element.all(by.css('div.container-fluid ul.pdf-export-metric-list.list-group.ng-pristine.ng-untouched.ng-valid.ui-sortable.ng-not-empty > li'))
      .map(parent => {
        let widgetArr = [];
        let str="";
        return parent.all(by.css('span'))
          .map(child => {
            return child.getText()
          }).then(concatText => {
            return widgetArr.push(concatText.join(''))
          }).then(() => {
            return widgetArr;
          })
      })
  },

};
