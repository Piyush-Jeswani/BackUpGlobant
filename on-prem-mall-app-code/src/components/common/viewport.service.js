class viewportService {
  constructor ($rootScope) {
    this.$rootScope = $rootScope;

    this._breakpoints = {};
    this._viewportInfo = {
      width: 0,
      height: 0,
      breakpoint: {}
    };
  }

  /**
    * Returns _breakpoints object.
    * @returns {object} returns _breakpoints object.
    */
  getBreakpoints () {
    return this._breakpoints;
  }

  /**
    * Set _breakpoints object.
    * @param {object} newBreakpoints the version of breakpoints that needs to replace
    * the stored one.
    * @returns {bool} returns true if the replacement was successful otherwise false.
    */
  setBreakpoints (newBreakpoints) {
    if (_.isUndefined(newBreakpoints)) return false;
    this._breakpoints = newBreakpoints;
    return true;
  }

  /**
    * Returns _breakpoints property of the _viewportInfo object.
    * @returns {object} returns_breakpoints object property in _viewportInfo.
    */  
  getCurrentBreakpoint () {
    return this._viewportInfo.breakpoint;
  }

  /**
    * Set _breakpoints property in _viewportInfo.
    * @param {object} newBreakpoints the version of breakpoints that needs to replace
    * the stored one in _viewportInfo.
    * @returns {bool} returns true if the replacement was successful otherwise false.
    */
  setCurrentBreakpoint (newBreakpoint) {
    if (_.isUndefined(newBreakpoint.name) || newBreakpoint.name === this._viewportInfo.breakpoint.name) {
      return false;
    } 

    this._viewportInfo.breakpoint = newBreakpoint;
    this.$rootScope.$broadcast('viewportBreakpointChanged', this._viewportInfo.breakpoint);
    return true;
  }

  /**
    * Returns _viewportInfo object.
    * @returns {object} returns _viewportInfo object.
    */
  getViewportInfo () {
    return this._viewportInfo;
  }

  /**
    * Set _viewportInfo object with the information passed in.
    * @param {object} info passed in.
    */
  setViewportInfo (info) {
    const newInfo = {};
    if (info.hasOwnProperty('width') && _.isNumber(info.width)) {
      newInfo.width = info.width;
      newInfo.widthChanged = info.width !== this._viewportInfo.width;
    }
    if (info.hasOwnProperty('height') && _.isNumber(info.height)) {
      newInfo.height = info.height;
      newInfo.heightChanged = info.height !== this._viewportInfo.height;
    }
    if (info.hasOwnProperty('breakpoint') && _.isString(info.breakpoint.name)) {
      const breakpointChanged = info.breakpoint.name !== this._viewportInfo.breakpoint.name;
      newInfo.breakpoint = info.breakpoint;
      newInfo.breakpointChanged = breakpointChanged;
      if (breakpointChanged) this.setCurrentBreakpoint(newInfo.breakpoint);
    }
    this._viewportInfo = _.extend(this._viewportInfo, newInfo);
    this.$rootScope.$broadcast('viewportChanged', newInfo);
  }
}

angular.module('shopperTrak').service('viewportService', viewportService);

viewportService.$inject = ['$rootScope'];
