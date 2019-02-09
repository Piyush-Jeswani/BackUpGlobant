class salesCategoriesSelectorController {
  constructor(ObjectUtils) {
    this.ObjectUtils = ObjectUtils;
  }

  $onInit() {
    if(this.ObjectUtils.isNullOrUndefined(this.multipleSelect)) {
      this.multipleSelect = true;
    }

    if(this.ObjectUtils.isNullOrUndefinedOrEmpty(this.categories) || this.categories.length === 1) {
      return;
    }

    this.maxLength = this.multipleSelect ? this.categories.length : 1;

    const defaultOptionId = this.getDefaultSalesCategory(this.orgId, this.currentUser.preferences);

    if(this.ObjectUtils.isNullOrUndefined(this.selectedCategories) || this.selectedCategories.length === 0) {
      this.selectedCategories = _.where(this.categories, {id: defaultOptionId});
    }
  }

  /**
   * Safely retrieves the user's prefered sales category for the specified org.
   * Falls back to Total Retail Sales if no preference is set for the specified org.
   *
   * @param {boolean} orgId - The organization Id
   * @param {object<userPreferences>} userPreferences -The user.preferences object to inspect
   *
   * @returns {number} The sales category id
   */
  getDefaultSalesCategory(orgId, userPreferences) {
    const totalRetailSales = 0;

    if(this.ObjectUtils.isNullOrUndefined(userPreferences) || this.ObjectUtils.isNullOrUndefined(userPreferences.default_sales_categories)) {
      return totalRetailSales;        
    }

    const defaultSalesCat = userPreferences.default_sales_categories[orgId];

    if(this.ObjectUtils.isNullOrUndefined(defaultSalesCat)) {
      return totalRetailSales;
    }

    return defaultSalesCat;
  }
}

angular
.module('shopperTrak')
.controller('salesCategoriesSelectorController', salesCategoriesSelectorController);

salesCategoriesSelectorController.$inject = [
  'ObjectUtils'
];

const salesCategoriesSelector = {
  templateUrl: 'components/sales-categories-selector/sales-categories-selector.partial.html',
  bindings: {
    selectedCategories: '=',
    categories: '=?',
    multipleSelect: '=?',
    orgId: '=',
    currentUser: '=',
    callback: '<?'
  },
  controller: 'salesCategoriesSelectorController as vm'
};

angular
.module('shopperTrak')
.component('salesCategoriesSelector', salesCategoriesSelector);
