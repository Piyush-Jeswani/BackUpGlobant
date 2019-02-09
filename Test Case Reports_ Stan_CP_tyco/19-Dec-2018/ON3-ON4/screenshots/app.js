var app = angular.module('reportingApp', []);

//<editor-fold desc="global helpers">

var isValueAnArray = function (val) {
    return Array.isArray(val);
};

var getSpec = function (str) {
    var describes = str.split('|');
    return describes[describes.length - 1];
};
var checkIfShouldDisplaySpecName = function (prevItem, item) {
    if (!prevItem) {
        item.displaySpecName = true;
    } else if (getSpec(item.description) !== getSpec(prevItem.description)) {
        item.displaySpecName = true;
    }
};

var getParent = function (str) {
    var arr = str.split('|');
    str = "";
    for (var i = arr.length - 2; i > 0; i--) {
        str += arr[i] + " > ";
    }
    return str.slice(0, -3);
};

var getShortDescription = function (str) {
    return str.split('|')[0];
};

var countLogMessages = function (item) {
    if ((!item.logWarnings || !item.logErrors) && item.browserLogs && item.browserLogs.length > 0) {
        item.logWarnings = 0;
        item.logErrors = 0;
        for (var logNumber = 0; logNumber < item.browserLogs.length; logNumber++) {
            var logEntry = item.browserLogs[logNumber];
            if (logEntry.level === 'SEVERE') {
                item.logErrors++;
            }
            if (logEntry.level === 'WARNING') {
                item.logWarnings++;
            }
        }
    }
};

var defaultSortFunction = function sortFunction(a, b) {
    if (a.sessionId < b.sessionId) {
        return -1;
    }
    else if (a.sessionId > b.sessionId) {
        return 1;
    }

    if (a.timestamp < b.timestamp) {
        return -1;
    }
    else if (a.timestamp > b.timestamp) {
        return 1;
    }

    return 0;
};


//</editor-fold>

app.controller('ScreenshotReportController', function ($scope, $http) {
    var that = this;
    var clientDefaults = {};

    $scope.searchSettings = Object.assign({
        description: '',
        allselected: true,
        passed: true,
        failed: true,
        pending: true,
        withLog: true
    }, clientDefaults.searchSettings || {}); // enable customisation of search settings on first page hit

    var initialColumnSettings = clientDefaults.columnSettings; // enable customisation of visible columns on first page hit
    if (initialColumnSettings) {
        if (initialColumnSettings.displayTime !== undefined) {
            // initial settings have be inverted because the html bindings are inverted (e.g. !ctrl.displayTime)
            this.displayTime = !initialColumnSettings.displayTime;
        }
        if (initialColumnSettings.displayBrowser !== undefined) {
            this.displayBrowser = !initialColumnSettings.displayBrowser; // same as above
        }
        if (initialColumnSettings.displaySessionId !== undefined) {
            this.displaySessionId = !initialColumnSettings.displaySessionId; // same as above
        }
        if (initialColumnSettings.displayOS !== undefined) {
            this.displayOS = !initialColumnSettings.displayOS; // same as above
        }
        if (initialColumnSettings.inlineScreenshots !== undefined) {
            this.inlineScreenshots = initialColumnSettings.inlineScreenshots; // this setting does not have to be inverted
        } else {
            this.inlineScreenshots = false;
        }
    }

    this.showSmartStackTraceHighlight = true;

    this.chooseAllTypes = function () {
        var value = true;
        $scope.searchSettings.allselected = !$scope.searchSettings.allselected;
        if (!$scope.searchSettings.allselected) {
            value = false;
        }

        $scope.searchSettings.passed = value;
        $scope.searchSettings.failed = value;
        $scope.searchSettings.pending = value;
        $scope.searchSettings.withLog = value;
    };

    this.isValueAnArray = function (val) {
        return isValueAnArray(val);
    };

    this.getParent = function (str) {
        return getParent(str);
    };

    this.getSpec = function (str) {
        return getSpec(str);
    };

    this.getShortDescription = function (str) {
        return getShortDescription(str);
    };

    this.convertTimestamp = function (timestamp) {
        var d = new Date(timestamp),
            yyyy = d.getFullYear(),
            mm = ('0' + (d.getMonth() + 1)).slice(-2),
            dd = ('0' + d.getDate()).slice(-2),
            hh = d.getHours(),
            h = hh,
            min = ('0' + d.getMinutes()).slice(-2),
            ampm = 'AM',
            time;

        if (hh > 12) {
            h = hh - 12;
            ampm = 'PM';
        } else if (hh === 12) {
            h = 12;
            ampm = 'PM';
        } else if (hh === 0) {
            h = 12;
        }

        // ie: 2013-02-18, 8:35 AM
        time = yyyy + '-' + mm + '-' + dd + ', ' + h + ':' + min + ' ' + ampm;

        return time;
    };


    this.round = function (number, roundVal) {
        return (parseFloat(number) / 1000).toFixed(roundVal);
    };


    this.passCount = function () {
        var passCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (result.passed) {
                passCount++;
            }
        }
        return passCount;
    };


    this.pendingCount = function () {
        var pendingCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (result.pending) {
                pendingCount++;
            }
        }
        return pendingCount;
    };


    this.failCount = function () {
        var failCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (!result.passed && !result.pending) {
                failCount++;
            }
        }
        return failCount;
    };

    this.passPerc = function () {
        return (this.passCount() / this.totalCount()) * 100;
    };
    this.pendingPerc = function () {
        return (this.pendingCount() / this.totalCount()) * 100;
    };
    this.failPerc = function () {
        return (this.failCount() / this.totalCount()) * 100;
    };
    this.totalCount = function () {
        return this.passCount() + this.failCount() + this.pendingCount();
    };

    this.applySmartHighlight = function (line) {
        if (this.showSmartStackTraceHighlight) {
            if (line.indexOf('node_modules') > -1) {
                return 'greyout';
            }
            if (line.indexOf('  at ') === -1) {
                return '';
            }

            return 'highlight';
        }
        return true;
    };

    var results = [
    {
        "description": "1 Custom Dashboard test ON-3|ON-169 Custom Dashboard",
        "passed": false,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 856,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": [
            "Expected 'MyQCTestDashboard' to be undefined."
        ],
        "trace": [
            "Error: Failed expectation\n    at E:\\Scripbox\\PushOnPrem\\on-prem-mall-app\\test\\e2e\\Stan\\components\\HomePageComponents.js:209:20\n    at elementArrayFinder_.then (E:\\Scripbox\\PushOnPrem\\on-prem-mall-app\\test\\node_modules\\protractor\\built\\element.js:804:32)\n    at ManagedPromise.invokeCallback_ (E:\\Scripbox\\PushOnPrem\\on-prem-mall-app\\test\\node_modules\\selenium-webdriver\\lib\\promise.js:1376:14)\n    at TaskQueue.execute_ (E:\\Scripbox\\PushOnPrem\\on-prem-mall-app\\test\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (E:\\Scripbox\\PushOnPrem\\on-prem-mall-app\\test\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at asyncRun (E:\\Scripbox\\PushOnPrem\\on-prem-mall-app\\test\\node_modules\\selenium-webdriver\\lib\\promise.js:2927:27)\n    at E:\\Scripbox\\PushOnPrem\\on-prem-mall-app\\test\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7\n    at <anonymous>\n    at process._tickCallback (internal/process/next_tick.js:188:7)"
        ],
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "https://stats.g.doubleclick.net/r/collect?v=1&aip=1&t=dc&_r=3&tid=UA-40965930-5&cid=2015513875.1545212488&jid=759483850&_gid=503607988.1545212488&gjid=1967637252&_v=j72&z=1403834969 - Failed to load resource: the server responded with a status of 403 (Forbidden)",
                "timestamp": 1545212489376,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://ugl-onprem11.rctanalytics.com/scripts/vendor-f4b84639ea.js 39:721 \"You are using the ngTouch module. \\nAngularJS Material already has mobile click, tap, and swipe support... \\nngTouch is not supported with AngularJS Material!\"",
                "timestamp": 1545212489771,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://ugl-onprem11.rctanalytics.com/#/ - This page includes a password or credit card input in a non-secure context. A warning has been added to the URL bar. For more information, see https://goo.gl/zmWq3m.",
                "timestamp": 1545212491237,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://ugl-onprem11.rctanalytics.com/api/v1/organizations - Failed to load resource: the server responded with a status of 401 (Unauthorized)",
                "timestamp": 1545212491237,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://ugl-onprem11.rctanalytics.com/scripts/app-161e74909b.js 26:21173 \"error\" Object",
                "timestamp": 1545212523965,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://ugl-onprem11.rctanalytics.com/scripts/app-161e74909b.js 5:29535 \"http://ugl-onprem11.rctanalytics.com/api/v1/kpis/traffic/benchmark-performance - endpoint deprecated\"",
                "timestamp": 1545212524018,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://ugl-onprem11.rctanalytics.com/scripts/app-161e74909b.js 5:29535 \"http://ugl-onprem11.rctanalytics.com/api/v1/kpis/traffic/benchmark-performance - endpoint deprecated\"",
                "timestamp": 1545212524279,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://stats.g.doubleclick.net/r/collect?v=1&aip=1&t=dc&_r=3&tid=UA-40965930-5&cid=2015513875.1545212488&jid=158189278&uid=547cd0cf8a0ebf2856c1ad50&_gid=503607988.1545212488&gjid=984119067&_v=j72&z=222124195 - Failed to load resource: the server responded with a status of 403 (Forbidden)",
                "timestamp": 1545212614882,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://ugl-onprem11.rctanalytics.com/scripts/app-161e74909b.js 16:13875 \"User cancelled\"",
                "timestamp": 1545212648932,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://ugl-onprem11.rctanalytics.com/scripts/app-161e74909b.js 16:13875 \"User cancelled\"",
                "timestamp": 1545212648932,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://ugl-onprem11.rctanalytics.com/scripts/app-161e74909b.js 16:12018 \"User cancelled\"",
                "timestamp": 1545212648933,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://ugl-onprem11.rctanalytics.com/scripts/app-161e74909b.js 16:12018 \"User cancelled\"",
                "timestamp": 1545212648933,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://stats.g.doubleclick.net/r/collect?v=1&aip=1&t=dc&_r=3&tid=UA-40965930-5&cid=2015513875.1545212488&jid=2049944294&uid=547cd0cf8a0ebf2856c1ad50&_gid=503607988.1545212488&gjid=1924330243&_v=j72&z=17059469 - Failed to load resource: the server responded with a status of 403 (Forbidden)",
                "timestamp": 1545212693680,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://ugl-onprem11.rctanalytics.com/scripts/app-161e74909b.js 5:29535 \"http://ugl-onprem11.rctanalytics.com/api/v1/kpis/traffic/entrances - endpoint deprecated\"",
                "timestamp": 1545212742870,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://ugl-onprem11.rctanalytics.com/scripts/app-161e74909b.js 5:29535 \"http://ugl-onprem11.rctanalytics.com/api/v1/kpis/traffic/entrances - endpoint deprecated\"",
                "timestamp": 1545212742871,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://ugl-onprem11.rctanalytics.com/scripts/app-161e74909b.js 5:29535 \"http://ugl-onprem11.rctanalytics.com/api/v1/kpis/traffic/entrances - endpoint deprecated\"",
                "timestamp": 1545212742872,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://ugl-onprem11.rctanalytics.com/api/v1/kpis/traffic/entrances?groupBy=aggregate&operatingHours=true&orgId=1000006255&reportEndDate=2018-11-03T23:59:59.999Z&reportStartDate=2018-10-07T00:00:00.000Z&siteId=1080049074&zoneId=1000429224 - Failed to load resource: the server responded with a status of 500 (Internal Server Error)",
                "timestamp": 1545212743484,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://ugl-onprem11.rctanalytics.com/api/v1/kpis/traffic/entrances?groupBy=aggregate&operatingHours=true&orgId=1000006255&reportEndDate=2018-12-01T23:59:59.999Z&reportStartDate=2018-11-04T00:00:00.000Z&siteId=1080049074&zoneId=1000429224 - Failed to load resource: the server responded with a status of 500 (Internal Server Error)",
                "timestamp": 1545212743484,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://ugl-onprem11.rctanalytics.com/api/v1/kpis/traffic/entrances?groupBy=aggregate&operatingHours=true&orgId=1000006255&reportEndDate=2017-11-30T23:59:59.999Z&reportStartDate=2017-11-01T00:00:00.000Z&siteId=1080049074&zoneId=1000429224 - Failed to load resource: the server responded with a status of 500 (Internal Server Error)",
                "timestamp": 1545212743484,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://ugl-onprem11.rctanalytics.com/api/v1/kpis/organizations/1000006255/sites/1080036060?add_aggregated_data=true&compare1EndDate=2018-11-03T23:59:59.999Z&compare1StartDate=2018-10-07T00:00:00.000Z&compare2EndDate=2017-11-30T23:59:59.999Z&compare2StartDate=2017-11-01T00:00:00.000Z&groupBy=day&includeReturning=false&includeUnique=false&kpi=ats&kpi=aur&kpi=conversion&kpi=sales&kpi=sps&kpi=traffic&kpi=transactions&kpi=upt&operatingHours=true&reportEndDate=2018-12-01T23:59:59.999Z&reportStartDate=2018-11-04T00:00:00.000Z - Failed to load resource: the server responded with a status of 500 (Internal Server Error)",
                "timestamp": 1545212743815,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://ugl-onprem11.rctanalytics.com/scripts/app-161e74909b.js 36:20230 Object",
                "timestamp": 1545212743815,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://ugl-onprem11.rctanalytics.com/api/v1/kpis/organizations/1000006255/sites/1080036060?add_aggregated_data=true&compare1EndDate=2018-11-03T23:59:59.999Z&compare1StartDate=2018-10-07T00:00:00.000Z&compare2EndDate=2017-11-30T23:59:59.999Z&compare2StartDate=2017-11-01T00:00:00.000Z&groupBy=day&includeReturning=false&includeUnique=false&kpi=ats&kpi=aur&kpi=conversion&kpi=sales&kpi=sps&kpi=traffic&kpi=transactions&kpi=upt&operatingHours=true&reportEndDate=2018-12-01T23:59:59.999Z&reportStartDate=2018-11-04T00:00:00.000Z - Failed to load resource: the server responded with a status of 500 (Internal Server Error)",
                "timestamp": 1545212746208,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://ugl-onprem11.rctanalytics.com/scripts/app-161e74909b.js 36:20230 Object",
                "timestamp": 1545212746209,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://ugl-onprem11.rctanalytics.com/scripts/app-161e74909b.js 5:29535 \"http://ugl-onprem11.rctanalytics.com/api/v1/kpis/traffic/entrances - endpoint deprecated\"",
                "timestamp": 1545212750350,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://ugl-onprem11.rctanalytics.com/scripts/app-161e74909b.js 5:29535 \"http://ugl-onprem11.rctanalytics.com/api/v1/kpis/traffic/entrances - endpoint deprecated\"",
                "timestamp": 1545212750351,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://ugl-onprem11.rctanalytics.com/scripts/app-161e74909b.js 5:29535 \"http://ugl-onprem11.rctanalytics.com/api/v1/kpis/traffic/entrances - endpoint deprecated\"",
                "timestamp": 1545212750351,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://ugl-onprem11.rctanalytics.com/api/v1/kpis/traffic/entrances?groupBy=aggregate&operatingHours=true&orgId=1000006255&reportEndDate=2018-12-01T23:59:59.999Z&reportStartDate=2018-11-04T00:00:00.000Z&siteId=1080049074&zoneId=1000429224 - Failed to load resource: the server responded with a status of 500 (Internal Server Error)",
                "timestamp": 1545212750940,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://ugl-onprem11.rctanalytics.com/api/v1/kpis/traffic/entrances?groupBy=aggregate&operatingHours=true&orgId=1000006255&reportEndDate=2017-11-30T23:59:59.000Z&reportStartDate=2017-11-01T00:00:00.000Z&siteId=1080049074&zoneId=1000429224 - Failed to load resource: the server responded with a status of 500 (Internal Server Error)",
                "timestamp": 1545212750940,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://ugl-onprem11.rctanalytics.com/api/v1/kpis/traffic/entrances?groupBy=aggregate&operatingHours=true&orgId=1000006255&reportEndDate=2018-11-03T23:59:59.000Z&reportStartDate=2018-10-07T00:00:00.000Z&siteId=1080049074&zoneId=1000429224 - Failed to load resource: the server responded with a status of 500 (Internal Server Error)",
                "timestamp": 1545212750995,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://ugl-onprem11.rctanalytics.com/api/v1/kpis/organizations/1000006255/sites/1080036060?add_aggregated_data=true&compare1EndDate=2018-11-03T23:59:59.000Z&compare1StartDate=2018-10-07T00:00:00.000Z&compare2EndDate=2017-11-30T23:59:59.000Z&compare2StartDate=2017-11-01T00:00:00.000Z&groupBy=day&includeReturning=false&includeUnique=false&kpi=ats&kpi=aur&kpi=conversion&kpi=sales&kpi=sps&kpi=traffic&kpi=transactions&kpi=upt&operatingHours=true&reportEndDate=2018-12-01T23:59:59.999Z&reportStartDate=2018-11-04T00:00:00.000Z - Failed to load resource: the server responded with a status of 500 (Internal Server Error)",
                "timestamp": 1545212751227,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://ugl-onprem11.rctanalytics.com/scripts/app-161e74909b.js 36:20230 Object",
                "timestamp": 1545212751228,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://ugl-onprem11.rctanalytics.com/api/v1/organizations/6797 - Failed to load resource: the server responded with a status of 401 (Unauthorized)",
                "timestamp": 1545212756934,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://stats.g.doubleclick.net/r/collect?v=1&aip=1&t=dc&_r=3&tid=UA-40965930-5&cid=2015513875.1545212488&jid=759483850&_gid=503607988.1545212488&gjid=1967637252&_v=j72&z=1403834969 - Failed to load resource: the server responded with a status of 403 (Forbidden)",
                "timestamp": 1545212757082,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://ugl-onprem11.rctanalytics.com/#/ - This page includes a password or credit card input in a non-secure context. A warning has been added to the URL bar. For more information, see https://goo.gl/zmWq3m.",
                "timestamp": 1545212757088,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://ugl-onprem11.rctanalytics.com/api/v1/organizations - Failed to load resource: the server responded with a status of 401 (Unauthorized)",
                "timestamp": 1545212757088,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://stats.g.doubleclick.net/r/collect?v=1&aip=1&t=dc&_r=3&tid=UA-40965930-5&cid=2015513875.1545212488&jid=158189278&uid=547cd0cf8a0ebf2856c1ad50&_gid=503607988.1545212488&gjid=984119067&_v=j72&z=222124195 - Failed to load resource: the server responded with a status of 403 (Forbidden)",
                "timestamp": 1545212757088,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://stats.g.doubleclick.net/r/collect?v=1&aip=1&t=dc&_r=3&tid=UA-40965930-5&cid=2015513875.1545212488&jid=2049944294&uid=547cd0cf8a0ebf2856c1ad50&_gid=503607988.1545212488&gjid=1924330243&_v=j72&z=17059469 - Failed to load resource: the server responded with a status of 403 (Forbidden)",
                "timestamp": 1545212757089,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://ugl-onprem11.rctanalytics.com/api/v1/kpis/traffic/entrances?groupBy=aggregate&operatingHours=true&orgId=1000006255&reportEndDate=2018-11-03T23:59:59.999Z&reportStartDate=2018-10-07T00:00:00.000Z&siteId=1080049074&zoneId=1000429224 - Failed to load resource: the server responded with a status of 500 (Internal Server Error)",
                "timestamp": 1545212757089,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://ugl-onprem11.rctanalytics.com/api/v1/kpis/traffic/entrances?groupBy=aggregate&operatingHours=true&orgId=1000006255&reportEndDate=2018-12-01T23:59:59.999Z&reportStartDate=2018-11-04T00:00:00.000Z&siteId=1080049074&zoneId=1000429224 - Failed to load resource: the server responded with a status of 500 (Internal Server Error)",
                "timestamp": 1545212757089,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://ugl-onprem11.rctanalytics.com/api/v1/kpis/traffic/entrances?groupBy=aggregate&operatingHours=true&orgId=1000006255&reportEndDate=2017-11-30T23:59:59.999Z&reportStartDate=2017-11-01T00:00:00.000Z&siteId=1080049074&zoneId=1000429224 - Failed to load resource: the server responded with a status of 500 (Internal Server Error)",
                "timestamp": 1545212757089,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://ugl-onprem11.rctanalytics.com/api/v1/kpis/organizations/1000006255/sites/1080036060?add_aggregated_data=true&compare1EndDate=2018-11-03T23:59:59.999Z&compare1StartDate=2018-10-07T00:00:00.000Z&compare2EndDate=2017-11-30T23:59:59.999Z&compare2StartDate=2017-11-01T00:00:00.000Z&groupBy=day&includeReturning=false&includeUnique=false&kpi=ats&kpi=aur&kpi=conversion&kpi=sales&kpi=sps&kpi=traffic&kpi=transactions&kpi=upt&operatingHours=true&reportEndDate=2018-12-01T23:59:59.999Z&reportStartDate=2018-11-04T00:00:00.000Z - Failed to load resource: the server responded with a status of 500 (Internal Server Error)",
                "timestamp": 1545212757089,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://ugl-onprem11.rctanalytics.com/api/v1/kpis/organizations/1000006255/sites/1080036060?add_aggregated_data=true&compare1EndDate=2018-11-03T23:59:59.999Z&compare1StartDate=2018-10-07T00:00:00.000Z&compare2EndDate=2017-11-30T23:59:59.999Z&compare2StartDate=2017-11-01T00:00:00.000Z&groupBy=day&includeReturning=false&includeUnique=false&kpi=ats&kpi=aur&kpi=conversion&kpi=sales&kpi=sps&kpi=traffic&kpi=transactions&kpi=upt&operatingHours=true&reportEndDate=2018-12-01T23:59:59.999Z&reportStartDate=2018-11-04T00:00:00.000Z - Failed to load resource: the server responded with a status of 500 (Internal Server Error)",
                "timestamp": 1545212757089,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://ugl-onprem11.rctanalytics.com/api/v1/kpis/traffic/entrances?groupBy=aggregate&operatingHours=true&orgId=1000006255&reportEndDate=2018-12-01T23:59:59.999Z&reportStartDate=2018-11-04T00:00:00.000Z&siteId=1080049074&zoneId=1000429224 - Failed to load resource: the server responded with a status of 500 (Internal Server Error)",
                "timestamp": 1545212757089,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://ugl-onprem11.rctanalytics.com/api/v1/kpis/traffic/entrances?groupBy=aggregate&operatingHours=true&orgId=1000006255&reportEndDate=2017-11-30T23:59:59.000Z&reportStartDate=2017-11-01T00:00:00.000Z&siteId=1080049074&zoneId=1000429224 - Failed to load resource: the server responded with a status of 500 (Internal Server Error)",
                "timestamp": 1545212757089,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://ugl-onprem11.rctanalytics.com/api/v1/kpis/traffic/entrances?groupBy=aggregate&operatingHours=true&orgId=1000006255&reportEndDate=2018-11-03T23:59:59.000Z&reportStartDate=2018-10-07T00:00:00.000Z&siteId=1080049074&zoneId=1000429224 - Failed to load resource: the server responded with a status of 500 (Internal Server Error)",
                "timestamp": 1545212757089,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://ugl-onprem11.rctanalytics.com/api/v1/kpis/organizations/1000006255/sites/1080036060?add_aggregated_data=true&compare1EndDate=2018-11-03T23:59:59.000Z&compare1StartDate=2018-10-07T00:00:00.000Z&compare2EndDate=2017-11-30T23:59:59.000Z&compare2StartDate=2017-11-01T00:00:00.000Z&groupBy=day&includeReturning=false&includeUnique=false&kpi=ats&kpi=aur&kpi=conversion&kpi=sales&kpi=sps&kpi=traffic&kpi=transactions&kpi=upt&operatingHours=true&reportEndDate=2018-12-01T23:59:59.999Z&reportStartDate=2018-11-04T00:00:00.000Z - Failed to load resource: the server responded with a status of 500 (Internal Server Error)",
                "timestamp": 1545212757089,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://ugl-onprem11.rctanalytics.com/api/v1/organizations/6797 - Failed to load resource: the server responded with a status of 401 (Unauthorized)",
                "timestamp": 1545212757089,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://stats.g.doubleclick.net/r/collect?v=1&aip=1&t=dc&_r=3&tid=UA-40965930-5&cid=2015513875.1545212488&jid=724978239&_gid=503607988.1545212488&gjid=959465237&_v=j72&z=267510942 - Failed to load resource: the server responded with a status of 403 (Forbidden)",
                "timestamp": 1545212758456,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://ugl-onprem11.rctanalytics.com/scripts/vendor-f4b84639ea.js 39:721 \"You are using the ngTouch module. \\nAngularJS Material already has mobile click, tap, and swipe support... \\nngTouch is not supported with AngularJS Material!\"",
                "timestamp": 1545212758914,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://ugl-onprem11.rctanalytics.com/#/ - This page includes a password or credit card input in a non-secure context. A warning has been added to the URL bar. For more information, see https://goo.gl/zmWq3m.",
                "timestamp": 1545212759076,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://ugl-onprem11.rctanalytics.com/api/v1/organizations - Failed to load resource: the server responded with a status of 401 (Unauthorized)",
                "timestamp": 1545212759409,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://ugl-onprem11.rctanalytics.com/scripts/app-161e74909b.js 5:29535 \"http://ugl-onprem11.rctanalytics.com/api/v1/kpis/traffic/entrances - endpoint deprecated\"",
                "timestamp": 1545212791225,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://ugl-onprem11.rctanalytics.com/scripts/app-161e74909b.js 5:29535 \"http://ugl-onprem11.rctanalytics.com/api/v1/kpis/traffic/entrances - endpoint deprecated\"",
                "timestamp": 1545212791227,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://ugl-onprem11.rctanalytics.com/scripts/app-161e74909b.js 5:29535 \"http://ugl-onprem11.rctanalytics.com/api/v1/kpis/traffic/entrances - endpoint deprecated\"",
                "timestamp": 1545212791229,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://stats.g.doubleclick.net/r/collect?v=1&aip=1&t=dc&_r=3&tid=UA-40965930-5&cid=2015513875.1545212488&jid=1660758825&uid=547cd0cf8a0ebf2856c1ad50&_gid=503607988.1545212488&gjid=893071215&_v=j72&z=58527389 - Failed to load resource: the server responded with a status of 403 (Forbidden)",
                "timestamp": 1545212822751,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://ugl-onprem11.rctanalytics.com/scripts/app-161e74909b.js 5:29535 \"http://ugl-onprem11.rctanalytics.com/api/v1/kpis/traffic/entrances - endpoint deprecated\"",
                "timestamp": 1545212829672,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://ugl-onprem11.rctanalytics.com/scripts/app-161e74909b.js 5:29535 \"http://ugl-onprem11.rctanalytics.com/api/v1/kpis/traffic/entrances - endpoint deprecated\"",
                "timestamp": 1545212829673,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://ugl-onprem11.rctanalytics.com/scripts/app-161e74909b.js 5:29535 \"http://ugl-onprem11.rctanalytics.com/api/v1/kpis/traffic/entrances - endpoint deprecated\"",
                "timestamp": 1545212829674,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://ugl-onprem11.rctanalytics.com/api/v1/organizations/6797 - Failed to load resource: the server responded with a status of 401 (Unauthorized)",
                "timestamp": 1545212837506,
                "type": ""
            }
        ],
        "screenShotFile": "004600ca-0089-006d-00dc-00b400970011.png",
        "timestamp": 1545212469824,
        "duration": 367663
    },
    {
        "description": "2 Table with info on Traffic Widget ON-4|ON-169 Custom Dashboard",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 856,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "https://stats.g.doubleclick.net/r/collect?v=1&aip=1&t=dc&_r=3&tid=UA-40965930-5&cid=2015513875.1545212488&jid=724978239&_gid=503607988.1545212488&gjid=959465237&_v=j72&z=267510942 - Failed to load resource: the server responded with a status of 403 (Forbidden)",
                "timestamp": 1545212838370,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://ugl-onprem11.rctanalytics.com/#/ - This page includes a password or credit card input in a non-secure context. A warning has been added to the URL bar. For more information, see https://goo.gl/zmWq3m.",
                "timestamp": 1545212838370,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://ugl-onprem11.rctanalytics.com/api/v1/organizations - Failed to load resource: the server responded with a status of 401 (Unauthorized)",
                "timestamp": 1545212838370,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://stats.g.doubleclick.net/r/collect?v=1&aip=1&t=dc&_r=3&tid=UA-40965930-5&cid=2015513875.1545212488&jid=1660758825&uid=547cd0cf8a0ebf2856c1ad50&_gid=503607988.1545212488&gjid=893071215&_v=j72&z=58527389 - Failed to load resource: the server responded with a status of 403 (Forbidden)",
                "timestamp": 1545212838370,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://ugl-onprem11.rctanalytics.com/api/v1/organizations/6797 - Failed to load resource: the server responded with a status of 401 (Unauthorized)",
                "timestamp": 1545212838370,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://ugl-onprem11.rctanalytics.com/scripts/vendor-f4b84639ea.js 39:721 \"You are using the ngTouch module. \\nAngularJS Material already has mobile click, tap, and swipe support... \\nngTouch is not supported with AngularJS Material!\"",
                "timestamp": 1545212839243,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://ugl-onprem11.rctanalytics.com/#/ - This page includes a password or credit card input in a non-secure context. A warning has been added to the URL bar. For more information, see https://goo.gl/zmWq3m.",
                "timestamp": 1545212839478,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://ugl-onprem11.rctanalytics.com/api/v1/organizations - Failed to load resource: the server responded with a status of 401 (Unauthorized)",
                "timestamp": 1545212839711,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://ugl-onprem11.rctanalytics.com/scripts/app-161e74909b.js 5:29535 \"http://ugl-onprem11.rctanalytics.com/api/v1/kpis/traffic/benchmark-performance - endpoint deprecated\"",
                "timestamp": 1545212877366,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://ugl-onprem11.rctanalytics.com/scripts/app-161e74909b.js 5:29535 \"http://ugl-onprem11.rctanalytics.com/api/v1/kpis/traffic/benchmark-performance - endpoint deprecated\"",
                "timestamp": 1545212877694,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://stats.g.doubleclick.net/r/collect?v=1&aip=1&t=dc&_r=3&tid=UA-40965930-5&cid=2015513875.1545212488&jid=803372955&uid=547cd0cf8a0ebf2856c1ad50&_gid=503607988.1545212488&gjid=936580157&_v=j72&z=1701319767 - Failed to load resource: the server responded with a status of 403 (Forbidden)",
                "timestamp": 1545212880843,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://ugl-onprem11.rctanalytics.com/api/v1/organizations/6797 - Failed to load resource: the server responded with a status of 401 (Unauthorized)",
                "timestamp": 1545212913749,
                "type": ""
            }
        ],
        "screenShotFile": "00ae00f4-00d6-00ec-00d8-00990072009c.png",
        "timestamp": 1545212838251,
        "duration": 75486
    }
];

    this.sortSpecs = function () {
        this.results = results.sort(function sortFunction(a, b) {
    if (a.sessionId < b.sessionId) return -1;else if (a.sessionId > b.sessionId) return 1;

    if (a.timestamp < b.timestamp) return -1;else if (a.timestamp > b.timestamp) return 1;

    return 0;
});
    };

    this.loadResultsViaAjax = function () {

        $http({
            url: './combined.json',
            method: 'GET'
        }).then(function (response) {
                var data = null;
                if (response && response.data) {
                    if (typeof response.data === 'object') {
                        data = response.data;
                    } else if (response.data[0] === '"') { //detect super escaped file (from circular json)
                        data = CircularJSON.parse(response.data); //the file is escaped in a weird way (with circular json)
                    }
                    else
                    {
                        data = JSON.parse(response.data);
                    }
                }
                if (data) {
                    results = data;
                    that.sortSpecs();
                }
            },
            function (error) {
                console.error(error);
            });
    };


    if (clientDefaults.useAjax) {
        this.loadResultsViaAjax();
    } else {
        this.sortSpecs();
    }


});

app.filter('bySearchSettings', function () {
    return function (items, searchSettings) {
        var filtered = [];
        if (!items) {
            return filtered; // to avoid crashing in where results might be empty
        }
        var prevItem = null;

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            item.displaySpecName = false;

            var isHit = false; //is set to true if any of the search criteria matched
            countLogMessages(item); // modifies item contents

            var hasLog = searchSettings.withLog && item.browserLogs && item.browserLogs.length > 0;
            if (searchSettings.description === '' ||
                (item.description && item.description.toLowerCase().indexOf(searchSettings.description.toLowerCase()) > -1)) {

                if (searchSettings.passed && item.passed || hasLog) {
                    isHit = true;
                } else if (searchSettings.failed && !item.passed && !item.pending || hasLog) {
                    isHit = true;
                } else if (searchSettings.pending && item.pending || hasLog) {
                    isHit = true;
                }
            }
            if (isHit) {
                checkIfShouldDisplaySpecName(prevItem, item);

                filtered.push(item);
                prevItem = item;
            }
        }

        return filtered;
    };
});

