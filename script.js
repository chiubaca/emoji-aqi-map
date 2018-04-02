const WAQI_TOKEN = "ce79b4fab3208523b358a65b2eccc4ca6b84b269";
const WAQI_URL = "https://tiles.waqi.info/tiles/usepa-aqi/{z}/{x}/{y}.png?token=" + WAQI_TOKEN;
const WAQI_ATTR = 'Air  Quality  Tiles  &copy;  <a  href="http://waqi.info">waqi.info</a>';
var marker = null;

let good =        L.divIcon({ className: '', html: '😀' });
let moderate =    L.divIcon({ className: '', html: '🙁' });
let senstive =    L.divIcon({ className: '', html: '😷' });
let unhealthy =   L.divIcon({ className: '', html: '😨' }); 
let v_unhealthy = L.divIcon({ className: '', html: '🤢' }); 
let hazardous =   L.divIcon({ className: '', html: '💀' }); 

//Initiate Map and layers...
var map = L.map('mapid').setView([51.505, -0.09], 7);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
  maxZoom: 18,
  id: 'mapbox.streets',
  accessToken: 'pk.eyJ1IjoiY2hpdWJhY2EiLCJhIjoiY2lrNWp6NzI2MDA0NmlmbTIxdGVybzF3YyJ9.rRBFEm_VY3yRzpMey8ufKA'
}).addTo(map)

//AQI tile layer for live pollution data
L.tileLayer(WAQI_URL, { 
  attribution: WAQI_ATTR,
  minZoom:8
}).addTo(map);


//This can replace the customControl Class,
L.easyButton('<div>🔥</div>', function () {
  //alert('you just clicked a font awesome icon');
  returnData();
}).addTo(map);

L.easyButton('<div>❌</div>', function () {
  //alert('you just clicked a font awesome icon');
  removeData();
}).addTo(map);

//Exeprimental..Map on click event not being used for anything atm
map.on('click', function (e) {
  returnData()
  console.log(`FROM CLICK Lat: ${e.latlng.lat} Long: ${e.latlng.lng}`);
  map.flyTo([e.latlng.lat,e.latlng.lng], 9)
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

function removeData() {
  good.clearLayers();
}

function returnData() {
    
 

  //Grabs the map NE and SW bounds of current map view for AQI "bounds" request
  var NE = map.getBounds().getNorthEast();
  var SW = map.getBounds().getSouthWest();
  //var center =  map.getBounds().getCenter();



  var http = new XMLHttpRequest();
  http.open("GET", `https://api.waqi.info/map/bounds/?latlng=${SW.lat},${SW.lng},${NE.lat},${NE.lng}&token=${WAQI_TOKEN}`, true);
  http.onreadystatechange = function () {
    if (http.readyState == 4 && http.status == 200) {
      var result = JSON.parse(http.response)
      //  console.log(result);
      //  console.log(result.data.city.name);s
      console.log(result);

      for (i in result.data) {
        if (result.data[i].aqi > 300){
          console.log(`${result.data[i].lat} , ${result.data[i].lon}`)
          L.marker([result.data[i].lat, result.data[i].lon], { icon: hazardous }).addTo(map);
        }
        if (result.data[i].aqi < 300 && result.data[i].aqi > 201){
          console.log(`${result.data[i].lat} , ${result.data[i].lon}`)
          L.marker([result.data[i].lat, result.data[i].lon], { icon: v_unhealthy }).addTo(map);
        }
        if (result.data[i].aqi < 200 && result.data[i].aqi > 151){
          console.log(`${result.data[i].lat} , ${result.data[i].lon}`)
          L.marker([result.data[i].lat, result.data[i].lon], { icon: unhealthy }).addTo(map);
        }
        if (result.data[i].aqi < 150 && result.data[i].aqi > 101){
          console.log(`${result.data[i].lat} , ${result.data[i].lon}`)
          L.marker([result.data[i].lat, result.data[i].lon], { icon: senstive }).addTo(map);
        }
        if (result.data[i].aqi < 100 && result.data[i].aqi > 51){
          console.log(`${result.data[i].lat} , ${result.data[i].lon}`)
          L.marker([result.data[i].lat, result.data[i].lon], { icon: moderate }).addTo(map);
        }
        if (result.data[i].aqi < 50){
          console.log(`${result.data[i].lat} , ${result.data[i].lon}`)
          L.marker([result.data[i].lat, result.data[i].lon], { icon: good }).addTo(map);
        }
       
      };
    };
  };
  http.send();
};
