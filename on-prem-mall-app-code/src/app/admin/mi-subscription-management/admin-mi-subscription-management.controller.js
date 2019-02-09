(function () {
  'use strict';

  angular.module('shopperTrak')
  .controller('AdminMiSubscriptionController', AdminMiSubscriptionController);

  AdminMiSubscriptionController.$inject = [
    '$scope',
    '$state',
    '$stateParams',
    '$translate',
    '$rootScope',
    '$q',
    '$timeout',
    'ObjectUtils',
    'adminOrganizationsData',
    'MarketIntelligenceAdminSubscriptionResource',
    'adminMIData'
  ];

  function AdminMiSubscriptionController($scope, $state, $stateParams, $translate, $rootScope, $q, $timeout, ObjectUtils, adminOrganizationsData, MarketIntelligenceAdminSubscriptionResource, adminMIData) {

    var vm = this;
    var translation = {};
    var subscriptionStatus = {
      active : 'active',
      enabled : 'enabled',
      disabled : 'disabled'
    };
    var checkNoGeoSubscribedCount = 0;
    var currentOrgSubscriptionStatus;
    var defaultMarketIntelligenceAdminSubscription;

    activate();

    function activate() {
      vm.loading = true;
      var translationsArray = ['ACTIVE', 'DISABLED', 'ENABLED', 'SUBSCRIPTIONFOR', 'CATEGORY'];
      getMiAdminTransalations(translationsArray)
      .then(function (translations) {
        vm.translations = translations;
        getOrgData()
          .then(function (res) {
            vm.organization = res;
            loadAdminSubscriptions();
          })
          .catch(function (error) {
            console.error(error);
          });
      })
      .catch(function (error) {
        console.error(error);
      });

      vm.inlineOptions = {
        minDate: new Date(),
        showWeeks: true
      };
      vm.dateOptions = {
        formatYear: 'yy',
        startingDay: 1,
        maxMode: 'day'
      };
      vm.formats = ['dd MMMM yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
      vm.format = vm.formats[0];
      vm.altInputFormats = ['M!/d!/yyyy'];
      vm.startDatePopUp = {
        opened: false
      };
      vm.endDatePopUp = {
        opened: false
      };
      vm.today = today();

      vm.startDateCalendar = startDateCalendar;
      vm.endDateCalendar = endDateCalendar;
      vm.hideCategory = '';

      configureWatches();
      buildSubscriptionCategories();

      vm.removeSubscription = removeSubscription;
      vm.saveAndCloseEditOrgSubscription = saveAndCloseEditOrgSubscription;
      vm.checkedItem = {isCountrySelected: [], isRegionSelected: [], isMetroSelected: []};
      vm.checkedEditItem = {isCountrySelected: [], isRegionSelected: [], isMetroSelected: []};
    }

    function showError(error) {
      console.error(error);
      vm.loading = false;
    }

    function checkNoGeoSubscribed(passedSubscriptions) {

      if(!_.isUndefined(passedSubscriptions)){
        _.each(passedSubscriptions.subscriptionNodes, function (eachNode, index) {
          var noGeoRows = [];
          _.each(eachNode.geographyNode.children, function (country) {
            noGeoRows.push(country.subscribed);
            _.each(country.children, function (region) {
              noGeoRows.push(region.subscribed);
              _.each(region.children, function (metro) {
                noGeoRows.push(metro.subscribed);
              })
            })
          });

          if (_.contains(noGeoRows, true)) {
            passedSubscriptions.subscriptionNodes[index].hide = false;
            checkNoGeoSubscribedCount++;
          }
          else {
            passedSubscriptions.subscriptionNodes[index].hide = true;
          }
        });
      }
    }

    function parseAdminSubscriptions(subscriptions) {
      vm.addMiDataset = addMiDataset;
      vm.removeMiDataset = removeMiDataset;
      vm.marketIntelligenceAdminSubscription =  angular.copy(subscriptions);
      getCurrentOrgSubscriptionStatus();
      validateSubscriptionSatus();
      defaultMarketIntelligenceAdminSubscription = angular.copy(vm.marketIntelligenceAdminSubscription);
      vm.loading = false;
    }

    function getCurrentOrgSubscriptionStatus() {
      if (_.has(vm.organization,'status_subscriptions') &&
        _.has(vm.organization.status_subscriptions,'market_intelligence') &&
        !_.isEmpty(vm.organization.status_subscriptions.market_intelligence)) {
        currentOrgSubscriptionStatus = _.last(vm.organization.status_subscriptions.market_intelligence).status;
      } else {
        currentOrgSubscriptionStatus = subscriptionStatus.disabled;
      }
    }

    $scope.$on('added', function () {
      $timeout(function () {
        validateSubscriptionSatus();
        defaultMarketIntelligenceAdminSubscription = angular.copy(vm.marketIntelligenceAdminSubscription);
      });
    });

    function loadAdminSubscriptions() {
      return MarketIntelligenceAdminSubscriptionResource.search({
        orgId: $stateParams.orgId
      })
      .then(parseAdminSubscriptions)
      .catch(showError)
    }

    function getMiAdminTransalations(passedTranslationsArray) {
      var deferred = $q.defer();
      var miAdminTransKeys = [];
      var adminNamespace = 'marketIntelligence.ADMIN';

      _.each(passedTranslationsArray, function (item) {
        miAdminTransKeys.push(adminNamespace + '.' + item);
      });

      $translate(miAdminTransKeys).then(function (translations) {
        _.each(passedTranslationsArray, function (item, index) {
          translation[item.toLowerCase()] = translations[miAdminTransKeys[index]]
        });
        deferred.resolve(translation);
      });

      return deferred.promise;
    }

    function getOrgData() {
      var deferred = $q.defer();
      adminOrganizationsData.getOrganization($stateParams.orgId)
      .then(function (data) {
        deferred.resolve(data);
      })
      .catch(function (error) {
        deferred.reject(error);
      });
      return deferred.promise;
    }

    function today() {
      if (!ObjectUtils.isNullOrUndefined($stateParams.startDate) &&
        !ObjectUtils.isNullOrUndefined($stateParams.endDate)) {
        vm.startDate = moment($stateParams.startDate).toDate();
        vm.endDate = moment($stateParams.endDate).toDate();
      }
    }

    function startDateCalendar() {
      vm.startDatePopUp.opened = true;
    }

    function endDateCalendar() {
      vm.endDatePopUp.opened = true;
    }


    function dateDifference(start, end) {
      return start.diff(end, 'days');
    }

    function configureWatches() {
      var watches = [];

      watches.push($scope.$watchCollection('[vm.startDate,vm.endDate]', function (value) {
        vm.noOfDays = -dateDifference(moment(value[0]), moment(value[1]));
        if (vm.noOfDays < 0) {
          vm.dayErrorMessage = true;
        }
        else {
          vm.dayErrorMessage = false;
        }
      }, true));

      $scope.$on('$destroy', function () {
        _.each(watches, function (unbindFunction) {
          if (angular.isFunction(unbindFunction)) {
            unbindFunction();
          }
        });
      });
    }

    function addMiDataset(index, mode, sub) {
      if (mode === 'edit') {
          _.each(sub.geographyNode.children, function (country) {
            if (country.subscribed) {
              vm.checkedEditItem.isCountrySelected.push(country.name)
            }
            _.each(country.children, function (region) {
              if (region.subscribed) {
                vm.checkedEditItem.isRegionSelected.push(region.name)
              }
              _.each(region.children, function (metro) {
                if (metro.subscribed) {
                  vm.checkedEditItem.isMetroSelected.push(metro.name)
                }
              })
            })
          });
      }

      var element = angular.element('#miDatasetModal');
      if (element !== null) {
        element.modal('show');
        vm.selectedIndex = index;
        vm.miAdminDataSetMode = mode;

        if (!ObjectUtils.isNullOrUndefined(sub)) {
          vm.adminSubscription = sub;
          return
        }

        vm.adminSubscription = angular.copy(vm.marketIntelligenceAdminSubscription);

        vm.adminSubscriptionAddMode = angular.copy(vm.marketIntelligenceAdminSubscription);

        checkNoGeoSubscribed(vm.adminSubscriptionAddMode);
        if (mode === 'add') {
          _.each(vm.adminSubscriptionAddMode.subscriptionNodes, function (item) {
            item.geographyNode.subscribed = false;
            _.each(item.geographyNode.children, function (country) {
              country.subscribed = false;
              _.each(country.children, function (region) {
                region.subscribed = false;
                _.each(region.children, function (metro) {
                  metro.subscribed = false;
                })
              })
            });
          });
        }

      }
    }

    $scope.$on('cancelmodel', function (event, data) {
      if (data === 'add') {
        if (!_.isUndefined(vm.adminSubscriptionAddMode) && !_.has(vm.adminSubscriptionAddMode, 'subscriptionNodes')) {
          _.each(vm.adminSubscriptionAddMode.geographyNode.children, function (country) {
            country.subscribed = false;
            _.each(country.children, function (region) {
              region.subscribed = false;
              _.each(region.children, function (metro) {
                metro.subscribed = false;
              })
            })
          });
        }
        return;
      }
      vm.marketIntelligenceAdminSubscription = angular.copy(defaultMarketIntelligenceAdminSubscription);
    });

    function removeMiDataset(selectedIndex, mode, selectedSub) {
      vm.selectedDataset = ' ' + vm.translations.subscriptionfor + ' ' + selectedSub.category.name + ' ' + vm.translations.category + ' ';
      vm.selectedIndex = selectedIndex;
      vm.selectedSub = selectedSub;

      $('#confirmation-modal').modal({
        show: true,
        focus: true
      });
    }

    $rootScope.$on('$stateChangeSuccess', function (ev, to, toParams, from) {
      $rootScope.previousState = from.name;
    });

    function removeSubscription(index, sub) {
      var createEmptyRow = [];
      _.each(sub.geographyNode.children, function (country) {
        country.subscribed = false;
        createEmptyRow.push(country.subscribed);
        _.each(country.children, function (region) {
          region.subscribed = false;
          createEmptyRow.push(region.subscribed);
          _.each(region.children, function (metro) {
            metro.subscribed = false;
            createEmptyRow.push(metro.subscribed);
          })
        })
      });

      if (!_.contains(createEmptyRow, true)) {
        sub.hide = true;
        vm.hideCategory = sub.category.name
      }
      var subsToUpdateb = angular.copy(vm.marketIntelligenceAdminSubscription);
      var subcopied = angular.copy(sub);
      _.each(subsToUpdateb.subscriptionNodes, function (item, index) {
        delete item['hide'];
        if (item.category.uuid === sub.category.uuid) {
          delete subcopied['hide'];
          subsToUpdateb.subscriptionNodes[index] = subcopied;
        }
      });

      adminMIData.updateSubsciptionTree(subsToUpdateb);
      validateSubscriptionSatus();

      $('#confirmation-modal').modal('toggle');
    }

    function validateSubscriptionSatus(){
      checkNoGeoSubscribedCount = 0;
      checkNoGeoSubscribed(vm.marketIntelligenceAdminSubscription);
      if(currentOrgSubscriptionStatus === subscriptionStatus.active || currentOrgSubscriptionStatus === subscriptionStatus.enabled) {
        if(checkNoGeoSubscribedCount > 0) {
          vm.subscriptionStatus = vm.translations.active;
          vm.subscritpionStatusName = subscriptionStatus.active;
        } else {
          vm.subscriptionStatus = vm.translations.enabled;
          vm.subscritpionStatusName = subscriptionStatus.enabled;
        }
      } else {
        vm.subscriptionStatus = vm.translations.disabled;
        vm.subscritpionStatusName = subscriptionStatus.disabled;
      }
      if(currentOrgSubscriptionStatus !== vm.subscritpionStatusName) {
        saveAndCloseEditOrgSubscription(false);
        currentOrgSubscriptionStatus = vm.subscritpionStatusName;
      }
    }

    function buildSubscriptionCategories() {
      vm.subscribedCategories = [];
      vm.subscriptionArray = [];
      _.each(vm.marketIntelligenceAdminSubscription, function (item) {
        vm.subscribedCategories.push(item.category);
      });
    }

    function saveAndCloseEditOrgSubscription(closeEditOrg) {
      var startDateMoment = moment().set({'year': vm.startDate.getFullYear(), 'month': vm.startDate.getMonth(), 'date': vm.startDate.getDate()});
      var endDateMoment = moment().set({'year': vm.endDate.getFullYear(), 'month': vm.endDate.getMonth(), 'date': vm.endDate.getDate()});
      var params = {
        status_subscriptions: {
          market_intelligence: [
            {
              'start': moment.utc(startDateMoment),
              'end': moment.utc(endDateMoment),
              'status': vm.subscritpionStatusName
            }
          ]
        }
      };
      adminOrganizationsData.updateSettings(vm.organization.organization_id, params)
        .then(function () {
          if(closeEditOrg) {
            $state.go('admin.misubscriptionpage');
          }
        })
        .catch(function (error) {
          console.error(error);
        });
    }
  }
})();
