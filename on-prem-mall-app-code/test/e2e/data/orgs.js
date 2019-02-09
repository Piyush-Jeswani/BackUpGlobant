'use strict';

module.exports = {
  getNestedProp(obj, key) {
    const arr = key.split('.');
    while (arr.length && (obj = obj[arr.shift()]));
    return obj;
  },

  MSOrg: {
    name: 'Arabian Centres Mall',
    id: 6255,
    sites:
    ['Mall of Dhahran',
      'Al Nakheel Mall',
      'Aziz Mall',
      'Mall of Arabia',
      'Makkah Mall',
      'Tala Mall',
      'Haifaa Mall',
      'Khurais Plaza Mall',
      'Salaam Mall - Riyadh',
      'Salma',
      'Salaam Mall - Jeddah',
      'Jubail Mall',
      'Jouri Mall',
      'Arabian Centres Mall',
      'Al Ahsa Mall'
    ],

    metrics: {
      pdfView: {
        orgLevelView: ['Organization Summary',
          'Sites performance',
          'Daily averages - Traffic'
        ]
      }
    }
  },

  MSOrgSite: {
    name: 'Mall of Dhahran',
    id: 80030032,
    testZone: 'New Yorker 119905',
    testZoneId: '432585',

    getAllAreas() {
      let allAreas = this.tenants.concat(this.entrances).concat(this.commonAreas);
      return allAreas;
    },

    entrances:
    ['Entrance5-Outer-Gnd',
      'Entrance3-Outer-Gnd',
      'Entrance10-Outer-Gnd',
      'Entrance9-Outer-Gnd',
      'Entrance8-Outer-Gnd',
      'Entrance6-Outer-Gnd',
      'Entrance4-Outer-Gnd',
      'Entrance2-Outer-Gnd',
      'Entrance7-Outer-Gnd',
      'Entrance11-Outer-Gnd',
      'Entrance1-Outer-Gnd',
      'Entrance13-Outer-Gnd',
      'Entrance12-Outer-Gnd'
    ],
    tenants: // 55 stores
    ['Gap Ext 109522',
      'Pull & Bear 106305',
      'LC Waikiki 127052',
      'Aldo (E10) 108932',
      'Berska 105310',
      'F&F 126904',
      'New Yorker 119905',
      'Clarks 117302',
      'Monsoon Access MD51',
      'Ziddy 123301',
      'US Polo 123902',
      'Gap 109507',
      'Monsoon (E9) MD02',
      'Zara Home 106107',
      'Banana Republic 109519',
      'Promod 102722',
      'SuiteBlanco 126858',
      'NineWest (E5) MD26',
      'NineWest (E9) MD07',
      'Steven Madden 122901',
      'FG4 Woman 126313',
      'Childrens Place 126970',
      'Garage 125502',
      'Collezione 126502',
      'Quizz 104905',
      'La Senza (E9) MD15',
      'Cortefield 117705',
      'La Vie en Rose 119319',
      'Monsoon Children MD68',
      'Miss Selfridge 104711',
      'Jennyfer 103912',
      'Ceilo 100309',
      'Sergent Mayor 101922',
      'La Senza (E8) MD19',
      'Wallis 105118',
      'I AM 125302',
      'FG4 124318',
      'Six 125102',
      'LaSenza (E4) MD30',
      'Viss 108715',
      'Camieu 103320',
      'ADL 123701',
      'Aldo (E2) 108916',
      'Aldo Access 109115',
      'Anotah MD57',
      'MAVI 127154',
      'Marks & Spencer 101506',
      'Charles & Keith 107115',
      'Zara (E2) 105912',
      'Designal 112504',
      'Spring 109313',
      'Eclipse 117904',
      "Tape A L'Oeil 101718",
      'Oysho 105704',
      'MassimoDutti MD42'
    ],
    commonAreas: ['Mall Outer', 'Mall Perimeter'],

    metrics: { // used in tests for export CSV or PDF
      csv:
      [
        'Traffic',
        'Sales',
        'Conversion',
        'Transactions',
        'UPT',
        'ATS',
        'AUR',
        'SPS'
      ],
      csvTranslationKeys:
      [
        'kpis.shortKpiTitles.tenant_traffic',
        'kpis.shortKpiTitles.tenant_sales',
        'kpis.shortKpiTitles.tenant_conversion',
        'kpis.shortKpiTitles.tenant_transactions',
        'kpis.shortKpiTitles.tenant_upt',
        'kpis.kpiTitle.ats',
        'kpis.shortKpiTitles.tenant_aur',
        'kpis.shortKpiTitles.tenant_sps'
      ],
      pdfView: { // different metrics are exported from different tabs
        trafficTab: // traffic tab at site level
        ['Traffic',
          'Entrance summary',
          'Entrance contribution',
          'Power hours - Average Traffic',
          'Daily averages - Traffic',
          'Tenant summary',
          'Common areas summary'
        ],

        zoneLevelTrafficTab: // traffic tab at zone level
        ['Site Performance',
          'Traffic',
          'Entrance summary',
          'Power hours - Average Traffic',
          'Daily performance indicators',
          'Daily averages - Traffic'
        ],

        salesConversionTab:
        ['Tenant sales summary',
          'Tenant conversion summary',
          'Tenant ATS summary',
          'Tenant UPT summary'
        ],

        zoneLevelSalesConversionTab:
        ['Sales',
          'Conversion',
          'ATS',
          'UPT'
        ]
      }
    },
    powerHoursRows:
    ['3 - 4',
      '4 - 5',
      '5 - 6',
      '6 - 7',
      '7 - 8',
      '8 - 9',
      '9 - 10',
      '10 - 11',
      '11 - 12',
      '12 - 13',
      '13 - 14',
      '14 - 15',
      '15 - 16',
      '16 - 17',
      '17 - 18',
      '18 - 19',
      '19 - 20',
      '20 - 21',
      '21 - 22',
      '22 - 23',
      '23 - 0',
      '0 - 1',
      '1 - 2',
      '2 - 3'
    ]
  },

  MSRetailOrg: {
    name: 'North Face',
    id: 3068,
    siteCount: 107, // to be used in place of a 1-to-1 site name check in CSV export tests
    sites: [
      'North Face - Chicago',
      'North Face - Tyson\'s Corner Center',
      'North Face - University Village',
      'North Face - Somerset Collection',
      'North Face - Westchester Mall',
      'North Face - The Plaza at King of Prussia',
      'North Face - Indianapolis',
      'North Face - Kentwood',
      'North Face - Crabtree Valley Mall',
      'North Face - River Park Square',
      'North Face - Fashion Place Mall',
      'North Face - Cherry Hill Mall',
      'North Face - Old Orchard Mall',
      'North Face - Northpark Center',
      'North Face - Toronto',
      'North Face - Yorkdale Shopping Centre',
      'North Face - West Edmonton Mall',
      'North Face - Montreal',
      'North Face - Vaughan Mills Shopping Center',
      'North Face - Niagara Collections',
      'North Face - Natick',
      'North Face - Sawgrass Mills',
      'North Face - Las Americas',
      'North Face - Simpsonville',
      'North Face - Vacaville',
      'North Face - Aurora',
      'North Face - Sevierville',
      'North Face - Michigan City',
      'North Face - Tannersville',
      'North Face - Miromar',
      'North Face - Potomac Mills Mall',
      'North Face - Desert Hills Premium Outlets',
      'North Face - Outlet Shoppes at Oklahoma',
      'North Face - Las Vegas Premium Outlets North',
      'North Face - Albertville Premium Outlets',
      'North Face - Philadelphia Premium Outlet',
      'North Face - Nebraska Crossing',
      'North Face - Eton',
      'North Face - Galleria Mall',
      'North Face - South Coast Plaza',
      'North Face - Providence Place',
      'North Face - Westfarms Mall',
      'North Face - Anchorage',
      'North Face - Ala Moana Center',
      'North Face - Mall of America',
      'North Face - Berkeley',
      'North Face  - Freeport',
      'North Face - Woodbury Commons',
      'North Face - Birch Run Outlet',
      'North Face - Orlando',
      'North Face - Pleasant Prairie',
      'North Face - Woodburn',
      'North Face - Cincinnati Premium Outlet',
      'North Face - Camarillo Premium Outlet',
      'North Face - Williamsburg Premium Outlets',
      'North Face - Tulalip',
      'North Face - Grove City',
      'North Face - Castle Rock',
      'North Face - Gilroy',
      'North Face - Myrtle Beach',
      'North Face - San Marcos',
      'North Face - Hagerstown',
      'North Face - Orlando (Vineland)',
      'North Face - Dawsonville',
      'North Face - Destin',
      'North Face - Tanger Outlets Lincoln City',
      'North Face - Lincoln City',
      'North Face - TableMesa',
      'North Face - Somerset Collection North',
      'North Face - Outlet Shoppes at Oshkosh',
      'North Face - The Brewery Blocks',
      'North Face - Country Club Plaza',
      'North Face - Boise',
      'North Face - GeorgeTown',
      'North Face - Ann Arbor  Crossing',
      'North Face - Garden State Plaza',
      'North Face - South Shore Mall',
      'North Face - Rochester',
      'North Face - San Francisco',
      'North Face - Beverly Hills',
      'North Face - Valley Fair',
      'North Face - Sherman Plaza',
      'North Face - St Paul',
      'North Face - Philadelphia',
      'North Face - Towson Town Center',
      'North Face - Southpark Mall',
      'North Face - Albuquerque Uptown Shopping Center',
      'North Face - Palo Alto',
      'North Face - New York',
      'North Face - Soho New York',
      'North Face - Minneapolis',
      'North Face - 29th Street Mall',
      'North Face - San Francisco Premium Outlets',
      'North Face - Atlanta',
      'North Face - Easton Town Center',
      'North Face - Bethesda Avenue',
      'North Face - Seattle',
      'North Face - West County Mall',
      'North Face - Bellevue Square',
      'North Face - Kenwood Towne Center',
      'North Face - The Summit Shopping Center',
      'North Face - Boston',
      'North Face - Hilldale Mall',
      'North Face - The Shops at North Creek',
      'North Face - Northshore Mall',
      'North Face - Green Hills Mall',
      'North Face - The Village',
      'North Face - Brookfield Square'
    ],
    metrics: {
      csv:
      [
        'Traffic',
        'Sales',
        'Conversion',
        'Transactions',
        'UPT',
        'ATS',
        'AUR',
        'SPS',
        'Labor',
        'STAR',
        'SPLH'
      ],
      csvTranslationKeys:
      [
        'kpis.shortKpiTitles.tenant_traffic',
        'kpis.shortKpiTitles.tenant_sales',
        'kpis.shortKpiTitles.tenant_conversion',
        'kpis.shortKpiTitles.tenant_transactions',
        'kpis.shortKpiTitles.tenant_upt',
        'kpis.kpiTitle.ats',
        'kpis.shortKpiTitles.tenant_aur',
        'kpis.shortKpiTitles.tenant_sps',
        'kpis.shortKpiTitles.tenant_labor',
        'kpis.shortKpiTitles.tenant_star',
        'kpis.shortKpiTitles.tenant_splh',
      ],
      pdfView: {
        orgLevelView:
        ['Organization performance',
          'Power hours - Average Traffic',
          'Daily performance indicators',
          'Daily averages - Traffic',
          'Retail store summary',
          'Organization Summary'
        ]
      }
    },
    tag1Name: 'DONOT_DELETE_1',
    tag1Value: 'E2E_AUTOMATION_TAG_1',
    tag1SiteId:[
      51182
    ],
    tag2Name: 'DONOT_DELETE_2',
    tag2Value: 'E2E_AUTOMATION_TAG_2',
    tag2SiteId:[
      51182
    ],
  },

  MSRetailSite: {
    testSiteName: '10 North Face - Chicago',
    csvTestSiteNameAndId: '10 North Face - Chicago',
    testSiteId: '51181',
    metrics: {
      pdfView: {
        siteLevelTrafficTab:
        ['Site Performance',
          'Traffic',
          'Entrance summary',
          'Entrance contribution',
          'Power hours - Average Traffic',
          'Daily performance indicators', 'Daily averages - Traffic'
        ],

        siteLevelSalesConversionTab:
        ['Sales',
          'Conversion',
          'ATS',
          'UPT'
        ],

        siteLevelLaborTab:
        ['Labor',
          'STAR'
        ]
      }

    },
    powerHoursRows:
    ['0 - 1',
      '1 - 2',
      '2 - 3',
      '3 - 4',
      '4 - 5',
      '5 - 6',
      '6 - 7',
      '7 - 8',
      '8 - 9',
      '9 - 10',
      '10 - 11',
      '11 - 12',
      '12 - 13',
      '13 - 14',
      '14 - 15',
      '15 - 16',
      '16 - 17',
      '17 - 18',
      '18 - 19',
      '19 - 20',
      '20 - 21',
      '21 - 22',
      '22 - 23',
      '23 - 0'
    ]
  },

  MSRetailSiteExportCSV: {
    testSiteName: '10 North Face - Chicago',
    csvTestSiteNameAndId: '10 North Face - Chicago',
    testSiteId: '51181',
    weekTrafficId: '5.241',
    metrics: {
      pdfView: {
        siteLevelTrafficTab:
          ['Site Performance',
            'Traffic',
            'Entrance summary',
            'Entrance contribution',
            'Power hours - Average Traffic',
            'Daily performance indicators', 'Daily averages - Traffic'
          ],

        siteLevelSalesConversionTab:
          ['Sales',
            'Conversion',
            'ATS',
            'UPT'
          ],

        siteLevelLaborTab:
          ['Labor',
            'STAR'
          ]
      }

    },
    powerHoursRows:
      ['0 - 1',
        '1 - 2',
        '2 - 3',
        '3 - 4',
        '4 - 5',
        '5 - 6',
        '6 - 7',
        '7 - 8',
        '8 - 9',
        '9 - 10',
        '10 - 11',
        '11 - 12',
        '12 - 13',
        '13 - 14',
        '14 - 15',
        '15 - 16',
        '16 - 17',
        '17 - 18',
        '18 - 19',
        '19 - 20',
        '20 - 21',
        '21 - 22',
        '22 - 23',
        '23 - 0'
      ]
  },

  SSOrg: {
    name: 'Mandalay Bay',
    id: 8699,
    ssOrgSiteName: 'The Shoppes at Mandalay Place',
    ssOrgSiteId: '80042762',
    testArea: 'B1-128 - Ri Ra Irish Pub',
    testAreaId: '3347',

    getAllAreas() {
      let allAreas = this.stores.concat(this.entrances).concat(this.corridors);
      return allAreas;
    },

    // 62 total areas in test SS org
    // 45 stores
    stores:
    ['B1-113 - Welcome to Las Vegas',
      'B1-123 - Lick',
      'B1-131 - Lik Gallery',
      'B1-111 - The Las Vegas Sock Market',
      'B1-114 - Chapel Hats',
      'B1-118 - Bay Essentials',
      'B1-120 - Slice of Vegas',
      'B1-110 - Flip Flop Shops',
      'B2-120 - Slice of Vegas',
      'B1-128 - Ri Ra Irish Pub',
      'B1-109B - The Art of Shaving',
      'B1-122 - Optica',
      'B1-106 - Fashion 101',
      'B2-121A - Burger Bar',
      'B1-200A - RM Seafood',
      'B2-114 - Chapel Hats',
      'B1-124 - AKA',
      'B1-117 - Swarovski',
      'B8 - Luxor Entrance',
      'B1-105 - The Art of Music',
      'B1-104 - ANGL',
      'B1-127B - Teno',
      'B1-201B - Yogurt In',
      'B1-107 - Nora Blue',
      'B1-115 - Lush Fresh Homemade Cosmetics',
      'B1-116 - Shoe Obsession',
      'B1-109A - Cariloha',
      'B1-129 - Guinness Store',
      'B1-103 - Tumi',
      'B1-121A - Burger Bar',
      'B1-101 - Minus5 Ice Lounge',
      'B2-101 - Lodge Bar',
      'B1-133 - L\'Core Luxury Cosmetics',
      'B1-127A - The Jewelers of Las Vegas',
      'B1-119 - Fat Tuesday',
      'B1-108 - Elton\'s',
      'B1-130 - Ron Jon Surf Shop',
      'B1-126 - MVP',
      'B1-132 - Suite 160',
      'B1-121B - Hussongs Cantina',
      'B1-112 - Walk In Salon',
      'B1-134 - RX Boiler Room',
      'B1-125 - Nike Golf',
      'B1-200B - 1923 Bourbon and Burlesque',
      'B1-201A - Starbucks'
    ],

    corridors:
    ['B10 - Corridor',
      'B11 - Corridor',
      'B12 - Corridor',
      'B13 - Corridor',
      'B14 - Corridor',
      'B15 - Corridor',
      'B16 - Corridor',
      'B17 - Corridor',
      'B18 - Corridor'
    ],

    entrances:
    ['B1 - Mandalay Bay Entrance',
      'B2 - Mandalay Bay Entrance',
      'B3 - Mandalay Bay Entrance',
      'B4 - Starbucks Casino Entrance',
      'B5 - Parking Entrance',
      'B6 - Parking Entrance',
      'B7 - Parking Entrance',
      'B9 - Luxor Entrance'
    ],

    otherAreas:
    [// "Mandalay Bay 3" is of type 'zone'
      'Center Court 1',
      'Center Court 2',
      'Center Court 3',
      'Luxor 1',
      'Luxor 2',
      'Luxor 3',
      'Mandalay Bay 1',
      'Mandalay Bay 2',
      'Mandalay Bay 3',
      'Mandalay Bay 4'
    ],

    metrics: {
      csv: {
        perimeter: ['Traffic','Sales','Conversion','Transactions','UPT','ATS','AUR','SPS'],
        visitorBehavior:
        [
          'Visitor behavior traffic',
          'Gross shopping hours',
          'Dwell Time',
          'Opportunity',
          'Draw rate',
          'Abandonment rate'
        ]
      },
      csvTranslationKeys: {
        perimeter: ['kpis.kpiTitle.traffic'],
        visitorBehavior:
        [
            ['csvExportView.VISITORBEHAVIOR', 'kpis.shortKpiTitles.tenant_traffic'],
          'kpis.kpiTitle.gsh',
          'kpis.shortKpiTitles.tenant_dwell_time',
          'kpis.kpiTitle.opportunity',
          'kpis.kpiTitle.draw_rate',
          'kpis.kpiTitle.abandonment_rate'
        ]
      },
      pdfView: {
        trafficTab:
        ['Traffic',
          'Entrance summary',
          'Entrance contribution',
          'Power hours - Average Traffic',
          'Daily averages - Traffic'
        ],

        visitorBehaviorTab:
        ['Visitor behavior traffic',
          'Visiting frequency',
          'Gross shopping hours',
          'Dwell Time',
          'Opportunity',
          'Draw rate',
          'Shoppers vs others'
        ],

        areaLevelVisitorBehaviorTab:
        ['Visitor behavior traffic',
          'Visiting frequency',
          'Gross shopping hours',
          'Dwell Time',
          'Opportunity',
          'Draw rate',
          'Abandonment rate'
        ],

        usageOfAreasTab:
        ['Traffic distribution',
          'First locations to visit',
          'One and done'
        ],

        areaLevelUsageOfAreasTab:
        ['Correlation heat map',
          'Locations visited after',
          'Locations visited before'
        ]
      }
    }
  }
};
