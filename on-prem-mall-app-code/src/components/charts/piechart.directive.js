(function() {
  'use strict';

  angular.module('shopperTrak.charts')
    .directive('piechart', piechartDirective);

  piechartDirective.$inject = ['Chartist', 'chartUtils'];

  function piechartDirective(Chartist, chartUtils) {
    return {
      templateUrl: 'components/charts/piechart.partial.html',
      replace: true,
      transclude: true,
      scope: {
        data: '=data',
        options: '=options'
      },
      link: linkPiechartDirective
    };

    function linkPiechartDirective(scope, element) {
      var chartistInstance = null;

      scope.$watchGroup(['data', 'options'], updateChart);
      element.on('$destroy', handleScopeDestroyed);

      function updateChart() {
        if (chartistInstance !== null) {
          chartistInstance.detach();
        }
        chartistInstance = createChart();
      }

      function createChart() {
        var instance = new Chartist.Pie(element.find('.ct-chart').get(0), scope.data, scope.options).on('draw', handleChartItemDraw);
        return instance;
      }

      function handleChartItemDraw(data) {
        if (data.type === 'label') {
          handleChartLabelDraw(data);
        }
      }

      // Align the newly created chart label vertically with the first label
      // that it intersects with. Then, move it upwards until it no longer
      // intersects with any other label.
      function handleChartLabelDraw(data) {
        var labels = chartistInstance.container.querySelectorAll('.ct-label');

        // Find the first intersecting label
        var firstIntersectingLabel;
        for (var i=0; i<labels.length; i++) {
          if (data.element._node !== labels.item(i) && chartUtils.elementsIntersect(labels.item(i), data.element._node)) {
            firstIntersectingLabel = new Chartist.Svg(labels.item(i));
            break;
          }
        }

        // Do nothing, if there are no intersecting labels
        if (!firstIntersectingLabel) {
          return;
        }

        // Decide nudge direction
        var labelNudgeStep;
        var $svgContainer = $('svg', chartistInstance.container);
        if (firstIntersectingLabel._node.getBBox().y > $svgContainer.height() / 2) {
          labelNudgeStep = data.element.height() + 2;
        } else {
          labelNudgeStep = -data.element.height() - 2;
        }

        // Move the element just above or below the first intersecting label
        data.element.attr({
          'dx': firstIntersectingLabel.attr('dx'),
          'dy': parseInt(firstIntersectingLabel.attr('dy')) + labelNudgeStep
        });

        // Loop through all other labels and move the label
        // up until it no longer overlaps with any.
        var intersecting;
        do {
          intersecting = false;
          for (i=0; i<labels.length; i++) {
            if (data.element._node !== labels.item(i) && chartUtils.elementsIntersect(labels.item(i), data.element._node)) {
              intersecting = true;
              data.element.attr({
                'dy': parseInt(data.element.attr('dy')) + labelNudgeStep
              });
            }
          }
        } while (intersecting);
      }

      function handleScopeDestroyed() {
        if (chartistInstance !== null) {
          chartistInstance.detach();
        }
      }
    }
  }
})();
