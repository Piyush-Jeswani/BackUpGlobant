(function() {
  'use strict';

  //ToDo: Add transkeys
  angular.module('shopperTrak.constants')
  .constant('currencies', {
    'AFN': '؋',         // Afghani
    'DZD': 'د.ج',       // Algerian Dinar
    'ARS': '$',         // Argentine Peso
    'AMD': '&#1423;',   // Armenian Dram
    'AWG': 'ƒ',         // Aruban Florin
    'AUD': '$',         // Australian Dollar
    'AZN': 'ман',       // Azerbaijani Manat
    'BSD': '$',         // Bahamian Dollar
    'BHD': 'BD',        // Bahraini Dinar
    'THB': '฿',         // Baht
    'PAB': 'B/.',       // Balboa
    'BBD': '$',         // Barbados Dollar
    'BYR': 'p.',        // Belarusian Ruble
    'BZD': 'BZ$',       // Belize Dollar
    'BMD': '$',         // Bermudian Dollar
    'VEF': 'Bs',        // Bolivar
    'BOB': '$b',        // Boliviano
    'BRL': 'R$',        // Brazilian Real
    'BND': '$',         // Brunei Dollar
    'BGN': 'лв',        // Bulgarian Lev
    'BIF': 'BIF',       // Burundian Franc
    'CVE': '$',         // Cabo Verde Escudo
    'CAD': '$',         // Canadian Dollar
    'KYD': '$',         // Cayman Islands Dollar
    'XOF': 'CFA',       // CFA Franc BCEAO
    'XAF': 'FCFA',      // CFA Franc BEAC
    'XPF': 'F',         // CFP Franc
    'CLP': '$',         // Chilean Peso
    'COP': '$',         // Colombian Peso
    'KMF': 'CF',        // Comoro Franc
    'CDF': 'FC',        // Congolese Franc
    'BAM': 'KM',        // Convertible Mark
    'NIO': 'C$',        // Cordob Oro
    'CRC': '₡',         // Costa Rican Colon
    'HRK': 'kn',        // Croatian Kuna
    'CUP': '₱',         // Cuban Peso
    'CZK': 'Kč',        // Czech Koruna
    'GMD': 'D',         // Dalasi
    'DKK': 'kr',        // Danish Krone
    'MKD': 'ден',       // Denar
    'DJF': 'Fdj',       // Djibouti Franc
    'STD': 'Db',        // Dobra
    'DOP': 'RD$',       // Dominican Peso
    'VND': '₫',         // Dong
    'XCD': '$',         // East Caribbean Dollar
    'EGP': '£',         // Egyptian Pound
    'SVC': '$',         // El Salvador Colon
    'ETB': 'ብር',       // Ethiopian Birr
    'EUR': '€',         // Euro
    'FKP': '£',         // Falkland Islands Pound
    'FJD': '$',         // Fiji Dollar
    'HUF': 'Ft',        // Forint
    'GHS': 'GH₵',       // Ghan Cedi
    'GIP': '£',         // Gibraltar Pound
    'HTG': 'G',         // Gourde
    'PYG': 'Gs',        // Guarani
    'GNF': 'FG',        // Guinean Franc
    'GYD': '$',         // Guyanese Dollar
    'HKD': '$',         // Hong Kong Dollar
    'UAH': '₴',         // Hryvnia
    'ISK': 'kr',        // Iceland Krona
    'INR': '₹',         // Indian Rupee
    'IRR': '﷼',         // Iranian Rial
    'IQD': 'ع.د',       // Iraqi Dinar
    'JMD': 'J$',        // Jamaican Dollar
    'JOD': 'JOD',       // Jordanian Dinar
    'KES': 'K',         // Kenyan Shilling
    'PGK': 'K',         // Kina
    'LAK': '₭',         // Kip
    'KWD': 'د.ك',       // Kuwaiti Dinar
    'MWK': 'MK',        // Kwacha
    'AOA': 'Kz',        // Kwanza
    'MMK': 'K',         // Kyat
    'GEL': 'ლ',        // Lari
    'LBP': '£',         // Lebanese Pound
    'ALL': 'Lek',       // Lek
    'HNL': 'L',         // Lempira
    'SLL': 'Le',        // Leone
    'LRD': '$',         // Liberian Dollar
    'LYD': 'ل.د',       // Libyan Dinar
    'SZL': 'L',         // Lilangeni
    'LTL': 'Lt',        // Lithuanian Litas
    'LSL': 'L',         // Loti
    'MGA': 'MGA',       // Malagasy riary
    'MYR': 'RM',        // Malaysian Ringgit
    'MUR': '₨',         // Mauritius Rupee
    'MXN': '$',         // Mexican Peso
    'MDL': 'L',         // Moldovan Leu
    'MAD': 'MAD',       // Moroccan Dirham
    'MZN': 'MT',        // Mozambique Metical
    'BOV': '$b',        // Mvdol
    'NGN': '₦',         // Naira
    'ERN': 'ናቕፋ',       // Nakfa
    'NAD': '$',         // Namibian Dollar
    'NPR': '₨',         // Nepalese Rupee
    'ANG': 'ƒ',         // Netherlands Antillean Guilder
    'ILS': '₪',         // New Israeli Sheqel
    'RON': 'lei',       // New Romanian Leu
    'TWD': 'NT$',       // New Taiwan Dollar
    'NZD': '$',         // New Zealand Dollar
    'BTN': 'Nu',        // Ngultrum
    'KPW': '₩',         // North Korean Won
    'NOK': 'kr',        // Norwegian Krone
    'PEN': 'S/.',       // Nuevo Sol
    'MRO': 'UM',        // Ouguiya
    'PKR': '₨',         // Pakistan Rupee
    'MOP': 'MOP$',      // Pataca
    'TOP': 'T$',        // Pa’anga
    'CUC': '$',         // Peso Convertible
    'UYU': '$U',        // Peso Uruguayo
    'PHP': '₱',         // Philippine Peso
    'GBP': '£',         // Pound Sterling
    'BWP': 'P',         // Pula
    'QAR': '﷼',         // Qatari Rial
    'GTQ': 'Q',         // Quetzal
    'ZAR': 'R',         // Rand
    'OMR': '﷼',         // Rial Omani
    'KHR': '៛',         // Riel
    'MVR': 'Rf',        // Rufiyaa
    'IDR': 'Rp',        // Rupiah
    'RUB': 'руб',       // Russian Ruble
    'RWF': 'R₣',        // Rwandan Franc
    'SHP': '£',         // Saint Helena Pound
    'SAR': '﷼',         // Saudi Riyal
    'RSD': 'Дин.',      // Serbian Dinar
    'SCR': '₨',         // Seychelles Rupee
    'SGD': '$',         // Singapore Dollar
    'SBD': '$',         // Solomon Islands Dollar
    'KGS': 'som',       // Som
    'SOS': 'S',         // Somali Shilling
    'TJS': 'S',         // Somoni
    'SSP': '£',         // South Sudanese Pound
    'LKR': '₨',         // Sri Lankan Rupee
    'SDG': 'ج.س.',      // Sudanese Pound
    'SRD': '$',         // Surinam Dollar
    'SEK': 'kr',        // Swedish Krona
    'CHF': 'CHF',       // Swiss Franc
    'SYP': '£',         // Syrian Pound
    'BDT': '৳',         // Taka
    'WST': '$',         // Tala
    'TZS': 'TSh',       // Tanzanian Shilling
    'KZT': '₸',         // Tenge
    'TTD': 'TT$',       // Trinidad and Tobago Dollar
    'MNT': '₮',         // Tugrik
    'TND': 'د.ت',       // Tunisian Dinar
    'TRY': '₺',         // Turkish Lira
    'TMT': 'T',         // Turkmenistan New Manat
    'AED': 'د.إ',       // UAE Dirham
    'UGX': 'USh',       // Ugandan Shilling
    'CLF': 'UF',        // Unidad de Fomento
    'USD': '$',         // US Dollar
    'USN': '$',         // US Dollar (Next day)
    'UZS': 'som',       // Uzbekistan Sum
    'VUV': 'VT',        // Vatu
    'KRW': '₩',         // Won
    'YER': '﷼',         // Yemeni Rial
    'JPY': '¥',         // Yen
    'CNY': '¥',         // Yuan Renminbi
    'ZMW': 'ZMW',       // Zambian Kwacha
    'ZWL': '$',         // Zimbabwe Dollar
    'PLN': 'zł'         // Zloty
  });
})();