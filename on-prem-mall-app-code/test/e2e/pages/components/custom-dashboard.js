module.exports = {

  getCustomDashboardModal() {
    return element(by.tagName('custom-dashboard-add-widget'));
  },

  getCustomDashboardInput() {
    return this.getCustomDashboardModal().element(by.css('div.dashboard-list'));
  },

  getCustomDashboardLabel(testDashboardNameString) {
    return this.getCustomDashboardInput().all(by.repeater('dashboard in vm.customDashboards')).all(by.cssContainingText('span', testDashboardNameString)).first();
  },

  getCustomDashboardInputField() {
    return this.getCustomDashboardModal().element(by.css('input.dashboard-list__create__textinput'));
  },

  getCustomDashboardCreateNewDashboard() {
    return this.getCustomDashboardModal().element(by.css('label.dashboard-list__create'));
  },

  getCustomDashboardSaveNewButton() {
    return this.getCustomDashboardModal().element(by.css('button.custom-dashboard-save-button-new'));
  },

  getCustomDashboardSaveExistingButton() {
    return this.getCustomDashboardModal().element(by.css('button.custom-dashboard-save-button-existing'));
  },

  getCustomDashboardCancel() {
    return this.getCustomDashboardModal().element(by.css('button.custom-dashboard-cancel-button'));
  },

  getCustomDashboardListMenuItems() {
    return element(by.css('div.analytics-menu-container')).all(by.css('article.analytics-menu-item--custom-dashboard'));
  },

  getCustomDashboardNavigatetoDashboard() {
    return this.getCustomDashboardListMenuItems().first();
  },

  getCustomDashboardPageView() {
    return element(by.css('article.dashboard'));
  },

  getCustomDashboardTitle(dashboardTitleName) {
    return this.getCustomDashboardPageView().element(by.cssContainingText('span', dashboardTitleName));
  },

  getCustomDashboardEditButton() {
    return this.getCustomDashboardPageView().element(by.css('button.edit-custom-dashboard-button-top-right'));
  },

  getCustomDashboardEditView() {
    return element(by.css('article.is-edit-mode'));
  },

  getWidgetsOnCustomDashboard() {
    return this.getCustomDashboardPageView().all(by.repeater('widget in vm.dashboard.widgets'));
  },

  getCustomDashboardWidgetDeleteButton() {
    return this.getWidgetsOnCustomDashboard().first().element(by.css('button.delete-in-widget'));
  },

  getCustomDashboardDeleteSingleDashboard() {
    return this.getCustomDashboardWidgetDeleteButton().element(by.css('button.delete-in-widget'));
  },

  getCustomDashboardDeleteEntireDashboard() {
    return this.getCustomDashboardPageView().element(by.css('button.delete-button-in-header'));
  },

  getCustomDashboardConfirmDeletionModal() {
    return element(by.css('div.modal-content'));
  },

  getCustomDashboardConfirmDeletionCancel() {
    return this.getCustomDashboardConfirmDeletionModal().element(by.css('button.btn-default'));
  },

  getCustomDashboardConfirmDeletionOK() {
    return this.getCustomDashboardConfirmDeletionModal().element(by.css('button.btn-primary'));
  },

  getCustomDashboardSaveChangesButton() {
    return this.getCustomDashboardEditView().element(by.css('button.btn-primary'));
  },

  getWidgetTiteonDashboardPage(widgetTitleName) {
    return this.getCustomDashboardPageView().element(by.cssContainingText('span', widgetTitleName));
  },

  getWidgetDateRangeOnDashboard(widgetIndex) {
    return this.getWidgetsOnCustomDashboard().get(widgetIndex).element(by.css('span.period'));
  },

  getEditDashboardTitleinEditMode() {
    return this.getCustomDashboardEditView().element(by.css('div.dashboard__title__edit-title')).element(by.css('input.input'));
  },

  getDateSelectorWithinWidget(widgetIndex) {
    return this.getCustomDashboardEditView().all(by.css('div.multi-select-list')).get(widgetIndex).element(by.css('button.dropdown-toggle'));
  },

  getDateSelectorDropdownOptions(dateRangeOption) {
    switch (dateRangeOption.toLowerCase()) {
      case 'day':
        return 0;
      case 'week':
        return 1;
      case 'month':
        return 2;
      case 'year':
        return 3;
      case 'week to date':
        return 4;
      case 'month to date':
        return 5;
      case 'quarter to date':
        return 6;
      case 'year to date':
        return 7;
      default :
        throw new Error(`${dateRangeOption} is not a valid date range option.`);
    }
  },

  getEditDateDropdownIndividualWidget(widgetIndex, dateRangeOption) {
    let dateRangeOptionIndex = this.getDateSelectorDropdownOptions(dateRangeOption);
    return this.getCustomDashboardEditView().all(by.css('div.multi-select-list')).get(widgetIndex).all(by.repeater('range in widget.dateRangeTypes'))
      .get(dateRangeOptionIndex);
  },

  getCustomDashboardSelectDatePeriodDropdown() {
    return this.getCustomDashboardEditView().element(by.css('button.btn-default'));
  },

  getCustomDashboardDefaulPageDateRange(dateRangeOption) {
    let defaultPageDateRange = this.getDateSelectorDropdownOptions(dateRangeOption);
    return this.getCustomDashboardEditView().element(by.css('div.dashboard__header__buttons__date-control')).all(by.repeater('range in vm.dateRangeTypes'))
      .get(defaultPageDateRange);
  },

  getCustomDashboardExportToPdf(widgetIndex) {
    return this.getCustomDashboardPageView().all(by.css('div.widget-heading__export-icon')).get(widgetIndex).element(by.css('a'));
  },

  getCustomDashboardExportDropDown() {
    return element(by.css('div.am-collapse')).element(by.css('a.dropdown-toggle-export'));
  },

  getCustomDashboardClearExport() {
    return this.getCustomDashboardExportDropDown.element(by.css('a.navbar-export-clear'));
  },

  getCustomDashboardExportCurrentView() {
    return this.getCustomDashboardExportDropDown().element(by.css('a.navbar-export-current-view'));
  },
};
