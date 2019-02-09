//===============================================================================================================//
// Tasks:                                                                                                        //
// -------------                                                                                                 //
// 1) 'import-translations' : to read csv and xlsx files present in the working directory  (languages folder     //
//     in this case) and create json files from them. Must have base language json file present                  //
//     in the folder. base language here is en_US. xlsx or csv files should have file names                      //
//     as per language code eg pl_PL.csv , fr_FR.xlsx and so on...                                               //
// 2) 'export-translations' : create csv files from the exisiting json files present under languages folder.     //
//     if json files aren't present then dump the relevant languages' csv or xlsx files in the languages folder  //
//     and follow the instructions for task 'translate'.                                                         //
// 3) 'clean-imports' : clean up any csv and/or excel files after the imports.                                   //
//===============================================================================================================//

'use strict';

const gulp = require('gulp');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const path = require('path');
const fs = require('fs');
const xlsxReader = require('node_spreadsheet');
const gutil = require('gulp-util');
const del = require('del');
const workingDirectory = 'src/l10n/languages/';
const baseLanguage = 'en_US';
const baseFile = baseLanguage + '.json';
const filesToExclude = ['config.json'];
const allowedExportExtensions = 'xlsx, csv';
const csvParse = require('csv-parse/lib/sync');

var isGlobalTask;

gulp.task('set-global-flag', function () {
  isGlobalTask = true;
});

gulp.task('create-language-file', function () {
  var files = getFiles(workingDirectory, allowedExportExtensions);
  files.forEach(function (file) {
    processFile(file);
  });
});

gulp.task('clean-imports', function () {
  var typesOfFilesToDelete = [];
  var exportExtensions = allowedExportExtensions.split(',');
  exportExtensions.forEach(function (ext) {
    typesOfFilesToDelete.push(workingDirectory + '*.' + ext.trim());
  });
  del(typesOfFilesToDelete);
});


gulp.task('export-translations', function () {
  var usTransArray;
  var files = getFiles(workingDirectory, 'json');
  files.forEach(function (file) {
    if (!isGlobalTask) {
      gutil.log('Starting \'' + gutil.colors.cyan('processing ' + file + '\'') + '...');
    }
    if (typeof usTransArray === 'undefined') {
      var usFileJsonContents;
      try {
        usFileJsonContents = JSON.parse(fs.readFileSync(workingDirectory + baseFile, 'utf8'));
      } catch (error) {
        translationJsonParseError(error, baseFile);
      }
      usTransArray = convertTreeToList(usFileJsonContents);
    }
    var fileExtension = path.extname(file);
    var csvFileName = file.replace(fileExtension, '');
    var csvRows = ['Translation Key, ' + baseLanguage + ' TranslationText'];
    var foreignTransObj;
    var isForeign = csvFileName !== baseLanguage;
    if (isForeign) {
      csvRows = ['Translation Key, ' + baseLanguage + ' Translation Text, ' + csvFileName + ' Translation Text, ' + ' Needs Translation'];
      var fileJsonContents;
      try {
        fileJsonContents = JSON.parse(fs.readFileSync(workingDirectory + file, 'utf8'));
      } catch (error) {
        translationJsonParseError(error, file);
      }
      foreignTransObj = convertTreeToList(fileJsonContents);
    }

    var output = generateCsv(csvRows, usTransArray, foreignTransObj, isForeign, csvFileName);
    fs.writeFileSync(workingDirectory + csvFileName + '.csv', output.join('\r\n'));
    if (!isGlobalTask) {
      gutil.log('Finished \'' + gutil.colors.cyan('processing ' + csvFileName + '.csv' + '\''));
    }
  });
});

function translationJsonParseError(error, file) {
  var errorMsg = 'error while processing translation  ' + file + ' file : ' + error.toString();
  handleError(errorMsg);
}

function handleError(errMsg) {
  gutil.log(gutil.colors.red(errMsg));
  process.exit(1);
}

function processFile(file) {
  if (!isGlobalTask) {
    gutil.log('Starting \'' + gutil.colors.cyan('processing ' + file + '\'') + '...');
  }
  var jsFileContents = fs.readFileSync(workingDirectory + baseFile, 'utf8');
  var fileExtension = path.extname(file);
  var jsonFileName = file.replace(fileExtension, '');
  var output;
  if (fileExtension === '.csv') {

    var fileContent = fs.readFileSync(workingDirectory + file, 'utf8');
    var arrToReplace = csvParse(fileContent);

    output = transformXlsxFile(jsFileContents, arrToReplace, jsonFileName === baseLanguage);
    gulp.src(workingDirectory + baseFile)
      .pipe(replace(jsFileContents, JSON.stringify(output, null, '\t')))
      .pipe(rename(jsonFileName + '.json'))
      .pipe(gulp.dest(workingDirectory, { overwrite: true }));
    if (!isGlobalTask) {
      gutil.log('Finished \'' + gutil.colors.cyan('creating ' + jsonFileName + '.json' + '\''));
    }
  } else {
    xlsxReader.read(workingDirectory + file, function (err, data) {
      if (!err) {
        output = transformXlsxFile(jsFileContents, data, jsonFileName === baseLanguage);
        if (jsFileContents !== output) {
          gulp.src(workingDirectory + baseFile)
            .pipe(replace(jsFileContents, JSON.stringify(output, null, '\t')))
            .pipe(rename(jsonFileName + '.json'))
            .pipe(gulp.dest(workingDirectory, { overwrite: true }));
          if (!isGlobalTask) {
            gutil.log('Finished \'' + gutil.colors.cyan('creating ' + jsonFileName + '.json' + '\''));
          }
        }
      }
    });
  }
}

function getFiles(dir, ext) {
  return fs.readdirSync(dir)
    .filter(function (file) {
      var extensionFound;
      if (ext.indexOf(',') > 0) {
        ext.split(',').forEach(function (extension) {
          if (!extensionFound) {
            extensionFound = path.extname(file) === '.' + extension.trim();
          }
        });
      }
      if ((path.extname(file) === '.' + ext || extensionFound) && !excludeFile(file)) {
        return fs.statSync(path.join(dir, file)).isFile();
      }
    });
}

function excludeFile(file) {
  return filesToExclude.indexOf(file) > -1;
}

function writeIntoCsv(lArray, key, uSvalue, value, needsTranslation) {
  if (typeof value === 'undefined') {
    lArray.push(['\"' + key + '\"' + ',' + '\"' + uSvalue + '\"']);
  } else {
    lArray.push(['\"' + key + '\"' + ',' + '\"' + uSvalue + '\"' + ',' + '\"' + value + '\"' + ',' + '\"' + needsTranslationtext(needsTranslation) + '\"']);
  }
}

function needsTranslationtext(needsTranslation) {
  if (needsTranslation) {
    return 'Needs Translation';
  }
  return '';
}

function generateCsv(csvRows, usArray, foreignArray, isForeign, languageCode) {
  for (var property in usArray) {
    if (usArray.hasOwnProperty(property)) {
      var foreignTrans = getForeignTranslation(isForeign, usArray, foreignArray, property, languageCode);
      writeIntoCsv(csvRows, property, usArray[property], foreignTrans.value, foreignTrans.needsTranslation);
    }
  }
  return csvRows;
}

function getForeignTranslation(isForeign, usArray, foreignArray, property, languageCode) {
  if (!isForeign) {
    return {
      value: undefined,
      needsTranslation: false
    };
  }
  if (typeof foreignArray !== 'undefined' &&
    typeof foreignArray[property] !== 'undefined' &&
    foreignArray[property] !== '') {
    return {
      value: foreignArray[property],
      needsTranslation: foreignArray[property] === usArray[property] && languageCode !== 'en_GB'
    };
  }
  return {
    value: usArray[property],
    needsTranslation: true
  };
}

function convertTreeToList(data) {
  var result = {};
  function recurse(cur, prop) {
    if (Object(cur) !== cur) {
      result[prop] = cur;
    } else if (Array.isArray(cur)) {
      for (var i = 0, l = cur.length; i < l; i++) {
        recurse(cur[i], prop + '[' + i + ']');
      }
      if (l === 0) {
        result[prop] = [];
      }
    } else {
      var isEmpty = true;
      for (var p in cur) {
        isEmpty = false;
        recurse(cur[p], prop ? prop + '.' + p : p);
      }
      if (isEmpty && prop) {
        result[prop] = {};
      }
    }
  }
  recurse(data, '');
  return result;
}

function transformXlsxFile(jsContents, translations, isOriginal) {
  var jsContentsJson = JSON.parse(jsContents);

  translations.forEach(function (translation) { 
    var transArray;

    if(translation.length > 1) {
      transArray = translation;
    } else {
      transArray = translation[0].split(',');
    }

    var transKey = transArray[0];
    
    var transUS = transArray[1];
    if (isOriginal) {
      setAttribute(jsContentsJson, 'jsContentsJson.' + transKey, transUS);
    } else {
      var transForeign = transArray[2];

      // Sometimes we'll get values in the "needs translation column"
      if(transArray.length >= 4) {
        var otherTransForeign = transArray[3];

        if(typeof otherTransForeign === 'string' && otherTransForeign.length > 0 && otherTransForeign !== 'Needs Translation') {
          transForeign = otherTransForeign;
        }
      }

      if (transKey.indexOf('.') > 0) {
        setAttribute(jsContentsJson, 'jsContentsJson.' + transKey, transForeign);
      }
    }
  });
  return jsContentsJson;
}

function setAttribute(obj, key, value) { 
  var i = 1,
    attrs = key.split('.'),
    max = attrs.length - 1;

  for (; i < max; i++) {
    var attr = attrs[i];
    obj = obj[attr];
  }

  if (typeof obj !== 'undefined') {
    obj[attrs[max]] = value;
  }
}

gulp.task('import-translations', ['create-language-file', 'clean-imports']);

gulp.task('translate', ['set-global-flag', 'export-translations', 'import-translations']);
