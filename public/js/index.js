// To Do:
// - redo HTML layout (triple digit temps in current display bugs with the F/C being hidden from click)
//     - better organization
// convert CSS to SCSS
// make responsive 
// test/deploy

const domStrings = {
    form: document.querySelector('.search-form'),
    input: document.querySelector('.search-input'),
    inputBtn: document.querySelector('.search-btn'),
    address: document.querySelector('.curr-address'),
    conditionSummary: document.querySelector('.curr-condition-sum'),
    currentTemp: document.querySelector('#temp')
};

// unitState is passed in as a 'type' parameter when rendering each individual sections, which will instruct which array to pull from, metric or usUnits

// start out by default, showing day0 for hourly and weekly, then click events for days of week will change the day State
const state = {
    tempState: {
        unitState: 'usUnits',
        dayDisplayed: 0,
        metric: {
            current: {
                temp: [],
                windSpeed: [],
            },
            daily : {
                highTemp: [],
                lowTemp: [],
                windSpeed: []
            },
            hourly: {
                temp: []
            }
        },
        usUnits: {
            current: {
                temp: [],
                windSpeed: [],
            },
            daily : {
                highTemp: [],
                lowTemp: [],
                windSpeed: []
            },
            hourly: {
                temp: []
            } 
        }
    }
};

class Search {
    constructor(query) {
        this.query = query;
    }

    async getResults() {
        try {
            const res = await axios(`geolocation?location=${this.query}`);
            const locationLatLong = res.data.results[0].geometry.location
            const lat = locationLatLong.lat;
            const long = locationLatLong.lng;
            this.formattedAddress = res.data.results[0].formatted_address;
            this.results = await axios(`weather?lat=${lat}&long=${long}`);
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
        
        // Clear the Search Input after each search
        domStrings.input.value = '';

        renderWeather();
       
        renderInitialState();
    } 
}

// add the Temperatures/Wind Speeds to our tempState
function renderTempState() {
    // Set the State for Current & run conversion function to get those values in Metric
    state.tempState.usUnits.current.temp = state.search.results.data.currently.apparentTemperature;
    state.tempState.usUnits.current.windSpeed = state.search.results.data.currently.windSpeed;

    state.tempState.metric.current.temp = convertToCels(state.tempState.usUnits.current.temp);
    state.tempState.metric.current.windSpeed = mphToKmhConvert(state.tempState.usUnits.current.windSpeed);

    // Set State for Daily Temperatures and Wind Speeds
    for (var i = 0; i < 7; i++) {
        const daily = state.search.results.data.daily.data;
        const usUnitsDaily = state.tempState.usUnits.daily;
        const metricDaily = state.tempState.metric.daily;

        usUnitsDaily.highTemp[i] = daily[i].apparentTemperatureHigh;
        usUnitsDaily.lowTemp[i] = daily[i].apparentTemperatureLow;
        usUnitsDaily.windSpeed[i] = daily[i].windSpeed;

        metricDaily.highTemp[i] = convertToCels(state.tempState.usUnits.daily.highTemp[i]);
        metricDaily.lowTemp[i] = convertToCels(state.tempState.usUnits.daily.lowTemp[i]);
        metricDaily.windSpeed[i] = mphToKmhConvert(state.tempState.usUnits.daily.windSpeed[i]);
    }

    // Set State for Hourly Temperatures
    const hourly = state.search.results.data.hourly.data;
    for (var i = 0; i < 169; i++) {
        state.tempState.usUnits.hourly.temp[i] = hourly[i].apparentTemperature;
        state.tempState.metric.hourly.temp[i] = convertToCels(state.tempState.usUnits.hourly.temp[i]);
    }
}

function convertToCels (temp) {
    return (temp - 32) / 1.8
}
function mphToKmhConvert(speed) {
    return speed * 1.60934;
}

function renderCurrentTemperatures(data, day) {
    var dayDisplayed = state.tempState.dayDisplayed;

    // displays the condition of the day being displayed, ex: "Clear", "Partly Cloudy"
    domStrings.conditionSummary.textContent = getCurrWeather(data.icon)[0];
    document.querySelector('.curr-condition-icon').src = `./img/${getCurrWeather(data.icon)[1]}.svg`;

    // Use 'Current Weather' data if we're displaying the first day, not the 'Daily Weather' data for the first day, this way it shows the most up-to-date weather conditions instead of a daily summary of today's weather
    if (dayDisplayed === 0) {
        document.getElementById('temp').textContent = Math.round(day.temp);
        document.getElementById('curr-wind').textContent = Math.round(day.windSpeed);

    // Use 'Daily Weather' data for all the other days
    } else if (dayDisplayed > 0 && dayDisplayed < 7) {
        document.getElementById('temp').textContent = Math.round(day.highTemp[dayDisplayed]);
        document.getElementById('curr-wind').textContent = Math.round(day.windSpeed[dayDisplayed]);
    }

    // If there's a different type of precipitation than rain, such as snow, show "Chance of Snow", else, use rain as default
    if (data.precipType && data.precipType !== 'rain') {
        document.getElementById('curr-precip').textContent = `Chance of ${data.precipType}: ${Math.round(data.precipProbability * 100)}%`;
    } else {
        document.getElementById('curr-precip').textContent = `Chance of rain: ${Math.round(data.precipProbability * 100)}%`;
    }

    document.getElementById('curr-hum').textContent = `Humidity: ${Math.round(data.humidity * 100)} %`;

    if (state.tempState.unitState === 'usUnits') {
        document.getElementById('speed-unit').textContent = 'mph';
    } else if (state.tempState.unitState === 'metric') {
        document.getElementById('speed-unit').textContent = 'km/h';
    }
}

function renderWeeklyTemperatures () {
    for (var i = 0; i < 7; i++) {
        document.getElementById('high-' + i).textContent = Math.round(state.tempState[state.tempState.unitState].daily.highTemp[i]) + '°';
        document.getElementById('low-' + i).textContent = Math.round(state.tempState[state.tempState.unitState].daily.lowTemp[i]) + '°';

        document.getElementById('weekly__icon--' + i).src = `./img/${state.search.results.data.daily.data[i].icon}.svg`;
    }
}

function renderWeather () {
    const result = state.search.results;

    // display the location
    domStrings.address.textContent = state.search.formattedAddress;

    // reset state of day displayed to day 0
    state.tempState.dayDisplayed = 0;

    // display the current Condition Summary
    domStrings.conditionSummary.textContent = getCurrWeather(result.data.currently.icon)[0];
    document.querySelector('.curr-condition-icon').src = `./img/${getCurrWeather(result.data.currently.icon)[1]}.svg`;

    // Display the Days for the Weekly Forecast
    result.data.daily.data.slice(0, 7).forEach(function(cur, index) {
        var time = setTime(cur.time, result.data.offset);

        document.getElementById('day-' + index).innerHTML = setDayWeek(time);
    })

    // Display Current Day's Forecast
    renderCurrentTemperatures(result.data.currently, state.tempState[state.tempState.unitState].current);

    // Display Weekly Temperatures
    renderWeeklyTemperatures();

    // setup Hourly Forecast
    hourlyPagination(result);

    // Set active weekly tab to current day
    clearActiveTab();
    document.getElementById('weekly-0').classList.add('weekly-active');

}

function renderInitialState () {
    // animate the search form
    document.querySelector('.search').classList.add('search-animation');
    document.querySelector('.header__h1').classList.add('hidden');

    // UI fade-in animation
    document.querySelector('.current-display').classList.remove('hidden');
    document.querySelector('.current-display').classList.add('reveal-animation');
    document.querySelector('.hourly-container').classList.remove('hidden');

    document.querySelector('.hourly-container').classList.add('reveal-animation');

    document.querySelector('.weekly-container').classList.remove('hidden');
    document.querySelector('.weekly-container').classList.add('reveal-animation');
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
    const dailyTemp = state.tempState[state.tempState.unitState].daily;

    // Clear the active Tab from all days, then add to clicked container 
    if (e.target.closest('#weekly-0')) {
        if (!(document.getElementById('weekly-0').classList.contains('weekly-active'))) {
            clearActiveTab();
            document.getElementById('weekly-0').classList.add('weekly-active');
        }

        state.tempState.dayDisplayed = 0;
        hourlyPagination(state.search.results, 1); 
        renderCurrentTemperatures(state.search.results.data.currently, state.tempState[state.tempState.unitState].current);
    } else if (e.target.closest('#weekly-1')) {
        
        if (!(document.getElementById('weekly-1').classList.contains('weekly-active'))) {
            clearActiveTab();

            document.getElementById('weekly-1').classList.add('weekly-active');
        }

        state.tempState.dayDisplayed = 1;
        hourlyPagination(state.search.results, 2);
        renderCurrentTemperatures(dailyData[1], dailyTemp);


    } else if (e.target.closest('#weekly-2')) {

        if (!(document.getElementById('weekly-2').classList.contains('weekly-active'))) {
            clearActiveTab();
            document.getElementById('weekly-2').classList.add('weekly-active');
        }

        state.tempState.dayDisplayed = 2;
        hourlyPagination(state.search.results, 3);
        renderCurrentTemperatures(dailyData[2], dailyTemp);


    } else if (e.target.closest('#weekly-3')) {
        if (!(document.getElementById('weekly-3').classList.contains('weekly-active'))) {
            clearActiveTab();
            document.getElementById('weekly-3').classList.add('weekly-active');
        }

        state.tempState.dayDisplayed = 3;
        hourlyPagination(state.search.results, 4);
        renderCurrentTemperatures(dailyData[3], dailyTemp);

    } else if (e.target.closest('#weekly-4')) {
        if (!(document.getElementById('weekly-4').classList.contains('weekly-active'))) {
            clearActiveTab();
            document.getElementById('weekly-4').classList.add('weekly-active');
        }

        state.tempState.dayDisplayed = 4;
        hourlyPagination(state.search.results, 5);
        renderCurrentTemperatures(dailyData[4], dailyTemp);


    } else if (e.target.closest('#weekly-5')) {
        if (!(document.getElementById('weekly-5').classList.contains('weekly-active'))) {
            clearActiveTab();
            document.getElementById('weekly-5').classList.add('weekly-active');
        }

        state.tempState.dayDisplayed = 5;
        hourlyPagination(state.search.results, 6);
        renderCurrentTemperatures(dailyData[5], dailyTemp);


    } else if (e.target.closest('#weekly-6')) {
        if (!(document.getElementById('weekly-6').classList.contains('weekly-active'))) {
            clearActiveTab();
            document.getElementById('weekly-6').classList.add('weekly-active');
        }

        state.tempState.dayDisplayed = 6;
        hourlyPagination(state.search.results, 7);
        renderCurrentTemperatures(dailyData[6], dailyTemp);

    } 
    
});

// var weatherIcon;
var weatherSummary = [];
function getCurrWeather(icon) {
    switch(icon){
        case 'clear-day':
            weatherSummary[0] = 'Clear';
            weatherSummary[1] = icon;

        case 'clear-night':
            weatherSummary[0] = 'Clear';
            weatherSummary[1] = icon;
            break;
        case 'rain':
            weatherSummary[0] = 'Rain';
            weatherSummary[1] = icon;
            break;
        case 'snow': 
            weatherSummary[0] = 'Snow';
            weatherSummary[1] = icon;
            break;
        case 'wind':
            weatherSummary[0] = 'Windy';
            weatherSummary[1] = icon;
            break;
        case 'fog':
            weatherSummary[0] = 'Foggy';
            weatherSummary[1] = icon;
            break;
        case 'cloudy':
            weatherSummary[0] = 'Cloudy';
            weatherSummary[1] = icon;
            break;
        case 'partly-cloudy-day':
            weatherSummary[0] = 'Partly Cloudy';
            weatherSummary[1] = icon;
            break;
        case 'partly-cloudy-night':
            weatherSummary[0] = 'Partly Cloudy';
            weatherSummary[1] = icon;
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
    var arr = res.data.hourly.data;
    var start, end, hourArray, tempArray;

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

    hourArray = arr.slice(start, end);
    tempArray = state.tempState[state.tempState.unitState].hourly.temp.slice(start, end);
    
    var triHourlyTime = [];
    // var triHourlyIcon = [];
    var triHourlyTemp = [];
    for (var i = 0; i < hourArray.length; i += 3) {
        triHourlyTime.push(hourArray[i]);
        triHourlyTemp.push(tempArray[i]);
    }
    
    triHourlyTemp.forEach(function(cur, ind) {
        document.getElementById('hour-' + ind).childNodes[3].textContent = Math.round(cur) + '°';

    })

    triHourlyTime.forEach(function(cur, ind) {
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

        // document.getElementById('hour-' + ind).childNodes[3].textContent = Math.round(cur.apparentTemperature);
        document.getElementById('hour-' + ind).childNodes[5].textContent = hourFormatted;
        document.getElementById('hour__icon--' + ind).src = `./img/${cur.icon}.svg`;

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



function convertToCelsius() {
    const dailyData = state.search.results.data.daily.data;
    // const dailyTemp = state.tempState[state.tempState.unitState].daily;
    // add units-active class to 'celsius'
    document.getElementById('celsius').classList.toggle("units-active");

    // remove units-active class from '#faren'
    document.getElementById('faren').classList.toggle("units-active");

    // change unitState to 'metric'
    state.tempState.unitState = 'metric';

    // Call renderCurrent, renderWeekly, and renderHourly to refresh the temps and windspeeds in the correct unit
    if (state.tempState.dayDisplayed === 0) {
        renderCurrentTemperatures(state.search.results.data.currently, state.tempState[state.tempState.unitState].current)
        hourlyPagination(state.search.results);
    } else if (state.tempState.dayDisplayed > 0) {
        renderCurrentTemperatures(dailyData[state.tempState.dayDisplayed], state.tempState[state.tempState.unitState].daily);
        hourlyPagination(state.search.results, day = (state.tempState.dayDisplayed + 1));
    }
    renderWeeklyTemperatures();
}

function convertToFahrenheit() {
    const dailyData = state.search.results.data.daily.data;

    // remove units-active class from '#celsius'
    document.getElementById('celsius').classList.toggle("units-active");

    // add units-active class to '#faren'
    document.getElementById('faren').classList.toggle("units-active");

    // change unitState to 'usUnits'
    state.tempState.unitState = 'usUnits';

    // call renderCurrent, renderWeekly, and renderHourly to refresh the temps and windspeeds in correct unit
    if (state.tempState.dayDisplayed === 0) {
        renderCurrentTemperatures(state.search.results.data.currently, state.tempState[state.tempState.unitState].current)
        hourlyPagination(state.search.results);
    } else if (state.tempState.dayDisplayed > 0) {
        renderCurrentTemperatures(dailyData[state.tempState.dayDisplayed], state.tempState[state.tempState.unitState].daily);
        hourlyPagination(state.search.results, day = (state.tempState.dayDisplayed + 1));
    }
    renderWeeklyTemperatures();
}
