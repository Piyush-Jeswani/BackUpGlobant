(function() {
  'use strict';

  angular
    .module('shopperTrak.widgets')
    .constant('retailStoreSummaryWidgetConstants', {
      defaults: {
        options: {
          credits: {
            enabled: false
          },
          exporting: {
            enabled: false
          },
          colors: ['#0aaaff'],
          yAxis: {
            gridLineWidth: 1,
            lineWidth: 0,
            minorGridLineWidth: 0,
            gridLineColor: '#bbbbbb',
            reversed: false,
            minRange: 1,
            tickWidth: 0,
            tickAmount: 3,
            tickPositions: [0,0,0],
            tickColor: '#bbbbbb',
            plotLines: [{
              color: '#bbbbbb',
              dashStyle: 'ShortDot',
              width: 0,
              value: 0,
              zIndex: 2
            }],
            labels: {
              enabled: false
            }
          },
          xAxis: {
            gridLineWidth: 1,
            lineWidth: 0,
            minorGridLineWidth: 0,
            gridLineColor: '#bbbbbb',
            reversed: false,
            minRange: 1,
            tickWidth: 0,
            tickAmount: 3,
            tickPositions: [0,0,0],
            tickColor: '#bbbbbb',
            plotLines: [{
              color: '#bbbbbb',
              dashStyle: 'ShortDot',
              width: 0,
              value: 0,
              zIndex: 2
            }],
            labels: {
              enabled: false
            }
          },
          legend: {
            enabled: false
          }
        },
        title: {
           text: ''
        },
        xAxis: {
          title: {
              enabled: true,
              text: 'Average daily traffic',
              style: {
                fontWeight: 'bold',
                textTransform: 'uppercase',
                fontFamily: 'Source Sans Pro'
              }
          },
          startOnTick: true,
          endOnTick: true,
          showLastLabel: true,
        },
        yAxis: {
          title: {
              text: 'Conversion',
              style: {
                fontWeight: 'bold',
                textTransform: 'uppercase',
                fontFamily: 'Source Sans Pro'
              }
          },
          startOnTick: true,
          endOnTick: true,
          showLastLabel: true,
        },
        plotOptions: {
          scatter: {
            marker: {
              symbol: 'circle'
            }
          }
        }
      }
    });
})();
