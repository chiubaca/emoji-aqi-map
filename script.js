const WAQI_TOKEN = "ce79b4fab3208523b358a65b2eccc4ca6b84b269";
const WAQI_URL = "https://tiles.waqi.info/tiles/usepa-aqi/{z}/{x}/{y}.png?token=" + WAQI_TOKEN;
const WAQI_ATTR = 'Air  Quality  Tiles  &copy;  <a  href="http://waqi.info">waqi.info</a>';
var marker = null;

//Initiate Map and layers...
var map = L.map('mapid').setView([51.505, -0.09], 13);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
  maxZoom: 18,
  id: 'mapbox.streets',
  accessToken: 'pk.eyJ1IjoiY2hpdWJhY2EiLCJhIjoiY2lrNWp6NzI2MDA0NmlmbTIxdGVybzF3YyJ9.rRBFEm_VY3yRzpMey8ufKA'
}).addTo(map)

//AQI tile layer for live pollution data
L.tileLayer(WAQI_URL, { attribution: WAQI_ATTR }).addTo(map);

// http://www.coffeegnome.net/creating-contr…button-leaflet
var customControl = L.Control.extend({

  options: {
    position: 'topleft'
  },

  onAdd: function (map) {
    var container = L.DomUtil.create('input');
    container.type = "button";
    container.value = "Get Data";
    container.style.backgroundColor = 'pink';
    container.onmouseout = function () {
      container.style.backgroundColor = 'white';
    }
    container.style.backgroundSize = "30px 30px";
    container.style.width = '100px';
    container.style.height = '30px';

    container.onclick = function () {
      console.log('buttonClicked');
      returnData();
    }

    return container;
  }
});

map.addControl(new customControl());

//This can replace the customControl Class,
L.easyButton('<img src="images/emoji/rocket.png"', function () {
  alert('you just clicked a font awesome icon');
}).addTo(map);

//Exeprimental..Map on click event not being used for anything atm
map.on('click', function (e) {
  console.log(`FROM CLICK Lat: ${e.latlng.lat} Long: ${e.latlng.lng}`);
  //map.flyTo([e.latlng.lat,e.latlng.lng])
  getPollution(e.latlng.lat, e.latlng.lng)
});


//AJAX reqeust to grab pollution json from AQI api
function getPollution(lat, long) {
  var http = new XMLHttpRequest();
  http.open("GET", `https://api.waqi.info/feed/geo:${lat};${long}/?token=${WAQI_TOKEN}`, true);
  http.onreadystatechange = function () {
    if (http.readyState == 4 && http.status == 200) {
      var result = JSON.parse(http.response)
      // console.log(result);
      // console.log(result.data.city.name);
      console.log(`FROM API: Lat: ${result.data.city.geo[0]}  Long: ${result.data.city.geo[1]}`);
      //map.flyTo([result.data.city.geo[0],result.data.city.geo[1]],13)
      //need to implement error handling here:
    }
  };
  http.send();
};


function returnData() {
  var rocketIcon = L.divIcon({ className: '', html: '🚀' });

  //Grabs the map NE and SW bounds of current map view for AQI "bounds" request
  var NE = map.getBounds().getNorthEast();
  var SW = map.getBounds().getSouthWest();

  var http = new XMLHttpRequest();
  http.open("GET", `https://api.waqi.info/map/bounds/?latlng=${SW.lat},${SW.lng},${NE.lat},${NE.lng}&token=${WAQI_TOKEN}`, true);
  http.onreadystatechange = function () {
    if (http.readyState == 4 && http.status == 200) {
      var result = JSON.parse(http.response)
      //  console.log(result);
      //  console.log(result.data.city.name);
      console.log(result);

      for (i in result.data) {
        console.log(`${result.data[i].lat} , ${result.data[i].lon}`)
        L.marker([result.data[i].lat, result.data[i].lon], { icon: rocketIcon }).addTo(map);
      };
    };
  };
  http.send();
};
