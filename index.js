const searchDisplay= document.querySelector('.navigation-wrapper');
const locationName = document.querySelector('#location');
const locationDisplay = document.querySelector('.location-display');
const search = document.querySelector('#search');
const tempConv = document.querySelector('#temp-type');
const currentIcon = document.querySelector('.weather-icon');
const temp = document.querySelector('.temp');
const timeDate = document.querySelector('#time-date');
const cloud = document.querySelectorAll('.info-detail')[0];
const humidity = document.querySelectorAll('.info-detail')[1];
const wind = document.querySelectorAll('.info-detail')[2];
const precip = document.querySelectorAll('.info-detail')[3];
const locationSearch = document.querySelector('.location-picker');
const predDay = document.querySelectorAll('.day');
const predIcon = document.querySelectorAll('.pred-icon');
const predTemp = document.querySelectorAll('.pred-temp');
const tempScale = document.querySelector('#temp-type');
const searchSuggest = document.querySelector('#location-suggest');
const suggestItem = document.querySelector('#location-suggest').childNodes;
const apiKey = ''; //Paste API key here
const apiBaseUrl = 'http://api.weatherapi.com/v1/'


// Set default location and fetch related data
let locationInput = 'Manila';
fetchWeatherData();

//Show search bar 
locationDisplay.addEventListener('click', function(){
    searchDisplay.classList.add('toggle-search');
})

//Change temperature scale and fetch data on corresponding temp scale
let changeType = ()=>{
    tempScale.classList.toggle("active");
    fetchWeatherData();
}

//Show and update search suggestion during input action
search.addEventListener('input', function(){
    if (search.value != 0){
        locationInput = search.value;
        fetchSearchList();
        clearSearchSuggest();
    }
});

//Close search suggestion drop down on esc key
search.addEventListener('keydown', function(e){
    if(e.key === 'Escape'){
        clearSearchSuggest();
    }
})

//Clear search suggestion
const clearSearchSuggest = ()=>{
    while (searchSuggest.hasChildNodes()) {
        searchSuggest.removeChild(searchSuggest.firstChild);
        searchSuggest.classList.remove('show');
    }
}

//Show current data location when clicking outside input
document.addEventListener('click', function handleClickOutsideBox(event) {
    if (!locationSearch.contains(event.target)) {
        searchSuggest.classList.remove('show');
        search.value = '';
    }
    (!searchDisplay.contains(event.target)) ? searchDisplay.classList.remove('toggle-search'): '';
    
    clearSearchSuggest();
});

//Submit search query
locationSearch.addEventListener('submit', submitForm, false)

function submitForm (e) {
    if(search.value.length == 0){
        alert('Please type in a city name')
    }
    locationInput = search.value; 
    searchSuggest.classList.remove('show');
    fetchWeatherData();
    searchDisplay.classList.remove('toggle-search'); //Hide search bar and show location
    e.preventDefault(); //Prevent page refresh
    search.value = ""; //Clear search bar
}

//Retrieve date info
function currentDate(month, day, year){
    const weekday = [
        'Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat' 
    ];
    const monthList = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'
    ];
    return [
        weekday[new Date(`${month}/${day}/${year}`).getDay()],
        monthList[new Date(`${month}/${day}/${year}`).getMonth()]
        ];
    
};


//Fetch locations related to search input and return a list of search suggestions
function fetchSearchList(){
    fetch(`${apiBaseUrl}search.json?key=${apiKey}&q=${locationInput}`).then(respone => respone.json())
    .then(data => {

        //Appends search suggestions to document as input buttons
        if (data.length != 0){
            searchSuggest.classList.add('show');
            for(let i=0; i<data.length; i++){
                console.log(searchSuggest.childNodes.length)
                if(searchSuggest.childNodes.length<5){
                    let x = document.createElement("INPUT");
                    x.setAttribute("type", "button");
                    x.setAttribute("class", "suggest-item")
                    x.setAttribute("value", `${data[i].name}, ${data[i].region}, ${data[i].country}`);
                    searchSuggest.appendChild(x);
                }
            }
        }

        //Waits for click event on search suggestions
        suggestItem.forEach(function(i){
            i.addEventListener('click', function(e){
                search.value = e.target.value; //Pass suggestion value as input location
                submitForm(e);
            })
        }); 
    })
}

//Fetch related weather data to location input
function fetchWeatherData(){
    fetch(`${apiBaseUrl}forecast.json?key=${apiKey}&q=${locationInput}&days=7`).then(respone => respone.json())
    .then(data => {
        //Display city and country of current location
        locationName.value = `${data.location.name}, ${data.location.country}`;
        const forecastData = data.forecast.forecastday;

        //Retrieve current weather condition to display main icon
        const iconId= data.current.condition.icon.substr("//cdn.weatherapi.com/weather/64x64/".length);
        currentIcon.src = "./icons/" + iconId;
    

        //Change temperature data based on temp scale
        switch (tempScale.classList.contains('active')){
            case true:
                temp.innerHTML = data.current.temp_f + "&#176";
                tempScale.textContent   = '°F';
                break;
            default:
                temp.innerHTML = data.current.temp_c + "&#176";
                tempScale.textContent   = '°C' ; 
                break;
        }

        let y, m, d, date, time;
        
        //Get current time and date
        date = data.location.localtime;
        y = parseInt(date.substr(0,4));
        m = parseInt(date.substr(5,2));
        d = parseInt(date.substr(8,2));
        time = date.substr(11);
        let hour = parseInt(time.substr(0,2));
        let minute = parseInt(time.substr(3,2));
        
        //Change time from 24-hour format to 12-hour format
        let newMinute = minute < 10 ? "0" + minute : minute;
        let ampm = (hour < 12)? "AM" : "PM"
        let newHour = 0;
        if (hour > 12){
            newHour = hour-12;
        }
        else if (hour == 0){
            newHour = hour+12;
        }
        else {
            newHour = hour;
        }

        //Display current date
        const monthDay = currentDate(m, d, y);
        timeDate.innerHTML = `${newHour}:${newMinute} ${ampm} - ${monthDay[0]}  ${monthDay[1]} ${d}, ${y}`;
        
        //Display current weather details
        cloud.innerHTML = data.current.cloud + "%";
        humidity.innerHTML = data.current.humidity + "%";
        wind.innerHTML = data.current.wind_kph + " km/hr";
        precip.innerHTML = data.current.precip_mm + " mm";

        //Display 7-day forecast data
        for (let i=0; i<forecastData.length; i++){
            predIconId = forecastData[i].day.condition.icon.substr("//cdn.weatherapi.com/weather/64x64/".length);
            predIcon[i].src = "./icons/" + predIconId;
            predTemp[i].innerHTML = (tempScale.classList.contains('active'))? forecastData[i].day.avgtemp_f + "&#176": forecastData[i].day.avgtemp_c + "&#176";
            date = forecastData[i].date;
            y = parseInt(date.substr(0,4));
            m = parseInt(date.substr(5,2));
            d = parseInt(date.substr(8,2));
            predDay[i].innerHTML = `${currentDate(m, d, y)[0]}`;
        }

        //Assign document background depending on time
        let currentTime = parseFloat(time);
        const  riseTime = parseInt(forecastData[0].astro.sunrise.substr(0,4));
        const setTime = parseInt(forecastData[0].astro.sunset.substr(0,4)) + 12;

        //Day gradient background
        if (currentTime >= riseTime && currentTime < setTime ){
            document.body.style.background = 'linear-gradient(180deg, #189EE3 0%, #93C4F2 100%)';
        }

        //Sunset gradient background
        else if (currentTime >= setTime && currentTime <= setTime + 0.30){
            document.body.style.background = ' linear-gradient(180deg, #A82934 0%, #D26458 22.92%, #e89473 71.87%, #eacb92 100%)';
        }

        //Night gradient background
        else if(!data.current.is_day){
            document.body.style.background = 'linear-gradient(180deg , #0C3467 0%, #1E5297 100%)';
        }
    })
}




