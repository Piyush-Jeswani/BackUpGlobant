(function () {
  'use strict';

  angular.module('shopperTrak')
    .factory('holdRules', holdRules);

  //this is baically a collection of all variables in what if analysis

  holdRules.$inject = ['$rootScope', 'variableMetrics'];

  function holdRules($rootScope, variableMetrics) {

    function calculateAts() {
      var _valUpdate = variableMetrics.getValueFor('sales') / ( variableMetrics.getValueFor('conversion') * variableMetrics.getValueFor('traffic') );
      variableMetrics.updateValueFor('ats', _valUpdate);
      variableMetrics.updateValueFor( 'sps', _valUpdate * variableMetrics.getValueFor('conversion') );

      if( !variableMetrics.isHeld('aur') ) {
        variableMetrics.updateValueFor('aur', _valUpdate / variableMetrics.getValueFor('upt') );
      }

      if( !variableMetrics.isHeld('upt') ) {
        variableMetrics.updateValueFor('upt', _valUpdate / variableMetrics.getValueFor('aur') );
      }
    }

    var holdParams = {
      transactions: function() {
        if( variableMetrics.isHeld('traffic') && variableMetrics.isHeld('conversion') && !variableMetrics.isHeld('sales') ) {
          return true;
        }
        else if ( !variableMetrics.isHeld('sales') && !variableMetrics.isHeld('ats') ) {
          return true;
        }
        else if ( variableMetrics.isHeld('traffic') && variableMetrics.isHeld('conversion') ) {
          return true;
        }
        else
        {
          return false;
        }
      },

      sales: function() {
        if( variableMetrics.isHeld('transactions') && _.filter([ variableMetrics.isHeld('conversion'), variableMetrics.isHeld('traffic') ], function(holdValue) { return holdValue === false; }).length > 1 ) {
          return true;
        }
        else if( variableMetrics.isHeld('traffic') && variableMetrics.isHeld('conversion') && variableMetrics.isHeld('ats') ) {
          return true;
        }
        else {
          return false;
        }
      },

      traffic: function() {
        //ats
        //If sales does not have a hold, vary sales according to the ATS change while keeping the siblings constant.
        if( !variableMetrics.isHeld('ats') && !variableMetrics.isHeld('sales') ) {
          return true;
        }
        //If sales has a hold, either traffic or conversion must have a hold. If neither does, default traffic to hold.
        else if ( !variableMetrics.isHeld('ats') && variableMetrics.isHeld('sales') && !variableMetrics.isHeld('conversion') ) {
          return true;
        }
        //conversion
        //If neither transactions nor sales have a hold, they should change independent with siblings remaining constant
        else if ( !variableMetrics.isHeld('conversion') && !variableMetrics.isHeld('sales') && !variableMetrics.isHeld('transactions') ) {
          return true;
        }
        //If either transactions or sales have a hold, one of ATS or traffic needs a hold. By default, hold traffic
        else if ( !variableMetrics.isHeld('conversion') && !variableMetrics.isHeld('ats') && (variableMetrics.isHeld('sales') || variableMetrics.isHeld('transactions'))  ) {
          return true;
        }
        else if ( !variableMetrics.isHeld('transactions') && !variableMetrics.isHeld('conversion') ) {
          return true;
        }

        else if ( variableMetrics.isHeld('transactions') && variableMetrics.isHeld('conversion') ) {
          return true;
        }
        //none of the above
        else {
          return false;
        }
      },

      ats: function() {
        //conversion
        //If neither transactions nor sales have a hold, they should change independent with siblings remaining constant
        if( !variableMetrics.isHeld('conversion') && !variableMetrics.isHeld('sales')  && !variableMetrics.isHeld('transactions') ) {
          return true;
        }

        //traffic
        //If neither transactions nor sales have a hold, they should change independent with siblings remaining constant
        else if( !variableMetrics.isHeld('traffic') && !variableMetrics.isHeld('sales')  && !variableMetrics.isHeld('transactions') ) {
          return true;
        }

        if( variableMetrics.isHeld('transactions') && !variableMetrics.isHeld('sales') ) {
          return true;
        }

        else if( variableMetrics.isHeld('transactions') && variableMetrics.isHeld('sales') ) {
          return true;
        }
        else if ( !variableMetrics.isHeld('transactions') && !variableMetrics.isHeld('sales') && ( !variableMetrics.isHeld('traffic') || !variableMetrics.isHeld('conversion') ) ) {
          return true;
        }
        else if ( !variableMetrics.isHeld('transactions') && !variableMetrics.isHeld('sales') ) {
          return true;
        }

        //none of the above
        else {
          return false;
        }

      },

      conversion: function() {
        //ats
        //If sales does not have a hold, vary sales according to the ATS change while keeping the siblings constant.
        if( !variableMetrics.isHeld('ats') && !variableMetrics.isHeld('sales') ) {
          return true;
        }
        //If sales has a hold, either traffic or conversion must have a hold. If neither does, default traffic to hold.
        else if ( !variableMetrics.isHeld('ats') && variableMetrics.isHeld('sales') && !variableMetrics.isHeld('traffic') ) {
          return true;
        }

        //traffic
        //If neither transactions nor sales have a hold, they should change independent with siblings remaining constant
        else if ( !variableMetrics.isHeld('traffic') && !variableMetrics.isHeld('sales') && !variableMetrics.isHeld('transactions') ) {
          return true;
        }
        //If either transactions or sales have a hold, one of ATS or conversion needs a hold. By default, hold ATS
        else if ( !variableMetrics.isHeld('traffic') && !variableMetrics.isHeld('ats') && (variableMetrics.isHeld('sales') || variableMetrics.isHeld('transactions'))  ) {
          return true;
        }

        //edit rule 4
        else if ( variableMetrics.isHeld('transactions') && !variableMetrics.isHeld('ats') && !variableMetrics.isHeld('sales')  ) {
          return true;
        }

        //Traffic or conversion must have a lock on them. If this is not the case, lock traffic and continue
        else if ( !variableMetrics.isHeld('transactions') && !variableMetrics.isHeld('traffic') ) {
          return true;
        }

        else if ( variableMetrics.isHeld('transactions') && variableMetrics.isHeld('traffic') ) {
          return true;
        }
        //none of the above
        else {
          return false;
        }

      },

      upt: function() {
        //ats
        //UPT or AUR must have a hold
        if( !variableMetrics.isHeld('ats') && !variableMetrics.isHeld('aur') ) {
          return true;
        }
        else if ( variableMetrics.isHeld('ats') && variableMetrics.isHeld('aur') ) {
          return true;
        }
        //none of the above
        else {
          return false;
        }
      },

      aur: function() {
        //ats
        //UPT or AUR must have a hold
        if( !variableMetrics.isHeld('ats') && !variableMetrics.isHeld('upt') ) {
          return true;
        }
        else if ( variableMetrics.isHeld('ats') && variableMetrics.isHeld('upt') ) {
          return true;
        }
        //none of the above
        else {
          return false;
        }
      }
    }

    var updateParams = {
      sales: function() {
        //traffic, ats,conversion
        var _valUpdate;

        if(!variableMetrics.isHeld('conversion')) {
          _valUpdate = variableMetrics.getValueFor('sales') / ( variableMetrics.getValueFor('traffic') * variableMetrics.getValueFor('ats') );
          variableMetrics.updateValueFor( 'conversion', _valUpdate * 100 );
          variableMetrics.updateValueFor( 'sps', _valUpdate * variableMetrics.getValueFor('ats') );
        }

        else if(!variableMetrics.isHeld('traffic')) {
          _valUpdate = variableMetrics.getValueFor('sales') / ( variableMetrics.getValueFor('conversion') * variableMetrics.getValueFor('ats') );
          variableMetrics.updateValueFor('traffic', _valUpdate);
        }

        else if(!variableMetrics.isHeld('ats')) {
          calculateAts();
        }

        if(!variableMetrics.isHeld('transactions')) {
          _valUpdate = variableMetrics.getValueFor('traffic') * variableMetrics.getValueFor('conversion');
          variableMetrics.updateValueFor('transactions', _valUpdate);
        }

      },

      traffic: function() {
        //transactions, sales
        var _valUpdate;

        if(!variableMetrics.isHeld('sales')) {
          _valUpdate = variableMetrics.getValueFor('traffic') * variableMetrics.getValueFor('conversion') * variableMetrics.getValueFor('ats');
          variableMetrics.updateValueFor('sales', _valUpdate);
        }

        if(!variableMetrics.isHeld('transactions')) {
          _valUpdate = variableMetrics.getValueFor('traffic') * variableMetrics.getValueFor('conversion');
          variableMetrics.updateValueFor('transactions', _valUpdate);
        }

        //transactions is mostlikely constant
        if(!variableMetrics.isHeld('conversion')) {
          _valUpdate = variableMetrics.getValueFor('transactions') / variableMetrics.getValueFor('traffic');

          variableMetrics.updateValueFor('conversion', _valUpdate * 100);

          variableMetrics.updateValueFor( 'sps', _valUpdate * variableMetrics.getValueFor('ats') );
        }

        if(!variableMetrics.isHeld('ats')) {
          calculateAts();
        }


      },

      conversion: function() {
        //transactions, sales, traffic
        var _valUpdate;

        variableMetrics.updateValueFor('sps', variableMetrics.getValueFor('conversion') * variableMetrics.getValueFor('ats') );

        if(!variableMetrics.isHeld('sales')) {
          _valUpdate = variableMetrics.getValueFor('traffic') * variableMetrics.getValueFor('conversion') * variableMetrics.getValueFor('ats');
          variableMetrics.updateValueFor('sales', _valUpdate);
        }

        if(!variableMetrics.isHeld('transactions')) {
          _valUpdate = variableMetrics.getValueFor('traffic') * variableMetrics.getValueFor('conversion');
          variableMetrics.updateValueFor('transactions', _valUpdate);
        }

        //transactions is mostlikely constant
        if(!variableMetrics.isHeld('traffic')) {
          _valUpdate = variableMetrics.getValueFor('transactions') / variableMetrics.getValueFor('conversion');
          variableMetrics.updateValueFor('traffic', _valUpdate);
        }

        if(!variableMetrics.isHeld('ats')) {
          calculateAts();
        }

      },

      ats: function() {
        //upt, aur, transactions, sales
        var _valUpdate;

        variableMetrics.updateValueFor('sps', variableMetrics.getValueFor('conversion') * variableMetrics.getValueFor('ats') );

        if(!variableMetrics.isHeld('sales')) {
          _valUpdate = variableMetrics.getValueFor('traffic') * variableMetrics.getValueFor('conversion') * variableMetrics.getValueFor('ats');
          variableMetrics.updateValueFor('sales', _valUpdate);
        }

        if(!variableMetrics.isHeld('transactions')) {
          _valUpdate = variableMetrics.getValueFor('sales') / variableMetrics.getValueFor('ats');
          variableMetrics.updateValueFor('transactions', _valUpdate);
        }

        if( !variableMetrics.isHeld('aur') ) {
          _valUpdate = variableMetrics.getValueFor('ats') / variableMetrics.getValueFor('upt');
          variableMetrics.updateValueFor('aur', _valUpdate);
        }
        else if (!variableMetrics.isHeld('upt')) {
          _valUpdate = variableMetrics.getValueFor('ats') / variableMetrics.getValueFor('aur');
          variableMetrics.updateValueFor('upt', _valUpdate);
        }

        if(!variableMetrics.isHeld('conversion')) {
          _valUpdate = variableMetrics.getValueFor('transactions') / variableMetrics.getValueFor('traffic');
          variableMetrics.updateValueFor('conversion', _valUpdate * 100);
        }
        else if ( !variableMetrics.isHeld('traffic') ) {
          _valUpdate = variableMetrics.getValueFor('transactions') / variableMetrics.getValueFor('conversion');
          variableMetrics.updateValueFor('traffic', _valUpdate);
        }

      },

      transactions: function() {
        //traffic, ats,conversion
        var _valUpdate;

        if(!variableMetrics.isHeld('conversion')) {
          _valUpdate = variableMetrics.getValueFor('transactions') / variableMetrics.getValueFor('traffic');
          variableMetrics.updateValueFor('conversion', _valUpdate * 100);
          variableMetrics.updateValueFor('sps', variableMetrics.getValueFor('conversion') * variableMetrics.getValueFor('ats') );
        }
        else if(!variableMetrics.isHeld('traffic')) {
          _valUpdate = variableMetrics.getValueFor('transactions') / variableMetrics.getValueFor('conversion');
          variableMetrics.updateValueFor('traffic', _valUpdate);
        }

        if(!variableMetrics.isHeld('ats')) {
          _valUpdate = variableMetrics.getValueFor('sales') / variableMetrics.getValueFor('transactions');

          variableMetrics.updateValueFor('ats', _valUpdate);
          variableMetrics.updateValueFor('sps', variableMetrics.getValueFor('conversion') * _valUpdate );

          if( !variableMetrics.isHeld('aur') ) {
            variableMetrics.updateValueFor('aur', _valUpdate / variableMetrics.getValueFor('upt') );
          }

          if( !variableMetrics.isHeld('upt') ) {
            variableMetrics.updateValueFor('upt', _valUpdate / variableMetrics.getValueFor('aur') );
          }
        }

        if(!variableMetrics.isHeld('sales')) {
          _valUpdate = variableMetrics.getValueFor('traffic') * variableMetrics.getValueFor('conversion') * variableMetrics.getValueFor('ats');
          variableMetrics.updateValueFor('sales', _valUpdate);
        }
      },

      upt: function() {
        //ats, aur
        var _valUpdate;

        if(variableMetrics.isHeld('ats') && !variableMetrics.isHeld('aur')) {
          _valUpdate = variableMetrics.getValueFor('ats') / variableMetrics.getValueFor('upt');
          variableMetrics.updateValueFor('aur', _valUpdate);
        }

        if( !variableMetrics.isHeld('ats') ) {

          _valUpdate = variableMetrics.getValueFor('aur') * variableMetrics.getValueFor('upt');
          variableMetrics.updateValueFor('ats', _valUpdate);

          variableMetrics.updateValueFor('sps', variableMetrics.getValueFor('conversion') * _valUpdate );

          if(!variableMetrics.isHeld('sales')) {
            _valUpdate = variableMetrics.getValueFor('traffic') * variableMetrics.getValueFor('conversion') * variableMetrics.getValueFor('ats');
            variableMetrics.updateValueFor('sales', _valUpdate);
          }

          if(!variableMetrics.isHeld('transactions')) {
            _valUpdate = variableMetrics.getValueFor('sales') / variableMetrics.getValueFor('ats');
            variableMetrics.updateValueFor('transactions', _valUpdate);
          }

          if(!variableMetrics.isHeld('conversion')) {
            _valUpdate = variableMetrics.getValueFor('transactions') / variableMetrics.getValueFor('traffic');
            variableMetrics.updateValueFor('conversion', _valUpdate * 100);
          }
          else if ( !variableMetrics.isHeld('traffic') ) {
            _valUpdate = variableMetrics.getValueFor('transactions') / variableMetrics.getValueFor('conversion');
            variableMetrics.updateValueFor('traffic', _valUpdate);
          }

        }

      },

      aur: function() {
        //upt, aur

        var _valUpdate;

        if(variableMetrics.isHeld('ats') && !variableMetrics.isHeld('upt')) {
          _valUpdate = variableMetrics.getValueFor('ats') / variableMetrics.getValueFor('aur');
          variableMetrics.updateValueFor('upt', _valUpdate, false);
        }

        if( !variableMetrics.isHeld('ats') ) {
          _valUpdate = variableMetrics.getValueFor('aur') * variableMetrics.getValueFor('upt');
          variableMetrics.updateValueFor('ats', _valUpdate);

          variableMetrics.updateValueFor('sps', variableMetrics.getValueFor('conversion') * _valUpdate );

          if(!variableMetrics.isHeld('sales')) {
            _valUpdate = variableMetrics.getValueFor('traffic') * variableMetrics.getValueFor('conversion') * variableMetrics.getValueFor('ats');
            variableMetrics.updateValueFor('sales', _valUpdate);
          }

          if(!variableMetrics.isHeld('transactions')) {
            _valUpdate = variableMetrics.getValueFor('sales') / variableMetrics.getValueFor('ats');
            variableMetrics.updateValueFor('transactions', _valUpdate);
          }

          if(!variableMetrics.isHeld('conversion')) {
            _valUpdate = variableMetrics.getValueFor('transactions') / variableMetrics.getValueFor('traffic');
            variableMetrics.updateValueFor('conversion', _valUpdate * 100);
          }
          else if ( !variableMetrics.isHeld('traffic') ) {
            _valUpdate = variableMetrics.getValueFor('transactions') / variableMetrics.getValueFor('conversion');
            variableMetrics.updateValueFor('traffic', _valUpdate);
          }
        }

      },
    }

    function computeDependenciesFor(_kpi) {
      updateParams[_kpi]();
      $rootScope.$broadcast('metricUpdate');
    }

    function getHoldValueFor(_kpi) {
      if(holdParams[_kpi]) {
        return holdParams[_kpi]();
      }
    }

    function validateHold() {
      //transactions is constant
      if( !variableMetrics.isHeld('traffic') && !variableMetrics.isHeld('conversion') && variableMetrics.isHeld('transactions') ) {
        variableMetrics.getMetricObjectFor('sales').hold = true;
      }
      else if (variableMetrics.isHeld('traffic') && variableMetrics.isHeld('conversion') && variableMetrics.isHeld('ats') ) {
        variableMetrics.getMetricObjectFor('sales').hold = true;
      }
      else if ( variableMetrics.isHeld('traffic') && variableMetrics.isHeld('conversion') ) {
        variableMetrics.getMetricObjectFor('transactions').hold = true;
      }

      if( !variableMetrics.isHeld('transactions') && variableMetrics.isHeld('traffic')  && variableMetrics.isHeld('conversion')  && variableMetrics.isHeld('ats') ) {
        //just so transactions is not the only unlocked widget
        variableMetrics.getMetricObjectFor('traffic').hold = false;
        variableMetrics.getMetricObjectFor('sales').hold = false;
      }

    }


    return {
      getHoldValueFor: getHoldValueFor,
      validateHold: validateHold,
      computeDependenciesFor: computeDependenciesFor
    }
  }
})();
