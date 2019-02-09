(function() {
'use strict';

angular.module('shopperTrak').factory('fsHelper', [fsHelper]);

 function fsHelper() {
  var configs = {};
  var fileExtensions = {};
  configs.languages = 'l10n/languages/config.json';
  fileExtensions.languages = 'js';

  return {

    configs: configs,
    allowedExtensions: fileExtensions,

    getListOfAvailableLanguages: function() {
    var languages = $.getJSON(configs.languages, function(languagesConfig) {
        languagesConfig.languages.forEach(function (language){
          language.LanguageFile = language.Code + '.' + fileExtensions.languages;
        });
    });
    return languages;
    }
  };
}
})();
