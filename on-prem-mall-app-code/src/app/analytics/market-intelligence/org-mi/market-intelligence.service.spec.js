'use strict';

describe('MarketIntelligenceService', function () {

  var marketIntelligenceService;
  var authService;
  var dateRangeHelper;
  var localizationService;
  var utils;

  var $rootScope;
  var $httpBackend;
  var $timeout;

  var apiUrl = 'https://api.url';

  beforeEach(module('shopperTrak'));
  beforeEach(module('shopperTrak.auth'));

  beforeEach(module(function ($provide) {
    $provide.constant('apiUrl', apiUrl);
  }));

  beforeEach(inject(function (_$rootScope_, _$httpBackend_,  _$timeout_, _authService_, _dateRangeHelper_, _LocalizationService_, _utils_, _marketIntelligenceService_) {
    $rootScope = _$rootScope_;
    $httpBackend = _$httpBackend_;
    $timeout = _$timeout_;
    authService = _authService_;
    dateRangeHelper = _dateRangeHelper_;
    localizationService = _LocalizationService_;
    utils = _utils_;
    marketIntelligenceService = _marketIntelligenceService_;
  }));

  describe('saveUserMarketIntelligence', function () {
    var user;
    var mockData;

    beforeEach(function () {
      user = {
        "_id": 101,
        "preferences": {
          "market_intelligence": [
            {
              "orgId": 1000003068,
              "segments": [
                {
                  "timePeriod": "none"
                },
                {
                  "timePeriod": "none"
                },
                {
                  "timePeriod": "none"
                },
                {
                  "timePeriod": "none"
                },
                {
                  "timePeriod": "none"
                }
              ]
            },
            {
              "orgId": 3068,
              "segments": [
                {
                  "timePeriod": "none"
                },
                {
                  "timePeriod": "none"
                },
                {
                  "timePeriod": "none"
                },
                {
                  "timePeriod": "none"
                },
                {
                  "timePeriod": "none"
                }
              ]
            }
          ]
        },
        "orgId": 1000003068

      };

      mockData = {
        "preferences": {
          "market_intelligence": [
            {
              "orgId": 1000003068,
              "segments": [
                {
                  "subscription": {
                    "geography": {
                      "orgId": 1000003068,
                      "name": "Region",
                      "rule": "Contains",
                      "value": {
                        "name": "South",
                        "src": {
                          "uuid": "b662eb53-9a41-49f0-922a-fde4e4445e84",
                          "lastUpdated": "2018-02-07T16:14:07.447Z",
                          "name": "South",
                          "geoType": "REGION",
                          "parentUuid": "6d1175b8-eb06-45ee-9d11-9a63c072f728",
                          "childrenUuids": [
                            "980acb1e-a8dc-407f-a2ba-7d32099a5a8f",
                            "49806afc-386b-42d9-8208-a4d2ae6f621a",
                            "8f001972-0ce0-4103-89ee-780a2c18f217",
                            "64406551-e8c7-49cb-97e2-297afeb72607",
                            "a7a1dffc-d71b-4420-88b1-3976f4a0c6dc",
                            "369b45ec-e411-4ea5-9cb3-81bdd14dee02",
                            "5021fcd1-62fd-413a-b603-a4749e494199",
                            "a7d7bfcc-8820-4ff2-ba95-e38b79459b8f",
                            "c4bcd013-c9f9-4007-854d-3fa159a993b2",
                            "3ce61bac-49c5-4f51-baff-b87e8dbc0f66",
                            "b7afea16-75e8-4560-90af-68d4de2f50d1",
                            "63e8cdc6-da54-407d-95b2-9fcc86e98bfe"
                          ]
                        }
                      }
                    },
                    "category": {
                      "orgId": 1000003068,
                      "name": "Accessories",
                      "rule": "Contains",
                      "value": {
                        "name": "Accessories",
                        "src": {
                          "name": "Accessories",
                          "childrenUuids": [],
                          "uuid": "c35cb71f-5dcd-4ae3-86b3-d642208ad7f5",
                          "lastUpdated": "2018-02-07T16:14:08.172Z"
                        }
                      }
                    }
                  },
                  "timePeriod": "none",
                  "positionIndex": 0
                },
                {
                  "subscription": {
                    "geography": {
                      "orgId": 1000003068,
                      "name": "Region",
                      "rule": "Contains",
                      "value": {
                        "name": "West",
                        "src": {
                          "uuid": "7f420fc1-f8fc-4fd5-8bae-50c3b22c1808",
                          "lastUpdated": "2018-02-07T16:14:07.447Z",
                          "name": "West",
                          "geoType": "REGION",
                          "parentUuid": "6d1175b8-eb06-45ee-9d11-9a63c072f728",
                          "childrenUuids": [
                            "64dbc53a-022e-4659-bdd8-7d85efdb6d64",
                            "9824e7e1-c0fc-401b-910c-ade18f946bf7",
                            "55783060-3f03-438f-aa89-039eec4c0b61",
                            "b8136528-ffbe-401c-9bfc-efa78f58f6cd",
                            "a6010034-9eb4-4f2d-bf04-2e3ac752d1a7",
                            "19098d55-fb25-4d66-a22c-c1a10dff2a22",
                            "dcb2fe89-7a7c-49aa-9970-bb3b628e3b5e",
                            "306ab1e9-ad38-4f18-95b8-a0d0b66e8afc",
                            "fab2a14d-5c0c-4421-96fc-a83c84005823",
                            "8ee97146-85d3-4ab4-b871-c3851fec704b"
                          ]
                        }
                      }
                    },
                    "category": {
                      "orgId": 1000003068,
                      "name": "Accessories",
                      "rule": "Contains",
                      "value": {
                        "name": "Accessories",
                        "src": {
                          "name": "Accessories",
                          "childrenUuids": [],
                          "uuid": "c35cb71f-5dcd-4ae3-86b3-d642208ad7f5",
                          "lastUpdated": "2018-02-07T16:14:08.172Z"
                        }
                      }
                    }
                  },
                  "timePeriod": "none",
                  "positionIndex": 1
                },
                {
                  "subscription": {
                    "geography": {
                      "orgId": 1000003068,
                      "name": "Region",
                      "rule": "Contains",
                      "value": {
                        "name": "Midwest",
                        "src": {
                          "uuid": "ed6b04d2-c55d-418b-9274-77c05e745d4b",
                          "lastUpdated": "2018-02-07T16:14:07.447Z",
                          "name": "Midwest",
                          "geoType": "REGION",
                          "parentUuid": "6d1175b8-eb06-45ee-9d11-9a63c072f728",
                          "childrenUuids": [
                            "4b1d51e1-e8ba-4f2c-bb82-aca5d1dc9309",
                            "ada53770-aff9-4af5-b5a5-e0da4edf2779",
                            "a59a2e37-521a-4123-8425-305974310a8f",
                            "06ac2c56-67ee-4b59-b0fe-d4ce6516f843",
                            "54e93ea1-6c4b-4477-9488-1970d245b16f",
                            "cd4ee5d6-02f1-4f98-8782-51d6e1d07536",
                            "9e745d1e-e57a-4838-81f5-8fb9fe6da6bf",
                            "deda9fa1-3947-446b-983a-2836bd10909a",
                            "5f9ad8d0-55c3-4658-adad-0201a35b37c4",
                            "9bcbbb49-c394-41fa-9de7-125f0c88c930"
                          ]
                        }
                      }
                    },
                    "category": {
                      "orgId": 1000003068,
                      "name": "Accessories",
                      "rule": "Contains",
                      "value": {
                        "name": "Accessories",
                        "src": {
                          "name": "Accessories",
                          "childrenUuids": [],
                          "uuid": "c35cb71f-5dcd-4ae3-86b3-d642208ad7f5",
                          "lastUpdated": "2018-02-07T16:14:08.172Z"
                        }
                      }
                    }
                  },
                  "timePeriod": "none",
                  "positionIndex": 2
                },
                {
                  "subscription": {
                    "geography": {
                      "name": "Country",
                      "orgId": 1000003068,
                      "rule": "Contains",
                      "value": {
                        "name": "US",
                        "src": {
                          "uuid": "6d1175b8-eb06-45ee-9d11-9a63c072f728",
                          "lastUpdated": "2018-02-07T16:14:07.447Z",
                          "name": "US",
                          "geoType": "COUNTRY",
                          "parentUuid": "46a3b5b5-76b6-4419-8038-0b622bc9f7ae",
                          "childrenUuids": [
                            "ed6b04d2-c55d-418b-9274-77c05e745d4b",
                            "102cc0f3-e297-4ce3-bb1e-cb192c68eaee",
                            "b662eb53-9a41-49f0-922a-fde4e4445e84",
                            "7f420fc1-f8fc-4fd5-8bae-50c3b22c1808"
                          ]
                        }
                      }
                    },
                    "category": {
                      "name": "Category",
                      "orgId": 1000003068,
                      "rule": "Contains",
                      "value": {
                        "name": "Total Retail",
                        "src": {
                          "name": "Total Retail",
                          "childrenUuids": [
                            "e91b64c7-b80e-4ae7-91a4-5f502c8bac2f",
                            "f1e73081-f840-4c3f-9ac5-5f9c8bf4a0c2",
                            "f0889600-22c0-439f-9346-460bcfd0fbf0",
                            "0d550f49-d1db-49bc-9fc5-ba17fee86ae2",
                            "ee91c988-d702-471d-847a-ebd4105793ce",
                            "54b43ad4-605b-4f0b-8605-9b30c8ff3302",
                            "d61e2b4d-21a9-4607-8f60-47bde9456db2",
                            "e21c9067-965d-4ac0-bd52-5db0c615a8ee",
                            "426dc056-ae03-459e-b42e-0cc5bbee1d36",
                            "67e772c1-15d0-4fe8-a66e-53b5468cdb6d",
                            "bcdb34e4-463b-4fcb-adfb-6b6fdced98ac",
                            "035ee28e-34bb-46f8-8053-055f339641f5",
                            "7a62f872-4bb6-4ce0-8168-6433d5d75af7",
                            "f92277d8-8412-4bde-bfa0-880c3a50209e",
                            "abee4054-98d9-4871-ae7e-f92daeee7832",
                            "1ed6f26e-27b3-418c-83fa-c42d3be04a35",
                            "c0c976db-3782-4080-aebe-d6ef75927e26",
                            "3966a075-61ab-4cf4-9d52-43bf5e292e09",
                            "ae151eb8-369a-4f72-862e-19658f4ec1ba",
                            "9e4b11e9-b67c-4cee-9cbf-72d3c11c8f12",
                            "79cb0920-b98e-4097-b669-e12b03f5a004",
                            "b8ad89ef-98ff-444a-a68c-e7ee9d4ec4ea",
                            "48e812b7-ab0c-467f-a9f0-6759663a2ead",
                            "c35cb71f-5dcd-4ae3-86b3-d642208ad7f5",
                            "e9eae580-00de-4118-8425-3de571ace2de",
                            "a3291098-cc50-490f-97a3-df8cd45bccc0",
                            "1ccb97ab-abf6-46bf-8181-349a43ea6f93",
                            "f2fe9a1a-3a13-44e5-bea3-b28173bca48a",
                            "ebdf6ebc-505a-4b65-bc92-8392824700a9",
                            "c2944841-fadc-401a-8099-3b9df5924f5d",
                            "689fa51d-807b-4b46-a72c-b818979b5a6f"
                          ],
                          "uuid": "da815dbc-f066-4807-a6ac-ae145e6b6242",
                          "lastUpdated": "2018-02-07T16:14:08.172Z"
                        }
                      }
                    }
                  },
                  "timePeriod": "none",
                  "positionIndex": 3
                },
                {
                  "subscription": {},
                  "timePeriod": "none",
                  "positionIndex": 4
                }
              ]
            },
            {
              "orgId": 3068,
              "segments": [
                {
                  "timePeriod": "none"
                },
                {
                  "timePeriod": "none"
                },
                {
                  "timePeriod": "none"
                },
                {
                  "timePeriod": "none"
                },
                {
                  "timePeriod": "none"
                }
              ]
            }
          ]
        },
        "orgId": 1000003068

      };
    });

    it('should be exposed', function () {
      expect(typeof marketIntelligenceService.saveUserMarketIntelligence).toBe('function');
    });

    it('should make a PUT request to update the user', function () {

      var expectedUrl = apiUrl + '/users/' + user._id;


      $httpBackend.expectPUT(expectedUrl, mockData).respond(200, {});

      marketIntelligenceService.saveUserMarketIntelligence(user, mockData.preferences.market_intelligence[0].segments, 1000003068);

      $httpBackend.flush();

      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should update the market intelligence segments on the user object', function () {
      var expectedUrl = apiUrl + '/users/' + user._id;

      var segments = [{
        name: 'segment 1'
      }, {
        name: 'segment 2'
      }
      ];

      $httpBackend.expectPUT(expectedUrl, mockData).respond(200, {});

      marketIntelligenceService.saveUserMarketIntelligence(user, mockData.preferences.market_intelligence[0].segments, 1000003068);
      $httpBackend.flush();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should update the auth service with the result of the request', function () {
      var expectedUrl = apiUrl + '/users/' + user._id;

      var segments = [{
        name: 'segment 1'
      }, {
        name: 'segment 2'
      }
      ];


      var mockResponse = {
        result: [{
          preferences: {
            market_intelligence: [
              {
                orgId: 1000003068,
                segments: segments
              }
            ]
          }
        }]
      };

      $httpBackend.expectPUT(expectedUrl, mockData).respond(200, mockResponse);

      spyOn(authService, 'updateMarketIntelligence');

      marketIntelligenceService.saveUserMarketIntelligence(user, mockData.preferences.market_intelligence[0].segments, 1000003068);

      $httpBackend.flush();

      $httpBackend.verifyNoOutstandingRequest();

      expect(authService.updateMarketIntelligence).toHaveBeenCalledWith(mockResponse.result[0].preferences.market_intelligence);
    });
  });

  describe('getIndexData', function () {
    var expectedUrlIndex;
    var expectedUrlOrg;

    beforeEach(function () {
      expectedUrlIndex = apiUrl + '/mi/index';
      expectedUrlOrg = apiUrl + '/mi/index/org';
    });

    it('should be exposed', function () {
      expect(typeof marketIntelligenceService.getIndexData).toBe('function');

    });

    it('should hit the index endpoint', function () {
      var expectedUrl = apiUrl + '/mi/index';

      var paramsObj = {};

      $httpBackend.expectPOST(expectedUrl, paramsObj).respond(200, {});

      marketIntelligenceService.getIndexData(paramsObj);

      $httpBackend.flush();
    });

    it('should hit the org index endpoint', function () {
      var expectedUrl = apiUrl + '/mi/index/org';

      var paramsObj = {};

      $httpBackend.expectPOST(expectedUrl, paramsObj).respond(200, {});

      marketIntelligenceService.getIndexData(paramsObj, true);

      $httpBackend.flush();
    });

    it('should reject the promise if the index returns no data', function () {
      var paramsObj = {};

      var mockResponse = [
        { errorMessage: 'oops' }
      ];

      $httpBackend.expectPOST(expectedUrlIndex, paramsObj).respond(200, mockResponse);

      $httpBackend.expectPOST(expectedUrlOrg, paramsObj).respond(200, mockResponse);

      marketIntelligenceService.getIndexData(paramsObj, true)
        .then(function () {
          throw 'This shouldn\'t have been reached';
        })
        .catch(function (result) {
          expect(result).toBe('No Data');
        });

      $httpBackend.flush();
      $timeout.flush();
    });

    it('should return the index data', function () {
      var paramsObj = {};

      var mockResponseIndex = [
        { someValue: 1 }
      ];

      var mockResponseOrg = [
        { someValue: 2 }
      ];

      $httpBackend.expectPOST(expectedUrlIndex, paramsObj).respond(200, mockResponseIndex);

      $httpBackend.expectPOST(expectedUrlOrg, paramsObj).respond(200, mockResponseOrg);

      marketIntelligenceService.getIndexData(paramsObj, true)
        .then(function (result) {
          expect(result.index[0].someValue).toBe(1);
        })
        .catch(function () {
          throw 'This shouldn\'t have been reached';
        });

      $httpBackend.flush();
      $timeout.flush();
    });

    it('should return the org index data', function () {
      var paramsObj = {};

      var mockResponseIndex = [
        { someValue: 1 }
      ];

      var mockResponseOrg = [
        { someValue: 2 }
      ];

      $httpBackend.expectPOST(expectedUrlIndex, paramsObj).respond(200, mockResponseIndex);

      $httpBackend.expectPOST(expectedUrlOrg, paramsObj).respond(200, mockResponseOrg);

      marketIntelligenceService.getIndexData(paramsObj, true)
        .then(function (result) {
          expect(result.org[0].someValue).toBe(2);
        })
        .catch(function () {
          throw 'This shouldn\'t have been reached';
        });

      $httpBackend.flush();
      $timeout.flush();
    });

    describe('no yesterday data', function () {
      it('should decrease end date by one day', function () {
        var currentEndDate = localizationService.getYesterday().utc();
        var paramsObj = { dateStart: currentEndDate, dateEnd: currentEndDate, compareStart: currentEndDate, compareEnd: currentEndDate };

        var previousDate = localizationService.getYesterday().utc().subtract(1, 'days');
        var shiftedDateObj = { dateStart: previousDate, dateEnd: previousDate, compareStart: currentEndDate, compareEnd: currentEndDate };

        var mockResponse = {};

        $httpBackend.expectPOST(expectedUrlIndex, paramsObj).respond(200, mockResponse);
        $httpBackend.expectPOST(expectedUrlOrg, paramsObj).respond(200, mockResponse);

        marketIntelligenceService.getIndexData(paramsObj, true)
          .then(function () {
            throw 'This shouldn\'t have been reached';
          })
          .catch(function (result) {
            expect(paramsObj.dateEnd.format('MM/DD/YYYY')).toBe(shiftedDateObj.dateEnd.format('MM/DD/YYYY'));
          });

        $httpBackend.flush();
        $timeout.flush();
      });

      it('should decrease start date and end date by one day, if start date and end date are yesterday', function () {
        var currentDate = localizationService.getYesterday().utc();
        var paramsObj = { dateStart: currentDate, dateEnd: currentDate, compareStart: currentDate, compareEnd: currentDate };

        var previousDate = localizationService.getYesterday().utc().subtract(1, 'days');
        var shiftedDateObj = { dateStart: previousDate, dateEnd: previousDate, compareStart: previousDate, compareEnd: previousDate };

        var mockResponse = {};

        $httpBackend.expectPOST(expectedUrlIndex, paramsObj).respond(200, mockResponse);
        $httpBackend.expectPOST(expectedUrlOrg, paramsObj).respond(200, mockResponse);

        marketIntelligenceService.getIndexData(paramsObj, true)
          .then(function () {
            throw 'This shouldn\'t have been reached';
          })
          .catch(function (result) {
            expect(paramsObj.dateStart.format('MM/DD/YYYY')).toBe(shiftedDateObj.dateStart.format('MM/DD/YYYY'));
            expect(paramsObj.dateEnd.format('MM/DD/YYYY')).toBe(shiftedDateObj.dateEnd.format('MM/DD/YYYY'));
            expect(paramsObj.dateStart.format('MM/DD/YYYY')).toBe(paramsObj.dateEnd.format('MM/DD/YYYY'));
          });

        $httpBackend.flush();
        $timeout.flush();
      });

      it('should broadcast noDataForYesterday',function(){
        spyOn($rootScope, '$broadcast').and.callThrough();

        var paramsObj = {
          dateStart: localizationService.getYesterday().utc(),
          dateEnd: localizationService.getYesterday().utc()
        };

        var mockResponseIndex = [
          { someValue: 1 }
        ];

        var mockResponseOrg = [
          { someValue: 2 }
        ];

        $httpBackend.expectPOST(expectedUrlIndex, paramsObj).respond(200, mockResponseIndex);
        $httpBackend.expectPOST(expectedUrlOrg, paramsObj).respond(200, mockResponseOrg);

        marketIntelligenceService.returnDataPromises(paramsObj, true, true)
          .then(function (result) {
            expect(result.index[0].someValue).toBe(1);
            expect($rootScope.$broadcast).toHaveBeenCalledWith('noDataForYesterday', paramsObj);
          })
          .catch(function () {
            throw 'This shouldn\'t have been reached';
          });

        $httpBackend.flush();
        $timeout.flush();
      });
    });
  });

  describe('getCalendarDateRanges', function () {
    it('should get date ranges from the API when a custom calendar is used', function () {

      var startDate = moment('2017-01-01', 'YYYY-MM-DD');
      var endDate = moment('2017-01-30', 'YYYY-MM-DD');

      var calendarEndPoint = apiUrl + '/calendars/1/mi/groupByDateRanges?groupBy=week&dateStart=' + utils.getDateStringForRequest(startDate) + '&dateEnd=' + utils.getDateStringForRequest(endDate);

      var response = {
        result: [{
          start: '01-01-2017',
          end: '07-01-2017'
        }]
      };

      $httpBackend.expectGET(calendarEndPoint).respond(200, response);

      marketIntelligenceService.getCalendarDateRanges(1, 'week', startDate, endDate)
        .then(function (result) {
          expect(result.data.result[0].start).toBe(response.result[0].start);
          expect(result.data.result[0].end).toBe(response.result[0].end);
        })
        .catch(function () {
          throw 'This shouldn\'t have been reached';
        });

      $httpBackend.flush();
    });

    it('should get ranges from the API for period to date when the selected period is periodToDate', function () {
      var startDate = moment('2017-01-01', 'YYYY-MM-DD');
      var endDate = moment('2017-01-30', 'YYYY-MM-DD');

      var calendarEndPoint = apiUrl + '/calendars/1/mi/groupByPeriodToDate?dateEnd=' + utils.getDateStringForRequest(endDate);

      var response = {
        result: [{
          start: '01-01-2017',
          end: '07-01-2017'
        }]
      };

      $httpBackend.expectGET(calendarEndPoint).respond(200, response);

      marketIntelligenceService.getCalendarDateRanges(1, 'periodToDate', startDate, endDate)
        .then(function (result) {
          expect(result.data.result[0].start).toBe(response.result[0].start);
          expect(result.data.result[0].end).toBe(response.result[0].end);
        })
        .catch(function () {
          throw 'This shouldn\'t have been reached';
        });

      $httpBackend.flush();
    });

    describe('gregorian calendar', function () {
      var momentFormat = 'YYYY-MM-DD';

      beforeEach(function () {
        dateRangeHelper.getYTD = function () {
          return {
            start: moment.utc('2017-01-01', momentFormat),
            end: moment.utc('2017-11-30', momentFormat)
          }
        }

        dateRangeHelper.getQTD = function () {
          return {
            start: moment.utc('2017-09-01', momentFormat),
            end: moment.utc('2017-11-30', momentFormat)
          }
        }

        dateRangeHelper.getMTD = function () {
          return {
            start: moment.utc('2017-11-01', momentFormat),
            end: moment.utc('2017-11-30', momentFormat)
          }
        }

        dateRangeHelper.getWTD = function () {
          return {
            start: moment.utc('2017-11-23', momentFormat),
            end: moment.utc('2017-11-30', momentFormat)
          }
        }
      });

      it('should calculate the periodToDate periods when selected period is periodToDate', function () {
        var standardGregorianSundayCalendarId = -2;

        var startDate = moment.utc('2017-01-01', momentFormat);
        var endDate = moment.utc('2017-12-30', momentFormat);

        marketIntelligenceService.getCalendarDateRanges(standardGregorianSundayCalendarId, 'periodToDate', startDate, endDate)
          .then(function (result) {
            var ranges = result.data.result[0];

            expect(ranges.week.start).toBe('2017-11-23T00:00:00.000Z');
            expect(ranges.week.end).toBe('2017-12-30T00:00:00.000Z');

            expect(ranges.month.start).toBe('2017-11-01T00:00:00.000Z');
            expect(ranges.month.end).toBe('2017-12-30T00:00:00.000Z');

            expect(ranges.quarter.start).toBe('2017-09-01T00:00:00.000Z');
            expect(ranges.quarter.end).toBe('2017-12-30T00:00:00.000Z');

            expect(ranges.year.start).toBe('2017-01-01T00:00:00.000Z');
            expect(ranges.year.end).toBe('2017-12-30T00:00:00.000Z');
          })
          .catch(function () {
            throw 'This shouldn\'t have been reached';
          });

        $timeout.flush();
      });

      it('should calculate the periodToDate periods when selected period is periodToDate and the type is compare', function () {
        var standardGregorianSundayCalendarId = -2;

        // Let's fake the bits we need
        localizationService.getCurrentCalendarFirstDayOfWeek = function () {
          return 0;
        }

        utils.getEquivalentPriorYearDateRange = function (range) {
          return {
            start: moment(range.start).subtract(1, 'year'),
            end: moment(range.end).subtract(1, 'year')
          }
        }

        var startDate = moment.utc('2017-01-01', momentFormat);
        var endDate = moment.utc('2017-12-30', momentFormat);


        marketIntelligenceService.getCalendarDateRanges(standardGregorianSundayCalendarId, 'periodToDate', startDate, endDate)
          .then(function (result) {
            var ranges = result.data.result[0];

            expect(ranges.week.start).toBe('2016-11-23T00:00:00.000Z');
            expect(ranges.week.end).toBe('2016-12-30T00:00:00.000Z');

            expect(ranges.month.start).toBe('2016-11-01T00:00:00.000Z');
            expect(ranges.month.end).toBe('2016-12-30T00:00:00.000Z');

            expect(ranges.quarter.start).toBe('2016-09-01T00:00:00.000Z');
            expect(ranges.quarter.end).toBe('2016-12-30T00:00:00.000Z');

            expect(ranges.year.start).toBe('2016-01-01T00:00:00.000Z');
            expect(ranges.year.end).toBe('2016-12-30T00:00:00.000Z');
          })
          .catch(function () {
            throw 'This shouldn\'t have been reached';
          });

        $timeout.flush();
      });
    });
  });

  describe('getSubscriptions', function () {
    var orgId, url;

    beforeEach(function () {
      orgId = 100;
      url = apiUrl + '/mi/subscription?orgId=' + orgId.toString();
    });

    it('should request the subscriptions from the API', function () {
      var mockResponse = [{
        name: 'subscription 1'
      }];

      $httpBackend.expectGET(url).respond(200, mockResponse);

      marketIntelligenceService.getSubscriptions(orgId)
        .then(function (result) {
          expect(result[0].name).toEqual('subscription 1');
        });

      $httpBackend.flush();
    });

    it('should sort response alphabetically', function () {
      var mockResponse = [
        {
          category: {
            name: 'Total Retail'
          }
        }, {
          category: {
            name: 'Total Mall'
          }
        }, {
          category: {
            name: 'Accessories'
          }
        }
      ];

      $httpBackend.expectGET(url).respond(200, mockResponse);

      marketIntelligenceService.getSubscriptions(orgId)
        .then(function (result) {
          expect(result[0].category.name).toEqual('Accessories');
          expect(result[1].category.name).toEqual('Total Mall');
          expect(result[2].category.name).toEqual('Total Retail');
        });

      $httpBackend.flush();
    });
  });

  describe('isSubscriptionValid', function () {
    var subscriptionsInOrg = [{
      'category': {
        'name': 'Total Retail',
      },
      'geography': {
        'name': 'Midwest'
      }
    },
    {
      'category': {
        'name': 'Total Retail'
      },
      'geography': {
        'name': 'Dallas'
      }
    },
    {
      'category': {
        'name': 'Total Retail'
      },
      'geography': {
        'name': 'Orlando'
      }
    },
    {
      'category': {
        'name': 'Total Retail'
      },
      'geography': {
        'name': 'British Columbia'
      }
    }];

    var validSubscriptionInStorage = {
      subscription: [
        {
          'name': 'Geography',
          'value': {
            'src': {
              'name': 'Orlando'
            }
          }
        },
        {
          'name': 'Category',
          'value': {
            'src': {
              'name': 'Total Retail'
            }
          }
        }
      ]
    };

    var invalidSubscriptionInStorage = {
      subscription: [
        {
          'name': 'Geography',
          'value': {
            'src': {
              'name': 'London'
            }
          }
        },
        {
          'name': 'Category',
          'value': {
            'src': {
              'name': 'Total Mall'
            }
          }
        }
      ]
    };

    it('should return true if a subscription in storage matches the subscription in Org', function () {
      expect(marketIntelligenceService.isSubscriptionValid(subscriptionsInOrg, validSubscriptionInStorage)).toBeTruthy();
    });

    it('should return false if a subscription in storage doesn\'t match the subscription in Org', function () {
      expect(marketIntelligenceService.isSubscriptionValid(subscriptionsInOrg, invalidSubscriptionInStorage)).toBeFalsy();
    });
  });

});
