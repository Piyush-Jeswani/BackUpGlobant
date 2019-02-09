const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let OrganizationSchema = new Schema({
    organization_id: {type: Number, required: true}
});

module.exports = mongoose.model('organizations', OrganizationSchema);