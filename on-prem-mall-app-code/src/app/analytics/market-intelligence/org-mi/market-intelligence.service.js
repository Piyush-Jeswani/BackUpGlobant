(function () {
  'use strict';

  angular.module('shopperTrak')
    .factory('marketIntelligenceService', marketIntelligenceService);

  marketIntelligenceService.$inject = [
    'apiUrl',
    '$http',
    '$q',
    '$rootScope',
    'authService',
    'LocalizationService',
    'ObjectUtils',
    'utils',
    'MarketIntelligenceSubscriptionResource',
    'countryConstants'
  ];

  function marketIntelligenceService(
    apiUrl,
    $http,
    $q,
    $rootScope,
    authService,
    LocalizationService,
    ObjectUtils,
    utils,
    MarketIntelligenceSubscriptionResource,
    countryConstants
  ) {

    /**  Saves the user's segment widget configuration
     *
     *  @param {object} user the user to update
     *  @param {object} customSegments the customised segments to be saved in the preferences.market_intelligence prop
     *  @returns {object} an empty promise
     **/
    function saveUserMarketIntelligence(user, customSegments, orgId) {
      var deferred = $q.defer();

      $http.put(apiUrl + '/users/' + user._id, getUserParams(user, customSegments, orgId))
        .then(function (result) {
          user = result.data.result[0];
          authService.updateMarketIntelligence(user.preferences.market_intelligence);
          deferred.resolve(user.preferences.market_intelligence);
        })
        .catch(function (error) {
          deferred.reject(error);
        });
      return deferred.promise;
    }

    /**
     *
     * Private Functions
     *
     */

    /**
     * Helper function to check Time Period Selection in Calendar
     * Private function
     *
     * @returns {Object} should return an object of date value of type String
     */
    function changeDatesAsPerTimePeriodSelection(paramsObject, isDaySelected) {
      if (!ObjectUtils.isNullOrUndefined(paramsObject.dateStart) &&
          !ObjectUtils.isNullOrUndefined(paramsObject.dateEnd) &&
          !ObjectUtils.isNullOrUndefined(paramsObject.compareStart) &&
          !ObjectUtils.isNullOrUndefined(paramsObject.compareEnd)) {
            if (isDaySelected) {
              paramsObject.dateStart = moment(paramsObject.dateStart).subtract(1, 'days');
              paramsObject.compareStart = moment(paramsObject.compareStart).subtract(1, 'days');
            } else {
              paramsObject.dateEnd = moment(paramsObject.dateEnd).subtract(1, 'days');
              paramsObject.compareEnd = moment(paramsObject.compareEnd).subtract(1, 'days');
            }
      }
      return paramsObject;
    }

    /**
     * Helper function to make multiple api calls and construct indexlist
     * Private function
     *
     *  @returns {object} a promise containing the data
     */
    function constructIndexList(paramsObject, includeOrgIndex, noYesterdayData) {
      var endPointsArray = ['mi/index'];
     
      if (includeOrgIndex === true) {
        endPointsArray.push('mi/index/org');
      }

      if (noYesterdayData) {
        paramsObject = changeDatesAsPerTimePeriodSelection(paramsObject, false);

        if (!ObjectUtils.isNullOrUndefined(paramsObject.dateStart) &&
            !ObjectUtils.isNullOrUndefined(paramsObject.dateEnd) &&
            paramsObject.dateStart.isAfter(paramsObject.dateEnd)) {
              paramsObject = changeDatesAsPerTimePeriodSelection(paramsObject, true);
        }
        
        if (!ObjectUtils.isNullOrUndefined(paramsObject)){
          paramsObject = setDates(paramsObject);
        } else {
          return;
        }
      } else {
        if (!ObjectUtils.isNullOrUndefined(paramsObject)){
          paramsObject = setDates(paramsObject);
        } else {
          return;          
        }
      }

      var indexList = _.map(endPointsArray, function (queryUri) {
        return $http({
          method: 'POST',
          url: apiUrl + '/' + queryUri,
          data: paramsObject
        });
      });

      return indexList;
    }

    /**
     * Helper function to build promises list and recurse if no previous day data available
     * Private function
     *
     *  @returns {object} a promise containing the data
     */
    function returnDataPromises(paramsObject, includeOrgIndex, noYesterdayData) {
      
      var defer = $q.defer();
      var indexList = constructIndexList(paramsObject, includeOrgIndex, noYesterdayData);
      
      if(ObjectUtils.isNullOrUndefined(indexList)){
        defer.reject('No Data');
      }

      $q.all(indexList)
      .then(function (results) {
        var resultObj = {};
        resultObj.index = results[0].data;
        
        if (includeOrgIndex) {
          resultObj.org = results[1].data;
        }

        if (datasetContainsNoData(results)) {

          if (!ObjectUtils.isNullOrUndefined(paramsObject.dateEnd)
            && moment(paramsObject.dateEnd).format('DD') === LocalizationService.getYesterday().format('DD')) {
            var dataPromises = returnDataPromises(paramsObject, includeOrgIndex, true);
            defer.resolve(dataPromises);
          } else {
            defer.reject('No Data');
          }
          return;
        }
        if(noYesterdayData){
          $rootScope.$broadcast('noDataForYesterday', paramsObject);
        }
        defer.resolve(resultObj);
      }, function (err) {
        defer.reject(err);
      });

      return defer.promise;
    }

    /**  Gets the index data for the market intelligence charts and 5 segment widget
     *  Hits the index and org index endpoint if it needs to.
     *
     *  @param {object} paramsObject The params object to be sent to the MI API
     *  @param {boolean} includeOrgIndex if set to true, will attempt to fetch the org index
     *  @returns makes a call and return another function which in turn returns {object} a promise containing the data
     **/
    function getIndexData(paramsObject, includeOrgIndex) {
      return returnDataPromises(paramsObject, includeOrgIndex, false);
    }

    /**  Gets the mi subscription data for an org
      * 
      *  @param {number} orgId The org to get the MI subscription data for
      *  @param {boolean} hasGlobals Setting the flag to false will remove subscriptions with geo type "global"
      *  @param {boolean} cached Should the response of the endpoint be cached
      *  @returns {object} a promise containing the data
      **/
    function getSubscriptions(orgId, hasGlobals, cached) {
      var deferred = $q.defer();
      MarketIntelligenceSubscriptionResource.query({ orgId: orgId }, undefined, undefined, cached).$promise
        .then(getSubscriptionsSuccess)
        .catch(getSubscriptionsError);

      function getSubscriptionsSuccess(response) {
        if (!ObjectUtils.isNullOrUndefined(hasGlobals) && !hasGlobals) {
          response = rejectGlobalSubscription(response);
        }
        response = _.sortBy(response, function (item) {
          if (!ObjectUtils.isNullOrUndefined(item.category)) {
            return item.category.name;
          }
        });
        deferred.resolve(response);
      }

      function getSubscriptionsError(error) {
        deferred.reject(error);
      }
      return deferred.promise;
    }

    /**  Gets the data ranges for the specified period
     *  E.g. will find the start and end dates for all weeks within a specified range.
     *  Gregorian calculations are done on the front end and are not requested from the API
     *
     *  @param {number} calendarId The calendarId to check
     *  @param {string} selectedPeriod One of "day", "week", "month", "quarter", "year", or "periodToDate"
     *  @param {object} startDate a momentJs object representing the start date
     *  @param {endDate} startDate a momentJs object representing the end date
     *  @returns {object} a promise containing the date ranges
     **/
    function getCalendarDateRanges(calendarId, selectedPeriod, startDate, endDate) {
      var defer = $q.defer();
      var requestCalendarId = getRequestCalendarId(calendarId);
      var calendarEndPoint = getCalendarEndpoint(requestCalendarId, selectedPeriod, startDate, endDate);

      $http.get(calendarEndPoint).then(function (result) {
        defer.resolve(result);
      })
      .catch(function (error) {
        console.error(error);
        defer.reject(error);
      });

      return defer.promise;
    }

    /**  Returns the api endpoint to get the calendar dates and build the GET request params
     *  This will always return the groupByDateRanges, unless the selected period is 'periodToDate',
     *  in which case it will return groupByPeriodToDate.
     *  Private function
     *
     *  @param {number} calendarId the current CalendarId
     *  @param {string} selectedPeriod the selected period. Can be 'day', 'week', 'month', 'quarter', 'year' or 'periodToDate'
     *  @param {object} startDate the start date. A momentJs object
     *  @param {object} endDate the end date. A momentJs object
     *  @returns {string} The request URL
     **/
    function getCalendarEndpoint(calendarId, selectedPeriod, startDate, endDate) {
      var calendarEndPoint = apiUrl + '/calendars/' + calendarId + '/mi/';

      if (selectedPeriod === 'periodToDate') {
        calendarEndPoint += 'groupByPeriodToDate?';
      } else {
        calendarEndPoint += 'groupByDateRanges?groupBy=' + selectedPeriod + '&';
        calendarEndPoint += 'dateStart=' + utils.getDateStringForRequest(startDate);
        calendarEndPoint += '&';
      }

      calendarEndPoint += 'dateEnd=' +  utils.getDateStringForRequest(endDate);
      
      return calendarEndPoint;
    }

    /**  Evaluates and returns the correct calendarId
     *  Prevents the calendarIds that the API can't understand from being sent to the API
     *  Private function
     *
     *  @param {number} calendarId the current CalendarId
     *  @returns {number} The calendarId to send to the API
     **/
    function getRequestCalendarId(calendarId) {
      var requestCalendarId = calendarId;

      if (LocalizationService.isCalendarIdGregorianMonday(calendarId)) {
        requestCalendarId = LocalizationService.getStandardMonthlyCalendarId();
      }

      if (LocalizationService.isCalendarIdGregorianSunday(calendarId)) {
        requestCalendarId = LocalizationService.getStandardMonthlyCalendarId();
      }

      return requestCalendarId;
    }

    /**  Updates the user object with the specified market intelligence segments
     *  Private function
     *
     *  @param {object} user The current user
     *  @param {object} segments The market intelligence segments to apply to the passed in user object
     **/
    function getUserParams(user, segments, orgId) {
      var params = {
        preferences: angular.copy(user.preferences),
        orgId: orgId
      };

      if (_.has(params.preferences, 'market_intelligence')) {

        var selectedOrgSegment = _.findWhere(params.preferences.market_intelligence, {orgId: orgId});

        if (!ObjectUtils.isNullOrUndefined(selectedOrgSegment)) {


          if (_.has(selectedOrgSegment, 'segments') && !_.isEmpty(selectedOrgSegment.segments)) {
            _.each(selectedOrgSegment.segments, function (eachSegment) {
              if (_.has(eachSegment, 'timePeriod')) {
                if (eachSegment.timePeriod === '' || _.isUndefined(eachSegment.timePeriod)) {
                  eachSegment.timePeriod = 'none';
                } else {
                  eachSegment.timePeriod = eachSegment.timePeriod.period;
                }
              }
            });
          }

          var emptySegments = _.filter(selectedOrgSegment.segments, function (item) {
            return _.isEmpty(item.subscription);
          });

          _.each(params.preferences.market_intelligence, function (item) {

            if (item.orgId === selectedOrgSegment.orgId) {
              if (emptySegments.length === segments.length) { // if user clears all segment than set Trend Summary to Defaults.
                item.segments = segments;
              } else {
                item = selectedOrgSegment;
              }
            }

          });

        } else {

          _.each(segments, function (item) {
            if (_.isUndefined(item.timePeriod)) {
              item.timePeriod = 'none';
            }
          });

          params.preferences.market_intelligence.push({orgId: orgId, segments: segments});
        }
      }

      return params;
    }

    /**  Checks to see if the returned data does not contain any useful values
     *  Private function
     *
     *  @param {object[]} results array from the market intelligence API
     *  @returns {boolean} A boolean
     **/
    function datasetContainsNoData(results) {
      var resultsWithNoData = [];
      var totalDatasets = 0;

      _.each(results, function (result) {
        var dataset = result.data;

        _.each(dataset, function (item) {
          totalDatasets += 1;
          if (!ObjectUtils.isNullOrUndefined(item.errorMessage)) {
            resultsWithNoData.push(item);
          }
        });
      });

      return resultsWithNoData.length === totalDatasets;
    }

  /**  Formats the dates within the params object to make sure they are in a format the API can understand
    *  Private function
    * 
    *  @param {object} paramsObject a params object
    *  @returns {object} The updated params object
    **/
    function setDates(paramsObject) {
      var updatedParams = angular.copy(paramsObject);

      if(!ObjectUtils.isNullOrUndefined(updatedParams.dateStart)) {
        updatedParams.dateStart = utils.getDateStringForRequest(updatedParams.dateStart);
      }

      if(!ObjectUtils.isNullOrUndefined(updatedParams.dateEnd)) {
        updatedParams.dateEnd = utils.getDateStringForRequest(updatedParams.dateEnd);
      }


      if (!ObjectUtils.isNullOrUndefined(updatedParams.compareStart)) {
        updatedParams.compareStart = utils.getDateStringForRequest(updatedParams.compareStart);
      }

      if (!ObjectUtils.isNullOrUndefined(updatedParams.compareEnd)) {
        updatedParams.compareEnd = utils.getDateStringForRequest(updatedParams.compareEnd);
      }

      return updatedParams;
  }

    /**
     * Takes a subscriptions array as a parameter and removes all globals
     *
     * @param {array} subscriptions
     * @returns A filtered array
     */
    function rejectGlobalSubscription(subscriptions) {
      return _.filter(subscriptions, function (item) {
        if (!ObjectUtils.isNullOrUndefined(item.geography)) {
          return item.geography.name !== 'global';
        }
      });
    }

    /**
     * Takes a subscription array and changes the geography name property value to full country name
     *
     * @param {array} objToChange subscription array
     * @returns {array} with modified geography names
     */

    function setSubscriptionGeoToFullName(objToChange) {
      _.each(objToChange, function (eachItem) {
        if (!ObjectUtils.isNullOrUndefined(eachItem.geography) && !ObjectUtils.isNullOrUndefined(eachItem.geography.name)) {
          eachItem.geography.name = getFullGeoTitleByCode(eachItem.geography.name);
        }
      });
      return objToChange;
    }

    /**
     * Gets a country name by a country code. If the value doesn't match up it returns the original value
     * 
     * @param {string} geoCode geo code you want to convert, example "US"
     * @returns {string} geo title, example "United States"
     */
    function getFullGeoTitleByCode(geoCode) {
      var geoInstance = _.find(countryConstants.countries, { 'code': geoCode });
      return !ObjectUtils.isNullOrUndefined(geoInstance) ? geoInstance.title : geoCode;
    }

    /**
     * Takes a segment array and changes the geography name property based on the supplied properties
     * 
     * @param {array} changeObj segment array
     * @param {string} checkAgainstProperty object property to check against, example "US" or "United States"
     * @param {string} changeProperty property to reassign to 
     * @returns {array} segment array with modified properties
     */
    function setSegmentGeoToFullName(changeObj, checkAgainstProperty, changeProperty) {
      _.each(changeObj, function (eachItem) {
        _.each(countryConstants.countries, function (item) {
          if (!ObjectUtils.isNullOrUndefined(item.code) && !ObjectUtils.isNullOrUndefined(eachItem.subscription)) {
            if (_.has(eachItem.subscription.geography, 'value')) {
              if (item[checkAgainstProperty] === eachItem.subscription.geography.value.name) {
                eachItem.subscription.geography.value.name = item[changeProperty];
              }
            }
          }
        });
      });

      return changeObj;
    }

    /**
     * Takes a subscription and matches geography and category names with org subscriptions. 
     * 
     * @param {array} sourceSubscriptions Org subscriptions
     * @param {object} segmentInState Subscription to check against
     * @returns {boolean} true if both geography and category names found in an org subscription
     */
    function isSubscriptionValid(sourceSubscriptions, segmentInState) {
      var valid = false;
      if (!ObjectUtils.isNullOrUndefinedOrEmptyObject(segmentInState)) {
        var geographyInState = _.findWhere(segmentInState.subscription, { name: 'Geography' }).value.src.name;
        var categoryInState = _.findWhere(segmentInState.subscription, { name: 'Category' }).value.src.name;
        for (var index = 0; index < sourceSubscriptions.length; index++) {
          var geographyInOrgExists = sourceSubscriptions[index].geography.name === geographyInState;
          var categoryInOrgExists = sourceSubscriptions[index].category.name === categoryInState;
          if (geographyInOrgExists && categoryInOrgExists) {
            valid = true;
          }
        }
      }
      return valid;
    }

    /**
     * Iterates through an enumerable number of nested objects and compares a name property.
     * 
     * @param {object} obj Object to iterate through 
     * @param {string} name Compare against
     * @returns {object} which has a name property matching the name parameter
     */
    function getTreeLeafByName(obj, name) {
      if (!_.isUndefined(obj.name) && obj.name === name) {
        return obj;
      }

      if (!_.isUndefined(obj.children)) {
        var result;
        _.each(obj.children, function (child) {
          var leaf = getTreeLeafByName(child, name);
          if (!_.isUndefined(leaf)) result = leaf;
        });
        return result;
      }
    }

    /**
     * Public method. Accepts a reportable list of subscriptions and
     * optional selected category or geography object and returns an
     * object reduced by the selected values.
     * 
     * @param {Array} res A list of reportable subscription pairs. Could
     * be obtained from subscription API endpoint.
     * @param {Array} selectedValues List of objects in the format below:
     * {
     *  selectedDimension: 'category',
     *  selectedValue: 'Accessories'
     * }
     * @returns {Object} containing and/or category/geography or an empty
     * array.
     */
    function getReducedSubscription(res, selectedValues, noOfFilters, translations) {
      noOfFilters = noOfFilters || 2;

      var wrapperObject = populateWrapperInnerObject(res, translations);

      applySelectedFilters(wrapperObject, res, selectedValues, noOfFilters);

      populateWrapperOuterObject(wrapperObject, res);

      return wrapperObject.outerObject;
    }

    function populateWrapperInnerObject(res, translations) {

      var wrapperObject = {
        innerObject: {
          category: angular.copy(res),
          geography: angular.copy(res)
        },
        outerObject: [
          { name: translations.category, values: [] },
          { name: translations.geography, values: [] }
        ]
      };

      return wrapperObject;
    }

    function populateWrapperOuterObject(wrapperObject) {
      var category = _.pluck(wrapperObject.innerObject.category, 'category');
      category = _.uniq(category, 'uuid');
      _.each(category, function (sourceCategory) {
        var categoryDimension = {
          name: sourceCategory.name,
          geography: wrapperObject.innerObject.geography,
          src: sourceCategory
        };
        wrapperObject.outerObject[0].values.push(categoryDimension);
      });

      var geography = _.pluck(wrapperObject.innerObject.geography, 'geography');
      geography = _.uniq(geography, 'uuid');
      wrapperObject.outerObject[1].values = buildGeographyTree(geography);

      wrapperObject.outerObject = _.reject(wrapperObject.outerObject, function (item) {
        return ObjectUtils.isNullOrUndefinedOrEmpty(item.values);
      });
    }

    /**
     * Due to complexity this function can benefit from some documentation.
     * First we determine whether the selectedFilters need to be applied otherwise
     * original subscriptions are returned. The logic is rather simple. If geography
     * dimension was selected next filter geographies need to be reduced by the selected
     * geography. We then take `res` object and find all categories matching the selected
     * geography. In case of the three filters, if previously selected dimension is equal
     * geography, categories need to be merged with the previous selection. If previously
     * selected dimension equals category iterate through the existing categories rather
     * then filtering the original subscriptions. 
     * 
     * @param {Object} wrapperObject contains `category` and `geography` properties 
     * @param {Array} res Original subscription array
     * @param {any} selectedFilters Previously selected filter
     */
    function applySelectedFilters(wrapperObject, res, selectedFilters, noOfFilters) {
      if (!ObjectUtils.isNullOrUndefinedOrEmpty(selectedFilters)) {
        _.each(selectedFilters, function (selectedFilter, filterIndex) {
          _.each(wrapperObject.innerObject, function (wrapperDimensionValues, wrapperDimension) {
            if (selectedFilter.selectedDimension.toLowerCase() === wrapperDimension) {
              wrapperObject.innerObject[wrapperDimension] = _.reject(wrapperDimensionValues, function (value) {
                return value[wrapperDimension].name === selectedFilter.selectedValue;
              });
            } else {
              var dimension = wrapperDimension === 'geography' ? 'category' : 'geography';
              var resource = angular.copy(res);
              if (!ObjectUtils.isNullOrUndefined(selectedFilters[filterIndex - 1]) &&
                  selectedFilter.selectedDimension !== selectedFilters[filterIndex - 1].selectedDimension) {
                resource = wrapperDimensionValues;
              }
              var tempDimensionValues = _.reject(resource, function (subscription) {
                return subscription[dimension].name !== selectedFilter.selectedValue;
              });

              if (!ObjectUtils.isNullOrUndefined(selectedFilters[filterIndex - 1]) &&
                  selectedFilter.selectedDimension === selectedFilters[filterIndex - 1].selectedDimension) {
                wrapperObject.innerObject[wrapperDimension] = wrapperObject.innerObject[wrapperDimension].concat(tempDimensionValues);
              } else {
                wrapperObject.innerObject[wrapperDimension] = tempDimensionValues;
              }
            }
          });
          
          var indexOffset =noOfFilters === 3 ? 1 : 0;
          if (!ObjectUtils.isNullOrUndefined(selectedFilters[filterIndex - indexOffset]) &&
              filterIndex + 1 === noOfFilters - 1 &&
              selectedFilter.selectedDimension === selectedFilters[filterIndex - indexOffset].selectedDimension) {
            wrapperObject.innerObject[selectedFilter.selectedDimension.toLowerCase()] = [];
          }
        });
      }
    }

    /**
     * Public method. Due to complexity this function needs some documentation.
     * Geography tree is build of the levels specified in the levels variable. When
     * looping through the levels we determine whether the geographies have children.
     * If children are found, they are added as the children property. Each geography
     * is also mutated using mapGeography function.
     * 
     * @param {Array} geographies Array of geographies to build the tree of
     * @returns {Array} Array of nested geographies
     */
    function buildGeographyTree(geographies) {
      if (ObjectUtils.isNullOrUndefined(geographies)) {
        return;
      }

      var levels = ['COUNTRY', 'REGION', 'METRO'];
      var geographiesCopy = angular.copy(geographies);
      var tree = [];

      _.each(levels, function (level, index) {
        var parentLevelItems = _.filter(geographiesCopy, { geoType: level });
        if (!ObjectUtils.isNullOrUndefinedOrEmpty(parentLevelItems)) {
          attachBranch(parentLevelItems, geographiesCopy, levels, index);
          tree = tree.concat(parentLevelItems);
        }
      });

      var mutatedTree = mapGeography(tree, geographies);

      return mutatedTree;
    }

    function attachBranch(branchParents, sourceItems, levels, index) {
      var nextLevel = levels[index + 1];
      if (!ObjectUtils.isNullOrUndefinedOrEmpty(sourceItems) &&
          !ObjectUtils.isNullOrUndefinedOrEmpty(nextLevel)) {
        _.each(branchParents, function (branchParent) {
          reduceItems(sourceItems, [branchParent]);
          var children = getChildGeographies(sourceItems, branchParent.uuid, nextLevel);
          if (!ObjectUtils.isNullOrUndefinedOrEmpty(children)) {
            reduceItems(sourceItems, children);
            branchParent.children = children;
            attachBranch(branchParent.children, sourceItems, levels, index + 1);
          }                    
        });
      }
    }

    function reduceItems(itemsToReduce, itemsToRemove) {
      _.each(itemsToRemove, function (item) {
        if (itemsToReduce.indexOf(item) !== -1) {
          itemsToReduce.splice(itemsToReduce.indexOf(item), 1);
        }
      });
    }

    function mapGeography(geographiesToMap, sourceGeographies) {
      var branches = [];
      if (!ObjectUtils.isNullOrUndefinedOrEmpty(geographiesToMap)) {
        _.each(geographiesToMap, function (geography) {
          var newBranch = {
            name: getFullGeoTitleByCode(geography.name),
            category: sourceGeographies,
            src: _.omit(geography, 'children'),
          };
          if (!ObjectUtils.isNullOrUndefinedOrEmpty(geography.children)) {
            newBranch.children = mapGeography(geography.children, sourceGeographies);
          }
          branches.push(newBranch)
        });
      }
      return branches;
    }

    function getChildGeographies(sourceGeographies, uuid, geoType) {
      return _.filter(sourceGeographies, function (subscription) {
        return subscription.parentUuid === uuid && subscription.geoType === geoType;
      });
    }

    /**
     * Get subscription part defined by the dimension option
     * 
     * @param {array} subscription normally obtained from subscriptions 
     * API endpoint.
     * @param {(category|geography)} dimension to be sliced by 
     * @returns {array} sliced dimension
     */
    function sliceSubscription(subscription, dimension) {
      var slicedArray = [];
      var object = {};
      _.each(angular.copy(subscription), function (item) {
        object = item[dimension];
        slicedArray.push(angular.copy(object));
      });
      return slicedArray.length ? _.uniq(slicedArray, 'uuid') : undefined;
    }

    return {
      saveUserMarketIntelligence: saveUserMarketIntelligence,
      getIndexData: getIndexData,
      returnDataPromises: returnDataPromises,
      getCalendarDateRanges: getCalendarDateRanges,
      getSubscriptions: getSubscriptions,
      rejectGlobalSubscription: rejectGlobalSubscription,
      setSubscriptionGeoToFullName: setSubscriptionGeoToFullName,
      getFullGeoTitleByCode: getFullGeoTitleByCode,
      setSegmentGeoToFullName: setSegmentGeoToFullName,
      isSubscriptionValid: isSubscriptionValid,
      getTreeLeafByName: getTreeLeafByName,
      getReducedSubscription: getReducedSubscription,
      sliceSubscription: sliceSubscription
    };
  }
})();