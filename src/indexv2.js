const domStrings = {
    form: document.querySelector('.search-form'),
    input: document.querySelector('.search-input'),
    inputBtn: document.querySelector('.search-btn'),
    address: document.querySelector('.curr-address'),
    conditionSummary: document.querySelector('.curr-condition-sum'),
    currentTemp: document.querySelector('#temp')
};
const state = {};
var tempUnitState = 'fahren';
// event listener for 
// key is to pass the tempUnitState in as a 'type' argument when rendering each individual sections, which will instruct which array to pull from
// also, we need to keep the state of the which index of day is displayed in the current display, otherwise we won't know which day we need to re-render for the current with the correct units 
    // start out by default, showing day0 for hourly and weekly, then click events for days of week will change the day State
/* ex: renderWeekly(tempState, tempUnitState)

*/

const tempState = {
    tempUnitState: 'fahren',
    windUnitState: 'mph',
    current: {
        fahren: [3],
        celsius: [],
        mph: [],
        kmh: []
    },
    daily: {
        highTemp: {
            fahren: [],
            celsius: []
        },
        lowTemp: {
            fahren: [],
            celsius: []
        },
        mph: [],
        kmh: []
    },
    hourly: {
        fahren: [],
        celsius: [],
        mph: [],
        kmh: []
    }
};


class Search {
    constructor(query) {
        this.query = query;
    }

    async getResults() {
        const keyGeo = 'AIzaSyDfj7Ugrp6dIPWJbwZbTMqrHZZe04c6GrU';
        const keyWeather = '5d3b425be08c0ad09c647b5bc9ecc667';
        try {
            const res = await axios(`https://maps.googleapis.com/maps/api/geocode/json?address=${this.query}&key=${keyGeo}`);
            const locationLatLong = res.data.results[0].geometry.location
            const lat = locationLatLong.lat;
            const long = locationLatLong.lng;
            this.formattedAddress = res.data.results[0].formatted_address;

            this.results = await axios(`https://cors-anywhere.herokuapp.com/https://api.darksky.net/forecast/${keyWeather}/${lat},${long}?exclude=minutely&extend=hourly`);
        }
        catch (error) {
            console.log(error);
        }
    }
}

async function querySearch () {
    let locationQuery = domStrings.input.value;

    if (locationQuery) {
        state.search = new Search(locationQuery);

        await state.search.getResults();

        renderTempState ();
        
        // Clear the Search Input
        domStrings.input.value = '';

        renderWeather();
    } 
}

function renderTempState() {
    // add the Temperatures/Wind Speeds to our State so we can modify the units

    // Set the State for Current
    tempState.current.fahren = state.search.results.data.currently.apparentTemperature;
    tempState.current.celsius = convertToCels(state.search.results.data.currently.apparentTemperature);

    // Set State for Daily Temperatures and Wind Speeds
    for (var i = 0; i < 7; i++) {
        tempState.daily.highTemp.fahren[i] = state.search.results.data.daily.data[i].apparentTemperatureHigh;
        tempState.daily.highTemp.celsius[i] = convertToCels(tempState.daily.highTemp.fahren[i]);
    }



}

function convertToCels (data) {
    return (data - 32) / 1.8
}

function renderWeather () {
    const result = state.search.results;
    console.log(result);

    // display the location
    domStrings.address.textContent = state.search.formattedAddress;

    // display the current Condition Summary
    domStrings.conditionSummary.textContent = getCurrWeather(result.data.currently.icon);

    // Display the Weekly Forecast
    result.data.daily.data.slice(0, 7).forEach(function(cur, index) {
        var time = setTime(cur.time, result.data.offset);
        document.getElementById('day-' + index).innerHTML = setDayWeek(time);
        document.getElementById('high-' + index).innerHTML = Math.round(cur.apparentTemperatureHigh) + '°';
        document.getElementById('low-' + index).innerHTML = Math.round(cur.apparentTemperatureLow) + '°';
        // Still need to display icon based on cur.icon
        // document.getElementById('icon-' + index).img.src = cur.icon + '.svg'; ??? 
    })

    // Display Current Day's Forecast
    renderCurrentDisplay(result.data.currently);

    // setup Hourly Forecast
    hourlyPagination(result);

    // Set active weekly tab to current day
    clearActiveTab();
    document.getElementById('weekly-0').classList.add('weekly-active');

}


function renderCurrentDisplay(data) {
    if (data.apparentTemperature) {
        domStrings.currentTemp.innerHTML = Math.round(data.apparentTemperature);
    } else {
        domStrings.currentTemp.innerHTML = Math.round(data.apparentTemperatureHigh);        
    }

    domStrings.conditionSummary.textContent = getCurrWeather(data.icon);

    if(data.precipType) {
        document.getElementById('curr-precip').textContent = `Chance of ${data.precipType}: ${Math.round(data.precipProbability * 100)}%`;
    } else {
        document.getElementById('curr-precip').textContent = `Chance of Precipitation: ${Math.round(data.precipProbability * 100)}%`;
    }
    document.getElementById('curr-hum').textContent = `Humidity: ${Math.round(data.humidity * 100)} %`;
    document.getElementById('curr-wind').innerHTML = Math.round(data.windSpeed);
    document.getElementById('speed-unit').innerHTML = ' mph';
    document.querySelector('.curr-condition-sum').textContent = getCurrWeather();
}


function clearActiveTab() {
    document.getElementById('weekly-0').classList.remove('weekly-active');
    document.getElementById('weekly-1').classList.remove('weekly-active');
    document.getElementById('weekly-2').classList.remove('weekly-active');
    document.getElementById('weekly-3').classList.remove('weekly-active');
    document.getElementById('weekly-4').classList.remove('weekly-active');
    document.getElementById('weekly-5').classList.remove('weekly-active');
    document.getElementById('weekly-6').classList.remove('weekly-active');
}

// Search Event Listener
domStrings.form.addEventListener('submit', (e) => {
    e.preventDefault();
    querySearch();
});

// Weekly Forecast Event Listener
document.querySelector('.weekly-container').addEventListener('click', function(e) {
    const dailyData = state.search.results.data.daily.data;
    // Clear the active Tab from all days, then add to clicked container 

    if (e.target.closest('#weekly-0')) {
        if (!(document.getElementById('weekly-0').classList.contains('weekly-active'))) {
            clearActiveTab();
            document.getElementById('weekly-0').classList.add('weekly-active');
        }
        hourlyPagination(state.search.results, 1); 
        renderCurrentDisplay(state.search.results.data.currently);
    } else if (e.target.closest('#weekly-1')) {
        
        if (!(document.getElementById('weekly-1').classList.contains('weekly-active'))) {
            clearActiveTab();

            document.getElementById('weekly-1').classList.add('weekly-active');
        }
        hourlyPagination(state.search.results, 2);
        renderCurrentDisplay(dailyData[1]);

    } else if (e.target.closest('#weekly-2')) {

        if (!(document.getElementById('weekly-2').classList.contains('weekly-active'))) {
            clearActiveTab();
            document.getElementById('weekly-2').classList.add('weekly-active');
        }
        hourlyPagination(state.search.results, 3);
        renderCurrentDisplay(dailyData[2]);

    } else if (e.target.closest('#weekly-3')) {
        if (!(document.getElementById('weekly-3').classList.contains('weekly-active'))) {
            clearActiveTab();
            document.getElementById('weekly-3').classList.add('weekly-active');
        }
        hourlyPagination(state.search.results, 4);
        renderCurrentDisplay(dailyData[3]);

    } else if (e.target.closest('#weekly-4')) {
        if (!(document.getElementById('weekly-4').classList.contains('weekly-active'))) {
            clearActiveTab();
            document.getElementById('weekly-4').classList.add('weekly-active');
        }
        hourlyPagination(state.search.results, 5);
        renderCurrentDisplay(dailyData[4]);

    } else if (e.target.closest('#weekly-5')) {
        if (!(document.getElementById('weekly-5').classList.contains('weekly-active'))) {
            clearActiveTab();
            document.getElementById('weekly-5').classList.add('weekly-active');
        }
        hourlyPagination(state.search.results, 6);
        renderCurrentDisplay(dailyData[5]);

    } else if (e.target.closest('#weekly-6')) {
        if (!(document.getElementById('weekly-6').classList.contains('weekly-active'))) {
            clearActiveTab();
            document.getElementById('weekly-6').classList.add('weekly-active');
        }
        hourlyPagination(state.search.results, 7);
        renderCurrentDisplay(dailyData[6]);
    } 
});




// var weatherIcon;
var weatherSummary;
function getCurrWeather(icon) {
    switch(icon){
        case 'clear-day':
        case 'clear-night':
            weatherSummary = 'Clear';
            break;
        case 'rain':
            weatherSummary = 'Rain';
            break;
        case 'snow': 
            weatherSummary = 'Snow';
            break;
        case 'wind':
            weatherSummary = 'Windy';
            break;
        case 'fog':
            weatherSummary = 'Foggy';
            break;
        case 'cloudy':
            weatherSummary = 'Cloudy';
            break;
        case 'partly-cloudy-day':
        case 'partly-cloudy-night':
            weatherSummary = 'Partly Cloudy';
            break;   
    }
    return weatherSummary;
}


// Formatting the API time to read correct time for the location we're displaying the weather
function setTime(t, offset) {
    var currTime = (t) * 1000;
    // get the timezone offset from client side, convert to millisec
    var requestOffset = new Date().getTimezoneOffset() * 60000;
    var locationOffset = offset * 3600000;

    return currTime + requestOffset + locationOffset;
}


function setDayWeek(time) {
    var day = new Date(time).getDay();
    var dayArr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'];
    var dayOfWeek = dayArr[day];

    return dayOfWeek;
}

function hourlyPagination (res, day = 1) {
    var arr = res.data.hourly.data
    var start, end, arrNew;

    // In order to find which index of our hourly array of data marks the start of day 2, we'll use the getHours() on the formatted time of the first index
    // This will return the hour, ex: 15, for 3pm at arr[0], which we can subtract from 24 to find the index for day 2's 12AM weather conditions
    var firstHour = new Date(setTime(arr[0].time, res.data.offset)).getHours();

    if (day === 1) {
        start = 0;
        end = 25;
    } else if (day > 1) {
        start = 24 - firstHour + ((day - 2) * 24);
        end = start + 25;
    }

    arrNew = arr.slice(start, end);
    var triHourlyFormat = [];
    for (var i = 0; i < arrNew.length; i += 3) {
        triHourlyFormat.push(arrNew[i]);
    }
    

    triHourlyFormat.forEach(function(cur, ind) {
        const hour = new Date(setTime(cur.time, res.data.offset)).getHours();
        var hourFormatted;
        if(hour === 0) {
            hourFormatted = '12AM';
        } else if (hour < 12) {
            hourFormatted = hour + "AM";
        } else if (hour === 12) {
            hourFormatted = '12PM';
        } else if (hour > 12) {
            hourFormatted = hour - 12 + 'PM';
        }

        document.getElementById('hour-' + ind).childNodes[3].textContent = Math.round(cur.apparentTemperature);
        document.getElementById('hour-' + ind).childNodes[5].textContent = hourFormatted;

    });
}


// Convert to Fahrenheit Event Listener
document.getElementById('faren').addEventListener('click', function() {
    if (document.getElementById('faren').classList.contains('units-active')) {  
    } else {
        convertToFahrenheit();
    }
})

// Convert to Celsius Event Listener
document.getElementById('celsius').addEventListener('click', function() {
    if (document.getElementById('celsius').classList.contains('units-active')) {
    } else {
        convertToCelsius();  
    }
})


function mphToKmhConvert(speed) {
    return speed * 1.60934;
}

function kmhToMphConvert(speed) {
    return speed * 0.6214;
}


function convertToFahrenheit() {
    // add units-active class to 'celsius'
    document.getElementById('celsius').classList.toggle("units-active");

    // remove units-active class from '#faren'
    document.getElementById('faren').classList.toggle("units-active");

    // convert all temperatures to celsius

    // convert mph to kmh
    console.log(document.getElementById('curr-wind').value);
    
    console.log('convert to Fahrenheit');
}

function convertToCelsius() {
    // remove units-active class from '#celsius'
    document.getElementById('celsius').classList.toggle("units-active");

    // add units-active class to '#faren'
    document.getElementById('faren').classList.toggle("units-active");

    // convert all temperatures to Farenheit
    console.log(document.getElementById('curr-wind').value);


    // convert kmh to mph
    console.log('convert to Celsius');
}

