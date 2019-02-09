module.exports = {
  getAdminSubscriptionPage() {
    return element(by.css('div.mi-admin-subscription-page'));
  },

  getOrgSubscriptionPage() {
    return element(by.css('div.mi-org-subscription-settings'));
  },

  getSearchOrgField() {
    return this.getAdminSubscriptionPage().element(by.tagName('div.search-row')).element(by.tagName('input'));
  },

  getSubscriptionStatusFilter() {
    return this.getAdminSubscriptionPage().element(by.css('div.mi-admin-subscription-status-filter')).element(by.tagName('custom-select')).element(by.id('locale-selector'));
  },

  getSubscriptionStatusOptions() {
    return this.getSubscriptionStatusFilter().element(by.css('ul.dropdown-menu')).all(by.repeater('item in items'));
  },

  selectSubscriptionStatusOption(option) {
    this.getSubscriptionStatusOptions().all(by.cssContainingText('span', option)).first().click();
  },

  getRowsInOrgList() {
    return this.getAdminSubscriptionPage().element(by.css('div.table-responsive')).element(by.tagName('tbody')).all(by.repeater('organization in vm.organizations'));
  },

  goToOrgSubscriptionPage() { // accesses MI subscription page for 1st org in list (use list filtering for more specificity)
    this.getRowsInOrgList().first().element(by.css('td.org-actions')).element(by.css('span.sticon-edit-small'))
      .click();
  },

  getSubscriptionStartDate() {
    return this.getOrgSubscriptionPage().element(by.css('div.mi-subscription-settings-start-date')).element(by.tagName('input'));
  },

  getSubscriptionEndDate() {
    return this.getOrgSubscriptionPage().element(by.css('div.mi-subscription-settings-end-date')).element(by.tagName('input'));
  },

  getSubscriptionTable() {
    return this.getOrgSubscriptionPage().element(by.css('div.sub-dataset-table')).element(by.tagName('tbody'));
  },

  getSubscriptionTableRows() {
    return this.getSubscriptionTable().all(by.repeater('subObject in vm.marketIntelligenceAdminSubscription.subscriptionNodes'));
  },

  buildExpectedTrendSummaryDefaults(arrayOfRowText) {
    const sortedRows = arrayOfRowText.sort();
    let expectedDefaults = [];
    for (let i = 0; i < sortedRows.length && expectedDefaults.length < 5; i++) {
      let currentRow = sortedRows[i];
      let rowValueArray = currentRow.split('\n');
      let category = rowValueArray.shift();
      rowValueArray.forEach(geography => {
        expectedDefaults.push(`${geography} ${category}`.toUpperCase());
      });
    }
    return expectedDefaults.slice(0, 6);
  },

  getCategoryCellsByName(categoryName) {
    return this.getSubscriptionTableRows().all(by.cssContainingText('td.mi-cell-category-name', categoryName));
  },

  getSubscriptionRowByCategory(categoryName) {
    return this.getCategoryCellsByName(categoryName)
      .first()
      .element(by.xpath('..'));
  },

  getSubscriptionRowDeleteButton(categoryName) {
    return this.getSubscriptionRowByCategory(categoryName).element(by.css('td.org-actions')).element(by.css('span.icon-remove'));
  },

  getDeleteConfirmModal() {
    return this.getSubscriptionTable().all(by.tagName('confirmation-modal')).filter(element => {
      return element.isDisplayed();
    }).first();
  },

  getDeleteSubscriptionConfirmButton() {
    return this.getDeleteConfirmModal().element(by.buttonText('Delete'));
  },

  getAddNewIndexLink() {
    return this.getOrgSubscriptionPage().element(by.css('div.add-new-dataset')).element(by.css('span.icon-font'));
  },

  getOrgSubscriptionPageDoneButton() {
    return this.getOrgSubscriptionPage().element(by.buttonText('Done'));
  },

  getAddSubscriptionModal() {
    return element(by.tagName('mi-dataset-modal'));
  },

  getNewSubscriptionCategory(categoryIndex) {
    return this.getAddSubscriptionModal().all(by.css('div.show-categories')).all(by.repeater('cat in ::vm.adminSubscriptionAddMode.subscriptionNodes'))
      .get(categoryIndex);
  },

  getNewSubscriptionCategoryButton(categoryIndex) {
    return this.getNewSubscriptionCategory(categoryIndex).element(by.css('span.option-button'));
  },

  getNewSubscriptionGeography(geographyIndex) {
    return this.getAddSubscriptionModal().element(by.css('div.show-geographies')).element(by.tagName('mi-admin-geo-level')).all(by.repeater('item in vm.adminSubscriptionAddMode.geographyNode.children'))
      .get(geographyIndex);
  },

  getNewSubscriptionGeographyButton(geographyIndex) {
    return this.getNewSubscriptionGeography(geographyIndex).element(by.css('input.country-level'));
  },

  getSaveNewSubscriptionButton() {
    return this.getAddSubscriptionModal().element(by.buttonText('Save'));
  },

  getAdvancedOptionsTab() { // on org edit page in admin tool
    return element(by.cssContainingText('a', 'ADVANCED OPTIONS'));
  },

  getMiSubscriptionOption() { // on org edit page in admin tool --> "advanced options" tab: "ShopperTrak Index"
    return element(by.css('div.org-subscriptions')).element(by.cssContainingText('h3', 'Market Intelligence')).element(by.xpath('..'));
  },

  getMiSubscriptionToggle() { // on org edit page in admin tool --> "advanced options" tab
    return this.getMiSubscriptionOption().element(by.tagName('ui-switch')).element(by.css('span.ui-switch'));
  },

  getStatusMiToggle() {
    return this.getMiSubscriptionToggle().getAttribute('class').then(classText => {
      return classText.match('chosen') !== null;  // return false if toggle is currently off
    });
  },

  getMiSettingsButton() { // on org edit page in admin tool --> "advanced options" tab
    return this.getMiSubscriptionOption().element(by.cssContainingText('div', 'settings'));
  },

  getSaveOrgSettingsButton() { // on org edit page in admin tool --> "advanced options" tab
    return element(by.css('section.admin-tabs')).element(by.css('div.tab-content')).element(by.id('su-advanced')).element(by.css('div.org-time-settings'))
      .element(by.buttonText('Save'));
  }
};
