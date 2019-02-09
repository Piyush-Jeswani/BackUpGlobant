

require('../Practise/mongoose.js');
const organization = require('./organization');
var orgDetails = require('../src/ControlPanel/resources/orgDetails.js');
const data = require('../src/ControlPanel/resources/ON702.json');

module.exports = (function () {

  var demoValid = function () {   
  }

  demoValid.prototype = {

    getOrgDetailsFromMongo: function () {

      var res = [];      
      let query = {  organization_id: data.DbValues.Org_id     } 
    
       return organization.find(query).lean().exec((err, result) => {
          [res] = result;
        //  console.log("Value from MongoDB :",res.name)
         orgDetails.res=res;
        //  return res;      
       });  
      
    }
  }
  return demoValid;
})();

 
  





        

