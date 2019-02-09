'use strict';

describe('treeViewAccordion', function () {  

  var $compile, $scope, controller;

  beforeEach(module('shopperTrak'));

  beforeEach(inject(function ($rootScope,
    _$compile_) {
    $compile = _$compile_;
    $scope = $rootScope.$new();
  }));

  describe('activate()', function() {
    describe('is multi-select', function() {
      it('should throw an error if vm.currentItem is a type of object', function() {
        $scope.multiSelect = true;
        $scope.currentItem = {};
        spyOn(console, 'error');
        controller = renderDirectiveAndDigest();
        expect(console.error).toHaveBeenCalledWith('Current item appears to be of a wrong type. Current item should be type of Array');
      });
    });

    describe('is single-select', function() {
      it('should throw an error if vm.currentItem is a type of object', function() {
        $scope.multiSelect = undefined;
        $scope.currentItem = [];
        spyOn(console, 'error');
        controller = renderDirectiveAndDigest();
        expect(console.error).toHaveBeenCalledWith('Current item appears to be of a wrong type. Current item should be type of Object');
      });
    });
  });

  describe('onItemSelect()', function() {
    describe('is single-select', function() {
      beforeEach(function () {
        $scope.multiSelect = undefined;
        $scope.currentItem = {};
        controller = renderDirectiveAndDigest();
      });

      it('should set a isSelected property to true', function() {
        controller.onItemSelect(controller.items[0].children[1]);
        expect(controller.items[0].children[1].isSelected).toBeDefined();
        expect(controller.items[0].children[1].isSelected).toBe(true);
      });

      it('should save the selected item in the currentItem', function () {
        controller.onItemSelect(controller.items[0].children[1]);
        expect(controller.currentItem).toEqual(controller.items[0].children[1]);
      });
      
      it('should not be able to select multiple items', function() {
        controller.onItemSelect(controller.items[0].children[1]);
        controller.onItemSelect(controller.items[0].children[0]);
        expect(controller.items[0].children[1].isSelected).toBeUndefined();
        expect(controller.currentItem).not.toEqual(controller.items[0].children[1]);
      });
        
      it('should set isOpen flag to parent geography objects', function() {
        controller.onItemSelect(controller.items[0].children[1].children[0]);
        expect(controller.items[0].isOpen).toBeDefined();
        expect(controller.items[0].isOpen).toBe(true);
        expect(controller.items[0].children[1].isOpen).toBeDefined();
        expect(controller.items[0].children[1].isOpen).toBe(true);
      });

      it('should keep branches of the unselected item open', function () {
        controller.onItemSelect(controller.items[0].children[1].children[0]);
        expect(controller.items[0].children[1].isOpen).toBeDefined();
        expect(controller.items[0].children[1].isOpen).toBe(true);
        controller.onItemSelect(controller.items[0].children[0]);
        expect(controller.items[0].isOpen).toBe(true);
        expect(controller.items[0].children[1].isOpen).toBe(true);
      });
    });
    
    describe('shouldResetStateOnSelect', function() {
      describe('is single-select', function() {
        beforeEach(function () {
          $scope.multiSelect = undefined;
          $scope.currentItem = {};
          $scope.configuration = {
            shouldResetStateOnSelect: true
          };
          controller = renderDirectiveAndDigest();
        });

        it('should close the branches of an unselected item ', function() {
          controller.onItemSelect(controller.items[0].children[1].children[0]);
          expect(controller.items[0].isOpen).toBeDefined();
          expect(controller.items[0].isOpen).toBe(true);
          expect(controller.items[0].children[1].isOpen).toBeDefined();
          expect(controller.items[0].children[1].isOpen).toBe(true);
          controller.onItemSelect(controller.items[0].children[0]);
          expect(controller.items[0].children[1].isOpen).toBe(false);
        });
      });
        
    });
      
  });
  
  function getItems() {
    return [
      {
        'name': 'United States',
        'category': [
          {
            'uuid': '102cc0f3-e297-4ce3-bb1e-cb192c68eaee',
            'lastUpdated': '2018-03-18T13:13:57.526Z',
            'name': 'Northeast',
            'geoType': 'REGION',
            'parentUuid': '6d1175b8-eb06-45ee-9d11-9a63c072f728'
          },
          {
            'uuid': '9824e7e1-c0fc-401b-910c-ade18f946bf7',
            'lastUpdated': '2018-03-18T13:13:57.526Z',
            'name': 'Las Vegas',
            'geoType': 'METRO',
            'parentUuid': '7f420fc1-f8fc-4fd5-8bae-50c3b22c1808'
          },
          {
            'uuid': 'ed6b04d2-c55d-418b-9274-77c05e745d4b',
            'lastUpdated': '2018-03-18T13:13:57.526Z',
            'name': 'Midwest',
            'geoType': 'REGION',
            'parentUuid': '6d1175b8-eb06-45ee-9d11-9a63c072f728'
          },
          {
            'uuid': '6d1175b8-eb06-45ee-9d11-9a63c072f728',
            'lastUpdated': '2018-03-18T13:13:57.525Z',
            'name': 'US',
            'geoType': 'COUNTRY',
            'parentUuid': '46a3b5b5-76b6-4419-8038-0b622bc9f7ae'
          },
          {
            'uuid': '4b1d51e1-e8ba-4f2c-bb82-aca5d1dc9309',
            'lastUpdated': '2018-03-18T13:13:57.526Z',
            'name': 'Chicago',
            'geoType': 'METRO',
            'parentUuid': 'ed6b04d2-c55d-418b-9274-77c05e745d4b'
          }
        ],
        'src': {
          'uuid': '6d1175b8-eb06-45ee-9d11-9a63c072f728',
          'lastUpdated': '2018-03-18T13:13:57.525Z',
          'name': 'US',
          'geoType': 'COUNTRY',
          'parentUuid': '46a3b5b5-76b6-4419-8038-0b622bc9f7ae'
        },
        'children': [
          {
            'name': 'Northeast',
            'category': [
              {
                'uuid': '102cc0f3-e297-4ce3-bb1e-cb192c68eaee',
                'lastUpdated': '2018-03-18T13:13:57.526Z',
                'name': 'Northeast',
                'geoType': 'REGION',
                'parentUuid': '6d1175b8-eb06-45ee-9d11-9a63c072f728'
              },
              {
                'uuid': '9824e7e1-c0fc-401b-910c-ade18f946bf7',
                'lastUpdated': '2018-03-18T13:13:57.526Z',
                'name': 'Las Vegas',
                'geoType': 'METRO',
                'parentUuid': '7f420fc1-f8fc-4fd5-8bae-50c3b22c1808'
              },
              {
                'uuid': 'ed6b04d2-c55d-418b-9274-77c05e745d4b',
                'lastUpdated': '2018-03-18T13:13:57.526Z',
                'name': 'Midwest',
                'geoType': 'REGION',
                'parentUuid': '6d1175b8-eb06-45ee-9d11-9a63c072f728'
              },
              {
                'uuid': '6d1175b8-eb06-45ee-9d11-9a63c072f728',
                'lastUpdated': '2018-03-18T13:13:57.525Z',
                'name': 'US',
                'geoType': 'COUNTRY',
                'parentUuid': '46a3b5b5-76b6-4419-8038-0b622bc9f7ae'
              },
              {
                'uuid': '4b1d51e1-e8ba-4f2c-bb82-aca5d1dc9309',
                'lastUpdated': '2018-03-18T13:13:57.526Z',
                'name': 'Chicago',
                'geoType': 'METRO',
                'parentUuid': 'ed6b04d2-c55d-418b-9274-77c05e745d4b'
              }
            ],
            'src': {
              'uuid': '102cc0f3-e297-4ce3-bb1e-cb192c68eaee',
              'lastUpdated': '2018-03-18T13:13:57.526Z',
              'name': 'Northeast',
              'geoType': 'REGION',
              'parentUuid': '6d1175b8-eb06-45ee-9d11-9a63c072f728'
            },
          },
          {
            'name': 'Midwest',
            'category': [
              {
                'uuid': '102cc0f3-e297-4ce3-bb1e-cb192c68eaee',
                'lastUpdated': '2018-03-18T13:13:57.526Z',
                'name': 'Northeast',
                'geoType': 'REGION',
                'parentUuid': '6d1175b8-eb06-45ee-9d11-9a63c072f728'
              },
              {
                'uuid': '9824e7e1-c0fc-401b-910c-ade18f946bf7',
                'lastUpdated': '2018-03-18T13:13:57.526Z',
                'name': 'Las Vegas',
                'geoType': 'METRO',
                'parentUuid': '7f420fc1-f8fc-4fd5-8bae-50c3b22c1808'
              },
              {
                'uuid': 'ed6b04d2-c55d-418b-9274-77c05e745d4b',
                'lastUpdated': '2018-03-18T13:13:57.526Z',
                'name': 'Midwest',
                'geoType': 'REGION',
                'parentUuid': '6d1175b8-eb06-45ee-9d11-9a63c072f728'
              },
              {
                'uuid': '6d1175b8-eb06-45ee-9d11-9a63c072f728',
                'lastUpdated': '2018-03-18T13:13:57.525Z',
                'name': 'US',
                'geoType': 'COUNTRY',
                'parentUuid': '46a3b5b5-76b6-4419-8038-0b622bc9f7ae'
              },
              {
                'uuid': '4b1d51e1-e8ba-4f2c-bb82-aca5d1dc9309',
                'lastUpdated': '2018-03-18T13:13:57.526Z',
                'name': 'Chicago',
                'geoType': 'METRO',
                'parentUuid': 'ed6b04d2-c55d-418b-9274-77c05e745d4b'
              }
            ],
            'src': {
              'uuid': 'ed6b04d2-c55d-418b-9274-77c05e745d4b',
              'lastUpdated': '2018-03-18T13:13:57.526Z',
              'name': 'Midwest',
              'geoType': 'REGION',
              'parentUuid': '6d1175b8-eb06-45ee-9d11-9a63c072f728'
            },
            'children': [
              {
                'name': 'Chicago',
                'category': [
                  {
                    'uuid': '102cc0f3-e297-4ce3-bb1e-cb192c68eaee',
                    'lastUpdated': '2018-03-18T13:13:57.526Z',
                    'name': 'Northeast',
                    'geoType': 'REGION',
                    'parentUuid': '6d1175b8-eb06-45ee-9d11-9a63c072f728'
                  },
                  {
                    'uuid': '9824e7e1-c0fc-401b-910c-ade18f946bf7',
                    'lastUpdated': '2018-03-18T13:13:57.526Z',
                    'name': 'Las Vegas',
                    'geoType': 'METRO',
                    'parentUuid': '7f420fc1-f8fc-4fd5-8bae-50c3b22c1808'
                  },
                  {
                    'uuid': 'ed6b04d2-c55d-418b-9274-77c05e745d4b',
                    'lastUpdated': '2018-03-18T13:13:57.526Z',
                    'name': 'Midwest',
                    'geoType': 'REGION',
                    'parentUuid': '6d1175b8-eb06-45ee-9d11-9a63c072f728'
                  },
                  {
                    'uuid': '6d1175b8-eb06-45ee-9d11-9a63c072f728',
                    'lastUpdated': '2018-03-18T13:13:57.525Z',
                    'name': 'US',
                    'geoType': 'COUNTRY',
                    'parentUuid': '46a3b5b5-76b6-4419-8038-0b622bc9f7ae'
                  },
                  {
                    'uuid': '4b1d51e1-e8ba-4f2c-bb82-aca5d1dc9309',
                    'lastUpdated': '2018-03-18T13:13:57.526Z',
                    'name': 'Chicago',
                    'geoType': 'METRO',
                    'parentUuid': 'ed6b04d2-c55d-418b-9274-77c05e745d4b'
                  }
                ],
                'src': {
                  'uuid': '4b1d51e1-e8ba-4f2c-bb82-aca5d1dc9309',
                  'lastUpdated': '2018-03-18T13:13:57.526Z',
                  'name': 'Chicago',
                  'geoType': 'METRO',
                  'parentUuid': 'ed6b04d2-c55d-418b-9274-77c05e745d4b'
                }
              }
            ]
          }
        ]
      },
      {
        'name': 'Las Vegas',
        'category': [
          {
            'uuid': '102cc0f3-e297-4ce3-bb1e-cb192c68eaee',
            'lastUpdated': '2018-03-18T13:13:57.526Z',
            'name': 'Northeast',
            'geoType': 'REGION',
            'parentUuid': '6d1175b8-eb06-45ee-9d11-9a63c072f728'
          },
          {
            'uuid': '9824e7e1-c0fc-401b-910c-ade18f946bf7',
            'lastUpdated': '2018-03-18T13:13:57.526Z',
            'name': 'Las Vegas',
            'geoType': 'METRO',
            'parentUuid': '7f420fc1-f8fc-4fd5-8bae-50c3b22c1808'
          },
          {
            'uuid': 'ed6b04d2-c55d-418b-9274-77c05e745d4b',
            'lastUpdated': '2018-03-18T13:13:57.526Z',
            'name': 'Midwest',
            'geoType': 'REGION',
            'parentUuid': '6d1175b8-eb06-45ee-9d11-9a63c072f728'
          },
          {
            'uuid': '6d1175b8-eb06-45ee-9d11-9a63c072f728',
            'lastUpdated': '2018-03-18T13:13:57.525Z',
            'name': 'US',
            'geoType': 'COUNTRY',
            'parentUuid': '46a3b5b5-76b6-4419-8038-0b622bc9f7ae'
          },
          {
            'uuid': '4b1d51e1-e8ba-4f2c-bb82-aca5d1dc9309',
            'lastUpdated': '2018-03-18T13:13:57.526Z',
            'name': 'Chicago',
            'geoType': 'METRO',
            'parentUuid': 'ed6b04d2-c55d-418b-9274-77c05e745d4b'
          }
        ],
        'src': {
          'uuid': '9824e7e1-c0fc-401b-910c-ade18f946bf7',
          'lastUpdated': '2018-03-18T13:13:57.526Z',
          'name': 'Las Vegas',
          'geoType': 'METRO',
          'parentUuid': '7f420fc1-f8fc-4fd5-8bae-50c3b22c1808'
        }
      }
    ];
  }
    
  function renderDirectiveAndDigest() {
    $scope.items = getItems();
    var element = createDirectiveElement();
    $compile(element)($scope);
    $scope.$digest();
    return element.controller('treeViewAccordion');
  }

  function createDirectiveElement() {
    return angular.element(
      '<tree-view-accordion' +
      ' items="items"' +
      ' current-item="currentItem"' +
      ' display-property="\'name\'"' +
      ' multi-select="multiSelect"' +
      ' configuration="configuration"' +
      '></tree-view-accordion>'
    );
  }
});