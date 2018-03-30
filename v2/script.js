
mapboxgl.accessToken = 'pk.eyJ1IjoiY2hpdWJhY2EiLCJhIjoiY2lrNWp6NzI2MDA0NmlmbTIxdGVybzF3YyJ9.rRBFEm_VY3yRzpMey8ufKA';
var map = new mapboxgl.Map({
    container: 'map',
    center: [-0.09, 51.505],
    zoom: 13,
    style: 'mapbox://styles/mapbox/streets-v9'
});

const WAQI_TOKEN = "ce79b4fab3208523b358a65b2eccc4ca6b84b269";

var WAQI_URL = "https://tiles.waqi.info/tiles/usepa-aqi/{z}/{x}/{y}.png?token="+ WAQI_TOKEN;

var WAQI_ATTR = 'Air  Quality  Tiles  &copy;  <a  href="http://waqi.info">waqi.info</a>';

var marker = null;

map.on('click', function(e){

    console.log(e);
    console.log(`FROM CLICK Latitude: ${e.lngLat.lat}\nLongitude: ${e.lngLat.lng}`);
    
   
    map.flyTo({
        // These options control the ending camera position: centered at
        // the target, at zoom level 9, and north up.
        center: [e.lngLat.lng,e.lngLat.lat],
        zoom: 13,
        bearing: 0,

        // These options control the flight curve, making it move
        // slowly and zoom out almost completely before starting
        // to pan.
        speed: 1, // make the flying slow
        curve: 1, // change the speed at which it zooms out

        // This can be any easing function: it takes a number between
        // 0 and 1 and returns another number between 0 and 1.
        easing: function (t) {
            return t;
        }
    });
    getPollution(e.lngLat.lat , e.lngLat.lng)


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
        console.log(`FROM API: Lat: ${result.data.city.geo[0]}  Long: ${result.data.city.geo[1]}`);

        map.flyTo([result.data.city.geo[0],result.data.city.geo[1]],13)
        //need to implement error handling here:

        map.flyTo({
            // These options control the ending camera position: centered at
            // the target, at zoom level 9, and north up.
            center: [result.data.city.geo[1],result.data.city.geo[0]],
            zoom: 13,
            bearing: 0,
    
            // These options control the flight curve, making it move
            // slowly and zoom out almost completely before starting
            // to pan.
            speed: 1, // make the flying slow
            curve: 1, // change the speed at which it zooms out
    
            // This can be any easing function: it takes a number between
            // 0 and 1 and returns another number between 0 and 1.
            easing: function (t) {
                return t;
            }
        });



      }
    };

    http.send();

  };


  