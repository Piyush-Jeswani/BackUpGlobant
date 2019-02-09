(() => {
  angular.module('shopperTrak')
  .controller('AdminMiPageController', AdminMiPageController);

  AdminMiPageController.$inject = [
    '$scope',
    '$state',
    '$translate',
    '$q',
    'ObjectUtils',
    'adminOrganizationsData',
    '$filter'
  ];

  function AdminMiPageController(
    $scope,
    $state,
    $translate,
    $q,
    ObjectUtils,
    adminOrganizationsData,
    $filter
  ) {
    const vm = this;
    const translation = {};

    activate();

    function activate() {

      // Important! To keep translations namespace in camelCase format
      // Add translationsArray items in "EXPORT BILLING CSV" format
      const translationsArray = [
        'ALL',
        'ACTIVE',
        'ENABLED',
        'DISABLED',
        'EXPORT BILLING CSV',
        'BILLING EXPORT',
        'ORGANIZATION',
        'ORGANIZATION ID',
        'SUBSCRIPTION STATUS',
        'REPORT RUN'
      ];

      getMiAdminTranslations(translationsArray).then(translations => {
        vm.translations = translations;
        configureStatusDropdown();
        loadOrganizations();
        configureWatches();
      })
      .catch(error => {
        console.error(error);
      });

      vm.loading = false;
      vm.orgsearch = '';
      vm.sortBy = 'name';
      vm.organizations = [];
      vm.filteredOrganizations = [];
      vm.status = {};
      vm.csvExport = {
        fileName: `billing-export-${moment().format('YYYYMMDDHHmmss')}`,
        dataObj: {}
      };
      vm.isReversed = {
        'name': false,
        'type': false
      };
      vm.exportReady = false;

      vm.sortOrganizationData = sortOrganizationData;
      vm.editMiAdmin = editMiAdmin;
      vm.filterBySelection = filterBySelection;
      vm.onCSVExport = onCSVExport;
    }

    function configureStatusDropdown() {
      vm.status.options = [{
        name: vm.translations.all,
        slug: 'all'
      }, {
        name: vm.translations.active,
        slug: 'active'
      }, {
        name: vm.translations.enabled,
        slug: 'enabled'
      }, {
        name: vm.translations.disabled,
        slug: 'disabled'
      }];
      vm.status.locale = _.findWhere(vm.status.options, { slug: 'active' });
      updateStatusLocalName();
    }

    function updateStatusLocalName() {
      vm.statusLocalName = vm.status.locale.slug;
    };

    function translateOrgStatus(status) {
      if(!ObjectUtils.isNullOrUndefined(status)) {
        return vm.translations[status.toLowerCase()];
      }
    };

    function getMiAdminTranslations(passedTranslationsArray) {
      const deferred = $q.defer();
      const miAdminTransKeys = [];
      const adminNamespace = 'marketIntelligence.ADMIN';

      _.each(passedTranslationsArray, item => {
        const truncatedString = item.replace(/\s/g,'');
        miAdminTransKeys.push(`${adminNamespace}.${truncatedString}`);
      });

      $translate(miAdminTransKeys).then(translations => {
        _.each(passedTranslationsArray, (item, index) => {
          translation[$filter('camelCase')(item)] = translations[miAdminTransKeys[index]]
        });
        deferred.resolve(translation);
      });
      return deferred.promise;
    }

    function loadOrganizations() {
      vm.loading = true;

      adminOrganizationsData.fetchOrganizations(false).then(orgs => {
        vm.loading = false;
        vm.subscriptionSet = [];
        _.each(orgs, item => {
          if (!ObjectUtils.isNullOrUndefined(item.status_subscriptions)) {
            if (Array.isArray(item.status_subscriptions.market_intelligence) && item.status_subscriptions.market_intelligence.length > 0) {
              try {
                const miSubscription = _.last(item.status_subscriptions.market_intelligence);
                vm.organizations.push(
                  {
                    id: item.id,
                    default_calendar_id: item.default_calendar_id,
                    name: item.name,
                    type: item.type,
                    market_intelligence_status: translateOrgStatus(miSubscription.status),
                    market_intelligence_start: miSubscription.start,
                    market_intelligence_end: miSubscription.end,
                    subscriptions: item.subscriptions,
                    updated: item.updated
                  }
                )
              }
              catch (err) {
                console.error(err);
              }
            }
          }
        });
        filterBySelection();
        sortOrganizationData('name');
      }).catch(error => {
        console.error(error);
      });
    }

    function filterBySelection() {
      const sourceArray = angular.copy(vm.organizations);
      const statusDropdown = vm.status.locale.slug === 'all' ? '' : vm.status.locale.slug;

      vm.filteredOrganizations = $filter('filter')(sourceArray, { name: vm.orgsearch, market_intelligence_status: statusDropdown });
      sortOrganizationData('name');
    };

    function sortOrganizationData(sortByProperty, toggleReverse) {
      if (!ObjectUtils.isNullOrUndefined(toggleReverse) && toggleReverse) {
        vm.isReversed[sortByProperty] = !vm.isReversed[sortByProperty];
      }

      if (vm.isReversed[sortByProperty]) {
        vm.filteredOrganizations = _.sortBy(vm.filteredOrganizations, sortByProperty).reverse();
      } else {
        vm.filteredOrganizations = _.sortBy(vm.filteredOrganizations, sortByProperty);
      }
    }

    function editMiAdmin(orgId, startDate, endDate) {
      $state.go('admin.misubscriptionmanagement', {
        orgId,
        startDate: moment(startDate).format(),
        endDate: moment(endDate).format()
      });
    }

    function collateCSVData(organizations, translations) {
      const organizationsToExport = angular.copy(organizations);
      omitOrganizationsProps(organizationsToExport);
      const nonDemoOrganizations = rejectDemoOrganizations(organizationsToExport);
      createExportTable(nonDemoOrganizations, translations, vm.csvExport.dataObj);
    }

    function createExportTable(organizations, translations, table) {
      createTableHeader(table, translations);
      createCsvColumnHeaders(table, translations);
      createTableCells(table, organizations);
      return table;
    }

    function createTableHeader(table, translations) {
      table.header = [[translations.billingExport]];
      table.header.push([`${translation.reportRun}${$filter('date')(moment().format(), 'MMM d, y')}`])
    }

    function createCsvColumnHeaders(table, translations) {
      table.columnHeaders = [translations.organizationId, translations.organization, translations.subscriptionStatus];
    }

    function createTableCells(table, organizations) {
      table.rows = [];
      _.each(organizations, currentOrganization => {
        table.rows.push([currentOrganization.id, currentOrganization.name, currentOrganization.subscriptionStatus]);
      });
    }

    function omitOrganizationsProps(organizations) {
      _.each(organizations, (currentOrg, index) => {
        const dateStart = $filter('date')(currentOrg.market_intelligence_start, 'MMM d, y');
        const dateEnd = $filter('date')(currentOrg.market_intelligence_end, 'MMM d, y');
        organizations[index] = {
          id: currentOrg.id,
          name: currentOrg.name,
          subscriptionStatus: `${$filter('capitalize')(currentOrg.market_intelligence_status)} (${dateStart} - ${dateEnd})`
        };
      });
    }

    function rejectDemoOrganizations(organizations) {
      return _.reject(organizations, currentOrg => currentOrg.id > 1000000000 && currentOrg.id < 2000000000);
    }

    function onCSVExport(filteredOrganizations) {
      collateCSVData(filteredOrganizations, vm.translations);
    }

    function configureWatches() {
      const watches = [];

      watches.push($scope.$watchGroup(['vm.orgsearch', 'vm.status.locale'], (newGroup, oldGroup) => {
        filterBySelection();
        if (!angular.equals(newGroup[1], oldGroup[1])) {
          updateStatusLocalName();
        }
      }));

      $scope.$on('$destroy', () => {
        _.each(watches, unbindFunction => {
          if (angular.isFunction(unbindFunction)) {
            unbindFunction();
          }
        });
      });
    }
  }
})();
