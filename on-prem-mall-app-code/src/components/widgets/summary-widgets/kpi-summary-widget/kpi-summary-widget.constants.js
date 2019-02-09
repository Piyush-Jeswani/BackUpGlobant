(function() {
  'use strict';

  angular
    .module('shopperTrak.widgets')
    .constant('kpiSummaryWidgetConstants', {
      kpis : [
        { 
          id: 'sales',
          title: 'kpis.shortKpiTitles.tenant_sales', 
          apiReturnkey: 'sales', 
          totalsLabel: 'kpis.totalLabel.sales'
        },
        { 
          id: 'traffic',
          title: 'kpis.shortKpiTitles.tenant_traffic', 
          apiReturnkey: 'traffic', 
          totalsLabel: 'kpis.totalLabel.traffic'
        },
        { 
          id: 'conversion',
          title: 'kpis.shortKpiTitles.tenant_conversion', 
          apiReturnkey: 'conversion', 
          totalsLabel: 'kpis.totalLabel.conversion'   
        },
        { 
          id: 'ats',
          title: 'kpis.shortKpiTitles.tenant_ats', 
          apiReturnkey: 'ats', 
          totalsLabel: 'kpis.totalLabel.ats' 
        },
        { 
          id: 'star',
          title: 'kpis.shortKpiTitles.tenant_star', 
          apiReturnkey: 'star', 
          totalsLabel: 'kpis.totalLabel.star'}
      ]
    });
})();