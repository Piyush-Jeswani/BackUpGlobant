class CompParams {
  constructor(utils) {
    this.utils = utils;
  }

  getCompDates(_compRange) {
    const { compStartDate, compEndDate } = _compRange;
    return {
      compStartDate: typeof compStartDate === 'string' ? compStartDate : this.utils.getDateStringForRequest(compStartDate),
      compEndDate: typeof compEndDate === 'string' ? compEndDate : this.utils.getDateStringForRequest(compEndDate),
    };
  }

  resetCompFilterCount() {
    delete this.compSitesCount;
  }

  setCompFilterCount(_count) {
    this.compSitesCount = _count;
  }

  getCompFilterCount() {
    return this.compSitesCount;
  }

}


angular.module('shopperTrak')
  .service('CompParams', CompParams);
