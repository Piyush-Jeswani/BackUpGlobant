(function() {
  'use strict';

  angular.module('shopperTrak')
    .directive('comparisonWidgetChart', comparisonWidgetChartDirective);

  function comparisonWidgetChartDirective() {
    return {
      restrict: 'E',
      templateUrl: 'components/widgets/comparison-widgets/comparison-widget-chart.partial.html',
      scope: {
        'series':         '=',
        'seriesNames':    '=',
        'language':       '=',
        'dateFormatMask': '=',
        'numberFormatName': '=',
        'kpi':            '=',
        'formatValue':    '&'
      },
      controller: ComparisonWidgetChartController,
      controllerAs: 'vm',
      bindToController: true
    };
  }

  ComparisonWidgetChartController.$inject = [
    '$scope',
    '$element',
    '$filter',
    '$translate'
  ];

  function ComparisonWidgetChartController($scope, $element, $filter, $translate) {
    var vm = this;
    var labelSpacing = 60;

    vm.chartOptions = {
      lineSmooth: false,
      axisY: {
        offset: 60,
        labelInterpolationFnc: function(value) {
          return $filter('formatYAxis')(value, vm.kpi, vm.numberFormatName);
        }
      },
      axisX: {
        showGrid: false,
        labelInterpolationFnc: interpolateChartLabels
      }
    };

    vm.chartData = {
      labels: [],
      series: []
    };

    loadTranslations();
    activate();

    function activate() {
      $scope.$watch('vm.series', function() {
        var timestamps = getTimestamps(vm.series);
        var seriesHashes = convertToHashes(vm.series);

        var chartData = {
          series: [],
          labels: []
        };

        chartData.series = buildChartSeries(seriesHashes, timestamps);
        chartData.labels = getChartLabels(timestamps);

        vm.chartData = chartData;
      }, true);
    }

    function getTimestamps(allSeries) {
      var timestamps = [];
      allSeries.forEach(function(series) {
        series.forEach(function(item) {
          var timestamp = item.date.valueOf();
          if (timestamps.indexOf(timestamp) === -1) {
            timestamps.push(timestamp);
          }
        });
      });
      timestamps.sort(function(a, b) {
        return a - b;
      });
      return timestamps;
    }

    function convertToHashes(series) {
      return series.map(convertToHash);
    }

    function convertToHash(series) {
      return series.reduce(function(hash, item) {
        hash[item.date.valueOf()] = item.value;
        return hash;
      }, {});
    }

    function buildChartSeries(seriesHashes, timestamps) {
      var chartSeries = seriesHashes.map(function(seriesHash) {
        return timestamps.map(function(timestamp) {
          return seriesHash[timestamp];
        });
      });
      return chartSeries;
    }

    function getChartLabels(timestamps) {
      return timestamps.map(function(timestamp) {
        return moment(timestamp).format(vm.dateFormatMask);
      });
    }

    function interpolateChartLabels(value, index) {
      var maxLabels = Math.floor($('.ct-chart', $element).width() / labelSpacing);
      var labelInterval = Math.ceil(vm.chartData.labels.length / maxLabels);
      return index % labelInterval === 0 ? value : null;
    }

    function loadTranslations() {
      $translate.use(vm.language);
    }
  }
})();
