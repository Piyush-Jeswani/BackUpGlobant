(function () {
  'use strict';

  angular.module('shopperTrak')
  .controller('AdminOrgEditController', AdminOrgEditController);

  AdminOrgEditController.$inject = [
    '$scope',
    '$filter',
    '$state',
    '$q',
    '$timeout',
    '$anchorScroll',
    'ObjectUtils',
    'OrganizationResource',
    'adminOrganizationsData',
    'adminCustomTagsData',
    'currentAdminOrganization',
    'LocalizationService',
    'environmentConfig'
  ];

  function AdminOrgEditController($scope, $filter, $state, $q, $timeout, $anchorScroll, ObjectUtils, OrganizationResource, adminOrganizationsData, adminCustomTagsData, currentAdminOrganization, LocalizationService, environmentConfig) {

    var edit = this;
    edit.orgId = $state.params.orgId;

    activate();

    function activate() {

      initScope();

      // We need to re-load the current org on each page as we are on the org edit page.
      // We cannot simply re-use the cached org as this will more than likely be stale.
      adminOrganizationsData.getOrganization(currentAdminOrganization.organization_id)
      .then(function (data) {
        updateRefresh(data);
        setOrgUiProperties(data);
      });
    }

    function processTags(tags) {
      var previousTagValue = null;
      var tmpArray = [];

      //reshape the incoming data.
      if (tags !== null) {

        _.filter(tags, function (tag) {

          if (previousTagValue !== tag.tag_type) {
            previousTagValue = tag.tag_type;
            tmpArray.push({
              orgTagType: tag.tag_type,
              orgTagValues: [],
              show_extra: false, //We use this on the UI to allow us to toggle extra info if the user has more than 10 values for the custom tag.
            });
          }

          if (previousTagValue === tag.tag_type) {
            tmpArray[tmpArray.length - 1].orgTagValues.push({
              name: tag.name,
              _id: tag._id,
              tag_type: tag.tag_type,
            });
          }
        });
      }

      return tmpArray;
    }

    function refresh() {
      adminOrganizationsData.getOrganization(edit.id, false).then(function (data) {
        currentAdminOrganization = data;
        updateRefresh(data);
        activate();
      });
    }

    function updateRefresh(data) {
      var refreshStateOnGoing = 'refreshing';
      if (data.refresh_status.status === refreshStateOnGoing) {
        edit.refreshState = refreshStateOnGoing + '...';
      } else {
        edit.refreshState = data.refresh_status.last_refresh_date;
      }
    }


    function createMIsubStatus(sub) {
      if (sub.market_intelligence) {
        return {
          'start': moment().utc(),
          'end': moment().utc(),
          'status': 'active'
        }
      }
      else {
        return {
          'start': moment().utc(),
          'end': moment().utc(),
          'status': 'disabled'
        }
      }
    }

    function saveChanges(dwellTimeForm, powerHoursForm) {
      if ((dwellTimeForm.$valid === false && dwellTimeForm.$dirty) || (powerHoursForm.$valid === false && powerHoursForm.$dirty)) {
        if (dwellTimeForm.$valid) {
          edit.inValidatedPowerHour = true;
          $timeout(function () {
            edit.inValidatedPowerHour = false;
          }, 4000);
        } else {
          edit.inValidatedDwellTime = true;
          $timeout(function () {
            edit.inValidatedDwellTime = false;
          }, 4000);
        }
        return;
      }

      edit.saveFailed = false;
      edit.errorMessage = '';
      edit.isLoading = true;

      var orgId = edit.id;

      var params = {
        subscriptions: edit.subscriptions,
        dwell_time_threshold: edit.dwell_time_threshold,
        date_format_mask: edit.dateFormat.selectedItem,
        calendarId: edit.calendarFormat.selectedItem,
        timeFormat: edit.timeFormat.selectedItem,
        status_subscriptions: {
          market_intelligence: [createMIsubStatus(edit.subscriptions)]
        },
        power_hours_thresholds: getPowerHoursThresholdForSaving(),
        hide_sales_when_no_traffic: edit.hide_sales_when_no_traffic,
      };

      adminOrganizationsData.updateSettings(orgId, params)
        .then(function (response) {
          currentAdminOrganization = response.data.result[0];
          //We do this to ensure future calls get fresh data - as we have just updated it
          OrganizationResource.clearCache({orgId: orgId});

          edit.isLoading = false;
          edit.saveSuccessful = true;

          //We saved the state of the organisation - now we should update the state of it.
          adminOrganizationsData.getOrganization(edit.id, false).then(function (data) {
            currentAdminOrganization = data;
            updateRefresh(data);
          });

          $anchorScroll();

          $timeout(function () {
            edit.saveSuccessful = false;
          }, 5000);
        })
        .catch(function (result) {
          edit.saveFailed = true;
          edit.isLoading = false;

          if (result) {
            edit.errorMessage = result.data.message;

            $timeout(function () {
              edit.saveFailed = false;
            }, 4000);
          }
          $anchorScroll();
        });
    }

    function cancel() {
      $state.go('admin.organizations');
    }

    function showDeleteCustomTagModal(index) {
      //Store the index.
      edit.customTagDeleteIndex = index;

      var element = angular.element('#customTagDeleteModal');
      if (element !== null) {
        element.modal('show');
      }
    }

    function deleteCustomTagItem() {
      //Check we have something sensible.
      if (!ObjectUtils.isNullOrUndefinedOrEmpty(edit.customTagDeleteIndex) || !ObjectUtils.isNullOrUndefinedOrEmpty(edit.customTags[edit.customTagDeleteIndex])) {
        return;
      } else {

        var deleteCallback = {
          success: function (tags) {
            edit.customTags = processTags(tags);
          },
          failed: function (result) {
            edit.error = true;
            edit.errorMessage = result.statusText;
          }
        };

        var orgTagType = edit.customTags[edit.customTagDeleteIndex].orgTagType;
        adminCustomTagsData.deleteTag(edit.activeOrg.id, orgTagType, deleteCallback);

        // Remove the item from the array.
        edit.customTags.splice(edit.customTagDeleteIndex, 1);
        edit.customTagDeleteIndex = null;
      }
    }

    function editCustomTagItem(index) {
      edit.customTagMode = 'Modify';
      edit.customTagIndex = index;
      edit.customTag = edit.customTags[index];
      var element = angular.element('#customTagCreateModal');
      if (element !== null) {
        element.modal('show');
      }
    }

    function addCustomTag() {
      edit.customTagMode = 'Create';
      var element = angular.element('#customTagCreateModal');
      if (element !== null) {
        element.modal('show');
      }
    }

    function updateTag(tag, index) {

      var customTagCallback = {
        success: function (tags) {
          edit.customTags = processTags(tags);
        },
        failed: function (result) {
          edit.error = true;
          edit.errorMessage = result.statusText;
        }
      };

      if (!ObjectUtils.isNullOrUndefined(index)) {
        //We are updating an item.
        adminCustomTagsData.updateTag(edit.id, tag, customTagCallback);
      } else {
        adminCustomTagsData.addTag(edit.id, tag, customTagCallback);
      }
    }

    function reverseTable() {
      edit.sortReverse = !edit.sortReverse;
      edit.customTags.reverse();
    }

    function transformOrganizationData(org) {
      if (ObjectUtils.isNullOrUndefined(org.status_subscriptions)) {
        org.status_subscriptions = {
          market_intelligence: [
            {
              status: 'disabled'
            }
          ]
        }
      }
      return {
        id: org.organization_id,
        name: org.name,
        type: org.portal_settings && org.portal_settings.organization_type,
        subscriptions: org.subscriptions,
        dwell_time_threshold: org.dwell_time_threshold,
        localization: org.localization,
        default_calendar_id: org.default_calendar_id,
        updated: new Date(org.updated).toLocaleDateString(), //ToDo: Use moment
        status_subscriptions: org.status_subscriptions,
        power_hours_thresholds: org.power_hours_thresholds
      };
    }

    function goToMiSubscription(val, obj) {
      if (obj.status === 'active' || obj.status === 'enabled' && val) {
        $state.go('admin.misubscriptionmanagement', {
          orgId: currentAdminOrganization.organization_id,
          startDate: moment(obj.start).format('YYYY-MM-DD'),
          endDate: moment(obj.end).format('YYYY-MM-DD')
        });
      }
    }

    function uploadCustomTags(files) {

      edit.tagImportFailed = false;

      if (files) {
        if (!ObjectUtils.isNullOrUndefined(files)) {
          var file = files[0];

          if (file) {

            var filetype = file.name.split('.').pop().trim();

            if (filetype !== 'csv') {
              return;
            }

            //Let the user know we are doing something.....
            edit.loading = true;
            $scope.$digest();

            var callback = {
              success: function (result) {
                edit.customTags = processTags(result.data.result[0].orgCustomTags);
                edit.loading = false;
                edit.tagImportSuccesful = true;
                edit.successMessage = 'Custom Tags successfully imported';

                $timeout(function () {
                  edit.tagImportSuccesful = false;
                }, 5000);
              },
              failed: function (error) {
                edit.loading = false;
                edit.tagImportFailed = true;
                edit.tagImportSuccesful = false;
                edit.failedMessage = error.data.message;
              }
            };

            //Ok time to upload....
            adminCustomTagsData.uploadCustomTags($state.params.orgId, file, callback);
          }
        }
      }
    }

    /**
     * Sets various UI properties associated with the org
     * Should be called in the loading stage of the page after the current org has been loaded
     * @param {object} org The current org
     */
    function setOrgUiProperties(org) {
      edit.activeOrg = transformOrganizationData(org);
      edit.id = edit.activeOrg.id;
      edit.name = edit.activeOrg.name;
      edit.type = edit.activeOrg.type;
      edit.default_calendar_id = edit.activeOrg.default_calendar_id;
      edit.status_subscriptions = edit.activeOrg.status_subscriptions;
      edit.hide_sales_when_no_traffic = org.hide_sales_when_no_traffic;

      adminOrganizationsData.getOrganizationCalendars(edit.activeOrg.id)
      .then(function (calendars) {
        var calendarItems = calendars
        .map(function (cal) {
          return {
            value: cal.calendar_id,
            label: cal.name
          };
        })
        .sort(function (a, b) {
          return a.label.toLowerCase() < b.label.toLowerCase() ? -1 : 1;
        });

        //Add the two 'bespoke' options
        calendarItems.push({
          label: 'Standard Gregorian Sunday',
          value: LocalizationService.getStandardGregorianSundayCalendarId()
        });

        calendarItems.push({
          label: 'Standard Gregorian Monday',
          value: LocalizationService.getStandardGregorianMondayCalendarId()
        });

        var defaultCalIndex = _.findIndex(calendarItems, function (cal) {
          return cal.value === edit.default_calendar_id;
        });

        // Set default calendar to 1 if it's not part of the Organization calendars
        if (defaultCalIndex === -1)
          edit.default_calendar_id = 1;

        edit.calendarFormat = {
          selectedItem: edit.default_calendar_id,
          items: calendarItems
        };
      });

      edit.refreshDisplayFormat = LocalizationService.getCurrentDateFormat(edit.activeOrg.id);
      setDwellTimeThresholds(edit.activeOrg);
      setDateFormat(edit.activeOrg);
      setTimeFormat(edit.activeOrg);
      initCustomTags(edit.activeOrg);
      setPowerHoursThresholds(edit.activeOrg);
      edit.activeOrg.subscriptions.market_intelligence = isCurrentOrgMISubscribed(edit.activeOrg);
      setSubscriptionInfo(edit.activeOrg);
    }

    function isCurrentOrgMISubscribed(activeOrg) {
      if (_.has(activeOrg,'status_subscriptions') &&
        _.has(activeOrg.status_subscriptions,'market_intelligence') &&
        !_.isEmpty(activeOrg.status_subscriptions.market_intelligence)) {
        var status = _.last(activeOrg.status_subscriptions.market_intelligence).status;
        return  status === 'active' || status === 'enabled' ? true : false;
      } else {
        return false;
      }
    }



    /**
     * Sets the subscription info based on the current org
     * Should be called in the loading stage of the page
     * @param {object} org The current org
     */
    function setSubscriptionInfo(org) {
      var subscriptions = {
        'advanced': false,
        'campaigns': false,
        'consumer_behavior': false,
        'interior': false,
        'labor': false,
        'large_format_mall': false,
        'market_intelligence': false,
        'perimeter': false,
        'qlik': false,
        'realtime_labor': false,
        'realtime_sales': false,
        'realtime_traffic': false,
        'sales': false
      };

      edit.subscriptions = angular.extend(subscriptions, org.subscriptions);

    }

    /**
     * Sets the dwell time thresholds based on the current org
     * Should be called in the loading stage of the page
     * @param {object} org The current org
     */
    function setDwellTimeThresholds(org) {
      var dwell_time_threshold = {
        shoppers_vs_others: null,
        usage_of_areas: {
          default_value: null,
          first_visits: null,
          locations_after: null,
          locations_before: null,
          one_and_done: null,
          traffic_percentage_correlation: null
        }
      };

      edit.dwell_time_threshold = angular.extend(dwell_time_threshold, org.dwell_time_threshold);
    }

    /**
     * Sets the date format
     * Should be called in the loading stage of the page
     * @param {object} org The current org
     */
    function setDateFormat(org) {
      if (!ObjectUtils.isNullOrUndefined(org.localization.date_format) && !ObjectUtils.isNullOrUndefined(org.localization.date_format.mask)) {
        edit.dateFormat.selectedItem = org.localization.date_format.mask;
      } else {
        edit.dateFormat.selectedItem = 'M/D/YY';
      }
    }

    function setTimeFormat(org) {
      if (!ObjectUtils.isNullOrUndefined(org.localization.time_format) && !ObjectUtils.isNullOrUndefined(org.localization.time_format.format)) {
        edit.timeFormat.selectedItem = org.localization.time_format.format;
      } else {
        edit.timeFormat.selectedItem = '12';
      }
    }

    /**
     * Initializes custom tags.
     * Should be called in the loading stage of the page
     * @param {object} org The current org
     */
    function initCustomTags(org) {
      edit.customTags = [];

      var getOrgCustomTagsCallback = {
        success: function (tags) {
          edit.customTags = processTags(tags);
        },
        failed: function (result) {
          edit.error = true;
          edit.errorMessage = result.statusText;
        }
      };

      adminCustomTagsData.getAllTags(org.id, getOrgCustomTagsCallback);
    }

    /**
     * Initializes the scope.
     * Sets scoped properties to their defaults, and makes functions available to the scope
     *
     */
    function initScope() {

      edit.saveSuccessful = false;
      edit.saveFailed = false;
      edit.errorMessage = '';
      edit.successMessage = '';
      edit.tagImportSuccesful = false;
      edit.onlyPositiveNumbers = /^\d+$/;
      edit.refreshState = '';
      edit.loading = false;
      edit.showExtraTags = [];
      edit.deleteMessage = 'Deleting tags at the Organisation level will also delete these tags at Site level.';
      edit.csvImportErrorMessage = '';
      edit.csvImportDownloadErrors = false;

      //Turn on the AdminUI feature....
      edit.adminUIUpgrade = true;

      edit.miAdmin = true;
      edit.dateFormat = {
        items: [{
          value: 'M/D/YY',
          label: 'M/D/YY (' + $filter('date')(Date.now(), 'M/d/yy') + ')'
        },
          {
            value: 'DD/MM/YYYY',
            label: 'DD/MM/YYYY (' + $filter('date')(Date.now(), 'dd/MM/yyyy') + ')'
          },
          {
            value: 'D.M.YYYY',
            label: 'D.M.YYYY (' + $filter('date')(Date.now(), 'd.M.yyyy') + ')'
          },
          {
            value: 'YYYY-MM-DD',
            label: 'YYYY-MM-DD (' + $filter('date')(Date.now(), 'yyyy-MM-dd') + ')'
          },
          {
            value: 'MM/DD/YYYY',
            label: 'MM/DD/YYYY (' + $filter('date')(Date.now(), 'MM/dd/yyyy') + ')'
          }
        ]
      };

      edit.timeFormat = {
        items: [
          {
            value: '12',
            label: '12 Hour'
          },
          {
            value: '24',
            label: '24 Hour'
          }]
      }

      edit.cancel = cancel;
      edit.saveChanges = saveChanges;
      edit.showDeleteCustomTagModal = showDeleteCustomTagModal;
      edit.deleteCustomTagItem = deleteCustomTagItem;
      edit.reverseTable = reverseTable;
      edit.addCustomTag = addCustomTag;
      edit.editCustomTagItem = editCustomTagItem;
      edit.updateTag = updateTag;
      edit.refresh = refresh;
      edit.uploadCustomTags = uploadCustomTags;
      edit.goToMiSubscription = goToMiSubscription;
      edit.clearHazelCache = clearHazelCache;
    }

    /**
     * Maps the organization's power hours settings to the org
     * @param {object} org The current org
     */
    function setPowerHoursThresholds(org) {
      var lowerDefault = 0.5;
      var upperDefault = 1.5;

      if(ObjectUtils.isNullOrUndefined(org)) {
        return;
      }

      if(ObjectUtils.isNullOrUndefined(org.power_hours_thresholds)) {
        edit.powerHoursLower = lowerDefault;
        edit.powerHoursUpper = upperDefault;
        return;
      }

      edit.powerHoursLower = loadPowerHoursThresholdsFromOrg(org.power_hours_thresholds, 'lower', lowerDefault);
      edit.powerHoursUpper = loadPowerHoursThresholdsFromOrg(org.power_hours_thresholds, 'upper', upperDefault);
    }

    /**
     * Safely loads the power hours thresholds from an organization.
     * Multiplies any values on the org mongo object by 100 for nice display on the UI
     * @param {object<organization.power_hours_thresholds>} orgPowerHoursSettings The org's power hours object
     * @param {('lower'|'upper')} threholdPropertyName the name of the property to safely access
     * @param {number} fallbackValue a fallback value. This is not multiplied by 100
     * @returns {number} the power hours threshold to be used in the UI
     */
    function loadPowerHoursThresholdsFromOrg(orgPowerHoursSettings, threholdPropertyName, fallbackValue) {
      if(ObjectUtils.isNullOrUndefined(orgPowerHoursSettings[threholdPropertyName])) {
        return fallbackValue;
      } else {
        var value = Number(orgPowerHoursSettings[threholdPropertyName]) * 100;
        return Math.round(value * 1e2) / 1e2; // Javascript maths capabilities are poor.
      }
    }

    /**
     * Maps power hours thresholds UI settings back to the organization object, ready for saving
     * @returns {object<organization.power_hours_thresholds>} The power hours org settings
     */
    function getPowerHoursThresholdForSaving() {
      return {
        lower: Number(edit.powerHoursLower) / 100,
        upper: Number(edit.powerHoursUpper) / 100
      }
    }

    function clearHazelCache(){
      let orgId = edit.orgId;
      edit.loading = true;
      let env = environmentConfig.getEnvironmentName();
   
      adminOrganizationsData.clearOrgHazelCache(orgId, env)
      .then(()=>{
        edit.loading = false;
        edit.OrgCacheCleared = true;
        edit.error = false;
      }, error => {
        console.error(error.data.message);
        edit.error = true;
        edit.loading = false;
      });
    }

  }
})();
