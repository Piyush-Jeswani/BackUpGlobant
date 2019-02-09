class agSummaryTableController {
  constructor(
    $scope,
    $rootScope,
    $window,
    $filter,
    $timeout,
    $q,
    ObjectUtils,
    LocalizationService,
    metricConstants,
    currencyService
  ) {
    this.$scope = $scope;
    this.$rootScope = $rootScope;
    this.$window = $window;
    this.$filter = $filter;
    this.$timeout = $timeout;
    this.$q = $q;
    this.ObjectUtils = ObjectUtils;
    this.LocalizationService = LocalizationService;
    this.metricConstants = metricConstants;
    this.currencyService = currencyService;
  };

  /**
   * @function $onInit
   * Lifecycle hook that Initiallises the component
   * replaces the activate() function 
   * 
   * @fires initScope()
   * @fires buildGrid()
   * @fires configureWatches()
   * 
   */
  $onInit() {
    this.initScope();
    this.buildGrid();
  }

  initScope() {
    this.columnHeaders = [];
    this.rows = [];
    this.isLoading = true;
    this.numberFormatName = this.LocalizationService.getCurrentNumberFormatName(this.currentUser, this.currentOrganization);
    this.hourlyFormat = !this.ObjectUtils.isNullOrUndefinedOrEmptyObject(this.tableData[0].hourOfDay);

    if (this.hourlyFormat) {
      this.updateForHourly();
    }
  }

  buildGrid() {
    this.buildGridForPdf().then(() => {
      this.buildColumns();
      this.buildRows();
      this.assembleGrid();
      this.configureChanges();
      this.configureDestroy();
    });
  }

  buildGridForPdf() {
    const defer = this.$q.defer();
    if (!this.$rootScope.pdf) {
      defer.resolve();
      return defer.promise;
    }

    const siteId = !this.ObjectUtils.isNullOrUndefinedOrEmptyObject(this.currentSite) ? this.currentSite.site_id : undefined;
    this.currencyService.getCurrencySymbol(this.currentOrg.organization_id, siteId)
      .then(data => {
        this.currencySymbol = data.currencySymbol;
        defer.resolve();
      })
      .catch(err => {
        defer.error();
        console.error('currency symbol error', err);
      })

    return defer.promise;
  }

  configureChanges() {
    this.$onChanges = (changes) => {

      if(this.$rootScope.pdf && changes.watchProp && !changes.watchProp.currentValue && changes.watchProp.previousValue) {
        // sometimes data is fed to the grid in PDF before the % change has been calculated. This updates the grid as that data is updated.
        this.updateGrid();
      }

      if (changes.showTable && changes.showTable.currentValue && !changes.showTable.previousValue){
        this.resizeColumnsDebounced();
      }

      if(changes.tableData && changes.tableData.currentValue[0].hourOfDay){
        this.hourlyFormat = true;
        this.updateForHourly();
        this.updateGrid();
      } 
      
      if(changes.tableData && !changes.tableData.currentValue[0].hourOfDay){
        this.hourlyFormat = false;
        this.updateGrid();
      }
    }
  }

  configureDestroy() {
    this.$onDestroy = () => {
      angular.element(this.$window).off('resize', this.resizeColumnsDebounced());
    };
  }

  updateForHourly() {
    _.each(this.tableData, (row) => {
      row.dayOfWeek = row.hourOfDay;
    });
  }

  /**
  * @function buildColumns
  * builds each column on the grid and adds the required class and 
  * renderer constructors for each cell that will belong to the column
  * 
  * @requires this.tableData 
  * @requires this.columns
  * @requires this.columnHeaders
  * @requires this.compareType
  * @requires this.metricConstants
  * 
  * @returns {nothing} but populates config objects for this.columnHeaders array
  */
  buildColumns() {
    let firstColumnSorter = {};
    let showCalculatedChangeData = this.compareType !== 'change_numeric' ? false : true;
    let colHeaders = this.columnHeaders;
    let compareTypeCopy = angular.copy(this.compareType);

    _.each(this.tableData, (data) => {
      firstColumnSorter[data.dayOfWeek] = data.dayOfWeekIndex;
    });

    let firstColumn = {
      headerName: '<span class="sticon sticon-change"></span>',
      field: 'dayOfWeek',
      cellRenderer: this.translateWrap,
      width: 160,
      cellClass: (params) => this.buildCellClass(params, compareTypeCopy)
    }

    if (!this.hourlyFormat) {
      firstColumn.comparator = (valueA, valueB) => {
        return firstColumnSorter[valueB] - firstColumnSorter[valueA];
      }
      firstColumn.sortingOrder = ['desc', 'asc'];
    } else {
      firstColumn.sortingOrder = ['desc', 'asc', null]
      firstColumn.comparator = (valueA, valueB, nodeA, nodeB, isInverted) => {
        if (valueA.includes('PM')) {
          valueA = Number(valueA.replace(/\D/g, '')) + 12;
        } else if (valueA.includes('trafficPerWeekdayWidget.AVERAGE')) {
          if (!isInverted) {
            valueA = 25;
          } else {
            valueA = 0;
          }
        } else {
          valueA = Number(valueA.replace(/\D/g, ''));
        }

        if (valueB.includes('PM')) {
          valueB = Number(valueB.replace(/\D/g, '')) + 12;
        } else if (valueB.includes('trafficPerWeekdayWidget.AVERAGE')) {
          if (!isInverted) {
            valueB = 25;
          } else {
            valueB = 0;
          }
        } else {
          valueB = Number(valueB.replace(/\D/g, ''));
        };

        return valueA - valueB;
      }
    }

    this.columnHeaders.push(firstColumn);

    if (typeof this.columns[0] !== 'object') {
      let replacementColumns = [];
      for (let key in this.columns) {
        replacementColumns.push({ kpi: this.columns[key] })
      }

      this.columns = replacementColumns;
    }

    _.each(this.columns, (col) => {
      let kpi = col.kpi;
      let metricDetails = _.findWhere(this.metricConstants.metrics, { 'kpi': kpi });
      colHeaders.push({
        headerName: metricDetails.displayName,
        field: kpi,
        minWidth: 90,
        cellRenderer: (params) => this.renderKpi(params, this.compareType),
        cellClass: (params) => this.buildCellClass(params, this.compareType),
        headerClass: (params) => this.buildCellClass(params, this.compareType),
        sortingOrder: ['desc', 'asc'],
        comparator: (valueA, valueB, nodeA, nodeB, isInverted) => {
          if (nodeB.data.dayOfWeek === 'trafficPerWeekdayWidget.AVERAGE' && !isInverted) {
            return -99999999999999;
          }

          if (nodeB.data.dayOfWeek === 'trafficPerWeekdayWidget.AVERAGE' && isInverted) {
            return 99999999999999;
          }

          return valueA - valueB;
        }
      });

      if (showCalculatedChangeData || !metricDetails.calculated) {
        let changeObj = {
          headerName: '<span class="sticon sticon-change"></span>',
          field: kpi + '_' + this.compareType.toString(),
          minWidth: 60,
          cellRenderer: (params) => this.renderKpi(params, this.compareType),
          cellClass: (params) => this.buildCellClass(params, this.compareType),
          headerClass: (params) => this.buildCellClass(params, this.compareType),
          comparator: (valueA, valueB, nodeA, nodeB, isInverted) => {
            if (nodeB.data.dayOfWeek === 'trafficPerWeekdayWidget.AVERAGE' && !isInverted) {
              return -99999999999999;
            }

            if (nodeB.data.dayOfWeek === 'trafficPerWeekdayWidget.AVERAGE' && isInverted) {
              return 99999999999999;
            }

            return valueA - valueB;
          }
        };

        colHeaders.push(changeObj);

      }
    });
  }

  /**
   * @function buildRows
   * using the information generated in buildColumns() rowData is generated in this.rows
   * 
   * @requires this.columnHeaders
   * @requires this.tableData
   * @requires this.totalRow
   * 
   * @returns {nothing} but populates the data for each row
   */
  buildRows() {
    let rowObj = {};

    _.each(this.columnHeaders, (column) => {
      rowObj[column.field] = undefined;
    });

    _.each(this.tableData, (dataRow) => {
      let thisRow = angular.copy(rowObj);
      let rowKeys = _.keys(thisRow);
      _.each(rowKeys, (key) => {
        thisRow[[key]] = dataRow[key] || 0;
      });
      this.rows.push(thisRow);
    });

    if (!this.ObjectUtils.isNullOrUndefinedOrEmptyObject(this.totalRow)) {
      let newRow = {
        'dayOfWeek': 'trafficPerWeekdayWidget.AVERAGE'
      };
      _.mapObject(this.totalRow, (val, key) => {
        newRow[key] = this.totalRow[key];
      });
      this.rows.push(newRow);
    }

  }

  assembleGrid() {
    this.gridOptions = {
      rowData: this.rows,
      columnDefs: this.columnHeaders,
      enableSorting: true,
      angularCompileRows: true,
      angularCompileHeaders: true,
      rowHeight: 34,
      headerHeight: 34,
      suppressCsvExport: true,
      suppressExcelExport: true,
      getRowClass: (params) => {
        return this.getAverageRowClass(params);
      }
    }
    this.isLoading = false;

    this.gridOptions.onGridReady = () => {
      this.resizeColumnsDebounced();
    }
    angular.element(this.$window).on('resize', () => {this.resizeColumnsDebounced()});
  }

  getAverageRowClass(params) {
    if (params.data.dayOfWeek === 'trafficPerWeekdayWidget.AVERAGE') {
      return 'averageRow';
    }
  }

  buildCellClass(params, compareType) {
    let fieldName = params.colDef.field;
    let cellClass = `${params.colDef.field}`;

    if (fieldName === 'dayOfWeek') {
      cellClass += ' text-left';
    } else if (fieldName.includes(compareType)) {
      if (this.compareType === 'change_numeric') {
        if (params.value < 0.0) {
          cellClass += ' negativeValue blue-border-right';
        } else if (params.value > 0.0) {
          cellClass += ' positiveValue blue-border-right';
        } else {
          cellClass += ' blue-border-right';
        }
      } else {
        cellClass += ' blue-border-right';
      }
    } else if (compareType !== 'change_numeric' && fieldName === 'conversion') {
      cellClass += ' blue-border-right';
    }

    return cellClass;
  }

  renderKpi(params) {
    if (params.colDef.field.includes(this.compareType)) {
      return this.percentCell(params);
    }
    let metric = _.findWhere(this.metricConstants.metrics, { kpi: params.colDef.field });
    let newVal = this.$filter('formatNumber')(params.value, metric.precision, this.numberFormatName, this.currentUser.localization.number_format.thousands_separator);
    if(this.$rootScope.pdf && metric.isCurrency) {
      return this.currencySymbol + newVal;
    }
    return metric.prefixSymbol + newVal + metric.suffixSymbol;
  }

  percentCell(params) {
    if (_.isUndefined(params.value)) return '';
    return this.percentFormatter(params.value) + '%';
  }

  percentFormatter(num) {
    return +(Math.round(num + 'e+2') + 'e-2');
  }

  translateWrap(params) {
    return '<span translate>' + params.value + '</span>'
  }

  resizeColumnsDebounced() {
    _.debounce(this.resizeColumns(), 200);
  }


  resizeColumns() {
    if (!this.ObjectUtils.isNullOrUndefinedOrEmptyObject(this.gridOptions.api)) {
      this.gridOptions.api.sizeColumnsToFit();
    }
  }


  updateGrid() {
    this.rows = [];
    this.columnHeaders = [];
    this.buildColumns();
    this.buildRows();
    this.gridOptions.rowData = this.rows;
    this.gridOptions.api.setRowData(this.rows);
    this.resizeColumnsDebounced();
  }

}

angular
  .module('shopperTrak')
  .controller('agSummaryTableController', agSummaryTableController);

agSummaryTableController.$inject = [
  '$scope',
  '$rootScope',
  '$window',
  '$filter',
  '$timeout',
  '$q',
  'ObjectUtils',
  'LocalizationService',
  'metricConstants',
  'currencyService'
];