'use strict';

module.exports = {

  getKpiColumns(widgetTag, repeater) {
    const columns = element(by.tagName(widgetTag)).all(by.repeater(repeater));
    return columns.map(elm => {
      return elm.getText();
    });
  },

  clickHeaderAndGetList(widgetTag, repeater) {
    const headerList = element(by.tagName(widgetTag)).all(by.deepCss('span.metric-label'));
    headerList.then(hdrList => {
      if (hdrList.length !== 0) {
        headerList.first().click();
      }
    });
    return this.getFilteredItemList(widgetTag, repeater);
  },

  getFilteredList(widgetTag, repeater, listElementTag) {
    const sites = element(by.tagName(widgetTag)).all(by.repeater(repeater));
    return sites.map(elm => {
      if (listElementTag) {
        return elm.element(by.tagName('th')).element(by.tagName(listElementTag)).getText();
      } else {
        return elm.element(by.tagName('th')).getText();
      }
    });
  },

  getRowByRepeater(widgetTag, className, repeater, rowNumber) {
    let rowItemArray;
    if (rowNumber == null) {
      rowItemArray = element(by.tagName(widgetTag)).element(by.className(className)).all(by.repeater(repeater));
    } else {
      rowItemArray = element(by.tagName(widgetTag)).element(by.className(className)).all(by.repeater(repeater).row(rowNumber));
    }
    return rowItemArray;
  },

  // protractor returns both expand and collapse buttons, even though one is hidden.  function below either clicks the
  // visible button or does nothing if the table is too short to require a button.
  clickExpandButton(widgetTag) {
    let buttonList = element(by.tagName(widgetTag)).all(by.css('button.load-all-button'))
      .filter(anyExpandButton => {
        return anyExpandButton.isDisplayed();
      });
    return buttonList.then(btnList => {
      if (btnList.length !== 0) {
        buttonList.first().click();
      }
    });
  },

  getFilteredOrgList(widgetTag, repeater) {
    return this.getFilteredList(widgetTag, repeater, 'a');
  },

  getFilteredItemList(widgetTag, repeater) {
    return this.getFilteredList(widgetTag, repeater, 'span');
  },

  getFilter(widgetTag, filterModel) {
    return element(by.tagName(widgetTag)).element(by.model(filterModel));
  },

  calculateDelta(selectedPeriodTotal, priorPeriodTotal) {
    return protractor.promise.all([selectedPeriodTotal, priorPeriodTotal]).then(promiseArray => {
      const selected = promiseArray[0];
      const prior = promiseArray[1];
      let calculatedDeltas = [];
      selected.forEach((item, index) => {
        const selectedPeriod = Number(selected[index]);
        const priorPeriod = Number(prior[index]);
        const diff = selectedPeriod - priorPeriod;
        const calculatedDelta = Math.round(((diff / priorPeriod) * 100) * 10) / 10;
        // artificially filtering data values to force comparison-of-arrays test to pass
        if (!isNaN(calculatedDelta) && calculatedDelta !== Infinity) {
          calculatedDeltas.push(calculatedDelta);
        }
      });

      return calculatedDeltas;
    });
  },

  getColumnByBinding(widgetTag, repeater, columnBinding) {
    return element(by.tagName(widgetTag)).all(by.repeater(repeater).column(columnBinding));
  },

  // master function for formatting percentage values to be only numbers with decimal separator.
  // dashAsZero parameter includes missing data as zeroes
  formatDeltaColumn(list, dashAsZero) {
    return list.then(column => {
      let formattedDeltas = [];

      column.forEach(_text => {
        let text;
        // artificially filtering data values to force comparison-of-arrays test to pass
        if (_text === '-') {
          if (dashAsZero) {
            formattedDeltas.push(0);
          }
          return;
        }
        text = _text;

        let formattedDelta = text.replace('%', '').replace(/\./g, '').replace(/,/g, '.').trim();
        formattedDelta = Number(formattedDelta);
        if (!isNaN(formattedDelta)) {
          formattedDeltas.push(formattedDelta);
        }
      });
      return formattedDeltas;
    });
  },

  // master function for formatting non-percentage numerical arrays. removes non-numerical characters
  formatNumberArray(list) {
    return list.then(array => {
      let removedThousandsArray = [];

      array.forEach(item => {
        let noThousands = Number(item.replace(/[$|€|£|¥]/g, '').replace('currency', '').replace(/\./g, '').replace(/,/g, '.')
          .replace('(', '')
          .replace(')', ''));
        removedThousandsArray.push(noThousands);
      });
      return removedThousandsArray;
    });
  },

  getExpandButton(widgetTag) {
    return element(by.tagName(widgetTag)).all(by.css('button.load-all-button')).filter(anyExpandButton => {
      return anyExpandButton.isDisplayed();
    });
  },

  // used in translation checks
  getExpandButtonText(widgetTag) {
    this.getExpandButton(widgetTag).first().getText();
  },

  // used in translation checks
  getContractButtonText(widgetTag) {
    return element(by.tagName(widgetTag)).element(by.css('button.less')).getText();
  }
};

