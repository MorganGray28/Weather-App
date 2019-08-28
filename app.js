const express = require('express'),
    app = express(),
    path = require('path');
    bodyParser = require('body-parser'),
    fetch = require('node-fetch');

require('dotenv').config();

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/html.html'));
});

app.get('/geolocation', async (req, res) => {
    const url1 = `https://maps.googleapis.com/maps/api/geocode/json?address=${req.query.location}&key=${process.env.KEY_GEO}`;
    const fetchResponse = await fetch(url1);
    const json = await fetchResponse.json();
    res.send(json);
});

app.get('/weather', async (req, res) => {
    const url2 = `https://api.darksky.net/forecast/${process.env.KEY_WEATHER}/${req.query.lat},${req.query.long}?exclude=minutely&extend=hourly`;
    const fetchWeather = await fetch(url2);
    const jsonWeather = await fetchWeather.json();
    res.send(jsonWeather);
});

app.listen(process.env.PORT || 3000, (req, res) => {
    console.log('server is running');
});