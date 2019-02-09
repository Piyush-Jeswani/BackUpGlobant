class MarketIntelligenceWidgetController {
  constructor(
    $translate,
    $q,
    $scope,
    $rootScope,
    $filter,
    ObjectUtils,
    LocalizationService,
    marketIntelligenceService,
    utils,
    dateRangeService,
    localStorageService,
    authService,
    OrganizationResource
  ) {
    this.$translate = $translate;
    this.$q = $q;
    this.$scope = $scope;
    this.$rootScope = $rootScope;
    this.$filter = $filter;
    this.ObjectUtils = ObjectUtils;
    this.LocalizationService = LocalizationService;
    this.MarketIntelligenceService = marketIntelligenceService;
    this.Utils = utils;
    this.DateRangeService = dateRangeService;
    this.LocalStorageService = localStorageService;
    this.AuthService = authService;
    this.OrganizationResource = OrganizationResource;
  }

  $onInit() {
    this.initScope();
    this.setupBindingsForPDF().then(() => {
      this.setupLocalizationService();
      this.getMIWidgetTranslations().then(mappedTranslations => {
        this.translations = mappedTranslations;
        this.buildPeriodToDateLabels(mappedTranslations);
        this.buildFirstGroupingOptions(mappedTranslations, this.fistGroupingDropdownIds);
        this.buildSecondGroupingOptions(mappedTranslations);
        this.configureDefaultOptions();
        this.setWidgetStateReadyForExport();
      });
    }).catch(() => this.displayError);
  }

  $onChanges(bindings) {
    if (!_.isUndefined(bindings.selectedOptions)
      && !bindings.selectedOptions.isFirstChange()
    ) {
      this.configureDefaultOptions();
    }
  }

  setExportLoaded() {
    if (this.$rootScope.pdf) this.$rootScope.pdfExportsLoaded += 1;
  }

  setupBindingsForPDF() {
    const dfd = this.$q.defer();
    if (!this.$rootScope.pdf) {
      dfd.resolve();
      return dfd.promise;
    }
    this.$q.all([
      this.AuthService.getCurrentUser(),
      this.OrganizationResource.get({ orgId: this.orgId }),
      this.MarketIntelligenceService.getSubscriptions(this.orgId, false, false)
    ]).then(response => {
      this.currentUser = response[0];
      this.currentOrg = response[1];
      this.geography = this.MarketIntelligenceService.sliceSubscription(response[2], 'geography');
      this.selectedOptions.dateStart = this.LocalizationService.getLocalDateTimeFormatIgnoringUTC(this.selectedOptions.dateStart);
      this.selectedOptions.dateEnd = this.LocalizationService.getLocalDateTimeFormatIgnoringUTC(this.selectedOptions.dateEnd);
      this.selectedOptions.compareStart = this.LocalizationService.getLocalDateTimeFormatIgnoringUTC(this.selectedOptions.compareStart);
      this.selectedOptions.compareEnd = this.LocalizationService.getLocalDateTimeFormatIgnoringUTC(this.selectedOptions.compareEnd);
      this.getGroupingSelectionFromExport();
      dfd.resolve();
    });
    return dfd.promise;
  }

  initScope() {
    this.translations = {};
    this.numOfChildGeographies = {};
    this.firstGroupingPeriodType = {};
    this.selectionSummary = [];
    this.showCustom;
    this.fistGroupingDropdownIds = {
      time: 1,
      day: 2,
      week: 3,
      month: 4,
      quarter: 5,
      year: 6,
      periodToDate: 7,
      geography: 8
    };

    // Flags
    this.showTable = false;
    this.multiSubscription = false;
    this.hasData = false;
    this.requestFailed = false;
    this.showGeographyNames = false;
    this.controlsExportReady = false;

    // View variables
    this.trendAnalysisPanelArray = {
      selectedPeriod: [],
      priorYear: []
    };
    this.marketIndexPoints = {
      selectedPeriod: [],
      priorYear: []
    };
    this.orgIndexPoints = {
      selectedPeriod: [],
      priorYear: []
    };
    this.dataPoints = [];
    this.firstGroupingSelectedItems = [];
    this.secondGroupingSelectedItems = [];

    // Chart colours
    this.chartColours = {
      marketIndex: {
        0: {
          'selectedPeriod': '#be64f0',
          'priorYear': '#7f12ba'
        },
        1: {
          'selectedPeriod': '#ffa64d'
        }
      },
      orgIndex: {
        0: {
          'selectedPeriod': '#09acfb',
          'priorYear': '#0665b5'
        }
      }
    };
    this.decimalSeparator = this.setDecimalSeparator();
  }

  setDecimalSeparator() {
    const actualNumberFormat = this.LocalizationService.getActualNumberFormat();
    if (!this.ObjectUtils.isNullOrUndefined(actualNumberFormat)) {
      return actualNumberFormat.decimal_separator;
    }
  }

  setWidgetStateReadyForExport() {
    if (this.$rootScope.pdf) {
      this.dropdownExportReady = _.isEmpty(this.secondGroupingSelectedItems);
      this.controlsExportReady = true;
    }
  }

  transformSubscriptionPairs(selectedOptions) {
    const pairs = [];
    _.each(selectedOptions.subscriptions, subscription => {
      if (_.isUndefined(subscription.name)) {
        pairs.push(subscription);
        return;
      }
      const pair = {};
      if (subscription.name === 'Geography') {
        pair.geography = subscription;

        _.each(selectedOptions.subscriptions, subscription => {
          if (subscription.name === 'Category') {
            const newPair = angular.copy(pair);
            newPair.category = subscription;
            pairs.push(newPair);
          }
        });
      }
    });
    selectedOptions.subscriptions = pairs;
  }

  hasNoDataError() {
    return this.isLoading === false && this.hasData === false && this.requestFailed === false;
  }

  requestFailedError() {
    return this.isLoading === false && this.requestFailed === true && this.hasData === true;
  }

  orgOrMarketOnlyColLabel(yoyMarket, yoyOrg) {
    const columns = [
      this.translations.category,
      this.translations.geographyLevel,
      this.translations.geographyName,
      this.translations.periodType,
      this.translations.period,
      this.translations.comparePeriod,
      yoyMarket
    ];

    if (yoyOrg) {
      columns.push(yoyOrg);
    }

    return [columns];
  }

  orgOrMarketOnlyColData(item, periodName, marketDataString, orgDataString) {
    const colData = [
      item.categoryname,
      item.geographytype,
      item.geographyname,
      periodName,
      this.getDateColumnData(item.startDates, item.endDates),
      this.getDateColumnData(item.comStartDates, item.comEndDates),
      marketDataString
    ];

    if (orgDataString) {
      colData.push(orgDataString);
    }

    return colData;
  }

  getDateColumnData(startDate, endDate) {
    return `${startDate}-${endDate}`;
  }


  createCsvColumnLabels(yoyOrg, yoyMarket) {
    let createCellsArray;
    if (this.showGeographyNames && this.showOrgIndex) {
      createCellsArray = this.orgOrMarketOnlyColLabel(yoyMarket, yoyOrg);

    } else if (this.showGeographyNames && !this.showOrgIndex) {
      createCellsArray = this.orgOrMarketOnlyColLabel(yoyMarket);
    } else {
      if (this.isCompareDates()) {
        if (this.showOrgIndex) {
          createCellsArray = [[this.translations.category, this.translations.geographyLevel, this.translations.geographyName, this.translations.periodType, this.translations.selectedPeriod, this.translations.comparePeriod, yoyMarket, yoyOrg]];
        } else if (!this.showOrgIndex) {
          createCellsArray = [[this.translations.category, this.translations.geographyLevel, this.translations.geographyName, this.translations.periodType, this.translations.selectedPeriod, this.translations.comparePeriod, yoyMarket]];
        }
      } else {
        if (this.showOrgIndex) {
          createCellsArray = [[this.translations.category, this.translations.geographyLevel, this.translations.geographyName, this.translations.periodType, this.translations.selectedPeriod, yoyMarket, yoyOrg]];
        } else if (!this.showOrgIndex) {
          createCellsArray = [[this.translations.category, this.translations.geographyLevel, this.translations.geographyName, this.translations.periodType, this.translations.selectedPeriod, yoyMarket]];
        }
      }
    }
    return createCellsArray;
  }

  onCsvExportClick() {

    let cellsArray = this.createCsvColumnLabels(this.translations.yoyOrg, this.translations.yoyMarket);

    if (!this.isPriorYear) {
      cellsArray = this.createCsvColumnLabels(this.translations.customOrg, this.translations.customMarket);
    }

    let cellsString = this.getCsvHeaderSection();

    let periodName = this.showCustom;

    _.each(this.dataPoints, (item, index) => {
      item.geographytype = this.$filter('capitalize')(item.geographytype);

      var marketDataString = this.getValueForCsv(item.marketIndexData);
      var orgDataString = this.getValueForCsv(item.orgIndexData);
      if (item.zeroMarketIndex) {
        var marketDataString = '-';
      }
      if (item.zeroOrgIndex) {
        var orgDataString = '-';
      }

      periodName = this.getGroupingPeriodType(index);

      if (this.showGeographyNames && this.showOrgIndex) {

        cellsArray.push(this.orgOrMarketOnlyColData(item, periodName, marketDataString, orgDataString));

      } else if (this.showGeographyNames && !this.showOrgIndex) {

        cellsArray.push(this.orgOrMarketOnlyColData(item, periodName, marketDataString));

      } else {
        if (this.isCompareDates()) {
          let startDates = item.startDates;
          let compareDates = item.comStartDates;

          if (this.firstGroupingPeriodType.period === 'periodToDate') {
            startDates = `${item.startDates} - ${item.endDates}`;
            compareDates = `${item.comStartDates} - ${item.comEndDates}`;
          }

          if (this.showOrgIndex) {
            cellsArray.push([item.categoryname, item.geographytype, item.geographyname, periodName, startDates, compareDates, marketDataString, orgDataString]);
          } else if (!this.showOrgIndex) {
            cellsArray.push([item.categoryname, item.geographytype, item.geographyname, periodName, startDates, compareDates, marketDataString]);
          }
        } else {
          if (this.showOrgIndex) {
            cellsArray.push([item.categoryname, item.geographytype, item.geographyname, periodName, `${item.startDates} - ${item.endDates}`, marketDataString, orgDataString]);
          } else if (!this.showOrgIndex) {
            cellsArray.push([item.categoryname, item.geographytype, item.geographyname, periodName, `${item.startDates} - ${item.endDates}`, marketDataString]);
          }
        }
      }
    });

    _.each(cellsArray, cellItem => {
      const dataString = cellItem.join(',');
      cellsString += `${dataString}\n`;
    });

    this.Utils.saveFileAs('trend-analysis.csv', cellsString, 'text/csv');
  };

  getValueForCsv(value) {
    let formatData =this.$filter('formatNumber')(value, 1, this.numberFormatName) + '%';
    if (formatData.indexOf(',') !== -1) {
      formatData = '"' + formatData + '"';
    }
    return formatData;
  }

  getCsvHeaderSection() {
    const dateFormatMask = this.LocalizationService.getCurrentDateFormat(this.currentOrg);

    let datePeriod = '';

    if (this.firstGroupingPeriodType.period === 'periodToDate') {
      datePeriod = `${this.translations.periodToDate}: ${this.selectedOptions.dateEnd.format(dateFormatMask)}`
    } else {
      datePeriod = `${this.translations.reportPeriod + this.selectedOptions.dateStart.format(dateFormatMask)} - ${this.selectedOptions.dateEnd.format(dateFormatMask)}`;
    }

    const calendarName = this.getCalendarName();

    const groupBy = this.translations.groupBy + this.firstGroupingSelectedItems[0].name;

    const reportDate = this.translations.reportRun + moment().format(dateFormatMask);

    let cellsString = '';

    cellsString += `${this.translations.organization}: ${this.currentOrg.name}\n`;

    cellsString += `${datePeriod}\n`;

    cellsString += `${calendarName}\n`;

    cellsString += `${this.translations.sameStoreIndex}\n`;

    cellsString += `${this.translations.advanceOptions}: \n`;

    _.each(this.selectionSummary, value => {
      cellsString += ` - ${value.geography} / ${value.category}\n`;
    });

    cellsString += `${groupBy}\n`;

    cellsString += `${reportDate}\n \n`;

    return cellsString;
  }

  getCalendarName() {
    let currentCalendarName = this.LocalizationService.getCurrentCalendarName();

    if (!angular.isDefined(currentCalendarName)) {
      const calendarInfo = this.LocalizationService.getActiveCalendar();

      if (this.LocalizationService.isCalendarIdGregorianMonday(calendarInfo.id)) {
        currentCalendarName = this.translations.standardGregorianMonday;
      } else {
        currentCalendarName = this.translations.standardGregorianSunday;
      }
    }

    return `${this.translations.calendar}: ${currentCalendarName}`;
  }

  setupLocalizationService() {
    this.LocalizationService.setUser(this.currentUser);
    this.LocalizationService.setOrganization(this.currentOrg);
  }

  getMIWidgetTranslations() {
    const deferred = this.$q.defer();

    const miWidgetTransKeys = [
      'marketIntelligence.XAXIS',
      'marketIntelligence.TIME',
      'marketIntelligence.DAY',
      'marketIntelligence.WEEK',
      'marketIntelligence.MONTH',
      'marketIntelligence.QUARTER',
      'marketIntelligence.YEAR',
      'marketIntelligence.SITEGROUPING',
      'marketIntelligence.REGIONS',
      'marketIntelligence.METROS',
      'marketIntelligence.MARKETINDEX',
      'marketIntelligence.ORGINDEX',
      'marketIntelligence.GEOGRAPHYNAME',
      'marketIntelligence.SELECTEDPERIOD',
      'marketIntelligence.COMPAREPERIOD',
      'marketIntelligence.SAMESTOREINDEX',
      'marketIntelligence.GROUPBY',
      'marketIntelligence.REPORTRUN',
      'marketIntelligence.REPORTPERIOD',
      'marketIntelligence.CATEGORY',
      'marketIntelligence.GEOGRAPHY',
      'common.ORGANIZATION',
      'common.CALENDAR',
      'common.STANDARDGREGORIANSUNDAY',
      'common.STANDARDGREGORIANMONDAY',
      'common.PRIORYEAR',
      'marketIntelligence.WTD',
      'marketIntelligence.QTD',
      'marketIntelligence.MTD',
      'marketIntelligence.YTD',
      'marketIntelligence.GEOGRAPHYLEVEL',
      'marketIntelligence.MODELTYPE',
      'marketIntelligence.PERIODTYPE',
      'marketIntelligence.PERIOD',
      'marketIntelligence.YOYCHANGEMKT',
      'marketIntelligence.YOYCHANGEORG',
      'marketIntelligence.CHANGEMKT',
      'marketIntelligence.CHANGEORG',
      'marketIntelligence.CUSTOM',
      'marketIntelligence.PERIODTODATE',
      'marketIntelligence.ADDGROUPING',
      'marketIntelligence.ADVANCEOPTIONS'
    ];

    this.$translate(miWidgetTransKeys).then(sourceTranslations => {
      const mappedTranslations = {
        xaxis: sourceTranslations['marketIntelligence.XAXIS'],
        time: sourceTranslations['marketIntelligence.TIME'],
        day: sourceTranslations['marketIntelligence.DAY'],
        week: sourceTranslations['marketIntelligence.WEEK'],
        month: sourceTranslations['marketIntelligence.MONTH'],
        quarter: sourceTranslations['marketIntelligence.QUARTER'],
        year: sourceTranslations['marketIntelligence.YEAR'],
        siteGrouping: sourceTranslations['marketIntelligence.SITEGROUPING'],
        marketIndex: sourceTranslations['marketIntelligence.MARKETINDEX'],
        orgIndex: sourceTranslations['marketIntelligence.ORGINDEX'],
        geographyName: sourceTranslations['marketIntelligence.GEOGRAPHYNAME'],
        selectedPeriod: sourceTranslations['marketIntelligence.SELECTEDPERIOD'],
        comparePeriod: sourceTranslations['marketIntelligence.COMPAREPERIOD'],
        sameStoreIndex: sourceTranslations['marketIntelligence.SAMESTOREINDEX'],
        groupBy: sourceTranslations['marketIntelligence.GROUPBY'],
        reportRun: sourceTranslations['marketIntelligence.REPORTRUN'],
        reportPeriod: sourceTranslations['marketIntelligence.REPORTPERIOD'],
        organization: sourceTranslations['common.ORGANIZATION'],
        calendar: sourceTranslations['common.CALENDAR'],
        standardGregorianMonday: sourceTranslations['common.STANDARDGREGORIANMONDAY'],
        standardGregorianSunday: sourceTranslations['common.STANDARDGREGORIANSUNDAY'],
        priorYear: sourceTranslations['common.PRIORYEAR'],
        category: sourceTranslations['marketIntelligence.CATEGORY'],
        geography: sourceTranslations['marketIntelligence.GEOGRAPHY'],
        wtd: sourceTranslations['marketIntelligence.WTD'],
        qtd: sourceTranslations['marketIntelligence.QTD'],
        mtd: sourceTranslations['marketIntelligence.MTD'],
        ytd: sourceTranslations['marketIntelligence.YTD'],
        geographyLevel: sourceTranslations['marketIntelligence.GEOGRAPHYLEVEL'],
        modelType: sourceTranslations['marketIntelligence.MODELTYPE'],
        periodType: sourceTranslations['marketIntelligence.PERIODTYPE'],
        period: sourceTranslations['marketIntelligence.PERIOD'],
        yoyMarket: sourceTranslations['marketIntelligence.YOYCHANGEMKT'],
        yoyOrg: sourceTranslations['marketIntelligence.YOYCHANGEORG'],
        customMarket: sourceTranslations['marketIntelligence.CHANGEMKT'],
        customOrg: sourceTranslations['marketIntelligence.CHANGEORG'],
        custom: sourceTranslations['marketIntelligence.CUSTOM'],
        periodToDate: sourceTranslations['marketIntelligence.PERIODTODATE'],
        addGrouping: sourceTranslations['marketIntelligence.ADDGROUPING'],
        advanceOptions: sourceTranslations['marketIntelligence.ADVANCEOPTIONS']
      };

      deferred.resolve(mappedTranslations);
    });

    return deferred.promise;
  }

  buildFirstGroupingOptions(translations, fistGroupingDropdownIds) {
    this.firstGroupingDropdownConfig = {
      title: translations.xaxis,
      placeholder: translations.addGrouping
    };

    this.firstGroupingDropdownArray = [{
      name: translations.time,
      type: 'group',
      id: fistGroupingDropdownIds.time
    }, {
      name: translations.day,
      type: 'option',
      cast: 'time',
      period: 'day',
      id: fistGroupingDropdownIds.day
    }, {
      name: translations.week,
      type: 'option',
      cast: 'time',
      period: 'week',
      id: fistGroupingDropdownIds.week
    }, {
      name: translations.month,
      type: 'option',
      cast: 'time',
      period: 'month',
      id: fistGroupingDropdownIds.month
    }, {
      name: translations.quarter,
      type: 'option',
      cast: 'time',
      period: 'quarter',
      id: fistGroupingDropdownIds.quarter
    }, {
      name: translations.year,
      type: 'option',
      cast: 'time',
      period: 'year',
      id: fistGroupingDropdownIds.year
    }, {
      name: translations.periodToDate,
      type: 'option',
      cast: 'timeToDate', // This forces the graph to render as bars
      period: 'periodToDate',
      id: fistGroupingDropdownIds.periodToDate
    }, {
      name: translations.siteGrouping,
      type: 'group'
    }, {
      name: translations.geography,
      type: 'option',
      geoTypeKey: 'geography',
      cast: 'geo',
      id: fistGroupingDropdownIds.geography
    }];
  }

  buildSecondGroupingOptions(translations) {
    this.secondGroupingDropdownConfig = {
      title: translations.xaxis,
      placeholder: translations.addGrouping
    };

    this.secondGroupingDropdownArray = [{
      name: translations.year,
      type: 'option',
      cast: 'priorYear',
      id: 1
    }];
  }

  configureDefaultOptions() {
    if (!this.$rootScope.pdf) {
      this.getGroupingSelectionFromLocalStorage();
    }
    if (!this.ObjectUtils.isNullOrUndefinedOrEmptyObject(this.selectedOptions)) {
      this.transformSubscriptionPairs(this.selectedOptions);
      this.multiSubscription = this.isMultiSubscription();
      this.showPriorYearGrouping = this.isPriorYearGrouping();
      this.resetSecondGroupingSelection();
      this.getDataForAdvanceOptions();
    }
  }

  getGroupingSelectionFromLocalStorage() {
    const miFirstGroupingSelectedItems = this.LocalStorageService.get('miFirstGroupingSelectedItems');
    const miSecondGroupingSelectedItems = this.LocalStorageService.get('miSecondGroupingSelectedItems');
    this.firstGroupingSelectedItems = !this.ObjectUtils.isNullOrUndefinedOrEmpty(miFirstGroupingSelectedItems)
      ? miFirstGroupingSelectedItems : [];
    this.secondGroupingSelectedItems = !this.ObjectUtils.isNullOrUndefinedOrEmpty(miSecondGroupingSelectedItems)
      ? miSecondGroupingSelectedItems : [];
    this.setGroupingSelectionInExport();
  }

  getGroupingSelectionFromExport() {
    if (_.isUndefined(this.pdfExportConfig)) return;
    this.firstGroupingSelectedItems = !this.ObjectUtils.isNullOrUndefinedOrEmpty(this.pdfExportConfig.firstGroupingSelectedItems)
      ? this.pdfExportConfig.firstGroupingSelectedItems : [];
    this.secondGroupingSelectedItems = !this.ObjectUtils.isNullOrUndefinedOrEmpty(this.pdfExportConfig.secondGroupingSelectedItems)
      ? this.pdfExportConfig.secondGroupingSelectedItems : [];
  }

  setGroupingSelectionInExport() {
    if (_.isUndefined(this.pdfExportConfig)) return;
    this.pdfExportConfig.firstGroupingSelectedItems = this.firstGroupingSelectedItems;
    this.pdfExportConfig.secondGroupingSelectedItems = this.secondGroupingSelectedItems;
  }

  resetSecondGroupingSelection() {
    if (this.multiSubscription) {
      this.secondGroupingSelectedItems = [];
      this.LocalStorageService.set('miSecondGroupingSelectedItems', this.secondGroupingSelectedItems);
    }
  }

  isMultiSubscription() {
    if (!_.isUndefined(this.selectedOptions)) {
      return this.selectedOptions.subscriptions.length > 1;
    }
  }

  findChildrenGeographies(geographies, geo) {
    const geos = [];
    _.each(geographies, g => {
      let geoChilds;
      if (_.has(geo, 'childrenUuids')) {
        geoChilds = _.find(geo.childrenUuids, item => item === g.uuid);
      }
      if (!this.ObjectUtils.isNullOrUndefined(geoChilds)) {
        geos.push(g);
      }
    });
    return geos;
  }

  findGeography(geographies, geographyUuid) {
    return _.find(geographies, g => g.uuid === geographyUuid);
  }

  createParamsObj(subsObject, dateStart, dateEnd, compareStart, compareEnd) {
    return {
      dateStart,
      dateEnd,
      compareStart,
      compareEnd,
      subscriptions: subsObject
    };
  }

  getDataForAdvanceOptions() {
    this.updateDropdownOptions();
    this.configureInitialBindings();
    this.createQueryObjAndGetIndexData(this.firstGroupingSelectedItems[0], this.selectedOptions.dateStart, this.selectedOptions.dateEnd, this.selectedOptions.compareStart, this.selectedOptions.compareEnd, 'selectedPeriod');
    if (this.showPriorYearGrouping) {
      const dateRange = this.getPriorYearRange(this.selectedOptions.dateStart, this.selectedOptions.dateEnd);
      const compareRange = this.getPriorYearRange(this.selectedOptions.compareStart, this.selectedOptions.compareEnd);
      this.createQueryObjAndGetIndexData(this.firstGroupingSelectedItems[0], dateRange.start, dateRange.end, compareRange.start, compareRange.end, 'priorYear');
    }
  }

  getSubscriptionArray() {
    this.selectionSummary = [];
    let subscriptionArray = [];
    if (!_.isUndefined(this.selectedOptions) && !_.isUndefined(this.selectedOptions.subscriptions)) {
      _.each(this.selectedOptions.subscriptions, (subscriptionPair, index) => {
        const geoUuid = subscriptionPair.geography.value.src.uuid;
        const geoUuidObj = this.findGeography(this.geography, geoUuid);
        const childrenGeographies = this.getSubscriptionsForChildrenGeo(geoUuidObj, subscriptionPair);
        this.numOfChildGeographies[index] = childrenGeographies.length;
        subscriptionArray = subscriptionArray.concat(this.getSubscriptionsForChildrenGeo(geoUuidObj, subscriptionPair));
        this.selectionSummary.push({
          geography: subscriptionPair.geography.value.name,
          category: subscriptionPair.category.value.name
        });
      });
    }
    return subscriptionArray;
  }

  getPriorYearRange(dateStart, dateEnd) {
    const range = { 'start': dateStart, 'end': dateEnd };
    return this.DateRangeService.getCustomPeriod(range, this.currentUser, this.currentOrg, undefined, undefined, 'prior_year', true);
  }

  getSubscriptionsForChildrenGeo(geoUuidObj, subscriptionPair) {
    let geoUuidChildObjs = [];
    if (!this.multiSubscription) {
      geoUuidChildObjs = this.findChildrenGeographies(this.geography, geoUuidObj);
    }
    return _.map([geoUuidObj].concat(geoUuidChildObjs), item => ({
      category: subscriptionPair.category.value.src,
      geography: item,
      orgId: subscriptionPair.category.orgId
    }));
  }

  isCompareDates() {
    return _.has(this.selectedOptions, 'compareStart') && _.has(this.selectedOptions, 'compareEnd')
  }

  applyFirstGrouping(selectedItems) {
    this.firstGroupingSelectedItems = selectedItems;
    this.LocalStorageService.set('miFirstGroupingSelectedItems', JSON.stringify(this.firstGroupingSelectedItems));
    this.setGroupingSelectionInExport();
    this.showPriorYearGrouping = this.isPriorYearGrouping();
    this.getDataForGrouping(this.firstGroupingSelectedItems[0]);
  }

  applySecondGrouping(selectedItems) {
    this.secondGroupingSelectedItems = selectedItems;
    this.LocalStorageService.set('miSecondGroupingSelectedItems', JSON.stringify(this.secondGroupingSelectedItems));
    this.setGroupingSelectionInExport();
    this.showPriorYearGrouping = this.isPriorYearGrouping();
    this.getDataForGrouping(this.secondGroupingSelectedItems[0]);
  }

  getDataForGrouping(selectedItem) {
    if (selectedItem && selectedItem.type === 'group') {
      return;
    }
    this.configureInitialBindings();

    this.createQueryObjAndGetIndexData(this.firstGroupingSelectedItems[0], this.selectedOptions.dateStart, this.selectedOptions.dateEnd, this.selectedOptions.compareStart, this.selectedOptions.compareEnd, 'selectedPeriod');
    if (this.showPriorYearGrouping) {
      const dateRange = this.getPriorYearRange(this.selectedOptions.dateStart, this.selectedOptions.dateEnd);
      const compareRange = this.getPriorYearRange(this.selectedOptions.compareStart, this.selectedOptions.compareEnd);
      this.createQueryObjAndGetIndexData(this.firstGroupingSelectedItems[0], dateRange.start, dateRange.end, compareRange.start, compareRange.end, 'priorYear');
    }
  };

  configureInitialBindings() {
    this.isLoading = true;
    this.firstGroupingPeriodType = angular.copy(this.firstGroupingSelectedItems[0]);
    if (this.ObjectUtils.isNullOrUndefined(this.firstGroupingSelectedItems[0])
      || this.firstGroupingSelectedItems[0].cast !== 'time') {
      this.showCustom = this.translations.custom;
      this.isTimePeriodSelected = false;
    } else {
      this.showCustom = this.firstGroupingSelectedItems[0].name;
      this.isTimePeriodSelected = true;
    }
    this.trendAnalysisPanelArray.selectedPeriod = [];
    this.trendAnalysisPanelArray.priorYear = [];
  }

  isPriorYearGrouping() {
    return !this.multiSubscription &&
      !_.isEmpty(this.secondGroupingSelectedItems) &&
      !_.isUndefined(this.secondGroupingSelectedItems[0]) &&
      this.secondGroupingSelectedItems[0].cast === 'priorYear';
  }

  createQueryObjAndGetIndexData(selectedGrouping, dateStart, dateEnd, compareStart, compareEnd, comparePeriod) {
    let queryObj = {};
    let subscriptionArray = this.getSubscriptionArray();
    if (_.isUndefined(selectedGrouping.period)) {
      queryObj = this.createParamsObj(subscriptionArray, dateStart, dateEnd, compareStart, compareEnd);
      this.updateTrendAnalysisArray(queryObj, comparePeriod).then(res => {
        this.validateResult(res, selectedGrouping.cast);
      });
      return;
    }

    const calendarId = this.LocalizationService.getActiveCalendar().id;
    const subscriptions = [];
    _.each(this.selectedOptions.subscriptions, subscription => {
      subscriptions.push({
        orgId: subscription.category.orgId,
        geography: subscription.geography.value.src,
        category: subscription.category.value.src
      });
    })
    queryObj = this.createParamsObj(subscriptions, dateStart, dateEnd, compareStart, compareEnd);
    const promises = [];
    promises.push(this.MarketIntelligenceService.getCalendarDateRanges(calendarId, selectedGrouping.period, queryObj.dateStart, queryObj.dateEnd));
    if (this.isCompareDates()) {
      promises.push(this.MarketIntelligenceService.getCalendarDateRanges(calendarId, selectedGrouping.period, queryObj.compareStart, queryObj.compareEnd));
    }

    this.$q.all(promises).then(res => {
      queryObj.groupByDateRanges = [];
      this.addDateRangesProperty(res[0], queryObj, 'groupByDateRanges', selectedGrouping.period);
      if (!_.isUndefined(res[1])) {
        queryObj.groupByCompareDateRanges = [];
        this.addDateRangesProperty(res[1], queryObj, 'groupByCompareDateRanges', selectedGrouping.period);
      }
      this.updateTrendAnalysisArray(queryObj, comparePeriod).then(res => {
        this.validateResult(res, selectedGrouping.cast);
      });
    }).catch(() => this.displayError);
  }

  addDateRangesProperty(passedArray, passedObj, propertyName, selectedPeriodName) {
    if (selectedPeriodName === 'periodToDate') {
      const results = passedArray.data.result[0];

      passedObj[propertyName] = [
        results.year,
        results.quarter,
        results.month,
        results.week
      ];

      return;
    }

    _.each(passedArray.data.result, eachItem => {
      if (eachItem.start === eachItem.end) {
        passedArray.data.result = _.without(passedArray.data.result, eachItem);
      }
      passedObj[propertyName] = passedArray.data.result;
    });
  }

  validateResult(result, chartType) {

    if (result === 'ok') {
      this.requestFailed = false;
      this.hasData = true;
    } else if (result === 'No Data') {
      this.hasData = false;
      this.requestFailed = false;
    } else {
      this.requestFailed = true;
      this.hasData = true;
    }

    this.updateData(chartType);

  }

  updateTrendAnalysisArray(obj, comparePeriod) {
    const deferred = this.$q.defer();
    this.MarketIntelligenceService.getIndexData(obj, this.showOrgIndex).then(res => {

      this.trendAnalysisPanelArray[comparePeriod] = [];
      if (this.ObjectUtils.isNullOrUndefined(this.firstGroupingPeriodType)) {
        this.firstGroupingPeriodType = {
          name: 'Custom'
        }
      } else if (this.firstGroupingPeriodType.cast === 'geo') {
        this.firstGroupingPeriodType.name = 'Custom'
      }

      this.requestFailed = false;
      this.hasData = true;
      for (let i = 0; i < res.index.length; i++) {
        const indexDataObj = {};

        if (res.index[i].valid === false && !this.ObjectUtils.isNullOrUndefined(res.index[i].errorMessage)) {
          indexDataObj.noMarketIndex = true;
        }

        indexDataObj.periodType = this.getGroupingPeriodType(i);
        indexDataObj.marketindexchange = res.index[i].value * 100;
        indexDataObj.categoryname = res.index[i].subscription.category.name;
        indexDataObj.geographyname = this.MarketIntelligenceService.getFullGeoTitleByCode(res.index[i].subscription.geography.name);
        indexDataObj.geographytype = res.index[i].subscription.geography.geoType;
        indexDataObj.startDate = res.index[i].dateStart;
        indexDataObj.endDate = res.index[i].dateEnd;
        indexDataObj.comStartDate = res.index[i].compDateStart;
        indexDataObj.comEndDate = res.index[i].compDateEnd;

        if (this.showOrgIndex === true) {
          if (res.org[i].valid === false && !this.ObjectUtils.isNullOrUndefined(res.org[i].errorMessage)) {
            indexDataObj.noOrgIndex = true;
          }

          indexDataObj.orgindexchange = res.org[i].value * 100;
        }

        this.trendAnalysisPanelArray[comparePeriod].push(indexDataObj);
      }
      deferred.resolve('ok');
    }).catch(error => {
      console.error(error);
      deferred.resolve(error);
    });

    return deferred.promise;
  }

  getGroupingPeriodType(index) {
    let type;
    if (this.firstGroupingPeriodType.period === 'periodToDate') {
      index = index >= this.periodToDateLabels.length ? index - this.periodToDateLabels.length : index;
      type = this.periodToDateLabels[index];
    } else {
      type = this.firstGroupingPeriodType.period;
    }
    return type;
  }

  updateDropdownOptions() {
    const numOfDaysSelected = this.Utils.getDaysBetweenDates(this.selectedOptions.dateStart, this.selectedOptions.dateEnd);

    if (numOfDaysSelected > 45) {
      this.firstGroupingDropdownArray = _.filter(this.firstGroupingDropdownArray, item => item.id !== 2);
      const savedFirstGroupingSelectedItems = this.LocalStorageService.get('miFirstGroupingSelectedItems');
      if (!this.ObjectUtils.isNullOrUndefinedOrEmpty(savedFirstGroupingSelectedItems)) {
        const savedItemInDropdown = _.findWhere(this.firstGroupingDropdownArray, { id: savedFirstGroupingSelectedItems[0].id });
        if (this.ObjectUtils.isNullOrUndefined(savedItemInDropdown)) {
          this.LocalStorageService.remove('miFirstGroupingSelectedItems');
          this.firstGroupingSelectedItems = [];
        }
      }
    }

    if (this.ObjectUtils.isNullOrUndefinedOrEmpty(this.firstGroupingSelectedItems)) {
      if (numOfDaysSelected <= 21) {
        this.firstGroupingSelectedItems[0] = _.findWhere(this.firstGroupingDropdownArray, { id: this.fistGroupingDropdownIds.day });
      } else {
        this.firstGroupingSelectedItems[0] = _.findWhere(this.firstGroupingDropdownArray, { id: this.fistGroupingDropdownIds.week });
      }
      this.showCustom = this.firstGroupingSelectedItems[0].name;
      this.setGroupingSelectionInExport();
    }
  }

  changeChartType(selectedData) {
    let chartType = 'column';
    const isTime = selectedData === 'time';
    if (isTime) {
      chartType = 'line';
    }
    return chartType;
  }

  resetMarketPoints(index) {
    this.marketIndexPoints[index] = {
      'selectedPeriod': []
    };
    if (this.showPriorYearGrouping) {
      this.marketIndexPoints[index]['priorYear'] = [];
    }
    // Org data does not depend on a subscription. Need only one object.
    if (this.ObjectUtils.isNullOrUndefinedOrEmptyObject(this.orgIndexPoints)) {
      this.orgIndexPoints[index] = {
        'selectedPeriod': []
      };
      if (this.showPriorYearGrouping) {
        this.orgIndexPoints[index]['priorYear'] = [];
      }
    }
  }

  updateData(chartType) {
    this.marketIndexPoints = {};
    this.orgIndexPoints = {};
    this.resetMarketPoints(0);
    this.dataPoints = [];
    this.xAxisLabels = {
      geographyNames: [],
      startDates: []
    };
    this.chartConfig = {
      series: []
    }

    this.setDataPoints(this.trendAnalysisPanelArray['selectedPeriod'], 'selectedPeriod', this.firstGroupingSelectedItems[0]);
    if (this.showPriorYearGrouping) {
      this.setDataPoints(this.trendAnalysisPanelArray['priorYear'], 'priorYear', this.firstGroupingSelectedItems[0]);
    }
    this.changeLabels(chartType);
    _.each(this.numOfChildGeographies, (numberOfGeographies, index) => {
      this.updateWidget(this.marketIndexPoints[index], this.orgIndexPoints[index], this.changeChartType(chartType), index);
    });
    this.configureChartForExport(this.chartConfig, chartType);
    this.setExportLoaded();
    this.isLoading = false;
  }

  changeLabels(cast) {
    if (cast !== 'time' && cast !== 'timeToDate') {
      this.xLabels = this.xAxisLabels.geographyNames;
      this.showGeographyNames = true;
    } else {
      this.xLabels = this.xAxisLabels.startDates;
      this.showGeographyNames = false;
    }
  }

  setDataPoints(trendAnalysisPanelArray, period, firstGroupingSelectedItem) {
    let subscriptionId = 0;
    _.each(trendAnalysisPanelArray, (item, index) => {
      if (item.noMarketIndex) {
        item.marketindexchange = 0;
      }
      if (item.noOrgIndex) {
        item.orgindexchange = 0;
      }

      if (!this.showOrgIndex) {
        item.orgindexchange = null;
      }

      if (firstGroupingSelectedItem.cast === 'time') {
        subscriptionId = this.getSubscriptionId(item);
        if (_.isUndefined(this.marketIndexPoints[subscriptionId])) {
          this.resetMarketPoints(subscriptionId);
        }
      }

      this.marketIndexPoints[subscriptionId][period].push(item.marketindexchange);
      if (subscriptionId === 0) {
        this.orgIndexPoints[subscriptionId][period].push(item.orgindexchange);
      }

      let label = item.geographyname;
      if (this.multiSubscription) {
        label = `${item.geographyname} / ${item.categoryname}`;
      }
      this.xAxisLabels.geographyNames.push(label);

      const formattedStartDate = this.LocalizationService.getLocalDateTimeFormatIgnoringUTC(item.startDate).format(this.dateFormat);
      const formattedEndDate = this.LocalizationService.getLocalDateTimeFormatIgnoringUTC(item.endDate).format(this.dateFormat);
      const formattedComStartDate = this.LocalizationService.getLocalDateTimeFormatIgnoringUTC(item.comStartDate).format(this.dateFormat);
      const formattedComEndDate = this.LocalizationService.getLocalDateTimeFormatIgnoringUTC(item.comEndDate).format(this.dateFormat);
      const dataPoint = this.buildDataPoint(item, formattedStartDate, formattedEndDate, formattedComStartDate, formattedComEndDate);

      if (this.firstGroupingPeriodType.period === 'periodToDate') {
        this.xAxisLabels.startDates.push(this.getGroupingPeriodType(index));
      } else {
        this.xAxisLabels.startDates.push(formattedStartDate);
      }

      this.dataPoints.push(dataPoint);
    });
  }

  getSubscriptionId(item) {
    let id = 0;
    _.each(this.selectedOptions.subscriptions, (subscription, index) => {
      if (subscription.category.value.name === item.categoryname && subscription.geography.value.name === item.geographyname) {
        id = index;
      }
    });
    return id;
  }

  buildDataPoint(item, formattedStartDate, formattedEndDate, formattedComStartDate, formattedComEndDate) {
    return {
      periodtype: item.periodType,
      geographytype: item.geographytype,
      geographyname: item.geographyname,
      categoryname: item.categoryname,
      marketIndexData: item.marketindexchange,
      orgIndexData: item.orgindexchange,
      zeroMarketIndex: item.noMarketIndex,
      zeroOrgIndex: item.noOrgIndex,
      startDates: formattedStartDate,
      endDates: formattedEndDate,
      comStartDates: formattedComStartDate,
      comEndDates: formattedComEndDate,
      marketCssClass: this.getCssClass(item.marketindexchange),
      orgCssClass: this.getCssClass(item.orgindexchange),
      marketPrefix: this.getPrefix(item.marketindexchange),
      orgPrefix: this.getPrefix(item.orgindexchange)
    }
  }

  getPrefix(change) {
    return !_.isUndefined(change) && change >= 0 ? '+' : '';
  }

  getCssClass(change) {
    return !_.isUndefined(change) && change >= 0 ? 'positive' : 'negative';
  }

  toggleTableShow() {
    this.showTable = !this.showTable;
  };

  toolTipFormatter() {
    let body = `<b>${this.x}</b>`;
    $.each(this.points, function () {
      body += `<table>
                <tr>
                  <td class="series-name" style=color:${this.series.color}>${this.series.name}:</td>
                  <td style=color:${this.series.color}><b>${Highcharts.numberFormat(this.y, 1, this.series.userOptions.decimalSeparator)} %</b></td>
                </tr>
              </table>`;
    });
    return body;
  }

  updateWidget(marketIndexData, orgIndexData, chartType, subscriptionId) {
    if (_.isUndefined(marketIndexData)) return;
    this.chartConfig.options = {
      plotOptions: {
        column: {
          pointPadding: 5,
          borderWidth: 1
        }
      },
      chart: {
        type: chartType,
        height: 340,
        style: {
          'fontFamily': '\'Source Sans Pro\', sans-serif'
        },
        events: {
          load: event => {
            event.target.redraw();
          }
        }
      },
      tooltip: {
        shared: true,
        useHTML: true,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderColor: '#e5e5e5',
        shadow: false,
        formatter: this.toolTipFormatter
      }
    };
    this.chartConfig.title = {
      text: ''
    };
    this.chartConfig.xAxis = { categories: this.xLabels };
    this.chartConfig.yAxis = [{
      labels: {
        formatter() {
          return `${this.value}%`;
        }
      },
      title: {
        text: ''
      },
      allowDecimals: false,
      gridLineDashStyle: 'Dot',
      gridLineColor: '#b0b0b0',
      plotLines: [{
        color: '#b0b0b0',
        width: 2,
        value: 0,
        dashStyle: 'ShortDot',
        zIndex: 3
      }]
    }];
    const marketSeries = {
      name: this.translations.marketIndex,
      data: marketIndexData['selectedPeriod'],
      pointWidth: 25,
      color: this.chartColours.marketIndex[subscriptionId].selectedPeriod,
      decimalSeparator: this.decimalSeparator
    };

    if (this.showPriorYearGrouping) {
      marketSeries.name = `${this.translations.marketIndex} - ${this.$filter('capitalize')(this.translations.selectedPeriod)}`;
    }

    if (this.multiSubscription && chartType === 'line') {
      const subscription = this.selectedOptions.subscriptions[subscriptionId];
      marketSeries.name = `${this.translations.marketIndex} - ${subscription.geography.value.src.name} / ${subscription.category.value.name}`;
    }

    this.chartConfig.series.push(marketSeries);

    if (!_.isUndefined(orgIndexData) && this.showOrgIndex) {
      const orgSeries = {
        name: this.translations.orgIndex,
        data: orgIndexData['selectedPeriod'],
        pointWidth: 25,
        color: this.chartColours.orgIndex[0].selectedPeriod,
        decimalSeparator: this.decimalSeparator
      };

      if (this.showPriorYearGrouping) {
        orgSeries.name = `${this.translations.orgIndex} - ${this.$filter('capitalize')(this.translations.selectedPeriod)}`;;
      }

      this.chartConfig.series.push(orgSeries);
    }

    if (this.showPriorYearGrouping) {
      const priorYearMarketIndexSeries = {
        name: `${this.translations.marketIndex} - ${this.translations.priorYear}`,
        data: marketIndexData['priorYear'],
        pointWidth: 25,
        color: this.chartColours.marketIndex[0].priorYear,
        decimalSeparator: this.decimalSeparator
      };
      this.chartConfig.series.push(priorYearMarketIndexSeries);
      if (this.showOrgIndex) {
        const priorYearOrgIndexSeries = {
          name: `${this.translations.orgIndex} - ${this.translations.priorYear}`,
          data: orgIndexData['priorYear'],
          pointWidth: 25,
          color: this.chartColours.orgIndex[0].priorYear,
          decimalSeparator: this.decimalSeparator
        };
        this.chartConfig.series.push(priorYearOrgIndexSeries);
      }
    }
  }

  configureChartForExport(chartConfig, chartType) {
    if (_.isUndefined(this.$rootScope.pdf)) return;
    chartConfig.options.chart.animation = false;
    chartConfig.options.plotOptions[chartType] = {
      animation: false
    },
      chartConfig.options.plotOptions.series = {
        enableMouseTracking: false,
        animation: false
      }
    chartConfig.options.tooltip.enabled = false;
    chartConfig.options.tooltip.animation = false;
    chartConfig.options.reflow = false;
  }

  buildPeriodToDateLabels(translations) {
    this.periodToDateLabels = [];
    this.periodToDateLabels.push(translations.ytd);
    this.periodToDateLabels.push(translations.qtd);
    this.periodToDateLabels.push(translations.mtd);
    this.periodToDateLabels.push(translations.wtd);
  }

  displayError(error) {
    console.error(error);
    this.isLoading = false;
    this.requestFailed = true;
    this.hasData = true;
    this.setExportLoaded();
  }
}

const marketIntelligenceWidgetComponent = {
  templateUrl: 'components/widgets/market-intelligence-widget/market-intelligence-widget.partial.html',
  bindings: {
    selectedOptions: '<',
    geography: '<?',
    numberFormatName: '<',
    dateFormat: '<',
    currentUser: '<?',
    currentOrg: '<?',
    orgId: '<?',
    showOrgIndex: '<',
    isPriorYear: '<',
    isLoading: '<?',
    onPdfExportClick: '&',
    exportIsDisabled: '<?',
    pdfExportConfig: '<?'
  },
  controller: MarketIntelligenceWidgetController,
  controllerAs: 'vm'
}

MarketIntelligenceWidgetController.$inject = [
  '$translate',
  '$q',
  '$scope',
  '$rootScope',
  '$filter',
  'ObjectUtils',
  'LocalizationService',
  'marketIntelligenceService',
  'utils',
  'dateRangeService',
  'localStorageService',
  'authService',
  'OrganizationResource'
];

angular.module('shopperTrak')
  .component('marketIntelligenceWidget', marketIntelligenceWidgetComponent);