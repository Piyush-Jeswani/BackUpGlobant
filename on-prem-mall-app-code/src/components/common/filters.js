'use strict';

angular.module('shopperTrak.filters', []).filter('areaselector', function () {
  return function (items, input) {
    var filtered = [];
    if (!input) {
      return items;
    }

    var searchMatchingChildren = function myself(children, callback) {
      children.forEach(function (element) {
        if (element.description.toLowerCase().indexOf(input.toLowerCase()) !== -1) {
          callback();
          return;
        } else {
          myself(element.children, callback);
        }
      });
    };

    angular.forEach(items, function (item) {
      if (item.nested_set.depth >= 0) {
        if (item.description.toLowerCase().indexOf(input.toLowerCase()) !== -1) {
          filtered.push(item);
        } else if (item.children.length > 0) {
          searchMatchingChildren(item.children, function () {
            filtered.push(item);
          });
        }
      }
    });

    //TODO: Fix the performance hit
    return _.uniq(filtered);
  };
})
  .filter('trustAsResourceUrl', ['$sce', function ($sce) {
    return function (val) {
      return $sce.trustAsResourceUrl(val);
    };
  }])
  .filter('orderOrgdataObjectBy', function () {
    return function (items, kpi, period, reverse) {
      var filtered = [];

      var typeField = 'selectedPeriod';
      if (period === 'priorPeriod') {
        typeField = 'priorPeriod';
      } else if (period === 'priorYear') {
        typeField = 'priorYear';
      } else if (period === 'priorYearChange') {
        typeField = 'priorYearChange';
      } else if (period === 'priorPeriodChange') {
        typeField = 'priorPeriodChange';
      }

      angular.forEach(items, function (item) {
        filtered.push(item);
      });
      filtered.sort(function (a, b) {
        return (a.data[kpi][typeField] > b.data[kpi][typeField] ? 1 : -1);
      });
      if (reverse) {
        filtered.reverse();
      }
      return filtered;
    };
  })
  .filter('orderObjectBy', function () {
    return function (input, attribute) {
      if (!angular.isObject(input)) {
        return input;
      }

      var array = [];
      for (var objectKey in input) {
        if (typeof (input[objectKey]) === 'object' && objectKey.charAt(0) !== '$') {
          array.push(input[objectKey]);
        }
      }

      var attributeChain = attribute.split('.');

      array.sort(function (a, b) {
        for (var i = 0; i < attributeChain.length; i++) {
          a = (typeof (a) === 'object') && a.hasOwnProperty(attributeChain[i]) ? a[attributeChain[i]] : 0;
          b = (typeof (b) === 'object') && b.hasOwnProperty(attributeChain[i]) ? b[attributeChain[i]] : 0;
        }
        return parseInt(a) - parseInt(b);
      });

      return array;
    };
  })
  .filter('sortObjectBy', function () {
    return function (input, property, index, childProperty, secondLevelChildProperty) {
      if (input.length <= 0 || typeof property === 'undefined') {
        return input;
      }
      var reverseIt;
      property = property.replace('+', '');
      if (property.startsWith('-') > 0) {
        property = property.replace('-', '');
        reverseIt = true;
      }
      var output = _.sortBy(input, function (item) {
        if (typeof index === 'undefined') {
          return item[property];
        } else {
          if (typeof childProperty === 'undefined') {
            return item[property][index];
          } else {
            if (typeof item[property][index] !== 'undefined') {
              if (typeof secondLevelChildProperty === 'undefined') {
                return item[property][index][childProperty];
              } else {
                return item[property][index][childProperty][secondLevelChildProperty];
              }
            }
          }
        }
      });
      if (reverseIt === true) {
        output = output.reverse();
      }
      return output;
    };
  })
  .filter('sortObjectWithKpiBy', function () {
    return function (input, kpi, property, index, childProperty, isDataObject) {
      if (typeof isDataObject === 'undefined') {
        isDataObject = false;
      }
      if (input.length <= 0 || typeof property === 'undefined') {
        return input;
      }
      var reverseIt;
      kpi = kpi.replace('+', '');
      if (kpi.startsWith('-') > 0) {
        kpi = kpi.replace('-', '');
        reverseIt = true;
      }
      var output = _.sortBy(input, function (item) {
        if (isDataObject) {
          item = item.data;
        }
        if (typeof index === 'undefined') {
          if (typeof childProperty === 'undefined') {
            return item[kpi][property];
          } else {
            return item[kpi][property][childProperty];
          }
        } else {
          if (typeof childProperty === 'undefined') {
            return item[kpi][property][index];
          } else {
            return item[kpi][property][index][childProperty];
          }
        }
      });
      if (reverseIt === true && typeof output !== 'undefined') {
        output = output.reverse();
      }
      /* moving items having 'selectedPeriod' = null to the end of the array so that graph gets valid data all the time : SA-3407 */
      var p_output = _.partition(output, function(item){
        item = item.data;
        if(item[kpi].selectedPeriod !== null){
          return item;
        }
      })
      var validOutput = _.flatten([p_output[0], p_output[1]]);
      return validOutput;
    };
  })
  .filter('dashIfNull', function () {
    return function (val) {
      if (val === null || val === 0) {
        return '-';
      } else {
        return val;
      }
    };
  })
  .filter('formatNumber', ['LocalizationService', 'ObjectUtils', function (LocalizationService, ObjectUtils) {
    function getFractionPart(value, dataPrecision, separators) {
      var fractionPart = value.toFixed(dataPrecision);

      if (!ObjectUtils.isNullOrUndefinedOrBlank(fractionPart) &&
        _.contains(fractionPart, '.')) {
        var fraction = fractionPart.split('.'); // the digits part (with precision)
        return ObjectUtils.isNullOrUndefinedOrEmpty(fraction) ||
          fraction.length < 2 ? '' : separators.decimalSeparator + fraction[1];
      }
      return '';
    }
    return function (value, dataPrecision, numberFormatName, thousandsSeparator) {
      var isPercentage;
      if (value === '-') {
        return value;
      }

      if (angular.isString(value)) {
        if (value.slice(-1) === '%') {
          isPercentage = true;
          value = value.replace('%', '').trim();
        }
        value = parseFloat(value);
      }

      if (typeof dataPrecision === 'undefined' || dataPrecision === null) {
        dataPrecision = 0;
      }
      
      numberFormatName = numberFormatName && numberFormatName.toLowerCase();

      if(_.isUndefined(numberFormatName)) {
        numberFormatName = 'en-us';
      }

      // Sanity check for the input value
      if (value === null || value === false || isNaN(value)) {
        return '';
      }

      // Handles integer rounding
      if (dataPrecision === 0) {
        value = parseInt(value.toFixed(0), 10);
      }

      //handle for user numberformat where numberFormatName wasn't passed through
      var separators;

      if( !ObjectUtils.isNullOrUndefined(numberFormatName) ) {
        separators = LocalizationService.getNumberFormatSeparatorsByName(numberFormatName);
      }
      else if ( !ObjectUtils.isNullOrUndefined(LocalizationService.getActualNumberFormat())) {
        separators = LocalizationService.getActualNumberFormat();
      }
      else {
        //default to en-us if no format object is found
        separators = LocalizationService.getNumberFormatSeparatorsByName('en-us');
      }

      var body = '';
      var digits = '';
      var sign = (value < 0) ? '-' : '';

      var num = Math.abs(value).toFixed(dataPrecision).split('.')[0]; // the whole number part
      
      // Add thousands separator to the integer part
      for (var i = num.length - 1, c = 1; i >= 0; i-- , c++) {
        var ch = num[i];
        body = ch + body;
        if (c % 3 === 0 && i !== 0) {
          body = (typeof thousandsSeparator === 'string' ? thousandsSeparator : separators.thousandsSeparator !== undefined ? separators.thousandsSeparator : separators.thousands_separator) + body;
        }
      }

      // Parse the fractional part
      digits = getFractionPart(value, dataPrecision, separators);

      if (isPercentage) {
        return sign + body + digits + '%';
      }

      return sign + body + digits;
    };
  }])
  .filter('formatCurrency', ['$filter', function ($filter) {
    return function (value, currencySymbol, numberFormatName, thousandsSeparator) {
      currencySymbol = currencySymbol || '$'
      return  currencySymbol + $filter('formatNumber')(value, 2, numberFormatName, thousandsSeparator);
    }
  }])
  .filter('collectionFilter', ['ObjectUtils', function (ObjectUtils) {
    return function (input, property, target) {
      if (ObjectUtils.isNullOrUndefinedOrEmpty(input) ||
        ObjectUtils.isNullOrUndefinedOrEmpty(property) ||
        ObjectUtils.isNullOrUndefinedOrEmpty(target)) {
        return input;
      }

      var matches = [];
      var pattern = new RegExp(target, 'i');
      angular.forEach(input, function (item) {
        if (!ObjectUtils.isNullOrUndefined(pattern.exec(item[property]))) {
          matches.push(item);
        }

      });
      return matches;
    };
  }])
  .filter('orderByProperty', function(){
    return function(object) {

      if(_.isUndefined(object)) {
        return object;
      }

      function compare(a, b) {
        if (a.order < b.order) {
          return -1;
        }
        if (a.order > b.order) {
          return 1;
        }
        return 0;
      }

      return object.sort(compare);
    };
  })
  .filter('multiplyNumber', function () {
    return function (value, factor) {
      return _.isUndefined(factor) ? value : value * factor;
    };
  })
  .filter('capitalize', function () {
    return function (input) {
      return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    }
  })
  .filter('camelCase', function () {
    return function (input) {
      if (!_.isNull(input) && !_.isUndefined(input)) {
        var words = input.split(' ');
        words[0] = words[0].toLowerCase();
        _.each(words, function (value, index) {
          if (index > 0) {
            words[index] = value.charAt(0).toUpperCase() + value.substr(1).toLowerCase()
          }
        }); 
        return words.join('');
      }
    }
  })
  .filter('replaceSpecialChars', function () {

    var chars = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      '/': '&#x2F;',
      '%': '&#37;',
      '#': '&#35;',
      '*': '&#42;',
      '.': '&#46;',
      '(': '&#40;',
      ')': '&#41;'
    };// to extended add new char & HTML entity to object AND to the regex list below

    return function (str) {
      return String(str).replace(/[&<>"'\/%#*.()]/g, function (specChar) {
        return chars[specChar];
      });
    }
  })
  .filter('minuteRange', function () {
    return function (input, total) {
      total = Number(total);

      for (var i = 0; i < total; i++) {
        if (i < 10) {
          i = '0' + i;
        } else {
          i = i.toString();
        }
        input.push(i);
      }
      return input;
    };
  })
  .filter('hourRange', function () {
    return function (input, total) {
      total = Number(total);

      for (var i = 0; i < total; i++) {
        input.push(i);
      }
      return input;
    };
  });
