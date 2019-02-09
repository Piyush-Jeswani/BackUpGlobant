'use strict';

const widgetTag = 'organization-filter-widget';

module.exports = {

  getFilterMenu() {
    return element(by.tagName(widgetTag)).element(by.className('filter-header'));
  },

  openFilterMenu() {
    const caret = this.getFilterMenu().element(by.className('filter-caret'));
    caret.click();
  },

  getFilterMenuText() {
    return this.getFilterMenu().all(by.css('div.filter-title > span')).getText();
  },

  getFilterMenuButtons() {
    return element(by.tagName(widgetTag)).all(by.css('button'));
  },

  getFilterMenuApplyBtn() {
    return element(by.tagName(widgetTag)).all(by.css('button')).first();
  },

  getFilterMenuClearBtn() {
    return element(by.tagName(widgetTag)).all(by.css('button')).last();
  },

  // applies filter for category and filter specified
  // if categoryName not specified, pick the first category
  // if filterName not specified, pick the first filter within the selected category
  applyFilter(categoryName, filterName) {
    this.toggleFilterCategory(categoryName);
    this.toggleFilter(filterName);
    this.getFilterMenuApplyBtn().click();
  },

  // filter category AKA tag type, such as "CHANNEL"
  // if categoryName not specified, pick the first category
  toggleFilterCategory(categoryName) {
    let filterCategory;
    if (categoryName) {
      filterCategory = element(by.tagName(widgetTag))
        .all(by.css('div.filter-column-wrapper'))
        .all(by.css('div.filter-group-wrapper'))
        .all(by.css('div.filter-title-wrapper'))
        .filter(elem => {
          return elem.getText().then(text => {
            return text === categoryName.toUpperCase();
          });
        })
        .first();
    } else {
      filterCategory = element(by.tagName(widgetTag)).all(by.css('div.filter-column-wrapper')).first();
    }
    filterCategory.click();
  },

  // filter AKA tag value, such as "direct" or "indirect"
  // if filterName not specified, pick the first filter within the selected category
  toggleFilter(filterName) {
    let filter;
    if (filterName) {
      filter = element(by.tagName(widgetTag))
        .all(by.css('ul.filter-tag'))
        .filter(elem => { return elem.isDisplayed(); })
        .all(by.repeater('tag in group.levels'))
        .filter(elem => {
          return elem.getText().then(text => {
            return text.toLowerCase() === filterName.toLowerCase();
          });
        })
        .first();
    } else {
      filter = element(by.tagName(widgetTag)).element(by.css('ul.filter-tag')).all(by.repeater('tag in group.levels')).first();
    }
    filter.click();
  },

  getSelectedFiltersLabelText() {
    return element(by.className('retail-organization-tags')).element(by.className('retail-organization-tag-label')).getText();
  }
};
