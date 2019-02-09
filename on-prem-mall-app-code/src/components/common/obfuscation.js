'use strict';

angular.module('shopperTrak.obfuscation', [
  'shopperTrak.config',
  'shopperTrak.utils'
])
.value('obfuscationConfig', {
  // Just random numbers
  grossShoppingHoursMultiplier: 2.4,
  opportunityValueFactor: 3,
  loyaltyVariation: 0.5, // +/-50%
  loyaltyAverageVariation: 0.5, // +/-50%
  loyaltyDistributionVariation: 0.5, // +/-50%
  trafficVariation: 0.3, // +/-30%

  generateMultipliers: function() {
    function getRandomNumberInRange(min, max, decimalPlacesLength) {
      var randomNumber = Math.random() * (max - min) + min;
      return _.isNumber(decimalPlacesLength)
        ? parseFloat(randomNumber.toFixed(decimalPlacesLength))
        : randomNumber;
    }

    this.trafficMultiplier = getRandomNumberInRange(1.2, 1.3);
    this.transactionsMultiplier = getRandomNumberInRange(1.25, 1.4);
    this.salesMultiplier = getRandomNumberInRange(1.25, 1.55);
    this.laborMultiplier = getRandomNumberInRange(1.3, 1.35);

    this.conversionMultiplier = this.transactionsMultiplier / this.trafficMultiplier;
    this.starMultiplier = this.trafficMultiplier / this.laborMultiplier;
    this.spsMultiplier = this.salesMultiplier / this.trafficMultiplier;
    this.splhMultiplier = this.salesMultiplier / this.laborMultiplier;

    this.atsMultiplier = this.salesMultiplier / this.transactionsMultiplier;
    this.uptMultiplier = this.atsMultiplier;
    this.aurMultiplier = this.atsMultiplier;

    return this;
  }
}.generateMultipliers())
.factory('obfuscationInterceptor',
['$q', 'apiUrl', 'obfuscationConfig', 'obfuscation', 'ObjectUtils', 'metricsHelper',
function($q, apiUrl, obfuscationConfig, obfuscation, ObjectUtils, metricsHelper) {
  var obfuscators = [{
    // Organization names
    pattern: /\/organizations\/*\d*$/,
    obfuscate: function(organization) {
      organization.name = getObfuscatedOrganizationName(organization.organization_id);

      // Organization group names + possible values
      if (!ObjectUtils.isNullOrUndefined(organization.portal_settings)) {
        if (!ObjectUtils.isNullOrUndefined(organization.portal_settings.group_structures)) {
          var groupCount = parseInt(Math.random()*1000,10); // Ensure labels are unique
          organization.portal_settings.group_structures.forEach(function(group){
            // Obfuscate group name
            groupCount +=1;
            group.name = getObfuscatedGroupName(group.name, '' + groupCount + group.group_id);
            // Obfuscate possible_values
            group.levels.forEach(function(level){
              if (!ObjectUtils.isNullOrUndefinedOrEmpty(level.possible_values)) {
                level.possible_values.forEach(function(possible_value){
                  groupCount +=1;
                  possible_value.name = getObfuscatedGroupName(possible_value.name, '' + groupCount + group.group_id);
                });
              }
            });
          });
        }
      }
    }
  }, {
    // Site names
    pattern:/organizations\/\d+\/sites\/*\d*(\?.*)*$/, // Regex test case: https://regex101.com/r/5a8Seq/4
    obfuscate: function(site) {
      site.name = getObfuscatedSiteName(site.site_id);
      site.organization.name = getObfuscatedOrganizationName(site.organization.id);
      site.zones = getObfuscatedZoneNames(site.zones);
    }
  }, {
    pattern: /\/kpis\/report$/,
    obfuscate: function(item) {
      if ('traffic' in item) {
        item.traffic = getObfuscatedNumber(item.traffic, obfuscationConfig.trafficMultiplier, 0);
      }
      if ('transactions' in item) {
        item.transactions = getObfuscatedNumber(item.transactions, obfuscationConfig.transactionsMultiplier, 0);
      }
      if ('labor_hours' in item) {
        item.labor_hours = getObfuscatedNumber(item.labor_hours, obfuscationConfig.laborMultiplier, 0);
      }
      if ('upt' in item) {
        item.upt = getObfuscatedNumber(item.upt, obfuscationConfig.uptMultiplier);
      }
      if ('star' in item) {
        item.star = getObfuscatedNumber(item.star, obfuscationConfig.starMultiplier);
      }
      if ('conversion' in item) {
        item.conversion = getObfuscatedNumber(item.conversion, obfuscationConfig.conversionMultiplier, 0);
      }
      if ('sales' in item) {
        item.sales = getObfuscatedNumber(item.sales, obfuscationConfig.salesMultiplier, 2);
      }
      if ('ats' in item) {
        item.ats = getObfuscatedNumber(item.ats, obfuscationConfig.atsMultiplier);
      }
      if ('aur' in item) {
        item.aur = getObfuscatedNumber(item.aur, obfuscationConfig.aurMultiplier);
      }
      if ('sps' in item) {
        item.sps = getObfuscatedNumber(item.sps, obfuscationConfig.spsMultiplier);
      }
      if ('splh' in item) {
        item.splh = getObfuscatedNumber(item.splh, obfuscationConfig.splhMultiplier);
      }
    }
  }, {
    pattern: /\/kpis\/sales$/,
    obfuscate: function(item) {
      if ('sales_amount' in item) {
        item.sales_amount = getObfuscatedNumber(item.sales_amount, obfuscationConfig.salesMultiplier, 2);
      }
      if ('labor_hours' in item) {
        item.labor_hours = getObfuscatedNumber(item.labor_hours, obfuscationConfig.laborMultiplier, 0);
      }
      if ('ats' in item) {
        item.ats = getObfuscatedNumber(item.ats, obfuscationConfig.atsMultiplier, 0);
      }
      if ('upt' in item) {
        item.upt = getObfuscatedNumber(item.upt, obfuscationConfig.uptMultiplier);
      }
      if ('total_traffic' in item) {
        item.total_traffic = getObfuscatedNumber(item.total_traffic, obfuscationConfig.trafficMultiplier, 0);
      }
      if ('conversion' in item) {
        item.conversion = getObfuscatedNumber(item.conversion, obfuscationConfig.conversionMultiplier, 0);
      }
      if ('star' in item) {
        item.star = getObfuscatedNumber(item.star, obfuscationConfig.starMultiplier);
      }
      if ('aur' in item) {
        item.aur = getObfuscatedNumber(item.aur, obfuscationConfig.aurMultiplier);
      }
      if ('sps' in item) {
        item.sps = getObfuscatedNumber(item.sps, obfuscationConfig.spaMultiplier);
      }
      if ('splh' in item) {
        item.splh = getObfuscatedNumber(item.splh, obfuscationConfig.splhMultiplier);
      }
    }
  }, {
    // Location names
    pattern: /organizations\/\d+\/sites\/\d+\/locations\/*\d*$/,
    obfuscate: function(location) {
      location.description = getObfuscatedLocationName(location.location_type, location.location_id);
    }
  }, {
    pattern: /\/kpis\/traffic$/,
    obfuscate: function(item) {
      if ('total_sales' in item) {
        item.total_sales = getObfuscatedNumber(item.total_sales, obfuscationConfig.salesMultiplier, 0);
      }
      if ('transactions' in item) {
        item.transactions = getObfuscatedNumber(item.transactions, obfuscationConfig.transactionsMultiplier, 0);
      }
      if ('labor_hours' in item) {
        item.labor_hours = getObfuscatedNumber(item.labor_hours, obfuscationConfig.laborMultiplier, 0);
      }
      if ('total_traffic' in item) {
        item.total_traffic = getObfuscatedNumber(item.total_traffic, obfuscationConfig.trafficMultiplier, 0);
      }
      if ('unique_traffic' in item) {
        item.unique_traffic = getObfuscatedNumber(item.unique_traffic, obfuscationConfig.trafficMultiplier, 0);
      }
      if ('return_traffic' in item) {
        item.return_traffic = getObfuscatedNumber(item.return_traffic, obfuscationConfig.trafficMultiplier, 0);
      }
      if ('aur' in item) {
        item.aur = getObfuscatedNumber(item.aur, obfuscationConfig.aurMultiplier);
      }
      if ('sps' in item) {
        item.sps = getObfuscatedNumber(item.sps, obfuscationConfig.spsMultiplier);
      }
      if ('splh' in item) {
        item.splh = getObfuscatedNumber(item.splh, obfuscationConfig.splhMultiplier);
      }
      if ('conversion' in item) {
        item.conversion = getObfuscatedNumber(item.conversion, obfuscationConfig.conversionMultiplier, 0);
      }
      if ('star' in item) {
        item.star = getObfuscatedNumber(item.star, obfuscationConfig.starMultiplier);
      }
      if ('ats' in item) {
        item.ats = getObfuscatedNumber(item.ats, obfuscationConfig.atsMultiplier);
      }
      if ('upt' in item) {
        item.upt = getObfuscatedNumber(item.upt, obfuscationConfig.uptMultiplier);
      }
    }
  }, {
    pattern: /\/kpis\/grossShoppingHours/,
    obfuscate: function(item) {
      item.gross_shopping_hours = getObfuscatedNumber(item.gross_shopping_hours, obfuscationConfig.grossShoppingHoursMultiplier);
    }
  }, {
    pattern: /\/kpis\/dwellTime/,
    obfuscate: function(item) {
      item.average_dwelltime *= 1 + Math.sin(item.average_dwelltime) * 0.8; // Add variation of +/-80%
    }
  }, {
    pattern: /\/kpis\/opportunity/,
    obfuscate: function(item) {
      item.total_opportunity = getObfuscatedNumber(item.total_opportunity, obfuscationConfig.opportunityValueFactor);
    }
  }, {
    pattern: /\/kpis\/shoppersVsTravellers/,
    obfuscate: function(item) {
      // Add variation of +/-20%
      item.average_percent_shoppers *= Math.min(0.8 + 0.4 * getRandomValue(item.average_percent_shoppers * 10000), 1);
      item.average_percent_travelers = 1 - item.average_percent_shoppers;
    }
  }, {
    pattern: /\/kpis\/drawRate/,
    obfuscate: function(item) {
      // Add variation of +/-20%
      item.average_draw_rate *= Math.min(0.8 + 0.4 * getRandomValue(item.average_draw_rate * 10000), 1);
    }
  }, {
    pattern: /\/kpis\/loyalty/,
    obfuscate: function(item) {
      item.loyalty.forEach(function(loyaltyItem) {
        if (loyaltyItem.loyaltyDstr && loyaltyItem.loyaltyDstr.length > 0) {
          var mangledDstr = loyaltyItem.loyaltyDstr.map(function(value) {
            return vary(value, obfuscationConfig.loyaltyDistributionVariation);
          });
          var total = mangledDstr.reduce(function(previous, current) {
            return previous + current;
          });
          loyaltyItem.loyaltyDstr = mangledDstr.map(function(value) {
            return value / total;
          });
        } else if (loyaltyItem.loyaltyAve) {
          loyaltyItem.loyaltyAve = loyaltyItem.loyaltyAve +
            (getRandomValue(loyaltyItem.loyaltyAve * 10000) * 2 - 1) * obfuscationConfig.loyaltyAverageVariation;
        }
      });
    }
  }, {
    pattern: /\/kpis\/traffic\/entrances/,
    obfuscate: function(item) {
      if ('total_traffic' in item) {
        item.total_traffic = getObfuscatedNumber(item.total_traffic, obfuscationConfig.trafficMultiplier, 0);
      }
    }
  }, {
    pattern: /\/kpis\/traffic\/powerHours/,
    obfuscate: function(item) {
      if ('total_traffic' in item) {
        item.total_traffic = getObfuscatedNumber(item.total_traffic, obfuscationConfig.trafficMultiplier, 0);
      }
      if ('hourly_sales' in item) {
        item.hourly_sales = getObfuscatedNumber(item.hourly_sales, obfuscationConfig.salesMultiplier, 2);
      }
      if ('total_sales' in item) {
        item.total_sales = getObfuscatedNumber(item.total_sales, obfuscationConfig.salesMultiplier, 2);
      }
      if ('total_conversion' in item) {
        item.total_conversion = getObfuscatedNumber(item.total_conversion, obfuscationConfig.conversionMultiplier, 0);
      }
      if ('total_ats' in item) {
        item.total_ats = getObfuscatedNumber(item.total_ats, obfuscationConfig.atsMultiplier);
      }
      if ('hourly_ats' in item) {
        item.hourly_ats = getObfuscatedNumber(item.hourly_ats, obfuscationConfig.atsMultiplier);
      }
      if ('total_star' in item) {
        item.total_star = getObfuscatedNumber(item.total_star, obfuscationConfig.starMultiplier);
      }
      if ('hourly_star' in item) {
        item.hourly_star = getObfuscatedNumber(item.hourly_star, obfuscationConfig.starMultiplier);
      }
    }
  }, {
    pattern: /\kpis\/traffic\-percentage\-location/,
    obfuscate: function(item) {
      if ('total_traffic' in item) {
        item.total_traffic = getObfuscatedNumber(item.total_traffic, obfuscationConfig.trafficMultiplier, 0);
      }
      if ('location_traffic' in item) {
        item.location_traffic = getObfuscatedNumber(item.location_traffic, obfuscationConfig.trafficMultiplier, 0);
      }
    }
  }, {
    pattern: /\kpis\/first\-visits/,
    obfuscate: function(item) {
      if ('total_visits' in item) {
        item.total_visits = getObfuscatedNumber(item.total_visits, obfuscationConfig.trafficMultiplier);
      }
      if ('first_visits' in item) {
        item.first_visits = getObfuscatedNumber(item.first_visits, obfuscationConfig.trafficMultiplier);
      }
    }
  }, {
    pattern: /\kpis\/traffic\-percentage\-correlation/,
    obfuscate: function() {
    }
  }, {
    pattern: /\kpis\/locations\-(before|after)/,
    obfuscate: function(item) {
      if ('location_main_visits' in item) {
        item.location_main_visits = getObfuscatedNumber(item.location_main_visits, obfuscationConfig.trafficMultiplier);
      }
      if ('number_of_visits' in item) {
        item.number_of_visits = getObfuscatedNumber(item.number_of_visits, obfuscationConfig.trafficMultiplier);
      }
    }
  }];


  // Multiply IDs by arbitrary numbers just to add some
  // masking so that exact IDs are not revealed.

  function getObfuscatedOrganizationName(organizationId) {
    var orgName;

    if(organizationId === 5947) {
      orgName = 'Demo 1';
    } else if(organizationId === 8699) {
      orgName = 'Mall Single Site - Traffic/Visitor Behavior/UofA';
    } else if(organizationId === 6255) {
      orgName = 'Mall Multi site - Traffic/Tenant Traffic & Sales';
    } else if(organizationId === 6240) {
      orgName = 'Organization: Retail';
    } else if(organizationId === 3068) {
      orgName = 'Retail Org- Traffic/Sales/Labor';
    } else if(organizationId === 6391) {
      orgName = 'Retail Traffic/MCR';
    } else if(organizationId === 8925) {
      orgName = 'Retail Traffic/Real Time';
    } else {
      orgName = 'Organization ' + parseInt(organizationId) * 7;
    }

    return orgName;
  }

  function getObfuscatedSiteName(siteId) {
    return 'Site ' + parseInt(siteId) * 4;
  }

  function getObfuscatedGroupName(groupName, groupId) {
    var capitalLetters = groupName.match(/[A-Z]/g);
    groupName = capitalLetters ? capitalLetters.slice(0,2).join('') : getRandomCapitalLetter() + getRandomCapitalLetter();
    return 'Group ' + groupName + groupId;
  }

  function getRandomCapitalLetter() {
    // Unicode range 65-90 = A-Z
    return String.fromCharCode(Math.floor(Math.random() * 25) + 65);
  }

  function getObfuscatedLocationName(locationType, locationId) {
    return locationType + ' ' + parseInt(locationId) * 3;
  }
  function getObfuscatedZoneNames(zones) {

    var newZones = []; var newTmps; var newZone; var i = 1;

    angular.forEach(zones, function(zone) {
      newZone = [];
      angular.forEach(zone.tmps, function(tmp) {
        newTmps = [];
        if(tmp.name !== null && tmp.name !== undefined && tmp.name.length > 0) {
          tmp.name = 'Entrance ' + (i*307-20);
          i++;
        }
        newTmps = zone.tmps;
      });
      newZone = zone;

      if(zone.type === 'TenantCommon') {
        newZone.name = 'Tenant '+ zone.id * 2;
      } else {
        newZone.name = 'Zone '+ zone.id * 2;
      }

      newZone.tmps = newTmps;
      newZones.push(newZone);
    });

    return newZones;
  }

  function getRandomValue(seed) {
    var value = Math.sin(seed) * 10000;
    return value - Math.floor(value);
  }

  function vary(value, variation) {
    return value * (1 + (getRandomValue(value * 10000) * 2 - 1) * variation);
  }

  function getObfuscatedNumber(value, multiplier, decimalPlacesLength) {
    if (
      value === metricsHelper.getValidNumber(value) &&
      multiplier === metricsHelper.getValidNumber(multiplier)
    ) {
      decimalPlacesLength = decimalPlacesLength || 14;
      value *=  multiplier; // do the 'obfuscation'
      return metricsHelper.getRoundedNumber(value, decimalPlacesLength);
    }
  }

  return {
    response: function(response) {
      if (obfuscation.isEnabled()) {

        // Load/cache configuration
        if (obfuscation.getConfig()){
          obfuscationConfig = obfuscation.getConfig();
        } else {
          obfuscation.setConfig(obfuscationConfig);
        }

        obfuscators.filter(function(obfuscator) {
          return response.config.url.match(obfuscator.pattern);
        }).forEach(function(obfuscator) {
          if(!ObjectUtils.isNullOrUndefined(response.data.result)) {
            response.data.result.forEach(obfuscator.obfuscate);
          }
        });
      }
      return response;
    }
  };
}])
.factory('obfuscation',
['localStorageService', 'obfuscationConfig',
function(localStorageService, obfuscationConfig) {

  function enableForSession() {
    localStorageService.set('obfuscationIsEnabled', true);
    setConfig();
  }

  function disableForSession() {
    localStorageService.remove('obfuscationIsEnabled');
    localStorageService.remove('obfuscationConfig');
  }

  function isEnabled() {
    return !!localStorageService.get('obfuscationIsEnabled');
  }

  function getConfig() {
    return localStorageService.get('obfuscationConfig');
  }

  function setConfig() {
    localStorageService.set('obfuscationConfig', obfuscationConfig);
  }

  return {
    enableForSession: enableForSession,
    disableForSession: disableForSession,
    isEnabled: isEnabled,
    getConfig: getConfig,
    setConfig: setConfig
  };
}])
.config(function($httpProvider) {
  $httpProvider.interceptors.push('obfuscationInterceptor');
});
