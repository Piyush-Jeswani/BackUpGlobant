
require('../Practise/mongoose.js');
const sites = require('./sites');
var devices = require('../src/resources/devices.js');

module.exports = (function () {

    var siteData = function () {   
    }

    siteData.prototype = {

        getSiteDetailsFromMongo: function () {

            var res = [];
            let query = {  site_id: 1     } 

            return sites.find(query).lean().exec((err, result) => {
                [res] = result;
                devices.res=res;
            });
        }
    }
    return siteData;
})();
  