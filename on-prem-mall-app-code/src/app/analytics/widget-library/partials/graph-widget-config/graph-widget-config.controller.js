(function () {
  'use strict';

  angular
    .module('shopperTrak')
    .controller('graphWidgetConfigController', graphWidgetConfigController);

  graphWidgetConfigController.$inject = [
    '$scope',
    '$state',
    '$http',
    '$timeout',
    'apiUrl',
    'widgetLibraryService',
    'customDashboardConstants',
    'ObjectUtils'
  ];

  function graphWidgetConfigController(
    $scope,
    $state,
    $http,
    $timeout,
    apiUrl,
    widgetLibraryService,
    customDashboardConstants,
    ObjectUtils
  ) {

    var vm = this;

    activate();

    function activate() {
      initScope();
      addMetric();
      setSelectableOrgsFalse();
      setupWatches();
    }

    /**
    * Sets up properties and methods on VM for use in the view
    */
    function initScope() {
      vm.buildWidgetConfig = buildWidgetConfig;
      //constants
      vm.selectableOrgs = sortSelectableOrgs(angular.copy(vm.organizations));
      vm.showOrgSelect = vm.selectableOrgs.length > 1 ? true : false; 
      vm.dateRanges = angular.copy(customDashboardConstants.dateRangeTypes);
      vm.metrics = _.filter(vm.metricList, function(metric){ return metric.kpi !== 'peel_off' && metric.kpi !== 'Traffic' && metric.group !== 'interior'});
      vm.groupBy = getGroupBy();
      vm.periods = getPeriods();
      vm.yAxisConfig = [];
      vm.selectedOrgs = [];
      vm.orgSelected = vm.showOrgSelect ? null : vm.selectableOrgs;
      vm.previewOrg = null;
      vm.widgetName = '';
      vm.override = false;
      vm.selectedGroupby = '';
      vm.previewScreen = false;
      vm.allowPreview = true;
      vm.percentBasedMetrics = _.filter(vm.metricList, function (metric) {
        return metric.suffixSymbol === '%';
      });

      //methods
      vm.close = close;
      vm.addMetric = addMetric;
      vm.saveWidget = saveWidget;
      vm.resetMetric = resetMetric;
      vm.prepPreview = prepPreview;
      vm.endPreview = endPreview;
      vm.removeMetric = removeMetric;
      vm.toggleGroupBy = toggleGroupBy;
      vm.moveSelectedOrgs = moveSelectedOrgs;
      vm.toggleSelectedRange = toggleSelectedRange;
      vm.toggleDateRangeOverride = toggleDateRangeOverride;
    }

    function setupWatches() {
      var deregisterValidationWatch = $scope.$watchGroup([
        'vm.widgetName',
        'vm.selectedGroupby',
      ], validationCheck);

      var deregisterYaxisWatch = $scope.$watch('vm.yAxisConfig', validationCheck, true);

      vm.widgetChange = $scope.$watchGroup([
        'vm.editWidget'
      ], loadWidgetForEdit);

      var deregisterOrgWatch = $scope.$watch('vm.orgSelected', function(){
        if(ObjectUtils.isNullOrUndefinedOrEmpty(vm.orgSelected)){
          return;
        }
        $timeout(function(){
          vm.previewOrg = null;
        });
        $timeout(function(){
          vm.previewOrg = vm.orgSelected[0];
        }, 1);
      })

      $scope.$on('destroy', function () {
        deregisterOrgWatch();
        deregisterValidationWatch();
        deregisterYaxisWatch();
        vm.widgetChange();
      })
    }

    /**
    * Gets the allowed xAxis group by options
    * returns an array containing a all group by options
    */
    function getGroupBy() {
      return [
        {
          name: 'Hour',
          selected: false
        }, {
          name: 'Day',
          selected: false
        }, {
          name: 'Week',
          selected: false
        }, {
          name: 'Month',
          selected: false
        }
      ];
    }

    /**
    * Toggles a clicked group by metric, deselects previous selections
    * this function returns nothing but acts upon the selected boolean in each object within the vm.groupBy array
    * @param {object} groupBy
    */
    function toggleGroupBy(groupBy) {
      _.each(vm.groupBy, function (group) {
        group.selected = false;
      });
      vm.selectedGroupby = groupBy.name;
      groupBy.selected = true;
    }

    /**
    * Adds a new metric with empty selections to the yAxisConfig array
    * this function returns nothing but acts upon vm.yAxisConfig
    */
    function addMetric() {
      var metricChoice = {
        selectedMetric: '',
        selectedPeriod: null,
        chartType: 'line'
      };
      vm.yAxisConfig.push(metricChoice);
    }

    /**
    * Gets selectable date range periods for the yAxis selection
    * checks the current user preferences for the users selected compare periods
    * makes these selectable and readable in the view
    */
    function getPeriods() {
      var period1 = vm.currentUser.preferences.custom_period_1.period_type;
      var period2 = vm.currentUser.preferences.custom_period_2.period_type;

      if (period1 === 'custom') {
        period1 = 'common.CUSTOMCOMPARE1';
      } else {
        period1 = 'common.' + period1.toUpperCase();
        period1 = period1.replace(/_/gi, '');
      }

      if (period2 === 'custom') {
        period2 = 'common.CUSTOMCOMPARE2';
      } else {
        period2 = 'common.' + period2.toUpperCase();
        period2 = period2.replace(/_/gi, '');
      }

      return [
        {
          type: 'common.SELECTEDPERIOD',
          periodInfo: 'selectedPeriod'
        },
        {
          type: period1,
          periodInfo: vm.currentUser.preferences.custom_period_1
        },
        {
          type: period2,
          periodInfo: vm.currentUser.preferences.custom_period_2
        }
      ];
    }

    /**
    * Removes the clicked metric from the y-axis selection
    * returns the vm.yAxisConfig array without the clicked metric
    * @param {number} index the index number of the clicked metric
    */
    function removeMetric(index) {
      return vm.yAxisConfig.splice(index, 1);
    }

    /**
    * Saves the widget to the widgets collection, distributed orgs and author preferences, closes the modal, removes directive contents from the DOM
    */
    function saveWidget() {
      var widgetConfig = buildWidgetConfig();
      vm.widgetConfig = widgetConfig;

      if (!vm.editMode) {
        vm.saving = true;
        widgetLibraryService.saveNewWidget(widgetConfig).then(function (widget) {
          widget.screenType = 'main';
          vm.widgets.push(widget);
          vm.saveError = false;
          close();
        }).catch(function (error) {
          console.error(error);
          vm.saveError = true
        });
      } else {
        widgetConfig._id =  vm.editWidget._id;
        var index = _.findIndex(vm.widgets, function (widgetToUpdate) { return vm.editWidget._id === widgetToUpdate._id });
        vm.widgets[index].screenType = 'updating';
        close();
        widgetLibraryService.updateWidget(widgetConfig).then(function (widget) {
          widget.screenType = 'main';
          vm.widgets[index] = widget;
          vm.saveError = false;
        }).catch(function (error) {
          vm.widgets[index].screenType = 'error';
          console.error(error);
          vm.saveError = true
        });
      }

      return vm.widgetConfig;
    }

    /**
    *  Closes the modal and removes directive contents from the DOM
    */
    function close() {
      $('#configModal').modal('hide');
      $timeout(function(){
        vm.configType = null;
      }, 1000);
      vm.editWidget = null;
    }

    /**
    * Builds and audit trail for a new widget
    */
    function buildAuditTrail() {
      if (!vm.editMode) {
        return {
          creator: vm.currentUser._id,
          creatorName: vm.currentUser.fullname,
          creationDate: moment(),
          edits: []
        }
      }

      return vm.editWidget.auditTrail;
    }

    /**
    * Clears out all chosen selectable orgs
    * Loops of each selectable org and sets its selected property to false
    */
    function setSelectableOrgsFalse() {
      _.each(vm.selectableOrgs, function (org) {
        org.selected = false;
      });
    }

    /**
    * Clears out all chosen selected orgs
    * Loops of each selected org and sets its selected property to false
    */
    function setSelectedOrgsFalse() {
      _.each(vm.selected, function (org) {
        org.selected = false;
      })
    }

    /**
    * A collection of functions that take place when an org is moved beteween selected and selectable orgs list
    */
    function moveSelectedOrgs() {
      addToSelectedOrgs();
      removeFromSelectedOrgs();
      setSelectableOrgsFalse();
      setSelectedOrgsFalse();
    }

    /**
    * Takes an org that has been selected from a list of all orgs and copies it over to the selected orgs list
    */
    function addToSelectedOrgs() {

      var orgsToSelect = [];
      _.each(vm.selectableOrgs, function (org) {
        if (org.selected) {
          var newOrg = angular.copy(org);
          newOrg.selected = false;
          newOrg.disabled = false;
          orgsToSelect.push(newOrg);
          org.disabled = true;
        }
      });

      if (vm.selectedOrgs.length === 0 && orgsToSelect.length > 0) {
        vm.selectedOrgs = orgsToSelect;
      } else {
        vm.selectedOrgs = _.union(vm.selectedOrgs, orgsToSelect);
      }
    }

    /**
    * Checks each selected org in the selected org list and removes checked ones
    * removed the disabled attribute from those orgs removed from the selected org list
    */
    function removeFromSelectedOrgs() {
      if (!ObjectUtils.isNullOrUndefinedOrEmpty(vm.selectedOrgs)) {
        var orgsToRemove = [];
        _.each(vm.selectedOrgs, function (org) {
          if (org.selected === true) {
            orgsToRemove.push(org);
          }
        });

        if (!ObjectUtils.isNullOrUndefinedOrEmpty(orgsToRemove)) {
          var newOrgList = _.reject(vm.selectedOrgs, function (org) { return org.selected === true });
          vm.selectedOrgs = newOrgList;
        }

        _.each(orgsToRemove, function (removeOrg) {
          var index = _.findIndex(vm.selectableOrgs, function (org) { return org.name === removeOrg.name });
          vm.selectableOrgs[index].disabled = false;
        })
      }
    }

    /**
    * Toggles date range override ON/OFF and selects a week range by default for validation purposes     *
    * @param {boolean} isOn to set default for on or clear for off
    */
    function toggleDateRangeOverride(isOn) {
      if(!isOn) {
        vm.overrideRange = null;
        return;
      }
      toggleSelectedRange(vm.dateRanges.week.rangeType);
    }

    /**
    * Checks the required elements to see if they have been added before allowing the save and preview button to be clicked
    */
    function disabledButton() {
      vm.yAxisFailValidate = true;

      if (vm.yAxisConfig.length > 0) {
        var validateNumber = 0;
        _.each(vm.yAxisConfig, function (addedMetric) {
          if (typeof addedMetric.selectedMetric === 'object' &&
            addedMetric.selectedPeriod !== null &&
            addedMetric.chartType.length > 0) {
            //is there a kpi, period and chart type selected for each metric
            validateNumber++;
          }
        });

        if(vm.yAxisConfig.length === validateNumber){
          vm.yAxisFailValidate = false;
        }
      }

      if (vm.widgetName.length > 0 && vm.selectedGroupby.length > 0 && !vm.yAxisFailValidate) {

        return vm.disabledButton = false;

      }
      return vm.disabledButton = true;
    }

    /**
    * Clears all selections of the selected metric row
    * @param {Number} index
    */
    function resetMetric(index) {
      vm.yAxisConfig[index].selectedMetric = '';
      vm.yAxisConfig[index].selectedPeriod = '';
      vm.yAxisConfig[index].chartType = 'line';
    }

    /**
    * Runs validation functions
    */
    function validationCheck() {
      disabledButton();
      validateMetrics();
    }

    /**
    * Checks selected metrics and disables the selection of more than 2 types of metric
    */
    function validateMetrics() {
      var selectedKpis = [];
      var uniqueKpis = [];
      _.each(vm.yAxisConfig, function (chosenMetric) {
        var selectedKpi;
        chosenMetric.selectedMetric ? selectedKpi = chosenMetric.selectedMetric.kpi : selectedKpi = false;
        if (selectedKpi) {
          selectedKpis.push(selectedKpi);
        }
      });
      uniqueKpis = _.uniq(selectedKpis);
      if (uniqueKpis.length > 1) {
        _.each(vm.metrics, function (metric) {
          if (_.contains(uniqueKpis, metric.kpi)) {
            //the metric type is selected - dont remove from selection
            metric.disabled = false;
          } else {
            if (_.some(vm.yAxisConfig, function (addedMetric) { return addedMetric.selectedMetric.suffixSymbol === '%'; })
              && metric.suffixSymbol === '%') {
              //the metric is not selected, but it is a % and a % based metric is in the list - allow it to be selected
              metric.disabled = false;
            } else if (checkSelectedMetricsForPercent()) {
              //there is more than 1 metric but each is a percentage so any other metric type may be selected
              metric.disabled = false;
            } else {
              //there are already 2 metric types selected no more types are allowed
              return metric.disabled = true;
            }
          }

        });
      } else {
        _.each(vm.metrics, function (metric) {
          metric.disabled = false;
        });
      }
    }

    function checkSelectedMetricsForPercent() {
      var selectedMetrics = _.omit(angular.copy(vm.yAxisConfig), function (metric) { return metric.selectedMetric === '' });
      return _.every(selectedMetrics, function (addedMetric) { return addedMetric.selectedMetric.suffixSymbol === '%' });
    }

    /**
    * loops over each date range - sets the clicked date ranges' selected property to true and all else to false
    * @param {string} shortcut
    */
    function toggleSelectedRange(range) {
      vm.overrideRange = range;
    }

    function prepPreview() {
      vm.previewScreen = true;
      vm.widgetConfig = buildWidgetConfig();
    }

    function endPreview() {
      vm.previewScreen = false;
      vm.widgetConfig = {};
      vm.selectedOrg = null;
    }

    function buildWidgetConfig() {

      var orgList = {};
      _.each(vm.selectedOrgs, function (org, index) {
        orgList[index] = {
          organization_id: org.organization_id
        }
      });

      return {
        _id: vm.editMode ? vm.editWidget._id : null,
        widgetType: 'graph',
        dateRange: vm.overrideRange,
        widgetName: angular.copy(vm.widgetName),
        widgetDescription: angular.copy(vm.widgetDescription),
        distributedOrgs: angular.copy(vm.selectedOrgs),
        xAxis: angular.copy(vm.selectedGroupby),
        yAxis: angular.copy(vm.yAxisConfig),
        overrideRange: angular.copy(vm.overrideRange),
        auditTrail: buildAuditTrail()
      };
    }

    /**
    * This function gets the metric for yAxis it handles null or undefined and handles string type metric or object type
    */
    function getMetric(metric) {
      if(ObjectUtils.isNullOrUndefined(metric) || typeof metric !== 'string') {
        if(!ObjectUtils.isNullOrUndefined(metric.selectedMetric)) {
          return metric.selectedMetric;
        }
        return metric;
      }

      return  _.findWhere(vm.metrics, { 'kpi': metric.selectedMetric });
    }

    /**
    * This function fills out all pre filled form information when editing a widget
    */
    function loadWidgetForEdit() {
      if (vm.editWidget) { //check there has been a widget passed for editing
        var periodTypes = getPeriods();
        vm.editMode = true; //set edit mode to true for use in the view

        vm.widgetName = vm.editWidget.widgetName;
        vm.widgetDescription = vm.editWidget.widgetDescription;
        vm.overrideRange = vm.editWidget.overrideRange;

        vm.yAxisConfig = []; //clear y axis
        _.each(vm.editWidget.yAxis, function (yMetric) { // configure each yAxis row

          var metricObj = {
            chartType: yMetric.chartType,
            selectedPeriod: !ObjectUtils.isNullOrUndefined(yMetric.selectedPeriod) ? _.findWhere(periodTypes, { 'type': yMetric.selectedPeriod.type }) :yMetric.selectedPeriod,
            selectedMetric: getMetric(yMetric)
          }

          if(ObjectUtils.isNullOrUndefinedOrEmptyObject(metricObj.selectedPeriod)){
            var type = yMetric.selectedPeriod.type;
            switch(type){
              case 'common.CUSTOMCOMPARE1':
                metricObj.selectedPeriod = {
                  periodInfo : vm.currentUser.preferences.custom_period_1,
                  type : 'common.' + vm.currentUser.preferences.custom_period_1.period_type.replace('_', '').toUpperCase()
                }
                break;
              case 'common.CUSTOMCOMPARE2':
                metricObj.selectedPeriod = {
                  periodInfo : vm.currentUser.preferences.custom_period_2,
                  type : 'common.' + vm.currentUser.preferences.custom_period_2.period_type.replace('_', '').toUpperCase()
                }
                break;
              case 'common.PRIORPERIOD':
                if(vm.currentUser.preferences.custom_period_1.period_type.includes('period')){
                  metricObj.selectedPeriod = {
                    periodInfo : vm.currentUser.preferences.custom_period_1,
                    type : 'common.PRIORPERIOD'
                  }
                } else {
                  metricObj.selectedPeriod = {
                    periodInfo : vm.currentUser.preferences.custom_period_2,
                    type : 'common.PRIORPERIOD'
                  }
                }
                break;
              case 'common.PRIORYEAR':
                if(vm.currentUser.preferences.custom_period_1.period_type.includes('period')){
                  metricObj.selectedPeriod = {
                    periodInfo : vm.currentUser.preferences.custom_period_1,
                    type : 'common.PRIORPERIOD'
                  }
                } else {
                  metricObj.selectedPeriod = {
                    periodInfo : vm.currentUser.preferences.custom_period_2,
                    type : 'common.PRIORPERIOD'
                  }
                break;
              }
            }
          }

          vm.yAxisConfig.push(metricObj);
        })

        _.each(vm.groupBy, function (group) { //configure selected group by
          if (group.name === vm.editWidget.xAxis) {
            group.selected = true;
            vm.selectedGroupby = group.name;
          }
        });

        //turn on the date range
        vm.override = !ObjectUtils.isNullOrUndefinedOrEmpty(vm.overrideRange);

        if (vm.editWidget.distributedOrgs) { // preselect orgs
          var preSelectedOrgs = [];
          if(vm.superuser){
            _.each(vm.editWidget.distributedOrgs, function (distOrg) {
              var preOrg = _.findWhere(vm.selectableOrgs, { 'organization_id': distOrg.organization_id });
              preSelectedOrgs.push(preOrg);
              preOrg.disabled = true;
            });
          }

          vm.selectedOrgs = angular.copy(preSelectedOrgs);
        }
        disabledButton();

        if (vm.editWidget.preview) {
          prepPreview();
          vm.previewScreen = true;
          vm.previewOnly = true;
        }
      }
    }

    /**
     * Return an array without organisations, which has no name property
     *
     * @param {array} orgs
     * @returns {array}
    */
    function sortSelectableOrgs(orgs) {
      var filteredOrgs = _.filter(orgs, function (object) { return !ObjectUtils.isNullOrUndefined(object.name) });
      var sortedOrgs = _.sortBy(filteredOrgs, function(org){return org.name});
      return sortedOrgs;
    }

  }
})();
