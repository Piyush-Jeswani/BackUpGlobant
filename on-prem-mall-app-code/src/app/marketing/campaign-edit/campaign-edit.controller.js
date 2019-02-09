(function() {
	'use strict';
	angular.module('shopperTrak').controller('MarketingCampaignEditController', MarketingCampaignEditController);

	MarketingCampaignEditController.$inject = [
		'$scope',
		'$state'
	];

	function MarketingCampaignEditController($scope, $state) {

		var now = moment().utc();

		$scope.$state = $state;
		$scope.dateRangeIsSetTo = dateRangeIsSetTo;
		$scope.dateRangeIsSetToCustom = dateRangeIsSetToCustom;
		$scope.setDateRange = setDateRange;
		$scope.campaignSaved = false;

		activate();

		function activate() {

			$scope.dateRange = {
				start: now,
				end: now
			};

			// populate this with selectable values to both create and edit page - current content is only for testing

			$scope.SelectableProperties = [
				{
				'id': 1,
				'property': 'Property name 1',
				'city': 'City 1'
				},
				{
				'id': 2,
				'property': 'Property name 2',
				'city': 'City 2'
				},
				{
				'id': 3,
				'property': 'Property name 3',
				'city': 'City 3'
				},
				{
				'id': 4,
				'property': 'Property name 4',
				'city': 'City 4'
				}
			];

			// populate this with preselected values for the edit page- current content is only for testing

			$scope.PreselectedProperties = [
				{
				'id': 5,
				'property': 'Property name 5',
				'city': 'City 5'
				},
				{
				'id': 6,
				'property': 'Property name 6',
				'city': 'City 6'
				},
				{
				'id': 7,
				'property': 'Property name 7',
				'city': 'City 7'
				},
				{
				'id': 8,
				'property': 'Property name 8',
				'city': 'City 8'
				}
			];

			// this is the trigger points for the selected property

			$scope.PropertyTriggerPoints = [
				{
				'id': 12,
				'property': 5,
				'description': 'B1-119 Beacon name'
				},
				{
				'id': 27,
				'property': 5,
				'description': 'B2-159 Second beacon name'
				},
				{
				'id': 33,
				'property': 5,
				'description': 'Z3-003 Lorem ipsum'
				},
				{
				'id': 65,
				'property': 5,
				'description': 'C8-241 Yet another'
				}
			];

			$scope.ActiveDays = [
				{
				'id': 1,
				'value': 'Every day',
				'selected': false
				},
				{
				'id': 2,
				'value': 'Local business days',
				'selected': true
				},
				{
				'id': 3,
				'value': 'Weekends',
				'selected': false
				},
				{
				'id': 4,
				'value': 'First day of the month',
				'selected': false
				},
				{
				'id': 5,
				'value': 'Last day of the month',
				'selected': false
				},
				{
				'id': 6,
				'value': 'Mondays',
				'selected': false
				},
				{
				'id': 7,
				'value': 'Tuesdays',
				'selected': false
				},
				{
				'id': 8,
				'value': 'Wednesdays',
				'selected': false
				},
				{
				'id': 9,
				'value': 'Thursdays',
				'selected': false
				},
				{
				'id': 10,
				'value': 'Fridays',
				'selected': false
				},
				{
				'id': 11,
				'value': 'Saturdays',
				'selected': false
				},
				{
				'id': 12,
				'value': 'Sundays',
				'selected': false
				}
			];

			$scope.TimeOptions = [
				{
				'time': 0,
				'selected': false
				},
				{
				'time': 1,
				'selected': false
				},
				{
				'time': 2,
				'selected': false
				},
				{
				'time': 3,
				'selected': false
				},
				{
				'time': 4,
				'selected': false
				},
				{
				'time': 5,
				'selected': false
				},
				{
				'time': 6,
				'selected': false
				},
				{
				'time': 7,
				'selected': false
				},
				{
				'time': 8,
				'selected': false
				},
				{
				'time': 9,
				'selected': false
				},
				{
				'time': 10,
				'selected': false
				},
				{
				'time': 11,
				'selected': false
				},
				{
				'time': 12,
				'selected': false
				},
				{
				'time': 13,
				'selected': false
				},
				{
				'time': 14,
				'selected': false
				},
				{
				'time': 15,
				'selected': false
				},
				{
				'time': 16,
				'selected': false
				},
				{
				'time': 17,
				'selected': false
				},
				{
				'time': 18,
				'selected': false
				},
				{
				'time': 19,
				'selected': false
				},
				{
				'time': 20,
				'selected': false
				},
				{
				'time': 21,
				'selected': false
				},
				{
				'time': 22,
				'selected': false
				},
				{
				'time': 23,
				'selected': false
				}
			];

			$scope.VisitFrequency = [
				{
				'amount': 0,
				'selected': false
				},
				{
				'amount': 1,
				'selected': false
				},
				{
				'amount': 2,
				'selected': false
				},
				{
				'amount': 3,
				'selected': false
				},
				{
				'amount': 4,
				'selected': false
				},
				{
				'amount': 5,
				'selected': false
				},
				{
				'amount': 6,
				'selected': false
				},
				{
				'amount': 7,
				'selected': false
				},
				{
				'amount': 8,
				'selected': false
				},
				{
				'amount': 9,
				'selected': false
				},
				{
				'amount': 10,
				'selected': false
				}
			];

			$scope.DwellTime = [
				{
				'minutes': 0,
				'selected': false
				},
				{
				'minutes': 1,
				'selected': false
				},
				{
				'minutes': 2,
				'selected': false
				},
				{
				'minutes': 3,
				'selected': false
				},
				{
				'minutes': 4,
				'selected': false
				},
				{
				'minutes': 5,
				'selected': false
				},
				{
				'minutes': 10,
				'selected': false
				},
				{
				'minutes': 20,
				'selected': false
				},
				{
				'minutes': 30,
				'selected': false
				},
				{
				'minutes': 60,
				'selected': false
				},
				{
				'minutes': 120,
				'selected': false
				}
			];

			$scope.DisplayFrequency = [
				{
				'value': 1,
				'string': 'Once',
				'selected': false
				},
				{
				'value': 2,
				'string': 'Daily',
				'selected': false
				},
				{
				'value': 3,
				'string': 'Weekly',
				'selected': false
				},
				{
				'value': 4,
				'string': 'Always',
				'selected': false
				},
			];

		}

		function dateRangeIsSetTo(dateRange) {
			return $scope.dateRange.start.isSame(dateRange.start) && $scope.dateRange.end.isSame(dateRange.end);
		}

		function dateRangeIsSetToCustom() {
			for (var i in $scope.dateRangeShortcuts) {
				var shortcut = $scope.dateRangeShortcuts[i];
				if (dateRangeIsSetTo(shortcut.dateRange)) {
					return false;
				}
			}
			return true;
		}

		function setDateRange(newDateRange) {
			$scope.dateRange.start = newDateRange.start;
			$scope.dateRange.end = newDateRange.end;
		}

	}

})();
