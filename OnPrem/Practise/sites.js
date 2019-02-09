const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let SitesSchema = new Schema({
    site_id: {type: Number, required: true}
});


// Export the model
module.exports = mongoose.model('sites', SitesSchema);
