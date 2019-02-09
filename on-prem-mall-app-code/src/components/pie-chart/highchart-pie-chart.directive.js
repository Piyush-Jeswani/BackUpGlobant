(function () {
  'use strict';

  angular
    .module('shopperTrak.widgets')
    .directive('donutPieChart', donutPieChart);

  function donutPieChart($timeout, $window, $filter) {
    return {
      templateUrl: 'components/pie-chart/highchart-pie-chart.html',
      scope: {
        chartData: '=',
        chartLegend: '=',
        showLegend: '=?',
        showLabels: '=?',
        colors: '=?'
      },

      link: function ($scope) {
        $timeout(function () {
          var _colors = $scope.colors ||
            [ '#9bc614', '#0aaaff', '#be64f0', '#ff5028', '#feac00', '#00abae', '#929090',
              '#328214', '#003291', '#690ff6', '#960000', '#af6400', '#005669', '#303030',
              '#50af14', '#0665b5', '#9b37f0', '#d23200', '#dc8200', '#007a8d', '#565454',
              '#b4eb14', '#50d2ff', '#d296f5', '#ff8259', '#ffdc00', '#00dbba', '#c6c3c3'
            ];

          var _series = buildPieChart($scope.chartData);

          //default to true if not specified
          var _showLabels = angular.isUndefined($scope.showLabels) ? true : $scope.showLabels;
          $scope.showLegend = angular.isUndefined($scope.showLegend) ? true : $scope.showLegend;

          $scope.chartConfig = {
            options: {
              chart: {
                type: 'pie',
                height: 350,
                style: {
                  fontFamily: '\"Source Sans Pro\", sans-serif'
                },
                events: {
                  load: function() {
                    $window.dispatchEvent(new Event('resize'));
                  }
                }
              },
              plotOptions: {
                pie: {
                  showInLegend:false,
                  animation: false, // if you are changing this to true, make sure animations remain turned off for the PDF version
                  dataLabels: {
                    enabled: _showLabels,
                    connectorWidth: 0,
                    formatter: function() {
                      return this.y > 0 ? this.point.name : null;
                    },
                    distance: 1
                  },

                  innerSize: '65%',
                  colors: _colors
                }
              },
              tooltip: {
                formatter: function() {
                  return this.point.label + ': <b>' + this.point.percentage.toFixed(1) + '%</b>';
                }
              }
            },
            title: {
              text: ''
            },

            series: _series
          };
        });

        function buildPieChart(_chartData) {
          var seriesData = {data: []};

          _.each(_chartData.series, function(_point, i) {

            var _label = _chartData.labels[i].indexOf('Others') > -1 ? 'Others' : $scope.chartLegend[i];
            var label =  _label !== undefined ? $filter('translate')(_label) : '';

            var dataPoint = {name: _chartData.labels[i], y:_point, label:label};
            seriesData.data.push(dataPoint);
          });

          return [seriesData];
        }

      }

    };
  }

})();
