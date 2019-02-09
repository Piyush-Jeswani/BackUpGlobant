(function () {
  'use strict';

  angular
    .module('shopperTrak')
    .controller('WidgetLibraryController', WidgetLibraryController);

  WidgetLibraryController.$inject = [
    '$scope',
    '$state',
    'widgetLibraryService',
    'metricsHelper',
    'organizations',
    'metricConstants',
    'currentUser',
    'ObjectUtils'
  ];

  function WidgetLibraryController(
    $scope,
    $state,
    widgetLibraryService,
    metricsHelper,
    organizations,
    metricConstants,
    currentUser,
    ObjectUtils
  ) {

    const vm = this;
    vm.currentUser = currentUser;
    vm.superuser = currentUser.superuser;

    activate();

    function activate() {
      vm.isLoading = true;
      metricsHelper.translateMetrics().then(function () {
        initScope();
        loadWidgetLibrary();
      });
    }

    function setEvents() {
      vm.widgetChange = $scope.$watch('vm.widgets', function () {
        getWidgetIcon(vm.widgets);
        momentizeDates(vm.widgets);
        createOverrideTranslation(vm.widgets);
      }, true);

      $scope.$on('$destroy', function () {
        //hide the modal and remove modal backdrop to fix issue with back button
        angular.element('#configModal').modal('hide');
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();
        vm.widgetChange();
      });
    }

     /**
    * loads available widgets created by widget library
    */
    function loadWidgetLibrary() {
      vm.isLoading = true;
      getAvailableWidgets();
    }

    /**
    * loads available widgets created by widget library by callinf reportsData service and sets events on success case
    */
    function getAvailableWidgets() {
      widgetLibraryService.loadAvailableWidgetLibraries(vm.currentUser, vm.organizations)
        .then(function (response) {
          vm.widgets = response;
          vm.isLoading = false;
          vm.allRequestsSucceeded = true;
          setEvents();
        })
        .catch(function (error) {
          vm.widgets = [];
          vm.isLoading = false;
          vm.allRequestsSucceeded = false;
          console.error('error in loadAvailableWidgetLibraries ', error);
      });
    }

    function initScope() {
      vm.saveDuplicatedWidget = saveDuplicatedWidget;
      vm.widgets = [];
      vm.currentUser = currentUser;
      vm.organizations = angular.copy(organizations);
      vm.metricList = getMetrics();
      vm.openEditScreen = openEditScreen;
      vm.duplicate = duplicate;
      vm.removeWidget = removeWidget;
      vm.removeDuplicatedWidget = removeDuplicatedWidget;
      vm.deleteWidget = deleteWidget;
      vm.reloadIcon = false;
      vm.validateWidgetName = validateWidgetName;

      $state.current.data.isExportableAsPdf = false;
    }

    function getMetrics(){
      var metrics = angular.copy(metricConstants.metrics);
      return metrics;
    }

    function getWidgetIcon(widgets) {
      _.each(widgets, function (widget) {
        if (widget.widgetType === 'data-grid') {
          widget.icon = 'sticon-table-chart';
        }

        if (widget.widgetType === 'graph') {
          widget.icon = 'sticon-line-chart';
          if (!ObjectUtils.isNullOrUndefinedOrEmpty(widget.yAxis)  && widget.yAxis[0].chartType === 'bar') {
            widget.icon = 'sticon-bar-chart';
          }
        }

      })
    }

    function validateWidgetName(widget){
      var widgetsCopy = _.without(vm.widgets, widget);
      widget.invalidName = false;
      _.each(widgetsCopy, function(w){
        if(widget._id === w._id || widget.widgetName === '' || widget.widgetName === w.widgetName){
          widget.invalidName = true;
        }
      })

    }

     /**
    * This function iterates on widgets and set audit traills if there is one
    * @param {Array} widgets an object list containing saved widget information
    */

    function momentizeDates(widgets) {
      _.each(widgets, function (widget) {
        setWidgetAuditTrailParams(widget);
      })
    }

    /**
    * Saves the widget to the widgets collection, distributed orgs and author preferences, closes the modal, removes directive contents from the DOM
    */
    function saveDuplicatedWidget(widget) {
      widget.screenType = 'saving';
      var widgetConfig = widgetLibraryService.buildWidgetConfig(widget, vm.currentUser);
      widgetLibraryService.saveNewWidget(widgetConfig).then(function (savedWidget) {
        widget._id = savedWidget._id;
        widget.screenType = 'main';
        vm.saveError = false;
        vm.duplicateInProgress = false;
      }).catch(function (error) {
        widget.screenType = 'error';
        console.error(error);
        vm.saveError = true;
        vm.duplicateInProgress = false;
      });
    }

     /**
    * This function gets widget and sets audit traills parameters if there is one
    * @param {Object} widget an object containing saved widget information
    */
    function setWidgetAuditTrailParams(widget) {
      if (ObjectUtils.isNullOrUndefined(widget.auditTrail)) {
        return;
      }
      widget.auditTrail.creationDate = moment(widget.auditTrail.creationDate).format('MMM D, YYYY hh:mm a');
      if (!ObjectUtils.isNullOrUndefinedOrEmpty(widget.auditTrail.edits)) {
        _.each(widget.auditTrail.edits, function (edit) {
          edit.editDate = moment(edit.editDate).format('MMM D, YYYY hh:mm a');
        });
      }
    }

    function createOverrideTranslation(widgets) {
      _.each(widgets, function (widget) {
        if (widget.overrideRange) {
          widget.overrideTranstring = 'marketIntelligence.' + widget.overrideRange.toUpperCase();
        }
      })
    }

    function getMetrics() {
      var allMetrics = angular.copy(metricConstants.metrics);
      var metrics = _.filter(allMetrics, function(metric){ return metric.value !== 'traffic (pct)'});
      return metrics;
    }

    /**
    * This function opens the the modal with the relevant widget choice.
    * @param {object} widget an object containing saved widget information
    * @param {boolean} preview indicates wether the preview screen should be opened
    */
    function openEditScreen(widget, preview) {
      vm.configType = widget.widgetType;
      vm.editWidget = angular.copy(widget);
      vm.editWidget.preview = preview;
      vm.editWidget.previewOnly = true;
      vm.editWidget.mode = 'edit';
      $('#configModal').modal('show');
    }


    function duplicate(widget) {
      var newWidget = angular.copy(widget);
      newWidget.widgetName = '';
      newWidget._id = null;
      newWidget.screenType = 'reName';
      newWidget.invalidName = true;
      vm.widgets.push(newWidget);
      vm.duplicateInProgress = true;
    }

    function removeDuplicatedWidget(widget) {
      removeWidget(widget);
      vm.duplicateInProgress = false;
    }

    function removeWidget(widget) {
      vm.widgets = _.without(vm.widgets, widget);
    }

    function deleteWidget(widget) {
      widget.screenType = 'deleting';
      widgetLibraryService.deleteWidget(widget).then(function () {
        removeWidget(widget);
        vm.saveError = false;
      }).catch(function (error) {
        console.error(error);
        vm.saveError = true
      });
    }
  }
})();
