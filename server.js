var express = require('express');
var path = require("path");
var app = express();
app.set('port', process.env.PORT || 5000);

app.get('/', function (req, res) {
	res.sendFile(path.join(__dirname + '/public/index.html'));
});

app.get('/:file', function (req, res) {
	res.sendFile(path.join(__dirname + '/public/' + req.params.file));
});

app.listen(app.get('port'), function () {
	console.log('App is listening on port ' + app.get('port'));
});