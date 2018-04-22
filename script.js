const WAQI_TOKEN = "ce79b4fab3208523b358a65b2eccc4ca6b84b269";
const WAQI_URL = "https://tiles.waqi.info/tiles/usepa-aqi/{z}/{x}/{y}.png?token=" + WAQI_TOKEN;
const WAQI_ATTR = 'Air  Quality  Tiles  &copy;  <a  href="http://waqi.info">waqi.info</a>';

//custom divIcon see - http://leafletjs.com/reference-1.3.0.html#divicon

let moderate =    L.divIcon({ className: '', html: '🙁' });
let senstive =    L.divIcon({ className: '', html: '😷' });
let unhealthy =   L.divIcon({ className: '', html: '😨' }); 
let v_unhealthy = L.divIcon({ className: '', html: '🤢' }); 
let hazardous =   L.divIcon({ className: '', html: '💀' }); 

//Arrays to store markers for each classification;
let goodResults = [];
let moderateResults = [];
let sensitiveResults = []; 
let unhealthyResults = [];
let v_unhealthyResults = [];
let hazardousResults = [];


//Initiate Map and layers...
var map = L.map('mapid').setView([51.505, -0.09], 7);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
  maxZoom: 18,
  id: 'mapbox.streets',
  accessToken: 'pk.eyJ1IjoiY2hpdWJhY2EiLCJhIjoiY2lrNWp6NzI2MDA0NmlmbTIxdGVybzF3YyJ9.rRBFEm_VY3yRzpMey8ufKA'
}).addTo(map)

//AQI tile layer for live pollution data
// L.tileLayer(WAQI_URL, { 
//   attribution: WAQI_ATTR,
//   minZoom:8
// }).addTo(map);


//This can replace the customControl Class,
L.easyButton('<div>🔥</div>', function () {
  //alert('you just clicked a font awesome icon');
  returnDataInView();
}).addTo(map);


L.easyButton('<div>❌</div>', function () {
  removeLayers(goodResults)
  }).addTo(map);

//Exeprimental..Map on click event not being used for anything atm
map.on('click', function (e) {
  //returnDataInView()
  //console.log(`FROM CLICK Lat: ${e.latlng.lat} Long: ${e.latlng.lng}`);
  //map.flyTo([e.latlng.lat,e.latlng.lng], 9)
  //getPollution(e.latlng.lat, e.latlng.lng)
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

function removeAllPoints(){
  map.eachLayer(function(l){
  //l.remove()
   console.log(l)  


  })
//   L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
//   attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
//   maxZoom: 18,
//   id: 'mapbox.streets',
//   accessToken: 'pk.eyJ1IjoiY2hpdWJhY2EiLCJhIjoiY2lrNWp6NzI2MDA0NmlmbTIxdGVybzF3YyJ9.rRBFEm_VY3yRzpMey8ufKA'
// }).addTo(map)
}

function returnDataInView() {
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
          L.marker([result.data[i].lat, result.data[i].lon], { icon: hazardous }).addTo(map);
        }
        if (result.data[i].aqi < 300 && result.data[i].aqi > 201){
          L.marker([result.data[i].lat, result.data[i].lon], { icon: v_unhealthy }).addTo(map);
        }
        if (result.data[i].aqi < 200 && result.data[i].aqi > 151){
          L.marker([result.data[i].lat, result.data[i].lon], { icon: unhealthy }).addTo(map);
        }
        if (result.data[i].aqi < 150 && result.data[i].aqi > 101){
          L.marker([result.data[i].lat, result.data[i].lon], { icon: senstive }).addTo(map);
        }
        if (result.data[i].aqi < 100 && result.data[i].aqi > 51){
          L.marker([result.data[i].lat, result.data[i].lon], { icon: moderate }).addTo(map);
        }
        if (result.data[i].aqi < 50){          
          L.marker([result.data[i].lat, result.data[i].lon], { icon: good }).addTo(map);
        }
       
      };
    };
  };
  http.send();
};
 
function getGood() {
  removeLayers(goodResults)
  let NE = map.getBounds().getNorthEast();
  let SW = map.getBounds().getSouthWest();
  var http = new XMLHttpRequest();
  http.open("GET", `https://api.waqi.info/map/bounds/?latlng=${SW.lat},${SW.lng},${NE.lat},${NE.lng}&token=${WAQI_TOKEN}`, true);
  http.onreadystatechange = function () {
    if (http.readyState == 4 && http.status == 200) {
      var result = JSON.parse(http.response)
      //let good = L.divIcon({ className: '', html: '😀' +  })
      console.log(result)
      for (i in result.data) {
        if (result.data[i].aqi < 50){
          let good = L.divIcon({ className: 'emoji-icons',
                                 html: "😀"+ "<div class='good-aqi'>"+result.data[i].aqi+"</div>" , 
                                 bgPos:[100,-100] 
                              })          
          marker = new L.marker([result.data[i].lat, result.data[i].lon],  { icon: good });
          goodResults.push(marker)
        }
      };
      L.layerGroup(goodResults).addTo(map)
    };
  };
  http.send();
};

// Function to remove layers from an array of maker objects
function removeLayers(layersArray){
  for(i=0;i<goodResults.length;i++) {
    map.removeLayer(layersArray[i]);
    }
  
  goodResults = [];

}

map.on('moveend', function() {
  // code stuff
  let NE = map.getBounds().getNorthEast();
  let SW = map.getBounds().getSouthWest();
  // console.log(`NE Coordinate ${NE} `)
  // console.log(`SW Coordinate ${SW} `)
  

  if(document.getElementById("goodCheck").checked){
    console.log("good is checked")
    removeLayers(goodResults)
    getGood()
  }else{
    console.log("good is not checked")
  } 
   
});

//TODO: behaviour for toggle switches 
// Toggle Switches //
