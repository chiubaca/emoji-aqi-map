const WAQI_TOKEN = "ce79b4fab3208523b358a65b2eccc4ca6b84b269";

var map = L.map('mapid').setView([51.505, -0.09], 13);

var WAQI_URL = "https://tiles.waqi.info/tiles/usepa-aqi/{z}/{x}/{y}.png?token="+ WAQI_TOKEN;

var WAQI_ATTR = 'Air  Quality  Tiles  &copy;  <a  href="http://waqi.info">waqi.info</a>';


L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoiY2hpdWJhY2EiLCJhIjoiY2lrNWp6NzI2MDA0NmlmbTIxdGVybzF3YyJ9.rRBFEm_VY3yRzpMey8ufKA'
}).addTo(map)

var waqiLayer = L.tileLayer(WAQI_URL, { attribution: WAQI_ATTR }).addTo(map);

var marker = null;

map.on('click', function(e){

    console.log(e);
    console.log(`Latitude: ${e.latlng.lat}\nLongitude: ${e.latlng.lng}`);
    getPollution(e.latlng.lat , e.latlng.lng)
    

});

// Example AQI "geo" request:
// https://api.waqi.info/feed/geo:17.99041;125.16227/?token=ce79b4fab3208523b358a65b2eccc4ca6b84b269



function getPollution(lat,long) {

    //ajax logic - going to pollution to grab pollution json
    var http = new XMLHttpRequest();
    http.open("GET",  `https://api.waqi.info/feed/geo:${lat};${long}/?token=${WAQI_TOKEN}`, true);
    http.onreadystatechange = function() {
      if (http.readyState == 4 && http.status == 200) {

        var result = JSON.parse(http.response)
        
        console.log(result);
        console.log(result.data.city.name);
        console.log(result.data.city.geo[0]);
        console.log(result.data.city.geo[1]);
        //need to implement error handling here:
      }
    };

    http.send();

  };


  