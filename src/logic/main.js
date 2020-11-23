
import L from "leaflet"
import "leaflet.markercluster"
import twemoji from "twemoji"
import { initSearch } from "./geosearch";
import { mean, numberRange, normalise } from "./helpers"

twemoji.parse(document.body);

const WAQI_TOKEN = "ce79b4fab3208523b358a65b2eccc4ca6b84b269";
const WAQI_URL = "https://tiles.waqi.info/tiles/usepa-aqi/{z}/{x}/{y}.png?token=" + WAQI_TOKEN;
const WAQI_ATTR = ' World Air Quality Index  &copy;  <a  href="http://waqi.info">waqi.info</a>';

//Arrays to store markers for each classification;
let goodResults = [];
let moderateResults = [];
let sensitiveResults = [];
let unhealthyResults = [];
let vUnhealthyResults = [];
let hazardousResults = [];

//layers get added to this object to generate clusters
let goodClusters = L.markerClusterGroup({
  iconCreateFunction: function (cluster) {
    let clusterItems = cluster.getAllChildMarkers()
    let aqiList = [];
    let opacityLookup = numberRange(0, 50);
    for (let items in clusterItems) {
      //console.log(clusterItems[items].aqiScore)
      aqiList.push(parseFloat(clusterItems[items].aqiScore))
    }
    return L.divIcon({ className: 'good-cluster', html: "<span style='background: rgba(0, 153, 102,+" + normalise(mean(aqiList), opacityLookup.length) + ")'>" + '≈' + mean(aqiList) + "</span>" });
  }
});
let moderateClusters = L.markerClusterGroup({
  iconCreateFunction: function (cluster) {

    let clusterItems = cluster.getAllChildMarkers()
    let aqiList = [];
    let opacityLookup = numberRange(50, 100);
    for (let items in clusterItems) {
      //console.log(clusterItems[items].aqiScore)
      aqiList.push(parseFloat(clusterItems[items].aqiScore))
    }
    return L.divIcon({ className: 'moderate-cluster', html: "<span style='background: rgba(255, 221, 51,+" + ((normalise(mean(aqiList), opacityLookup.length)) - 1.0) + ")'>" + '≈' + mean(aqiList) + "</span>" });
  }
});
let sensitiveClusters = L.markerClusterGroup({
  iconCreateFunction: function (cluster) {
    let clusterItems = cluster.getAllChildMarkers()
    let aqiList = [];
    let opacityLookup = numberRange(100, 150);
    for (let items in clusterItems) {
      //console.log(clusterItems[items].aqiScore)
      aqiList.push(parseFloat(clusterItems[items].aqiScore))
    }
    return L.divIcon({ className: 'sensitive-cluster', html: "<span style='background: rgba(255, 153, 51,+" + ((normalise(mean(aqiList), opacityLookup.length)) - 2.0) + ")'>" + '≈' + mean(aqiList) + "</span>" });
  }
});
let unhealthyClusters = L.markerClusterGroup({
  iconCreateFunction: function (cluster) {
    let clusterItems = cluster.getAllChildMarkers()
    let aqiList = [];
    let opacityLookup = numberRange(151, 200);
    for (let items in clusterItems) {
      //console.log(clusterItems[items].aqiScore)
      aqiList.push(parseFloat(clusterItems[items].aqiScore))
    }
    return L.divIcon({ className: 'unhealthy-cluster', html: "<span style='background: rgba(204, 0, 51,+" + ((normalise(mean(aqiList), opacityLookup.length)) - 3.0) + ")'>" + '≈' + mean(aqiList) + "</span>" });
  }
});
let vUnhealthyClusters = L.markerClusterGroup({
  iconCreateFunction: function (cluster) {
    let clusterItems = cluster.getAllChildMarkers()
    let aqiList = [];
    let opacityLookup = numberRange(201, 300);
    for (let items in clusterItems) {
      //console.log(clusterItems[items].aqiScore)
      aqiList.push(parseFloat(clusterItems[items].aqiScore))
    }
    return L.divIcon({ className: 'v-unhealthy-cluster', html: "<span style='background: rgba(102, 0, 153,+" + ((normalise(mean(aqiList), opacityLookup.length)) - 1.0) + ")'>" + '≈' + mean(aqiList) + "</span>" });
  }
});
let hazardousClusters = L.markerClusterGroup({
  iconCreateFunction: function (cluster) {
    let clusterItems = cluster.getAllChildMarkers()
    let aqiList = [];
    let opacityLookup = numberRange(300, 999);
    for (let items in clusterItems) {
      //console.log(clusterItems[items].aqiScore)
      aqiList.push(parseFloat(clusterItems[items].aqiScore))
    }
    return L.divIcon({ className: 'hazardous-cluster', html: "<span style='background: rgba(126, 0, 35,+" + ((normalise(mean(aqiList), opacityLookup.length))) + ")'>" + '≈' + mean(aqiList) + "</span>" });
  }
});

//Initiate Map and layers...
console.log("Loading map")

let map = L.map('mapid', { zoomControl: false }).setView([51.505, -0.09], 7);

L.tileLayer('https://api.maptiler.com/maps/voyager/{z}/{x}/{y}.png?key={accessToken}', {
  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>,' + WAQI_ATTR,
  maxZoom: 18,
  accessToken: 'UrB6eUgP5z7iW5eaEk0j'
}).addTo(map)


L.control.zoom({
  position: 'bottomright'
}).addTo(map);


/////////////////////
//Helper functions//
///////////////////

//Reset layers from an array of marker object
function removeLayers(layersArray) {
  for (let i = 0; i < layersArray.length; i++) {
    map.removeLayer(layersArray[i]);
  }
  goodResults = [];
  moderateResults = [];
  sensitiveResults = [];
  unhealthyResults = [];
  vUnhealthyResults = [];
  hazardousResults = [];
}

//Popup with additional AQI data
function dataPopup(onClickEvent) {
  // let lat = onClickEvent.latlng.lat;
  // let lng = onClickEvent.latlng.lng;
  console.log(`https://api.waqi.info/feed/geo:${onClickEvent.latlng.lat};${onClickEvent.latlng.lng}/?token=${WAQI_TOKEN}`);

  fetch(`https://api.waqi.info/feed/geo:${onClickEvent.latlng.lat};${onClickEvent.latlng.lng}/?token=${WAQI_TOKEN}`)
    .then(function (response) {
      if (response.ok) {
        //console.log(response)
        return response.json()
      }
      throw new Error('Network response was not ok.');
    }).then(function (resObj) {
      if (resObj.data != null) {
        console.log(resObj)
        //TODO: Loop through attributions: 
        //Check resObj.data.attribution array is > 1 
        //Then push all items in array somewhere
        console.log(resObj.data.attributions);
        //TODO:Loop through all object in iaqi object 
        //forEach over all values in resObj.data.iaqi  
        //Then push data somewhere - Can then be used in a chart.
        console.log(resObj.data.iaqi);
        let popup = L.popup({
          autoPanPaddingTopLeft: L.point(0, -100),
          minWidth: 250,
          maxWidth: 250,
          maxHeight: 100,
        })
          .setLatLng(onClickEvent.latlng)
          .setContent(
            ` 
                         <h1> <a target="_blank" href=${String(resObj.data.city.url)}>${resObj.data.city.name}</a> </h1>
                         <h2>(Last Updated: ${String(resObj.data.time.s)})</h2>
                         <br/> 
                         <h3>Data Source :
                         <a target="_blank" href=${String(resObj.data.attributions[0].url)}>${resObj.data.attributions[0].name}</a> 
                         </h3>
                         `
          )
          .openOn(map);
        ////TO DO: CHART JS, need to loop through iaqi object to populate data labels
      } else {
        console.log("Problem getting data")
      };
    })
    .catch(function (error) {
      console.log('request failed', error)
    });
};

/////////////////////
//--DATA FUNCTIONS//
///////////////////

//TO DO: Too much repeated code. Make it more DRY.

//Good scores: AQI < 50 
function getGood() {
  //Before retreiving data, clear the existing array
  removeLayers(goodResults)
  let NE = map.getBounds().getNorthEast();
  let SW = map.getBounds().getSouthWest();
  let aqiScore;
  let http = new XMLHttpRequest();
  http.open("GET", `https://api.waqi.info/map/bounds/?latlng=${SW.lat},${SW.lng},${NE.lat},${NE.lng}&token=${WAQI_TOKEN}`, true);
  http.onreadystatechange = function () {
    if (http.readyState == 4 && http.status == 200) {
      let result = JSON.parse(http.response)
      for (let i in result.data) {
        if (result.data[i].aqi < 50) {
          let good = L.divIcon({
            className: 'emoji-icons',
            html: twemoji.parse("😀") + "<div class='aqi-flag good'>" + result.data[i].aqi + " <div class='line'></div></div>",

          })
          let marker = new L.marker([result.data[i].lat, result.data[i].lon], { icon: good });
          marker.aqiScore = result.data[i].aqi;
          goodResults.push(marker);

          marker.on("click", function (event) {
            dataPopup(event);
          });
        }
      };
      //Clustering 
      goodClusters.clearLayers()
      goodClusters.addLayer(L.layerGroup(goodResults))
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
  let http = new XMLHttpRequest();
  http.open("GET", `https://api.waqi.info/map/bounds/?latlng=${SW.lat},${SW.lng},${NE.lat},${NE.lng}&token=${WAQI_TOKEN}`, true);
  http.onreadystatechange = function () {
    if (http.readyState == 4 && http.status == 200) {
      let result = JSON.parse(http.response)
      for (let i in result.data) {
        if (result.data[i].aqi < 100 && result.data[i].aqi > 51) {

          let moderate = L.divIcon({
            className: 'emoji-icons',
            html: twemoji.parse("🙁") + "<div class='aqi-flag moderate'>" + result.data[i].aqi + " <div class='line'></div></div>",
            bgPos: [100, -100]
          })
          let marker = new L.marker([result.data[i].lat, result.data[i].lon], { icon: moderate });
          marker.aqiScore = result.data[i].aqi;
          moderateResults.push(marker)

          marker.on("click", function (event) {
            dataPopup(event);
          });
        }
      };
      //Clustering 
      moderateClusters.clearLayers()
      moderateClusters.addLayer(L.layerGroup(moderateResults))
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
  let http = new XMLHttpRequest();
  http.open("GET", `https://api.waqi.info/map/bounds/?latlng=${SW.lat},${SW.lng},${NE.lat},${NE.lng}&token=${WAQI_TOKEN}`, true);
  http.onreadystatechange = function () {
    if (http.readyState == 4 && http.status == 200) {
      let result = JSON.parse(http.response)
      for (let i in result.data) {
        if (result.data[i].aqi < 150 && result.data[i].aqi > 101) {

          let moderate = L.divIcon({
            className: 'emoji-icons',
            html: twemoji.parse("😨") + "<div class='aqi-flag sensitive'>" + result.data[i].aqi + " <div class='line'></div></div>",
            bgPos: [100, -100]
          })
          let marker = new L.marker([result.data[i].lat, result.data[i].lon], { icon: moderate });
          marker.aqiScore = result.data[i].aqi;
          sensitiveResults.push(marker)

          marker.on("click", function (event) {
            dataPopup(event);
          });
        }
      };
      //Clustering 
      sensitiveClusters.clearLayers()
      sensitiveClusters.addLayer(L.layerGroup(sensitiveResults))
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
  let http = new XMLHttpRequest();
  http.open("GET", `https://api.waqi.info/map/bounds/?latlng=${SW.lat},${SW.lng},${NE.lat},${NE.lng}&token=${WAQI_TOKEN}`, true);
  http.onreadystatechange = function () {
    if (http.readyState == 4 && http.status == 200) {
      let result = JSON.parse(http.response)
      for (let i in result.data) {
        if (result.data[i].aqi < 200 && result.data[i].aqi > 151) {

          let unhealthy = L.divIcon({
            className: 'emoji-icons',
            html: twemoji.parse("😷") + "<div class='aqi-flag unhealty'>" + result.data[i].aqi + " <div class='line'></div></div>",
            bgPos: [100, -100]
          })
          let marker = new L.marker([result.data[i].lat, result.data[i].lon], { icon: unhealthy });
          marker.aqiScore = result.data[i].aqi;
          unhealthyResults.push(marker)

          marker.on("click", function (event) {
            dataPopup(event);
          });
        }
      };
      //Clustering 
      unhealthyClusters.clearLayers()
      unhealthyClusters.addLayer(L.layerGroup(unhealthyResults))
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
  let http = new XMLHttpRequest();
  http.open("GET", `https://api.waqi.info/map/bounds/?latlng=${SW.lat},${SW.lng},${NE.lat},${NE.lng}&token=${WAQI_TOKEN}`, true);
  http.onreadystatechange = function () {
    if (http.readyState == 4 && http.status == 200) {
      let result = JSON.parse(http.response)
      for (let i in result.data) {
        if (result.data[i].aqi < 300 && result.data[i].aqi > 201) {

          let vUnhealthy = L.divIcon({
            className: 'emoji-icons',
            html: twemoji.parse("🤢") + "<div class='aqi-flag v-unhealty'>" + result.data[i].aqi + " <div class='line'></div></div>",
            bgPos: [100, -100]
          })
          let marker = new L.marker([result.data[i].lat, result.data[i].lon], { icon: vUnhealthy });
          marker.aqiScore = result.data[i].aqi;
          vUnhealthyResults.push(marker)

          marker.on("click", function (event) {
            dataPopup(event);
          });
        }
      };
      //Clustering 
      vUnhealthyClusters.clearLayers()
      vUnhealthyClusters.addLayer(L.layerGroup(vUnhealthyResults))
      map.addLayer(vUnhealthyClusters);
    };
  };
  http.send();
};


//Hazardous scores: AQI > 300
function getHazardous() {
  //Before retreiving data, clear the existing array
  removeLayers(hazardousResults)
  let NE = map.getBounds().getNorthEast();
  let SW = map.getBounds().getSouthWest();
  let http = new XMLHttpRequest();
  http.open("GET", `https://api.waqi.info/map/bounds/?latlng=${SW.lat},${SW.lng},${NE.lat},${NE.lng}&token=${WAQI_TOKEN}`, true);
  http.onreadystatechange = function () {
    if (http.readyState == 4 && http.status == 200) {
      let result = JSON.parse(http.response)
      for (let i in result.data) {
        if (result.data[i].aqi > 300) {

          let hazard = L.divIcon({
            className: 'emoji-icons',
            html: twemoji.parse("💀") + "<div class='aqi-flag hazardous'>" + result.data[i].aqi + " <div class='line'></div></div>",
            bgPos: [100, -100]
          })
          let marker = new L.marker([result.data[i].lat, result.data[i].lon], { icon: hazard });
          marker.aqiScore = result.data[i].aqi;
          hazardousResults.push(marker)

          marker.on("click", function (event) {
            dataPopup(event);
          });
        }
      };
      //Clustering 
      hazardousClusters.clearLayers()
      hazardousClusters.addLayer(L.layerGroup(hazardousResults))
      map.addLayer(hazardousClusters);
    };
  };
  http.send();
};


////////////////////
//---MAP EVENTS---//
///////////////////

//Move events to trigger Good levels of pollution
map.on('moveend', function () {
  if (document.getElementById("goodCheck").checked) {
    //console.log("good is checked")
    removeLayers(goodResults);
    getGood();
  } else {
    //console.log("Good is not checked")
  }
});

//map move event to trigger moderate levels of pollution
map.on('moveend', function () {
  if (document.getElementById("modCheck").checked) {
    removeLayers(moderateResults);
    getModerate();
  } else {
    //console.log("Moderate is not checked")
  }
})

//map move event to trigger sensitive levels of pollution
map.on('moveend', function () {
  if (document.getElementById("sensCheck").checked) {
    removeLayers(sensitiveResults);
    getSensitive();
  } else {
    //console.log("Sensitive is not checked")
  }
})

//map move event to trigger unhealthy levels of pollution
map.on('moveend', function () {
  if (document.getElementById("unhealthyCheck").checked) {
    removeLayers(unhealthyResults);
    getUnhealthy();
  } else {
    //console.log("Unhealthy is not checked")
  }
})

//map move event to trigger very unhealthy levels of pollution
map.on('moveend', function () {
  if (document.getElementById("vUnhealthyCheck").checked) {
    removeLayers(vUnhealthyResults);
    getVUnhealthy();
  } else {
    // //console.log("Very Unhealthy is not checked")
  }
})

//map move event to trigger hazardous levels of pollution
map.on('moveend', function () {
  if (document.getElementById("hazardousCheck").checked) {
    removeLayers(hazardousResults);
    getHazardous();
  } else {
    //console.log("Hazardous is not checked")
  }
})


//TODO: Get info about station on click

//////////////////////////
//---TOGGLE SWITCHES ---//
/////////////////////////

//Good Switch
function goodAddRemove() {
  let state = document.getElementById("goodCheck").checked
  //console.log(state)
  if (state === false) {
    goodClusters.clearLayers()
    removeLayers(goodResults)
    console.log("good is not checked")
  } else {
    console.log("good is checked")
    getGood()
  }
}

//Moderate Switch
function modAddRemove() {
  let state = document.getElementById("modCheck").checked
  //console.log(state)
  if (state === false) {
    moderateClusters.clearLayers()
    removeLayers(moderateResults)
    console.log("moderate is not checked")
  } else {
    console.log("moderate is checked")
    getModerate()
  }
}

//Sensitive Switch
function sensitiveAddRemove() {
  let state = document.getElementById("sensCheck").checked
  //console.log(state)
  if (state === false) {
    sensitiveClusters.clearLayers()
    removeLayers(sensitiveResults)
    console.log("sensitive is not checked")
  } else {
    console.log("sensitive is checked")
    getSensitive()
  }
}

//Unhealthy Switch
function unhealtyAddRemove() {
  let state = document.getElementById("unhealthyCheck").checked
  //console.log(state)
  if (state === false) {
    unhealthyClusters.clearLayers()
    removeLayers(unhealthyClusters)
    console.log("unhealthy is not checked")
  } else {
    console.log("unhealthy is checked")
    getUnhealthy()
  }
}

//Very Unhealthy Switch
function vUnhealtyAddRemove() {
  let state = document.getElementById("vUnhealthyCheck").checked
  //console.log(state)
  if (state === false) {
    vUnhealthyClusters.clearLayers()
    removeLayers(vUnhealthyClusters)
    console.log("very unhealthy is not checked")
  } else {
    console.log("very unhealthy is checked")
    getVUnhealthy()
  }
}

//Hazardous Switch
function hazardousAddRemove() {
  let state = document.getElementById("hazardousCheck").checked
  //console.log(state)
  if (state === false) {
    hazardousClusters.clearLayers()
    removeLayers(hazardousClusters)
    console.log("hazardous is not checked")
  } else {
    console.log("hazardous is checked")
    getHazardous()
  }
}

initSearch(map);

window.onload = function () {
  console.log("Window is loaded");
  goodAddRemove();
  modAddRemove();
  sensitiveAddRemove();
  unhealtyAddRemove();
  vUnhealtyAddRemove();
  hazardousAddRemove();
};