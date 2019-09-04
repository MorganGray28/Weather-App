<h1 align="center">Weather App</h1>
<div align="center">
    <strong>Yes, I know. Another Weather App</strong>
</div>

<div align="center">Utilizes Google's GeoCoding API and the Dark Sky API to give a current, hourly, and weekly weather forecast for a given location</div>

<div align="center">
    <h3>
        <a href="https://secret-harbor-25621.herokuapp.com/" target="_blank">
            Live Example
        </a>
        <span>|</span>
        <a href="https://developers.google.com/maps/documentation/geocoding/start" target="_blank">
            Google Geocoding API
        </a>
        <span>|</span>
        <a href="https://darksky.net/dev" target="_blank">
            Dark Sky API 
        </a>
</div>

![Screenshot of weather forecast example](/public/img/Screenshot.png)

## API Setup
You'll need two API keys to get started, one for Google's Geocoding API to get lat/long coordinates, then one for Dark Sky's Weather API. 

- Get a <a href="https://developers.google.com/maps/documentation/geocoding/start" target="_blank">Google Geocoding</a> API Key
- Sign up for a free <a href="https://darksky.net/dev" target="_blank">Dark Sky</a> API Key
- Create a file named .env and add:
```sh
KEY_GEO = 'Geocoding API Key'
KEY_WEATHER = 'Dark Sky API Key'
```
(These API Keys are sensitive information, so make sure they won't be committed to public view. My .env file is protected from being committed by listing it in my .gitignore file)

## Development Setup
Install the Dependencies
```sh
npm install
```