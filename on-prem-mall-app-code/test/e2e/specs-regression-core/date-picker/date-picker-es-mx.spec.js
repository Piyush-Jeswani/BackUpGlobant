'use strict';

describe('Translations in date picker widget:', function() {

  var moment = require('moment');
  var datePickerSharedLangTests = require('../../shared-specs/date-picker-shared-translations.spec.js');
  var orgData = require('../../data/orgs.js');
  var login = require('../../pages/login.js');
  var nav = require('../../pages/components/nav-header.js');
  var dateSelector = require('../../pages/components/time-period-picker.js');

  var locale = 'es_MX';

  beforeAll(function (done) {
    if (browser.params.indirectNav){
      login.go();
      login.loginAsTestLangUser(locale);
      nav.pickMSOrg();
      done();
    } else {
      login.getTestLangUserToken(function(token) {
        browser.get('#/' + orgData.MSOrg.id + '/summary?dateRangeStart=' + dateSelector.getURLDate('week', true) + '&dateRangeEnd=' +
          dateSelector.getURLDate('week', false) + '&compareRange1Start=' + dateSelector.getURLDate('week', true, 1) + '&compareRange1End=' +
          dateSelector.getURLDate('week', false, 1) + '&compareRange2Start=' + dateSelector.getURLDate('week', true, 2) + '&compareRange2End=' +
          dateSelector.getURLDate('week', false, 2) + '&token=' + token);
        done();
      }, locale, false);
    }
  });

  describe('when user\'s language is Mexican Spanish', function () {

    datePickerSharedLangTests.datePickerSharedLangTests(locale);

  });

  afterAll(function() {
    nav.logout();
  });

});
