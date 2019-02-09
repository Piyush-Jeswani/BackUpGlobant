class metricNameService {
  constructor ($q, $translate, SubscriptionsService, ObjectUtils, metricConstants, LocalizationService) {
    this.$q = $q;
    this.$translate = $translate;
    this.SubscriptionsService = SubscriptionsService;
    this.ObjectUtils = ObjectUtils;
    this.metricConstants = metricConstants;
    this.LocalizationService = LocalizationService;
  }
  /**
    * Returns a list of metrics that have been updated to contain translations and metric names.
    * This checks the organization for any custom names, before falling back to the translated short names.
    * @param {object} organization the current organization
    * @returns {object} A promise containing the updated metrics.
    */
  getMetricNames (organization) {
    const deferred = this.$q.defer();

    const metrics = this.getMetrics(organization);

    this.translateMetricNames(metrics).then(translations => {
      _.each(metrics, metric => {
        metric.translatedShortLabel = translations[metric.shortTranslationLabel];

        let displayName = this.getOrgCustomName(metric.kpi, organization);

        if (_.isUndefined(displayName)) {
          displayName = metric.translatedShortLabel;
        }

        metric.displayName = displayName;
      });
      deferred.resolve(metrics);

    }).catch(error => {
      deferred.reject(error);
    });

    return deferred.promise;
  }

  /**
      * Applies the specified organizations custom names to the metricsConstants
      * This should be called when the current organization changes, and on app start
      * @param {object} organization the current organization
      * @returns {object} A promise containing the updated metrics.
      */
  applyCustomMetricNames (organization) {
    const deferred = this.$q.defer();

    const locale = this.LocalizationService.getCurrentLocaleSetting();

    this.$translate.use(locale).then(() => {
      this.getMetricNames(organization)
        .then(updatedMetrics => {
          const newMetricConstants = [];

          _.each(this.metricConstants.metrics, metric => {
            const updatedMetric = _.findWhere(updatedMetrics, { kpi: metric.kpi, value: metric.value });

            if (!_.isUndefined(updatedMetric)) {
              metric = updatedMetric;
            }

            newMetricConstants.push(metric);
          });

          this.metricConstants.metrics = newMetricConstants;


          deferred.resolve(this.metricConstants.metrics);
        })
        .catch(error => {
          deferred.reject(error);
        });
    });

    return deferred.promise;
  }

  /**
    * Returns a list of all keys that the API is expecting to be present in 
    * organization.metric_labels
    * @returns {array<string>} A list of strings that represent the keys
    */
  getAllKeys () {
    return [
      'traffic',
      'sales',
      'labor_hours',
      'conversion',
      'abandonment_rate',
      'draw_rate',
      'dwelltime',
      'gsh',
      'transactions',
      'loyalty',
      'opportunity',
      'upt',
      'star',
      'ats',
      'aur',
      'sps',
      'splh',
      'average_traffic',
      'traffic_pct',
      'average_sales',
      'average_percent_shoppers',
      'peel_off'
    ];
  }

  /**
    * Returns a list of all widgets that feature renameable metrics.
    * This is used during the widget export process
    * @returns {array<string>} A list of strings that the widgets
    */
  getRenameableWidgets () {
    return [
      'power_hours',
      'traffic',
      'traffic_per_weekday',
      'average_percent_shoppers',
      'detail_draw_rate',
      'detail_opportunity',
      'visitor_behaviour_traffic',
      'gross_shopping_hours',
      'detail_dwell_time',
      'sales_widget',
      'conversion_widget',
      'ats_sales_widget',
      'upt_sales_widget',
      'labor_hours_widget',
      'star_labor_widget',
      'sales',
      'conversion',
      'ats',
      'star',
      'peel_off'
    ];
  }

  /**
    * Returns a copy of the list of metrics that have been stored in the 
    * subscription service for the org passed in. A copy can be changed
    * without affecting the source.
    * @param {object} organization the current organization
    * @returns {array} returns metrics array from the subscription service for org passed in.
    */
  getMetrics (organization) {
    const metrics = this.SubscriptionsService.getMetrics(organization);

    const metricsCopy = angular.copy(metrics);

    return metricsCopy;
  }

  /**
    * Returns custom metric names for an organization.
    * @param {string} kpiName for the current organization.
    * @param {object} organization the current organization.
    * @returns {array} returns org custom names.
    */
  getOrgCustomName (kpiName, organization) {
    if (this.ObjectUtils.isNullOrUndefinedOrEmptyObject(organization.metric_labels)) {
      return;
    }

    if (this.ObjectUtils.isNullOrUndefinedOrBlank(organization.metric_labels[kpiName])) {
      return;
    }

    return organization.metric_labels[kpiName];
  }

  translateMetricNames (metrics) {
    const transkeys = _.pluck(metrics, 'shortTranslationLabel');

    return this.$translate(transkeys);
  }
}

angular.module('shopperTrak')
  .service('metricNameService', metricNameService);

metricNameService.$inject = ['$q',
  '$translate',
  'SubscriptionsService',
  'ObjectUtils',
  'metricConstants',
  'LocalizationService'];

