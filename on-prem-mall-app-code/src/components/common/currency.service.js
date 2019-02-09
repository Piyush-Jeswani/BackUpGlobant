class currencyService {
  constructor(OrganizationResource, SiteResource, $q, currencies, ObjectUtils) {
    this.defaultCurrency = 'USD';
    this.OrganizationResource = OrganizationResource;
    this.SiteResource = SiteResource;
    this.$q = $q;
    this.currencies = currencies;
    this.ObjectUtils = ObjectUtils;
  }

  /**
     * Gets the currency symbol for an org-site based on the orgId and siteId.
     * @param {int} orgId passed into function.
     * @param {int} siteId passed into function.
     * @return {object} return value.
     */
  getCurrencySymbol(orgId, siteId) {
    const deferred = this.$q.defer();

    const promises = [];

    promises.push(this.getOrganization(orgId));

    if (typeof siteId !== 'undefined') {
      promises.push(this.getSite(orgId, siteId));
    }

    this.$q.all(promises).then((params) => {
      let organizationCurrency;
      let siteCurrency;

      _.each(params, param => {
        if (typeof param.orgCurrency === 'object') {
          organizationCurrency = param.orgCurrency;
        }

        if (typeof param.siteCurrency === 'object') {
          siteCurrency = param.siteCurrency;
        }
      });

      let currencyInfo = {
        orgId,
        currency: this.defaultCurrency
      };

      if (this.currencyIsValid(organizationCurrency)) {
        currencyInfo = organizationCurrency;
      }

      if (this.currencyIsValid(siteCurrency)) {
        currencyInfo = siteCurrency;
      }

      if (typeof siteCurrency !== 'undefined' && typeof siteCurrency.siteId !== 'undefined') {
        currencyInfo.siteId = siteCurrency.siteId;
      }

      currencyInfo.currencySymbol = this.currencies[currencyInfo.currency];

      deferred.resolve(currencyInfo);
    }).catch(() => {
      const currencyInfo = {
        orgId,
        currency: this.defaultCurrency,
        currencySymbol: this.currencies[this.defaultCurrency]
      };

      deferred.resolve(currencyInfo);
    });
    return deferred.promise;
  }

  /**
     * Determines if the currency is valid.
     * @param {object} currencyInfo passed into function.
     * @return {bool} return value true is valid otherwise false.
     */
  currencyIsValid(currencyInfo) {
    if (this.ObjectUtils.isNullOrUndefined(currencyInfo)) {
      return false;
    }

    if (this.ObjectUtils.isNullOrUndefined(currencyInfo.currency)) {
      return false;
    }

    if (currencyInfo.currency === 'NONE') {
      return false;
    }

    return true;
  }

  /**
     * Gets the organizationCurrency based on the orgId.
     * @param {int} orgId passed into function.
     * @return {object} return value.
     */
  getOrganization(orgId) {
    const deferred = this.$q.defer();

    this.OrganizationResource.get({
      orgId
    }).$promise.then(organization => {

      if (typeof organization !== 'undefined' &&
        typeof organization.portal_settings !== 'undefined' &&
        typeof organization.portal_settings.currency !== 'undefined') {

        const organizationCurrency = {
          orgId: organization.organization_id,
          currency: organization.portal_settings.currency
        };

        deferred.resolve({ 'orgCurrency': organizationCurrency });
      } else {
        deferred.reject();
      }
    });

    return deferred.promise;
  }

  /**
     * Gets the organizationCurrency based on the orgId.
     * @param {orgId} orgId passed into function.
     * @param {siteId} siteId passed into function.
     * @return {object} return site object.
     */
  getSite(orgId, siteId) {
    const deferred = this.$q.defer();

    this.SiteResource.get({
      orgId,
      siteId
    }).$promise.then(site => {

      if (typeof site !== 'undefined' &&
        typeof site.currency !== 'undefined') {

        const siteCurrency = {
          orgId: site.organization.id,
          siteId: site.site_id,
          currency: site.currency
        };

        deferred.resolve({ 'siteCurrency': siteCurrency });
      } else {
        const fallbackSiteCurrency = {
          orgId,
          siteId,
          currency: 'NONE'
        };
        deferred.resolve({ 'siteCurrency': fallbackSiteCurrency });
      }

    });

    return deferred.promise;
  }
}

angular.module('shopperTrak')
  .factory('currencyService', [
    'OrganizationResource',
    'SiteResource',
    '$q',
    'currencies',
    'ObjectUtils'])

angular.module('shopperTrak')
  .service('currencyService', currencyService)

currencyService.$inject = ['OrganizationResource', 'SiteResource', '$q', 'currencies', 'ObjectUtils'];