(function () {
  'use strict';

  angular.module('shopperTrak')
    .factory('variableMetrics', variableMetrics);

    //this is baically a collection of all variables in what if analysis

  variableMetrics.$inject = ['$filter'];

  function variableMetrics($filter) {
    var metricsCollection = {};
    var lastItemEdited = null;
    var _isEditing;

    function addVariables(_variables) {
      _.each(_variables, function(_variable) {
        metricsCollection[_variable.kpi] = _variable;
      });
    }

    function getMetricKeys() {
      return _.map(metricsCollection, 'kpi');
    }

    function formatValueFor(kpi, val) {
      var metricObject =  metricsCollection[kpi];
      var isCurrency = metricObject.isCurrency;
      var precision = metricObject.precision;
      var suffixSymbol = metricObject.suffixSymbol;
      var prefixSymbol = metricObject.prefixSymbol;

      return isCurrency ? $filter('formatCurrency')(val, prefixSymbol)  : suffixSymbol !== null ? $filter('formatNumber')(val, precision) + suffixSymbol : $filter('formatNumber')(val, precision);
    }

    function getMetricObjectFor(kpi) {
      return metricsCollection[kpi];
    }

    function setInitialValueFor(kpi, currentValue, priorPeriod, priorYear) {
      if(isNaN(currentValue)) {
        metricsCollection[kpi].status = 'no data';
        return;
      }

      var precision = metricsCollection[kpi].isCurrency === true ? 2 : metricsCollection[kpi].precision;
      metricsCollection[kpi].initialValue =  Number( currentValue.toFixed(precision) );
      metricsCollection[kpi].val = Number( currentValue.toFixed(precision) );

      if(priorPeriod !== '-') {
        metricsCollection[kpi].priorPeriod = Number( priorPeriod.toFixed(precision) );
      }

      if(priorYear !== '-') {
        metricsCollection[kpi].priorYear = Number( priorYear.toFixed(precision) );
      }

      metricsCollection[kpi].status = 'initialised';
     }

     function reset() {
       _isEditing = null;
     }

    function setIsEditing(kpi) {
      _isEditing = kpi;
    }

    function getIsEditing() {
      return _isEditing;
    }

    function isHeld(_kpi) {
      return metricsCollection[_kpi].hold;
    }

    function setUserAlteredVariable(_kpi) {
      lastItemEdited = _kpi;
    }

    function getValueFor(_kpi) {
      var precision = metricsCollection[_kpi].isCurrency === true ? 2 : metricsCollection[_kpi].precision;
      var multiplier = metricsCollection[_kpi].suffixSymbol === '%' ? 0.01 : 1; //for percentage values;
      return Number( (metricsCollection[_kpi].val * multiplier).toFixed(precision) );
    }

    function getInitialValueFor(_kpi) {
      var precision = metricsCollection[_kpi].isCurrency === true ? 2 : metricsCollection[_kpi].precision;
      return Number( metricsCollection[_kpi].initialValue.toFixed(precision) );
    }

    function getModel(_kpi) {
      return metricsCollection[_kpi];
    }

    function setHoldFor(_kpi, _val) {
      metricsCollection[_kpi].hold = _val;
    }

    function updateValueFor(_kpi, _val, _emitUpdate) {
      metricsCollection[_kpi].setValue(_val, _emitUpdate);
    }

    function getCollection() {
      return metricsCollection;
    }

    function updateVariables(prop) {
      _.each(metricsCollection, function(_collection) {
        if(_collection.kpi !== lastItemEdited) {
          _collection.update(prop);
        }
      });
    }

    function setLoading(_val) {
      _.each(metricsCollection, function(_collection) {
        _collection.setLoadingStatus(_val);
      });
    }

    return {
      addVariables: addVariables,
      getMetricKeys: getMetricKeys,
      formatValueFor: formatValueFor,
      setInitialValueFor: setInitialValueFor,
      reset: reset,
      getMetricObjectFor: getMetricObjectFor,
      updateVariables: updateVariables,
      updateValueFor: updateValueFor,
      setIsEditing: setIsEditing,
      getIsEditing: getIsEditing,
      getCollection: getCollection,
      setHoldFor: setHoldFor,
      isHeld: isHeld,
      setUserAlteredVariable: setUserAlteredVariable,
      getValueFor: getValueFor,
      getInitialValueFor: getInitialValueFor,
      getModel: getModel,
      setLoading: setLoading
    }
  }
})();
