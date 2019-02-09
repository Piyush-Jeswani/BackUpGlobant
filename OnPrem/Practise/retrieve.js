var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://tgl-onprem11.rctanalytics.com';

MongoClient.connect(url, function(err, db) {

    var result = db.collection('sites').find();

    result.each(function(err, doc) {

        console.log(doc);

    });
}); 