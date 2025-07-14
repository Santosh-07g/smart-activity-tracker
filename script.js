let map, marker, watchId;
const statusDiv = document.getElementById('status');
const networkStatusDiv = document.getElementById('networkStatus');
const startBtn = document.getElementById('startBtn');
const canvas = document.getElementById('activityCanvas');
const ctx = canvas.getContext('2d');
let points = [];

function updateNetworkStatus() {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (connection) {
    networkStatusDiv.innerText = `Network: ${connection.effectiveType}`;
  } else {
    networkStatusDiv.innerText = 'Network info not supported.';
  }
}

function initMap(lat, lng) {
  map = L.map('map').setView([lat, lng], 15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
  }).addTo(map);
  marker = L.marker([lat, lng]).addTo(map);
}

function updateCanvas(x, y) {
  points.push({ x, y });
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.strokeStyle = 'blue';
  ctx.stroke();
}

function handlePosition(position) {
  const lat = position.coords.latitude;
  const lng = position.coords.longitude;
  statusDiv.innerText = `Lat: ${lat.toFixed(4)} | Lng: ${lng.toFixed(4)}`;
  if (!map) initMap(lat, lng);
  marker.setLatLng([lat, lng]);
  map.setView([lat, lng]);
  updateCanvas(lat % 300, lng % 150); // Simulate drawing based on lat/lng
}

function startTracking() {
  if (!navigator.geolocation) {
    statusDiv.innerText = 'Geolocation not supported.';
    return;
  }
  updateNetworkStatus();
  watchId = navigator.geolocation.watchPosition(handlePosition, err => {
    statusDiv.innerText = 'Error getting location';
  }, {
    enableHighAccuracy: true
  });
}

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting && watchId) {
      navigator.geolocation.clearWatch(watchId);
      statusDiv.innerText += ' (Paused)';
    } else if (entry.isIntersecting) {
      startTracking();
    }
  });
});

observer.observe(document.getElementById('mapWrapper'));
startBtn.addEventListener('click', startTracking);
updateNetworkStatus();
