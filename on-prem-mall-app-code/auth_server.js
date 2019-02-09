var express = require('express');
var auth = require('http-auth');
var path = require('path');
var basic = auth.basic({
        realm: "ShopperTrak"
    }, function (username, password, callback) { // Custom authentication method.
        callback(username === "shoppertrak" && password === "kaupparata");
    }
);

var app = express();

app.use(auth.connect(basic));
app.use(express.static(path.join(__dirname, 'dist')));

app.listen(process.env.PORT || 3333);
