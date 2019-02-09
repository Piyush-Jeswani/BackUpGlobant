var mongo = require('mongodb'); 
var MongoClient = require('mongodb').MongoClient;

var url = "mongodb://tgl-onprem11.rctanalytics.com:27017";
MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    console.log("Connected");
    db.close();
  });