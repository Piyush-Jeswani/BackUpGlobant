(function () {
  'use strict';

  angular
    .module('shopperTrak')
    .controller('dataTableConfigController', dataTableConfigController);

  dataTableConfigController.$inject = [
    '$scope',
    '$state',
    '$timeout',
    '$http',
    'apiUrl',
    'dragulaService',
    'widgetLibraryService',
    'ObjectUtils',
    'customDashboardConstants'
  ];

  function dataTableConfigController(
    $scope,
    $state,
    $timeout,
    $http,
    apiUrl,
    dragulaService,
    widgetLibraryService,
    ObjectUtils,
    customDashboardConstants
  ) {

    var vm = this;


    activate();

    function activate() {
      initScope();
      setSelectableOrgsFalse();
      configureMetricSelect();
      setupWatches();
    }

    /**
    * Sets up properties and methods on VM for use in the view
    */
    function initScope() {
      vm.buildWidgetConfig = buildWidgetConfig;
      //constants
      vm.selectedOrgs = [];
      vm.conditionalFormatMetrics = [];
      vm.columns = [];
      vm.override = false;
      vm.selectableOrgs = sortSelectableOrgs(angular.copy(vm.organizations));
      vm.showOrgSelect = vm.selectableOrgs.length > 1 ? true : false;
      vm.dateRanges = angular.copy(customDashboardConstants.dateRangeTypes);
      vm.metrics = configureMetrics();
      vm.selectedOrgs = []
      vm.orgSelected = vm.showOrgSelect ? null : vm.selectableOrgs;
      vm.disabledButton = true;
      vm.widgetName = '';
      vm.rowTypeOrg = true;
      vm.previewScreen = false;
      vm.allowPreview = true;
      vm.metricRank = [];
      vm.dateRangeTranslation = vm.dateRanges.week.transKey;
      vm.autoList = [];
      vm.tableControls = [
        {
          name: 'Filter',
          selected: true,
          disabled: false
        }, {
          name: 'Sorting',
          selected: true,
          disabled: false
        }, {
          name: 'Column Resize',
          selected: true,
          disabled: false
        }, {
          name: 'Column Re-ordering',
          selected: true,
          disabled: false
        }
      ]

      //methods
      vm.close = close;
      vm.toggleControl = toggleControl;
      vm.saveWidget = saveWidget;
      vm.toggleDateRangeOverride = toggleDateRangeOverride;
      vm.toggleSelectedRange = toggleSelectedRange;
      vm.moveSelectedOrgs = moveSelectedOrgs;
      vm.prepPreview = prepPreview;
      vm.endPreview = endPreview;
      vm.toggleFormatting = toggleFormatting;
      vm.checkBounds = checkBounds;
      vm.updateFormatConfigs = updateFormatConfigs;
      vm.removeBound = removeBound;
      vm.dupeFormatting = dupeFormatting;
      vm.updateAvaliableDupes = updateAvaliableDupes;
      vm.toggleRank = toggleRank;
      vm.updateColor = updateColor;
      vm.formatType = formatType;
    }

    /**
    * start watches for the scope
    */
    function setupWatches() {

      //ToDo: Delete this

      $scope.$watch('vm.orgSelected', function(selectedOrgs) {
        if(ObjectUtils.isNullOrUndefinedOrEmpty(selectedOrgs)) {
          return;
        }
      });

      var deregisterValidationWatch = $scope.$watch('vm.widgetName', disabledButton);
      vm.widgetChange = $scope.$watchGroup([
        'vm.editWidget'
      ], loadWidgetForEdit);

      $scope.$on('destroy', function () {
        deregisterValidationWatch();
        vm.widgetChange();
      })
    }

    /**
    * Saves the widget to the widgets collection, distributed orgs and author preferences, closes the modal, removes directive contents from the DOM
    */
    function saveWidget() {
      var widgetConfig = buildWidgetConfig();

      if (!vm.editMode) {
        widgetLibraryService.saveNewWidget(widgetConfig).then(function (widget) {
          widget.screenType = 'main';
          vm.widgets.push(widget);
          vm.editMode = '';
          vm.saveError = false;
        }).catch(function (error) {
          console.error(error);
          vm.saveError = true
        });
      } else {
        widgetConfig._id = vm.editWidget._id;
        var index = _.findIndex(vm.widgets, function (item) { return vm.editWidget._id === item._id });
        vm.widgets[index].screenType = 'updating';
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
      close();
      return widgetConfig;
    }

    /**
    * Builds and audit trail for a new widget
    */
    function buildAuditTrail() {
      if (!vm.editWidget) {
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
    * Set up of dragula options for metric selection
    *  adds selected and removes deselected metrics from the vm.columns array
    */
    function configureMetricSelect() {
      dragulaService.options($scope, 'first-bag', {
        copy: false,
        moves: function (el) {
          return $(el);
        },
      });

      $scope.$on('first-bag.drop', function (e, el, target, source) {
        var dragFrom = $(source).data('bag');
        var dropOn = $(target).data('bag');
        var kpi = $(el).data('kpi');

        if (dropOn === 'column' && dragFrom === 'metrics') { //adds to selected metrics
          vm.columns.push(kpi);
        }
        if (dropOn === 'metrics' && dragFrom === 'column') { //removes from selected metrics
          vm.columns = _.without(vm.columns, _.findWhere(vm.columns, {
            value: kpi.value
          }));
        }

        $timeout(disabledButton, 0);
      });
    };

    /**
    * Adds and removes table control options
    * the function checks to see if this control is disabled, already selected or a new selection
    * @param {object} control a object containing a clicked control options properties
    */
    function toggleControl(control) {
      if (control.disabled) {
        return;
      }

      control.selected = !control.selected;
    }

    /**
    * loops over each date range - sets the clicked date ranges' selected property to true and all else to false
    * @param {string} shortcut
    */
    function toggleSelectedRange(range) {
      vm.overrideRange = range;
      vm.dateRangeTranslation = vm.dateRanges[range].transKey;
    }

    /**
    * Toggles date range override ON/OFF and selects a week range by default for validation purposes     *
    * @param {boolean} isOn to set default for on or clear for off
    */
    function toggleDateRangeOverride(isOn) {
      if (!isOn) {
        vm.overrideRange = null;
        vm.dateRangeTranslation = vm.dateRanges.week.transKey;
        return;
      }
      toggleSelectedRange(vm.dateRanges.week.rangeType);
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
     * Return an array without organisations, which has no name property
     *
     * @param {array} orgs
     * @returns {array}
    */
    function sortSelectableOrgs(orgs) {
      var filteredOrgs = _.filter(orgs, function (object) { return !ObjectUtils.isNullOrUndefined(object.name) });
      _.each(filteredOrgs, function(org){
        org.selectionType = 'single';
      });
      var sortedOrgs = _.sortBy(filteredOrgs, function(org){return org.name});
      return sortedOrgs;
    }

    /**
    * Checks the required elements to see if they have been added before allowing the save and preview button to be clicked
    */
    function disabledButton() {
      if (vm.widgetName.length > 0 && !_.isUndefined(vm.columns[0])) {
        return vm.disabledButton = false;
      }
      return vm.disabledButton = true;
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
      return {
        _id: vm.editMode ? vm.editWidget._id : null,
        widgetType: 'data-grid',
        widgetName: angular.copy(vm.widgetName),
        widgetDescription: angular.copy(vm.widgetDescription),
        distributedOrgs: angular.copy(vm.selectedOrgs),
        columns: _.pluck(vm.columns, 'kpi'),
        orgLevel: angular.copy(vm.rowTypeOrg),
        controls: angular.copy(vm.tableControls),
        overrideRange: angular.copy(vm.overrideRange),
        auditTrail: buildAuditTrail(),
        conditionalFormatMetrics: angular.copy(vm.conditionalFormatMetrics),
        rankCols: angular.copy(vm.metricRank),
        auto: vm.autoList
      }
    }

    /**
    * This function fills out all pre filled form information when editing a widget
    */
    function loadWidgetForEdit() {
      if (vm.editWidget) { //check there has been a widget passed for editing
        var newWidgetProps = angular.copy(vm.editWidget);
        vm.editMode = true; //set edit mode to true for use in the view
        vm.editColumns = [];

        vm.widgetName = newWidgetProps.widgetName;
        vm.widgetDescription = newWidgetProps.widgetDescription;
        vm.overrideRange = newWidgetProps.overrideRange;
        vm.rowTypeOrg = newWidgetProps.orgLevel;
        vm.tableControls = newWidgetProps.controls;
        vm.conditionalFormatMetrics = newWidgetProps.conditionalFormatMetrics;
        vm.metricRank = newWidgetProps.rankCols;
        vm.autoList = newWidgetProps.auto;

        _.each(newWidgetProps.columns, function (metric) {
          var metricToAdd = _.findWhere(vm.metrics, { 'kpi': metric });
          var metricFormats = _.findWhere(vm.conditionalFormatMetrics, {'metric' : metric});
          var autoMetric = _.contains(vm.autoList, metric);

          if (!ObjectUtils.isNullOrUndefinedOrEmptyObject(metricFormats)) {
            metricToAdd.conditionalFormat = true;
            metricToAdd.showFormatOptions = true;
            if(autoMetric) {
              metricToAdd.formatType = 'auto';
            }
            else if(metricFormats.conditionalFormatBounds){
              metricToAdd.formatType = 'custom';
              metricToAdd.conditionalFormatBounds = metricFormats.conditionalFormatBounds;
            }
          }

          vm.editColumns.push(metricToAdd);
        });

        vm.columns = angular.copy(vm.editColumns);

        vm.metrics = _.difference(vm.metrics, vm.editColumns);

        _.each(vm.metricRank, function(metric){
          var metric = _.findWhere(vm.columns, {'kpi': metric});
          metric.rank = true;
          return metric;
        });

        //turn on or off the date range
        vm.override = !ObjectUtils.isNullOrUndefinedOrEmpty(vm.overrideRange);

        if (newWidgetProps.distributedOrgs) {
          var preSelectedOrgs = [];
          _.each(newWidgetProps.distributedOrgs, function (distOrg) {
            var preOrg = _.findWhere(vm.selectableOrgs, { 'organization_id': distOrg.organization_id });
            if(!_.isUndefined(preOrg)){
              preSelectedOrgs.push(preOrg);
              preOrg.disabled = true;
            }
          });

          vm.selectedOrgs = angular.copy(preSelectedOrgs);

          if (newWidgetProps.preview) {
            prepPreview();
            vm.previewScreen = true;
            vm.previewOnly = true;
          }
        }

      }
    }

    function toggleFormatting(metric) {
      var current = _.findWhere(vm.conditionalFormatMetrics, {'metric' : metric.kpi});
      if (!_.findWhere(vm.conditionalFormatMetrics, {'metric' : metric.kpi})) {
        formatType(metric, 'auto');
        metric.showFormatOptions = true;
        vm.conditionalFormatMetrics.push({'metric' : metric.kpi});
        return;
      }

      metric.showFormatOptions = false;
      return vm.conditionalFormatMetrics = _.without(vm.conditionalFormatMetrics, current);

    }

    function updateFormatConfigs(metric){

      if(!metric.conditionalFormatBounds){
        metric.conditionalFormatBounds = []
      };

      var customFormat = {
        lowerBound : null,
        upperBound : null,
        color : null
      }

      metric.conditionalFormatBounds.push(customFormat);

      return metric;
    }

    function configureMetrics(){
      var metrics = angular.copy(vm.metricList);
      _.each(metrics, function(metric){
        metric.rank = false;
      })

      return metrics;
    }

    function dupeFormatting(metricToDupe, metric){
      var thisMetric = _.findWhere(vm.conditionalFormatMetrics, {'metric' : metric.kpi});
      var newFormatting = angular.copy(metricToDupe.conditionalFormatBounds);
      thisMetric.conditionalFormatBounds = newFormatting;
      return metric.conditionalFormatBounds = newFormatting;
    }

    function removeBound(metric, bound, index){
      return metric.conditionalFormatBounds.splice(index, 1);
    }

    function checkBounds(metric, bound, lowerBound){
      var thisBound = _.findWhere(metric.conditionalFormatBounds, bound);
      var thisMetric = _.findWhere(vm.conditionalFormatMetrics, {'metric' : metric.kpi});
      $timeout(function(){
        //lowerbound checks
        if(lowerBound && bound.lowerBound < bound.upperBound || lowerBound && !bound.upperBound){
          var disallowed = false;
          _.each(metric.conditionalFormatBounds, function(formatBounds){
            if(!disallowed && !_.isEqual(formatBounds, thisBound)){
              disallowed = checkIfNumberInRange(formatBounds.lowerBound, formatBounds.upperBound, thisBound.lowerBound);
            }
          });
          if(disallowed){
            return bound.lowerBound = null;
          }

          thisMetric.conditionalFormatBounds = angular.copy(metric.conditionalFormatBounds);
          return bound.lowerBound;
        } else if (lowerBound){
          return bound.lowerBound = null;
        }

        //upperbound checks
        if(!lowerBound && bound.upperBound > bound.lowerBound || !lowerBound && !bound.lowerBound){
          var disallowed = false;
          _.each(metric.conditionalFormatBounds, function(formatBounds){
            if(!disallowed && !_.isEqual(formatBounds, thisBound)){
              disallowed = checkIfNumberInRange(formatBounds.lowerBound, formatBounds.upperBound, thisBound.upperBound);
            }
          });
          if(disallowed){
            return bound.upperBound = null;
          }

          thisMetric.conditionalFormatBounds = angular.copy(metric.conditionalFormatBounds);
          return bound.upperBound;
        } else if (!lowerBound){
          return bound.upperBound = null;
        }
      }, 1000);

    }

    function checkIfNumberInRange(min, max, testNum){
      if(testNum > min && testNum < max){
        return true;
      }
      return false;

    }

    function updateAvaliableDupes(){
      if(!configureMetricsIsEmpty()){
        var dupeList = angular.copy(vm.conditionalFormatMetrics);
        vm.avaliableDupes = [];
        _.each(dupeList, function(dupe){
          if(!_.isUndefined(dupe.conditionalFormatBounds)){
            var isAvaliableDupe = false;
            _.each(dupe.conditionalFormatBounds, function(formatBound){
              if(formatBound.lowerBound !== null && formatBound.upperBound !== null){
                isAvaliableDupe = true;
              }
            });

            if(isAvaliableDupe){
              var metricInfo = _.filter(vm.columns, function(column){
                if(column.kpi === dupe.metric){
                  return column.shortTranslationLabel;
                }
              })
              dupe.transLabel = metricInfo[0].shortTranslationLabel;
              vm.avaliableDupes.push(dupe);
            }

          }
        });
        _.each(vm.columns, function(metric){
          var metricInDupe = _.findWhere(vm.avaliableDupes, {'metric': metric.kpi});
          if(_.isUndefined(metricInDupe) && vm.avaliableDupes.length === 0) return metric.showDupeList = false;
          if(_.isUndefined(metricInDupe) && vm.avaliableDupes.length > 0) return metric.showDupeList = true, metric.avaliableDupes = vm.avaliableDupes;
          if(!_.isUndefined(metricInDupe) && vm.avaliableDupes.length > 0) {
            metric.avaliableDupes = _.without(vm.avaliableDupes, metricInDupe);
            if (metric.avaliableDupes.length > 0) return metric.showDupeList = true;
            return metric.showDupeList = false;
          }
        });

        return vm.avaliableDupes;
      }

      return vm.avaliableDupes = null;
    }

    function configureMetricsIsEmpty(){
      if(!ObjectUtils.isNullOrUndefinedOrEmpty(vm.conditionalFormatMetrics)){
        var empty = true;
        _.each(vm.conditionalFormatMetrics, function(formatMetric){
          if(formatMetric.conditionalFormatBounds && formatMetric.conditionalFormatBounds.length > 0){
            empty = false;
          }
        })
        return empty;
      }

      return true;
    }

    function toggleRank(metric, bool){
      return bool ? vm.metricRank.push(metric.kpi) : vm.metricRank = _.without(vm.metricRank, metric.kpi);
    }

    function updateColor(metric, bound){
      var thisMetric = _.findWhere(vm.conditionalFormatMetrics, {'metric' : metric.kpi});
      var thisBound = _.findWhere(thisMetric.conditionalFormatBounds, {'lowerBound' : bound.lowerBound, 'upperBound' : bound.upperBound});
      thisBound.color = bound.color;
    }

    function formatType(metric, type){
      if(!_.contains(vm.autoList, metric.kpi) && type === 'auto'){
        vm.autoList.push(metric.kpi);
      } else {
        vm.autoList = _.without(vm.autoList, metric.kpi);
      }
      return metric.formatType = type;
    }

  }
})();
