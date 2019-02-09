class SubscriptionsService {
  constructor(ObjectUtils, metricConstants) {
    this.ObjectUtils = ObjectUtils;
    this.metricConstants = metricConstants;
  }

  /** Determines if the current organization has the named subscription.
   *  If the current organization has this subscription then returns true otherwise false.
   *
   *  @param {Object} currentOrganization - The current organization
   *  @param {String} subscriptionName - The named subscription.
   *  @returns {boolean}
   **/
  hasSubscription(currentOrganization, subscriptionName) {
    if (!_.has(currentOrganization, 'subscriptions')) {
      return false;
    }

    if (!_.has(currentOrganization.subscriptions, subscriptionName)) {
      return false;
    }

    return currentOrganization.subscriptions[subscriptionName];
  }

  /** Determines if the current organization has market intelligence as a subscription.
   *  If the current organization has this subscription then returns true otherwise false.
   *
   *  @param {Object} currentOrganization - The current organization.
   *  @returns {boolean}
   **/  
  hasMarketIntelligence(currentOrganization) {
    if (!_.has(currentOrganization, 'status_subscriptions') || !_.has(currentOrganization.status_subscriptions, 'market_intelligence') || _.isEmpty(currentOrganization.status_subscriptions.market_intelligence)) {
      return false;
    }

    return _.last(currentOrganization.status_subscriptions.market_intelligence).status === 'active';
  }

  /** Determines if the current organization has any active subscriptions.
   *  If the current organization has these active subscriptions then 
   *  returns true otherwise false.
   *
   *  @param {Object} subscriptions - The current subscriptions.
   *  @returns {boolean}
   **/    
  getActiveSubscriptions(subscriptions) {
    return _.pick(subscriptions, value => value === true);
  }

  /** Gets the subscriptions for site or org.
   *  If the Site or Org has these subscriptions then 
   *  returns them otherwise returns string 'unknown'.
   *
   *  @param {Object} siteOrOrg - Site or Org.
   *  @returns {boolean}
   **/  
  getSubscriptions(siteOrOrg) {
    if (!this.ObjectUtils.isNullOrUndefined(siteOrOrg) && this.hasSubscription(siteOrOrg.subscriptions)) {
      const subscriptions = this.getActiveSubscriptions(siteOrOrg.subscriptions);

      return _.keys(subscriptions);
    } else {
      return 'unknown';
    }
  }

  /** Gets subscriptions for site or org based on a key string e.g. 'what_if_analysis' 
   *  If the Site or Org has these subscriptions then 
   *  returns them otherwise returns 0.
   *
   *  @param {Object} siteOrOrg - Site or Org.
   *  @returns {boolean}
   **/ 
  getSubscriptionFor(siteOrOrg, _key) {
    return _.contains(this.getSubscriptions(siteOrOrg), _key);
  }

  /** Determines if the org-site has perimeter counting subscription.
   *  If the current organization's site has perimeter subscription 
   *  returns true otherwise false.
   *
   *  @param {Object} currentOrganization - The current organization.
   *  @param {Object} currentSite - The current currentSite.
   *  @returns {boolean}
   **/
  siteHasPerimeter(currentOrganization, currentSite) {
    if (!this.ObjectUtils.isNullOrUndefined(currentSite) && this.hasSubscription(currentSite.subscriptions)) {
      if (currentSite.subscriptions.perimeter && currentSite.subscriptions.perimeter === true) {
        return true;
      } else {
        return false;
      }
    } else if (!this.ObjectUtils.isNullOrUndefined(currentOrganization.subscriptions)) {
      if (currentOrganization.subscriptions.perimeter) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  /** Determines if this org has specific subscriptions e.g. 'sales'.
   *  If the current organization's site has 'sales' subscription 
   *  returns true otherwise false.
   *
   *  @param {Object} subscriptions - The current organization's subscriptions.
   *  @returns {boolean}
   **/
  hasSubscription(subscriptions) {
    return !this.ObjectUtils.isNullOrUndefined(subscriptions) && !this.ObjectUtils.isEmptyObject(subscriptions);
  }

  /** Determines if this org-site has interior subscriptions.
   *  If the current organization's site has 'interior' 
   *  returns true otherwise false.
   *
   *  @param {Object} currentOrganization - The current organization.
   *  @param {Object} currentSite - The current site.
   *  @returns {boolean}
   **/
  siteHasInterior(currentOrganization, currentSite) {
    if (!this.ObjectUtils.isNullOrUndefined(currentSite) && this.hasSubscription(currentSite.subscriptions)) {
      if (currentSite.subscriptions.interior && currentSite.subscriptions.interior === true) {
        return true;
      } else {
        return false;
      }
    } else if (!this.ObjectUtils.isNullOrUndefined(currentOrganization.subscriptions)) {
      if (currentOrganization.subscriptions.interior) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  /** Determines if this org-site has 'sales' subscription.
   *  If the current organization's site has 'sales' 
   *  returns true otherwise false.
   *
   *  @param {Object} currentOrganization - The current organization.
   *  @param {Object} currentSite - The current site.
   *  @returns {boolean}
   **/
  siteHasSales(currentOrganization, currentSite) {
    if (!this.ObjectUtils.isNullOrUndefined(currentSite) && this.hasSubscription(currentSite.subscriptions)) {
      if (currentSite.subscriptions.sales && currentSite.subscriptions.sales === true) {
        return true;
      } else {
        return false;
      }
    } else if (!this.ObjectUtils.isNullOrUndefined(currentOrganization.subscriptions)) {
      if (currentOrganization.subscriptions.sales) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  /** Determines if this org-site has 'labor' subscription.
   *  if this org-site has 'labor' 
   *  returns true otherwise false.
   *
   *  @param {Object} currentOrganization - The current organization.
   *  @param {Object} currentSite - The current site.
   *  @returns {boolean}
   **/
  siteHasLabor(currentOrganization, currentSite) {
    if (!this.ObjectUtils.isNullOrUndefined(currentSite) && this.hasSubscription(currentSite.subscriptions)) {
      if (currentSite.subscriptions.labor && currentSite.subscriptions.labor === true) {
        return true;
      } else {
        return false;
      }
    } else if (!this.ObjectUtils.isNullOrUndefined(currentOrganization.subscriptions)) {
      if (currentOrganization.subscriptions.labor) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  /** Determines if the current session has only an MI subscription
   *  If the user has access to sites, this function returns true if the org has only a market intelligence sub
   *  If the user does not have access to sites but the org has a market intelligence sub, this function returns true
   *
   *  @param {Object} currentOrganization - The current organization
   *  @param {Object[]} sites - The sites available to the current user. Optional.
   *  @returns {boolean}
   **/
  onlyMiSubscription(currentOrganization, sites) {
    try {

      if (angular.isDefined(sites)) {
        if (sites.length === 0 && !_.isEmpty(currentOrganization.status_subscriptions.market_intelligence) && _.last(currentOrganization.status_subscriptions.market_intelligence).status === 'active') {
          return true;
        }
      }

      const orgSubscriptions = [];

      _.each(Object.keys(currentOrganization.subscriptions), key => {
        if (key !== 'large_format_mall' && currentOrganization.subscriptions[key] === true) {
          orgSubscriptions.push(key);
        }
      });

      return orgSubscriptions.length === 1 && orgSubscriptions[0] === 'market_intelligence';
    } catch (e) {
      return false;
    }
  }

   /** Determines if the current user in the current org has MI OrgIndex.
   *
   *  @param {Object} currentUser - The current user.
   *  @param {Object[]} currentOrg - The current organization.
   *  @returns {boolean}
   **/ 
  hasMiOrgIndex(currentUser, currentOrg) {
    if (this.onlyMiSubscription(currentOrg)) {
      // If the org only has an MI sub, they can't be giving us traffic data, and therefore cannot have an index for their org
      return false;
    }

    if (this.ObjectUtils.isNullOrUndefined(currentUser.subscriptions)) {
      return false;
    }

    if (this.ObjectUtils.isNullOrUndefinedOrEmpty(currentUser.subscriptions.mi_index)) {
      return false;
    }

    return _.contains(currentUser.subscriptions.mi_index, currentOrg.organization_id);
  }

   /** Determines if the current org has real-time labor, sales and traffic subscriptions.
   *
   *  @param {Object} currentOrg - The current organization.
   *  @returns {boolean} return true if has all subscriptions otherwise false.
   **/ 
  hasRealTime(currentOrganization) {
    return !this.ObjectUtils.isNullOrUndefined(currentOrganization) && (
      currentOrganization.subscriptions.realtime_labor === true ||
      currentOrganization.subscriptions.realtime_sales === true ||
      currentOrganization.subscriptions.realtime_traffic === true);
  }

   /** Determines if the current org has all the required subscriptions permissions.
   *
   *  @param {Object[]} requiredSubscriptions - The array of required subscriptions.
   *  @param {Object} currentOrganization - The currentOrganization.
   *  @returns {boolean} return true if has permissions otherwise false.
   **/ 
  hasSubscriptions(requiredSubscriptions, currentOrganization) {
    const orgSubscriptions = [];
    _.each(currentOrganization.subscriptions, (value, key) => {
      if (value === true) {
        orgSubscriptions.push(key);
      }
    });

    let subscriptionsCount = 0;

    _.each(requiredSubscriptions, permission => {
      if (_.contains(orgSubscriptions, permission)) {
        subscriptionsCount++;
      }
    });

    return subscriptionsCount === requiredSubscriptions.length;
  }

   /** Determines if the current org has Campaigns.
   *
   *  @param {Object[]} currentOrg - The current organization.
   *  @returns {boolean}
   **/
  hasCampaigns(currentOrganization) {
    return !this.ObjectUtils.isNullOrUndefined(currentOrganization) &&
      !this.ObjectUtils.isNullOrUndefined(currentOrganization.subscriptions) &&
      currentOrganization.subscriptions.campaigns === true;
  }

  /**
   * Check the user object for access to MI.
   *
   * @param {object} userObject - The current user object.
   * @param {int} orgId - The orgId.
   * @returns {Array<object>} returns true if user has MI access otherwise false.
   */
  userHasMarketIntelligence(userObject, orgId) {
    let hasAccess = false;

    try {
      if (userObject.accessMap.setup.mi_orgs) {
        const mi_orgs = userObject.accessMap.setup.mi_orgs;
        hasAccess = (mi_orgs.includes(orgId)); //Check to see if the user has the orgId in their mi_orgs accessmap.
      }
    } catch (e) { }
    return hasAccess;
  }

  /**
   * Returns all metrics that the organization has access to
   *
   * @param {object} organization - The current organization as returned by /organizations/:orgId
   * @returns {Array<object>} An array of metrics
   */
  getMetrics(organization) {
    var metrics = [];

    var metrics = this.metricConstants.metrics.filter(({requiredSubscriptions}) => this.hasSubscriptions(requiredSubscriptions, organization));

    if (organization.peel_off === true) {
      const peelOff = _.findWhere(this.metricConstants.metrics, { kpi: 'peel_off' });
      metrics.push(peelOff);
    }

    return metrics;
  }

  /**
   * Checks to see if an org has sales categories.
   * Works around the inconsistent states that organization objects can be in.
   * As the sales category could be in one of two places
   *
   * @param {object<organization>} organization The organization to check
   * @returns {boolean}
   */
  orgHasSalesCategories(organization) {
    // First, check the portal settings...
    if (!this.ObjectUtils.isNullOrUndefined(organization) &&
      !this.ObjectUtils.isNullOrUndefined(organization.portal_settings)
      && !this.ObjectUtils.isNullOrUndefinedOrEmpty(organization.portal_settings.sales_categories)
      && organization.portal_settings.sales_categories.length > 1) {
      return true;
    }

    // Now check the root of the organization object...
    if (!this.ObjectUtils.isNullOrUndefined(organization) &&
      !this.ObjectUtils.isNullOrUndefinedOrEmpty(organization.sales_categories)
      && organization.sales_categories.length > 1) {
      return true;
    }

    return false;
  }
}

angular.module('shopperTrak')
  .service('SubscriptionsService', SubscriptionsService)

SubscriptionsService.$inject = ['ObjectUtils', 'metricConstants'];