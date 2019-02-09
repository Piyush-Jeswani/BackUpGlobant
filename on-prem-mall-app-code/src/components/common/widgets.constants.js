(function() {
  'use strict';

  angular.module('shopperTrak.constants')
    .constant('widgetConstants', {
      exportProperties: {
        // Traffic view
        'kpi_summary_widget_container': ['operatingHours', 'salesCategories'],
        'traffic': ['groupBy','operatingHours', 'selectedOption', 'weather', 'entranceId', 'salesCategories'],
        'entrance_contribution': ['operatingHours', 'sortType', 'zoneFilterQuery'],
        'entrance_contribution_pie': ['operatingHours'],
        'tenant_traffic_table_widget': ['operatingHours', 'zoneFilterQuery', 'sortType', 'comparisonColumnIndex', 'childProperty'],
        'other_areas_traffic_table_widget': ['operatingHours', 'zoneFilterQuery', 'sortType', 'comparisonColumnIndex', 'childProperty'],
        'power_hours': ['operatingHours', 'displayType', 'salesCategories','pdfOrientation'],
        'traffic_per_weekday': ['operatingHours', 'showTable', 'selectedDays', 'selectedMetric', 'orderTable', 'orderReverse', 'entranceId', 'salesCategories'],
        'daily_performance_widget': ['operatingHours', 'showTable', 'selectedDays','orderTable', 'salesCategories'],

        // Labor
        'labor_hours_widget': ['operatingHours', 'groupBy'],
        'star_labor_widget': ['operatingHours', 'groupBy'],
        'tenant_labor_hours_table_widget': ['operatingHours', 'zoneFilterQuery', 'sortType'],
        'tenant_star_labor_table_widget': ['operatingHours', 'zoneFilterQuery', 'sortType'],

        // Sales and conversion
        'sales_widget': ['operatingHours', 'groupBy'],
        'conversion_widget': ['operatingHours', 'groupBy'],
        'ats_sales_widget': ['operatingHours', 'groupBy'],
        'upt_sales_widget': ['operatingHours', 'groupBy'],
        'tenant_sales_table_widget': ['operatingHours', 'zoneFilterQuery', 'orderBy'],
        'tenant_conversion_table_widget': ['operatingHours', 'zoneFilterQuery', 'orderBy'],
        'tenant_ats_table_widget': ['operatingHours', 'zoneFilterQuery', 'orderBy'],
        'tenant_upt_table_widget': ['operatingHours', 'zoneFilterQuery', 'orderBy'],

        // Visitor behavior
        'visitor_behaviour_traffic': ['operatingHours', 'groupBy'],
        'loyalty': ['operatingHours', 'groupBy'],
        'gross_shopping_hours': ['operatingHours', 'groupBy'],
        'detail_dwell_time': ['operatingHours', 'groupBy'],
        'detail_opportunity': ['operatingHours', 'groupBy'],
        'detail_draw_rate': ['operatingHours', 'groupBy'],
        'detail_abandonment_rate': ['operatingHours', 'groupBy'],
        'average_percent_shoppers': ['groupBy'],

        // Mall organization summary
        'organization_summary': ['operatingHours', 'filterText', 'compareType'],
        'site_performance': ['operatingHours', 'currentView'],
        'kpi_summary_widget': [],

        // Retail organization summary
        'retail_store_summary': ['siteFilter','selectedCategory','extremeValues','activeKpi','salesCategories','categories','siteCategories','filterText'],
        'retail_organization_table': ['selectedMetrics', 'comparisonIndex', 'salesCategories', 'selectedCategory', 'filterText'],

        // Market Intelligence
        'segment': ['segments'],
        'market-intelligence': false
      }
    });
})();


