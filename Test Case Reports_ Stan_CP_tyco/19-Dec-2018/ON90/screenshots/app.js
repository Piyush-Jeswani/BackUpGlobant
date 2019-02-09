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
        "description": "Validating the visibility of Occupancy Metric ON-90|As a customer, one can see Occupancy Metric for Real Time Data ON-276",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 1900,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "http://ugl-onprem11.rctanalytics.com/scripts/vendor-f4b84639ea.js 39:721 \"You are using the ngTouch module. \\nAngularJS Material already has mobile click, tap, and swipe support... \\nngTouch is not supported with AngularJS Material!\"",
                "timestamp": 1545232260845,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://ugl-onprem11.rctanalytics.com/#/ - This page includes a password or credit card input in a non-secure context. A warning has been added to the URL bar. For more information, see https://goo.gl/zmWq3m.",
                "timestamp": 1545232262185,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://ugl-onprem11.rctanalytics.com/api/v1/organizations - Failed to load resource: the server responded with a status of 401 (Unauthorized)",
                "timestamp": 1545232262185,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://ugl-onprem11.rctanalytics.com/scripts/app-161e74909b.js 5:29535 \"http://ugl-onprem11.rctanalytics.com/api/v1/kpis/traffic/benchmark-performance - endpoint deprecated\"",
                "timestamp": 1545232332402,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://ugl-onprem11.rctanalytics.com/scripts/app-161e74909b.js 5:29535 \"http://ugl-onprem11.rctanalytics.com/api/v1/kpis/traffic/benchmark-performance - endpoint deprecated\"",
                "timestamp": 1545232332403,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://ugl-onprem11.rctanalytics.com/scripts/app-161e74909b.js 5:29535 \"http://ugl-onprem11.rctanalytics.com/api/v1/kpis/traffic/entrances - endpoint deprecated\"",
                "timestamp": 1545232349915,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://ugl-onprem11.rctanalytics.com/scripts/app-161e74909b.js 5:29535 \"http://ugl-onprem11.rctanalytics.com/api/v1/kpis/traffic/entrances - endpoint deprecated\"",
                "timestamp": 1545232349916,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://ugl-onprem11.rctanalytics.com/scripts/app-161e74909b.js 5:29535 \"http://ugl-onprem11.rctanalytics.com/api/v1/kpis/traffic/entrances - endpoint deprecated\"",
                "timestamp": 1545232349917,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://ugl-onprem11.rctanalytics.com/scripts/app-161e74909b.js 5:29535 \"http://ugl-onprem11.rctanalytics.com/api/v1/kpis/traffic/entrances - endpoint deprecated\"",
                "timestamp": 1545232349919,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://ugl-onprem11.rctanalytics.com/scripts/app-161e74909b.js 5:29535 \"http://ugl-onprem11.rctanalytics.com/api/v1/kpis/traffic/entrances - endpoint deprecated\"",
                "timestamp": 1545232350032,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://ugl-onprem11.rctanalytics.com/scripts/app-161e74909b.js 5:29535 \"http://ugl-onprem11.rctanalytics.com/api/v1/kpis/traffic/entrances - endpoint deprecated\"",
                "timestamp": 1545232350033,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://ugl-onprem11.rctanalytics.com/scripts/app-161e74909b.js 5:29535 \"http://ugl-onprem11.rctanalytics.com/api/v1/kpis/traffic/entrances - endpoint deprecated\"",
                "timestamp": 1545232350033,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://ugl-onprem11.rctanalytics.com/scripts/app-161e74909b.js 5:29535 \"http://ugl-onprem11.rctanalytics.com/api/v1/kpis/traffic/entrances - endpoint deprecated\"",
                "timestamp": 1545232350034,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://ugl-onprem11.rctanalytics.com/scripts/app-161e74909b.js 5:29535 \"http://ugl-onprem11.rctanalytics.com/api/v1/kpis/traffic/entrances - endpoint deprecated\"",
                "timestamp": 1545232350534,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://ugl-onprem11.rctanalytics.com/scripts/app-161e74909b.js 5:29535 \"http://ugl-onprem11.rctanalytics.com/api/v1/kpis/traffic/entrances - endpoint deprecated\"",
                "timestamp": 1545232350534,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://ugl-onprem11.rctanalytics.com/scripts/app-161e74909b.js 5:29535 \"http://ugl-onprem11.rctanalytics.com/api/v1/kpis/traffic/entrances - endpoint deprecated\"",
                "timestamp": 1545232350535,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://ugl-onprem11.rctanalytics.com/scripts/app-161e74909b.js 5:29535 \"http://ugl-onprem11.rctanalytics.com/api/v1/kpis/traffic/entrances - endpoint deprecated\"",
                "timestamp": 1545232350536,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://ugl-onprem11.rctanalytics.com/scripts/app-161e74909b.js 2:252 TypeError: Cannot read property 'id' of undefined\n    at Z (http://ugl-onprem11.rctanalytics.com/scripts/app-161e74909b.js:40:16810)\n    at Y (http://ugl-onprem11.rctanalytics.com/scripts/app-161e74909b.js:40:16356)\n    at h.$digest (http://ugl-onprem11.rctanalytics.com/scripts/vendor-f4b84639ea.js:40:12875)\n    at h.$apply (http://ugl-onprem11.rctanalytics.com/scripts/vendor-f4b84639ea.js:40:14392)\n    at l (http://ugl-onprem11.rctanalytics.com/scripts/vendor-f4b84639ea.js:39:21923)\n    at v (http://ugl-onprem11.rctanalytics.com/scripts/vendor-f4b84639ea.js:39:24332)\n    at XMLHttpRequest.w.onload (http://ugl-onprem11.rctanalytics.com/scripts/vendor-f4b84639ea.js:39:24738)",
                "timestamp": 1545232358860,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://ugl-onprem11.rctanalytics.com/scripts/app-161e74909b.js 2:252 TypeError: Cannot read property 'id' of undefined\n    at Z (http://ugl-onprem11.rctanalytics.com/scripts/app-161e74909b.js:40:16810)\n    at Y (http://ugl-onprem11.rctanalytics.com/scripts/app-161e74909b.js:40:16356)\n    at h.$digest (http://ugl-onprem11.rctanalytics.com/scripts/vendor-f4b84639ea.js:40:12875)\n    at h.$apply (http://ugl-onprem11.rctanalytics.com/scripts/vendor-f4b84639ea.js:40:14392)\n    at l (http://ugl-onprem11.rctanalytics.com/scripts/vendor-f4b84639ea.js:39:21923)\n    at v (http://ugl-onprem11.rctanalytics.com/scripts/vendor-f4b84639ea.js:39:24332)\n    at XMLHttpRequest.w.onload (http://ugl-onprem11.rctanalytics.com/scripts/vendor-f4b84639ea.js:39:24738)",
                "timestamp": 1545232358860,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://ugl-onprem11.rctanalytics.com/scripts/app-161e74909b.js 2:252 TypeError: Cannot read property 'id' of undefined\n    at Z (http://ugl-onprem11.rctanalytics.com/scripts/app-161e74909b.js:40:16810)\n    at Y (http://ugl-onprem11.rctanalytics.com/scripts/app-161e74909b.js:40:16356)\n    at h.$digest (http://ugl-onprem11.rctanalytics.com/scripts/vendor-f4b84639ea.js:40:12875)\n    at h.$apply (http://ugl-onprem11.rctanalytics.com/scripts/vendor-f4b84639ea.js:40:14392)\n    at l (http://ugl-onprem11.rctanalytics.com/scripts/vendor-f4b84639ea.js:39:21923)\n    at v (http://ugl-onprem11.rctanalytics.com/scripts/vendor-f4b84639ea.js:39:24332)\n    at XMLHttpRequest.w.onload (http://ugl-onprem11.rctanalytics.com/scripts/vendor-f4b84639ea.js:39:24738)",
                "timestamp": 1545232358860,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://ugl-onprem11.rctanalytics.com/api/v1/realtime?hourly=true&orgId=1000006255&siteId=1080030032 - Failed to load resource: the server responded with a status of 500 (Internal Server Error)",
                "timestamp": 1545232358863,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://ugl-onprem11.rctanalytics.com/scripts/app-161e74909b.js 39:14598 \"error getting real time data\"",
                "timestamp": 1545232358863,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://ugl-onprem11.rctanalytics.com/scripts/app-161e74909b.js 39:14644 Object",
                "timestamp": 1545232358864,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://ugl-onprem11.rctanalytics.com/scripts/app-161e74909b.js 39:14598 \"error getting real time data\"",
                "timestamp": 1545232358865,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://ugl-onprem11.rctanalytics.com/scripts/app-161e74909b.js 39:14644 Object",
                "timestamp": 1545232358865,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://ugl-onprem11.rctanalytics.com/scripts/app-161e74909b.js 39:14598 \"error getting real time data\"",
                "timestamp": 1545232358866,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://ugl-onprem11.rctanalytics.com/scripts/app-161e74909b.js 39:14644 Object",
                "timestamp": 1545232358866,
                "type": ""
            }
        ],
        "screenShotFile": "images\\007c00a2-0054-00da-0047-00e4007e002f.png",
        "timestamp": 1545232227942,
        "duration": 134083
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

