
class operatingHoursService {
  /** Retrieves the default setting for the operating hours setting.
   *  Should be called during a page's activate cycle.
   *  Checks the user's override, then stateParams, then Org, before falling back to the app default of true
   *  Public function
   *
   *  @param {object<$stateParams>} stateParams - The $stateParams
   *  @param {object<organization>} organization - The organization
   *  @returns {boolean}
   **/
  getOperatingHoursSetting(stateParams, organization) {
    if (_.isUndefined(stateParams)) {
      throw new Error('stateParams is required');
    }

    if (_.isUndefined(organization)) {
      throw new Error('organization is required');
    }

    // 1. Check the override
    if (_.isBoolean(this.operatingHoursOverride)) {
      return this.operatingHoursOverride;
    }

    // 2. Check the state
    if (stateParams.businessDays === 'true') {
      return false;
    }

    if (stateParams.businessDays === 'false') {
      return true;
    }

    // 3. Check the current org
    if (!_.isUndefined(organization.operating_hours)) {
      return organization.operating_hours;
    }

    // 4. Default to true
    return true;
  }

  /** Stores the user selection for the current session
   *  Should be called when the user updates their operating hours / business days option
   *  Public function
   *
   *  @param {boolean} operatingHours - The user's choice
   **/
  setOperatingHours(operatingHours) {
    this.operatingHoursOverride = operatingHours;
  }

  /** Stores the current compareMode
   *  Should be called when the user updates their compare mode selection
   *  Public function
   *
   *  @param {boolean} operatingHours - The user's choice
   **/
  setCompareMode(_compareMode) {
    this.compareMode = _compareMode;
  }

  /** Gets the stored compareMode
   *  Public function
   *
   *  @param {boolean} operatingHours - The user's choice
   **/
  getCompareMode() {
    return this.compareMode;
  }
}

angular.module('shopperTrak')
  .service('operatingHoursService', operatingHoursService)

operatingHoursService.$inject = [];