'use strict';

describe('csvExporter', function() {
  var $compile, $scope;
  var utilsMock, csvReadyString;

  beforeEach(module('shopperTrak'));
  beforeEach(inject(putTemplateToTemplateCache));
  beforeEach(inject(function (
    $rootScope,
    _$compile_,
    _utils_
  ) {
    $compile = _$compile_;
    $scope = $rootScope.$new();
    utilsMock = _utils_;
  }));
  
  describe('if bindings are undefined', function() {
    it('should set exportFileName', function() {
      expect($scope.exportFileName).toBeUndefined();
      var controller = renderDirectiveAndDigest();
      expect(controller.exportFileName).toBe('ShopperTrak-export-' + moment().format('YYYYMMDDHHmmss') + '.csv');
    });
    
    it('should set buttonTitle', function() {
      expect($scope.buttonTitle).toBeUndefined();
      var controller = renderDirectiveAndDigest();
      expect(controller.buttonTitle).toBe('CSV');
    });
  });
  
  describe('if bindings are defined', function() {
    it('should set exportFileName', function() {
      $scope.exportFileName = 'Export-Billing-CSV.csv';
      var controller = renderDirectiveAndDigest();
      expect(controller.exportFileName).toBe('Export-Billing-CSV.csv');
    });
    
    // Write data unit tests
    
    it('should set buttonTitle', function() {
      $scope.buttonTitle = 'Export Billing CSV';
      var controller = renderDirectiveAndDigest();
      expect(controller.buttonTitle).toBe('Export Billing CSV');
    });
  });
  
  describe('onCsvExportClick()', function() {
    beforeEach(function () {
      spyOn(utilsMock, 'saveFileAs').and.callFake(function (fileName, csvReadyString, type) {
        angular.noop(fileName, csvReadyString, type);
      });
    });

    it('should call saveFileAs method', function() {
      var controller = renderDirectiveAndDigest();
      controller.onCsvExportClick();
      expect(utilsMock.saveFileAs).toHaveBeenCalled();
    });
    
    it('should throw a console error if exportObj is undefined', function() {
      spyOn(console, 'error').and.callThrough();
      $scope.exportObj = undefined;
      var controller = renderDirectiveAndDigest();
      controller.onCsvExportClick();
      expect(console.error).toHaveBeenCalled();
    });
      
    it('should throw a console error if exportObj a wrong object key', function() {
      spyOn(console, 'error').and.callThrough();
      var exportObj = getExportObj();
      delete exportObj.header;
      exportObj.tableHeader = [];
      $scope.exportObj = exportObj;
      var controller = renderDirectiveAndDigest();
      controller.onCsvExportClick();
      expect(console.error).toHaveBeenCalled();
    });

    it('should throw a console error if exportObj property is not an array', function() {
      spyOn(console, 'error').and.callThrough();
      var exportObj = getExportObj();
      exportObj.header = {};
      $scope.exportObj = exportObj;
      var controller = renderDirectiveAndDigest();
      controller.onCsvExportClick();
      expect(console.error).toHaveBeenCalled();
    });
    
    it('should convert exportObj into a CSV export compatible string', function() {
      var fileName = 'ShopperTrak-export-' + moment().format('YYYYMMDDHHmmss') + '.csv';
      $scope.exportObj = getExportObj();
      var controller = renderDirectiveAndDigest();
      controller.onCsvExportClick();
      expect(utilsMock.saveFileAs).toHaveBeenCalledWith(fileName, csvReadyString, 'text/csv');  
    });
    
    it('should add the .csv extension to the filename if missing', function() {
      $scope.exportFileName = 'filename-missing-an-extension';
      var fileName = 'filename-missing-an-extension.csv';
      $scope.exportObj = getExportObj();
      var controller = renderDirectiveAndDigest();
      controller.onCsvExportClick();
      expect(utilsMock.saveFileAs).toHaveBeenCalledWith(fileName, csvReadyString, 'text/csv');
    });
       
    it('should return supplied filename if the .csv extension is present', function() {
      $scope.exportFileName = 'filename-missing-an-extension.csv';
      var fileName = 'filename-missing-an-extension.csv';
      $scope.exportObj = getExportObj();
      var controller = renderDirectiveAndDigest();
      controller.onCsvExportClick();
      expect(utilsMock.saveFileAs).toHaveBeenCalledWith(fileName, csvReadyString, 'text/csv');
    });
  });
    
  function renderDirectiveAndDigest() {
    var element = createDirectiveElement();
    $compile(element)($scope);
    $scope.$digest();
    return element.controller('csvExporter');
  }

  function createDirectiveElement() {
    return angular.element(
      '<csv-exporter' +
      ' export-file-name="exportFileName"' +
      ' button-title="buttonTitle"' +
      ' export-obj="exportObj"' +
      '></csv-exporter>'
    );
  }

  function putTemplateToTemplateCache($templateCache) {
    // Put an empty template to the template cache to prevent Angular from
    // trying to fetch it. We are only testing the controller here, so the
    // actual template is not needed.
    $templateCache.put(
      'components/csv-exporter/csv-exporter.html',
      '<div></div>'
    );
  }

  function getExportObj() {
    return {
      'header': [
        ['Billing Export']
      ],
      'columnHeaders': [
        'Organization ID',
        'Organization',
        'Subscription status'
      ],
      'rows': [
        [
          6055,
          'AAA Platinum Inc. - SPR',
          'Active (03/19/2018 - 03/20/2019)'
        ],
        [
          5217,
          'AT&T',
          'Active (01/21/2018 - 01/22/2019)'
        ],
        [
          6212,
          'AT&T Comunicaciones Digitales S de RL de',
          'Active (09/22/2016 - 09/22/2018)'
        ],
        [
          5873,
          'Al Futtaim Group Real Estate ',
          'Active (09/22/2016 - 09/22/2018)'
        ],
        [
          6681,
          'Pets at Home Ltd',
          'Active (02/19/2018 - 02/20/2019)'
        ],
        [
          8882,
          'The Shops at Liberty Place',
          'Active (09/22/2016 - 09/22/2018)'
        ]
      ]
    };  
  };

  csvReadyString = 'Billing Export\n' +
    'Organization ID,Organization,Subscription status\n' +
    '6055,AAA Platinum Inc. - SPR,Active (03/19/2018 - 03/20/2019)\n' +
    '5217,AT&T,Active (01/21/2018 - 01/22/2019)\n' +
    '6212,AT&T Comunicaciones Digitales S de RL de,Active (09/22/2016 - 09/22/2018)\n' +
    '5873,Al Futtaim Group Real Estate ,Active (09/22/2016 - 09/22/2018)\n' +
    '6681,Pets at Home Ltd,Active (02/19/2018 - 02/20/2019)\n' +
    '8882,The Shops at Liberty Place,Active (09/22/2016 - 09/22/2018)\n';
});
  