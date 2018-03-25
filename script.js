var mymap = L.map('mapid').setView([51.505, -0.09], 13);
   
var  WAQI_URL    =  "https://tiles.waqi.info/tiles/usepa-aqi/{z}/{x}/{y}.png?token=ce79b4fab3208523b358a65b2eccc4ca6b84b269";  

var  WAQI_ATTR  =  'Air  Quality  Tiles  &copy;  <a  href="http://waqi.info">waqi.info</a>';  


L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a              href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoiY2hpdWJhY2EiLCJhIjoiY2lrNWp6NzI2MDA0NmlmbTIxdGVybzF3YyJ9.rRBFEm_VY3yRzpMey8ufKA'
}).addTo(mymap)

var  waqiLayer  =  L.tileLayer(WAQI_URL,  {attribution:  WAQI_ATTR}).addTo(mymap);  
  

