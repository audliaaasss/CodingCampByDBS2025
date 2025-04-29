// Initialize map
const indonesiaCoor = [-2.548926, 118.0148634];
const myMap = L.map('map', {
  zoom: 5,
  center: indonesiaCoor,
  scrollWheelZoom: false,
});

// Set base map
const osmTileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const baseTile = L.tileLayer(osmTileUrl, {
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
});
baseTile.addTo(myMap);
