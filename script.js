// ===============================
// MAPA BASE
// ===============================
const map = L.map('map', {
  maxZoom: 18,
  minZoom: 11
}).setView([48.2085, 16.3721], 13);

// Tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// ===============================
// CONSTANTES
// ===============================
const WORLD_POLYGON = [
  [-90, -180],
  [-90, 180],
  [90, 180],
  [90, -180]
];

// ===============================
// BOUNDARY REAL DE VIENNA (Wien)
// ===============================
async function loadViennaBoundary() {
  const res = await fetch(
    "https://overpass-api.de/api/interpreter?data=[out:json];relation[name='Wien'][boundary=administrative];out geom;"
  );
  const osm = await res.json();

  const viennaCoords = osm.elements[0].geometry.map(p => [p.lat, p.lon]);

  // Máscara escura fora de Vienna
  L.polygon([WORLD_POLYGON, viennaCoords], {
    fillColor: "#000",
    fillOpacity: 0.6,
    stroke: false
  }).addTo(map);

  // Contorno de Vienna
  const viennaLayer = L.polygon(viennaCoords, {
    color: "#00ffff",
    weight: 3,
    fillOpacity: 0.05
  }).addTo(map);

  // Ajustes do mapa
  map.fitBounds(viennaLayer.getBounds());
  map.setMaxBounds(viennaLayer.getBounds());
}

loadViennaBoundary();

// ===============================
// GEOCODING (NOMINATIM)
// ===============================
async function geocode(name) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(name + ", Wien, Austria")}`;
  const res = await fetch(url);
  const data = await res.json();

  if (!data || data.length === 0) return null;
  return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
}

// ===============================
// PONTOS DE INTERESSE
// ===============================
const lugaresTipo1 = [
  ["Schönbrunn Park", "PARK OF THE PAID MUSEUM, OPEN 6:30-21:00"],
  ["Burggarten", "GARTEN, OPEN 6:00-22:00"],
  ["Justizpalast Wien", "MUSEUM, OPEN 07:30-15:30"],
  ["Austrian Parliament Building", "FREE GUIDED TOURS, OPEN 9:00-17:00"],
  ["Volksgarten Wien", "GARTEN, OPEN 6:00-21:00"],
  ["Rathaus Wien", "CASTLE, OPEN 7:30-17:00"],
  ["Votivkirche Wien", "CASTLE, OPEN 9:00-18:00"],
  ["Palais Kinsky Wien", "CASTLE, OPEN 10:00-18:00"],
  ["Ferstel Passage", "CASTLE, OPEN 10:00-20:00"],
  ["Palais Ferstel Wien", "CASTLE, OPEN 10:00-20:00"],
  ["Palais Equitable", "CASTLE, OPEN 8:00-18:00"],
  ["Peterskirche Wien", "CASTLE, OPEN 7:00-20:00"],
  ["Jesuiterkirche", "CHURCH, OPEN 7:00-21:00"],
  ["Franz von Assisi Kirche Wien", "CHURCH, OPEN 8:00-20:00"],
  ["Hundertwasserhaus Wien", "FUNKY PLACE, OPEN 24 HOURS"],
  ["Stephansdom", "CHURCH, OPEN 6:00-22:00"],
];

const lugaresTipo2 = [
  ["Schönbrunn Palace", "25 EUROS (34 TO SEE EVERYTHING), OPEN 8:30-17:30"],
  ["Hofburg Palace", "20 EUROS, OPEN 9:00-17:30"],
  ["National Library of Austria", "9 EUROS, OPEN 10:00-18:00"],
  ["Belvedere Palace", "22 EUROS BOTH LOCATIONS, OPEN 10:00-18:00"],
  ["Secession Building Wien", "9 EUROS, OPEN 10:00-18:00"],
  ["Leopold Museum Wien", "15 EUROS, OPEN 10:00-18:00"],
  ["Kunsthistorisches Museum Wien", "11 EUROS F/ STUDENTS, OPEN 10:00-18:00"],
  ["Butterfly House Vienna", "5 EUROS F/ STUDENTS, OPEN 10:00-16:45"],
  ["Naturhistorisches Museum Wien", "7 EUROS F/ STUDENTS, OPEN 9:00-18:30"],
  ["Karlskirche Wien", "5 EUROS F/ STUDENTS, OPEN 9:00-18:00"],
  ["Albertina Museum Wien", "11 EUROS F/ STUDENTS, OPEN 10:00-18:00"],
  ["Otto Wagner Villa Wien", "7 EUROS F/ STUDENTS, OPEN 10:00-17:00"],
];

// ===============================
// RENDERIZAÇÃO DOS PONTOS
// ===============================
async function renderFunction(lugares, color) {
  for (const place of lugares) {
    const coords = await geocode(place[0]);
    if (!coords) continue;

    const gmaps = `https://www.google.com/maps/search/?api=1&query=${place[0].replaceAll(" ", "+")},+Vienna,+Austria`;

    const marker = L.circleMarker(coords, {
      color,
      radius: 6,
      weight: 2,
      fillOpacity: 0.9
    }).addTo(map);

    // Tooltip só no hover
    marker.bindTooltip(place[0], {
      direction: "top",
      opacity: 0.9,
      sticky: true
    });

    // Popup fixo ao clicar
    marker.bindPopup(`
      <h2>${place[0]}, </h2>
      <h3>${place[1]}, </h3>
      <a href="${gmaps}" target="_blank">
        Abrir no Google Maps<br>
        ${place[0]}
      </a>
    `);
  }
}

renderFunction(lugaresTipo1, "green");
renderFunction(lugaresTipo2, "red");
renderFunction([["International Busterminal", ""]], "yellow");
renderFunction([["Holiday Hostel", ""]], "yellow");

// ===============================
// ADICIONANDO MANUALMENTE UM PONTO FORA DO GEOCODER
// ===============================
const lat = 48.198329;
const lon = 16.332843;
const gmaps = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;

const hostel = L.circleMarker([lat, lon], {
  color: "yellow",
  radius: 6,
  weight: 2,
  fillOpacity: 0.9
}).addTo(map);

// Tooltip no hover
hostel.bindTooltip("Hostelll", {
  direction: "top",
  opacity: 0.9,
  sticky: true
});

// Popup fixo no clique
hostel.bindPopup(`
  <h2>HOSTEL</h2>
  <a href="${gmaps}" target="_blank">
    Abrir no Google Maps<br>
  </a>
`);
