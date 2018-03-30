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

// http://www.coffeegnome.net/creating-contr…button-leaflet
var customControl =  L.Control.extend({

  options: {
    position: 'topleft'
  },

  onAdd: function (map) {
    var container = L.DomUtil.create('input');
    container.type = "button";
    container.value = "Get Data";
    container.style.backgroundColor = 'pink';     
    container.onmouseout = function(){
      container.style.backgroundColor = 'white'; 
    }
    container.style.backgroundSize = "30px 30px";
    container.style.width = '100px';
    container.style.height = '30px';

    container.onclick = function(){
      console.log('buttonClicked');
      returnData();
    }

    return container;
  }
});

map.addControl(new customControl());
map.on('click', function(e){

    //console.log(e);
    console.log(`FROM CLICK Lat: ${e.latlng.lat} Long: ${e.latlng.lng}`);
    
    //map.flyTo([e.latlng.lat,e.latlng.lng])
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
        
        // console.log(result);
        // console.log(result.data.city.name);
        console.log(`FROM API: Lat: ${result.data.city.geo[0]}  Long: ${result.data.city.geo[1]}`);

        //map.flyTo([result.data.city.geo[0],result.data.city.geo[1]],13)
        //need to implement error handling here:
      }
    };

    http.send();

  };


  function returnData(){
    var NE = map.getBounds().getNorthEast();
    var SW = map.getBounds().getSouthWest();

    var NE_Marker = L.marker([NE.lat,NE.lng]).addTo(map);
    var SW_Marker = L.marker([SW.lat,SW.lng]).addTo(map);
    

     //ajax logic - going to pollution to grab pollution json
     var http = new XMLHttpRequest();
     //http.open("GET",  `https://api.waqi.info/feed/geo:${lat};${long}/?token=${WAQI_TOKEN}`, true);
     http.open("GET",  `https://api.waqi.info/map/bounds/?latlng=${SW.lat},${SW.lng},${NE.lat},${NE.lng}&token=${WAQI_TOKEN}`, true);
     http.onreadystatechange = function() {
       if (http.readyState == 4 && http.status == 200) {
 
         var result = JSON.parse(http.response)
         
        //  console.log(result);
        //  console.log(result.data.city.name);
        console.log(result);

         for (i in result.data){
           console.log(`${result.data[i].lat} , ${result.data[i].lon}`)
           L.marker([result.data[i].lat,result.data[i].lon]).addTo(map);
         }
 
         //map.flyTo([result.data.city.geo[0],result.data.city.geo[1]],13)
         //need to implement error handling here:
       }
     };
 
     http.send();

  }

  function getBounds(){
    // var center = map.getCenter();
      
    // var NE = map.getNorthEast();
    // console.log(`SW --- ${SW}  `)
    
    // var centerMarker = L.marker([center.lat, center.lng]).addTo(map);
    var NE_Marker = L.marker([map.getBounds().getNorthEast().lat, map.getBounds().getNorthEast().lng]).addTo(map);
    var SW_Marker = L.marker([map.getBounds().getSouthWest().lat, map.getBounds().getSouthWest().lng]).addTo(map);
    var SE_Marker = L.marker([map.getBounds().getSouthEast().lat, map.getBounds().getSouthEast().lng]).addTo(map);
    var NW_Marker = L.marker([map.getBounds().getNorthWest().lat, map.getBounds().getNorthWest().lng]).addTo(map);
    
    // var NE_Marker =  L.marker([NE.lat, NE.lng]).addTo(map);
  }

  