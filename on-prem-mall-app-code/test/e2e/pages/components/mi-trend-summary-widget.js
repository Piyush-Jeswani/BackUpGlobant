module.exports = {

  expectedFilterTimePeriodOptions() {
    return [
      'none',
      'yesterday',
      'last week',
      'last month',
      'last year',
      'week-to-date',
      'month-to-date',
      'quarter-to-date',
      'year-to-date'
    ];
  },

  getTrendSummary() {
    return element(by.className('mi-summary-widget'));
  },

  getIndexSegments() {
    return this.getTrendSummary().all(by.repeater('segment in ::vm.kpiSegmentsArray track by $index'));
  },

  getCurrentIndexSegments() {
    return this.getIndexSegments().all(by.className('segment-section-container')).all(by.css('div.top-section'));
  },

  getCurrentIndexTitles() {
    return this.getCurrentIndexSegments().all(by.css('div.mi-panel-heading'));
  },

  getOrgIndexSegments() {
    return this.getIndexSegments().all(by.className('segment-section-compare'));
  },

  getEmptyIndexSegments() {
    return this.getIndexSegments().all(by.className('empty-trend-summary-block'));
  },

  getIndexSegmentDelta(segmentType, segmentIndex) { // segmentType is either 'current' or 'org'
    if (segmentType === 'current') {
      return this.getCurrentIndexSegments().get(segmentIndex).element(by.css('span.segment-section-delta-value')).getText();
    } else if (segmentType === 'org') {
      return this.getOrgIndexSegments().get(segmentIndex).element(by.css('span.segment-section-delta-value')).getText();
    }
    throw new Error(`${segmentType} should be either 'current' or 'org'`);
  },

  clickEditFiltersPageButton() {
    this.getTrendSummary().element(by.css('div.mi-edit-filter-page')).click();
  },

  clickEditFiltersSaveButton() {
    element(by.css('div.action-buttons')).element(by.buttonText('Save')).click();
  },

  clickEditFiltersCancelButton() {
    element(by.css('div.action-buttons')).element(by.cssContainingText('a', 'Cancel')).click();
  },

  getFilterName(index) {
    return element.all(by.tagName('mi-list-selector')).get(index).element(by.css('div.mi-list-selected-display'))
      .getText();
  },

  getFilterDropdown(index) {
    return element.all(by.tagName('mi-list-selector')).get(index).element(by.css('div.filter-header'));
  },

  clickFilterDropdown(index) {
    return this.getFilterDropdown(index).click();
  },

  getFilterOptionsPanel() {
    return element.all(by.css('div.mi-list-dropdown-left')).filter(element => {
      return element.isDisplayed();
    }).first();
  },

  getAddFilterLink() {
    return this.getFilterOptionsPanel().element(by.css('div.add-filter'));
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

  clickFilterClearButton() {
    this.getFilterOptionsPanelButton('Clear').click();
  },

  getFilterRuleDropdown(rowIndex, columnIndex) {
    return this.getFilterOptionsPanel().element(by.repeater('sub in vm.subscriptionArray').row(rowIndex)).all(by.tagName('mi-selector')).get(columnIndex);
  },

  clickFilterRuleDropdown(rowIndex, columnIndex) {
    this.getFilterRuleDropdown(rowIndex, columnIndex).click();
  },

  getFilterRuleOption(optionText) { // assumes dropdown is already open, using clickFilterRuleDropdown
    return this.getFilterOptionsPanel().all(by.tagName('mi-selector')).all(by.css('li.open')).first()
      .all(by.repeater('item in vm.items'))
      .all(by.cssContainingText('span', optionText))
      .first();
  },

  getFilterTimePeriodDropdowns() {
    return element.all(by.css('div.time-dimension')).all(by.tagName('mi-selector'));
  },

  getOneTimePeriodDropdown(dropdownIndex) {
    return this.getFilterTimePeriodDropdowns().get(dropdownIndex);
  },

  getTimePeriodDropdownOptionsByIndex(dropdownIndex) {
    return this.getOneTimePeriodDropdown(dropdownIndex).element(by.id('time-dimension-picker')).all(by.repeater('item in vm.items'));
  },

  setTimePeriodDropdownOption(dropdownIndex, optionText) {
    this.getOneTimePeriodDropdown(dropdownIndex).element(by.cssContainingText('span', optionText)).click();
  }
};
