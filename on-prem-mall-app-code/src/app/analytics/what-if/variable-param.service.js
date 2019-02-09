(function () {
  'use strict';

  angular.module('shopperTrak')
    .factory('variableParam', variableParam);

  variableParam.$inject = [
    '$rootScope',
    'holdRules',
    'variableMetrics',
    'metricConstants',
  ];

  function variableParam($rootScope, holdRules, variableMetrics, metricConstants) {
    var variableParamClass = function(props) {
      var variableParam = this;

      _.each( _.keys(props), function(key) {
        variableParam[key] = props[key];
      });

      var metricFormat = getMetric(this.kpi);
      if(metricFormat !== undefined) {
        this.isCurrency = metricFormat.isCurrency !== undefined ? metricFormat.isCurrency : null;
        this.precision = metricFormat.precision !== undefined ? metricFormat.precision : null;
        this.prefixSymbol = metricFormat.prefixSymbol !== undefined ? metricFormat.prefixSymbol : null;
        this.suffixSymbol = metricFormat.suffixSymbol !== '' ? metricFormat.suffixSymbol : null;
      }

      var valWatcher = $rootScope.$watch( function() {
        return variableParam.val;
      }, function(newValue, oldValue) {

        if(newValue !== oldValue && !isNaN(newValue)) {
          var delta = newValue - variableParam.initialValue;
          var percentageChange = Number( ( (delta/variableParam.initialValue) * 100 ).toFixed(2) );
          variableParam.deltaChange = percentageChange !== Infinity ? percentageChange : '-';

          if(!variableParam.scaleInitialised) {
            var vals = ['initialValue', 'priorYear', 'priorPeriod'];

            var notNulls =  _.without(_.map(vals, function(_key) {
              var val = variableParam[_key];
              if(!isNaN(val)) {
                return val;
              }
            }), undefined);

            var min = _.min(notNulls);
            var max = _.max(notNulls);

            variableParam.min = Number( (min - (0.05 * min) ).toFixed(variableParam.precision) );
            variableParam.max = Number( (max + (0.05 * max) ).toFixed(variableParam.precision) );
            variableParam.scaleInitialised = true;
          }

        }

        if(newValue !== oldValue && variableMetrics.getIsEditing() === variableParam.kpi) {
          updateDependencies(variableParam.kpi);
        }

      });

      this.setLoadingStatus = function(_val) {
        variableParam.status = _val === true ? 'isLoading' : 'initialised';
        if(_val === true) {
          delete variableParam.val;
        }
      }

      this.setHold = function(_val) {
        variableParam.hold = _val;
        variableMetrics.setUserAlteredVariable(variableParam.kpi);
        setDependencyHold(variableParam.kpi);
      }

      this.setValue = function(_val) {
        if(variableMetrics.getIsEditing() === variableParam.kpi){
          return;
        }

        variableParam.val = _val;
      }

      this.update = function(prop) {
        if(prop === 'hold') {
          var newHoldVal = holdRules.getHoldValueFor(variableParam.kpi);
          variableParam.hold = newHoldVal !== undefined ? newHoldVal : variableParam.hold;
          holdRules.validateHold();
        }
      }

      this.destroyWatcher = function() {
        valWatcher();
      }

    }

    function getMetric(_kpi) {
      return _.findWhere(metricConstants.metrics, { value: _kpi });
    }

    function updateDependencies(_kpi) {
      holdRules.computeDependenciesFor(_kpi);
    }

    function setDependencyHold() {
      variableMetrics.updateVariables('hold');
    }

    return variableParamClass
  }
})();
