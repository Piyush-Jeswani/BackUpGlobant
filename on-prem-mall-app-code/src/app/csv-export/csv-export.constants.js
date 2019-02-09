(function() {
  'use strict';

  angular.module('shopperTrak')
    .constant('csvExportConstants', {
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
        // Perimeter (ordered):
        {
          kpi: 'traffic',
          icon: 'entrance',
          group: 'perimeter',
          subscription: 'any',
          translation_label: 'kpis.kpiTitle.traffic'
        },
        {
          kpi: 'sales',
          icon: 'sales',
          group: 'perimeter',
          subscription: 'sales',
          translation_label: 'kpis.kpiTitle.sales'
        },
        {
          kpi: 'conversion',
          icon: 'conversion',
          group: 'perimeter',
          subscription: 'sales',
          translation_label: 'kpis.kpiTitle.conversion'
        },
        {
          kpi: 'transactions',
          icon: 'transactions',
          group: 'perimeter',
          subscription: 'sales',
          translation_label: 'kpis.kpiTitle.transactions'
        },
        {
          kpi: 'upt',
          icon: 'upt',
          group: 'perimeter',
          subscription: 'sales',
          translation_label: 'kpis.kpiTitle.upt'
        },
        {
          kpi: 'ats',
          icon: 'ats',
          group: 'perimeter',
          subscription: 'sales',
          translation_label: 'kpis.kpiTitle.ats'
        },
        {
          kpi: 'aur',
          icon: 'aur',
          group: 'perimeter',
          subscription: 'sales',
          translation_label: 'kpis.kpiTitle.aur'
        },
        {
          kpi: 'sps',
          icon: 'sps',
          group: 'perimeter',
          subscription: 'sales',
          translation_label: 'kpis.kpiTitle.sps'
        },
        {
          kpi: 'labor_hours',
          icon: 'labor-fat',
          group: 'perimeter',
          subscription: 'labor',
          translation_label: 'kpis.kpiTitle.labor_hours'
        },
        {
          kpi: 'star',
          icon: 'star-labor-fat',
          group: 'perimeter',
          subscription: 'labor',
          translation_label: 'kpis.kpiTitle.star'
        },
        {
          kpi: 'splh',
          icon: 'splh',
          group: 'perimeter',
          subscription: 'sales',
          translation_label: 'kpis.kpiTitle.splh'
        },
        // Interior (ordered):
        {
          kpi: 'traffic',
          icon: 'entrance',
          group: 'interior',
          subscription: 'interior',
          translation_label: 'kpis.kpiTitle.visitor_behaviour_traffic'
        },
        {
          kpi: 'gsh',
          icon: 'bag',
          group: 'interior',
          subscription: 'interior',
          translation_label: 'kpis.kpiTitle.gsh'
        },
        {
          kpi: 'dwelltime',
          icon: 'time',
          group: 'interior',
          subscription: 'interior',
          translation_label: 'kpis.kpiTitle.dwell_time'
        },
        {
          kpi: 'opportunity',
          icon: 'two-way',
          group: 'interior',
          subscription: 'interior',
          translation_label: 'kpis.kpiTitle.opportunity'
        },
        {
          kpi: 'draw_rate',
          icon: 'crossing',
          group: 'interior',
          subscription: 'interior',
          translation_label: 'kpis.kpiTitle.draw_rate'
        },
        {
          kpi: 'abandonment_rate',
          icon: 'u-turn',
          group: 'interior',
          subscription: 'interior',
          translation_label: 'kpis.kpiTitle.abandonment_rate'
        }
      ],
      groupByChoices: [
        {
          name: 'hour',
          translation_label: 'common.HOUR'
        },
        {
          name: 'day',
          translation_label: 'common.DAY'
        },
        {
          name: 'week',
          translation_label: 'common.WEEK'
        },
        {
          name: 'month',
          translation_label: 'common.MONTH'
        },
        {
          name: 'aggregate',
          translation_label: 'common.AGGREGATE'
        }
      ],
      frequencyChoices: [{
        value: 'day',
        translation_label: 'common.DAILY'
      },{
        value: 'week',
        translation_label: 'common.WEEKLY'
      },{
        value: 'month',
        translation_label: 'common.MONTHLY'
      },{
        value: 'year',
        translation_label: 'common.YEARLY'
      }],
      activeChoices: [
        6, 12, 18
      ],
      weekDays: {
        'sunday': 'weekdaysShort.sun',
        'monday': 'weekdaysShort.mon',
        'tuesday': 'weekdaysShort.tue',
        'wednesday': 'weekdaysShort.wed',
        'thursday': 'weekdaysShort.thu',
        'friday': 'weekdaysShort.fri',
        'saturday': 'weekdaysShort.sat'
      },
      monthParts: {
        '1st': 'common.FIRST',
        '15th': 'common.15TH'
      },
      months: {
        'january': 'monthsShort.january',
        'february': 'monthsShort.february',
        'march': 'monthsShort.march',
        'april': 'monthsShort.april',
        'may': 'monthsShort.may',
        'june': 'monthsShort.june',
        'july': 'monthsShort.july',
        'august': 'monthsShort.august',
        'september': 'monthsShort.september',
        'october': 'monthsShort.october',
        'november': 'monthsShort.november',
        'december': 'monthsShort.december'
      }
    });
})();
