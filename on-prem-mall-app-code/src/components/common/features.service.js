class features {
  constructor (ObjectUtils, featuresConfig, $window) {
    this.ObjectUtils = ObjectUtils;
    this.featuresConfig = featuresConfig;
    this.$window = $window;

    // Add feature CSS classes to <html>:
    _.each(Object.keys(featuresConfig), name => {
      /* checking for $winow.document before adding styles to avoid test case failures */
      if ($window.document) {
        $window.document.documentElement.classList.add(`${this.isEnabled(name) ? '' : 'no-'}feature-${name}`);
      }
    });
  }

  /**
   * This function checks if the feature name passed in is enabled or not.
   * 
   * @param {String} featureName string parameter passed in
   * @return {bool} true if enabled otherwise false
   */
  isEnabled (featureName) {
    if (this.allFeaturesOn()) {
      return true;
    }

    if (this.ObjectUtils.isNullOrUndefinedOrEmpty(featureName)) {
      console.error(`Feature name is not valid: ${featureName}`);
      return false;
    }
    const featureValue = this.featuresConfig[featureName];

    if (this.ObjectUtils.isNullOrUndefined(featureValue)) {
      console.error(`Feature name: ${featureName} has invalid value: ${featureValue}`);
      return false;
    }
    return featureValue === true;
  }

  /**
   * This function checks if all the STAn features are on 
   * according to the feature configuration.
   * 
   * @return {bool} true if enabled otherwise false
   */
  allFeaturesOn () {
    if (!this.featuresConfig) {
      return false;
    }

    return this.featuresConfig['allFeaturesOn'] === true;
  }
}

angular.module('shopperTrak')
  .service('features', features);

features.$inject = [
  'ObjectUtils',
  'featuresConfig',
  '$window'];







