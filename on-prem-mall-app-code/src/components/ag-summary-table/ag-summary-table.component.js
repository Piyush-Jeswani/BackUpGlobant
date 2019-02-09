angular
  .module('shopperTrak')
  .component('agSummaryTable', {
    templateUrl: 'components/ag-summary-table/ag-summary-table.partial.html',
    bindings: {
      tableData: '<',
      currentOrg: '<',
      currentUser: '<',
      currentSite: '<',
      currencySymbol: '<',
      columns: '<',
      totalRow: '<',
      showTable: '<',
      compareType: '<',
      watchProp: '<',
      noData: '<',
    },
    controller: 'agSummaryTableController',
    controllerAs: 'vm'
  });