const orgData = require('../data/orgs.js');
const nav = require('../pages/components/nav-header.js');
const dateSelector = require('../pages/components/time-period-picker.js');
const exportCSVPage = require('../pages/components/export-csv.js');
const filterPicker = require('../pages/components/filter-picker.js');

module.exports = {
// shared tests for localization translations, using prior period/prior year date ranges

  exportCSVSharedLangTests(locale) {
    describe('Export CSV tab (shared translation tests)', () => {
      const translationsFilePath = `../../../src/l10n/languages/${locale}.json`; // sets up filepath for required translations file
      const translations = require(translationsFilePath);

      describe('general export page text', () => {
        beforeAll(() => {
          nav.navToExportCSV();
        });

        it('should show correct site name', () => {
          const siteName = exportCSVPage.getExportSiteName();
          expect(siteName).toEqual(orgData.MSOrgSite.name);
        });

        it('Export PDF page title', () => {
          const pageTitle = exportCSVPage.getExportPageTitle();
          expect(pageTitle).toEqual(translations.csvExportView.EXPORTCSV.toUpperCase());
        });

        it('"date and time settings" text', () => {
          const header = exportCSVPage.getDateTimeHeaderText();
          expect(header).toEqual(translations.csvExportView.DATEANDTIMESETTINGS);
        });

        it('operating hours dropdown', () => {
          const opHoursHeader = exportCSVPage.getOpHoursVisibleText();
          const opHoursMenu = exportCSVPage.getOpHoursMenuOptions();

          expect(opHoursHeader).toMatch(translations.csvExportView.OPERATINGHOURS.toUpperCase());
          expect(opHoursMenu.getText()).toEqual([translations.csvExportView.BUSINESSHOURS, translations.csvExportView.BUSINESSDAYS]);
        });

        it('group by dropdown', () => {
          const groupByHeader = exportCSVPage.getExportGroupByVisibleText();
          const groupByMenu = exportCSVPage.getExportGroupByMenuOptions();

          expect(groupByHeader).toMatch(translations.csvExportView.GROUPBY.toUpperCase());
          expect(groupByMenu.getText()).toEqual([
            translations.common.HOUR,
            translations.common.DAY,
            translations.common.WEEK,
            translations.common.MONTH,
            translations.common.AGGREGATE
          ]);
        });

        it('time period selector header', () => {
          const pickerHeader = exportCSVPage.getTimeSelectorVisibleText();
          expect(pickerHeader).toMatch(translations.csvExportView.SELECTTIMEPERIOD.toUpperCase());
        });

        it('"select metrics" header', () => {
          const header = exportCSVPage.getSelectMetricsHeaderText();

          expect(header).toMatch(translations.csvExportView.SELECTMETRICS);
        });

        it('"export" and "schedule report" buttons', () => {
          const exportBtn = exportCSVPage.getExportButton();
          const scheduleReportBtn = exportCSVPage.getScheduleReportButton();

          expect(exportBtn.getText()).toEqual(translations.csvExportView.EXPORTCSV);
          expect(scheduleReportBtn.getText()).toEqual(translations.csvExportView.SCHEDULEREPORT);
        });

        // common date-picker text translation checks
        describe('time period selector text', () => {
          beforeAll(() => {
            dateSelector.toggleExportCSVDatePicker();
          });

          it('date field headers', () => {
            const fromField = dateSelector.getDateFieldHeaders('from');
            const toField = dateSelector.getDateFieldHeaders('to');

            expect(fromField.getText()).toEqual(translations.dateRangePicker.FROM.toUpperCase());
            expect(toField.getText()).toEqual(translations.dateRangePicker.TO.toUpperCase());
          });

          it('shortcuts dropdown', () => {
            const shortcutsHeader = dateSelector.getDateShortcutsVisibleText();
            const shortcutsMenu = dateSelector.getDateShortcutsMenuOptions();

            expect(shortcutsHeader).toMatch(translations.dateRangePicker.SHORTCUTS);
            expect(shortcutsMenu.getText()).toEqual([
              translations.dateRangePicker.WEEKTODATE,
              translations.dateRangePicker.MONTHTODATE,
              translations.dateRangePicker.QUARTERTODATE,
              translations.dateRangePicker.YEARTODATE

            ]);
          });

          it('apply and cancel buttons', () => {
            const applyButton = dateSelector.getApplyOrCancelButton('apply');
            const cancelButton = dateSelector.getApplyOrCancelButton('cancel');

            expect(applyButton.getText()).toEqual(translations.dateRangePicker.APPLY);
            expect(cancelButton.getText()).toEqual(translations.dateRangePicker.CANCEL);
          });

          afterAll(() => {
            dateSelector.toggleExportCSVDatePicker();
          });
        });
      });

      describe('"edit schedule" dialogue text', () => {
        beforeAll(() => {
          // setup for schedule report dialogue -
          // select at least one metric and zone to activate schedule button;
          const metrics = exportCSVPage.getMetrics();
          metrics.then(array => {
            return array[0].click();
          });

          exportCSVPage.setAreaPickerLocation('zone', 'New Yorker');
          exportCSVPage.getScheduleReportButton().click();
        });

        it('(may fail until SA-4207 is resolved)"edit schedule" dialogue text', () => {
          const editScheduleText = exportCSVPage.getEditScheduleSection().getText();

          expect(editScheduleText).toMatch(translations.csvExportView.EDITSCHEDULE);
          expect(editScheduleText).toMatch(translations.scheduleReport.FROM);
          expect(editScheduleText).toMatch(translations.scheduleReport.TO);
          expect(editScheduleText).toMatch(translations.scheduleReport.RECIPIENT);
          expect(editScheduleText).toMatch(translations.scheduleReport.ADDRECIPIENT);
          expect(editScheduleText).toMatch(translations.scheduleReport.REPORTNAME);
          expect(editScheduleText).toMatch(translations.scheduleReport.FREQUENCY);
          expect(editScheduleText).toMatch(translations.common.WEEKLY);
          expect(editScheduleText).toMatch(translations.scheduleReport.MESSAGE);
          expect(editScheduleText).toMatch(translations.csvExportView.SAVESCHEDULE);
          expect(editScheduleText).toMatch(translations.scheduleReport.CANCEL);
        });

        it('input field placeholders', () => {
          const inputPlaceholders = exportCSVPage.getEditScheduleInputPlaceholders();
          const messagePlaceholder = exportCSVPage.getEditScheduleMsgPlaceholder();

          expect(inputPlaceholders).toEqual([
            'noreply@shoppertrak.com',
            'jzimmerman@shoppertrak.com',
            translations.scheduleReport.ADDONEEMAIL,
            '',
            ''
          ]);
          expect(messagePlaceholder).toEqual('');
        });

        it('frequency dropdown options', () => {
          const frequencyOptions = exportCSVPage.getScheduledFrequencyOptions();
          expect(frequencyOptions.getText()).toEqual([
            translations.common.DAILY,
            translations.common.WEEKLY,
            translations.common.MONTHLY,
            translations.common.YEARLY
          ]);

          exportCSVPage.openScheduledFrequencyMenu();
        });

        it('secondary frequency options - weekly', () => {
          const frequencyWeeklyHeader = exportCSVPage.getFrequencyOptionsWeeklyLabel();
          const frequencyWeeklySettings = exportCSVPage.getFrequencyOptionSettings();

          expect(frequencyWeeklyHeader.getText()).toEqual(translations.scheduleReport.DAYOFWEEK);
          expect(frequencyWeeklySettings.getText()).toEqual([
            translations.weekdaysLong.sun,
            translations.weekdaysLong.mon,
            translations.weekdaysLong.tue,
            translations.weekdaysLong.wed,
            translations.weekdaysLong.thu,
            translations.weekdaysLong.fri,
            translations.weekdaysLong.sat
          ]);
        });

        it('secondary frequency options - monthly', () => {
          const frequencyMonthlyHeader = exportCSVPage.getFrequencyOptionsMonthlyLabel();
          const frequencyMonthlySettings = exportCSVPage.getFrequencyOptionSettings();

          expect(frequencyMonthlyHeader.getText()).toEqual(translations.scheduleReport.DAYOFMONTH);
          expect(frequencyMonthlySettings.getText()).toEqual([
            translations.common.FIRST,
            translations.common['15TH']
          ]);
        });

        it('secondary frequency options - yearly', () => {
          const frequencyYearlyHeader = exportCSVPage.getFrequencyOptionsYearlyLabel();
          const frequencyYearlySettings = exportCSVPage.getFrequencyOptionSettings();

          expect(frequencyYearlyHeader.getText()).toEqual(translations.common.MONTH);
          expect(frequencyYearlySettings.getText()).toEqual([
            translations.monthsLong.january,
            translations.monthsLong.february,
            translations.monthsLong.march,
            translations.monthsLong.april,
            translations.monthsLong.may,
            translations.monthsLong.june,
            translations.monthsLong.july,
            translations.monthsLong.august,
            translations.monthsLong.september,
            translations.monthsLong.october,
            translations.monthsLong.november,
            translations.monthsLong.december
          ]);
        });

        it('"save schedule" and "cancel" buttons', () => {
          const saveButton = exportCSVPage.scheduledReportFields.saveButton;
          const cancelButton = exportCSVPage.scheduledReportFields.cancelButton;

          expect(saveButton.getText()).toEqual(translations.csvExportView.SAVESCHEDULE);
          expect(cancelButton.getText()).toEqual(translations.csvExportView.CANCEL);
        });

        it('"scheduled reports" list header', () => {
          const listHeader = exportCSVPage.getScheduledReportsHeader();
          expect(listHeader.getText()).toEqual(translations.csvExportView.SCHEDULEDCSVREPORTS);
        });

        it('"scheduled reports" list message, when list is empty', () => {
          // uncertain starting state - list may contain scheduled reports or may be empty
          const initialScheduledReports = exportCSVPage.getScheduledCSVs();

          initialScheduledReports.then(list => {
            // check that scheduled report list is empty, otherwise element in expectation will not be present
            if (list.length !== 0) {
              list.forEach(() => {
                exportCSVPage.removeScheduledCSV();
              });
            }
            const emptyListMsg = exportCSVPage.getScheduledReportsEmptyListMsg();
            expect(emptyListMsg.getText()).toEqual(translations.csvExportView.NOSAVEDREPORTS);
          });
        });

        it('"scheduled reports" list text, when list is populated', () => {
          // uncertain starting state - list may contain scheduled reports or may be empty

          const initialScheduledReports = exportCSVPage.getScheduledCSVs();

          initialScheduledReports.then(list => {
            if (list.length === 0) { // if list is empty, schedule a report
              exportCSVPage.scheduleTestCSV('Weekly', orgData.MSOrgSite.name);
            }

            const listHeaders = exportCSVPage.getScheduledReportListHeaders();
            expect(listHeaders.getText()).toMatch(translations.csvExportView.REPORTNAME);
            expect(listHeaders.getText()).toMatch(translations.csvExportView.FREQUENCY);
            expect(listHeaders.getText()).toMatch(translations.csvExportView.BY);

            exportCSVPage.removeScheduledCSV();
          });
        });
      });

      describe('dynamic metric/location text dependant on export source', () => {
        describe('site-level mall org with tenant zones', () => {
          beforeAll(() => {
            browser.executeScript('window.scrollTo(0,0);');
          });

          it('metric-type selector button', () => {
            const header = exportCSVPage.getMetricTypeButtonText();

            expect(header).toEqual([translations.csvExportView.PERIMETER.toUpperCase()]);
          });

          it('metrics for export', () => {
            const metrics = exportCSVPage.getMetrics();
            const expectedMetrics = orgData.MSOrgSite.metrics.csvTranslationKeys.map(key => {
              return orgData.getNestedProp(translations, key);
            });

            expect(metrics.getText()).toEqual(expectedMetrics);
          });

          it('location picker visible text', () => {
            const header = exportCSVPage.getAreaPickerHeaderText('zone');
            const pickerButton = exportCSVPage.getAreaPicker();

            expect(header.getText()).toEqual(translations.csvExportView.SELECTZONES);
            expect(pickerButton.getText()).toEqual(translations.csvExportView.SELECTZONES);
          });

          it('location picker dropdown text', () => {
            exportCSVPage.getAreaPicker().click();

            const searchBar = exportCSVPage.getPickerSearchBar('zone');
            const selectAllBtn = exportCSVPage.getSelectAllBtn('zone');

            expect(searchBar.getAttribute('placeholder')).toMatch(translations.locationSelector.SEARCH);
            expect(selectAllBtn.getText()).toEqual(translations.locationSelector.SELECTALL);
          });
        });

        describe('single site org with interior locations', () => {
          beforeAll(() => {
            // nav to: org Mandalay bay, site The Shoppes at Mandalay Place, traffic tab
            browser.get(`#/${orgData.SSOrg.id}/${orgData.SSOrg.ssOrgSiteId}/traffic?dateRangeStart=${dateSelector.getURLDate('week', true)}` +
              `&dateRangeEnd=${dateSelector.getURLDate('week', false)}&compareRange1Start=${dateSelector.getURLDate('week', true, 1)}` +
              `&compareRange1End=${dateSelector.getURLDate('week', false, 1)}&compareRange2Start=${dateSelector.getURLDate('week', true, 2)}` +
              `&compareRange2End=${dateSelector.getURLDate('week', false, 2)}`);
            nav.navToExportCSV();
          });

          it('metric-type selector button', () => {
            const header = exportCSVPage.getMetricTypeButtonText();

            expect(header).toEqual([translations.csvExportView.PERIMETER.toUpperCase(), translations.csvExportView.VISITORBEHAVIOR.toUpperCase()]);
          });

          it('metrics for export', () => {
            const metrics = exportCSVPage.getMetrics();
            const expectedVBMetrics = orgData.SSOrg.metrics.csvTranslationKeys.visitorBehavior.map(key => {
              if (Array.isArray(key)) {
                return key.map((innerKey, index) => {
                  const translatedString = orgData.getNestedProp(translations, innerKey);
                  if (index !== 0) {
                    return translatedString.toLowerCase();
                  }
                  return translatedString;
                }).join(' ');
              }
              return orgData.getNestedProp(translations, key);
            });

            expect(metrics.getText()).toEqual([
              translations.kpis.kpiTitle.traffic,
              translations.kpis.kpiTitle.sales,
              translations.kpis.kpiTitle.conversion,
              translations.kpis.kpiTitle.transactions,
              translations.kpis.kpiTitle.upt,
              translations.kpis.kpiTitle.ats,
              translations.kpis.shortKpiTitles.tenant_aur,
              translations.kpis.shortKpiTitles.tenant_sps
            ]);

            exportCSVPage.setMetricType('visitor behavior');

            expect(metrics.getText()).toEqual(expectedVBMetrics);
          });

          it('location picker visible text', () => {
            const header = exportCSVPage.getAreaPickerHeaderText();
            const pickerButton = exportCSVPage.getAreaPicker();

            expect(header.getText()).toEqual(translations.csvExportView.SELECTAREAS);
            expect(pickerButton.getText()).toEqual(translations.csvExportView.SELECTAREAS);
          });

          it('location picker dropdown text', () => {
            exportCSVPage.getAreaPicker().click();

            const searchBar = exportCSVPage.getPickerSearchBar();
            const selectAllBtn = exportCSVPage.getSelectAllBtn();

            expect(searchBar.getAttribute('placeholder')).toEqual(translations.locationSelector.SEARCH);
            expect(selectAllBtn.getText()).toEqual(translations.locationSelector.SELECTALL);
          });
        });

        describe('retail org with retail sites', () => {
          beforeAll(() => {
            // nav to: org North Face, retail org summary page
            browser.get(`#/${orgData.MSRetailOrg.id}/retail?dateRangeStart=${dateSelector.getURLDate('week', true)}` +
              `&dateRangeEnd=${dateSelector.getURLDate('week', false)}&compareRange1Start=${dateSelector.getURLDate('week', true, 1)}` +
              `&compareRange1End=${dateSelector.getURLDate('week', false, 1)}&compareRange2Start=${dateSelector.getURLDate('week', true, 2)}` +
              `&compareRange2End=${dateSelector.getURLDate('week', false, 2)}`);
            nav.navToExportCSV();
          });

          // already checked metric button via site-level mall org test block above

          it('metrics for export', () => {
            const metrics = exportCSVPage.getMetrics();
            const expectedMetrics = orgData.MSRetailOrg.metrics.csvTranslationKeys.map(key => {
              return orgData.getNestedProp(translations, key);
            });

            expect(metrics.getText()).toEqual(expectedMetrics);
          });

          it('location picker visible text', () => {
            const header = exportCSVPage.getAreaPickerHeaderText('site');
            const pickerButton = exportCSVPage.getAreaPicker();

            expect(header.getText()).toEqual(translations.csvExportView.SELECTSITES);
            expect(pickerButton.getText()).toEqual(translations.csvExportView.SELECTSITES);
          });

          it('location picker dropdown text', () => {
            exportCSVPage.getAreaPicker().click();

            const searchBar = exportCSVPage.getPickerSearchBar('site');
            const selectAllBtn = exportCSVPage.getSelectAllBtn('site');

            expect(searchBar.getAttribute('placeholder')).toEqual(translations.locationSelector.SEARCH);
            expect(selectAllBtn.getText()).toEqual(translations.locationSelector.SELECTALL);

            exportCSVPage.getAreaPicker().click(); // revert state before testing filter picker
          });

          // filter picker is present only at org-level export from retail orgs
          it('filter picker', () => {
            const titleText = exportCSVPage.getFilterMenuTitleText();

            expect(titleText).toEqual(translations.csvExportView.SELECTFILTERS);

            const menuHeader = filterPicker.getFilterMenuText().getText();

            menuHeader.then(textArray => {
              expect(textArray[0]).toEqual(translations.common.FILTERS);
              expect(textArray[1]).toMatch(translations.common.FILTERSAPPLIED.toUpperCase());
              expect(textArray[2]).toMatch(translations.common.SHOWING.toUpperCase());
              expect(textArray[5]).toMatch(translations.common.SITES.toUpperCase());
            });
          });

          it('filter picker button text', () => {
            filterPicker.openFilterMenu();

            const applyBtn = filterPicker.getFilterMenuApplyBtn();
            const cancelBtn = filterPicker.getFilterMenuClearBtn();

            expect(applyBtn.getText()).toEqual(translations.common.APPLY);
            expect(cancelBtn.getText()).toEqual(translations.common.CLEAR);
          });
        });
      });
    });
  }
};
