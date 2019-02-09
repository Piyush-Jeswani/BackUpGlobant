(function () {
  'use strict';

  angular
  .module('shopperTrak')
  .constant('customDashboardConstants', {
    MAX_NAME_LENGTH: 80,
    MAX_WIDGETS_PER_DASHBOARD: 10,
    MAX_DASHBOARDS: 5,
    WIDGET_RESIZE_TRANSITION_DURATION: 240,
    chartOverride: {
      types: {
        'line': {
          icon: 'conversion'
        },
        'column': {
          icon: 'metrics-small'
        }
      }
    },
    dateRangeTypes: {
      day: {
        transKey: 'common.DAY',
        rangeType: 'day'
      },
      week: {
        transKey: 'common.WEEK',
        rangeType: 'week'
      },
      month: {
        transKey: 'common.MONTH',
        rangeType: 'month'
      },
      year: {
        transKey: 'common.YEAR',
        rangeType: 'year'
      },
      wtd: {
        transKey: 'dateRangePicker.WEEKTODATE',
        rangeType: 'wtd'
      },
      mtd: {
        transKey: 'dateRangePicker.MONTHTODATE',
        rangeType: 'mtd'
      },
      qtd: {
        transKey: 'dateRangePicker.QUARTERTODATE',
        rangeType: 'qtd'
      },
      ytd: {
        transKey: 'dateRangePicker.YEARTODATE',
        rangeType: 'ytd'
      }
    },
    grid: {
      widthCssClasses: [
        'grid-12-5pc',
        'grid-25pc',
        'grid-50pc',
        'grid-100pc',
      ],
      layoutTypes: {
        '1x': {
          cssClass: 'widget-layout-1x',
          title: '1x size',
          text: '1x',
          responsiveWidths: {
            'media-xs': '100',
            'media-sm': '50',
            'media-md': '50',
            'media-lg': '25',
            'media-xlg': '25'
          }
        },
        '2x': {
          cssClass: 'widget-layout-2x',
          title: '2x size',
          text: '2x',
          responsiveWidths: {
            'media-xs': '100',
            'media-sm': '100',
            'media-md': '50',
            'media-lg': '50',
            'media-xlg': '50'
          }
        },
        '4x': {
          cssClass: 'widget-layout-4x',
          title: '4x size',
          text: '4x',
          responsiveWidths: {
            'media-xs': '100',
            'media-sm': '100',
            'media-md': '100',
            'media-lg': '100',
            'media-xlg': '100'
          }
        }
      },
      widgetLayouts: {
        // Site performance:
        'kpi_summary_widget_container': {'4x':true, '2x':true, '1x': false},

        // Daily averages:
        'traffic_per_weekday': {'4x':true, '2x':true, '1x': false},

        // Line chart widgets:
        'ats_sales_widget': {'4x':true, '2x':true, '1x': true},
        'conversion_widget': {'4x':true, '2x':true, '1x': true},
        'detail_abandonment_rate': {'4x':true, '2x':true, '1x': true},
        'detail_draw_rate': {'4x':true, '2x':true, '1x': true},
        'detail_dwell_time': {'4x':true, '2x':true, '1x': true},
        'detail_opportunity': {'4x':true, '2x':true, '1x': true},
        'gross_shopping_hours': {'4x':true, '2x':true, '1x': true},
        'labor_hours_widget': {'4x':true, '2x':true, '1x': true},
        'sales_widget': {'4x':true, '2x':true, '1x': true},
        'star_labor_widget': {'4x':true, '2x':true, '1x': true},
        'upt_sales_widget': {'4x':true, '2x':true, '1x': true},
        'visitor_behaviour_traffic': {'4x':true, '2x':true, '1x': true},

        // Line High Chart widgets:
        'traffic': {'4x':true, '2x':true, '1x': true},

        // Shoppers vs others:
        'average_percent_shoppers': {'4x':true, '2x':true, '1x': true},

        // Daily performance Indicators:
        'daily_performance_widget': {'4x':true, '2x':true, '1x': false},

        // Heatmap widgets:
        'traffic_percentage_location': {'4x':true, '2x':true, '1x': false},
        'traffic_percentage_correlation': {'4x':true, '2x':true, '1x': false},
        'first_visits': {'4x':true, '2x':true, '1x': false},
        'one_and_done': {'4x':true, '2x':true, '1x': false},
        'locations_after': {'4x':true, '2x':true, '1x': false},
        'locations_before': {'4x':true, '2x':true, '1x': false},

        // Org compare:
        'org-custom-compare': {'4x':true, '2x':true, '1x': false},

        // Tenant tables:
        'tenant_ats_table_widget': {'4x':true, '2x':true, '1x': false},
        'tenant_conversion_table_widget': {'4x':true, '2x':true, '1x': false},
        'tenant_labor_hours_table_widget': {'4x':true, '2x':true, '1x': false},
        'tenant_sales_table_widget': {'4x':true, '2x':true, '1x': false},
        'tenant_star_labor_table_widget': {'4x':true, '2x':true, '1x': false},
        'tenant_traffic_table_widget': {'4x':true, '2x':true, '1x': false},
        'tenant_upt_table_widget': {'4x':true, '2x':true, '1x': false},

        // Visitor Frequency:
        'loyalty': {'4x':true, '2x':true, '1x': true},

        // Other areas:
        'other_areas_traffic_table_widget': {'4x':true, '2x':true, '1x': false},

        // Entrance contribution:
        'entrance_contribution_pie': {'4x':true, '2x':true, '1x': true},

        // ---- Hidden UI because only 4x view available: ----------------------

        // Organisation summary table:
        // 'retail_organization_table': {'4x':true, '2x':false, '1x': false},

        // Entrance Summary:
        // 'entrance_contribution': {'4x':true, '2x':false, '1x': false},

        // Entrance Contribution:
        // 'entrance_contribution_pie': {'4x':true, '2x':false, '1x': false},

        // Power hours:
        // 'power_hours': {'4x':true, '2x':false, '1x': false},

        // Tenant Summary:
        // 'tenant_traffic_table_widget': {'4x':true, '2x':false, '1x': false},

        // Common areas summary:
        // 'other_areas_traffic_table_widget': {'4x':true, '2x':false, '1x': false},

        // Retail store summary:
        // 'retail_store_summary': {'4x':true, '2x':false, '1x': false},

        // Organisation Summary
        // 'organization_summary': {'4x':true, '2x':false, '1x': false},

        // Sites performance:
        // 'site_performance': {'4x':true, '2x':true, '1x': false},
      }
    }
  });

})();
