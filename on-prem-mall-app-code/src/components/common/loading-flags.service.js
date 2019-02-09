class loadingFlagsService {
  constructor ($rootScope) {
    this.$rootScope = $rootScope;
  }
  /**
   * Safely broadcasts the 'pageLoadFinished' on the rootScope if all loading flags are set to false.
   *
   * @param {object} loadingFlags - A simple flat object where all props are booleans.
   * @param {function} unbindFunction - The unbind function. Required
   */
  onLoadingFlagsChange (loadingFlags, unbindFunction) {
    if (_.isUndefined(loadingFlags)) {
      return;
    }

    if (!_.isFunction(unbindFunction)) {
      throw new Error('An unbind function must be provided');
    }

    const props = _.keys(loadingFlags);
    let isLoading = false;

    _.each(props, prop => {
      if (loadingFlags[prop] === true) {
        isLoading = true;
      }
    });

    if (isLoading === false) {
      this.$rootScope.$broadcast('pageLoadFinished');

      if (_.isFunction(unbindFunction)) {
        unbindFunction();
      }
    }
  }
}

angular.module('shopperTrak')
  .service('loadingFlagsService', loadingFlagsService);

loadingFlagsService.$inject = [
  '$rootScope'];

