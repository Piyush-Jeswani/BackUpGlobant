ShopperTrak Analytics
======================

## Development requirements

- NodeJs version 8.11.1
- bower, globally installed
- gulp, globally installed

**To install global dependencies run**

    $ npm install -g gulp bower
    
**To init project run**

    $ npm install
    $ bower install

**To serve using a localhost instance of RDC API**

    $ gulp config:local        # only needed once
    $ gulp serve               # or gulp serve:dist

**To serve locally with staging API**

    $ gulp config:development  # only needed once
    $ gulp serve               # or gulp serve:dist

**To build**

    $ gulp config # Uses production configuration by default
    $ gulp

**To run end-to-end tests**

    $ gulp config:development  # only needed once
    $ gulp build               # builds the code
    $ gulp protractor          # starts the app on port 3000, then runs tests in chrome browser against localhost:3000

`gulp protractor` can take a long time if running all tests.  [See Confluence for more information on the end-to-end tests
](http://confluence.rctanalytics.com:8080/display/LFR/Automated+End-to-end+Tests)


## Unit tests

**To run unit tests**

    $ gulp config:development  # only needed once
    $ gulp test:watch          # starts a watcher with PhantomJS
    $ gulp test-chrome:watch   # starts a watcher in Chrome

The unit tests on the build server run using `gulp test` - PhantomJS.

Locally, you can run the unit tests using PhantomJS or Chrome Headless. You may find that Chrome Headless is quicker and less memory intensive.

`gulp test` runs unit tests in PhantomJS once. Can be run locally as well as on the build server.

`gulp test-chrome` runs unit tests in Chrome Headless once. May be quicker and less memory intensive than Phantom. Cannot currently be run on the build server.

If you use Visual Studio Code as your IDE and want to attach a debugger to Karma follow the steps below. 

Configure debugger https://code.visualstudio.com/docs/editor/debugging

{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "attach",
      "name": "Attach Karma Chrome",
      "address": "localhost",
      "port": 9333,
      "sourceMaps": false,
      "pathMapping": {
        "/": "${workspaceRoot}",
        "/base/": "${workspaceRoot}/"
      }
    }
  ]
}

Make sure you are in the root folder of the app. In a command line run `$ gulp test-chrome:watch`. This should open a new instance of Chrome and run unit tests as normal. To make sure the debugger is attached, set a breakpoint in a `*.spec.js` file and start the debugger. If the breakpoint doesn't get hit, try refreshing Chrome instance opened earlier. Once working you will be able to step through the unit test code in VS Code.

## Building in distribution mode


    $ gulp clean           # Cleans up any previously built code
    $ gulp config:staging  # only needed once
    $ gulp build           # Bundles and minifies the code, outputs to the /dist folder
    $ gulp serve:dist      # Serves the bundled and minified version of the app


## Platform specific notes

### MacOS
** for mac  you should change the permissions to your local npm install ( perhaps /usr/local/lib, run npm list -g to find out)
   $ npm list -g
   /usr/local/lib
   ├─┬ bower@1.4.1
   │ ├── abbrev@1.0.5sudo chown -R $USER /usr/local/lib
   ...
   $ sudo chown -R $USER /usr/local/lib
   then put your password

### Windows

Before trying any of the following steps, you should install nodeJs 8.11.1 and try to clone and run the app. The following steps should be undertaken if you run into problems.

We had some problems installing this on Windows 10. Hopefully this includes all steps to get it to work.

You need of course [Node.js](https://nodejs.org/en/). Make sure you also have the following installed:

* [Python 2.7.10](https://www.python.org/downloads/release/python-2710/)
* [Microsoft Build Tools 2013](https://www.microsoft.com/en-us/download/details.aspx?id=40760)

Restart may be necessary.

Make sure that you have a PYTHON environment variable (`My Computer > Properties > Advanced system settings > Environment Variables`) and it is set to `C:\Python27\python.exe` - not to a folder.

Also make sure your PATH variable value is in this order (*npm* needs to be before *nodejs*):   
`C:\Program Files (x86)\Git\bin;C:\Users\USERNAME\AppData\Roaming\npm;C:\Program Files\nodejs`

You should also run the following command after nodejs has been installed:
`npm config set msvs_version 2012 --global`

Remove during install the following from *package.json* found in your app root folder. Otherwise this will cause problems on Windows. Please, re-add it after install.

```
  ,
  "scripts": {
    "start": "node server",
    "postinstall": "./node_modules/bower/bin/bower install && gulp build"
  }
```

Do not use the normal Command prompt during install. Use:   
`Start Menu > Programs > Node.js > Node.js command prompt`

During package restoration, you may hit problems with the git protocol. To get around this, run the following command to force the use of SSL instead:

    git config --global url."https://".insteadOf git://

Then follow the install instruction on top of this page.

If you run into an error like this on install:

    unable to create file servers/WebApi2... (filename too long)

Do the following:

1.  Install cygwin.  Include the git installation under All > Devel > git
2.  Include the path for cygwin's bin folder in your PATH environment variable, before any other git paths
3.  re-run npm install
 


## Adding icons to the icon font

1.  Prepare the SVG files according to the
    [gulp-iconfont instructions](https://www.npmjs.com/package/gulp-iconfont)
2.  Put the SVG files to `src/assets/icons` folder and prepend the filenames
    with unicode character codes
3.  Add styles for the icons to `src/components/common/_icons.scss`



###############################################################################################################
Translations Gulp Jobs:
###############################################################################################################

** 'import-translations' : to read csv and xlsx files present in the working directory (languages folder 
     in this case) and create json files from them. Must have base language json file present
     in the folder. base language here is en_US. xlsx or csv files should have file names
     as per language code eg 'pl_PL.csv' , 'fr_FR.xlsx' and so on...

** 'export-translations' : create csv files from the exisiting json files present under languages folder.
     if json files aren't present then dump the relevant languages' csv or xlsx files in the languages folder
     and follow the instructions for task 'translate'.

** 'translate' : first runs the 'export-translations' job first and then the 'import-translations' job. The 
    'export-translations' job, as described above exports csv files from the 'locale' .json (eg fr_FR.json etc)
    files and then runs the 'import-translations' job to import csv files into json files. purpose of running export 
    and import jobs back to back is to keep non en_US translations in sync with the en_US translations. If the 
    newly added translations in en_US are missing from the foreign locale file then those translations will be 
    added to theforeign locale file with default traslation as english.This job is made part of the current build 
    so that the new translations are picked automatically.


     To Add a new transkey:
     ----------------------

     1) Manually : Add a key to en_US.json under a relevent section and then add the same key to other 
     locale files with translations

     2) Using gulp jobs: a) Add key to en_US.json first and then run 'export-translations' gulp job this will generate one 
     csv file per locale and in the csv files translation for the new key will show blank. b) write a value for the transkey 
     in csv when you have it. c) now run the 'import-translations' gulp job this is a reverse of 'export-translations' job and this job will generate 
     json files from the csv files your new translation will now show up in the json file. DO NOT change order of columns 
     or remove any colmn or remove column header in any of the csv as then export  to JSON of the translations will 
     stop working for that csv file.

     When you add a new locale: 
     1) An entry goes into the 'l10n/languages/config.json' and a pair of name and key as follows: 
     "name" : "English (UK)" <-----some meaningful name,
     "code" : "en_GB" <--------locale code
     
     2) If you are adding a new locale to the application and if you do have a csv with translations for this new locale 
     and if the csv is as per the format as it was generated by the 'export-translations' file then do run the 'import-translations' 
     gulp job and this gulp job should generate a json file for the new locale. remember the csv file the new locale should
     be named after the locale code for the locale. Example if the new locale is Japanese with locale code jp-JP then the 
     csv file should be called jp_JP.csv and after running the 'translate' gulp job the json file will be created 
     as jp_JP.json'    


###############################################################################################################
Further Documentation
###############################################################################################################

[Our processes](https://shoppertrak.atlassian.net/wiki/display/RA/Our+Process)

[Best Practices](https://shoppertrak.atlassian.net/wiki/display/LFR/Best+Practices)  

[Business Requirements](https://shoppertrak.atlassian.net/wiki/display/LFR/Business+Requirements)

[Jira (all work tickets)](https://shoppertrak.atlassian.net/projects/SA)
