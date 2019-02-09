(function() {
  'use strict';

  class adminKpiLibraryController {
    constructor(currentOrganization, metricNameService) {
      this.currentOrganization = currentOrganization;
      this.metricNameService = metricNameService;
    }

    $onInit() {
      this.getMetrics();
      this.changeSort()
    }

  /**
   * Changes the sort
   *
   * @param {array<metric>} metrics - The metrics
   * @param {string} sortBy - Sort by string
   */
    changeSort (metrics, sortBy) {
      let sortedMetrics = _.sortBy(metrics, sortBy);
      this.sortReverse = (this.sortBy === sortBy && this.sortReverse === false);
      this.sortBy = sortBy;

      if(this.sortReverse === true) {
        sortedMetrics = sortedMetrics.reverse();
      }

      this.metrics = sortedMetrics;
    }

    getMetrics() {
      this.metricNameService.getMetricNames(this.currentOrganization)
        .then(metrics => {
          this.changeSort(metrics, 'translatedShortLabel');
        })
        .catch(error => {
          console.error(error);
        });
    }
  }

  angular.module('shopperTrak')
  .controller('AdminKpiLibraryController', adminKpiLibraryController);

  adminKpiLibraryController.$inject = [
    'currentAdminOrganization',
    'metricNameService'
  ];

})();
