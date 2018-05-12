// Emoji picture fall back
twemoji.parse(document.body);

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

//layers get added to this object to generate clusters
var goodMarkerClusters = L.markerClusterGroup();
var modMarkerClusters = L.markerClusterGroup();

//Initiate Map and layers...
var map = L.map('mapid').setView([51.505, -0.09], 7);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
  maxZoom: 18,
  id: 'mapbox.streets',
  accessToken: 'pk.eyJ1IjoiY2hpdWJhY2EiLCJhIjoiY2lrNWp6NzI2MDA0NmlmbTIxdGVybzF3YyJ9.rRBFEm_VY3yRzpMey8ufKA'
}).addTo(map)

//AJAX reqeust to grab pollution json from AQI api
function getPollution(lat, long) {
  var http = new XMLHttpRequest();
  http.open("GET", `https://api.waqi.info/feed/geo:${lat};${long}/?token=${WAQI_TOKEN}`, true);
  http.onreadystatechange = function () {
    if (http.readyState == 4 && http.status == 200) {
      var result = JSON.parse(http.response)
      console.log(`FROM API: Lat: ${result.data.city.geo[0]}  Long: ${result.data.city.geo[1]}`);
      //TO DO: need to implement error handling here:
    }
  };
  http.send();
};

// retrives pollution data of current map view for AQI "bounds" by using the map NE and SW coordinates
function returnDataInView() {
  var NE = map.getBounds().getNorthEast();
  var SW = map.getBounds().getSouthWest();

  var http = new XMLHttpRequest();
  http.open("GET", `https://api.waqi.info/map/bounds/?latlng=${SW.lat},${SW.lng},${NE.lat},${NE.lng}&token=${WAQI_TOKEN}`, true);
  http.onreadystatechange = function () {
    if (http.readyState == 4 && http.status == 200) {
      var result = JSON.parse(http.response)
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

//Good: Call to get data with an AQI score of less than 50 
function getGood() {
  
  removeLayers(goodResults)
  let NE = map.getBounds().getNorthEast();
  let SW = map.getBounds().getSouthWest();
  var http = new XMLHttpRequest();
  http.open("GET", `https://api.waqi.info/map/bounds/?latlng=${SW.lat},${SW.lng},${NE.lat},${NE.lng}&token=${WAQI_TOKEN}`, true);
  http.onreadystatechange = function () {
    if (http.readyState == 4 && http.status == 200) {
      var result = JSON.parse(http.response)
      for (i in result.data) {
        if (result.data[i].aqi < 50){
          let good = L.divIcon({ className: 'emoji-icons',
                                 html: twemoji.parse("😀")+ "<div class='good-aqi'>"+result.data[i].aqi+" <div class='line'></div></div>" , 
                                 bgPos:[100,-100] 
                              })          
          marker = new L.marker([result.data[i].lat, result.data[i].lon],  { icon: good });
          goodResults.push(marker)
        }
      };
      //Clustering 
      goodMarkerClusters.clearLayers()
      goodMarkerClusters.addLayer( L.layerGroup(goodResults))
      map.addLayer(goodMarkerClusters);
      //goodMarkerClusters.refreshClusters( L.layerGroup(goodResults))
    };
  };
  http.send();
};

//Moderate: Gets data with an AQI score of greater than 51 & < 100 
function getMod() {
  
  removeLayers(moderateResults)
  let NE = map.getBounds().getNorthEast();
  let SW = map.getBounds().getSouthWest();
  var http = new XMLHttpRequest();
  http.open("GET", `https://api.waqi.info/map/bounds/?latlng=${SW.lat},${SW.lng},${NE.lat},${NE.lng}&token=${WAQI_TOKEN}`, true);
  http.onreadystatechange = function () {
    if (http.readyState == 4 && http.status == 200) {
      var result = JSON.parse(http.response)
      for (i in result.data) {
        if (result.data[i].aqi < 100 && result.data[i].aqi > 51){
          
          let moderate = L.divIcon({ className: 'emoji-icons',
                                 html: "🙁"+ "<div class='mod-aqi'>"+result.data[i].aqi+" <div class='line'></div></div>" , 
                                 bgPos:[100,-100] 
                              })          
          marker = new L.marker([result.data[i].lat, result.data[i].lon],  { icon: moderate });
          moderateResults.push(marker)
        }
      };
      //Clustering 
      modMarkerClusters.clearLayers()
      modMarkerClusters.addLayer( L.layerGroup(moderateResults))
      map.addLayer(modMarkerClusters);
    };
  };
  http.send();
};


//Function to remove layers from an array of maker objects
function removeLayers(layersArray){
  for(i=0;i<layersArray.length;i++) {
    map.removeLayer(layersArray[i]);
    }
  goodResults = [];
  moderateResults = [];
}

//map move event to trigger good levels of pollution
map.on('moveend', function() {
  

  if(document.getElementById("goodCheck").checked){
    //console.log("good is checked")
    removeLayers(goodResults);
    removeLayers(moderateResults);
    getGood();
    getMod();
  }else{
    //console.log("good is not checked")
  } 
   
});

//map move event to trigger moderate levels of pollution
map.on('moveend',function(){
  console.log("another movend event")
})

//TODO: behaviour for toggle switches 
// Toggle Switches //

//Good Switch
function goodAddRemove(){
  var state = document.getElementById("goodCheck").checked 
  console.log(state)
  if(state === false){
    goodMarkerClusters.clearLayers()
    removeLayers(goodResults)
    console.log("good is not checked")
  }else{

    console.log("good is checked")
    getGood()
  } 
}

//Moderate Switch
function modAddRemove(){
  var state = document.getElementById("modCheck").checked 
  console.log(state)
  if(state === false){
    modMarkerClusters.clearLayers()
    removeLayers(moderateResults)
    console.log("moderate is not checked")
  }else{

    console.log("moderate is checked")
    getMod()
  } 
}