var vm = require('vm');
var fs = require('fs');
/**
 * Helper for unit testing:
 * - load module with mocked dependencies
 * - allow accessing private state of the module
 *
 * @param {string} moduleFilePath Absolute path to module (file to load)
 * @param {Object=} context Hash of mocked dependencies
 */
exports.resolveFileWithNewContext = function(moduleFilePath, context) {
  vm.runInNewContext(fs.readFileSync(moduleFilePath), context);
  return context;
};
