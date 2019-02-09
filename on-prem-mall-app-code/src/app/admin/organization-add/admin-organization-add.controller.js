(function() {
  'use strict';

  angular.module('shopperTrak')
    .controller('AdminOrgAddController', AdminOrgAddController);

  AdminOrgAddController.$inject = [
    '$scope',
    '$state',
    '$timeout',
    'adminOrganizationsData'
  ];

  function AdminOrgAddController($scope, $state, $timeout, adminOrganizationsData) {
    var vm = this;
    
    vm.cancel = cancel;
    vm.save = save;

    vm.loading = false;
    vm.error = false;
    vm.errorMessage = '';
    vm.market_intelligence = false;
    createNewOrgParams();

    function cancel() {
      $state.go('admin.organizations');
    }

    function save() {

      if(vm.market_intelligence){
        _.last(vm.org.status_subscriptions.market_intelligence).status = 'active';
      }

      vm.error = false;
      vm.loading = true;

      var callback = {
        success: function(result) {
          vm.loading = false;
          $state.go('admin.organizations.edit', { orgId: result.data.result[0].organization_id });
        },
        failed: function(error) {
          vm.error = true;
          vm.errorMessage = error.data.message;
          vm.loading = false;
        }
      };

      adminOrganizationsData.createOrganization(vm.org, callback);
    }

    function createNewOrgParams() {
      vm.org = {};
      vm.org.orgId = '';
      vm.org.subscriptions = {
        'advanced': false,
        'campaigns': false,
        'consumer_behavior': false,
        'interior': false,
        'labor': false,
        'large_format_mall': true,
        'market_intelligence': false,
        'perimeter': false,
        'qlik': false,
        'realtime_labor': false,
        'realtime_sales': false,
        'realtime_traffic': false,
        'sales': false
      };

      vm.org.status_subscriptions = {
        market_intelligence: [
          {
            status: 'disabled',
            end: moment().add(1, 'year'),
            start: moment()
          }
        ]
      };

      vm.timeOfDay = createTimeOfDayArray();
    }

    function createTimeOfDayArray() {
      var timeOfDay = [];

      for(var hour = 0; hour < 24; hour++) {
        var timeOfDayString;
        if(hour.toString().length === 1) {
          timeOfDayString = '0' + hour + ':00';
        } else {
          timeOfDayString = hour + ':00';
        }

        timeOfDay.push(timeOfDayString);
      }

      vm.org.timeOfDay = '07:00';
      return timeOfDay;
    }
  }
})();
