'use strict';

module.exports = {
//shared tests for localization translations

  datePickerSharedLangTests: function(locale) {

    describe('Date picker (shared translation tests)', function () {

      var translationsFilePath = '../../../src/l10n/languages/' + locale + '.json'; //sets up filepath for required translations file
      var translations = require(translationsFilePath);

      var dateSelector = require('../pages/components/time-period-picker.js');

      beforeAll(function () {
        dateSelector.toggleDatePicker();
      });

      describe('selected period tab', function () {

        it('text in selected period tab header', function () {
          var tabHeader = dateSelector.getDatePickerTabHeader();

          expect(tabHeader).toMatch(translations.common.SELECTEDPERIOD);
          expect(tabHeader).toMatch(translations.dateRangePicker.DAYSSELECTED);
        });

        it('date field headers', function () {
          var fromField = dateSelector.getDateFieldHeaders('from');
          var toField = dateSelector.getDateFieldHeaders('to');

          expect(fromField.getText()).toEqual(translations.dateRangePicker.FROM.toUpperCase());
          expect(toField.getText()).toEqual(translations.dateRangePicker.TO.toUpperCase());
        });

        it('shortcuts dropdown', function () {
          var shortcutsHeader = dateSelector.getDateShortcutsVisibleText();
          var shortcutsMenu = dateSelector.getDateShortcutsMenuOptions();

          expect(shortcutsHeader).toMatch(translations.dateRangePicker.SHORTCUTS);
          expect(shortcutsMenu.getText()).toEqual([
            translations.dateRangePicker.WEEKTODATE,
            translations.dateRangePicker.MONTHTODATE,
            translations.dateRangePicker.QUARTERTODATE,
            translations.dateRangePicker.YEARTODATE
          ]);
        });

        it('apply and cancel buttons', function () {
          var applyButton = dateSelector.getApplyOrCancelButton('apply');
          var cancelButton = dateSelector.getApplyOrCancelButton('cancel');

          expect(applyButton.getText()).toEqual(translations.dateRangePicker.APPLY);
          expect(cancelButton.getText()).toEqual(translations.dateRangePicker.CANCEL);
        });
      });

      describe('compare tab text', function () {

        it('compare period text in 1st picker tab header', function () {
          dateSelector.pickPickerTab(1);
          var tabHeader = dateSelector.getDatePickerTabHeader();

          expect(tabHeader).toMatch(translations.common.PRIORPERIOD);

          dateSelector.pickCustomDateRange();
          tabHeader = dateSelector.getDatePickerTabHeader();

          expect(tabHeader).toMatch(translations.common.CUSTOMCOMPARE1);
        });

        it('shortcuts dropdown', function () {
          var shortcutsHeader = dateSelector.getDateShortcutsVisibleText();
          var shortcutsMenu = dateSelector.getDateShortcutsMenuOptions();

          expect(shortcutsHeader).toMatch(translations.dateRangePicker.SHORTCUTS);
          expect(shortcutsMenu.getText()).toEqual([
            translations.common.PRIORPERIOD,
            translations.common.PRIORYEAR
          ]);
        });

        it('"compare weeks back" text', function () {
          var compareWeeksBackText = dateSelector.getCompareWeeksBackText();

          expect(compareWeeksBackText).toMatch(translations.analyticsHeader.COMPARE);
          expect(compareWeeksBackText).toMatch(translations.dateRangePicker.WEEKSBACK);
        });

        it('compare period text in 2nd picker tab header', function () {
          dateSelector.pickPickerTab(2);
          var tabHeader = dateSelector.getDatePickerTabHeader();

          expect(tabHeader).toMatch(translations.common.PRIORYEAR);

          dateSelector.pickCustomDateRange();
          tabHeader = dateSelector.getDatePickerTabHeader();

          expect(tabHeader).toMatch(translations.common.CUSTOMCOMPARE2);
        });
      });

      afterAll(function () {
        dateSelector.toggleDatePicker();
      });
    });
  }
};
