(function() {
  'use strict';

  angular.module('shopperTrak').factory('metricsHelper', ['$q', '$translate', 'metricConstants', 'SubscriptionsService', 'ObjectUtils', 'NumberUtils', metricsHelper]);

  function metricsHelper(
    $q,
    $translate,
    metricConstants,
    SubscriptionsService,
    ObjectUtils,
    NumberUtils
  ) {

    function getTotalForMetric(metric, tableData, enterExits) {
      var total;
      if(ObjectUtils.isNullOrUndefinedOrEmpty(tableData)) {
        return total;
      }
      var count = 0 ;
      _.each(tableData, function(row) {
        if(isCalculatedMetricValueValid(row, metric, enterExits)) {
          if (ObjectUtils.isNullOrUndefined(total)) {
            total = 0;
          }
          count += 1;
          total += getCalculatedMetricValue(row, metric, enterExits);
        }

      });

      if ( metric.calculatedMetric === true && count > 0 ) {
        total = total/count;
      }

      return total;
    }

    function filterSubscriptions(metrics, activeSubscriptions, realTime, currentOrganization) {
      if(realTime === true) {
        return filterRealTimeSubscriptions(metrics, activeSubscriptions);
      }

      return _.filter(metrics, function(metric) {
        return SubscriptionsService.hasSubscriptions(metric.requiredSubscriptions, currentOrganization);
      });
    }

    function filterRealTimeSubscriptions(obj, activeSubscriptions) {
      return _.filter(obj, function(subClass) {
        return !ObjectUtils.isNullOrUndefinedOrBlank(subClass.realTimeSubscription) &&
          _.contains(activeSubscriptions, subClass.realTimeSubscription)&&
          hasRequiredPermissions (subClass.realTimeRequiredPermissions, activeSubscriptions);
      });
    }

    function hasRequiredPermissions (requiredSubscriptions, activeSubscriptions) {
      if(ObjectUtils.isNullOrUndefinedOrEmpty(requiredSubscriptions)) {
        return true;
      }

      var hasRequiredPermission = true;
       _.each(requiredSubscriptions, function(permission) {
        if(!_.contains(activeSubscriptions, permission)) {
          hasRequiredPermission = false;
          return false;
        }
      });
      return hasRequiredPermission;
    }

    function getMetricDisplayInformation(activeSubscriptions, realTime, currentOrganization) {
      var metricDisplayInfo = [];

      var metricsWithSupscriptios = filterSubscriptions(metricConstants.metrics, activeSubscriptions, realTime, currentOrganization);
      _.each(metricsWithSupscriptios, function(metric) {
        addMetricDisplayInfo(metricDisplayInfo, metric, realTime);
      });

      return metricDisplayInfo;
    }

    function addMetricDisplayInfo(metricDisplayInfo, metric, realTime) {
      var info = getUpdatedMetric(metric, realTime);
      if (!ObjectUtils.isNullOrUndefined(info)) {
        metricDisplayInfo.push(info);
      }
    }

    function getUpdatedMetric(metricInfo, realTime) {
      metricInfo.apiPropertyName = metricInfo.kpi;
      metricInfo.apiReturnkey = metricInfo.value;
      metricInfo.calculatedMetric = false;
      metricInfo.dependencies = [];
      metricInfo.key = metricInfo.value;
      if(!realTime) {
        metricInfo.displayName = metricInfo.displayName;
      }

      return metricInfo;
    }

    function getApiParameterKey(value, enterExits) {
      if (!ObjectUtils.isNullOrUndefinedOrBlank(enterExits) && (value === 'enterExit' || value.indexOf('traffic') > -1) ){
        var val = enterExits.toLowerCase();
        var enters = val.indexOf('enter') > -1;
        var exits = val.indexOf('exit') > -1;
        if (enters === true || exits === true) {
          return val;
        }
      }

      return value;
    }

    function getCalculatedMetricValue(item, metric, enterExits) {
      if (metric.calculatedMetric !== true) {
        return getMetricValue(item, getApiParameterKey(metric.apiReturnkey, enterExits));
      }

      switch (metric.key) {
        case 'conversion':
          return getConversion(getMetricValue(item, getApiParameterKey(metric.dependencies[0], enterExits)), getMetricValue(item, getApiParameterKey(metric.dependencies[1], enterExits)));
        case 'star':
          return getStar(getMetricValue(item, getApiParameterKey(metric.dependencies[0], enterExits)), getMetricValue(item, getApiParameterKey(metric.dependencies[1], enterExits)));
        case 'ats':
          return getAts(getMetricValue(item, getApiParameterKey(metric.dependencies[0], enterExits)), getMetricValue(item, getApiParameterKey(metric.dependencies[1], enterExits)));
        default:
          return getMetricValue(item, getApiParameterKey(metric.apiReturnkey, enterExits));
      }
    }

    function getRoundedNumber(value, decimalPlaces) {
      decimalPlaces = decimalPlaces || 0;
      return Number(Math.round(value + 'e' + decimalPlaces) + 'e-' + decimalPlaces);
    }

    function getDecimalPlacesLength(value) {
      var match = ('' + value).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/); // https://regex101.com/r/cSOSzK/1
      if (!match) { return 0; }
      return Math.max(
        0,
        // Number of digits right of decimal point.
        (match[1] ? match[1].length : 0) -
        // Adjust for scientific notation.
        (match[2] ? +match[2] : 0));
    }

    function getMetricTranskey(apiProperty, metricApiLookup) {
      return _.findWhere(metricApiLookup, {
        apiProperty: apiProperty
      }).transkey;
    }

    function getMetricApiProperty(shortTranslationLabel, metricApiLookup) {
      return _.find(metricApiLookup, function (item) {
        return item.transkey === shortTranslationLabel || item.shortTranslationLabel === shortTranslationLabel;
      }).apiProperty;
    }

    function getMetricChartLocation(shortTranslationLabel, metricApiLookup) {
      return _.find(metricApiLookup, function (item) {
        return item.transkey === shortTranslationLabel || item.shortTranslationLabel === shortTranslationLabel;
      }).chartLocation;
    }

    function getValidNumber(value) {
      if (!ObjectUtils.isNullOrUndefinedOrBlank(value) &&
        _.isString(value)) {
        value = Number(value);
        return _.isNumber(value) && !_.isNaN(value) && isFinite(value) ? value : 0;
      }
      return _.isNumber(value) && !_.isNaN(value) && isFinite(value) ? value : 0;
    }

    function isCalculatedMetricValueValid(item, metric, enterExits) {
      if (ObjectUtils.isNullOrUndefined(item)) {
        return false;
      }

      if (metric.calculatedMetric !== true) {
        return isMetricValueValidNumber(item, metric.apiReturnkey, enterExits);
      }

      switch (metric.key) {
        case 'conversion':
          return isMetricValueValidNumber(item, metric.dependencies[0], enterExits) &&
                 isMetricValueValidNonZeroNumber(item, metric.dependencies[1], enterExits);
        case 'star':
          return isMetricValueValidNumber(item, metric.dependencies[0], enterExits) &&
                 isMetricValueValidNonZeroNumber(item, metric.dependencies[1], enterExits);
        case 'ats':
          return isMetricValueValidNumber(item, metric.dependencies[0], enterExits) &&
                 isMetricValueValidNonZeroNumber(item, metric.dependencies[1], enterExits);
        default:
          return isMetricValueValidNumber(item, metric.apiReturnkey, enterExits);
      }
    }

    function isMetricValueValidNumber(item, apiPropertyKey, enterExits) {
      var apiParameterKey = getApiParameterKey(apiPropertyKey, enterExits);
      return NumberUtils.isValidNumber(item[apiParameterKey]);
    }

    function isMetricValueValidNonZeroNumber(item, apiPropertyKey, enterExits) {
      var apiParameterKey = getApiParameterKey(apiPropertyKey, enterExits);
      return NumberUtils.isValidNonZeroNumber(item[apiParameterKey]);
    }

    function getStar(traffic, labor) {
      return getValidNumber(Math.round(traffic / labor));
    }

    function getAts(sales, transaction) {
      return getValidNumber(sales / transaction);
    }

    function getConversion(traffic, transaction) {
      return getValidNumber((transaction / traffic) * 100);
    }

    function getSps(sales, traffic) {
      return getValidNumber(sales / traffic);
    }

    function getSplh(sales, labor) {
      return getValidNumber(sales / labor);
    }

    function getMetricValue(item, apiPropertyName) {
      if (ObjectUtils.isNullOrUndefined(item) ||
        ObjectUtils.isNullOrUndefinedOrBlank(item[apiPropertyName])) {
        return 0;
      }

      return NumberUtils.getNumberValue(item[apiPropertyName]);
    }

    function getMetricInfo(value, metricLookup, metrics, noOverWriteDisplayName) {
      if(_.isUndefined(metrics)) {
        metrics = metricConstants.metrics;
      }

      var metricInfo = angular.copy(_.find(metrics, function(item){
        return item.value === value || item.key === value || item.kpi === value;
      }));

      var metricProperty = getMetricProperty(metricInfo, metricLookup);
      if (!ObjectUtils.isNullOrUndefined(metricProperty)) {
        metricInfo.apiPropertyName = getMetricApiPropertyName(metricProperty);
        metricInfo.calculatedMetric = metricProperty.calculatedMetric;
        metricInfo.dependencies = metricProperty.dependencies;
        metricInfo.key = metricProperty.key;
        if(noOverWriteDisplayName !== true){
          metricInfo.displayName = metricProperty.displayName;
        }
      }

      return metricInfo;
    }

    function getMetricApiPropertyName(metricProperty) {
      if(!ObjectUtils.isNullOrUndefinedOrBlank(metricProperty.apiPropertyName)) {
        return metricProperty.apiPropertyName;
      }

      if(!ObjectUtils.isNullOrUndefinedOrBlank(metricProperty.apiProperty)) {
        return metricProperty.apiProperty;
      }

      return  metricProperty.apiReturnkey;
    }

    function getMetricProperty(metric, metricLookup) {
      if (ObjectUtils.isNullOrUndefined(metric)) {
        return;
      }

      return _.find(metricLookup, function (item) {
        return item.value === metric.value || item.key === metric.value || item.kpi === metric.value;
      });
    }

    function translateMetrics() {
      var deferred = $q.defer();
      var metricTransKeys = _.pluck(metricConstants.metrics, 'shortTranslationLabel');
      $translate(metricTransKeys).then(function (translations) {
        _.each(metricConstants.metrics, function (metric) {
          metric.translatedLabel = translations[metric.shortTranslationLabel];
        });
        deferred.resolve(metricConstants);
      });
      return deferred.promise;
    }

    return {
      getMetricDisplayInformation: getMetricDisplayInformation,
      getConversion: getConversion,
      getAts: getAts,
      getStar: getStar,
      getSplh: getSplh,
      getSps: getSps,
      getCalculatedMetricValue: getCalculatedMetricValue,
      getTotalForMetric: getTotalForMetric,
      getMetricInfo: getMetricInfo,
      getMetricTranskey: getMetricTranskey,
      getMetricApiProperty: getMetricApiProperty,
      getMetricChartLocation: getMetricChartLocation,
      getRoundedNumber: getRoundedNumber,
      getDecimalPlacesLength: getDecimalPlacesLength,
      getValidNumber: getValidNumber,
      getMetricValue: getMetricValue,
      isCalculatedMetricValueValid: isCalculatedMetricValueValid,
      isMetricValueValidNumber: isMetricValueValidNumber,
      translateMetrics: translateMetrics
    };
  }
})();
