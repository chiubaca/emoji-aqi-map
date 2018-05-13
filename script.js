// Emoji picture fall back
twemoji.parse(document.body);

const WAQI_TOKEN = "ce79b4fab3208523b358a65b2eccc4ca6b84b269";
const WAQI_URL = "https://tiles.waqi.info/tiles/usepa-aqi/{z}/{x}/{y}.png?token=" + WAQI_TOKEN;
const WAQI_ATTR = 'Air  Quality  Tiles  &copy;  <a  href="http://waqi.info">waqi.info</a>';

//Arrays to store markers for each classification;
let goodResults = [];
let moderateResults = [];
let sensitiveResults = []; 
let unhealthyResults = [];
let vUnhealthyResults = [];
let hazardousResults = [];

//layers get added to this object to generate clusters
let goodClusters = L.markerClusterGroup();
let moderateClusters = L.markerClusterGroup();
let sensitiveClusters = L.markerClusterGroup();
let unhealthyClusters =  L.markerClusterGroup();
let vUnhealthyClusters = L.markerClusterGroup();
let hazardousClusters = L.markerClusterGroup();

//Initiate Map and layers...
var map = L.map('mapid').setView([51.505, -0.09], 7);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
  maxZoom: 18,
  id: 'mapbox.light',
  accessToken: 'pk.eyJ1IjoiY2hpdWJhY2EiLCJhIjoiY2lrNWp6NzI2MDA0NmlmbTIxdGVybzF3YyJ9.rRBFEm_VY3yRzpMey8ufKA'
}).addTo(map)


// Helper function to reset layers from an array of marker object
function removeLayers(layersArray){
  for(i=0;i<layersArray.length;i++) {
    map.removeLayer(layersArray[i]);
    }
  goodResults = [];
  moderateResults = [];
  sensitiveResults =[];
  unhealthyResults=[];
  vUnhealthyResults = [];
  hazardousResults = [];

}

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


/////////////////////
//--DATA FUNCTIONS//
///////////////////

//Good scores: AQI < 50 
function getGood() {
  //Before retreiving data, clear the existing array
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
      goodClusters.clearLayers()
      goodClusters.addLayer( L.layerGroup(goodResults))
      map.addLayer(goodClusters);
    };
  };
  http.send();
};

//Moderate scores: AQI < 100 && > 51
function getModerate() {
  //Before retreiving data, clear the existing array
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
                                 html: twemoji.parse("🙁")+ "<div class='mod-aqi'>"+result.data[i].aqi+" <div class='line'></div></div>" , 
                                 bgPos:[100,-100] 
                              })          
          marker = new L.marker([result.data[i].lat, result.data[i].lon],  { icon: moderate });
          moderateResults.push(marker)
        }
      };
      //Clustering 
      moderateClusters.clearLayers()
      moderateClusters.addLayer( L.layerGroup(moderateResults))
      map.addLayer(moderateClusters);
    };
  };
  http.send();
};

//Sensitive scores: AQI < 150 && > 101
function getSensitive() {
  //Before retreiving data, clear the existing array
  removeLayers(sensitiveResults)
  let NE = map.getBounds().getNorthEast();
  let SW = map.getBounds().getSouthWest();
  var http = new XMLHttpRequest();
  http.open("GET", `https://api.waqi.info/map/bounds/?latlng=${SW.lat},${SW.lng},${NE.lat},${NE.lng}&token=${WAQI_TOKEN}`, true);
  http.onreadystatechange = function () {
    if (http.readyState == 4 && http.status == 200) {
      var result = JSON.parse(http.response)
      for (i in result.data) {
        if (result.data[i].aqi < 150 && result.data[i].aqi > 101){
            
          let moderate = L.divIcon({ className: 'emoji-icons',
                                 html: twemoji.parse("😨")+ "<div class='sens-aqi'>"+result.data[i].aqi+" <div class='line'></div></div>" , 
                                 bgPos:[100,-100] 
                              })          
          marker = new L.marker([result.data[i].lat, result.data[i].lon],  { icon: moderate });
          sensitiveResults.push(marker)
        }
      };
      //Clustering 
      sensitiveClusters.clearLayers()
      sensitiveClusters.addLayer( L.layerGroup(sensitiveResults))
      map.addLayer(sensitiveClusters);
    };
  };
  http.send();
};

//Unhealthy scores: AQI < 200 && > 151
function getUnhealthy() {
  //Before retreiving data, clear the existing array
  removeLayers(unhealthyResults)
  let NE = map.getBounds().getNorthEast();
  let SW = map.getBounds().getSouthWest();
  var http = new XMLHttpRequest();
  http.open("GET", `https://api.waqi.info/map/bounds/?latlng=${SW.lat},${SW.lng},${NE.lat},${NE.lng}&token=${WAQI_TOKEN}`, true);
  http.onreadystatechange = function () {
    if (http.readyState == 4 && http.status == 200) {
      var result = JSON.parse(http.response)
      for (i in result.data) {
        if (result.data[i].aqi < 200 && result.data[i].aqi > 151){
            
          let unhealthy = L.divIcon({ className: 'emoji-icons',
                                 html: twemoji.parse("😷")+ "<div class='unhealty-aqi'>"+result.data[i].aqi+" <div class='line'></div></div>" , 
                                 bgPos:[100,-100] 
                              })          
          marker = new L.marker([result.data[i].lat, result.data[i].lon],  { icon: unhealthy });
          unhealthyResults.push(marker)
        }
      };
      //Clustering 
      unhealthyClusters.clearLayers()
      unhealthyClusters.addLayer( L.layerGroup(unhealthyResults))
      map.addLayer(unhealthyClusters);
    };
  };
  http.send();
};

//Very Unhealthy scores: AQI < 300 && > 201
function getVUnhealthy() {
  //Before retreiving data, clear the existing array
  removeLayers(unhealthyResults)
  let NE = map.getBounds().getNorthEast();
  let SW = map.getBounds().getSouthWest();
  var http = new XMLHttpRequest();
  http.open("GET", `https://api.waqi.info/map/bounds/?latlng=${SW.lat},${SW.lng},${NE.lat},${NE.lng}&token=${WAQI_TOKEN}`, true);
  http.onreadystatechange = function () {
    if (http.readyState == 4 && http.status == 200) {
      var result = JSON.parse(http.response)
      for (i in result.data) {
        if (result.data[i].aqi < 300 && result.data[i].aqi > 201){
            
          let vUnhealthy = L.divIcon({ className: 'emoji-icons',
                                 html: twemoji.parse("🤢")+ "<div class='v-unhealty-aqi'>"+result.data[i].aqi+" <div class='line'></div></div>" , 
                                 bgPos:[100,-100] 
                              })          
          marker = new L.marker([result.data[i].lat, result.data[i].lon],  { icon: vUnhealthy });
          vUnhealthyResults.push(marker)
        }
      };
      //Clustering 
      vUnhealthyClusters.clearLayers()
      vUnhealthyClusters.addLayer( L.layerGroup(vUnhealthyResults))
      map.addLayer(vUnhealthyClusters);
    };
  };
  http.send();
};



////////////////////
//---MAP EVENTS---//
///////////////////


//Move events to trigger Good levels of pollution
map.on('moveend', function() {
  if(document.getElementById("goodCheck").checked){
    //console.log("good is checked")
    removeLayers(goodResults);
    getGood();
  }else{
    console.log("Good is not checked")
  } 
});

//map move event to trigger moderate levels of pollution
map.on('moveend',function(){
  if(document.getElementById("modCheck").checked){
    removeLayers(moderateResults);
    getModerate();
  }else{
    console.log("Moderate is not checked")
  } 
})

//map move event to trigger sensitive levels of pollution
map.on('moveend',function(){
  if(document.getElementById("sensCheck").checked){
    removeLayers(sensitiveResults);
    getSensitive();
  }else{
    console.log("Sensitive is not checked")
  } 
})

//map move event to trigger unhealthy levels of pollution
map.on('moveend',function(){
  if(document.getElementById("unhealthyCheck").checked){
    removeLayers(unhealthyResults);
    getUnhealthy();
  }else{
    console.log("Unhealthy is not checked")
  } 
})

//map move event to trigger very unhealthy levels of pollution
map.on('moveend',function(){
  if(document.getElementById("vUnhealthyCheck").checked){
    removeLayers(vUnhealthyResults);
    getVUnhealthy();
  }else{
    console.log("Very Unhealthy is not checked")
  } 
})


//////////////////////////
//---TOGGLE SWITCHES ---//
/////////////////////////

//Good Switch
function goodAddRemove(){
  var state = document.getElementById("goodCheck").checked 
  console.log(state)
  if(state === false){
    goodClusters.clearLayers()
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
    moderateClusters.clearLayers()
    removeLayers(moderateResults)
    console.log("moderate is not checked")
  }else{
    console.log("moderate is checked")
    getModerate()
  } 
}

//Sensitive Switch
function sensitiveAddRemove(){
  var state = document.getElementById("sensCheck").checked 
  console.log(state)
  if(state === false){
    sensitiveClusters.clearLayers()
    removeLayers(sensitiveResults)
    console.log("sensitive is not checked")
  }else{
    console.log("sensitive is checked")
    getSensitive()
  } 
}

//Unhealthy Switch
function unhealtyAddRemove(){
  var state = document.getElementById("unhealthyCheck").checked 
  console.log(state)
  if(state === false){
    unhealthyClusters.clearLayers()
    removeLayers(unhealthyClusters)
    console.log("unhealthy is not checked")
  }else{
    console.log("unhealthy is checked")
    getUnhealthy()
  } 
}

//Very Unhealthy Switch
function vUnhealtyAddRemove(){
  var state = document.getElementById("vUnhealthyCheck").checked 
  console.log(state)
  if(state === false){
    vUnhealthyClusters.clearLayers()
    removeLayers(vUnhealthyClusters)
    console.log("very unhealthy is not checked")
  }else{
    console.log("very unhealthy is checked")
    getVUnhealthy()
  } 
}