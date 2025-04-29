// Initialize map
const gedungSateCoor = [-6.9025, 107.6191];
const myMap = L.map('map', {
  zoom: 15,
  center: gedungSateCoor,
  scrollWheelZoom: false,
});

// Set base map
const osmTileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const osmTile = L.tileLayer(osmTileUrl, {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
});
//osmTile.addTo(myMap);
// baseTile.addTo(myMap);

// Add MapTiler layer
const mtLayer = L.maptilerLayer({
  apiKey: 'MY_API_KEY_ON_MAPTILER',
  style: 'https://api.maptiler.com/maps/01967f3c-dcdf-727f-b0ea-95a9379451b7/style.json?key=I2dT0tYl6yn84JaZx08a', // Optional
});
mtLayer.addTo(myMap);