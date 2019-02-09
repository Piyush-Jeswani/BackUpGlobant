class csvExporterController {
  constructor(utils, ObjectUtils) {
    this.saveFileAs = utils.saveFileAs;
    this.ObjectUtils = ObjectUtils;
  }

  $onInit() {
    if (_.isUndefined(this.exportFileName)) {
      this.exportFileName = 'ShopperTrak-export-' + moment().format('YYYYMMDDHHmmss') + '.csv';
    }
    
    this.exportError = 'There is a problem with the export'; // Translate

    if (_.isUndefined(this.buttonTitle)) {
      this.buttonTitle = 'CSV';
    }
  }

  onCsvExportClick() {
    if (typeof this.callBackFunction === 'function') {
      this.callBackFunction();
    }
    this.saveFileAs(this.addExtension(this.exportFileName), this.composeExportData(this.exportObj), 'text/csv');
  }

  composeExportData(tableObj) {
    if (this.ObjectUtils.isNullOrUndefinedOrEmptyObject(tableObj) ||
        this.ObjectUtils.isNullOrUndefinedOrEmpty(tableObj.header) ||
        this.ObjectUtils.isNullOrUndefinedOrEmpty(tableObj.columnHeaders) ||
        this.ObjectUtils.isNullOrUndefinedOrEmpty(tableObj.rows) ||
        !_.isArray(tableObj.header) ||
        !_.isArray(tableObj.columnHeaders) ||
        !_.isArray(tableObj.rows)) 
    {
      console.error('Please make sure tableObj keys and values are in the right format');
      return this.exportError;
    }
    let tableHeader = this.setTableRow(tableObj.header, this.escapeComma);
    let tableColumnHeaders = tableObj.columnHeaders.join(',') + '\n';
    let tableRows = this.setTableRow(tableObj.rows, this.escapeComma);
    return tableHeader + tableColumnHeaders + tableRows;
  }

  escapeComma(items) {
    _.each(items, function (item, index) {
      let itemToString = item.toString();
      if (itemToString.indexOf(',') !== -1) {
        items[index] = '"' + itemToString + '"';
      }
    });
  }

  setTableRow(items, escapeComma) {
    var tableRow = '';
    _.each(items, function (currentRow) {
      escapeComma(currentRow);
      tableRow += currentRow.join(',') + '\n';
    });
    return tableRow;
  }

  addExtension(fileName) {
    const ext = '.csv';
    return fileName.slice(fileName.length - 4) === ext ? fileName : fileName + ext;
  }
}

let csvExporterComponent = {
  templateUrl: 'components/csv-exporter/csv-exporter.html',
  controller: csvExporterController,
  controllerAs: 'vm',
  bindings: {
    exportFileName: '<?',
    // Expected exportObj key - header, columnHeaders, rows
    // Every property has to contain an array
    exportObj: '<',
    buttonTitle: '<?',
    callBackFunction: '&?' // Could be used to generate CSV data.
  }
};


angular
  .module('shopperTrak')
  .component('csvExporter', csvExporterComponent);

csvExporterController.$inject = [
  'utils',
  'ObjectUtils'
];