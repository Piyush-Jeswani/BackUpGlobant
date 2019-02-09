module.exports = {

  getTrendAnalysis() {
    return element(by.className('market-intelligence-widget'));
  },

  getYAxisDropdown() {
    return this.getTrendAnalysis().element(by.css('div.mi-analysis-y-axis-dropdown'));
  },

  getFirstGroupingDropdown() {
    return this.getTrendAnalysis().element(by.css('span.mi-analysis-first-grouping-dropdown'));
  },

  openFirstGroupingDropdown() {
    this.getFirstGroupingDropdown().element(by.css('button.dropdown-toggle')).click();
  },

  getFirstGroupingRowNum(optionLabel) {
    switch (optionLabel.toLowerCase()) {
      case 'day':
        return 1;
      case 'week':
        return 2;
      case 'month':
        return 3;
      case 'quarter':
        return 4;
      case 'year':
        return 5;
      case 'period to date':
        return 6;
      case 'geography':
        return 8;
      default:
        throw new Error(`${optionLabel} is not a valid option for first grouping dropdown.`);
    }
  },

  getFirstGroupingDropdownOption(optionLabel) {
    const metricNum = this.getFirstGroupingRowNum(optionLabel);
    return this.getFirstGroupingDropdown().all(by.repeater('item in vm.items').row(metricNum));
  },

  getFirstGroupingDropdownOptionsText() {
    this.openFirstGroupingDropdown();
    return this.getFirstGroupingDropdown().all(by.repeater('item in vm.items')).getText();
  },

  selectFirstGroupingOption(optionLabel) {
    this.openFirstGroupingDropdown();
    this.getFirstGroupingDropdownOption(optionLabel).click();
  },

  getSecondGroupingDropdown() {
    return this.getTrendAnalysis().element(by.css('span.mi-analysis-second-grouping-dropdown'));
  },

  openSecondGroupingDropdown() {
    return this.getSecondGroupingDropdown().element(by.css('button.dropdown-toggle')).click();
  },

  getSecondGroupingRowNum(optionLabel) {
    switch (optionLabel.toLowerCase()) {
      case 'year':
        return 0;
      default:
        throw new Error(`${optionLabel} is not a valid option for second grouping dropdown.`);
    }
  },

  getSecondGroupingDropdownOption(optionLabel) {
    const optionNum = this.getSecondGroupingRowNum(optionLabel);
    return this.getSecondGroupingDropdown().all(by.repeater('item in vm.items')).all(by.tagName('a')) // finds all links using the repeater
      .filter(dropdownOptions => {
        return dropdownOptions.isDisplayed(); // only return links (options) that are visible
      })
      .get(optionNum); // only return the visible link for optionLabel
  },

  selectSecondGroupingOption(optionLabel, selectingOption) {
    this.openSecondGroupingDropdown();
    if (selectingOption) { // if removing option, no further clicks needed
      this.getSecondGroupingDropdownOption(optionLabel).click(); // click to select option
    }
  },

  getAllChartSeries() {
    return this.getTrendAnalysis().all(by.className('highcharts-series'));
  },

  getSingleChartSeries(seriesNumber = 0) { // defaults to return 1st series if seriesNumber is not passed
    return this.getTrendAnalysis().element(by.className(`highcharts-series-${seriesNumber}`));
  },

  getChartSeriesType(seriesNumber = 0) { // defaults to type of 1st series if seriesNumber is not passed
    // returns 1st child element of chart series - evaluates to either "rect" (bar chart) or "path" (line chart)
    return this.getSingleChartSeries(seriesNumber).element(by.css('*')).getTagName();
  },

  exportWidgetCsv() {
    return this.getTrendAnalysis().element(by.className('export-widget')).click();
  },

  getAdvancedOptionsDropdown() {
    return element(by.css('mi-list-selector.mi-list')).element(by.css('div.filter-header'));
  },

  clickAdvancedOptionsDropdown() {
    this.getAdvancedOptionsDropdown().click();
  },

  getFilterOptionsPanel() {
    return element(by.css('mi-list-selector.mi-list')).element(by.css('div.filter-selection'));
  },

  getFilterOptionsPanelButton(buttonText) { // buttonText must be exact string match
    return this.getFilterOptionsPanel().element(by.buttonText(buttonText));
  },

  clickFilterApplyButton() {
    this.getFilterOptionsPanelButton('Apply').click();
  },

  clickFilterCancelButton() {
    this.getFilterOptionsPanelButton('Cancel').click();
  },

  getFilterRuleDropdown(rowIndex, columnIndex) {
    return this.getFilterOptionsPanel().element(by.repeater('sub in vm.subscriptionArray').row(rowIndex)).all(by.tagName('mi-selector')).get(columnIndex);
  },

  clickFilterRuleDropdown(rowIndex, columnIndex) {
    this.getFilterRuleDropdown(rowIndex, columnIndex).click();
  },

  getFilterRuleOptions(optionText) { // assumes dropdown is already open, using clickFilterRuleDropdown
    return this.getFilterOptionsPanel().all(by.tagName('mi-selector')).all(by.css('li.open')).first()
      .all(by.repeater('item in vm.items'))
      .all(by.cssContainingText('span', optionText));
  },

  getFilterRuleOption(optionText) {
    return this.getFilterRuleOptions(optionText).first();
  },

  getAddFilterLink() {
    return this.getFilterOptionsPanel().element(by.css('div.add-filter'));
  },

  getRemoveFilterLink() {
    return this.getFilterOptionsPanel().element(by.css('span.sticon-circle-delete'));
  },

  getTrendAnalysisTable() {
    return this.getTrendAnalysis().element(by.css('div.data-section')).element(by.css('table.table-bordered'));
  },

  getColumnValues(columnCssSelector) {
    return this.getTrendAnalysisTable().element(by.tagName('tbody')).all(by.repeater('item in vm.dataPoints')).all(by.css(columnCssSelector));
  },

  getCategoryColumnValues() {
    return this.getColumnValues('td:first-child')
      .getText();
  },

  getGeographyNameCategoryValues() {
    return this.getColumnValues('td:nth-child(3)')
      .getText();
  },

  getSelectedPeriodCategoryValues() {
    return this.getColumnValues('td:nth-child(5)')
      .getText();
  },

  getComparePeriodCategoryValues() {
    return this.getColumnValues('td:nth-child(6)')
      .getText();
  },

  getFilterTextInWidgetHeader() {
    return this.getTrendAnalysis().element(by.css('div.display-title')).all(by.repeater('item in vm.selectionSummary'))
      .getText();
  }
};
