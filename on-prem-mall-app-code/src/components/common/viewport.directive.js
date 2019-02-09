(function(){
  'use strict';

  angular.module('shopperTrak').directive('viewport', ['viewportService', '$window', viewportDirective]);

  function viewportDirective(viewportService, $window) {
    return {
      restrict: 'A',
      link: function viewportDirectiveLink(){

        var debouncedResizeHandler;
        var RESIZE_DEBOUNCE_DURATION = 300;

        activate();

        function activate() {
          viewportService.setBreakpoints(getBreakpointDefinitions());
          // Events:
          debouncedResizeHandler = _.debounce(resizeHandler, RESIZE_DEBOUNCE_DURATION);
          toggleResizeHandler(true);
          // Initialise viewport service with current
          viewportService.setCurrentBreakpoint(getCurrentBreakpoint());
        }

        function resizeHandler(event) {
          if (event.originalEvent instanceof CustomEvent) return false; // Workaround for redrawing charts.
          viewportService.setViewportInfo({
            width: $window.innerWidth,
            height: $window.innerHeight,
            breakpoint: getCurrentBreakpoint()
          });
        }
        function toggleResizeHandler(toggleState) {
          if (!_.isBoolean(toggleState)) toggleState = false;
          angular.element($window)[toggleState ? 'on' : 'off']('resize', debouncedResizeHandler);
        }

        function getCSSdata(el) {
          if (el instanceof Element === false) {
            console.error('Cant get CSS data for invalid element:', el);
            return false;
          }
          return $window.getComputedStyle(el).getPropertyValue('font-family').replace(/"|'|`/g, '');
        }

        function getCurrentBreakpoint() {
          var breakpointName = getCSSdata(document.head);
          if(!breakpointName) return false;
          return {
            name: breakpointName,
            width: viewportService.getBreakpoints()[breakpointName]
          };
        }

        function getBreakpointDefinitions() {
          var cssData = getCSSdata(angular.element('title')[0]);
          if (!cssData || cssData[0] !== '{') {
            console.error('Couldn\'t read breakpoint information from CSS property');
            return false;
          }
          var breakpoints = JSON.parse(cssData.replace(/_/g,'"'));
          for (var bp in breakpoints) {
            breakpoints[bp] = parseInt(breakpoints[bp], 10);
          }
          return breakpoints;
        }

      }
    }
  }

})();
