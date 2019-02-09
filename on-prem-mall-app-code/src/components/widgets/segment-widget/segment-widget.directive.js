((() => {
  angular.module('shopperTrak')
  .directive('segmentWidget', segmentWidget);

  function segmentWidget () {
    return {
      restrict: 'E',
      templateUrl: 'components/widgets/segment-widget/segment-widget.partial.html',
      scope: {
        params: '=?',
        numberFormatName: '=',
        org: '=?',
        onExportClick: '&',
        exportIsDisabled: '=?',

        // The following props are used by the PDF export
        segments: '=?',
        startDate: '=?',
        endDate: '=?',
        compareDateStart: '=?',
        compareDateEnd: '=?',
        orgId: '=?',
        isLoading: '=?',
        firstTimeConfigure:'=?',
        showOrgIndex:'=',
        currentOrganization:'=?',
        currentUser:'=?'

      },
      controller: segmentWidgetController,
      controllerAs: 'vm',
      bindToController: true
    };
  }

  segmentWidgetController.$inject = [
    '$state',
    '$q',
    '$stateParams',
    '$rootScope',
    '$filter',
    'marketIntelligenceService',
    'ObjectUtils',
    'OrganizationResource',
    'dateRangeService',
    'timeperiodConstants',
    'authService'
  ];

  function segmentWidgetController ($state, $q, $stateParams, $rootScope, $filter, marketIntelligenceService, ObjectUtils, OrganizationResource, dateRangeService, timeperiodConstants, authService) {
    let vm = this;
    let mappedSubscriptions;
    activate();

    function activate () {
      initScope();
      if ($rootScope.pdf) {
        authService.getCurrentUser().then((user) => {
          vm.currentUser = user;
          setupParamsForPdf();
        });
      } else {
        loadData();
      }
    }

    function initScope () {
      vm.isLoading = true;
      vm.kpiSegmentsArray = [];
      vm.segmentSettings = segmentSettings;
    }

    function setupParamsForPdf () {
      marketIntelligenceService.getSubscriptions(vm.orgId).then((result) => {
        vm.params = {
          dateStart: moment(vm.startDate.format('YYYY-MM-DD'), 'YYYY-MM-DD'),
          dateEnd: moment(vm.endDate.format('YYYY-MM-DD'), 'YYYY-MM-DD'),
          compareStart: moment(vm.compareDateStart.format('YYYY-MM-DD'), 'YYYY-MM-DD'),
          compareEnd: moment(vm.compareDateEnd.format('YYYY-MM-DD'), 'YYYY-MM-DD'),
          subscriptions: _.map(vm.segments, (segment) => {
            segment.orgId = vm.orgId;
            segment.category = findSubscription(result, segment.category.uuid);
            segment.geography = findSubscription(result, segment.geography.uuid);
            return segment;
          })
        };
        OrganizationResource.get({orgId: vm.orgId}).$promise.then((organization) => {
          vm.org = organization;
          vm.currentOrganization = organization;
          loadData();
        });
      });
    }

    function findSubscription (subscriptions, uuid) {
      if (angular.isUndefined(mappedSubscriptions)) {
        mapSubscriptions(subscriptions);
      }
      return _.findWhere(mappedSubscriptions, { uuid });
    }

    function mapSubscriptions (subscriptions) {
      _.each(subscriptions, (subscription) => {
        subscriptions.push(subscription.category);
        subscriptions.push(subscription.geography);
      });

      mappedSubscriptions = subscriptions;
    }

    function segmentSettings () {
      $state.go('analytics.organization.marketIntelligence.edit');
    }

    function getTrendSummaryData (timeDimensionsArray) {

      let promises = [];

      _.each(timeDimensionsArray, (item) => {
        let deferred = $q.defer();
        marketIntelligenceService.getIndexData(item, vm.showOrgIndex).then((data) => {
          deferred.resolve(data);
        })
        .catch((error) => {
          deferred.resolve(error);
        });
        promises.push(deferred.promise);
      });

      return $q.all(promises);
    }

    function loadData () {
      let requestParams = getRequestParams(vm.params);
      let timeDimensionsArray = [];
      let ranges = {selectedPeriod: {}, comparePeriod1: {}};
      let originalSubscriptions = [];
      _.each(requestParams.subscriptions, (item) => {
        item.timePeriod = _.isUndefined(item.timePeriod) ? 'none' : item.timePeriod.toLowerCase();
        vm.periodSelected = {
          start: $stateParams.dateRangeStart,
          end: $stateParams.dateRangeEnd
        };
        vm.periodCompared = {
          start: $stateParams.compareRange1Start,
          end: $stateParams.compareRange1End
        };
        if (item.timePeriod === 'none') {
          if ($rootScope.pdf) {
            ranges.selectedPeriod.start = vm.startDate;
            ranges.selectedPeriod.end = vm.endDate;
            ranges.comparePeriod1.start = vm.compareDateStart;
            ranges.comparePeriod1.end = vm.compareDateEnd;
          } else {
            ranges.selectedPeriod.start = $stateParams.dateRangeStart;
            ranges.selectedPeriod.end = $stateParams.dateRangeEnd;
            ranges.comparePeriod1.start = $stateParams.compareRange1Start;
            ranges.comparePeriod1.end = $stateParams.compareRange1End;
          }
          createTimeDimensionObject(ranges, item, originalSubscriptions);
        } else {
          let dateRanges = dateRangeService.getSelectedAndCompareRanges(item.timePeriod, vm.currentUser, vm.currentOrganization, true);
          createTimeDimensionObject(dateRanges, item, originalSubscriptions);
        }

      });

      function createTimeDimensionObject (passedRanges, item, originalSubscriptions) {
        originalSubscriptions.push(angular.copy(item));

        delete item['timePeriod'];

        timeDimensionsArray.push({
          dateStart: passedRanges.selectedPeriod.start,
          dateEnd: passedRanges.selectedPeriod.end,
          compareStart: passedRanges.comparePeriod1.start,
          compareEnd: passedRanges.comparePeriod1.end,
          subscriptions: [item]
        });
      }

      function createNoDataObject (passedSubscription) {
        let noDataObj = [{}];

        noDataObj[0].subscription = passedSubscription;
        noDataObj[0].error = 'No Data';
        noDataObj[0].errorMessage = 'error';
        noDataObj[0].valid = false;

        return noDataObj;
      }
      getTrendSummaryData(timeDimensionsArray).then((response) => {
        let index = [];
        let org = [];
        _.each(response, (item, i) => {
          if (item === 'No Data') {
            index.push(createNoDataObject(originalSubscriptions[i])[0]);
            org.push(createNoDataObject(originalSubscriptions[i])[0]);
          }          else {
            vm.noDataForAvailableTimeDimension = false;
            if (_.has(item, 'index')) {
              index.push(item.index[0]);
            }
            if (_.has(item, 'org')) {
              org.push(item.org[0]);
            }
          }
        });


        vm.hasData = true;
        vm.requestFailed = false;
        let positionIndex = 0;

        let tempSegments = [];

        for (let i = 0; i < 5; i++) {

          var indexDataObj = {};

          let itemAtPosition = _.findWhere(vm.params.subscriptions, {positionIndex: i});

          if (_.isUndefined(itemAtPosition)) {
            originalSubscriptions.splice(i, 0, {});
            indexDataObj.geographyName = 'Empty';
            tempSegments.push(indexDataObj);
            continue;
          }

          indexDataObj.timePeriod = originalSubscriptions[i].timePeriod;
          _.each(timeperiodConstants.timeperiod, (item) => {
            if (indexDataObj.timePeriod === item.period.toLowerCase()) {
              indexDataObj.timePeriod = item.time;
            }
          });

          let indexMatch = getSubscriptionMatch(index, positionIndex);

          if (vm.showOrgIndex === true) {
            let orgMatch = getSubscriptionMatch(org, positionIndex);

            if (ObjectUtils.isNullOrUndefined(orgMatch)) {
              indexDataObj.noDataForSelectedTimeDimension = true;
            } else {
              indexDataObj.orgIndexChange = orgMatch.value * 100;

              if (orgMatch.valid === false && !ObjectUtils.isNullOrUndefined(orgMatch.errorMessage)) {
                indexDataObj.orgErrorMessage = true;
              } else {
                indexDataObj.orgErrorMessage = false;
              }

              getIndexColor(orgMatch, indexDataObj, 'orgIndexColor');
              getIndexIcon(orgMatch, indexDataObj, 'orgIconClass');
            }
          }

          if (ObjectUtils.isNullOrUndefined(indexMatch)) {
            indexDataObj.geographyName = 'Empty';
            indexDataObj.noDataForSelectedTimeDimension = true;
            tempSegments.push(indexDataObj);
            continue;
          }

          indexDataObj.geographyName = getSegmentName(indexMatch.subscription);
          indexDataObj.orgName = getOrgSegmentName(indexMatch.subscription);
          indexDataObj.marketIndexChange = indexMatch.value * 100;

          if (indexMatch.valid === false && !ObjectUtils.isNullOrUndefined(indexMatch.errorMessage)) {
            indexDataObj.indexErrorMessage = true;
          } else {
            indexDataObj.indexErrorMessage = false;
          }

          getIndexColor(indexMatch, indexDataObj, 'marketIndexColor');
          getIndexIcon(indexMatch, indexDataObj, 'marketIconClass');
          tempSegments.push(indexDataObj);
          positionIndex++;
        }

        vm.kpiSegmentsArray = tempSegments;

        vm.isLoading = false;
        setExportLoaded();
      }).catch((error) => {
        console.error(error);
        vm.isLoading = false;
        setExportLoaded();

        if (error === 'No Data') {
          vm.requestFailed = false;
          vm.hasData = false;
        } else {
          vm.requestFailed = true;
          vm.hasData = true;
        }
      });
    }

    function setExportLoaded () {
      if ($rootScope.pdf) $rootScope.pdfExportsLoaded += 1;
    }

    function getIndexIcon (indexMatch, indexDataObj, propName) {
      if (indexMatch.value === 0) {
        indexDataObj[propName] = 'sticon-no-change-large';
      }

      if (indexMatch.value < 0) {
        indexDataObj[propName] = 'sticon-triangle-down';
      }

      if (indexMatch.value > 0) {
        indexDataObj[propName] = 'sticon-triangle-up';
      }
    }

    function getIndexColor (indexMatch, indexDataObj, propName) {
      if (indexMatch.value === 0) {
        indexDataObj[propName] = 'no-change';
      }

      if (indexMatch.value < 0) {
        indexDataObj[propName] = 'negative';
      }

      if (indexMatch.value > 0) {
        indexDataObj[propName] = 'positive';
      }
    }

    function getSubscriptionMatch (indexes, positionIndex) {
      return indexes[positionIndex];
    }

    function getSegmentName (subscription) {
      let segmentName = marketIntelligenceService.getFullGeoTitleByCode(subscription.geography.name);

      segmentName += ' ';

      segmentName += subscription.category.name;

      return segmentName;
    }

    function getOrgSegmentName (subscription) {
      // The org section does not filter by category.
      // Instead, the orgId and geography is used
      return `${vm.org.name  } ${  marketIntelligenceService.getFullGeoTitleByCode(subscription.geography.name)}`;
    }

    function getRequestParams (params) {
      let requestParams = angular.copy(params);

      _.each(requestParams.subscriptions, (subscription) => {
        delete subscription.positionIndex;
      });

      return requestParams;
    }
  }
}))();
