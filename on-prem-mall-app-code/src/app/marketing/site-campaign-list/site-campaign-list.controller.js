(function() {
	'use strict';
	angular.module('shopperTrak').controller('MarketingCampaignListController', MarketingCampaignListController);

	MarketingCampaignListController.$inject = [
		'$scope',
		'currentOrganization'
	];

	function MarketingCampaignListController($scope, currentOrganization) {

		activate();

		function activate() {

			$scope.currentOrganization = currentOrganization;

			$scope.ActiveCampaigns = [
				{
					'id': 1,
					'name': 'Campaign name lorem ipsum',
					'added': '06/15/2015',
					'expires': '09/30/2015'
				},
				{
					'id': 2,
					'name': 'Another campaign',
					'added': '07/19/2015',
					'expires': '10/31/2015'
				},
				{
					'id': 3,
					'name': 'Third active campaign',
					'added': '08/01/2015',
					'expires': '11/30/2015'
				}
			];

			$scope.InactiveCampaigns = [
				{
					'id': 4,
					'name': 'First inactive campaign',
					'added': '01/15/2015',
					'expires': '05/30/2015'
				},
				{
					'id': 5,
					'name': 'Second inactive campaign',
					'added': '02/19/2015',
					'expires': '06/30/2015'
				},
				{
					'id': 6,
					'name': 'Third inactive campaing',
					'added': '03/01/2015',
					'expires': '07/30/2015'
				}
			];

		}

	}

})();
