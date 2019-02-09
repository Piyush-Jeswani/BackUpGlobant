const moment = require('moment');
const orgData = require('../../data/orgs.js');
const userData = require('../../data/users.js');
const login = require('../../pages/login.js');
const nav = require('../../pages/components/nav-header.js');
const tabNav = require('../../pages/components/tab-nav.js');
const dateSelector = require('../../pages/components/time-period-picker.js');
const exportCSVPage = require('../../pages/components/export-csv.js');
const fs = require('fs');

describe('Export CSV function:', () => {
  let userId;
  let token;

  beforeAll(done => {
    if (browser.params.indirectNav) {
      login.go();
      login.loginAsSuperUser();
      nav.pickMSOrg();
      nav.navToMSOrgSite();
      tabNav.navToTrafficTab();
      done();
    } else {
      login.getUserWithToken(tokenAndId => {
        ({ token, userId } = tokenAndId);
        browser.get(`#/${orgData.MSOrg.id}/${orgData.MSOrgSite.id}/traffic?dateRangeStart=` +
          `${dateSelector.getURLDate('week', true)}&dateRangeEnd=${dateSelector.getURLDate('week', false)}&compareRange1Start=` +
          `${dateSelector.getURLDate('week', true, 1)}&compareRange1End=${dateSelector.getURLDate('week', false, 1)}&compareRange2Start=` +
          `${dateSelector.getURLDate('week', true, 2)}&compareRange2End=${dateSelector.getURLDate('week', false, 2)}&token=${token}`);
        done();
      }, userData.superUser);
    }
  });

  describe('Multi-site org', () => {
    it('date range on metric tab should match range on export page', () => {
      dateSelector.getReportingPeriod(userData.superUser.dateFormat).then(metricTabDate => {
        nav.navToExportCSV();
        const exportTabDate = dateSelector.getExportCSVReportingPeriod(userData.superUser.dateFormat);

        expect(exportTabDate).toEqual(metricTabDate);
      });
    });

    it('should show correct site name', () => {
      const siteName = exportCSVPage.getExportSiteName();
      expect(siteName).toEqual(orgData.MSOrgSite.name);
    });

    it('should show the correct metrics', () => {
      const metrics = exportCSVPage.getMetrics();

      expect(metrics.getText()).toEqual(orgData.MSOrgSite.metrics.csv);
    });

    it('each metric should be clickable', () => {
      const metrics = exportCSVPage.getMetrics();

      metrics.each(elm => {
        expect(elm.getAttribute('class')).not.toMatch('selected');
        elm.click();
        browser.waitForAngular();
        expect(elm.getAttribute('class')).toMatch('selected');
        elm.click();
        browser.waitForAngular();
        expect(elm.getAttribute('class')).not.toMatch('selected');
      });
    });

    it('the export buttons should be enabled when a metric and an area are selected, and disabled otherwise', () => {
      const exportButton = exportCSVPage.getExportButton();
      const scheduleReportButton = exportCSVPage.getScheduleReportButton();
      const metrics = exportCSVPage.getMetrics();

      expect(exportButton.getAttribute('disabled')).toMatch('true');
      expect(scheduleReportButton.getAttribute('disabled')).toMatch('true');

      metrics.then(array => {
        return array[0].click();
      });

      expect(exportButton.getAttribute('disabled')).toMatch('true');
      expect(scheduleReportButton.getAttribute('disabled')).toMatch('true');

      exportCSVPage.setAreaPickerLocation('zone', 'New Yorker');
      expect(exportButton.getAttribute('disabled')).toEqual(null);
      expect(scheduleReportButton.getAttribute('disabled')).toEqual(null);

      metrics.then(array => {  // revert state
        return array[0].click();
      });

      expect(exportButton.getAttribute('disabled')).toMatch('true');
      expect(scheduleReportButton.getAttribute('disabled')).toMatch('true');

      exportCSVPage.setAreaPickerLocation('zone', 'New Yorker');
    });

    // todo: This test will fail until Jira LFR-21 is fixed - right now tenant names do not exactly match names in orgData
    // it('the area/zone dropdown should be correctly populated', function() {
    // exportCSVPage.getAreaPicker().click();
    // const locationList = exportCSVPage.getAreaPickerList('zone');
    //
    //  orgData.MSOrgSite.getAllAreas().forEach(function(location){
    //    expect(locationList).toContain(location);
    //  });
    //  exportCSVPage.getAreaPicker().click();
    // });

    it('the search bar in the area/zone dropdown should function correctly', () => {
      const searchBar = exportCSVPage.getPickerSearchBar('zone');

      exportCSVPage.getAreaPicker().click();
      expect(exportCSVPage.getAreaPickerList('zone')).toContain('New Yorker 119905');
      searchBar.clear();

      searchBar.sendKeys('amusing test string');
      expect(exportCSVPage.getAreaPickerList('zone')).toEqual([]);
      searchBar.clear();

      searchBar.sendKeys('yorker');
      expect(exportCSVPage.getAreaPickerList('zone')).toContain('New Yorker 119905');
      expect(exportCSVPage.getAreaPickerList('zone')).not.toContain('Gap Ext 109522');
      searchBar.clear();

      exportCSVPage.getAreaPicker().click();  // revert state
    });

    it('"select all" button in area/zone dropdown should function correctly', () => {
      exportCSVPage.getAreaPicker().click();
      const locationListInMenu = exportCSVPage.getAreaPickerList('zone');

      locationListInMenu.then(menuList => {
        exportCSVPage.getSelectAllBtn('zone').click();
        exportCSVPage.getAreaPicker().click();
        const locationListOnPage = exportCSVPage.getSelectedAreaList('zone');

        locationListOnPage.then(pageList => {
          expect(menuList.sort()).toEqual(pageList.sort());
        });
      });

      exportCSVPage.getAreaPicker().click();     // revert state
      exportCSVPage.getSelectAllBtn('zone').click();   // revert state
      exportCSVPage.getAreaPicker().click();     // revert state
    });

    it('should export a CSV', () => {
      exportCSVPage.setAreaPickerLocation('zone', 'New Yorker');

      const metrics = exportCSVPage.getMetrics();
      metrics.then(array => {
        browser.executeScript('window.scrollTo(0,0);').then(() => {
          return array[0].click();
        });
      });

      // //group report metrics by week to make it simpler to check accuracy of file contents
      exportCSVPage.setExportGroupBy('Week');
      fs.readdirSync(browser.params.downloadPath).forEach(file => {
        if ((file.indexOf('.csv') >= 0)) {
          fs.unlinkSync(`${browser.params.downloadPath}/${file}`);
        }
      });
      dateSelector.getExportCSVReportingPeriod(userData.superUser.dateFormat).then(exportTabDate => {
        browser.executeScript('window.scrollTo(0,0);').then(() => {
          exportCSVPage.exportCSV();
        });
        browser.waitForAngular();
        if (browser.params.localBrowser) { // different checks if testing locally vs testing remotely
          const fileName = `${browser.params.downloadPath}/report-site.csv`;
          let folderContents;

          browser.driver.wait(function() {
            // Wait until the file has been downloaded.
            // We need to wait thus as otherwise protractor has a nasty habit of
            // trying to do any following tests while the file is still being
            // downloaded and hasn't been moved to its final location.
            folderContents = fs.readdirSync(browser.params.downloadPath);
            let returnValue = false;
            folderContents.forEach(file => { // checks to make sure a CSV has been downloaded before proceeding
              if (file.indexOf('.csv') === file.length - 4) { // checks for file ending in .csv
                returnValue = true;
              }
            });
            return returnValue;
          }, 30000).then(() => {
            expect(fs.readFileSync(fileName, { encoding: 'utf8' })).toMatch( // checks file content to make sure headers and org/site/zone/date info are correct
              `organization_name,site_name,zone_name,period_start_date,period_end_date,traffic\r\n` +
              `"${orgData.MSOrg.name}","${orgData.MSOrgSite.name}","${orgData.MSOrgSite.testZone}",` +
              `"${moment(exportTabDate[0]).format(userData.superUser.dateFormat)}","${moment(exportTabDate[1]).format(userData.superUser.dateFormat)}"`
            );
          });
        }
// todo: no check for successful download in remote case yet - need a download success/error statement (LFR-129)
      });
    });

    it('should schedule a report correctly', () => {
      const initialScheduledReports = exportCSVPage.getScheduledCSVs();

      initialScheduledReports.then(list => {
        // check that scheduled report list is initially empty, otherwise expectations below will fail
        if (list.length > 0) {
          list.forEach(() => {
            exportCSVPage.removeScheduledCSV();
          });
        }
        exportCSVPage.getScheduledCSVs().then((list) => {
          expect(list.length).toBe(0);
        })
      });

      browser.executeScript('window.scrollTo(0,0);').then(() => {
        exportCSVPage.getScheduleReportButton().click();
      });

      exportCSVPage.scheduleTestCSV('Daily', orgData.MSOrgSite.name);

      browser.executeScript('window.scrollTo(0,0);').then(() => {
        exportCSVPage.getScheduleReportButton().click();
      });

      exportCSVPage.scheduleTestCSV('Weekly', orgData.MSOrgSite.name);

      browser.executeScript('window.scrollTo(0,0);').then(() => {
        exportCSVPage.getScheduleReportButton().click();
      });

      exportCSVPage.scheduleTestCSV('Monthly', orgData.MSOrgSite.name);

      browser.executeScript('window.scrollTo(0,0);').then(() => {
        exportCSVPage.getScheduleReportButton().click();
      });

      exportCSVPage.scheduleTestCSV('Yearly', orgData.MSOrgSite.name);

      const scheduledReportList = exportCSVPage.getScheduledCSVs();
      scheduledReportList.then(list => {
        expect(list[0].getText()).toMatch('Day');
        expect(list[1].getText()).toMatch('Week');
        expect(list[2].getText()).toMatch('Month');
        expect(list[3].getText()).toMatch('Year');


        list.forEach(() => {
          exportCSVPage.removeScheduledCSV();
          browser.waitForAngular();
        });

        initialScheduledReports.then(initialList => {
          expect(initialList.length).toBe(0);
        });
      });
    });

    afterAll(() => {
      if (browser.params.localBrowser) { // delete file to restore base state/avoid naming issues
        fs.unlinkSync(`${browser.params.downloadPath}/report-site.csv`);
        console.log(`deleting ${browser.params.downloadPath}/report-site.csv`);
      }
    });
  });

  describe('Single-site org', () => {
    beforeAll(() => {
      browser.get(`#/${orgData.SSOrg.id}/${orgData.SSOrg.ssOrgSiteId}/traffic?dateRangeStart=` +
        `${dateSelector.getURLDate('week', true)}&dateRangeEnd=${dateSelector.getURLDate('week', false)}&compareRange1Start=` +
        `${dateSelector.getURLDate('week', true, 1)}&compareRange1End=${dateSelector.getURLDate('week', false, 1)}&compareRange2Start=` +
        `${dateSelector.getURLDate('week', true, 2)}&compareRange2End=${dateSelector.getURLDate('week', false, 2)}&token=${token}`
      );
    });

    it('date range on metric tab should match range on export page', () => {
      dateSelector.getReportingPeriod(userData.superUser.dateFormat).then(metricTabDate => {
        nav.navToExportCSV();
        const exportTabDate = dateSelector.getExportCSVReportingPeriod(userData.superUser.dateFormat);

        expect(exportTabDate).toEqual(metricTabDate);
      });
    });

    it('should show correct site name', () => {
      const siteName = exportCSVPage.getExportSiteName();
      expect(siteName).toEqual(orgData.SSOrg.ssOrgSiteName);
      expect(nav.getSingleSiteName()).toEqual(orgData.SSOrg.ssOrgSiteName);
    });

    it('should show the correct metrics', () => {
      exportCSVPage.setMetricType('perimeter');
      const perimeterMetrics = exportCSVPage.getMetrics();
      expect(perimeterMetrics.getText()).toEqual(orgData.SSOrg.metrics.csv.perimeter);

      exportCSVPage.setMetricType('visitor behavior');
      const visitorBehaviorMetrics = exportCSVPage.getMetrics();
      expect(visitorBehaviorMetrics.getText()).toEqual(orgData.SSOrg.metrics.csv.visitorBehavior);
    });

    it('each metric should be clickable', () => {
      const metrics = exportCSVPage.getMetrics();

      metrics.each(elm => {
        expect(elm.getAttribute('class')).not.toMatch('selected');
        elm.click();
        browser.waitForAngular();
        expect(elm.getAttribute('class')).toMatch('selected');
        elm.click();
        browser.waitForAngular();
        expect(elm.getAttribute('class')).not.toMatch('selected');
      });
    });

    it('the export buttons should be enabled when a metric and an area are selected, and disabled otherwise', () => {
      const exportButton = exportCSVPage.getExportButton();
      const scheduleReportButton = exportCSVPage.getScheduleReportButton();
      const metrics = exportCSVPage.getMetrics();

      expect(exportButton.getAttribute('disabled')).toMatch('true');
      expect(scheduleReportButton.getAttribute('disabled')).toMatch('true');

      metrics.then(array => {
        browser.executeScript('window.scrollTo(0,0);').then(() => {
          return array[0].click();
        });
      });

      expect(exportButton.getAttribute('disabled')).toMatch('true');
      expect(scheduleReportButton.getAttribute('disabled')).toMatch('true');

      exportCSVPage.setAreaPickerLocation('area', 'Irish Pub');
      expect(exportButton.getAttribute('disabled')).toEqual(null);
      expect(scheduleReportButton.getAttribute('disabled')).toEqual(null);

      metrics.then(array => {  // revert state
        browser.executeScript('window.scrollTo(0,0);').then(() => {
          return array[0].click();
        });
      });

      expect(exportButton.getAttribute('disabled')).toMatch('true');
      expect(scheduleReportButton.getAttribute('disabled')).toMatch('true');

      exportCSVPage.setAreaPickerLocation('area', 'Irish Pub');
    });

    it('the area/zone dropdown should be correctly populated', () => {
      exportCSVPage.getAreaPicker().click();
      const locationList = exportCSVPage.getAreaPickerList('area');

      orgData.SSOrg.getAllAreas().forEach(location => {
        expect(locationList).toContain(location);
      });
      exportCSVPage.getAreaPicker().click();
    });

    it('the search bar in the area/zone dropdown should function correctly', () => {
      const searchBar = exportCSVPage.getPickerSearchBar('area');

      exportCSVPage.getAreaPicker().click();
      expect(exportCSVPage.getAreaPickerList('area')).toContain('B1-128 - Ri Ra Irish Pub');
      searchBar.clear();

      searchBar.sendKeys('amusing test string');
      expect(exportCSVPage.getAreaPickerList('area')).toEqual([]);
      searchBar.clear();

      searchBar.sendKeys('irish');
      expect(exportCSVPage.getAreaPickerList('area')).toContain('B1-128 - Ri Ra Irish Pub');
      expect(exportCSVPage.getAreaPickerList('area')).not.toContain('B1-109B - The Art of Shaving');
      searchBar.clear();

      exportCSVPage.getAreaPicker().click();  // revert state
    });

    it('"select all" button in area/zone dropdown should function correctly', () => {
      exportCSVPage.getAreaPicker().click();
      const locationListInMenu = exportCSVPage.getAreaPickerList('area');

      locationListInMenu.then(menuList => {
        exportCSVPage.getSelectAllBtn('area').click();
        exportCSVPage.getAreaPicker().click();
        const locationListOnPage = exportCSVPage.getSelectedAreaList('area');

        locationListOnPage.then(pageList => {
          expect(menuList.sort()).toEqual(pageList.sort());
        });
      });

      exportCSVPage.getAreaPicker().click();     // revert state
      exportCSVPage.getSelectAllBtn('area').click();   // revert state
      exportCSVPage.getAreaPicker().click();     // revert state
    });

    it('should export a CSV', () => {
      browser.executeScript('window.scrollTo(0,0);').then(() => {
        exportCSVPage.setAreaPickerLocation('area', 'Irish Pub');
      });

      const metrics = exportCSVPage.getMetrics();
      metrics.then(array => {
        browser.executeScript('window.scrollTo(0,0);').then(() => {
          return array[0].click();
        });
      });

      // group report metrics by week to make it simpler to check accuracy of file contents
      exportCSVPage.setExportGroupBy('Week');

      dateSelector.getExportCSVReportingPeriod(userData.superUser.dateFormat).then(exportTabDate => {
        browser.executeScript('window.scrollTo(0,0);').then(() => {
          exportCSVPage.exportCSV();
        });
        browser.waitForAngular();
        if (browser.params.localBrowser) { // different checks if testing locally vs testing remotely
          const fileName = `${browser.params.downloadPath}/report-site.csv`;
          let folderContents;

          browser.driver.wait(function() {
            // Wait until the file has been downloaded.
            // We need to wait thus as otherwise protractor has a nasty habit of
            // trying to do any following tests while the file is still being
            // downloaded and hasn't been moved to its final location.
            folderContents = fs.readdirSync(browser.params.downloadPath);
            let returnValue = false;
            folderContents.forEach(file => { // checks to make sure a CSV has been downloaded before proceeding
              if (file.indexOf('.csv') === file.length - 4) { // checks for file ending in .csv
                returnValue = true;
              }
            });
            return returnValue;
          }, 30000).then(() => {
            expect(fs.readFileSync(fileName,  { encoding: 'utf8' })).toMatch(
              `organization_name,site_name,location_name,period_start_date,period_end_date,traffic\r\n` +
              `"${orgData.SSOrg.name}","${orgData.SSOrg.ssOrgSiteName}","${orgData.SSOrg.testArea}","` +
              `${moment(exportTabDate[0]).format(userData.superUser.dateFormat)}","${moment(exportTabDate[1]).format(userData.superUser.dateFormat)}"`
            );
          });
        }
      });
// todo: no check for successful download in remote case yet - need a download success/error statement (LFR-129)
    });

    it('should schedule a report correctly', () => {
      let initialScheduledReports = exportCSVPage.getScheduledCSVs();

      initialScheduledReports.then(list => {
        if (list.length > 0) {
          list.forEach(() => {
            exportCSVPage.removeScheduledCSV();
          });
        }
      });
      exportCSVPage.getScheduledCSVs().then((list) => {
        expect(list.length).toBe(0);     // check that scheduled report list is initially empty, otherwise expectations below will fail
      })
      browser.executeScript('window.scrollTo(0,0);').then(() => {
        exportCSVPage.getScheduleReportButton().click();
      });
      exportCSVPage.scheduleTestCSV('Daily', orgData.SSOrg.name);

      browser.executeScript('window.scrollTo(0,0);').then(() => {
        exportCSVPage.getScheduleReportButton().click();
      });

      exportCSVPage.scheduleTestCSV('Weekly', orgData.SSOrg.name);

      browser.executeScript('window.scrollTo(0,0);').then(() => {
        exportCSVPage.getScheduleReportButton().click();
      });

      exportCSVPage.scheduleTestCSV('Monthly', orgData.SSOrg.name);

      browser.executeScript('window.scrollTo(0,0);').then(() => {
        exportCSVPage.getScheduleReportButton().click();
      });

      exportCSVPage.scheduleTestCSV('Yearly', orgData.SSOrg.name);

      const scheduledReportList = exportCSVPage.getScheduledCSVs();
      scheduledReportList.then(list => {
        expect(list[0].getText()).toMatch('Day');
        expect(list[1].getText()).toMatch('Week');
        expect(list[2].getText()).toMatch('Month');
        expect(list[3].getText()).toMatch('Year');

        list.forEach(() => {
          exportCSVPage.removeScheduledCSV();
          browser.waitForAngular();
        });

        initialScheduledReports = exportCSVPage.getScheduledCSVs();

        initialScheduledReports.then(initialList => {
          expect(initialList.length).toBe(0);
        });
      });
    });


    afterAll(() => {
      if (browser.params.localBrowser) { // delete file to restore base state/avoid naming issues
        fs.unlinkSync(`${browser.params.downloadPath}/report-site.csv`);
        console.log(`deleting ${browser.params.downloadPath}/report-site.csv`);
      }
    });
  });

  describe('Retail org', () => {
    beforeAll(() => {
      browser.get(`#/${orgData.MSRetailOrg.id}/retail?dateRangeStart=${dateSelector.getURLDate('week', true)}` +
        `&dateRangeEnd=${dateSelector.getURLDate('week', false)}&compareRange1Start=${dateSelector.getURLDate('week', true, 1)}` +
        `&compareRange1End=${dateSelector.getURLDate('week', false, 1)}&compareRange2Start=${dateSelector.getURLDate('week', true, 2)}` +
        `&compareRange2End=${dateSelector.getURLDate('week', false, 2)}&token=${token}`
      );
    });

    it('date range on metric tab should match range on export page', () => {
      dateSelector.getReportingPeriod(userData.superUser.dateFormat).then(metricTabDate => {
        nav.navToExportCSV();
        const exportTabDate = dateSelector.getExportCSVReportingPeriod(userData.superUser.dateFormat);

        expect(exportTabDate).toEqual(metricTabDate);
      });
    });

    it('should show the correct metrics', () => {
      exportCSVPage.setMetricType('perimeter');
      const perimeterMetrics = exportCSVPage.getMetrics();
      expect(perimeterMetrics.getText()).toEqual(orgData.MSRetailOrg.metrics.csv);
    });

    it('each metric should be clickable', () => {
      const metrics = exportCSVPage.getMetrics();

      metrics.each(elm => {
        expect(elm.getAttribute('class')).not.toMatch('selected');
        elm.click();
        browser.waitForAngular();
        expect(elm.getAttribute('class')).toMatch('selected');
        elm.click();
        browser.waitForAngular();
        expect(elm.getAttribute('class')).not.toMatch('selected');
      });
    });

    it('the export buttons should be enabled when a metric and an area are selected, and disabled otherwise', () => {
      const exportButton = exportCSVPage.getExportButton();
      const scheduleReportButton = exportCSVPage.getScheduleReportButton();
      const metrics = exportCSVPage.getMetrics();

      expect(exportButton.getAttribute('disabled')).toMatch('true');
      expect(scheduleReportButton.getAttribute('disabled')).toMatch('true');

      metrics.then(array => {
        browser.executeScript('window.scrollTo(0,0);').then(() => {
          return array[0].click();
        });
      });

      expect(exportButton.getAttribute('disabled')).toMatch('true');
      expect(scheduleReportButton.getAttribute('disabled')).toMatch('true');

      exportCSVPage.setAreaPickerLocation('site', 'Chicago');
      expect(exportButton.getAttribute('disabled')).toEqual(null);
      expect(scheduleReportButton.getAttribute('disabled')).toEqual(null);

      metrics.then(array => {  // revert state
        browser.executeScript('window.scrollTo(0,0);').then(() => {
          return array[0].click();
        });
      });

      expect(exportButton.getAttribute('disabled')).toMatch('true');
      expect(scheduleReportButton.getAttribute('disabled')).toMatch('true');

      exportCSVPage.setAreaPickerLocation('site', 'Chicago');
    });


    it('should export a CSV', () => {
      const metrics = exportCSVPage.getMetrics();
      metrics.then(array => {
        browser.executeScript('window.scrollTo(0,0);').then(() => {
          return array[0].click();
        });
      });

      browser.executeScript('window.scrollTo(0,0);').then(() => {
        exportCSVPage.setAreaPickerLocation('site', 'Chicago');
      });

      // group report metrics by week to make it simpler to check accuracy of file contents
      exportCSVPage.setExportGroupBy('Week');

      dateSelector.getExportCSVReportingPeriod(userData.superUser.dateFormat).then(exportTabDate => {
        browser.executeScript('window.scrollTo(0,0);').then(() => {
          exportCSVPage.exportCSV();
        });
        browser.waitForAngular();
        if (browser.params.localBrowser) { // different checks if testing locally vs testing remotely
          const fileName = `${browser.params.downloadPath}/report-site.csv`;
          let folderContents;

          browser.driver.wait(function() {
            // Wait until the file has been downloaded.
            // We need to wait thus as otherwise protractor has a nasty habit of
            // trying to do any following tests while the file is still being
            // downloaded and hasn't been moved to its final location.
            folderContents =  fs.readdirSync(browser.params.downloadPath);
            let returnValue = false;
            folderContents.forEach(file => { // checks to make sure a CSV has been downloaded before proceeding
              if (file.indexOf('.csv') === file.length - 4) { // checks for file ending in .csv
                returnValue = true;
              }
            });
            return returnValue;
          }, 30000).then(() => {
            expect(fs.readFileSync(fileName, { encoding: 'utf8' })).toMatch(
              `organization_name,site_name,period_start_date,period_end_date,traffic\r\n` +
              `"${orgData.MSRetailOrg.name}","${orgData.MSRetailSite.csvTestSiteNameAndId}","` +
              `${moment(exportTabDate[0]).format(userData.superUser.dateFormat)}","${moment(exportTabDate[1]).format(userData.superUser.dateFormat)}"`
            );
          });
        }
      });
// todo: no check for successful download in remote case yet - need a download success/error statement (LFR-129)
    });

    it('should schedule a report correctly', () => {
      const initialScheduledReports = exportCSVPage.getScheduledCSVs();

      initialScheduledReports.then(list => {
        if (list.length > 0) {
          list.forEach(() => {
            exportCSVPage.removeScheduledCSV();
          });
        }
        exportCSVPage.getScheduledCSVs().then((list) => {
          expect(list.length).toBe(0);     // check that scheduled report list is initially empty, otherwise expectations below will fail
        })

      });

      browser.executeScript('window.scrollTo(0,0);').then(() => {
        exportCSVPage.getScheduleReportButton().click();
      });
      exportCSVPage.scheduleTestCSV('Daily', orgData.MSRetailOrg.name);

      browser.executeScript('window.scrollTo(0,0);').then(() => {
        exportCSVPage.getScheduleReportButton().click();
      });

      exportCSVPage.scheduleTestCSV('Weekly', orgData.MSRetailOrg.name);

      browser.executeScript('window.scrollTo(0,0);').then(() => {
        exportCSVPage.getScheduleReportButton().click();
      });

      exportCSVPage.scheduleTestCSV('Monthly', orgData.MSRetailOrg.name);

      browser.executeScript('window.scrollTo(0,0);').then(() => {
        exportCSVPage.getScheduleReportButton().click();
      });

      exportCSVPage.scheduleTestCSV('Yearly', orgData.MSRetailOrg.name);

      const scheduledReportList = exportCSVPage.getScheduledCSVs();
      scheduledReportList.then(list => {
        expect(list[0].getText()).toMatch('Day');
        expect(list[1].getText()).toMatch('Week');
        expect(list[2].getText()).toMatch('Month');
        expect(list[3].getText()).toMatch('Year');

        list.forEach(() => {
          exportCSVPage.removeScheduledCSV();
          browser.waitForAngular();
        });

        initialScheduledReports.then(initialList => {
          expect(initialList.length).toBe(0);
        });
      });
    });

    afterAll(done => {
      nav.logout();
      if (browser.params.localBrowser) { // delete file to restore base state/avoid naming issues
        fs.unlinkSync(`${browser.params.downloadPath}/report-site.csv`);
        console.log(`deleting ${browser.params.downloadPath}/report-site.csv`);
      }
      login.deleteUser(done, userId);
    });
  });
});
