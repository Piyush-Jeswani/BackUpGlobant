(function() {
  'use strict';

  angular.module('shopperTrak.widgets')
    .constant('retailOrganizationSummaryMetrics', {
      'metrics': [
        {
          value: 'traffic',
          label: 'Traffic',
          precision: 0,
          subscription: 'any',
          translationLabel: 'kpis.shortKpiTitles.tenant_traffic'
        },
        {
          value: 'dwelltime',
          label: 'Dwell time',
          precision: 2,
          subscription: 'interior',
          translationLabel: 'kpis.shortKpiTitles.tenant_dwell_time'
        },
        {
          value: 'sales',
          label: 'Sales',
          precision: 0,
          subscription: 'sales',
          translationLabel: 'kpis.shortKpiTitles.tenant_sales'
        },
        {
          value: 'conversion',
          label: 'Conversion',
          precision: 2,
          subscription: 'sales',
          translationLabel: 'kpis.shortKpiTitles.tenant_conversion'
        },
        {
          value: 'ats',
          label: 'ATS',
          precision: 2,
          subscription: 'sales',
          translationLabel: 'kpis.shortKpiTitles.tenant_ats'
        },
        {
          value: 'star',
          label: 'STAR',
          precision: 0,
          subscription: 'labor',
          translationLabel: 'kpis.shortKpiTitles.tenant_star'
        },
        {
          value: 'upt',
          label: 'UPT',
          precision: 1,
          subscription: 'sales',
          translationLabel: 'kpis.shortKpiTitles.tenant_upt'
        },
        {
          value: 'sps',
          label: 'SPS',
          precision: 2,
          subscription: 'sales',
          translationLabel: 'kpis.shortKpiTitles.tenant_sps'
        },
        {
          value: 'splh',
          label: 'SPLH',
          precision: 2,
          subscription: 'labor',
          translationLabel: 'kpis.shortKpiTitles.tenant_splh'
        },
        {
          value: 'aur',
          label: 'AUR',
          precision: 2,
          subscription: 'sales',
          translationLabel: 'kpis.shortKpiTitles.tenant_aur'
        }
      ]});

})();
