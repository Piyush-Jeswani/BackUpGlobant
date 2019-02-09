'use strict';

describe('SubscriptionsService', function() {
  var SubscriptionsService;

  beforeEach(module('shopperTrak'));
  beforeEach(module('shopperTrak.constants'));
  beforeEach(inject(function(_SubscriptionsService_) {
    SubscriptionsService = _SubscriptionsService_;
  }));

  describe('orgHasSalesCategories', function() {
    it('should return false if the organization has no sales_categories in portal_settings or on the root object', function() {
      var hasSales = SubscriptionsService.orgHasSalesCategories({});

      expect(hasSales).toBe(false);
    });

    it('should return true if the organization has sales_categories in the root object', function() {
      var org = {
        sales_categories: [
          { name: 'Total Sales', id: 0 },
          { name: 'Other Sales', id: 1}
        ]
      };

      var hasSales = SubscriptionsService.orgHasSalesCategories(org);

      expect(hasSales).toBe(true);
    });

    it('should return true if the organization has sales_categories in the portal_Settings object', function() {
      var org = {
        portal_settings: {
          sales_categories: [
            { name: 'Total Sales', id: 0 },
            { name: 'Other Sales', id: 1}
          ]
        }
      };

      var hasSales = SubscriptionsService.orgHasSalesCategories(org);

      expect(hasSales).toBe(true);
    });

    it('should return false if the organization contains only one sales category in the portal_settings object', function() {
      var org = {
        portal_settings: {
          sales_categories: [
            { name: 'Total Sales', id: 0 }
          ]
        }
      };

      var hasSales = SubscriptionsService.orgHasSalesCategories(org); 

      expect(hasSales).toBe(false);
    });

    it('should return false if the organization contains only one sales category in the root object', function() {
      var org = {
        sales_categories: [
          { name: 'Total Sales', id: 0 }
        ]
      };

      var hasSales = SubscriptionsService.orgHasSalesCategories(org);

      expect(hasSales).toBe(false);
    });
  });

  describe('getSubscriptions', function() {
    it('should return [large_format_mall, interior, perimeter] only site subscription for large_format_mall, interior, perimeter  are true', function() {
      var siteMock = {
        subscriptions: {
          market_intelligence: false,
          qlik: false,
          large_format_mall: true,
          interior: true,
          perimeter: true
        }
      };

      var _activeSubscriptions = JSON.stringify(SubscriptionsService.getSubscriptions(siteMock));
      var expectedResult = JSON.stringify(['large_format_mall', 'interior', 'perimeter']);

      expect(_activeSubscriptions).toEqual(expectedResult);
    });

    it('should return [perimeter] value when only organization perimeter subscription is true ', function() {
      var organizationMock = {
        subscriptions: {
          perimeter: true,
          interior: false
        }
      };

      var _activeSubscriptions = SubscriptionsService.getSubscriptions(organizationMock);

      expect(_activeSubscriptions).toEqual(['perimeter']);
    });
  });

  describe('getSubscriptions()', function() {
    it('should return unknown when null is passed in', function() {
      expect(SubscriptionsService.getSubscriptions(null)).toEqual('unknown');
    });
  });

  describe('siteHasPerimeter', function() {
    it('should return true when site has perimeter subscription', function() {
      var organizationMock = {
        subscriptions: {
          perimeter: true,
          interior: false
        }
      };
      var siteMock = {
        subscriptions: {
          market_intelligence: false,
          qlik: false,
          large_format_mall: true,
          interior: true,
          perimeter: true
        }
      };
      expect(SubscriptionsService.siteHasPerimeter(organizationMock,siteMock)).toBe(true);
    });
  });

  describe('siteHasInterior()', function() {
    it('should return true when organization has interior subscription', function() {
      var organizationMock = {
        subscriptions: {
          perimeter: true,
          interior: true
        }
      };
      var siteMock = {};
      expect(SubscriptionsService.siteHasInterior(organizationMock,siteMock)).toBe(true);
    });
  });

  describe('siteHasInterior()', function() {
    it('should return true when organization has interior subscription and so does site', function() {
      var organizationMock = {
        subscriptions: {
          perimeter: true,
          interior: true
        }
      };
      var siteMock = {
        subscriptions: {
          market_intelligence: false,
          qlik: false,
          large_format_mall: true,
          interior: true,
          perimeter: true,
          sales: true     
        }   
      };
      expect(SubscriptionsService.siteHasInterior(organizationMock,siteMock)).toBe(true);
    });
  });

  describe('siteHasInterior()', function() {
    it('should return false when organization has interior subscription, but site does not', function() {
      var organizationMock = {
        subscriptions: {
          perimeter: true,
          interior: true
        }
      };
      var siteMock = {
        subscriptions: {
          market_intelligence: false,
          qlik: false,
          large_format_mall: true,
          interior: false,
          perimeter: true,
          sales: true     
        }   
      };
      expect(SubscriptionsService.siteHasInterior(organizationMock,siteMock)).toBe(false);
    });
  });  

  describe('siteHasInterior()', function() {
    it('should return false when organization has no interior subscription and site has no subscriptions', function() {
      var organizationMock = {
        subscriptions: {
          perimeter: true,
          interior: false
        }
      };
      var siteMock = {
        
      };
      expect(SubscriptionsService.siteHasInterior(organizationMock,siteMock)).toBe(false);
    });
  });  

  describe('siteHasInterior()', function() {
    it('should return false when organization and site have no subscriptions', function() {
      var organizationMock = {
        
      };
      var siteMock = {
        
      };
      expect(SubscriptionsService.siteHasInterior(organizationMock,siteMock)).toBe(false);
    });
  });  


  describe('siteHasPerimeter()', function() {
    it('should return true when site has perimeter subscription', function() {
      var organizationMock = {
        subscriptions: {
          perimeter: true,
          interior: false
        }
      };
      var siteMock = {
        subscriptions: {
          market_intelligence: false,
          qlik: false,
          large_format_mall: true,
          interior: true,
          perimeter: true,
          sales: true
        }
      };
      expect(SubscriptionsService.siteHasPerimeter(organizationMock,siteMock)).toBe(true);
    });
  });

  describe('siteHasPerimeter()', function() {
    it('should return true when site has perimeter subscription', function() {
      var organizationMock = {
        subscriptions: {
          perimeter: true,
          interior: false,
          sales: true
        }
      };
      var siteMock = {
        subscriptions: {
          market_intelligence: false,
          qlik: false,
          large_format_mall: true,
          interior: true,
          perimeter: true
        }
      };
      expect(SubscriptionsService.siteHasPerimeter(organizationMock,siteMock)).toBe(true);
    });
  });

  describe('siteHasPerimeter()', function() {
    it('should return false when site and organisation have no subscriptions', function() {
      var organizationMock = {
        
      };
      var siteMock = {
        
      };
      expect(SubscriptionsService.siteHasPerimeter(organizationMock,siteMock)).toBe(false);
    });
  });

  describe('siteHasPerimeter()', function() {
    it('should return false when site and organisation have perimeter subscriptions set to false', function() {
      var organizationMock = {
       subscriptions: {
          perimeter: false
        }       
      };
      var siteMock = {
       subscriptions: {
          perimeter: false
        }            
      };
      expect(SubscriptionsService.siteHasPerimeter(organizationMock,siteMock)).toBe(false);
    });
  });

  describe('siteHasPerimeter()', function() {
    it('should return true when site has no subscriptions and organisation has perimeter set to true', function() {
      var organizationMock = {
       subscriptions: {
          perimeter: true
        }       
      };
      var siteMock = {
                
      };
      expect(SubscriptionsService.siteHasPerimeter(organizationMock,siteMock)).toBe(true);
    });
  });

  describe('siteHasPerimeter()', function() {
    it('should return false when site has no subscriptions and organisation has perimeter set to false', function() {
      var organizationMock = {
       subscriptions: {
          perimeter: false
        }       
      };
      var siteMock = {
                
      };
      expect(SubscriptionsService.siteHasPerimeter(organizationMock,siteMock)).toBe(false);
    });
  });

  describe('siteHasSales()', function() {
    it('should return true when site has sales subscription', function() {
      var organizationMock = {
        subscriptions: {
          perimeter: true,
          interior: false
        }
      };
      var siteMock = {
        subscriptions: {
          market_intelligence: false,
          qlik: false,
          large_format_mall: true,
          interior: true,
          perimeter: true,
          sales: true
        }
      };
      expect(SubscriptionsService.siteHasSales(organizationMock,siteMock)).toBe(true);
    });
  });

  describe('siteHasSales', function() {
    it('should return false when site has no sales subscription for organisation', function() {
      var organizationMock = {
        subscriptions: {
          perimeter: true,
          interior: false,
          sales: true
        }
      };
      var siteMock = {
        subscriptions: {
          market_intelligence: false,
          qlik: false,
          large_format_mall: true,
          interior: true,
          perimeter: true
        }
      };
      expect(SubscriptionsService.siteHasSales(organizationMock,siteMock)).toBe(false);
    });
  });

  describe('siteHasSales', function() {
    it('should return false when site has no sales subscription and neither does the organisation', function() {
      var organizationMock = {
        subscriptions: {
          perimeter: true,
          interior: false
        }
      };
      var siteMock = {
        subscriptions: {
          market_intelligence: false,
          qlik: false,
          large_format_mall: true,
          interior: true,
          perimeter: true
        }
      };
      expect(SubscriptionsService.siteHasSales(organizationMock,siteMock)).toBe(false);
    });
  });

  describe('siteHasSales', function() {
    it('should return true when site has no subscriptions, but organisation has sales', function() {
      var organizationMock = {
        subscriptions: {
          perimeter: true,
          interior: false,
          sales: true
        }
      };
      var siteMock = {
       
      };
      expect(SubscriptionsService.siteHasSales(organizationMock,siteMock)).toBe(true);
    });
  });

  describe('siteHasSales', function() {
    it('should return false when site has no subscriptions, but organisation has no sales subscription either', function() {
      var organizationMock = {
        subscriptions: {
          perimeter: true,
          interior: false
        }
      };
      var siteMock = {
       
      };
      expect(SubscriptionsService.siteHasSales(organizationMock,siteMock)).toBe(false);
    });
  });

  describe('siteHasSales', function() {
    it('should return false when site and organisation both have no subscriptions', function() {
      var organizationMock = {
        
      };

      var siteMock = {
       
      };
      expect(SubscriptionsService.siteHasSales(organizationMock,siteMock)).toBe(false);
    });
  });

  describe('siteHasLabor()', function() {
    it('should return true when organization has labor subscription', function() {
      var organizationMock = {
        subscriptions: {
          perimeter: true,
          interior: false,
          labor: true
        }
      };
      var siteMock = {
        subscriptions: {
          market_intelligence: false,
          qlik: false,
          large_format_mall: true,
          interior: true,
          perimeter: true
        }
      };
      expect(SubscriptionsService.siteHasPerimeter(organizationMock,siteMock)).toBe(true);
    });
  });

  describe('siteHasLabor()', function() {
    it('should return true when organization has labor subscription', function() {
      var organizationMock = {
        subscriptions: {
          perimeter: true,
          interior: false,
          labor: true
        }
      };
      var siteMock = {
        subscriptions: {
          market_intelligence: false,
          qlik: false,
          large_format_mall: true,
          interior: true,
          perimeter: true,
          labor: true
        }
      };
      expect(SubscriptionsService.siteHasLabor(organizationMock,siteMock)).toBe(true);
    });
  });

  describe('siteHasLabor', function() {
    it('should return false when organization has labor subscription, but site does not', function() {
      var organizationMock = {
        subscriptions: {
          perimeter: true,
          interior: false,
          labor: true
        }
      };
      var siteMock = {
        subscriptions: {
          market_intelligence: false,
          qlik: false,
          large_format_mall: true,
          interior: true,
          perimeter: true,
          labor: false
        }
      };
      expect(SubscriptionsService.siteHasLabor(organizationMock,siteMock)).toBe(false);
    });
  });

  describe('siteHasLabor', function() {
    it('should return true when organization has labor subscription, but site has no subscriptions', function() {
      var organizationMock = {
        subscriptions: {
          perimeter: true,
          interior: false,
          labor: true
        }
      };
      var siteMock = {
       
      };
      expect(SubscriptionsService.siteHasLabor(organizationMock,siteMock)).toBe(true);
    });
  });

  describe('siteHasLabor', function() {
    it('should return false when organization has no labor subscription and site has no subscriptions', function() {
      var organizationMock = {
        subscriptions: {
          perimeter: true,
          interior: false,
          labor: false
        }
      };
      var siteMock = {
       
      };
      expect(SubscriptionsService.siteHasLabor(organizationMock,siteMock)).toBe(false);
    });
  });

  describe('siteHasLabor', function() {
    it('should return false when organization site have no subscriptions', function() {
      var organizationMock = {
       
      };
      var siteMock = {
       
      };
      expect(SubscriptionsService.siteHasLabor(organizationMock,siteMock)).toBe(false);
    });
  });

  describe('hasMarketIntelligence', function() {
    it('should return false when the organization object has no subscription properties', function() {
      var organizationMock = {
      };

      var hasMi = SubscriptionsService.hasMarketIntelligence(organizationMock);
      //to do when we remove mocking in subscription this needs to be false
      expect(hasMi).toBe(false);
    });

    it('should return false when the organization object has no market intelligence property', function() {
      var organizationMock = {
        status_subscriptions: {

        }
      };

      var hasMi = SubscriptionsService.hasMarketIntelligence(organizationMock);
      //to do when we remove mocking in subscription this needs to be false
      expect(hasMi).toBe(false);
    });

    it('should return false when last market_intelligence object has disabled status', function() {
      var organizationMock = {
        status_subscriptions: {
          market_intelligence: [{status:'disabled'}]
        }
      };

      var hasMi = SubscriptionsService.hasMarketIntelligence(organizationMock);
      //to do when we remove mocking in subscription this needs to be false
      expect(hasMi).toBe(false);
    });

    it('should return true when the last market_intelligence object has an active status', function() {
      var organizationMock = {
        status_subscriptions: {
          market_intelligence: [{status:'active'}]
        }
      };

      var hasMi = SubscriptionsService.hasMarketIntelligence(organizationMock);
      //to do when we remove mocking in subscription this needs to be false
      expect(hasMi).toBe(true);
    });
  });

  describe('hasRealTime', function() {
    it('should return false when the organization object has all realtime subscription properties set to false', function() {
      var organizationMock = {
        subscriptions: {
          realtime_labor: false,
          realtime_sales: false,
          realtime_traffic: false
        }
      };

      var hasRealTime = SubscriptionsService.hasRealTime(organizationMock);
      //to do when we remove mocking in subscription this needs to be false
      expect(hasRealTime).toBe(false);
    });

    it('should return true when the organization object has realtime_labor set to true', function() {
      var organizationMock = {
        subscriptions: {
          realtime_labor: true,
          realtime_sales: false,
          realtime_traffic: false
        }
      };

      var result = SubscriptionsService.hasSubscription(organizationMock, 'realtime_sales');

      expect(result).toBe(true);
    });

    it('should return true when the organization object has realtime_sales set to true', function() {
      var organizationMock = {
        subscriptions: {
          realtime_labor: false,
          realtime_sales: true,
          realtime_traffic: false
        }
      };

      var result = SubscriptionsService.hasSubscription(organizationMock, 'realtime_sales');

      expect(result).toBe(true);
    });

    it('should return true when the organization object has realtime_traffic set to true', function() {
      var organizationMock = {
        subscriptions: {
          realtime_labor: false,
          realtime_sales: false,
          realtime_traffic: true
        }
      };

      var result = SubscriptionsService.hasSubscription(organizationMock, 'realtime_traffic');

      expect(result).toBe(true);
    });
  });

  describe('check metric substription', function () {
    it('should return true when traffic is true', function() {
      var organizationMock = {
        subscriptions: {
          traffic: true,
        }
      };

      var result = SubscriptionsService.hasSubscription(organizationMock, 'traffic');

      expect(result).toBe(true);
    });
    it('should return true when dwell time is true', function() {
      var organizationMock = {
        subscriptions: {
          dwell_time: true,
        }
      };

      var result = SubscriptionsService.hasSubscription(organizationMock, 'dwell_time');

      expect(result).toBe(true);
    });

    it('should return true when star is true', function() {
      var organizationMock = {
        subscriptions: {
          star: true,
        }
      };

      var result = SubscriptionsService.hasSubscription(organizationMock, 'star');

      expect(result).toBe(true);
    });
    it('should return true when sales is true', function() {
      var organizationMock = {
        subscriptions: {
          sales: true,
        }
      };

      var result = SubscriptionsService.hasSubscription(organizationMock, 'sales');

      expect(result).toBe(true);
    });
    it('should return true when ats is true', function() {
      var organizationMock = {
        subscriptions: {
          ats: true,
        }
      };

      var result = SubscriptionsService.hasSubscription(organizationMock, 'ats');

      expect(result).toBe(true);
    });

    it('should return true when upt is true', function() {
      var organizationMock = {
        subscriptions: {
          upt: true,
        }
      };

      var result = SubscriptionsService.hasSubscription(organizationMock, 'upt');

      expect(result).toBe(true);
    });
  });

  describe('hasSubscriptions()', function() {
    it('should return true if organisation has required permissions for a subscription', function() {
      var requiredSubscriptions = ['realtime_labor', 'realtime_sales'];
  
      var currentOrgMock = {
        subscriptions: {
          realtime_labor: true,
          realtime_sales: true,
          realtime_traffic: false
        }
      };

      expect(SubscriptionsService.hasSubscriptions(requiredSubscriptions, currentOrgMock)).toBe(true);
    });
  });

  describe('userHasMarketIntelligence()', function() {
    it('should return true i.e. user object has access to MI', function() {
      var currentUser = {accessmap: {}};

      var organization_id = 1;

      expect(SubscriptionsService.userHasMarketIntelligence(currentUser, organization_id)).toBe(false);
    });
  });  

  describe('onlyMiSubscription()', function() {
    it('should return false as session has no MI subscription', function() {
      var currentOrganization = {
                'subscriptions': {
                  'market_intelligence': false
                }
      }

      // e.g to access MI bool setting currentOrganization.subscriptions.market_intelligence;

      expect(SubscriptionsService.onlyMiSubscription(currentOrganization)).toBe(false);
    });
  });

  describe('getMetrics', function() {
    describe('org with no subscriptions (traffic only)', function() {
      it('should return traffic metrics', function() {
        var org = {
          subscriptions: {}
        };
  
        var metrics = SubscriptionsService.getMetrics(org);
  
        var traffic = _.findWhere(metrics, {value: 'traffic'});
  
        expect(traffic).toBeDefined();
  
        expect(traffic.kpi).toBe('traffic');
      });

      it('should not return sales metrics', function() {
        var org = {
          subscriptions: {}
        };
  
        var metrics = SubscriptionsService.getMetrics(org);
  
        var sales = _.findWhere(metrics, {value: 'sales'});
  
        expect(sales).toBeUndefined();
      });
    });

    describe('org with sales subscriptions', function() {
      it('should return sales metrics', function() {
        var org = {
          subscriptions: {
            sales: true
          }
        };
  
        var metrics = SubscriptionsService.getMetrics(org);
  
        var sales = _.findWhere(metrics, {value: 'sales'});
  
        expect(sales).toBeDefined();

        expect(sales.kpi).toBe('sales');
      });
    });

    describe('org with sales and labor subscriptions', function() {
      it('should return STAR', function() {
        var org = {
          subscriptions: {
            sales: true,
            labor: true
          }
        };
  
        var metrics = SubscriptionsService.getMetrics(org);
  
        var sales = _.findWhere(metrics, {value: 'star'});
  
        expect(sales).toBeDefined();

        expect(sales.kpi).toBe('star');
      });
    });

  });
});
