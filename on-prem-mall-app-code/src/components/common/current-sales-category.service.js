
// The current sales selections for each widget are πkpistored
// in here for the duration of the STAn user session.
// On STAn reload these settings are lost.
let currentSelections = {};

class currentSalesCategoryService {
  /**
   * Stores a sales category selection for a specified widget key.
   * ToDo: Expand this to include the orgId
   * @param {String} widgetName The unique widget name string.
   * @param {object<salesCategory>} salesCategoryObj The sales category to store
   */
  storeSelection(widgetName, salesCategoryObj) {
    currentSelections[widgetName] = salesCategoryObj;
  }

  /**
   * The selected Sales Category for a widget is stored in the current sales category service.
   * Read this setting to set the sales category pull down selection for this widget.
   * Otherwise the pull down will automatically be defaulted to 'Total Retail Sales'.
   * @param {String} widgetName to find widget sales category selection.
   * @return {object} obj - The object being passed back.
   */
  readSelection(widgetName) {
    return currentSelections[widgetName];
  }

  /**
   * Clears all sales category selections.
   * Should be called when the overall default sales categories are changed or when the org changes
   */
  clearAll() {
    currentSelections = {};
  }
}

angular.module('shopperTrak')
  .service('currentSalesCategoryService', currentSalesCategoryService)

currentSalesCategoryService.$inject = [];
