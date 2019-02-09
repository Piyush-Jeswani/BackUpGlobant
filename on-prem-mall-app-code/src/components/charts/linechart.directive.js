(function() {
  'use strict';

  angular.module('shopperTrak.charts')
    .directive('linechart', linechart);

  linechart.$inject = [
    '$q',
    'Chartist',
    'chartUtils',
    'utils'
  ];

  function linechart($q, Chartist, chartUtils, utils) {
    return {
      templateUrl: 'components/charts/chart.partial.html',
      replace: true,
      transclude: true,
      scope: {
        data: '=data',
        options: '=options',
        loadTooltip: '&loadTooltip',
        chartType: '=?'
      },
      controller: LinechartController,
      link: linkLinechartDirective
    };

    function linkLinechartDirective(scope, element) {
      scope.chartType = scope.chartType || 'line';
      var chartistInstance = null;

      scope.$watchGroup([
        'data',
        'options',
        'chartType'
      ], updateChart);
      element.on('$destroy', handleScopeDestroyed);

      function updateChart() {
        var hasValidData = dataIsValid(scope.data);

        if (hasValidData) {
            createChart().then(function(instance) {
              chartistInstance = instance;
              attachEventHandlers();
            });
        } else if (chartistInstance !== null) {
          chartistInstance.detach();
          detachEventHandlers();
          chartistInstance = null;
        }
      }

      function createChart() {
        var isLineChart = scope.chartType === 'line';

        var deferred = $q.defer();

        var chartistOptions = isLineChart ? scope.options : {
          chartPadding: 20,
          seriesBarDistance: 13,
          axisX: {
            showGrid: false,
          }
        };

        var instance = new Chartist[isLineChart ? 'Line' : 'Bar'](element.find('.ct-chart').get(0), scope.data, chartistOptions);

        // Store series item indexes to elements for later use.
        instance.on('draw', function(context) {
          switch (context.type) {
            case 'point':
            case 'bar':
              context.element.attr({'data-series-index': context.index});
              break;
          }
        });

        instance.on('created', function() {
          deferred.resolve(instance);
        });

        return deferred.promise;
      }

      function attachEventHandlers() {
        scope.handleMouseMove = handleMouseMove;
        scope.handleMouseEnter = handleMouseEnter;
        scope.handleMouseLeave = handleMouseLeave;
      }

      function detachEventHandlers() {
        scope.handleMouseMove = handleMouseMove;
        scope.handleMouseEnter = handleMouseEnter;
        scope.handleMouseLeave = handleMouseLeave;
      }

      function handleMouseMove(event) {
        // Do nothing if chartist has not yet initialized
        if (!chartistInstance) {
          return;
        }

        var $chart = $(element[0]);
        var $tooltipElement = $('.chart-tooltip', $chart);
        var relativeMouseCoordinates = chartUtils.getElementSpaceCoordinatesFromScreenSpaceCoordinates({
          x: event.clientX,
          y: event.clientY
        }, element);

        chartUtils.highlightClosestChartSeriesItems(relativeMouseCoordinates, chartistInstance);

        if (scope.tooltip) {
          var coordinates = chartUtils.getTooltipCoordinates(relativeMouseCoordinates, chartistInstance, $tooltipElement);
          scope.tooltip.tooltipX = coordinates.x;
          scope.tooltip.tooltipY = coordinates.y;
          scope.tooltip.seriesItemIndex = chartUtils.getClosestSeriesItemIndex(relativeMouseCoordinates.x, chartistInstance);
          scope.loadTooltip({seriesItemIndex: scope.tooltip.seriesItemIndex});
        }
      }

      function handleMouseEnter() {
        if (scope.tooltip) {
          scope.tooltip.tooltipIsVisible = true;
          scope.loadTooltip({seriesItemIndex: scope.tooltip.seriesItemIndex});
        }
      }

      function handleMouseLeave() {
        if (scope.tooltip) {
          scope.tooltip.tooltipIsVisible = false;
        }
        chartUtils.unhighlightAllChartSeriesItems(chartistInstance);
      }

      function dataIsValid(chartData) {
        // Chartist often hangs if supplied invalid data, so do some checking.
        return chartData &&
               chartData.labels &&
               chartData.labels.length > 0 &&
               chartData.series.some(utils.hasExistyElements);
      }

      function handleScopeDestroyed() {
        if (chartistInstance) {
          chartistInstance.detach();
          chartistInstance = null;
        }
      }
    }
  }

  LinechartController.$inject = ['$scope'];

  function LinechartController($scope) {
    this.attachTooltip = function(tooltipScope) {
      $scope.tooltip = tooltipScope;
    };
  }
})();
