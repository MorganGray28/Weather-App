const domStrings = {
    form: document.querySelector('.search-form'),
    input: document.querySelector('.search-input'),
    inputBtn: document.querySelector('.search-btn'),
    address: document.querySelector('.curr-address'),
};

domStrings.form.addEventListener('submit', (e) => {
    e.preventDefault();

    let locationValue = domStrings.input.value;

    // 1) Run async Function to get Long and Lat of city
    getLongLat(locationValue);

    // 2) clear the search input box
    domStrings.input.value = '';

})


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
            const formattedAddress = res.data.results[0].formatted_address;
            

            this.results = await axios(`https://cors-anywhere.herokuapp.com/https://api.darksky.net/forecast/${keyWeather}/${lat},${long}?exclude=minutely&extend=hourly`);

            // Display the location
            domStrings.address.textContent = formattedAddress;
            console.log(this.results);



        }
        catch (error) {
            console.log(error);
        }
    }
}




async function getLongLat (location) {
    const key = 'AIzaSyDfj7Ugrp6dIPWJbwZbTMqrHZZe04c6GrU'

    try {
        const res = await axios(`https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=${key}`);
        const locationLatLong = res.data.results[0].geometry.location
        const lat = locationLatLong.lat;
        const long = locationLatLong.lng;
        const formattedAddress = res.data.results[0].formatted_address;

        getWeather(lat, long, formattedAddress);
    }
    catch (error) {
        console.log(error);
    }
}

async function getWeather (lat, long, formattedAddress) {
    const key = '5d3b425be08c0ad09c647b5bc9ecc667';

    try {
        const res = await axios(`https://cors-anywhere.herokuapp.com/https://api.darksky.net/forecast/${key}/${lat},${long}?exclude=minutely&extend=hourly`);
        console.log(res);

        // Display the location
        domStrings.address.textContent = formattedAddress;

        // Weather Icon Conditions
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
        
        document.querySelector('.curr-condition-sum').textContent = getCurrWeather(res.data.currently.icon);
        
        // Display the Weekly Forecast
        res.data.daily.data.slice(0, 7).forEach(function(cur, index) {
            var time = setTime(cur.time, res.data.offset);
            document.getElementById('day-' + index).innerHTML = setDayWeek(time);
            document.getElementById('high-' + index).innerHTML = Math.round(cur.apparentTemperatureHigh) + '°';
            document.getElementById('low-' + index).innerHTML = Math.round(cur.apparentTemperatureLow) + '°';
            // Still need to display icon based on cur.icon
            // document.getElementById('icon-' + index).img.src = cur.icon + '.svg'; ??? 
        })

        // Display Current Day's Forecast
        var currentData = res.data.currently;
        var precipType = res.data.daily.data[0].precipType;

        document.querySelector('#temp').innerHTML = Math.round(currentData.apparentTemperature);

        if(precipType) {
            document.getElementById('curr-precip').textContent = `Chance of ${precipType}: ${Math.round(currentData.precipProbability * 100)}%`;
        } else {
            document.getElementById('curr-precip').textContent = `Chance of Precipitation: ${Math.round(currentData.precipProbability * 100)}%`;
        }

        document.getElementById('curr-hum').textContent = `Humidity: ${Math.round(currentData.humidity * 100)} %`;
        document.getElementById('curr-wind').innerHTML = `Wind Speed: ${Math.round(currentData.windSpeed)} mph`;
        document.querySelector('.curr-condition-sum').textContent = getCurrWeather();

        
        // Display Hourly Forecast
        // setHourly(res.data.hourly.data);
        formatArray(res.data.hourly.data);


        

    }

    catch(error) {
        console.log(error);
    }
}


// Convert to Fahrenheit Event Listener
document.getElementById('faren').addEventListener('click', function() {
    if (document.getElementById('faren').classList.contains('units-active')) {
        
    } else {
        // add units-active class to 'celsius'
        document.getElementById('celsius').classList.toggle("units-active");

        // remove units-active class from '#faren'
        document.getElementById('faren').classList.toggle("units-active");

        

        // convert all temperatures to celsius


        // convert mph to kmh
        let speedNew = mphToKmhConvert(document.getElementById('curr-wind').value);
        document.getElementById('curr-wind').innerHTML = speedNew;
        


        console.log('convert to Fahrenheit');
    }
})

function mphToKmhConvert(speed) {
    return speed * 1.60934;
}










// Convert to Celsius Event Listener
document.getElementById('celsius').addEventListener('click', function() {
    if (document.getElementById('celsius').classList.contains('units-active')) {
        
    } else {
        // remove units-active class from '#celsius'
        document.getElementById('celsius').classList.toggle("units-active");

        // add units-active class to '#faren'
        document.getElementById('faren').classList.toggle("units-active");

        

        // convert all temperatures to Farenheit


        // convert kmh to mph
        console.log('convert to Celsius');
    }
})


document.querySelector('.weekly-container').addEventListener('click', function(e) {
    if (e.target.closest('#weekly-0')) {
        // setHourly();
        clearActiveTab();
        console.log('Today');
    } else if (e.target.closest('#weekly-1')) {
        console.log('Tomorrow');
    } else if (e.target.closest('#weekly-2')) {
        console.log('Day after tomorrow');
        formatArray(page = 2);
    } else if (e.target.closest('#weekly-3')) {
        console.log('3 days away');
    } else if (e.target.closest('#weekly-4')) {
        console.log('4 days away');
    } else if (e.target.closest('#weekly-5')) {
        console.log('5 days away');
    } else if (e.target.closest('#weekly-6')) {
        console.log('6 days away');
    } 
});


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


function clearActiveTab() {
    document.getElementById('weekly-0').classList.remove('weekly-active');
}











// if page = 1






// if(page = 1) page = 1; start = 0, end = 25
// page = 2; start = 24 end = 49
function formatArray (arr, page = 1, hoursPerPage = 24) {
    var start = (page - 1) * hoursPerPage;
    var end = (page * hoursPerPage) + 1;

    var arrNew = arr.slice(start, end);
    var formattedArr = [];
    for(var i = 0; i < arrNew.length; i += 3) {
        formattedArr.push(arrNew[i]);
    }
    console.log(formattedArr);
    // formattedArr.forEach(renderHourly);
}

// function renderHourly(arr) {
//     console.log(arr);
// }




// createArray(arrTest);








// let arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40];

// function arrayPagination(array, page = 1) {
//     var start = (page - 1) * 16;
//     var end = page * 16;

//     var arrNew = array.slice(start, end);
//     formatArr(arrNew);
// }

// function formatArr(array) {
//     for(var i = 0, )
// }
  






// function setHourly(page = 0, arr) {
//     console.log(page, arr[0].time);
// }















    // let hours = d.getHours() + timezoneOffLocal + locationTimeOffset;
    // let formattedHours;
    
    // if (hours < 12) {
    //     formattedHours = `${hours}AM`;
    // } else if (hours === 12) {
    //     formattedHours = `${hours}PM`;
    // } else if (hours > 12 && hours < 24) {
    //     formattedHours = `${hours - 12}PM`;
    // } else if (hours === 24) {
    //     formattedHours = `${hours - 12}AM`;
    // }

































