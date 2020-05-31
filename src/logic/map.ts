import L from "leaflet"

export function renderMap() {
  const WAQI_TOKEN = "ce79b4fab3208523b358a65b2eccc4ca6b84b269";
  const WAQI_URL = "https://tiles.waqi.info/tiles/usepa-aqi/{z}/{x}/{y}.png?token=" + WAQI_TOKEN;
  const WAQI_ATTR = ' World Air Quality Index  &copy;  <a  href="http://waqi.info">waqi.info</a>';

  //Initiate Map and layers...
  console.log("Loading map")
  let map = L.map('mapid', { zoomControl: false }).setView([51.505, -0.09], 7);

  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>,' + WAQI_ATTR,
    maxZoom: 18,
    id: 'mapbox.light',
    accessToken: 'pk.eyJ1IjoiY2hpdWJhY2EiLCJhIjoiY2lrNWp6NzI2MDA0NmlmbTIxdGVybzF3YyJ9.rRBFEm_VY3yRzpMey8ufKA'
  }).addTo(map)


  L.control.zoom({
    position: 'bottomright'
  }).addTo(map);

}