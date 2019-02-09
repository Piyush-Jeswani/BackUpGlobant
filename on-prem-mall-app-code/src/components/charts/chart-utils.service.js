(function() {
  'use strict';

  angular.module('shopperTrak.charts')
    .factory('chartUtils', chartUtils);

  chartUtils.$inject = ['Chartist', 'ObjectUtils'];

  function chartUtils(Chartist, ObjectUtils) {
    return {
      getElementSpaceCoordinatesFromScreenSpaceCoordinates: getElementSpaceCoordinatesFromScreenSpaceCoordinates,
      getSeriesItemClassName: getSeriesItemClassName,
      removeClassFromAllSvgCollectionElements: removeClassFromAllSvgCollectionElements,
      highlightClosestChartSeriesItems: highlightClosestChartSeriesItems,
      unhighlightAllChartSeriesItems: unhighlightAllChartSeriesItems,
      getClosestSeriesItemIndex: getClosestSeriesItemIndex,
      getTooltipCoordinates: getTooltipCoordinates,
      elementsIntersect: elementsIntersect
    };

    function getElementSpaceCoordinatesFromScreenSpaceCoordinates(screenSpaceCoordinates, element) {
      try {
        var elementPosition = $(element).offset();
        return {
          x: screenSpaceCoordinates.x - elementPosition.left + document.body.scrollLeft + document.documentElement.scrollLeft,
          y: screenSpaceCoordinates.y - elementPosition.top + document.body.scrollTop + document.documentElement.scrollTop
        };
      }
      catch(err) {
        console.error(err); // Log the error, but continue
      }
    }

    function getClosestSvgElementOnXAxis(containerSpaceX, selectors, containerElement) {
      var elements = containerElement.querySelectorAll(selectors);
      if(elements.length > 0) {
        var closestElement = elements.item(0);
        var firstElementBoundingBox = closestElement.getBBox();

        if(ObjectUtils.isNullOrUndefined(firstElementBoundingBox)) {
          return;
        }

        var smallestAbsoluteDeltaX = Math.abs(firstElementBoundingBox.x + firstElementBoundingBox.width / 2 - containerSpaceX);
        for (var i = 1; i < elements.length; i++) {
          var element = elements.item(i);
          var elementBoundingBox = element.getBBox();
          var absoluteDeltaX = Math.abs(elementBoundingBox.x - containerSpaceX);
          if (absoluteDeltaX < smallestAbsoluteDeltaX) {
            smallestAbsoluteDeltaX = absoluteDeltaX;
            closestElement = element;
            }
          }
        return closestElement;
      }
    }

    function getSeriesItemClassName(chartistInstance) {
      if (chartistInstance instanceof Chartist.Bar) {
        return 'ct-bar';
      } else if (chartistInstance instanceof Chartist.Line) {
        return 'ct-point';
      }
    }

    function removeClassFromAllSvgCollectionElements(className, svgElementCollection) {
      if(ObjectUtils.isNullOrUndefinedOrEmpty(svgElementCollection)) {
        return;
      }

      if(ObjectUtils.isNullOrUndefinedOrBlank(className)) {
        return;
      }

      for (var i = 0; i < svgElementCollection.length; i++) {
        var element = svgElementCollection.item(i);
        var svgInstance = new Chartist.Svg(element);
        svgInstance.removeClass(className);
      }
    }

    function highlightClosestChartSeriesItems(relativeMouseCoordinates, chartistInstance) {
      if(ObjectUtils.isNullOrUndefined(relativeMouseCoordinates)) {
        return;
      }

      if(ObjectUtils.isNullOrUndefined(chartistInstance)) {
        return;
      }

      unhighlightAllChartSeriesItems(chartistInstance);
      
      var seriesIndex = getClosestSeriesItemIndex(relativeMouseCoordinates.x, chartistInstance);

      if(ObjectUtils.isNullOrUndefined(seriesIndex)) {
        return;
      }

      var seriesItemContainers = chartistInstance.container.querySelectorAll('.ct-series');
      var seriesItemSelector = '.' + getSeriesItemClassName(chartistInstance);

      for (var i = 0; i < seriesItemContainers.length; i++) {
        var seriesItemContainer = seriesItemContainers.item(i);
        var seriesItems = seriesItemContainer.querySelectorAll(seriesItemSelector);

        for (var j = 0; j < seriesItems.length; j++) {
          var seriesItem = seriesItems.item(j);
          if (seriesItem.getAttribute('data-series-index') === seriesIndex) {
            new Chartist.Svg(seriesItems.item(j)).addClass('is-hovered');
          }
        }
      }
    }

    function unhighlightAllChartSeriesItems(chartistInstance) {
      if(ObjectUtils.isNullOrUndefined(chartistInstance)) {
        return;
      }

      var seriesItemSelector = '.' + getSeriesItemClassName(chartistInstance);
      var items = chartistInstance.container.querySelectorAll(seriesItemSelector);
      removeClassFromAllSvgCollectionElements('is-hovered', items);
    }

    // 'x' is the x coordinate in chart space
    function getClosestSeriesItemIndex(x, chartistInstance) {
      if(ObjectUtils.isNullOrUndefined(chartistInstance)) {
        return;
      }
      var seriesItemSelector = '.' + getSeriesItemClassName(chartistInstance);
      var closestSeriesItem = getClosestSvgElementOnXAxis(
        x, seriesItemSelector, chartistInstance.container
      );

      if(!ObjectUtils.isNullOrUndefined(closestSeriesItem)) {
        return closestSeriesItem.getAttribute('data-series-index');
      }
    }

    function getTooltipCoordinates(relativeMouseCoordinates, chartistInstance, $tooltipElement) {
      var seriesItemSelector = '.' + getSeriesItemClassName(chartistInstance);
      
      var coordinates = {};

      var $chart = $(chartistInstance.container);
      var seriesItemContainers = chartistInstance.container.querySelectorAll('.ct-series');
      if (seriesItemContainers.length === 0) {
        throw 'No rendered chart series present';
      }
      var seriesItemContainer = findFirstChartSeriesWithData(seriesItemContainers, seriesItemSelector);
      var closestFirstSeriesItem = getClosestSvgElementOnXAxis(relativeMouseCoordinates.x, seriesItemSelector, seriesItemContainer);

      if(ObjectUtils.isNullOrUndefined(closestFirstSeriesItem)) {
        return;
      }

      var closestFirstSeriesItemBoundingBox = closestFirstSeriesItem.getBBox();

      coordinates.x = Math.min(
        closestFirstSeriesItemBoundingBox.x + closestFirstSeriesItemBoundingBox.width / 2 - $tooltipElement.outerWidth() / 2,
        $chart.outerWidth() - $tooltipElement.outerWidth()
      );
      coordinates.y = Math.min(relativeMouseCoordinates.y, $chart.outerHeight() - $tooltipElement.outerHeight());
      return coordinates;
    }

    function elementsIntersect(element1, element2) {
      if(ObjectUtils.isNullOrUndefined(element1)) {
        return;
      }

      if(ObjectUtils.isNullOrUndefined(element2)) {
        return;
      }

      var r1 = element1.getBoundingClientRect();
      var r2 = element2.getBoundingClientRect();
      return !(r2.left > r1.right ||
            r2.right < r1.left ||
            r2.top > r1.bottom ||
            r2.bottom < r1.top);
    }

    function findFirstChartSeriesWithData(seriesItemContainers, seriesItemSelector) {
      /* Tooltips fail if series container doesn't have data. This function checks that data really exists.
       * This is not optimal solution, but it works for now. We should come up with better solution. */
      if(ObjectUtils.isNullOrUndefined(seriesItemContainers)) {
        return null;
      }

      if(ObjectUtils.isNullOrUndefined(seriesItemSelector)) {
        return null;
      }

      var i = 0;
      while( seriesItemContainers.item(i).querySelectorAll(seriesItemSelector).length === 0 && i < 20) {
        i++;
      }
      if( seriesItemContainers.item(i).querySelectorAll(seriesItemSelector).length > 0) {
        return seriesItemContainers.item(i);
      } else {
        return null;
      }
    }
  }
})();
