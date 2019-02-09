'use strict';

angular.module('shopperTrak')
  .controller('AccountCtrl', [
    '$state',
    '$q',
    '$scope',
    '$timeout',
    'authService',
    'LocalizationService',
    'apiUrl',
    '$http',
    'localStorageService',
    '$translate',
    'comparisons',
    'comparisonsHelper',
    'fsHelper',
    'requestManager',
    'ObjectUtils',
    'customDashboardService',
    'applicationVersion',
    'googleAnalytics',
    'dateRangeService',
    'ExportService',
    'organizations',
    'SubscriptionsService',
    'currentSalesCategoryService',
    function (
      $state,
      $q,
      $scope,
      $timeout,
      authService,
      LocalizationService,
      apiUrl,
      $http,
      localStorageService,
      $translate,
      comparisons,
      comparisonsHelper,
      fsHelper,
      requestManager,
      ObjectUtils,
      customDashboardService,
      applicationVersion,
      googleAnalytics,
      dateRangeService,
      ExportService,
      organizations,
      SubscriptionsService,
      currentSalesCategoryService
    ) {
      //Translation Lists
      var validationMessages = [
        '.VALIDATIONMESSAGES.PASSWORDLENGTH',
        '.VALIDATIONMESSAGES.PASSWORDMATCH',
        '.VALIDATIONMESSAGES.CHOOSECALENDAR',
        '.VALIDATIONMESSAGES.VALIDNOOFWEEKS',
        '.VALIDATIONMESSAGES.UNIQUENUMBEROFWEEKS'
      ];

      var errorMessages = ['.ERRORMESSAGES.PASSWORDCHANGEERROR', '.ERRORMESSAGES.AUTHENTICATION'];

      // Custom Dashboard functionality

      $scope.deleteAllDashboardsHandler = function() {
        authService.getCurrentUser().then(function(user){
          $scope.currentUser = user;
          if (customDashboardService.getDashboards($scope.currentUser).length > 0) {
            customDashboardService.deleteAllDashboards(user);
            alert('Success');
          }
        });
      }

      // The credentials object is used to get '.' in ng-model for 2-way binding
      // to work for the second (password) form
      $scope.credentials = {};
      $scope.credentials.password = '';
      $scope.credentials.passwordConfirmation = '';
      $scope.credentials.formHasBeenSubmitted = false;

      $scope.preferencesFormHasBeenSubmitted = false;
      $scope.compareRangeIsYear = [];
      $scope.comparePeriodWeeks = [];
      $scope.data = {};

      $scope.back = back;
      $scope.submitForm = submitForm;
      //$scope.validatePasswordForm = validatePasswordForm;
      $scope.toggleComparePeriodDetails = toggleComparePeriodDetails;
      $scope.requestIsPending = false;

      $scope.language = LocalizationService.getCurrentLocaleSetting();

      // preferences defaults
      $scope.data.dateFormat = null;
      $scope.currentUserId = null;
      $scope.settingsLoaded = false;

      var standardGregorianSundayCalendarId = -2;
      var standardGregorianMondayCalendarId = -1;

      $scope.defaultCalendar = {
        calendar_id: null,
        name: 'Use organization default'
      };
      $scope.standardGregorianSunday = {
        calendar_id: standardGregorianSundayCalendarId,
        name: 'Standard Gregorian Sunday'
      };
      $scope.standardGregorianMonday = {
        calendar_id: standardGregorianMondayCalendarId,
        name: 'Standard Gregorian Monday'
      };

      $scope.numberFormats = LocalizationService.getNumberFormats();
      $scope.data.numberFormat = $scope.numberFormats[0];

      $scope.dateFormats = [];
      $scope.dateFormats.push({ value: null, displayText: 'Use organization default' });
      $scope.dateFormats.push({ value: 'MM/DD/YYYY', displayText: 'MM/DD/YYYY' });
      $scope.dateFormats.push({ value: 'M/D/YY', displayText: 'M/D/YY' });
      $scope.dateFormats.push({ value: 'DD/MM/YYYY', displayText: 'DD/MM/YYYY' });
      $scope.dateFormats.push({ value: 'D.M.YYYY', displayText: 'D.M.YYYY' });
      $scope.dateFormats.push({ value: 'YYYY-MM-DD', displayText: 'YYYY-MM-DD' });

      $scope.clearCache = clearCache;

      activate();

      function activate() {
        var promises = [];
        promises.push(loadAvailableCalendars());
        promises.push(getAllAvailableLanguages());
        $q.all(promises).then(function (lists) {
          $scope.calendars = lists[0];
          $scope.locales = lists[1].languages;
          getCurrentUserPreferences();
        }).catch(error => {
          console.error(error);
        });

        $scope.version = applicationVersion;
      }

      function setDefaultSalesCategories() {
        // This is not all orgs, but is the orgs the current user has access to
        let orgsWithSalesCategories = _.filter(organizations, org => {
          return SubscriptionsService.orgHasSalesCategories(org);
        });

        orgsWithSalesCategories = _.sortBy(orgsWithSalesCategories, 'name');

        // Return a useful array for the UI to work with
        $scope.defaultSalesCategories = _.map(orgsWithSalesCategories, org => {
          return {
            orgId: org.organization_id,
            orgName: org.name,
            allSalesCategories: getSalesCategoriesForOrg(org.portal_settings),
            defaultSalesCategory: getSalesCategoryPreference($scope.currentUser.preferences.default_sales_categories, org)
          };
        });
      }

      function getSalesCategoryPreference(defaultSalesCategories, org) {
        let salesCategoryId = 0; // Our fallback is total retail sales

        if(!ObjectUtils.isNullOrUndefined(defaultSalesCategories) && !ObjectUtils.isNullOrUndefined(defaultSalesCategories[org.organization_id])) {
          salesCategoryId = defaultSalesCategories[org.organization_id];
        }

        return _.findWhere(org.portal_settings.sales_categories, { id: salesCategoryId });
      }

      function getSalesCategoriesForOrg(portalSettings) {
        let salesCats = [];

        if(!ObjectUtils.isNullOrUndefined(portalSettings) && !ObjectUtils.isNullOrUndefined(portalSettings.sales_categories)) {
          salesCats = portalSettings.sales_categories;
        }

        salesCats = _.sortBy(salesCats, 'name');

        // This arranges the sales categories so that "Total Retail Sales" is first in the list.
        // Everything else will be sorted alphabetically
        let totalIndex = _.findIndex(salesCats, cat => { return cat.id === 0});

        salesCats.splice(0, 0, salesCats.splice(totalIndex, 1)[0]);

        return salesCats;
      }

      function getWeatherTranslations() {
        var weatherTransKeys = [
          'accountView.SELECTSPEED',
          'common.SHOWWEATHERWINDMILESUFFIX',
          'common.SHOWWEATHERWINDKILOSUFFIX',
          'accountView.SELECTTEMP',
          'common.SHOWWEATHERTEMPCENTSUFFIX',
          'common.SHOWWEATHERTEMPFAHRSUFFIX'
        ];

        $translate(weatherTransKeys).then(function(translations) {
          $scope.volocitySettings = {
            name: translations['accountView.SELECTSPEED']
          };

          $scope.velocity = [
            {name: translations['common.SHOWWEATHERWINDMILESUFFIX'], id: 'MPH'},
            {name: translations['common.SHOWWEATHERWINDKILOSUFFIX'], id: 'KPH'},
          ];

          $scope.tempSettings = {
            name: translations['accountView.SELECTTEMP']
          };

          $scope.temp = [
            {name: '\u00B0' + translations['common.SHOWWEATHERTEMPCENTSUFFIX'], id: 'C'},
            {name: '\u00B0' + translations['common.SHOWWEATHERTEMPFAHRSUFFIX'], id: 'F'}
          ];
        });
      }

      function loadOrgDefaultTranslation() {
        $translate(returnCompleteTranskey('.USEORGANIZATIONDEFAULT')).then(function (useDefault) {
          if(ObjectUtils.isNullOrUndefinedOrEmpty($scope.calendars)) {
            $scope.defaultCalendar = {
              calendar_id: null,
              name: useDefault
            };
          } else {
            $scope.calendars[0].name = useDefault;
          }

          $scope.numberFormats[0].description = useDefault;
          $scope.dateFormats[0].displayText = useDefault;

        });
      }

      function getCurrentUserPreferences() {
        loadTranslations();
        var disableCache = true;
        authService.getCurrentUser(disableCache).then(function (result) {
          var user = result;
          $scope.currentUserId = result._id;

          // load settings
          if (user.localization.number_format.decimal_separator === null && user.localization.number_format.thousands_separator === null) {
            $scope.data.numberFormat = _.findWhere($scope.numberFormats, { name: null });
          } else {
            $scope.data.numberFormat = _.findWhere($scope.numberFormats, { name: LocalizationService.getNumberFormatName(user.localization.number_format) });
          }
          
          $scope.data.calendar = _.findWhere($scope.calendars, { calendar_id: user.preferences.calendar_id });

          // for backward compatibility (empty preferences)
          var preferencesFound = (user.preferences !== null);

          $scope.comparePeriods = [];

          $scope.data.loadedShowWeatherMetrics = user.preferences.weather_reporting;
          $scope.data.showWeatherMetrics = user.preferences.weather_reporting;


          if(typeof user.localization !== 'undefined' ){
            if (typeof user.localization.temperature_format !== 'undefined') {
              $scope.data.temperature_format = {
                name: '\u00B0' + user.localization.temperature_format
              }
            }
            if (typeof user.localization.velocity_format !== 'undefined') {
              $scope.data.velocity_format = {
                name: user.localization.velocity_format
              }
            }
          }

          var comparisonsSet = [];

          _.each(comparisons, function (comparison, index) {

            if (comparison.value !== 'current') {
              comparisonsSet.push(compareObjectify(comparison, index));
            }
          });

          $scope.comparisonsSets = [];

          if (preferencesFound) {
            var period = user.preferences.custom_period_1;
            var definedPeriod = _.findWhere(comparisons, { value: period.period_type });
            definedPeriod.num_weeks = period.num_weeks;
            var comparePeriod = compareObjectify(definedPeriod, 0);
            $scope.comparePeriods.push(comparePeriod);
            $scope.comparisonsSets.push(angular.copy(comparisonsSet));

            period = user.preferences.custom_period_2;
            definedPeriod = _.findWhere(comparisons, { value: period.period_type });
            definedPeriod.num_weeks = period.num_weeks;
            comparePeriod = compareObjectify(definedPeriod, 1);
            $scope.comparePeriods.push(comparePeriod);
            $scope.comparisonsSets.push(angular.copy(comparisonsSet));
            $scope.data.showWeatherMetrics = user.preferences.weather_reporting;
          }

          if (user.localization !== undefined && user.localization.date_format !== undefined && user.localization.date_format.mask !== undefined) {
            $scope.data.dateFormat = _.findWhere($scope.dateFormats, { value: user.localization.date_format.mask });
          }
          var selectedLocaleCode = 'en_US';
          if (typeof user.localization !== 'undefined' && typeof user.localization.locale !== 'undefined') {
            selectedLocaleCode = user.localization.locale;
          }
          $scope.data.locale = _.findWhere($scope.locales, { code: selectedLocaleCode });
          $translate.use(selectedLocaleCode);
          $scope.currentUser = user;
          setDefaultSalesCategories();
          $scope.settingsLoaded = true;
        });
      }

      function compareObjectify(period, index) {
        if (typeof period === 'undefined') {
          return;
        }
        return {
          periodIndex: index,
          id: period.id,
          comparePeriodType: period.value,
          label: '.COMPAREPERIOD',
          comparePeriodWeeks: period.num_weeks,
          customCompareLabel: 'common.CUSTOMCOMPARE',
          displayText: $scope.periodTranslations[returnCompleteTranskey(period.transKey)]
        };
      }

      function returnCompleteTranskey(transKey) {
        return transKey.startsWith('.') ? 'accountView' + transKey : transKey;
      }

      function back() {
        $state.transitionTo('home', {}, {
          reload: true, location: true
        });
      }

      function refresh() {
        $state.transitionTo('account', {
          refreshCache: 'refresh-preferences=1'
        }, { reload: true, notify: true });
      }

      function submitForm(type) {
        if (type === 'preferences') {
          var validateResult = validatePreferencesForm();
          var calendarId = '';
          var weeksAgo = {};
          var customCompare = {};

          localStorageService.set('calendarUpdateFlag', 'true');
          localStorageService.set('selectedDateRanges', {});
          if (!$scope.requestIsPending && validateResult) {

            $scope.settingsLoaded = false;

            $scope.requestIsPending = true;

            var numberSeparators = LocalizationService.getNumberFormatSeparatorsByName($scope.data.numberFormat.name);
            var params = {
              user_id: $scope.currentUserId,
              numberFormatName: $scope.data.numberFormat.name,
              decimal_separator: numberSeparators.decimalSeparator,
              thousands_separator: numberSeparators.thousandsSeparator,
              preferences: {},

              date_format_mask: $scope.data.dateFormat.value,
              locale: $scope.data.locale.code
            };

            params.preferences.weather_reporting = $scope.data.showWeatherMetrics;

            if (!ObjectUtils.isNullOrUndefinedOrBlank($scope.data.calendarId)) {
              calendarId = $scope.data.calendar.calendar_id;
              localStorageService.set('currentCalendarId', calendarId);
            } else {
              calendarId = $scope.data.calendar.calendar_id;
            }

            params.preferences.calendar_id = calendarId;

            params.temperature_format = $scope.data.temperature_format.id;

            params.velocity_format = $scope.data.velocity_format.id;

            params.preferences.default_sales_categories = getDefaultSalesCategories();

            var comparePeriods = angular.copy($scope.comparePeriods);

            _.each(comparePeriods, function (period, index) {
              var periodToPush = {};
              periodToPush.period_type = period.comparePeriodType;
              if (period.id === comparisonsHelper.periodTypes.custom) {
                periodToPush.num_weeks = period.comparePeriodWeeks;
                weeksAgo['compare' + (index + 1)] = period.comparePeriodWeeks;
                customCompare['compare' + (index + 1)] = true;
              }
              params.preferences['custom_period_' + (index + 1)] = periodToPush;
              params.orgId = $state.params.orgId;
            });

            $http.put(apiUrl + '/users/' + $scope.currentUserId, params)
              .then(function (response) {
                const updatedUser = response.data.result[0];

                authService.updateCachedUser(updatedUser);
                currentSalesCategoryService.clearAll();

                if ($scope.data.loadedShowWeatherMetrics !== $scope.data.showWeatherMetrics) {
                  var weatherAction = $scope.data.showWeatherMetrics ? 'on' : 'off';
                  googleAnalytics.trackUserEvent('weather', weatherAction);
                }

                $scope.preferencesFormHasBeenSubmitted = true;
                $scope.requestIsPending = false;
                LocalizationService.setWeeksAgo(weeksAgo);
                LocalizationService.setCustomCompareSetting(customCompare);
                dateRangeService.clearCache();

                $translate.use(params.locale).then(function() {
                  ExportService.setTranslations();
                });

                $timeout(function () {
                  $scope.preferencesFormHasBeenSubmitted = false;
                  refresh();
                }, 1000);
              })
              .catch(function(error) {
                console.error(error);
              });

          }
        }
        else if (type === 'password') {
          if (!$scope.requestIsPending && validatePasswordForm()) {
            $scope.requestIsPending = true;
            authService.changePassword($scope.credentials.password)
              .then(handleFormSubmission, handleFormSubmissionError);
            $scope.credentials.password = '';
            $scope.credentials.passwordConfirmation = '';
          }
        }
      }

      function validatePasswordForm() {
        $scope.errorMessages = [];
        if ($scope.credentials.password.length < 8) {
          $scope.errorMessages.push(getDisplayMessage('.VALIDATIONMESSAGES.PASSWORDLENGTH'));
        } else if ($scope.credentials.password !== $scope.credentials.passwordConfirmation) {
          $scope.errorMessages.push(getDisplayMessage('.VALIDATIONMESSAGES.PASSWORDMATCH'));
        }
        return $scope.errorMessages.length === 0;
      }

      function validatePreferencesForm() {
        $scope.preferencesErrorMessages = [];

        if ($scope.currentUserId === null) {
          $scope.preferencesErrorMessages.push(getDisplayMessage('ERRORMESSAGES.AUTHENTICATION'));
          return false;
        }

        if (typeof ($scope.data.calendar.calendar_id * 1) !== 'number') {
          $scope.preferencesErrorMessages.push(getDisplayMessage('.VALIDATIONMESSAGES.CHOOSECALENDAR'));
          return false;
        }

        var comparePeriods = angular.copy($scope.comparePeriods);
        _.each(comparePeriods, function (period, index) {
          var hasWeeks = (period.comparePeriodWeeks > 0);
          if (period.id === comparisonsHelper.periodTypes.custom && !hasWeeks) {
            $scope.preferencesErrorMessages.push(getDisplayMessage('.VALIDATIONMESSAGES.VALIDNOOFWEEKS') + (index + 1));
            return false;
          }
        });

        if (isDuplicatePeriodSelection()) {
          $scope.preferencesErrorMessages.push(getDisplayMessage('.VALIDATIONMESSAGES.UNIQUENUMBEROFWEEKS'));
          return false;
        }

        if (typeof $scope.data.locale === 'undefined' || $scope.data.locale === null) {
          $scope.preferencesErrorMessages.push('Choose Language.');
          return false;
        }

        return $scope.preferencesErrorMessages.length === 0;
      }

      function isDuplicatePeriodSelection() {
        var groupedPeriodCounts = _.countBy($scope.comparePeriods, function (period) {
          return period.comparePeriodType;
        });
        if (typeof groupedPeriodCounts !== 'undefined') {
          if (groupedPeriodCounts.custom > 1) {
            var sameWeekCustomPeriods = _.countBy($scope.comparePeriods, function (period) {
              return period.comparePeriodWeeks;
            })[_.findWhere($scope.comparePeriods, { comparePeriodType: 'custom' }).comparePeriodWeeks];
            return sameWeekCustomPeriods > 1;
          } else {
            var groupedValues = _.values(groupedPeriodCounts);
            var dupesFound = _.reject(groupedValues, function (value) { return value < 2; });
            if (typeof dupesFound === 'undefined') {
              return false;
            } else {
              return dupesFound.length > 0;
            }
          }
        }
        return false;
      }

      function handleFormSubmission() {
        $scope.credentials.password = '';
        $scope.credentials.passwordConfirmation = '';
        $scope.credentials.formHasBeenSubmitted = true;
        $scope.requestIsPending = false;
      }

      function handleFormSubmissionError() {
        $scope.requestIsPending = false;
        $scope.errorMessages.push(getDisplayMessage('.ERRORMESSAGES.PASSWORDCHANGEERROR'));
      }

      function loadTranslations() {
        $scope.periodTranslations = {};

        $translate.use($scope.language).then(function() {

          var periodTransKeys = _.map(comparisons, function (period) {
            return returnCompleteTranskey(period.transKey);
          });

          $translate(periodTransKeys).then(function (translations) {
            $scope.periodTranslations = translations;
          });

          var validationTranskeys = _.map(validationMessages, function (key) {
            return returnCompleteTranskey(key);
          });

          var errorTranskeys = _.map(errorMessages, function (key) {
            return returnCompleteTranskey(key);
          });

          $translate(validationTranskeys.concat(errorTranskeys)).then(function (translations) {
            $scope.displayMessages = translations;
          });

          loadOrgDefaultTranslation();
          getWeatherTranslations();
        });
      }

      function getDisplayMessage(partialKey) {
        return $scope.displayMessages[returnCompleteTranskey(partialKey)];
      }

      function loadAvailableCalendars() {
        var deferred = $q.defer();
        LocalizationService.getAllCalendars().then(function (response) {
          var calendars = _.union(
            [$scope.defaultCalendar],
            [$scope.standardGregorianSunday],
            [$scope.standardGregorianMonday],
            response.result
          );
          deferred.resolve(calendars);
        }).catch(error => {
          deferred.reject(error);
        });
        return deferred.promise;
      }

      function toggleComparePeriodDetails(id) {
        $scope.compareRangeIsYear[id] = !$scope.compareRangeIsYear[id];
      }

      function getAllAvailableLanguages() {
        return fsHelper.getListOfAvailableLanguages();
      }

      function clearCache() {
        requestManager.clearCache();

        //Clear out the calendar entry also.
        localStorageService.remove('calendars');

        $scope.cacheClearedOk = true;
      }

      function getDefaultSalesCategories() {
        let defaultSalesCategories = {};

        _.each($scope.defaultSalesCategories, salesCat => {
          defaultSalesCategories[salesCat.orgId] = salesCat.defaultSalesCategory.id
        });

        return defaultSalesCategories;
      }
    }]);
