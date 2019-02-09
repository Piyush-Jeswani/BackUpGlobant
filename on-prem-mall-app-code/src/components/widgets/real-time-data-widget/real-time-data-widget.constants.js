(function() {
  'use strict';

  angular
    .module('shopperTrak.widgets')
    .constant('realTimeDataWidgetConstants', {
      kpis : [
         {
          id: 'traffic',
          title: 'kpis.shortKpiTitles.tenant_traffic',
          apiReturnkey: 'total_traffic',
          totalsLabel: 'kpis.totalLabel.total_traffic'
        },
        {
          id: 'sales',
          title: 'kpis.shortKpiTitles.tenant_sales',
          apiReturnkey: 'sales_amount',
          totalsLabel: 'kpis.totalLabel.total_sales'
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
