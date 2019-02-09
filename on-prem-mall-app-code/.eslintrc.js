/** @file eslint configuration for STAn Application Node/gulp/build tasks */
module.exports = {
  "env": {
    "es6": true,
    "node": true
  },
  "globals": {
    "agGrid": false
  },
  "parserOptions": {
    "ecmaFeatures": {
      "experimentalObjectRestSpread": true
    }
  },
  "rules": {
    "prefer-const": ["error", {
      "destructuring": "any",
      "ignoreReadBeforeAssign": false
    }],
    "no-const-assign": "error",
    "no-var": "error",
    "prefer-template": "error",
    "template-curly-spacing": ["error", "never"],
    "space-before-function-paren": ["error", "always"],
    "space-before-blocks": "error",
    "prefer-arrow-callback": "error",
    "arrow-spacing": ["error", { "before": true, "after": true }],
    "arrow-parens": ["error", "as-needed"],
    "arrow-body-style": ["error", "as-needed"],
    "no-dupe-class-members": "error",
    "eqeqeq": ["error", "always"],
    "no-nested-ternary": "error",
    "no-unneeded-ternary": "error",
    "nonblock-statement-body-position": ["error", "beside"],
    "brace-style": ["error", "1tbs"],
    "keyword-spacing": ["error", { "before": true }],
    "space-infix-ops": "error",
    "eol-last": ["error", "always"],
    "max-len": ["error", { "code": 140 }],
    "comma-style": ["error", "last"],
    "semi": ["error", "always"],
    "no-extra-semi": "error",
    "id-length": ["error", { "exceptions": ["i"] }], 
    "camelcase": "error",
    "new-cap": "error",
    "comma-spacing": ["error", { "before": false, "after": true }],
    "no-console": ["error", { "allow": ["warn", "error", "info"] }],
    "no-constant-condition": "error",
    "no-debugger": "error",
    "no-dupe-args": "error",
    "no-dupe-keys": "error",
    "no-duplicate-case": "error",
    "no-empty": "error",
    "no-ex-assign": "error",
    "no-extra-boolean-cast": "error",
    "no-extra-parens": "error",
    "no-inner-declarations": "error",
    "no-irregular-whitespace": "error",
    "no-sparse-arrays": "error",
    "no-template-curly-in-string": "error",
    "no-unreachable": "error",
    "no-unsafe-negation": "error",
    "valid-typeof": "error",
    "no-alert": "error",
    "no-else-return": "error",
    "no-implicit-coercion": "error",
    "no-magic-numbers": ["error", { "ignoreArrayIndexes": true, "ignore": [-1, 0, 1] }],
    "quotes": [
      "error",
      "single"
    ],
    "indent": [
      "error",
      2
    ]
  }
}
