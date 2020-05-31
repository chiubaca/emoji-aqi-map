export function initSearch() {
  // Map Tiler Geocoding Service //
  var autocomplete = new kt.OsmNamesAutocomplete(
    'search', 'https://geocoder.tilehosting.com/', 'UrB6eUgP5z7iW5eaEk0j');
  autocomplete.registerCallback(function (item) {
    console.log(`geocode result: ${item.lon} ${item.lat}`)
    map.flyTo([item.lat, item.lon], 11)
  });
}