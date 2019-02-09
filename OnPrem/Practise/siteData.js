
require('../Practise/mongoose.js');
const sites = require('./sites');
var siteDetails = require('../src/ControlPanel/resources/siteDetails.js');

module.exports = (function () {

    var siteData = function () {   
    }

    siteData.prototype = {

        getSiteDetailsFromMongo: function () {

            var res = [];
            let query = {  site_id: 60664    } 

            return sites.find(query).lean().exec((err, result) => {
                [res] = result;
                siteDetails.res=res;
            });
        }
    }
    return siteData;
})();
  