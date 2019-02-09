/** @file eslint configuration for STAn application in ES5 browser environment. */
module.exports = {
  "env": {
    // because *.spec.js files are in scope:
    "jasmine": true,
    "node": false,
    "browser": true,
    "es6": true
  },
  "globals": {
    // Includes browser globals like FileReader, Blob, etc..:
    "browser": true,
    "$": true,
    "jQuery": true,
    "angular": true,
    "moment": true,
    "_": true,
    "L": true,
    "Chartist": true,
    "saveAs": true,
    "Highcharts": true,
    "module": true,
    "inject": true
  },
  "plugins": [
    // Looks up 'browserslist' file to see if your code is supported:
    "compat"
  ],
  "rules": {
    "no-bitwise": 2,
    "camelcase": 0,
    // TODO: Cleanup these errors and enforce:
    "curly": 0,
    "eqeqeq": 2,
    "wrap-iife": [ 2, "any" ],
    // TODO: Enforce proper code formatting:
    "indent": [ 0, 2, { "SwitchCase": 1 }],
    "no-use-before-define": [ 2, { "functions": false }],
    // TODO: Investigate whether this should be enforced:
    "new-cap": 0,
    "no-caller": 2,
    "quotes": [ 2, "single" ],
    "no-undef": 2,
    "no-unused-vars": 2,
    // TODO: 'use-strict' should be refactored and enforced:
    "strict": [ 0, "function"],
    // so we can assign 'this' in our controllers :
    "no-invalid-this": 0,
    // Looks up 'browserslist' file to see if your code is supported:
    "compat/compat": 2
  }
}
