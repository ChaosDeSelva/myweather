var restify = require('restify');
var Forecast = require('forecast.io-bluebird');
var sanitizer = require('sanitizer');

require('dotenv').config();

var forecast = new Forecast({
    key: process.env.FORECAST_API_KEY,
    timeout: 2500
});

function respond(req, res, next) {
    var latitude = sanitizer.sanitize(parseInt(req.query.filter.lat));
    var longitude = sanitizer.sanitize(parseInt(req.query.filter.lng));

    //latitude, longitude, time
    forecast.fetch(latitude, longitude)
        .then(function (result) {
            result.id = latitude + 'x' + longitude;
            res.json({index:result});
            return next();
        })
        .catch(function (error) {
            console.error(error);
        });
}

var server = restify.createServer();

server.use(restify.CORS({'origins': ['http://localhost:4200', 'https://localhost', 'http://rselogic.com']}));
server.use(restify.queryParser());

server.get('/weather/indices', respond);

server.listen(8080, function() {
    console.log('%s listening at %s', server.name, server.url);
});