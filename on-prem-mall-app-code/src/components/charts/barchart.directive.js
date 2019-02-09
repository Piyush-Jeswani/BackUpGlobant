(function() {
  'use strict';

  angular.module('shopperTrak.charts')
    .directive('barchart', barchart);

  barchart.$inject = ['$q', 'Chartist', 'chartUtils', '$rootScope'];

  function barchart($q, Chartist, chartUtils, $rootScope) {
    return {
      templateUrl: 'components/charts/chart.partial.html',
      replace: true,
      transclude: true,
      scope: {
        chartType: '=?',
        data: '=data',
        options: '=options',
        stackHorizontalLabels: '=?stackHorizontalLabels'
      },
      controller: BarchartController,
      link: linkBarchartDirective
    };

    function linkBarchartDirective(scope, element) {

      scope.chartType = scope.chartType || 'column';
      var chartistInstance = null;

      scope.$watchGroup([
        'data',
        'options',
        'chartType'
      ], updateChart);
      element.on('$destroy', handleScopeDestroyed);

      function updateChart() {
        if (chartistInstance !== null) {
          chartistInstance.detach();
          chartistInstance = null;
        }
        createChart().then(function(instance) {
          chartistInstance = instance;
        });
      }

      function createChart() {
        var isColumnChart = scope.chartType === 'column';

        var deferred = $q.defer();

        var chartistOptions = isColumnChart ? scope.options : {
          lineSmooth: Chartist.Interpolation.none({
            fillHoles: false
          }),
          low:0,
          fullWidth: true,
          chartPadding: {
            top: 20,
            right: 50,
            bottom: 5,
            left: 50
          },
          axisX: {
            showGrid: false
          },
          axisY: {
            showGrid: true,
            labelOffset: {
              x: -30,
              y: 0
            }
          }
        };

        var instance = new Chartist[isColumnChart ? 'Bar' : 'Line'](element.find('.ct-chart').get(0), scope.data, chartistOptions);

        // Store series item indexes to elements for later use.
        instance.on('draw', function(context) {
          switch (context.type) {
            case 'bar':
            case 'point':
              context.element.attr({'data-series-index': context.index});
              break;
          }
        });

        instance.on('created', function() {
          $('.ct-bar').click(function (event) {
            var barValue = parseFloat(event.target.attributes[5].value);
            var label = getLabelForBar(barValue, scope.data.labels, scope.data.series);
            $rootScope.$broadcast('goToHourlyDrilldown', {label: label});
          });

          $('.ct-label').click(function (event) {
            var label = event.target.innerText;
            $rootScope.$broadcast('goToHourlyDrilldown', {label: label});
          });
          deferred.resolve(instance);
        });

        if(scope.stackHorizontalLabels === true) {
          instance.on('draw', function (ctx) {
            var secondLineOffset = 20;
            if (ctx.type === 'label' && typeof ctx.text === 'string' && ctx.index % 2 !== 0) {
              var y = (ctx.y + secondLineOffset);
              ctx.element.attr({ y: y});
            }
          });
        }


        return deferred.promise;
      }

      function getLabelForBar(barValue, labels, series) {

        var theLabel;

        _.forEach(series, function (values) {

          _.forEach(values, function (value, i) {
            if (barValue === value) {
              theLabel = labels[i];
              return false;
            }
          });

          if (theLabel) return false;
        });

        return theLabel;
      }

      scope.handleMouseMove = function(event) {
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
        }
      };

      scope.handleMouseEnter = function() {
        if (scope.tooltip) {
          scope.tooltip.tooltipIsVisible = true;
        }
      };

      scope.handleMouseLeave = function() {
        if (scope.tooltip) {
          scope.tooltip.tooltipIsVisible = false;
        }
        chartUtils.unhighlightAllChartSeriesItems(chartistInstance);
      };

      function handleScopeDestroyed() {
        if (chartistInstance) {
          chartistInstance.detach();
          chartistInstance = null;
        }
      }
    }
  }

  BarchartController.$inject = ['$scope'];

  function BarchartController($scope) {
    this.attachTooltip = function(tooltipScope) {
      $scope.tooltip = tooltipScope;
    };
  }
}());
