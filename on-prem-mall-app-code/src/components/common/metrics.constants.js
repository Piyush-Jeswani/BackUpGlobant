(function() {
  'use strict';

  // PLEASE READ THIS BEFORE MODIFYING
  // prefixSymbol:  is set to the apprioriate currency symbol at runtime if isCurrency is set to true, when:
  //                  - The user changes organization
  //                  - The user changes site
  //                This is replaced with the organization or site's currency symbol
  // requiredSubscriptions: This is a string array of all permissions (subscriptions) needed to view a particular measure

  // IF YOU HAVE ANY QUESTIONS PLEASE ASK

  angular.module('shopperTrak.constants')
    .constant('metricConstants', {
      groups: [
        {
          name: 'perimeter',
          subscription: 'any',
          translation_label: 'csvExportView.PERIMETER'
        },
        {
          name: 'interior',
          subscription: 'interior',
          translation_label: 'csvExportView.VISITORBEHAVIOR'
        }
      ],
      metrics: [
        {
          kpi: 'peel_off',
          value: 'peel_off',
          label: 'peel_off',
          precision: 1,
          multiplier: 100,
          requiredSubscriptions: [
            'peel_off' // This prop isn't actually a subscription
          ],
          icon: 'entrance',
          group: 'any',
          apiReturnkey: 'peel_off',
          translationLabel: 'kpis.kpiTitle.peel_off',
          shortTranslationLabel: 'kpis.shortKpiTitles.peel_off',
          isCurrency: false,
          prefixSymbol: '',
          suffixSymbol: '%',
          order: 40
        },
        {
          kpi: 'traffic',
          value: 'traffic',
          label: 'Traffic',
          precision: 0,
          requiredSubscriptions: [
          ],
          realTimeRequiredPermissions: [

          ],
          realTimeSubscription: 'realtime_traffic',
          icon: 'entrance',
          group: 'any',
          apiReturnkey: 'total_traffic',
          translationLabel: 'kpis.kpiTitle.traffic',
          shortTranslationLabel: 'kpis.shortKpiTitles.tenant_traffic',
          isCurrency: false,
          prefixSymbol: '',
          suffixSymbol: '',
          order: 1
        },
        {
          kpi: 'traffic_pct',
          value: 'traffic (pct)',
          label: 'Traffic',
          precision: 1,
          requiredSubscriptions: [

          ],
          shortTranslationLabel: 'kpis.shortKpiTitles.tenant_traffic_pct',
          prefixSymbol: '',
          suffixSymbol: '%',
          isCurrency: false,
          order: 2
        },
        {
          kpi: 'average_traffic',
          value: 'average_traffic',
          label: 'Average Traffic',
          precision: 0,
          requiredSubscriptions: [

          ],
          shortTranslationLabel: 'kpis.options.average_traffic',
          prefixSymbol: '',
          suffixSymbol: '',
          isCurrency: false,
          order: 2
        },
        {
          kpi: 'traffic_per_site',
          value: 'traffic_per_site',
          label: 'Average Traffic per site',
          precision: 0,
          requiredSubscriptions: [

          ],
          shortTranslationLabel: 'kpis.options.traffic_per_site',
          prefixSymbol: '',
          suffixSymbol: '',
          isCurrency: false,
          order: 2
        },
        {
          kpi: 'dwelltime',
          value: 'dwelltime',
          label: 'Dwell time',
          precision: 2,
          requiredSubscriptions: [
            'interior'
          ],
          icon: 'time',
          group: 'interior',
          apiReturnkey: 'dwelltime',
          translationLabel: 'kpis.kpiTitle.dwell_time',
          shortTranslationLabel: 'kpis.shortKpiTitles.tenant_dwell_time',
          isCurrency: false,
          prefixSymbol: '',
          suffixSymbol: '',
          order: 21
        },
        {
          kpi: 'star',
          value: 'star',
          label: 'STAR',
          precision: 0,
          requiredSubscriptions: [
            'sales',
            'labor'
          ],
          realTimeRequiredPermissions: [
            'realtime_sales',
            'realtime_labor'
          ],
          realTimeSubscription: 'realtime_labor',
          icon: 'star-labor-fat',
          group: 'perimeter',
          apiReturnkey: 'star',
          translationLabel: 'kpis.kpiTitle.star',
          shortTranslationLabel: 'kpis.shortKpiTitles.tenant_star',
          isCurrency: false,
          prefixSymbol: '',
          suffixSymbol: '',
          order: 11,
          calculated: true
        },
        {
          kpi: 'sales',
          value: 'sales',
          label: 'Sales',
          precision: 0,
          requiredSubscriptions: [
            'sales'
          ],
          realTimeRequiredPermissions: [
            'realtime_sales'
          ],
          realTimeSubscription: 'realtime_sales',
          icon: 'sales',
          group: 'perimeter',
          apiReturnkey: 'sales_amount',
          translationLabel: 'kpis.kpiTitle.sales',
          shortTranslationLabel: 'kpis.shortKpiTitles.tenant_sales',
          isCurrency: true,
          prefixSymbol: '',
          suffixSymbol: '',
          order: 3
        },
        {
          kpi: 'average_sales',
          value: 'average_sales',
          label: 'average_sales',
          precision: 0,
          requiredSubscriptions: [
            'sales'
          ],
          shortTranslationLabel: 'kpis.options.average_sales',
          isCurrency: true,
          prefixSymbol: '',
          suffixSymbol: '',
          order: 3
        },
        {
          kpi: 'sales_per_site',
          value: 'sales_per_site',
          label: 'sales_per_site',
          precision: 0,
          requiredSubscriptions: [
            'sales'
          ],
          shortTranslationLabel: 'kpis.options.sales_per_site',
          isCurrency: true,
          prefixSymbol: '',
          suffixSymbol: '',
          order: 3
        },
        {
          kpi: 'conversion',
          value: 'conversion',
          label: 'Conversion',
          precision: 2,
          requiredSubscriptions: [
            'sales'
          ],
          realTimeRequiredPermissions: [
            'realtime_sales'
          ],
          realTimeSubscription: 'realtime_sales',
          icon: 'conversion',
          group: 'perimeter',
          apiReturnkey: 'conversion',
          translationLabel: 'kpis.kpiTitle.conversion',
          shortTranslationLabel: 'kpis.shortKpiTitles.tenant_conversion',
          isCurrency: false,
          prefixSymbol: '',
          suffixSymbol: '%',
          order: 4,
          calculated: true
        },
        {
          kpi: 'ats',
          value: 'ats',
          label: 'ATS',
          precision: 2,
          requiredSubscriptions: [
            'sales'
          ],
          realTimeRequiredPermissions: [
            'realtime_sales'
          ],
          realTimeSubscription: 'realtime_sales',
          icon: 'ats',
          group: 'perimeter',
          apiReturnkey: 'ats',
          translationLabel: 'kpis.kpiTitle.ats',
          shortTranslationLabel: 'kpis.kpiTitle.ats',
          isCurrency: true,
          prefixSymbol: '',
          suffixSymbol: '',
          order: 7,
          calculated: true
        },
        {
          kpi: 'upt',
          value: 'upt',
          label: 'UPT',
          precision: 1,
          requiredSubscriptions: [
            'sales'
          ],
          realTimeRequiredPermissions: [
            'realtime_sales'
          ],
          realTimeSubscription: 'realtime_sales',
          icon: 'upt',
          group: 'perimeter',
          apiReturnkey: 'upt',
          translationLabel: 'kpis.kpiTitle.upt',
          shortTranslationLabel: 'kpis.shortKpiTitles.tenant_upt',
          isCurrency: false,
          prefixSymbol: '',
          suffixSymbol: '',
          order: 6
        },
        {
          kpi: 'sps',
          value: 'sps',
          label: 'SPS',
          precision: 2,
          icon: 'sps',
          group: 'perimeter',
          requiredSubscriptions: [
            'sales'
          ],
          realTimeRequiredPermissions: [
            'realtime_sales'
          ],
          realTimeSubscription: 'realtime_sales',
          translationLabel: 'kpis.kpiTitle.sps',
          shortTranslationLabel: 'kpis.shortKpiTitles.tenant_sps',
          isCurrency: true,
          prefixSymbol: '',
          suffixSymbol: '',
          order: 9
        },
        {
          kpi: 'splh',
          value: 'splh',
          label: 'SPLH',
          precision: 2,
          icon: 'splh',
          group: 'perimeter',
          requiredSubscriptions: [
            'labor'
          ],
          realTimeRequiredPermissions: [
            'realtime_sales'
          ],
          realTimeSubscription: 'realtime_sales',
          translationLabel: 'kpis.kpiTitle.splh',
          shortTranslationLabel: 'kpis.shortKpiTitles.tenant_splh',
          isCurrency: true,
          prefixSymbol: '',
          suffixSymbol: '',
          order: 12
        },
        {
          kpi: 'aur',
          value: 'aur',
          label: 'AUR',
          precision: 2,
          icon: 'aur',
          group: 'perimeter',
          requiredSubscriptions: [
            'sales'
          ],
          realTimeRequiredPermissions: [
            'realtime_sales'
          ],
          realTimeSubscription: 'realtime_sales',
          translationLabel: 'kpis.kpiTitle.aur',
          shortTranslationLabel: 'kpis.shortKpiTitles.tenant_aur',
          isCurrency: true,
          prefixSymbol: '',
          suffixSymbol: '',
          order: 8
        },
        {
          kpi: 'labor_hours',
          value: 'labor',
          label: 'Labor',
          precision: 1,
          requiredSubscriptions: [
            'labor'
          ],
          realTimeRequiredPermissions: [
            'realtime_labor'
          ],
          realTimeSubscription: 'realtime_labor',
          icon: 'labor-fat',
          group: 'perimeter',
          apiReturnkey: 'labor',
          translationLabel: 'kpis.kpiTitle.labor_hours',
          shortTranslationLabel: 'kpis.shortKpiTitles.tenant_labor',
          isCurrency: false,
          prefixSymbol: '',
          suffixSymbol: '',
          order: 10
        },
        {
          kpi: 'transactions',
          value: 'transactions',
          label: 'Transactions',
          precision: 0,
          requiredSubscriptions: [
            'sales'
          ],
          realTimeRequiredPermissions: [
            'realtime_sales'
          ],
          realTimeSubscription: 'realtime_sales',
          icon: 'transactions',
          group: 'perimeter',
          apiReturnkey: 'transactions',
          translationLabel: 'kpis.kpiTitle.transactions',
          shortTranslationLabel: 'kpis.shortKpiTitles.tenant_transactions',
          isCurrency: false,
          prefixSymbol: '',
          suffixSymbol: '',
          order: 5
        },
        {
          kpi: 'abandonment_rate',
          value: 'abandonment_rate',
          label: 'Abandonment rate',
          precision: 2,
          icon: 'u-turn',
          group: 'interior',
          requiredSubscriptions: [

          ],
          translationLabel: 'kpis.kpiTitle.abandonment_rate',
          shortTranslationLabel: 'kpis.kpiTitle.abandonment_rate',
          isCurrency: false,
          prefixSymbol: '',
          suffixSymbol: '%',
          order: 24,
          multiplier: 100,
        },
        {
          kpi: 'opportunity',
          value: 'opportunity',
          label: 'opportunity',
          icon: 'two-way',
          group: 'interior',
          requiredSubscriptions: [

          ],
          translationLabel: 'kpis.kpiTitle.opportunity',
          shortTranslationLabel: 'kpis.kpiTitle.opportunity',
          isCurrency: false,
          prefixSymbol: '',
          suffixSymbol: '',
          order: 22
        },
        {
          kpi: 'gsh',
          value: 'gsh',
          label: 'gsh',
          icon: 'bag',
          group: 'interior',
          requiredSubscriptions: [

          ],
          translationLabel: 'kpis.kpiTitle.gsh',
          shortTranslationLabel: 'kpis.kpiTitle.gsh',
          isCurrency: false,
          prefixSymbol: '',
          suffixSymbol: '',
          order: 20
        },
        {
          kpi: 'draw_rate',
          value: 'draw_rate',
          label: 'Draw rate',
          icon: 'crossing',
          group: 'interior',
          requiredSubscriptions: [

          ],
          translationLabel: 'kpis.kpiTitle.draw_rate',
          shortTranslationLabel: 'kpis.kpiTitle.draw_rate',
          isCurrency: false,
          prefixSymbol: '',
          suffixSymbol: '%',
          order: 23,
          multiplier: 100,
          precision: 2
        }, {
          kpi: 'average_percent_shoppers',
          value: 'average_percent_shoppers',
          label: 'Shoppers vs others',
          precision: 1,
          icon: 'u-turn',
          requiredSubscriptions: [],
          translationLabel: 'kpis.kpiTitle.shoppers_vs_others',
          shortTranslationLabel: 'kpis.kpiTitle.shoppers_vs_others',
          isCurrency: false,
          prefixSymbol: '',
          suffixSymbol: '',
          order: 25
        }
      ],
      weatherMetrics: [
        {
          kpi: 'Temperature',
          value: 'Temperature',
          label: 'Temperature',
          precision: 0,
          requiredSubscriptions: [

          ],
          icon: '',
          group: 'any',
          apiReturnkey: 'temp',
          avgKeys: [
            'maxTemp',
            'minTemp'
          ],
          translationLabel: 'kpis.kpiTitle.temperature',
          shortTranslationLabel: 'kpis.shortKpiTitles.temperature',
          isCurrency: false,
          prefixSymbol: '',
          suffixSymbol: '°C',
          order: 1,
          isHourly: false,
          unit: 'c',
          unitName: 'temperature'
        },
        {
          kpi: 'high_temperature',
          value: 'high_temperature',
          label: 'High temperature',
          precision: 0,
          requiredSubscriptions: [

          ],
          icon: '',
          group: 'any',
          apiReturnkey: 'maxTemp',
          translationLabel: 'kpis.kpiTitle.high_temperature',
          shortTranslationLabel: 'kpis.shortKpiTitles.high_temperature',
          isCurrency: false,
          prefixSymbol: '',
          suffixSymbol: '°C',
          order: 2,
          isHourly: false,
          unit: 'c',
          unitName: 'temperature'
        },
        {
          kpi: 'low_temperature',
          value: 'low_temperature',
          label: 'Low temperature',
          precision: 0,
          requiredSubscriptions: [

          ],
          icon: '',
          group: 'any',
          apiReturnkey: 'minTemp',
          translationLabel: 'kpis.kpiTitle.low_temperature',
          shortTranslationLabel: 'kpis.shortKpiTitles.low_temperature',
          isCurrency: false,
          prefixSymbol: '',
          suffixSymbol: '°C',
          order: 3,
          isHourly: false,
          unit: 'c',
          unitName: 'temperature'
        },
        {
          kpi: 'precipitation',
          value: 'Precipitation',
          label: 'Precipitation',
          precision: 0,
          requiredSubscriptions: [

          ],
          icon: '',
          group: 'any',
          apiReturnkey: 'precipitation',
          translationLabel: 'kpis.kpiTitle.precipitation',
          shortTranslationLabel: 'kpis.shortKpiTitles.precipitation',
          isCurrency: false,
          prefixSymbol: '',
          suffixSymbol: '',
          order: 4,
          isHourly: true,
          unit: '',
          unitName: ''
        },
        {
          kpi: 'humidity',
          value: 'Humidity',
          label: 'Humidity',
          precision: 0,
          requiredSubscriptions: [

          ],
          icon: '',
          group: 'any',
          apiReturnkey: 'humidity',
          translationLabel: 'kpis.kpiTitle.humidity',
          shortTranslationLabel: 'kpis.shortKpiTitles.humidity',
          isCurrency: false,
          prefixSymbol: '',
          suffixSymbol: '',
          order: 5,
          isHourly: true,
          unit: '',
          unitName: ''
        },
        {
          kpi: 'feels_like',
          value: 'feels_like',
          label: 'Feels like temp',
          precision: 0,
          requiredSubscriptions: [

          ],
          icon: '',
          group: 'any',
          apiReturnkey: 'feelsLike',
          translationLabel: 'kpis.kpiTitle.feels_like',
          shortTranslationLabel: 'kpis.shortKpiTitles.feels_like',
          isCurrency: false,
          prefixSymbol: '',
          suffixSymbol: '°C',
          order: 6,
          isHourly: true,
          unit: 'c',
          unitName: 'temperature'
        },
        {
          kpi: 'wind_speed',
          value: 'wind_speed',
          label: 'Wind speed',
          precision: 0,
          requiredSubscriptions: [

          ],
          icon: '',
          group: 'any',
          apiReturnkey: 'windSpeed',
          translationLabel: 'kpis.kpiTitle.wind_speed',
          shortTranslationLabel: 'kpis.shortKpiTitles.wind_speed',
          isCurrency: false,
          prefixSymbol: '',
          suffixSymbol: 'kmph',
          order: 7,
          isHourly: true,
          unit: 'kmph',
          unitName: 'weatherSpeed'
        }
      ]
    });
})();
