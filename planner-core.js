/* =========================================================
   PHILIPPINES TRANSPORTATION PLANNING MAP
   ========================================================= */


/* =========================================================
   1. BASIC SETTINGS
   ========================================================= */

let KM_PER_UNIT = 10;

let METERS_PER_UNIT =
  KM_PER_UNIT * 1000;

const X_MIN = -200;
const X_MAX = 200;

const Y_MIN = -200;
const Y_MAX = 200;


/* =========================================================
   2. CALIBRATIONS
   ========================================================= */

const calibrations = {

  philippines: {
    name: "Philippines — Whole Country",
    lat: 12.8797,
    lng: 121.7740
  },

  region1: {
    name: "Region I — Ilocos Region",
    lat: 16.55,
    lng: 120.45
  },

  region2: {
    name: "Region II — Cagayan Valley",
    lat: 17.6567,
    lng: 121.7333
  },

  region3: {
    name: "Region III — Central Luzon",
    lat: 15.20,
    lng: 120.75
  },

  region4a: {
    name: "Region IV-A — CALABARZON",
    lat: 14.10,
    lng: 121.25
  },

  region4b: {
    name: "Region IV-B — MIMAROPA",
    lat: 11.90,
    lng: 121.50
  },

  region5: {
    name: "Region V — Bicol Region",
    lat: 13.35,
    lng: 123.40
  },

  region6: {
    name: "Region VI — Western Visayas",
    lat: 11.00,
    lng: 122.00
  },

  region7: {
    name: "Region VII — Central Visayas",
    lat: 10.25,
    lng: 123.75
  },

  region8: {
    name: "Region VIII — Eastern Visayas",
    lat: 11.30,
    lng: 125.00
  },

  region9: {
    name: "Region IX — Zamboanga Peninsula",
    lat: 7.85,
    lng: 123.20
  },

  region10: {
    name: "Region X — Northern Mindanao",
    lat: 8.75,
    lng: 124.85
  },

  region11: {
    name: "Region XI — Davao Region",
    lat: 7.10,
    lng: 125.60
  },

  region12: {
    name: "Region XII — SOCCSKSARGEN",
    lat: 6.60,
    lng: 124.72
  },

  region13: {
    name: "Region XIII — Caraga",
    lat: 8.80,
    lng: 125.80
  },

  nir: {
    name: "Negros Island Region — NIR",
    lat: 10.00,
    lng: 123.10
  },

  car: {
    name: "Cordillera Administrative Region — CAR",
    lat: 17.25,
    lng: 120.80
  },

  ncr: {
    name: "National Capital Region — NCR",
    lat: 14.60,
    lng: 121.00
  },

  barmm: {
    name: "BARMM",
    lat: 7.95,
    lng: 124.35
  }

};


/* =========================================================
   3. MAP
   ========================================================= */

const map =
  L.map(
    "map",
    {
      dragging: false,

      zoomControl: true,

      scrollWheelZoom: true,

      doubleClickZoom: false,

      attributionControl: true
    }
  );

/* Keep route drawing visibly above the Cartesian SVG/grid. */
map.createPane("routePreviewPane");
map.getPane("routePreviewPane").style.zIndex = 1000;
map.getPane("routePreviewPane").style.pointerEvents = "none";

map.createPane("routePane");
map.getPane("routePane").style.zIndex = 900;


/* =========================================================
   4. BASE MAP
   ========================================================= */

const streetLayer =
  L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      maxZoom: 19,

      attribution:
        "&copy; OpenStreetMap contributors"
    }
  ).addTo(map);


/* =========================================================
   5. TERRAIN
   ========================================================= */

const terrainLayer =
  L.tileLayer(
    "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    {
      maxZoom: 17,

      opacity: 0.82,

      attribution:
        "Map data: OpenStreetMap contributors, SRTM | Map style: OpenTopoMap"
    }
  );

let terrainVisible = false;


/* =========================================================
   6. CALIBRATION
   ========================================================= */

let currentCalibration = "region1";

let currentOrigin =
  L.latLng(
    calibrations[currentCalibration].lat,
    calibrations[currentCalibration].lng
  );

const crs = map.options.crs;

let projectedOrigin =
  crs.project(
    currentOrigin
  );


/* =========================================================
   7. COORDINATE CONVERSION
   ========================================================= */

function coordinateToLatLng(x, y) {

  const projectedPoint =
    L.point(
      projectedOrigin.x +
      x * METERS_PER_UNIT,

      projectedOrigin.y -
      y * METERS_PER_UNIT
    );

  return crs.unproject(
    projectedPoint
  );

}


function latLngToCoordinate(latlng) {

  const projected =
    crs.project(latlng);

  const x =
    (
      projected.x -
      projectedOrigin.x
    ) /
    METERS_PER_UNIT;

  const y =
    (
      projectedOrigin.y -
      projected.y
    ) /
    METERS_PER_UNIT;

  return {
    x,
    y
  };

}


/* =========================================================
   8. FORMATTING
   ========================================================= */

function formatNumber(number) {

  return Number(number)
    .toLocaleString(
      "en-US",
      {
        maximumFractionDigits: 2
      }
    );

}


/* =========================================================
   9. CALIBRATION INFO
   ========================================================= */

function formatScaleText() {
  const meters = KM_PER_UNIT * 1000;
  if (meters < 1000) {
    return `1 unit = ${formatNumber(meters)} m`;
  }
  return `1 unit = ${formatNumber(KM_PER_UNIT)} km`;
}

function updateCalibrationInfo() {

  document.getElementById(
    "scaleDisplay"
  ).textContent =
    formatScaleText();

  document.getElementById(
    "footerScale"
  ).textContent =
    formatScaleText();

  const totalWidth =
    X_MAX - X_MIN;

  const totalHeight =
    Y_MAX - Y_MIN;

  document.getElementById(
    "geographicWidth"
  ).textContent =
    `${formatNumber(totalWidth * KM_PER_UNIT)} km`;

  document.getElementById(
    "geographicHeight"
  ).textContent =
    `${formatNumber(totalHeight * KM_PER_UNIT)} km`;

}


/* =========================================================
   10. CHANGE SCALE
   ========================================================= */

function changeUnitScale(value) {

  const newScale =
    Number(value);

  if (
    !Number.isFinite(newScale) ||
    newScale <= 0
  ) {
    return;
  }

  KM_PER_UNIT =
    newScale;

  METERS_PER_UNIT =
    KM_PER_UNIT * 1000;

  updateCalibrationInfo();

  drawCartesianGrid();

  refreshAllPinCoordinates();

}


/* =========================================================
   11. CHANGE CALIBRATION
   ========================================================= */

function changeCalibration(key) {

  if (!calibrations[key]) {
    return;
  }

  currentCalibration =
    key;

  currentOrigin =
    L.latLng(
      calibrations[key].lat,
      calibrations[key].lng
    );

  projectedOrigin =
    crs.project(
      currentOrigin
    );

  document.getElementById(
    "calibrationName"
  ).textContent =
    calibrations[key].name;

  drawCartesianGrid();

  refreshAllPinCoordinates();

  fitSelectedRegion();

}


/* =========================================================
   11b. CUSTOM ORIGIN
   ========================================================= */

let settingCustomOrigin = false;

function startSetCustomOrigin() {

  settingCustomOrigin = true;

  map.getContainer().style.cursor = "crosshair";

  const button =
    document.getElementById("setOriginButton");

  if (button) {
    button.textContent =
      "🎯 Click anywhere on the map…";
  }

}

function applyCustomOrigin(latlng) {

  currentCalibration = "custom";

  currentOrigin =
    L.latLng(
      latlng.lat,
      latlng.lng
    );

  projectedOrigin =
    crs.project(
      currentOrigin
    );

  document.getElementById(
    "calibrationName"
  ).textContent =
    `Custom Origin (${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)})`;

  const select =
    document.getElementById("calibrationSelect");

  if (select) {
    select.value = "";
  }

  drawCartesianGrid();

  refreshAllPinCoordinates();

  settingCustomOrigin = false;

  map.getContainer().style.cursor = "";

  const button =
    document.getElementById("setOriginButton");

  if (button) {
    button.textContent =
      "🎯 Set Custom Origin";
  }

}


/* =========================================================
   12. CARTESIAN SVG
   ========================================================= */

const mapElement =
  document.getElementById("map");

const cartesianSVG =
  document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );

cartesianSVG.setAttribute(
  "class",
  "cartesian-overlay"
);

cartesianSVG.style.position =
  "absolute";

cartesianSVG.style.left =
  "0";

cartesianSVG.style.top =
  "0";

cartesianSVG.style.width =
  "100%";

cartesianSVG.style.height =
  "100%";

cartesianSVG.style.zIndex =
  "450";

cartesianSVG.style.pointerEvents =
  "none";

mapElement.appendChild(
  cartesianSVG
);

const overlayGroup =
  document.createElementNS(
    "http://www.w3.org/2000/svg",
    "g"
  );

cartesianSVG.appendChild(
  overlayGroup
);


/* =========================================================
   13. GRID
   ========================================================= */

let gridVisible = true;
let labelsVisible = true;


function createLine(
  x1,
  y1,
  x2,
  y2,
  className
) {

  const line =
    document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line"
    );

  line.setAttribute("x1", x1);
  line.setAttribute("y1", y1);
  line.setAttribute("x2", x2);
  line.setAttribute("y2", y2);

  line.setAttribute(
    "class",
    className
  );

  return line;

}


function createText(
  x,
  y,
  text,
  anchor = "middle",
  className = "coordinate-number"
) {

  const label =
    document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );

  label.setAttribute(
    "x",
    x
  );

  label.setAttribute(
    "y",
    y
  );

  label.setAttribute(
    "class",
    className
  );

  label.setAttribute(
    "text-anchor",
    anchor
  );

  label.textContent =
    text;

  return label;

}


function getGridStep() {

  const zoom =
    map.getZoom();

  if (zoom >= 11) {
    return 1;
  }

  if (zoom >= 9) {
    return 2;
  }

  if (zoom >= 7) {
    return 5;
  }

  return 10;

}


/* =========================================================
   14. DRAW GRID
   ========================================================= */

function drawCartesianGrid() {

  while (
    overlayGroup.firstChild
  ) {

    overlayGroup.removeChild(
      overlayGroup.firstChild
    );

  }

  if (!gridVisible) {
    return;
  }

  const step =
    getGridStep();

  for (
    let x = X_MIN;
    x <= X_MAX;
    x += step
  ) {

    const top =
      map.latLngToContainerPoint(
        coordinateToLatLng(
          x,
          Y_MAX
        )
      );

    const bottom =
      map.latLngToContainerPoint(
        coordinateToLatLng(
          x,
          Y_MIN
        )
      );

    let lineClass =
      "cartesian-grid";

    if (x === 0) {
      lineClass =
        "cartesian-axis";
    }

    else if (x % 10 === 0) {
      lineClass =
        "cartesian-grid-10";
    }

    else if (x % 5 === 0) {
      lineClass =
        "cartesian-grid-major";
    }

    overlayGroup.appendChild(
      createLine(
        top.x,
        top.y,
        bottom.x,
        bottom.y,
        lineClass
      )
    );

    if (
      labelsVisible &&
      x % 10 === 0 &&
      x !== 0
    ) {

      overlayGroup.appendChild(
        createText(
          bottom.x,
          bottom.y - 6,
          x
        )
      );

    }

  }

  for (
    let y = Y_MIN;
    y <= Y_MAX;
    y += step
  ) {

    const left =
      map.latLngToContainerPoint(
        coordinateToLatLng(
          X_MIN,
          y
        )
      );

    const right =
      map.latLngToContainerPoint(
        coordinateToLatLng(
          X_MAX,
          y
        )
      );

    let lineClass =
      "cartesian-grid";

    if (y === 0) {
      lineClass =
        "cartesian-axis";
    }

    else if (y % 10 === 0) {
      lineClass =
        "cartesian-grid-10";
    }

    else if (y % 5 === 0) {
      lineClass =
        "cartesian-grid-major";
    }

    overlayGroup.appendChild(
      createLine(
        left.x,
        left.y,
        right.x,
        right.y,
        lineClass
      )
    );

    if (
      labelsVisible &&
      y % 10 === 0 &&
      y !== 0
    ) {

      overlayGroup.appendChild(
        createText(
          left.x + 6,
          left.y + 4,
          y,
          "start"
        )
      );

    }

  }

  const originPoint =
    map.latLngToContainerPoint(
      currentOrigin
    );

  if (labelsVisible) {

    overlayGroup.appendChild(
      createText(
        originPoint.x + 8,
        originPoint.y - 8,
        "0,0",
        "start"
      )
    );

  }

  const cross = 8;

  overlayGroup.appendChild(
    createLine(
      originPoint.x - cross,
      originPoint.y,
      originPoint.x + cross,
      originPoint.y,
      "cartesian-axis"
    )
  );

  overlayGroup.appendChild(
    createLine(
      originPoint.x,
      originPoint.y - cross,
      originPoint.x,
      originPoint.y + cross,
      "cartesian-axis"
    )
  );

  const eastPoint =
    map.latLngToContainerPoint(
      coordinateToLatLng(
        X_MAX,
        0
      )
    );

  if (labelsVisible) {

    overlayGroup.appendChild(
      createText(
        eastPoint.x - 8,
        eastPoint.y - 10,
        "+X EAST",
        "end",
        "axis-label"
      )
    );

  }

  const northPoint =
    map.latLngToContainerPoint(
      coordinateToLatLng(
        0,
        Y_MAX
      )
    );

  if (labelsVisible) {

    overlayGroup.appendChild(
      createText(
        northPoint.x + 10,
        northPoint.y + 15,
        "+Y NORTH",
        "start",
        "axis-label"
      )
    );

  }

}


map.on(
  "zoom move resize zoomend moveend",
  drawCartesianGrid
);


/* =========================================================
   15. MOUSE COORDINATES
   ========================================================= */

map.on(
  "mousemove",
  function(event) {

    const coordinate =
      latLngToCoordinate(
        event.latlng
      );

    const x =
      Math.round(
        coordinate.x * 10
      ) / 10;

    const y =
      Math.round(
        coordinate.y * 10
      ) / 10;

    document.getElementById(
      "mouseCoordinate"
    ).textContent =
      `(${x}, ${y})`;

    if (
      transportDrawing.active
    ) {

      updateDrawingPreview(
        event.latlng
      );

    }

    if (
      circleDrawing.active
    ) {

      updateCircleDrawingPreview(
        event.latlng
      );

    }

    if (
      corridorConstruction.active
    ) {

      updateCorridorConstructionPreview(
        event.latlng
      );

    }

  }
);


/*
   Transportation drawing uses a direct pointer listener as a
   second, reliable path for the rubber-band preview. This is
   intentionally independent of Leaflet layer mouse events.
*/
mapElement.addEventListener(
  "mousemove",
  function(event) {

    const rect =
      mapElement.getBoundingClientRect();

    const containerPoint =
      L.point(
        event.clientX - rect.left,
        event.clientY - rect.top
      );

    const latlng =
      map.containerPointToLatLng(
        containerPoint
      );

    if (
      transportDrawing.active
    ) {

      updateDrawingPreview(
        latlng
      );

    }

    if (
      circleDrawing.active
    ) {

      updateCircleDrawingPreview(
        latlng
      );

    }

    if (
      corridorConstruction.active
    ) {

      updateCorridorConstructionPreview(
        latlng
      );

    }

  }
);


/* =========================================================
   16. RIGHT CLICK PANNING
   ========================================================= */

mapElement.addEventListener(
  "contextmenu",
  function(event) {

    event.preventDefault();

  }
);

let rightDragging = false;
let lastMousePosition = null;

mapElement.addEventListener(
  "mousedown",
  function(event) {

    if (event.button !== 2) {
      return;
    }

    rightDragging = true;

    lastMousePosition = {
      x: event.clientX,
      y: event.clientY
    };

    mapElement.classList.add(
      "right-dragging"
    );

    event.preventDefault();

  }
);

window.addEventListener(
  "mousemove",
  function(event) {

    if (!rightDragging) {
      return;
    }

    const dx =
      event.clientX -
      lastMousePosition.x;

    const dy =
      event.clientY -
      lastMousePosition.y;

    map.panBy(
      [
        -dx,
        -dy
      ],
      {
        animate: false
      }
    );

    lastMousePosition = {
      x: event.clientX,
      y: event.clientY
    };

  }
);

window.addEventListener(
  "mouseup",
  function(event) {

    if (event.button !== 2) {
      return;
    }

    rightDragging = false;
    lastMousePosition = null;

    mapElement.classList.remove(
      "right-dragging"
    );

  }
);


/* =========================================================
   17. TOGGLES
   ========================================================= */

function toggleGrid() {

  gridVisible =
    !gridVisible;

  drawCartesianGrid();

}


function toggleLabels() {

  labelsVisible =
    !labelsVisible;

  drawCartesianGrid();

}


function toggleTerrain() {

  terrainVisible =
    !terrainVisible;

  if (terrainVisible) {

    terrainLayer.addTo(map);

    document.getElementById(
      "terrainNote"
    ).textContent =
      "🏔 Terrain / elevation visible";

  }

  else {

    map.removeLayer(
      terrainLayer
    );

    document.getElementById(
      "terrainNote"
    ).textContent =
      "Terrain layer hidden";

  }

  cartesianSVG.style.zIndex =
    "450";

}


/* =========================================================
   18. PIN SYSTEM
   ========================================================= */

let selectedPinColor =
  "#e63946";

const placedPins = [];


function selectPinColor(button) {

  selectedPinColor =
    button.dataset.color;

  document
    .querySelectorAll(
      ".color-button"
    )
    .forEach(
      function(item) {

        item.classList.remove(
          "selected"
        );

      }
    );

  button.classList.add(
    "selected"
  );

}


/* =========================================================
   19. PIN ICON
   ========================================================= */

function createPinIcon(
  color,
  isStation = false
) {

  if (isStation) {

    return L.divIcon({

      className: "",

      html:
        `<div class="custom-pin">
          <div
            class="station-ring"
            style="background:${color};"
          ></div>
        </div>`,

      iconSize:
        [34,44],

      iconAnchor:
        [17,42],

      popupAnchor:
        [0,-42]

    });

  }

  return L.divIcon({

    className: "",

    html:

      `<div class="custom-pin">

        <div
          class="pin-shape"
          style="background:${color};"
        ></div>

        <div class="pin-dot"></div>

      </div>`,

    iconSize:
      [34,44],

    iconAnchor:
      [17,42],

    popupAnchor:
      [0,-42]

  });

}


/* =========================================================
   20. PIN INFORMATION
   ========================================================= */

function buildPinInformation(pin) {

  const coordinate =
    latLngToCoordinate(
      L.latLng(
        pin.latitude,
        pin.longitude
      )
    );

  const x =
    Math.round(
      coordinate.x * 100
    ) / 100;

  const y =
    Math.round(
      coordinate.y * 100
    ) / 100;

  let elevationText =
    "Unavailable";

  if (
    pin.elevation !== null &&
    pin.elevation !== undefined
  ) {

    elevationText =
      `${formatNumber(pin.elevation)} m`;

  }

  return `

    <div class="pin-popup">

      <div class="pin-popup-title">
        ${escapeHTML(pin.name)}
      </div>

      <div class="pin-popup-type">
        ${escapeHTML(pin.type)}
      </div>

      <div>
        <strong>Latitude:</strong>
        ${pin.latitude.toFixed(6)}
      </div>

      <div>
        <strong>Longitude:</strong>
        ${pin.longitude.toFixed(6)}
      </div>

      <div class="pin-popup-coordinates">

        <strong>Cartesian:</strong>

        X = ${x},
        Y = ${y}

      </div>

      <div class="pin-popup-elevation">

        <strong>Elevation:</strong>

        ${elevationText}

      </div>

      ${
        pin.isStation
        ? `
          <div style="color:#7dd3fc;margin-top:4px;">
            🚉 Transportation Station
          </div>
        `
        : ""
      }

      <div style="margin-top:6px;color:#fca5a5;">
        Hold this pin for 2 seconds to remove it.
      </div>

    </div>

  `;

}


function escapeHTML(text) {

  return String(text)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");

}


/* =========================================================
   21. ADD PIN
   ========================================================= */

function addPin(
  latlng,
  customName = null,
  customType = null,
  customColor = null
) {

  const nameInput =
    document.getElementById(
      "pinName"
    );

  const typeInput =
    document.getElementById(
      "pinType"
    );

  const name =
    customName ||
    nameInput.value.trim() ||
    "Unnamed Location";

  const type =
    customType ||
    typeInput.value.trim() ||
    "Area";

  const isStation =
    /station|terminal|depot/i.test(
      type
    );

  const pin = {

    id:
      Date.now() +
      Math.random(),

    name,

    type,

    color:
      customColor ||
      selectedPinColor,

    latitude:
      latlng.lat,

    longitude:
      latlng.lng,

    elevation:
      null,

    isStation,

    marker:
      null

  };

  pin.marker =
    L.marker(
      latlng,
      {
        icon:
          createPinIcon(
            pin.color,
            pin.isStation
          ),

        interactive:
          true,

        zIndexOffset:
          1000
      }
    ).addTo(map);

  pin.marker.bindTooltip(
    buildPinInformation(pin),
    {
      direction:
        "top",

      offset:
        [0,-40],

      opacity:
        1,

      permanent:
        false,

      className:
        "pin-tooltip"
    }
  );

  pin.marker.on(
    "mouseover",
    function() {

      this.openTooltip();

    }
  );

  pin.marker.on(
    "mouseout",
    function() {

      this.closeTooltip();

    }
  );

  setupPinLongPress(
    pin
  );

  placedPins.push(
    pin
  );

  updatePinCount();
  refreshPinRouteSelectors();

  fetchElevation(
    pin
  );

  return pin;

}


/* =========================================================
   22. LONG PRESS
   ========================================================= */

function setupPinLongPress(pin) {

  let holdTimer = null;
  let holdTriggered = false;

  function startHold() {

    holdTriggered =
      false;

    holdTimer =
      setTimeout(
        function() {

          holdTriggered =
            true;

          removePin(
            pin
          );

        },
        2000
      );

  }

  function cancelHold() {

    if (holdTimer) {

      clearTimeout(
        holdTimer
      );

      holdTimer =
        null;

    }

  }

  pin.marker.on(
    "mousedown",
    function(event) {

      if (
        event.originalEvent.button !== 0
      ) {
        return;
      }

      startHold();

    }
  );

  pin.marker.on(
    "mouseup",
    cancelHold
  );

  pin.marker.on(
    "mouseout",
    cancelHold
  );

  pin.marker.on(
    "click",
    function(event) {

      if (holdTriggered) {

        event.originalEvent.preventDefault();

        event.originalEvent.stopPropagation();

      }

    }
  );

  pin.marker.on(
    "touchstart",
    startHold
  );

  pin.marker.on(
    "touchend",
    cancelHold
  );

  pin.marker.on(
    "touchcancel",
    cancelHold
  );

}


/* =========================================================
   23. REMOVE PIN
   ========================================================= */

function removePin(pin) {

  if (pin.marker) {

    map.removeLayer(
      pin.marker
    );

  }

  const index =
    placedPins.indexOf(
      pin
    );

  if (index !== -1) {

    placedPins.splice(
      index,
      1
    );

  }

  updatePinCount();

}


/* =========================================================
   24. CLEAR PINS
   ========================================================= */

function clearAllPins() {

  if (
    placedPins.length === 0
  ) {
    return;
  }

  const confirmed =
    confirm(
      "Remove all pins from the map?"
    );

  if (!confirmed) {
    return;
  }

  placedPins.forEach(
    function(pin) {

      if (pin.marker) {

        map.removeLayer(
          pin.marker
        );

      }

    }
  );

  placedPins.length =
    0;

  updatePinCount();
  refreshPinRouteSelectors();
  clearPinToPinRoute();

}


/* =========================================================
   25. PIN COUNT
   ========================================================= */

function updatePinCount() {

  document.getElementById(
    "pinCount"
  ).textContent =
    placedPins.length;

}


/* =========================================================
   26. REFRESH PINS
   ========================================================= */

function refreshAllPinCoordinates() {

  placedPins.forEach(
    function(pin) {

      if (pin.marker) {

        pin.marker.setTooltipContent(
          buildPinInformation(pin)
        );

      }

    }
  );

}


/* =========================================================
   27. ELEVATION
   ========================================================= */

async function fetchElevation(pin) {

  try {

    const url =
      `https://api.open-elevation.com/api/v1/lookup?locations=${pin.latitude},${pin.longitude}`;

    const response =
      await fetch(url);

    if (!response.ok) {
      throw new Error(
        "Elevation request failed"
      );
    }

    const data =
      await response.json();

    if (
      data &&
      data.results &&
      data.results.length > 0 &&
      Number.isFinite(
        Number(
          data.results[0].elevation
        )
      )
    ) {

      pin.elevation =
        Number(
          data.results[0].elevation
        );

      if (pin.marker) {

        pin.marker.setTooltipContent(
          buildPinInformation(pin)
        );

      }

    }

  }

  catch(error) {

    console.warn(
      "Elevation unavailable:",
      error
    );

  }

}


/* =========================================================
   28. DOUBLE CLICK
   ========================================================= */

map.on(
  "dblclick",
  function(event) {

    if (
      transportDrawing.active
    ) {

      /*
         A double-click already produces the preceding click
         event, so only add the final point if the double-click
         location is meaningfully different from the last point.
      */
      const lastPoint =
        transportDrawing.points[
          transportDrawing.points.length - 1
        ];

      const distanceFromLast =
        lastPoint
          ? lastPoint.distanceTo(event.latlng)
          : Infinity;

      if (
        !lastPoint ||
        distanceFromLast > 1
      ) {
        addDrawingPoint(
          event.latlng
        );
      }

      if (
        transportDrawing.points.length >= 2
      ) {

        finishTransportDrawing();

      }
      else {

        document.getElementById(
          "drawStatus"
        ).textContent =
          "⚠️ Add one more alignment point before finishing.";

      }

      return;

    }

    addPin(
      event.latlng
    );

  }
);


/* =========================================================
   29. TRANSPORTATION DEFINITIONS
   ========================================================= */

const transportTypes = {

  BUS: { name:"Bus Routes", color:"#16a34a", maxPreferredGrade:8, maxCriticalGrade:12, waterAllowed:false, waterCrossing:"bridge", terrainFlexibility:"high" },
  MRT: { name:"MRT Lines", color:"#e63946", maxPreferredGrade:4, maxCriticalGrade:7, waterAllowed:false, waterCrossing:"bridge/tunnel", terrainFlexibility:"low" },
  LRT: { name:"LRT Lines", color:"#2563eb", maxPreferredGrade:6, maxCriticalGrade:9, waterAllowed:false, waterCrossing:"bridge/tunnel", terrainFlexibility:"medium" },
  SUBWAY: { name:"Subway / Underground Railway", color:"#7c3aed", maxPreferredGrade:5, maxCriticalGrade:8, waterAllowed:false, waterCrossing:"tunnel", terrainFlexibility:"medium" },
  ELEVATED: { name:"Elevated Railways", color:"#9333ea", maxPreferredGrade:5, maxCriticalGrade:8, waterAllowed:false, waterCrossing:"elevated structure", terrainFlexibility:"medium" },
  MONORAIL: { name:"Monorails", color:"#0891b2", maxPreferredGrade:6, maxCriticalGrade:10, waterAllowed:false, waterCrossing:"elevated structure", terrainFlexibility:"medium" },
  FERRY: { name:"Ferry Routes", color:"#0b7fab", maxPreferredGrade:null, maxCriticalGrade:null, waterAllowed:true, waterCrossing:"normal water operation", terrainFlexibility:"water" },
  BIKE: { name:"Bike Lanes", color:"#f97316", maxPreferredGrade:5, maxCriticalGrade:10, waterAllowed:false, waterCrossing:"bridge", terrainFlexibility:"low" },
  ROAD: { name:"Expressways and Major Roads", color:"#374151", maxPreferredGrade:6, maxCriticalGrade:10, waterAllowed:false, waterCrossing:"bridge/tunnel", terrainFlexibility:"medium" },
  TERMINAL: { name:"Transport Terminals", color:"#f59e0b", maxPreferredGrade:3, maxCriticalGrade:6, waterAllowed:false, waterCrossing:"site access required", terrainFlexibility:"low" },
  HUB: { name:"Transport Hubs", color:"#c2410c", maxPreferredGrade:3, maxCriticalGrade:6, waterAllowed:false, waterCrossing:"site access required", terrainFlexibility:"low" },
  CABLE: { name:"Cable Cars", color:"#db2777", maxPreferredGrade:20, maxCriticalGrade:35, waterAllowed:false, waterCrossing:"cable span", terrainFlexibility:"high" }

};

const transportRoutes = [];

let routeNumber = 1;


/* =========================================================
   30b. MATH MODE STATE
   ========================================================= */

const mathMode = {
  active: false
};

const mathCircles = [];

let circleNumber = 1;

const circleDrawing = {
  active: false,
  centerLatLng: null,
  centerXY: null,
  previewCircle: null,
  previewRadiusLine: null
};

const corridorConstruction = {
  active: false,
  mode: null,
  referenceRouteId: null,
  newMode: "ROAD",
  throughXY: null,
  throughLatLng: null,
  slope: null,
  vertical: false,
  previewLine: null,
  vertexMarker: null
};

const mathMarkers = [];


/* =========================================================
   30c. CARTESIAN LINE / CIRCLE MATH HELPERS
   ========================================================= */

/*
   All math-mode calculations are done in the app's own Cartesian
   grid units (the same (x, y) system already shown to the user
   as "Cursor Coordinate" and used for the grid), NOT in raw
   latitude/longitude. This keeps every equation shown to the
   user consistent with the coordinate plane they already see.
*/

function computeLineFromXY(p1, p2) {

  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;

  if (Math.abs(dx) < 1e-9) {
    return {
      vertical: true,
      x: p1.x,
      slope: null,
      intercept: null
    };
  }

  const slope = dy / dx;
  const intercept = p1.y - slope * p1.x;

  return {
    vertical: false,
    x: null,
    slope,
    intercept
  };

}

function formatLineEquation(line) {

  if (line.vertical) {
    return `x = ${formatNumber(line.x)}`;
  }

  const m = formatNumber(line.slope);
  const bAbs = formatNumber(Math.abs(line.intercept));
  const sign = line.intercept >= 0 ? "+" : "−";

  return `y = ${m}x ${sign} ${bAbs}`;

}

function routeToXYPoints(route) {

  return route.points.map(
    point => latLngToCoordinate(point)
  );

}

function routeCorridorLine(route) {

  const xyPoints = routeToXYPoints(route);

  const first = xyPoints[0];
  const last = xyPoints[xyPoints.length - 1];

  return {
    line: computeLineFromXY(first, last),
    first,
    last
  };

}

function areSlopesParallel(m1, v1, m2, v2, tol = 0.02) {

  if (v1 && v2) return true;
  if (v1 || v2) return false;

  return Math.abs(m1 - m2) < tol;

}

function areSlopesPerpendicular(m1, v1, m2, v2, tol = 0.05) {

  if (v1 && m2 === 0) return true;
  if (v2 && m1 === 0) return true;
  if (v1 || v2) return false;

  return Math.abs(m1 * m2 + 1) < tol;

}

function perpendicularSlope(line) {

  if (line.vertical) {
    return {
      vertical: false,
      slope: 0
    };
  }

  if (Math.abs(line.slope) < 1e-9) {
    return {
      vertical: true,
      slope: null
    };
  }

  return {
    vertical: false,
    slope: -1 / line.slope
  };

}

function projectPointOntoConstrainedLine(cursorXY, throughXY, vertical, slope) {

  if (vertical) {
    return {
      x: throughXY.x,
      y: cursorXY.y
    };
  }

  if (Math.abs(slope) < 1e-9) {
    return {
      x: cursorXY.x,
      y: throughXY.y
    };
  }

  const dx = cursorXY.x - throughXY.x;
  const dy = cursorXY.y - throughXY.y;

  const len2 = 1 + slope * slope;
  const t = (dx + dy * slope) / len2;

  return {
    x: throughXY.x + t,
    y: throughXY.y + t * slope
  };

}

function solveLineLineIntersectionXY(lineA, lineB) {

  if (lineA.vertical && lineB.vertical) {
    return null;
  }

  if (lineA.vertical) {
    const x = lineA.x;
    const y = lineB.slope * x + lineB.intercept;
    return { x, y };
  }

  if (lineB.vertical) {
    const x = lineB.x;
    const y = lineA.slope * x + lineA.intercept;
    return { x, y };
  }

  if (Math.abs(lineA.slope - lineB.slope) < 1e-9) {
    return null;
  }

  const x =
    (lineB.intercept - lineA.intercept) /
    (lineA.slope - lineB.slope);

  const y = lineA.slope * x + lineA.intercept;

  return { x, y };

}

function pointWithinSegmentBounds(point, a, b, tolerance = 0.6) {

  const minX = Math.min(a.x, b.x) - tolerance;
  const maxX = Math.max(a.x, b.x) + tolerance;
  const minY = Math.min(a.y, b.y) - tolerance;
  const maxY = Math.max(a.y, b.y) + tolerance;

  return (
    point.x >= minX && point.x <= maxX &&
    point.y >= minY && point.y <= maxY
  );

}

function solveLineCircleIntersectionXY(line, circle) {

  const h = circle.center.x;
  const k = circle.center.y;
  const r = circle.radius;

  if (line.vertical) {

    const c = line.x;
    const rhs = (r * r) - Math.pow(c - h, 2);

    if (rhs < -1e-9) {
      return { count: 0, points: [], discriminant: rhs };
    }

    if (Math.abs(rhs) < 1e-9) {
      return {
        count: 1,
        points: [{ x: c, y: k }],
        discriminant: 0
      };
    }

    const sq = Math.sqrt(rhs);

    return {
      count: 2,
      points: [
        { x: c, y: k + sq },
        { x: c, y: k - sq }
      ],
      discriminant: rhs
    };

  }

  const m = line.slope;
  const b = line.intercept;

  const A = 1 + m * m;
  const B = 2 * (m * (b - k) - h);
  const C = (h * h) + Math.pow(b - k, 2) - (r * r);

  const discriminant = (B * B) - (4 * A * C);

  if (discriminant < -1e-9) {
    return { count: 0, points: [], discriminant, A, B, C };
  }

  if (Math.abs(discriminant) < 1e-9) {
    const x = -B / (2 * A);
    const y = m * x + b;
    return {
      count: 1,
      points: [{ x, y }],
      discriminant: 0,
      A, B, C
    };
  }

  const sq = Math.sqrt(discriminant);
  const x1 = (-B + sq) / (2 * A);
  const x2 = (-B - sq) / (2 * A);

  return {
    count: 2,
    points: [
      { x: x1, y: m * x1 + b },
      { x: x2, y: m * x2 + b }
    ],
    discriminant,
    A, B, C
  };

}


/* =========================================================
   31. DRAWING STATE
   ========================================================= */

const transportDrawing = {

  active:
    false,

  type:
    null,

  points:
    [],

  snappedPin:
    null,

  previewLine:
    null,

  committedLine:
    null,

  permanentLine:
    null,

  vertexMarkers:
    []

};


/* =========================================================
   32. START DRAWING
   ========================================================= */

function startTransportDrawing(type) {

  if (
    !transportTypes[type]
  ) {
    return;
  }

  if (
    transportDrawing.active
  ) {

    finishTransportDrawing();

  }

  transportDrawing.active =
    true;

  transportDrawing.type =
    type;

  transportDrawing.points =
    [];

  transportDrawing.snappedPin =
    null;

  clearDrawingVisuals();

  document
    .querySelectorAll(
      ".transport-button"
    )
    .forEach(
      button => {

        button.classList.toggle(
          "active",
          button.dataset.mode === type
        );

      }
    );

  document.getElementById(
    "drawStatus"
  ).textContent =
    `✏️ Drawing ${type}. Click the map to add alignment points.`;

  document.getElementById(
    "finishRouteButton"
  ).disabled =
    true;

  document.getElementById(
    "undoPointButton"
  ).disabled =
    true;

  document.getElementById(
    "cancelRouteButton"
  ).disabled =
    false;

  map.getContainer().style.cursor =
    "crosshair";

}


/* =========================================================
   33. ADD DRAWING POINT
   ========================================================= */

function addDrawingPoint(
  latlng
) {

  if (
    !transportDrawing.active
  ) {
    return;
  }

  const snapped =
    getSnapTarget(
      latlng
    );

  const finalPoint =
    snapped
      ? snapped.latlng
      : latlng;

  transportDrawing.points.push(
    L.latLng(
      finalPoint.lat,
      finalPoint.lng
    )
  );

  createDrawingVertex(
    finalPoint,
    snapped
  );

  if (
    snapped &&
    snapped.pin
  ) {

    transportDrawing.snappedPin =
      snapped.pin;

  }

  document.getElementById(
    "undoPointButton"
  ).disabled =
    transportDrawing.points.length === 0;

  document.getElementById(
    "finishRouteButton"
  ).disabled =
    transportDrawing.points.length < 2;

  document.getElementById(
    "drawStatus"
  ).textContent =
    `${transportTypes[transportDrawing.type].name}: ` +
    `${transportDrawing.points.length} alignment point` +
    `${transportDrawing.points.length === 1 ? "" : "s"} added.`;

  /*
     Keep the committed alignment visible as a SOLID line. The
     next pointer movement immediately adds the live dashed
     cursor segment on top via updateDrawingPreview().
  */
  redrawCommittedLine(
    transportDrawing.points
  );

}


/* =========================================================
   34. DRAWING MAP CLICK
   ========================================================= */

map.on(
  "click",
  function(event) {

    if (
      settingCustomOrigin
    ) {

      applyCustomOrigin(
        event.latlng
      );

      return;

    }

    if (
      circleDrawing.active
    ) {

      handleCircleDrawingClick(
        event.latlng
      );

      return;

    }

    if (
      corridorConstruction.active
    ) {

      handleCorridorConstructionClick(
        event.latlng
      );

      return;

    }

    if (
      !transportDrawing.active
    ) {
      return;
    }

    addDrawingPoint(
      event.latlng
    );

  }
);


/* =========================================================
   35. SNAP SYSTEM
   ========================================================= */

function snapCoordinateToGrid(latlng) {

  const coordinate = latLngToCoordinate(latlng);

  const snappedX = Math.max(X_MIN, Math.min(X_MAX, Math.round(coordinate.x)));
  const snappedY = Math.max(Y_MIN, Math.min(Y_MAX, Math.round(coordinate.y)));
  const snappedLatLng = coordinateToLatLng(snappedX, snappedY);

  return {
    latlng: snappedLatLng,
    x: snappedX,
    y: snappedY,
    label: `Grid point (${snappedX}, ${snappedY}) · ${formatScaleText()} spacing`
  };
}

function getSnapTarget(latlng) {

  const snapEnabled = document.getElementById("snapToggle").checked;

  if (!snapEnabled) {
    hideSnapIndicator();
    return null;
  }

  const snapped = snapCoordinateToGrid(latlng);
  showSnapIndicator(snapped.label);

  return {
    latlng: snapped.latlng,
    pin: null,
    grid: true,
    x: snapped.x,
    y: snapped.y,
    label: snapped.label
  };
}

/* =========================================================
   36. SNAP INDICATOR
   ========================================================= */

function showSnapIndicator(
  label
) {

  const indicator =
    document.getElementById(
      "snapIndicator"
    );

  indicator.style.display =
    "block";

  indicator.textContent =
    `🧲 Snapped to: ${label}`;

}


function hideSnapIndicator() {

  document.getElementById(
    "snapIndicator"
  ).style.display =
    "none";

}


/* =========================================================
   37b. ROUTE LINE WIDTH CONTROL
   ========================================================= */

function getSelectedRouteLineWidth() {

  const select =
    document.getElementById(
      "routeLineWidth"
    );

  const value =
    Number(
      select?.value
    );

  return (
    Number.isFinite(value) &&
    value > 0
  )
    ? value
    : 5;

}

function updateDrawingLineWidth() {

  if (
    transportDrawing.active &&
    transportDrawing.points.length >= 2
  ) {

    redrawCommittedLine();

  }

}


/* =========================================================
   37. DRAWING PREVIEW
   ========================================================= */

function updateDrawingPreview(
  latlng
) {

  if (
    !transportDrawing.active
  ) {
    return;
  }

  let target =
    L.latLng(
      latlng.lat,
      latlng.lng
    );

  let snapped =
    null;

  if (
    document.getElementById(
      "snapToggle"
    )?.checked
  ) {

    snapped =
      snapCoordinateToGrid(
        target
      );

    target =
      snapped.latlng;

    showSnapIndicator(
      snapped.label
    );

  }
  else {

    hideSnapIndicator();

  }

  updateDrawingCursorMarker(
    target,
    snapped
  );

  /*
     The important behavior:
     after ONE point is placed, show one dashed segment
     from that point to the cursor.
     After more points are placed, show the complete
     committed alignment plus the live cursor segment.
  */
  const previewPoints =
    transportDrawing.points.length
      ? [
          ...transportDrawing.points,
          target
        ]
      : [];

  if (
    previewPoints.length >= 2
  ) {

    redrawPreviewLine(
      previewPoints
    );

    scheduleLiveRouteAnalysis(
      previewPoints,
      transportDrawing.type
    );

  }

}


/* =========================================================
   38. REDRAW COMMITTED LINE (solid, locked-in points)
   ========================================================= */

function redrawCommittedLine(
  overridePoints = null
) {

  if (
    transportDrawing.committedLine
  ) {

    map.removeLayer(
      transportDrawing.committedLine
    );

    transportDrawing.committedLine =
      null;

  }

  const points =
    overridePoints ||
    transportDrawing.points;

  if (
    !points ||
    points.length < 2 ||
    !transportDrawing.type ||
    !transportTypes[transportDrawing.type]
  ) {
    return;
  }

  transportDrawing.committedLine =
    L.polyline(
      points,
      {
        color:
          transportTypes[
            transportDrawing.type
          ].color,

        weight:
          Math.max(
            3,
            getSelectedRouteLineWidth()
          ),

        opacity:
          .95,

        lineCap:
          "round",

        lineJoin:
          "round",

        interactive:
          false,

        pane:
          "routePreviewPane"
      }
    ).addTo(map);

}


/* =========================================================
   38b. REDRAW LIVE SEGMENT (dashed, follows the cursor)
   ========================================================= */

function redrawPreviewLine(
  overridePoints = null
) {

  if (
    transportDrawing.previewLine
  ) {

    map.removeLayer(
      transportDrawing.previewLine
    );

    transportDrawing.previewLine =
      null;

  }

  /*
     Only the LAST committed point plus the live cursor
     position is drawn here — everything before that is
     already solid via redrawCommittedLine().
  */
  const allPoints =
    overridePoints ||
    transportDrawing.points;

  if (
    !allPoints ||
    allPoints.length < 2 ||
    !transportDrawing.type ||
    !transportTypes[transportDrawing.type]
  ) {
    return;
  }

  const liveSegmentPoints =
    allPoints.slice(-2);

  transportDrawing.previewLine =
    L.polyline(
      liveSegmentPoints,
      {
        color:
          transportTypes[
            transportDrawing.type
          ].color,

        weight:
          Math.max(
            3,
            getSelectedRouteLineWidth()
          ),

        opacity:
          .95,

        dashArray:
          "10 7",

        lineCap:
          "round",

        lineJoin:
          "round",

        interactive:
          false,

        pane:
          "routePreviewPane"
      }
    ).addTo(map);

}


/* =========================================================
   39. DRAWING VERTEX
   ========================================================= */


function createDrawingVertex(
  latlng,
  snap
) {

  const marker =
    L.circleMarker(
      latlng,
      {
        radius:
          snap ? 7 : 5,

        color:
          snap ? "#16a34a" : "#17365d",

        weight:
          3,

        fillColor:
          "white",

        fillOpacity:
          1,

        interactive:
          false,

        pane:
          "routePreviewPane"
      }
    ).addTo(map);

  transportDrawing.vertexMarkers.push(
    marker
  );

}


/* =========================================================
   40. UNDO POINT
   ========================================================= */

function undoDrawingPoint() {

  if (
    !transportDrawing.active ||
    transportDrawing.points.length === 0
  ) {
    return;
  }

  transportDrawing.points.pop();

  const marker =
    transportDrawing.vertexMarkers.pop();

  if (marker) {

    map.removeLayer(
      marker
    );

  }

  redrawCommittedLine();

  if (
    transportDrawing.previewLine
  ) {

    map.removeLayer(
      transportDrawing.previewLine
    );

    transportDrawing.previewLine =
      null;

  }

  document.getElementById(
    "finishRouteButton"
  ).disabled =
    transportDrawing.points.length < 2;

  document.getElementById(
    "undoPointButton"
  ).disabled =
    transportDrawing.points.length === 0;

  document.getElementById(
    "drawStatus"
  ).textContent =
    `${transportDrawing.points.length} alignment point` +
    `${transportDrawing.points.length === 1 ? "" : "s"} remaining.`;

}


/* =========================================================
   41. FINISH DRAWING
   ========================================================= */

function finishTransportDrawing() {

  if (
    !transportDrawing.active
  ) {
    return false;
  }

  const pointCount =
    transportDrawing.points.length;

  if (
    pointCount < 2
  ) {

    document.getElementById(
      "drawStatus"
    ).textContent =
      "⚠️ Place at least two points before pressing Finish.";

    return false;

  }

  const points =
    transportDrawing.points.map(
      point =>
        L.latLng(
          point.lat,
          point.lng
        )
    );

  const type =
    transportDrawing.type;

  if (
    !transportTypes[type]
  ) {

    document.getElementById(
      "drawStatus"
    ).textContent =
      "⚠️ Select a transportation mode first.";

    return false;

  }

  const name =
    document.getElementById(
      "routeNameInput"
    )?.value.trim() ||
    `${transportTypes[type].name} Line ${routeNumber++}`;

  const lineWidth =
    Math.max(
      2,
      Number(
        getSelectedRouteLineWidth()
      ) || 5
    );

  const route = {

    id:
      Date.now() +
      Math.random(),

    name,

    type,

    color:
      transportTypes[type].color,

    lineWidth,

    points,

    line:
      null,

    warningLayers:
      [],

    analysis:
      null

  };

  try {

    /*
       Permanent route is created immediately. Analysis is
       deliberately NOT awaited here.
    */
    const outline =
      L.polyline(
        points,
        {
          color:
            "#ffffff",

          weight:
            lineWidth + 4,

          opacity:
            .95,

          interactive:
            false,

          pane:
            "routePane"
        }
      ).addTo(map);

    const line =
      L.polyline(
        points,
        {
          color:
            route.color,

          weight:
            lineWidth,

          opacity:
            1,

          lineCap:
            "round",

          lineJoin:
            "round",

          interactive:
            true,

          pane:
            "routePane"
        }
      ).addTo(map);

    route.line =
      L.layerGroup(
        [
          outline,
          line
        ]
      ).addTo(map);

    line.on(
      "click",
      function() {
        selectTransportRoute(
          route
        );
      }
    );

    transportRoutes.push(
      route
    );

    /* Stop drawing mode only after the permanent route exists. */
    clearDrawingVisuals();

    transportDrawing.active =
      false;

    transportDrawing.type =
      null;

    transportDrawing.points =
      [];

    transportDrawing.snappedPin =
      null;

    map.getContainer().style.cursor =
      "";

    document
      .querySelectorAll(
        ".transport-button"
      )
      .forEach(
        button =>
          button.classList.remove(
            "active"
          )
      );

    document.getElementById(
      "finishRouteButton"
    ).disabled =
      true;

    document.getElementById(
      "undoPointButton"
    ).disabled =
      true;

    document.getElementById(
      "cancelRouteButton"
    ).disabled =
      true;

    hideSnapIndicator();

    const routeNameInput =
      document.getElementById(
        "routeNameInput"
      );

    if (
      routeNameInput
    ) {
      routeNameInput.value =
        "";
    }

    updateRouteList();

    selectTransportRoute(
      route
    );

    document.getElementById(
      "drawStatus"
    ).textContent =
      `✅ ${name} created. Terrain analysis running…`;

    /*
       Run the real terrain/water/protected-area analysis after
       the route already exists. A failed network request cannot
       prevent the route from being completed.
    */
    analyzeTransportRoute(
      route
    )
      .then(
        function() {

          updateRouteList();
          selectTransportRoute(
            route
          );

          document.getElementById(
            "drawStatus"
          ).textContent =
            `✅ ${name} created and analyzed.`;

        }
      )
      .catch(
        function(error) {

          console.warn(
            "Route analysis failed:",
            error
          );

          updateRouteList();
          selectTransportRoute(
            route
          );

          document.getElementById(
            "drawStatus"
          ).textContent =
            `✅ ${name} created. Some analysis data is unavailable.`;

        }
      );

    return true;

  }

  catch(error) {

    console.error(
      "Transportation route creation failed:",
      error
    );

    document.getElementById(
      "drawStatus"
    ).textContent =
      "🔴 Route creation failed. Your alignment points were not discarded.";

    return false;

  }

}


/* =========================================================
   42. CANCEL DRAWING



   ========================================================= */

function cancelTransportDrawing() {

  if (
    !transportDrawing.active
  ) {
    return;
  }

  clearDrawingVisuals();
  updateDrawingCursorMarker(null, null);

  transportDrawing.active =
    false;

  transportDrawing.type =
    null;

  transportDrawing.points =
    [];

  transportDrawing.snappedPin =
    null;

  map.getContainer().style.cursor =
    "";

  document
    .querySelectorAll(
      ".transport-button"
    )
    .forEach(
      button =>
        button.classList.remove(
          "active"
        )
    );

  document.getElementById(
    "finishRouteButton"
  ).disabled =
    true;

  document.getElementById(
    "undoPointButton"
  ).disabled =
    true;

  document.getElementById(
    "cancelRouteButton"
  ).disabled =
    true;

  hideSnapIndicator();

  document.getElementById(
    "drawStatus"
  ).textContent =
    "Drawing cancelled.";

}


/* =========================================================
   43. CLEAR DRAWING VISUALS
   ========================================================= */

function clearDrawingVisuals() {

  if (
    transportDrawing.previewLine
  ) {

    map.removeLayer(
      transportDrawing.previewLine
    );

    transportDrawing.previewLine =
      null;

  }

  if (
    transportDrawing.committedLine
  ) {

    map.removeLayer(
      transportDrawing.committedLine
    );

    transportDrawing.committedLine =
      null;

  }

  transportDrawing.vertexMarkers
    .forEach(
      marker => {

        if (
          map.hasLayer(marker)
        ) {

          map.removeLayer(
            marker
          );

        }

      }
    );

  transportDrawing.vertexMarkers =
    [];

  if (
    drawingCursorMarker &&
    map.hasLayer(drawingCursorMarker)
  ) {

    map.removeLayer(
      drawingCursorMarker
    );

  }

  drawingCursorMarker =
    null;

}


/* =========================================================
   44. CLEAR ALL TRANSPORT ROUTES
   ========================================================= */

function clearAllTransportRoutes() {

  if (
    transportRoutes.length === 0
  ) {
    return;
  }

  const confirmed =
    confirm(
      "Delete every transportation route?"
    );

  if (!confirmed) {
    return;
  }

  transportRoutes.forEach(
    route => {

      if (route.line) {

        map.removeLayer(
          route.line
        );

      }

      route.warningLayers
        .forEach(
          layer => {

            if (
              map.hasLayer(layer)
            ) {

              map.removeLayer(
                layer
              );

            }

          }
        );

    }
  );

  transportRoutes.length =
    0;

  updateRouteList();

  document.getElementById(
    "analysisContent"
  ).innerHTML =
    "Finish a transportation route to analyze distance, elevation, gradient and terrain.";

}


/* =========================================================
   45. ROUTE LIST
   ========================================================= */

function updateRouteList() {

  populateMathDropdowns();

  const list =
    document.getElementById(
      "routeList"
    );

  list.innerHTML =
    "";

  if (
    transportRoutes.length === 0
  ) {

    list.innerHTML =
      `
        <div class="route-empty">
          No transportation routes created yet.
        </div>
      `;

    return;

  }

  transportRoutes.forEach(
    function(route) {

      const div =
        document.createElement(
          "div"
        );

      div.className =
        "route-item";

      const distance =
        route.analysis
          ? `${formatNumber(route.analysis.distanceKm)} km`
          : "Analyzing...";

      const warningCount =
        route.analysis
          ? route.analysis.warnings.length
          : 0;

      div.innerHTML = `

        <div class="route-item-header">

          <div
            class="route-color"
            style="
              background:${route.color};
            "
          ></div>

          <div class="route-item-name">
            ${escapeHTML(route.name)}
          </div>

        </div>

        <div class="route-item-meta">

          ${escapeHTML(transportTypes[route.type]?.name || route.type)}

          · ${distance} · ${route.lineWidth || 6}px

          <br>

          ${route.points.length} alignment points

          ${
            route.analysis
              ? `
                ·
                <span class="route-status-chip ${
                  route.analysis.status === "danger"
                    ? "route-status-danger"
                    : route.analysis.status === "warning"
                      ? "route-status-warning"
                      : route.analysis.status === "unavailable"
                        ? "route-status-unavailable"
                        : "route-status-ok"
                }">${escapeHTML(route.analysis.statusLabel || "Checked")}</span>
              `
              : ""
          }

        </div>

        <div
          style="
            margin-top:6px;
            display:flex;
            gap:4px;
          "
        >

          <button
            style="
              font-size:9px;
              padding:5px 7px;
            "
            onclick="event.stopPropagation();zoomToTransportRoute('${route.id}')"
          >
            Locate
          </button>

          <button
            style="
              font-size:9px;
              padding:5px 7px;
            "
            onclick="event.stopPropagation();renameTransportRoute('${route.id}')"
          >
            Rename
          </button>

          <button
            style="
              font-size:9px;
              padding:5px 7px;
              background:#b91c1c;
            "
            onclick="event.stopPropagation();deleteTransportRoute('${route.id}')"
          >
            Delete
          </button>

        </div>

      `;

      div.addEventListener(
        "click",
        function() {

          selectTransportRoute(
            route
          );

        }
      );

      list.appendChild(
        div
      );

    }
  );

}


/* =========================================================
   45b. MATH MODE — TOGGLE
   ========================================================= */

function toggleMathMode() {

  mathMode.active =
    !mathMode.active;

  const body =
    document.getElementById(
      "mathModeBody"
    );

  const button =
    document.getElementById(
      "mathModeToggleButton"
    );

  if (mathMode.active) {

    body.style.display = "block";
    button.textContent = "Disable Math Mode";
    populateMathDropdowns();

  }
  else {

    body.style.display = "none";
    button.textContent = "Enable Math Mode";
    cancelCircleDrawing();
    cancelCorridorConstruction();

  }

}


/* =========================================================
   45c. MATH MODE — CIRCLE DRAWING TOOL
   ========================================================= */

function startCircleDrawing() {

  cancelTransportDrawing();
  cancelCorridorConstruction();

  circleDrawing.active = true;
  circleDrawing.centerLatLng = null;
  circleDrawing.centerXY = null;

  if (circleDrawing.previewCircle) {
    map.removeLayer(circleDrawing.previewCircle);
    circleDrawing.previewCircle = null;
  }

  if (circleDrawing.previewRadiusLine) {
    map.removeLayer(circleDrawing.previewRadiusLine);
    circleDrawing.previewRadiusLine = null;
  }

  map.getContainer().style.cursor = "crosshair";

  document.getElementById("circleDrawStatus").textContent =
    "Click the map to place the circle's center.";

}

function handleCircleDrawingClick(latlng) {

  if (!circleDrawing.centerLatLng) {

    circleDrawing.centerLatLng = latlng;
    circleDrawing.centerXY = latLngToCoordinate(latlng);

    document.getElementById("circleDrawStatus").textContent =
      "Move the mouse to set the radius, then click to confirm.";

    return;

  }

  const edgeXY = latLngToCoordinate(latlng);

  const radiusUnits =
    Math.hypot(
      edgeXY.x - circleDrawing.centerXY.x,
      edgeXY.y - circleDrawing.centerXY.y
    );

  if (radiusUnits < 0.5) {

    document.getElementById("circleDrawStatus").textContent =
      "⚠️ Radius too small — click further from the center.";

    return;

  }

  const name =
    `Hub Circle ${circleNumber++}`;

  const circleLayer =
    L.circle(
      circleDrawing.centerLatLng,
      {
        radius: radiusUnits * METERS_PER_UNIT,
        color: "#7c3aed",
        weight: 2.5,
        fillColor: "#7c3aed",
        fillOpacity: .12,
        interactive: true,
        pane: "routePane"
      }
    ).addTo(map);

  const centerMarker =
    L.circleMarker(
      circleDrawing.centerLatLng,
      {
        radius: 4,
        color: "#7c3aed",
        weight: 2,
        fillColor: "white",
        fillOpacity: 1,
        interactive: false,
        pane: "routePane"
      }
    ).addTo(map);

  const circle = {
    id: Date.now() + Math.random(),
    name,
    center: {
      x: circleDrawing.centerXY.x,
      y: circleDrawing.centerXY.y
    },
    centerLatLng: circleDrawing.centerLatLng,
    radius: radiusUnits,
    layer: L.layerGroup([circleLayer, centerMarker]).addTo(map)
  };

  circleLayer.on("click", function() {
    document.getElementById("mathInspectCircle").value = circle.id;
    inspectCircleMath();
  });

  mathCircles.push(circle);

  cancelCircleDrawing();
  updateCircleList();
  populateMathDropdowns();

  document.getElementById("circleDrawStatus").textContent =
    `✅ ${name} created — radius ${formatNumber(radiusUnits)} units ` +
    `(${formatNumber(radiusUnits * KM_PER_UNIT)} km).`;

}

function updateCircleDrawingPreview(latlng) {

  if (!circleDrawing.centerLatLng) {
    return;
  }

  const edgeXY = latLngToCoordinate(latlng);

  const radiusUnits =
    Math.hypot(
      edgeXY.x - circleDrawing.centerXY.x,
      edgeXY.y - circleDrawing.centerXY.y
    );

  if (circleDrawing.previewCircle) {
    map.removeLayer(circleDrawing.previewCircle);
  }

  if (circleDrawing.previewRadiusLine) {
    map.removeLayer(circleDrawing.previewRadiusLine);
  }

  circleDrawing.previewCircle =
    L.circle(
      circleDrawing.centerLatLng,
      {
        radius: radiusUnits * METERS_PER_UNIT,
        color: "#7c3aed",
        weight: 2,
        dashArray: "6 5",
        fillColor: "#7c3aed",
        fillOpacity: .08,
        interactive: false,
        pane: "routePreviewPane"
      }
    ).addTo(map);

  circleDrawing.previewRadiusLine =
    L.polyline(
      [circleDrawing.centerLatLng, latlng],
      {
        color: "#7c3aed",
        weight: 1.5,
        dashArray: "3 4",
        interactive: false,
        pane: "routePreviewPane"
      }
    ).addTo(map);

  document.getElementById("circleDrawStatus").textContent =
    `Radius: ${formatNumber(radiusUnits)} units ` +
    `(${formatNumber(radiusUnits * KM_PER_UNIT)} km). Click to confirm.`;

}

function cancelCircleDrawing() {

  circleDrawing.active = false;
  circleDrawing.centerLatLng = null;
  circleDrawing.centerXY = null;

  if (circleDrawing.previewCircle) {
    map.removeLayer(circleDrawing.previewCircle);
    circleDrawing.previewCircle = null;
  }

  if (circleDrawing.previewRadiusLine) {
    map.removeLayer(circleDrawing.previewRadiusLine);
    circleDrawing.previewRadiusLine = null;
  }

  map.getContainer().style.cursor = "";

  const status = document.getElementById("circleDrawStatus");
  if (status) {
    status.textContent =
      "Click a center point, then click again to set the radius.";
  }

}

function deleteMathCircle(id) {

  const index =
    mathCircles.findIndex(
      circle => String(circle.id) === String(id)
    );

  if (index === -1) {
    return;
  }

  const circle = mathCircles[index];

  if (circle.layer) {
    map.removeLayer(circle.layer);
  }

  mathCircles.splice(index, 1);

  updateCircleList();
  populateMathDropdowns();

}

function clearAllMathCircles() {

  mathCircles.forEach(
    circle => {
      if (circle.layer) {
        map.removeLayer(circle.layer);
      }
    }
  );

  mathCircles.length = 0;

  updateCircleList();
  populateMathDropdowns();

}

function updateCircleList() {

  const list =
    document.getElementById("circleList");

  if (!list) {
    return;
  }

  if (mathCircles.length === 0) {
    list.innerHTML =
      `<div style="font-size:10px;color:#9aa4ad;">No circles created yet.</div>`;
    return;
  }

  list.innerHTML =
    mathCircles.map(
      circle => `
        <div style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          font-size:10px;
          padding:4px 0;
          border-bottom:1px solid #eef1f4;
        ">
          <span>${escapeHTML(circle.name)} · r=${formatNumber(circle.radius)}u</span>
          <button
            style="font-size:9px;padding:3px 6px;background:#b91c1c;"
            onclick="deleteMathCircle('${circle.id}')"
          >✕</button>
        </div>
      `
    ).join("");

}


/* =========================================================
   45d. MATH MODE — PARALLEL/PERPENDICULAR CONSTRUCTION
   ========================================================= */

function startCorridorConstruction(mode) {

  const refId =
    document.getElementById("corridorReferenceRoute").value;

  const status =
    document.getElementById("corridorStatus");

  if (!refId) {
    status.textContent =
      "⚠️ Choose a reference route first.";
    return;
  }

  const refRoute =
    transportRoutes.find(
      route => String(route.id) === String(refId)
    );

  if (!refRoute) {
    status.textContent =
      "⚠️ Reference route not found.";
    return;
  }

  cancelTransportDrawing();
  cancelCircleDrawing();

  const corridor = routeCorridorLine(refRoute);
  const refLine = corridor.line;

  let vertical, slope;

  if (mode === "perpendicular") {

    const perp = perpendicularSlope(refLine);
    vertical = perp.vertical;
    slope = perp.slope;

  }
  else {

    vertical = refLine.vertical;
    slope = refLine.slope;

  }

  corridorConstruction.active = true;
  corridorConstruction.mode = mode;
  corridorConstruction.referenceRouteId = refId;
  corridorConstruction.newMode =
    document.getElementById("corridorNewMode").value || "ROAD";
  corridorConstruction.vertical = vertical;
  corridorConstruction.slope = slope;
  corridorConstruction.throughXY = null;
  corridorConstruction.throughLatLng = null;

  map.getContainer().style.cursor = "crosshair";

  status.textContent =
    `Click a point on the map to build the ${mode} corridor through it.`;

}

function handleCorridorConstructionClick(latlng) {

  const status =
    document.getElementById("corridorStatus");

  if (!corridorConstruction.throughLatLng) {

    corridorConstruction.throughLatLng = latlng;
    corridorConstruction.throughXY = latLngToCoordinate(latlng);

    status.textContent =
      "Move the mouse along the constrained line, then click to set the endpoint.";

    return;

  }

  const endXY =
    projectPointOntoConstrainedLine(
      latLngToCoordinate(latlng),
      corridorConstruction.throughXY,
      corridorConstruction.vertical,
      corridorConstruction.slope
    );

  const throughLatLng =
    corridorConstruction.throughLatLng;

  const endLatLng =
    coordinateToLatLng(endXY.x, endXY.y);

  const refRoute =
    transportRoutes.find(
      route => String(route.id) === String(corridorConstruction.referenceRouteId)
    );

  const type = corridorConstruction.newMode;

  cancelCorridorConstruction();

  /* Reuse the normal drawing pipeline to create a real route. */
  transportDrawing.active = true;
  transportDrawing.type = type;
  transportDrawing.points = [
    L.latLng(throughLatLng.lat, throughLatLng.lng),
    L.latLng(endLatLng.lat, endLatLng.lng)
  ];
  transportDrawing.snappedPin = null;

  const nameInput =
    document.getElementById("routeNameInput");

  if (nameInput && refRoute) {
    nameInput.value =
      `${corridorConstruction.mode === "parallel" ? "Parallel" : "Perpendicular"} to ${refRoute.name}`;
  }

  finishTransportDrawing();

}

function updateCorridorConstructionPreview(latlng) {

  if (!corridorConstruction.throughLatLng) {
    return;
  }

  const endXY =
    projectPointOntoConstrainedLine(
      latLngToCoordinate(latlng),
      corridorConstruction.throughXY,
      corridorConstruction.vertical,
      corridorConstruction.slope
    );

  const endLatLng =
    coordinateToLatLng(endXY.x, endXY.y);

  if (corridorConstruction.previewLine) {
    map.removeLayer(corridorConstruction.previewLine);
  }

  corridorConstruction.previewLine =
    L.polyline(
      [corridorConstruction.throughLatLng, endLatLng],
      {
        color: "#0f766e",
        weight: 3,
        dashArray: "10 7",
        interactive: false,
        pane: "routePreviewPane"
      }
    ).addTo(map);

}

function cancelCorridorConstruction() {

  corridorConstruction.active = false;
  corridorConstruction.mode = null;
  corridorConstruction.referenceRouteId = null;
  corridorConstruction.throughXY = null;
  corridorConstruction.throughLatLng = null;
  corridorConstruction.vertical = false;
  corridorConstruction.slope = null;

  if (corridorConstruction.previewLine) {
    map.removeLayer(corridorConstruction.previewLine);
    corridorConstruction.previewLine = null;
  }

  map.getContainer().style.cursor = "";

  const status = document.getElementById("corridorStatus");
  if (status) {
    status.textContent =
      "Choose a reference route, pick parallel or perpendicular, then click a point on the map to build through it.";
  }

}


/* =========================================================
   45e. MATH MODE — DROPDOWN POPULATION
   ========================================================= */

function populateMathDropdowns() {

  const routeSelectIds = [
    "mathInspectRoute",
    "corridorReferenceRoute",
    "intersectRouteA",
    "intersectRouteB",
    "intersectRouteC"
  ];

  routeSelectIds.forEach(
    id => {

      const select =
        document.getElementById(id);

      if (!select) return;

      const previousValue = select.value;

      select.innerHTML =
        `<option value="">${select.dataset.placeholder || "Choose a route"}</option>` +
        transportRoutes.map(
          route =>
            `<option value="${route.id}">${escapeHTML(route.name)}</option>`
        ).join("");

      if (
        transportRoutes.some(
          route => String(route.id) === String(previousValue)
        )
      ) {
        select.value = previousValue;
      }

    }
  );

  const circleSelectIds = [
    "mathInspectCircle",
    "intersectCircleC"
  ];

  circleSelectIds.forEach(
    id => {

      const select =
        document.getElementById(id);

      if (!select) return;

      const previousValue = select.value;

      select.innerHTML =
        `<option value="">${select.dataset.placeholder || "Choose a circle"}</option>` +
        mathCircles.map(
          circle =>
            `<option value="${circle.id}">${escapeHTML(circle.name)}</option>`
        ).join("");

      if (
        mathCircles.some(
          circle => String(circle.id) === String(previousValue)
        )
      ) {
        select.value = previousValue;
      }

    }
  );

}


/* =========================================================
   45f. MATH MODE — ROUTE / CIRCLE INSPECTOR
   ========================================================= */

function buildRouteMathHTML(route) {

  const xyPoints = routeToXYPoints(route);

  const segmentRows =
    xyPoints.slice(0, -1).map(
      (point, index) => {

        const next = xyPoints[index + 1];
        const line = computeLineFromXY(point, next);

        return `
          <div style="margin-bottom:5px;">
            <strong>Segment ${index + 1}:</strong>
            (${formatNumber(point.x)}, ${formatNumber(point.y)}) →
            (${formatNumber(next.x)}, ${formatNumber(next.y)})<br>
            Slope m = ${line.vertical ? "undefined (vertical)" : formatNumber(line.slope)}<br>
            Equation: <code>${formatLineEquation(line)}</code>
          </div>
        `;

      }
    ).join("");

  const corridor = routeCorridorLine(route);

  return `
    <div style="font-size:10px;line-height:1.5;">
      <div style="
        font-weight:bold;
        margin-bottom:6px;
        color:${route.color};
      ">${escapeHTML(route.name)} (${transportTypes[route.type]?.name || route.type})</div>

      <div style="
        background:#f4f6f8;
        border-radius:6px;
        padding:6px 8px;
        margin-bottom:8px;
      ">
        <strong>Overall corridor</strong>
        (start → end, straight-line assumption):<br>
        Slope m = ${corridor.line.vertical ? "undefined (vertical)" : formatNumber(corridor.line.slope)}<br>
        Equation: <code>${formatLineEquation(corridor.line)}</code>
      </div>

      ${segmentRows}
    </div>
  `;

}

function buildCircleMathHTML(circle) {

  const h = formatNumber(circle.center.x);
  const k = formatNumber(circle.center.y);
  const r = formatNumber(circle.radius);
  const rSq = formatNumber(circle.radius * circle.radius);

  return `
    <div style="font-size:10px;line-height:1.6;">
      <div style="font-weight:bold;color:#7c3aed;margin-bottom:6px;">
        ${escapeHTML(circle.name)}
      </div>
      Center (h, k) = (${h}, ${k})<br>
      Radius r = ${r} units (${formatNumber(circle.radius * KM_PER_UNIT)} km)<br>
      Equation:
      <code>(x − ${h})² + (y − ${k})² = ${rSq}</code>
    </div>
  `;

}

function inspectRouteMath() {

  const id =
    document.getElementById("mathInspectRoute").value;

  const output =
    document.getElementById("mathInspectorOutput");

  if (!id) {
    output.innerHTML = "";
    return;
  }

  const route =
    transportRoutes.find(
      r => String(r.id) === String(id)
    );

  if (!route) {
    output.innerHTML = "";
    return;
  }

  output.innerHTML =
    buildRouteMathHTML(route);

}

function inspectCircleMath() {

  const id =
    document.getElementById("mathInspectCircle").value;

  const output =
    document.getElementById("mathInspectorOutput");

  if (!id) {
    output.innerHTML = "";
    return;
  }

  const circle =
    mathCircles.find(
      c => String(c.id) === String(id)
    );

  if (!circle) {
    output.innerHTML = "";
    return;
  }

  output.innerHTML =
    buildCircleMathHTML(circle);

}


/* =========================================================
   45g. MATH MODE — INTERSECTION MARKERS
   ========================================================= */

function clearMathMarkers() {

  mathMarkers.forEach(
    marker => map.removeLayer(marker)
  );

  mathMarkers.length = 0;

}

function addMathMarker(latlng, color, label) {

  const marker =
    L.circleMarker(
      latlng,
      {
        radius: 7,
        color,
        weight: 3,
        fillColor: "white",
        fillOpacity: 1,
        pane: "routePane"
      }
    ).bindTooltip(
      label,
      { permanent: false }
    ).addTo(map);

  mathMarkers.push(marker);

  return marker;

}


/* =========================================================
   45h. MATH MODE — LINE-LINE INTERSECTION (TRANSFER STATIONS)
   ========================================================= */

function findLineLineIntersectionUI() {

  const idA = document.getElementById("intersectRouteA").value;
  const idB = document.getElementById("intersectRouteB").value;

  const result = document.getElementById("lineLineResult");

  if (!idA || !idB) {
    result.innerHTML =
      `<div style="font-size:10px;color:#b91c1c;">Choose two routes.</div>`;
    return;
  }

  if (idA === idB) {
    result.innerHTML =
      `<div style="font-size:10px;color:#b91c1c;">Choose two different routes.</div>`;
    return;
  }

  const routeA = transportRoutes.find(r => String(r.id) === String(idA));
  const routeB = transportRoutes.find(r => String(r.id) === String(idB));

  if (!routeA || !routeB) {
    result.innerHTML = "";
    return;
  }

  clearMathMarkers();

  const pointsA = routeToXYPoints(routeA);
  const pointsB = routeToXYPoints(routeB);

  let onSegmentMatch = null;
  let anyMatch = null;

  for (let i = 0; i < pointsA.length - 1; i++) {

    const lineA = computeLineFromXY(pointsA[i], pointsA[i + 1]);

    for (let j = 0; j < pointsB.length - 1; j++) {

      const lineB = computeLineFromXY(pointsB[j], pointsB[j + 1]);

      const intersection =
        solveLineLineIntersectionXY(lineA, lineB);

      if (!intersection) continue;

      const candidate = {
        lineA, lineB, intersection,
        segA: [pointsA[i], pointsA[i + 1]],
        segB: [pointsB[j], pointsB[j + 1]]
      };

      if (!anyMatch) anyMatch = candidate;

      const withinA =
        pointWithinSegmentBounds(intersection, pointsA[i], pointsA[i + 1]);
      const withinB =
        pointWithinSegmentBounds(intersection, pointsB[j], pointsB[j + 1]);

      if (withinA && withinB && !onSegmentMatch) {
        onSegmentMatch = candidate;
      }

    }

  }

  const chosen = onSegmentMatch || anyMatch;

  if (!chosen) {

    result.innerHTML = `
      <div style="font-size:10px;line-height:1.5;">
        These two routes run at the same slope (parallel), so the
        system y = m₁x + b₁ and y = m₂x + b₂ has <strong>no unique solution</strong>
        — they never cross.
      </div>
    `;

    return;

  }

  const latlng =
    coordinateToLatLng(chosen.intersection.x, chosen.intersection.y);

  addMathMarker(
    latlng,
    onSegmentMatch ? "#16a34a" : "#f59e0b",
    `Transfer point (${formatNumber(chosen.intersection.x)}, ${formatNumber(chosen.intersection.y)})`
  );

  map.panTo(latlng);

  result.innerHTML = `
    <div style="font-size:10px;line-height:1.6;">
      <strong>${escapeHTML(routeA.name)}:</strong>
      <code>${formatLineEquation(chosen.lineA)}</code><br>
      <strong>${escapeHTML(routeB.name)}:</strong>
      <code>${formatLineEquation(chosen.lineB)}</code><br><br>

      Solving the system by substitution gives:<br>
      <strong>Intersection point:</strong>
      (${formatNumber(chosen.intersection.x)}, ${formatNumber(chosen.intersection.y)})<br><br>

      ${
        onSegmentMatch
          ? `✅ This point lies on both drawn segments — a realistic <strong>transfer station</strong> location.`
          : `⚠️ The lines cross at this point only if extended beyond the segments you actually drew — not a usable transfer point as currently drawn.`
      }
    </div>
  `;

}


/* =========================================================
   45i. MATH MODE — LINE-CIRCLE INTERSECTION (ROUTE ∩ HUB)
   ========================================================= */

function findLineCircleIntersectionUI() {

  const routeId = document.getElementById("intersectRouteC").value;
  const circleId = document.getElementById("intersectCircleC").value;

  const result = document.getElementById("lineCircleResult");

  if (!routeId || !circleId) {
    result.innerHTML =
      `<div style="font-size:10px;color:#b91c1c;">Choose a route and a circle.</div>`;
    return;
  }

  const route = transportRoutes.find(r => String(r.id) === String(routeId));
  const circle = mathCircles.find(c => String(c.id) === String(circleId));

  if (!route || !circle) {
    result.innerHTML = "";
    return;
  }

  clearMathMarkers();

  const points = routeToXYPoints(route);

  let totalIntersections = 0;
  let firstDetail = null;

  const rows = [];

  for (let i = 0; i < points.length - 1; i++) {

    const line = computeLineFromXY(points[i], points[i + 1]);
    const solved = solveLineCircleIntersectionXY(line, circle);

    const onSegmentPoints =
      solved.points.filter(
        pt => pointWithinSegmentBounds(pt, points[i], points[i + 1], 0.15)
      );

    totalIntersections += onSegmentPoints.length;

    if (onSegmentPoints.length && !firstDetail) {
      firstDetail = { line, solved, segIndex: i };
    }

    rows.push(
      `Segment ${i + 1}: discriminant = ${formatNumber(solved.discriminant)} → ` +
      `${onSegmentPoints.length} intersection${onSegmentPoints.length === 1 ? "" : "s"} on this segment`
    );

    onSegmentPoints.forEach(
      pt => {
        const latlng = coordinateToLatLng(pt.x, pt.y);
        addMathMarker(
          latlng,
          "#dc2626",
          `Route enters hub coverage at (${formatNumber(pt.x)}, ${formatNumber(pt.y)})`
        );
      }
    );

  }

  if (firstDetail) {
    const firstLatLng =
      coordinateToLatLng(
        firstDetail.solved.points[0].x,
        firstDetail.solved.points[0].y
      );
    map.panTo(firstLatLng);
  }

  const h = formatNumber(circle.center.x);
  const k = formatNumber(circle.center.y);
  const r = formatNumber(circle.radius);

  result.innerHTML = `
    <div style="font-size:10px;line-height:1.6;">
      <strong>${escapeHTML(circle.name)}:</strong>
      <code>(x − ${h})² + (y − ${k})² = ${formatNumber(circle.radius * circle.radius)}</code><br>
      <strong>${escapeHTML(route.name)}</strong> checked segment by segment:<br>
      ${rows.map(row => `• ${row}`).join("<br>")}<br><br>
      <strong>Total intersections with the circle: ${totalIntersections}</strong><br>
      ${
        totalIntersections === 0
          ? "This route never enters the hub's coverage circle."
          : totalIntersections === 1
            ? "The route is tangent to the coverage boundary — touching it at exactly one point (discriminant = 0)."
            : "The route crosses into and out of the coverage circle."
      }
    </div>
  `;

}


/* =========================================================
   46. SELECT ROUTE
   ========================================================= */

function selectTransportRoute(
  route
) {

  if (
    !route
  ) {
    return;
  }

  if (route.line) {
    route.line.eachLayer(layer => {
      if (layer.setStyle) {
        layer.setStyle({pane:"routePane"});
      }
    });
  }

  document.getElementById(
    "analysisContent"
  ).innerHTML =
    buildRouteAnalysisHTML(
      route
    );

}


/* =========================================================
   47. DELETE ROUTE
   ========================================================= */

function deleteTransportRoute(
  id
) {

  const index =
    transportRoutes.findIndex(
      route =>
        String(route.id) ===
        String(id)
    );

  if (
    index === -1
  ) {
    return;
  }

  const route =
    transportRoutes[index];

  if (route.line) {

    map.removeLayer(
      route.line
    );

  }

  route.warningLayers
    .forEach(
      layer => {

        if (
          map.hasLayer(layer)
        ) {

          map.removeLayer(
            layer
          );

        }

      }
    );

  transportRoutes.splice(
    index,
    1
  );

  updateRouteList();

  document.getElementById(
    "analysisContent"
  ).innerHTML =
    "Select or finish a route to view its analysis.";

}



/* =========================================================
   48. RENAME ROUTE
   ========================================================= */

function renameTransportRoute(id) {

  const route =
    transportRoutes.find(
      item =>
        String(item.id) ===
        String(id)
    );

  if (!route) {
    return;
  }

  const proposed =
    prompt(
      "Enter a new route name:",
      route.name
    );

  if (proposed === null) {
    return;
  }

  const name =
    proposed.trim();

  if (!name) {
    return;
  }

  route.name =
    name;

  updateRouteList();
  selectTransportRoute(route);

}


/* =========================================================
   49. ZOOM ROUTE
   ========================================================= */

function zoomToTransportRoute(
  id
) {

  const route =
    transportRoutes.find(
      item =>
        String(item.id) ===
        String(id)
    );

  if (
    !route ||
    !route.points.length
  ) {
    return;
  }

  const bounds =
    L.latLngBounds(
      route.points
    );

  map.fitBounds(
    bounds,
    {
      padding:
        [50,50],

      maxZoom:
        15
    }
  );

}


/* =========================================================
   49. DISTANCE
   ========================================================= */

function calculatePolylineDistance(
  points
) {

  let meters =
    0;

  for (
    let i = 1;
    i < points.length;
    i++
  ) {

    meters +=
      points[i - 1].distanceTo(
        points[i]
      );

  }

  return meters;

}


/* =========================================================
   50. INTERPOLATE POINTS
   ========================================================= */

function sampleRoutePoints(
  points,
  maxSamples = 30
) {

  if (
    points.length <= 2
  ) {
    return points;
  }

  const totalDistance =
    calculatePolylineDistance(
      points
    );

  if (
    totalDistance <= 0
  ) {
    return points;
  }

  const samples = [];

  for (
    let i = 0;
    i <= maxSamples;
    i++
  ) {

    const targetDistance =
      (
        i /
        maxSamples
      ) *
      totalDistance;

    let accumulated =
      0;

    let found =
      null;

    for (
      let j = 1;
      j < points.length;
      j++
    ) {

      const segment =
        points[j - 1].distanceTo(
          points[j]
        );

      if (
        accumulated +
        segment >=
        targetDistance
      ) {

        const remaining =
          targetDistance -
          accumulated;

        const ratio =
          segment === 0
            ? 0
            : remaining /
              segment;

        found =
          L.latLng(

            points[j - 1].lat +
            (
              points[j].lat -
              points[j - 1].lat
            ) *
            ratio,

            points[j - 1].lng +
            (
              points[j].lng -
              points[j - 1].lng
            ) *
            ratio

          );

        break;

      }

      accumulated +=
        segment;

    }

    if (!found) {

      found =
        points[
          points.length - 1
        ];

    }

    samples.push(
      found
    );

  }

  return samples;

}


/* =========================================================
   51. ELEVATION BATCH
   ========================================================= */

async function fetchRouteElevations(
  points
) {

  /*
     Open-Elevation accepts multiple locations.
  */

  const locations =
    points.map(
      point =>
        `${point.lat},${point.lng}`
    ).join("|");

  const url =
    `https://api.open-elevation.com/api/v1/lookup?locations=${encodeURIComponent(locations)}`;

  const response =
    await fetch(
      url
    );

  if (
    !response.ok
  ) {

    throw new Error(
      "Elevation service unavailable."
    );

  }

  const data =
    await response.json();

  if (
    !data ||
    !data.results
  ) {

    throw new Error(
      "No elevation data returned."
    );

  }

  return data.results.map(
    result =>
      Number(
        result.elevation
      )
  );

}


/* =========================================================
   51b. APPLY ROUTE VISUAL STATUS
   ========================================================= */

function applyRouteVisualStatus(route) {

  if (
    !route ||
    !route.line
  ) {
    return;
  }

  const status =
    route.analysis?.status;

  const color =
    status === "danger"
      ? "#dc2626"
      : status === "warning"
        ? "#f59e0b"
        : status === "unavailable"
          ? "#9ca3af"
          : route.color;

  const dashArray =
    status === "danger"
      ? "6 5"
      : status === "warning"
        ? "10 6"
        : null;

  route.line.eachLayer(
    layer => {

      if (
        !layer.setStyle
      ) {
        return;
      }

      /* Skip the white halo/outline layer underneath. */
      if (
        layer.options.color === "#ffffff"
      ) {
        return;
      }

      layer.setStyle({
        color,
        dashArray
      });

    }
  );

}


/* =========================================================
   52. ROUTE ANALYSIS
   ========================================================= */

async function analyzeTransportRoute(route) {

  const analysisContent = document.getElementById("analysisContent");
  analysisContent.innerHTML = `<div class="analysis-box analysis-neutral">⏳ Checking terrain, water, protected areas and mode constraints...</div>`;

  try {
    const samples = sampleRoutePoints(route.points, 25);
    const [elevationResult, waterResult, protectedResult] = await Promise.all([
      fetchElevationSafe(samples),
      fetchWaterFeaturesSafe(route.points),
      fetchDENRProtectedAreasSafe(route.points)
    ]);

    route.analysis = calculateRouteAnalysis(route, samples, elevationResult.values, {
      water:waterResult,
      protectedAreas:protectedResult
    });

    drawRouteWarnings(route, samples, elevationResult.values);
    applyRouteVisualStatus(route);
    analysisContent.innerHTML = buildRouteAnalysisHTML(route);
  } catch(error) {
    console.warn("Route analysis failed:", error);
    const distanceKm = calculatePolylineDistance(route.points)/1000;
    route.analysis = {
      distanceKm, elevations:[], minElevation:null, maxElevation:null, elevationChange:null,
      maxGradient:null,
      warnings:[{type:"data",severity:"warning",title:"Planning data unavailable",message:"One or more live geographic datasets could not be confirmed."}],
      terrainStatus:"unavailable", waterCrossings:0, waterStatus:"unavailable",
      protectedIntersections:0, protectedStatus:"unavailable", chokepoints:0,
      status:"unavailable", statusLabel:"Data incomplete", samples
    };
    analysisContent.innerHTML = buildRouteAnalysisHTML(route);
    applyRouteVisualStatus(route);
  }

  updateRouteList();
}

/* =========================================================
   53. CALCULATE ANALYSIS
   ========================================================= */

function calculateRouteAnalysis(route, samples, elevations, geographic = {}) {

  const profile = transportTypes[route.type];
  const distanceKm = calculatePolylineDistance(route.points) / 1000;
  const validElevations = elevations.filter(Number.isFinite);

  const minElevation = validElevations.length ? Math.min(...validElevations) : null;
  const maxElevation = validElevations.length ? Math.max(...validElevations) : null;
  const elevationChange = minElevation !== null ? maxElevation - minElevation : null;

  let maxGradient = null;
  let steepestIndex = -1;

  if (validElevations.length > 1) {
    maxGradient = 0;
    for (let i = 1; i < elevations.length; i++) {
      const previous = elevations[i - 1];
      const current = elevations[i];
      if (!Number.isFinite(previous) || !Number.isFinite(current)) continue;

      const segmentDistance = samples[i - 1].distanceTo(samples[i]);
      if (segmentDistance <= 0) continue;

      const gradient = Math.abs(current - previous) / segmentDistance * 100;
      if (gradient > maxGradient) {
        maxGradient = gradient;
        steepestIndex = i;
      }
    }
  }

  const warnings = [];

  if (maxGradient !== null && profile.maxPreferredGrade !== null) {
    if (maxGradient > profile.maxCriticalGrade) {
      warnings.push({
        type:"gradient", severity:"danger", index:steepestIndex,
        title:"Excessive grade for this mode",
        message:`Estimated maximum grade is ${formatNumber(maxGradient)}%, beyond the ${formatNumber(profile.maxCriticalGrade)}% critical planning envelope for ${profile.name}.`
      });
    } else if (maxGradient > profile.maxPreferredGrade) {
      warnings.push({
        type:"gradient", severity:"warning", index:steepestIndex,
        title:"Steep grade for this mode",
        message:`Estimated maximum grade is ${formatNumber(maxGradient)}%, above the ${formatNumber(profile.maxPreferredGrade)}% preferred operating envelope for ${profile.name}.`
      });
    }
  }

  if (elevationChange !== null && elevationChange >= 300 && profile.terrainFlexibility !== "water") {
    warnings.push({
      type:"terrain",
      severity:elevationChange >= 600 ? "danger" : "warning",
      title:"Difficult terrain",
      message:`Sampled elevation changes by approximately ${formatNumber(elevationChange)} m along the alignment.`
    });
  }

  const water = geographic.water || {status:"unavailable",crossings:0,features:[],waterFraction:0};

  if (water.status === "confirmed") {
    if (water.crossings > 0 && !profile.waterAllowed) {
      warnings.push({
        type:"water",
        severity:water.maxCrossingKm > 5 ? "danger" : "warning",
        title:"Water crossing",
        message:`${water.crossings} mapped water feature crossing${water.crossings === 1 ? "" : "s"} detected; ${profile.name} would require ${profile.waterCrossing}.`
      });
    }
    if (profile.waterAllowed && water.waterFraction < 0.15 && route.type === "FERRY") {
      warnings.push({
        type:"water",
        severity:"warning",
        title:"Limited suitable water",
        message:"Only a small portion of the proposed ferry alignment is over mapped water. Check navigability, terminals and landing conditions."
      });
    }
  } else {
    warnings.push({
      type:"water-data", severity:"warning",
      title:"Water data unavailable",
      message:"The live water dataset could not be confirmed, so water-crossing status is not definitive."
    });
  }

  const protectedAreas = geographic.protectedAreas || {status:"unavailable",intersections:[],nearby:0};

  if (protectedAreas.status === "confirmed") {
    if (protectedAreas.intersections.length) {
      protectedAreas.intersections.forEach(pa => {
        warnings.push({
          type:"protected", severity:"danger",
          title:"DENR protected-area intersection",
          message:`The proposed alignment intersects ${pa.name || "a DENR-BMB protected area"}. Avoidance or formal environmental review is required before treating this alignment as feasible.`
        });
      });
    } else if ((protectedAreas.nearby || 0) > 0) {
      warnings.push({
        type:"protected-nearby", severity:"warning",
        title:"Near DENR protected area",
        message:`${protectedAreas.nearby} DENR-BMB protected-area boundary/boundaries are within approximately 1 km of the proposed alignment.`
      });
    }
  } else {
    warnings.push({
      type:"protected-data", severity:"warning",
      title:"DENR protected-area data unavailable",
      message:"The official DENR-BMB GIS query did not return confirmed geometry, so protected-area status is unavailable."
    });
  }

  const chokepoints = detectPotentialChokepoints(route, samples, geographic);
  warnings.push(...chokepoints);

  const dangerCount = warnings.filter(w => w.severity === "danger").length;
  const status =
    dangerCount ? "danger" :
    warnings.length ? "warning" :
    (water.status === "unavailable" || protectedAreas.status === "unavailable" || !validElevations.length)
      ? "unavailable" : "ok";

  return {
    distanceKm, elevations, minElevation, maxElevation, elevationChange,
    maxGradient, warnings,
    terrainStatus:validElevations.length ? "confirmed" : "unavailable",
    waterCrossings:water.crossings || 0,
    waterStatus:water.status,
    protectedIntersections:protectedAreas.intersections?.length || 0,
    protectedStatus:protectedAreas.status,
    chokepoints:chokepoints.length,
    status,
    statusLabel:status==="danger" ? "High concern" : status==="warning" ? "Review needed" : status==="unavailable" ? "Data incomplete" : "No major flags",
    samples
  };
}

function detectPotentialChokepoints(route, samples, geographic) {
  const warnings = [];

  if ((geographic.water?.crossings || 0) > 0 && route.type !== "FERRY") {
    warnings.push({
      type:"chokepoint", severity:"warning",
      title:"Potential infrastructure chokepoint",
      message:"A water crossing concentrates the alignment at a bridge, tunnel or elevated structure location."
    });
  }

  if ((geographic.protectedAreas?.intersections?.length || 0) > 0) {
    warnings.push({
      type:"chokepoint", severity:"danger",
      title:"Potential environmental chokepoint",
      message:"A protected-area intersection may leave limited feasible corridor choices."
    });
  }

  return warnings;
}

function makeWarningMarker(point, symbol, severe=false) {
  return L.marker(point, {
    icon:L.divIcon({
      className:"",
      html:`<div class="warning-marker ${severe ? "" : "yellow"}">${symbol}</div>`,
      iconSize:[22,22], iconAnchor:[11,11]
    }),
    zIndexOffset:2600
  }).addTo(map);
}

function clearRouteWarningLayers(route) {
  route.warningLayers = route.warningLayers || [];
  route.warningLayers.forEach(layer => {
    if (map.hasLayer(layer)) map.removeLayer(layer);
  });
  route.warningLayers = [];
}

function drawRouteWarnings(route, samples, elevations) {
  clearRouteWarningLayers(route);
  if (!route.analysis) return;

  route.analysis.warnings.forEach(warning => {
    let index = Number.isFinite(warning.index) ? warning.index : Math.floor(samples.length/2);
    index = Math.max(0, Math.min(samples.length-1,index));

    const marker = makeWarningMarker(
      samples[index],
      warning.type==="gradient" ? "↗" :
      warning.type==="protected" ? "⚠" :
      warning.type==="water" ? "≋" : "!",
      warning.severity==="danger"
    );

    marker.bindPopup(`<strong>${escapeHTML(warning.title)}</strong><br><br>${escapeHTML(warning.message)}`);
    route.warningLayers.push(marker);
  });
}

/* =========================================================
   56. ROUTE ANALYSIS HTML
   ========================================================= */

function buildRouteAnalysisHTML(route) {

  if (!route.analysis) {
    return `<div class="analysis-box analysis-neutral">⏳ Live planning analysis is still running...</div>`;
  }

  const a = route.analysis;
  let html = `
    <strong>${escapeHTML(route.name)}</strong><br>
    Mode: ${escapeHTML(transportTypes[route.type]?.name || route.type)}<br>
    Line width: ${formatNumber(route.lineWidth || 6)} px<br>
    Alignment points: ${route.points.length}<br>
    Distance: ${formatNumber(a.distanceKm)} km
  `;

  if (a.minElevation !== null) {
    html += `<br>Minimum elevation: ${formatNumber(a.minElevation)} m
      <br>Maximum elevation: ${formatNumber(a.maxElevation)} m
      <br>Elevation variation: ${formatNumber(a.elevationChange)} m
      <br>Maximum estimated grade: ${a.maxGradient === null ? "Unavailable" : formatNumber(a.maxGradient)+"%"}`;
  } else {
    html += `<br>Terrain: <strong>Unavailable</strong>`;
  }

  html += `<br>Water crossings: ${a.waterStatus==="confirmed" ? a.waterCrossings : "Unavailable"}
    <br>DENR protected-area intersections: ${a.protectedStatus==="confirmed" ? a.protectedIntersections : "Unavailable"}
    <br>Potential chokepoints: ${a.chokepoints}`;

  if (!a.warnings.length) {
    html += `<div class="analysis-box analysis-ok">🟢 <strong>No major confirmed planning flags.</strong><br>Current live datasets returned no major conflicts for the alignment.</div>`;
  } else {
    a.warnings.forEach(warning => {
      html += `<div class="analysis-box ${warning.severity==="danger" ? "analysis-danger" : "analysis-warning"}">
        ${warning.severity==="danger" ? "🔴" : "🟠"}
        <strong>${escapeHTML(warning.title)}</strong><br>
        ${escapeHTML(warning.message)}
      </div>`;
    });
  }

  html += `<div style="margin-top:7px;font-size:9px;color:#756b5c;">
    Live data status is explicit. Missing datasets are reported as unavailable and are not treated as evidence of suitability.
    Conceptual planning only; detailed engineering and environmental review remain required.
  </div>`;

  return html;
}

/* =========================================================
   56A. LIVE GEOGRAPHIC ANALYSIS
   ========================================================= */

const LIVE_DATA = {
  elevationUrl:"https://api.open-elevation.com/api/v1/lookup",
  overpassUrl:"https://overpass-api.de/api/interpreter",
  denrProtectedUrl:"https://services1.arcgis.com/IwZZTMxZCmAmFYvF/ArcGIS/rest/services/DENR_BMB/FeatureServer/2/query"
};

let liveAnalysisTimer = null;
let liveAnalysisRequestId = 0;
let lastLiveGeometryKey = "";

function scheduleLiveRouteAnalysis(points,type) {
  if (!points || points.length < 1) return;
  clearTimeout(liveAnalysisTimer);
  liveAnalysisTimer=setTimeout(()=>runLiveRouteAnalysis(points,type),650);
}

async function runLiveRouteAnalysis(points,type) {
  if (!transportDrawing.active || points.length<1) return;

  const requestId=++liveAnalysisRequestId;
  const geometryKey=points.map(p=>`${p.lat.toFixed(5)},${p.lng.toFixed(5)}`).join("|");
  if (geometryKey===lastLiveGeometryKey) return;
  lastLiveGeometryKey=geometryKey;

  const statusEl=document.getElementById("dataSourceStatus");
  if(statusEl) statusEl.textContent="🟡 Checking terrain, water and DENR-BMB protected areas…";

  const preview=points.length>1 ? sampleRoutePoints(points,Math.min(12,Math.max(4,points.length*2))) : points;

  const [elevationResult,waterResult,protectedResult]=await Promise.all([
    fetchElevationSafe(preview),
    fetchWaterFeaturesSafe(preview),
    fetchDENRProtectedAreasSafe(points)
  ]);

  if(requestId!==liveAnalysisRequestId || !transportDrawing.active) return;

  const tempRoute={name:"Current alignment",type,points,warningLayers:[]};
  const analysis=calculateRouteAnalysis(tempRoute,preview,elevationResult.values,{
    water:waterResult, protectedAreas:protectedResult
  });

  updateLivePreviewVisuals(analysis);
  updateLiveDrawingStatus(analysis);

  if(statusEl){
    const t=elevationResult.status==="confirmed"?"terrain ✓":"terrain unavailable";
    const w=waterResult.status==="confirmed"?"water ✓":"water unavailable";
    const d=protectedResult.status==="confirmed"?"DENR-BMB ✓":"DENR-BMB unavailable";
    statusEl.textContent=`Live check: ${t} · ${w} · ${d}`;
  }
}

async function fetchElevationSafe(points) {
  if(!points.length) return {status:"unavailable",values:[]};
  try{
    const locations=points.map(p=>`${p.lat},${p.lng}`).join("|");
    const response=await fetch(`${LIVE_DATA.elevationUrl}?locations=${encodeURIComponent(locations)}`,{cache:"no-store"});
    if(!response.ok) throw new Error("Elevation request failed");
    const data=await response.json();
    const values=(data.results||[]).map(r=>Number(r.elevation));
    if(!values.length || values.some(v=>!Number.isFinite(v))) throw new Error("Elevation data incomplete");
    return {status:"confirmed",values};
  }catch(error){
    console.warn("Live elevation unavailable:",error);
    return {status:"unavailable",values:[]};
  }
}

function routeBBox(points,pad=0.02) {
  const lats=points.map(p=>p.lat), lngs=points.map(p=>p.lng);
  return {south:Math.min(...lats)-pad,west:Math.min(...lngs)-pad,north:Math.max(...lats)+pad,east:Math.max(...lngs)+pad};
}

async function fetchWaterFeaturesSafe(points) {
  if(points.length<2) return {status:"unavailable",crossings:0,features:[],waterFraction:0,maxCrossingKm:0};

  const b=routeBBox(points,0.015);
  const query=`[out:json][timeout:20];(way["natural"="water"](${b.south},${b.west},${b.north},${b.east});way["waterway"~"river|canal|stream"](${b.south},${b.west},${b.north},${b.east}););out tags geom;`;

  try{
    const response=await fetch(`${LIVE_DATA.overpassUrl}?data=${encodeURIComponent(query)}`,{cache:"no-store"});
    if(!response.ok) throw new Error("Water service failed");
    const data=await response.json();
    const features=[];

    (data.elements||[]).forEach(el=>{
      if(!el.geometry||el.geometry.length<2)return;
      const coords=el.geometry.map(p=>[p.lon,p.lat]);
      const closed=coords.length>=4 && coords[0][0]===coords[coords.length-1][0] && coords[0][1]===coords[coords.length-1][1];
      features.push({
        type:"Feature",properties:el.tags||{},
        geometry:closed?{type:"Polygon",coordinates:[coords]}:{type:"LineString",coordinates:coords}
      });
    });

    const routeLine=turf.lineString(points.map(p=>[p.lng,p.lat]));
    let crossings=0;
    features.forEach(feature=>{try{if(turf.booleanIntersects(routeLine,feature))crossings++;}catch(e){}});

    const samplePts=sampleRoutePoints(points,Math.max(8,Math.min(30,points.length*4)));
    let wetSamples=0;
    samplePts.forEach(p=>{
      const pt=turf.point([p.lng,p.lat]);
      if(features.some(f=>{
        try{return f.geometry.type==="Polygon" && turf.booleanPointInPolygon(pt,f);}catch(e){return false;}
      })) wetSamples++;
    });

    return {
      status:"confirmed",crossings,features,
      waterFraction:samplePts.length?wetSamples/samplePts.length:0,
      maxCrossingKm:crossings?Math.min(50,turf.length(routeLine,{units:"kilometers"})):0
    };
  }catch(error){
    console.warn("Live water data unavailable:",error);
    return {status:"unavailable",crossings:0,features:[],waterFraction:0,maxCrossingKm:0};
  }
}

async function fetchDENRProtectedAreasSafe(points) {
  if(points.length<2)return {status:"unavailable",intersections:[],nearby:0};

  try{
    const routeLine=turf.lineString(points.map(p=>[p.lng,p.lat]));
    const buffered=turf.buffer(routeLine,1,{units:"kilometers"});
    const rings=buffered?.geometry?.coordinates?.[0];

    if(!rings || rings.length<4) throw new Error("Could not build protected-area search corridor");

    const geometry={rings};
    const params=new URLSearchParams({
      f:"geojson",where:"1=1",geometry:JSON.stringify(geometry),
      geometryType:"esriGeometryPolygon",inSR:"4326",
      spatialRel:"esriSpatialRelIntersects",
      outFields:"PA_Name,LegalBasis,Status,Category,Area_Ha",
      returnGeometry:"true",outSR:"4326"
    });

    const response=await fetch(`${LIVE_DATA.denrProtectedUrl}?${params.toString()}`,{cache:"no-store"});
    if(!response.ok)throw new Error("DENR-BMB protected-area service failed");
    const geojson=await response.json();

    const intersections=[];
    let nearby=0;

    (geojson.features||[]).forEach(f=>{
      let intersects=false;
      try{ intersects=turf.booleanIntersects(routeLine,f); }catch(e){}
      const item={
        name:f.properties?.PA_Name||"DENR-BMB protected area",
        legalBasis:f.properties?.LegalBasis||"",
        status:f.properties?.Status||"",
        category:f.properties?.Category||"",
        areaHa:f.properties?.Area_Ha||null
      };
      if(intersects) intersections.push(item);
      else nearby++;
    });

    return {status:"confirmed",intersections,nearby};
  }catch(error){
    console.warn("DENR-BMB protected-area data unavailable:",error);
    return {status:"unavailable",intersections:[],nearby:0};
  }
}

function updateLivePreviewVisuals(analysis) {
  if(!transportDrawing.previewLine)return;
  const color=analysis.status==="danger"?"#dc2626":analysis.status==="warning"?"#f59e0b":transportTypes[transportDrawing.type].color;
  transportDrawing.previewLine.setStyle({
    color,weight:getSelectedRouteLineWidth(),opacity:.82,
    dashArray:analysis.status==="danger"?"6 5":"8 8"
  });
}

function updateLiveDrawingStatus(analysis) {
  const status=document.getElementById("drawStatus");
  if(!status)return;
  const icon=analysis.status==="danger"?"🔴":analysis.status==="warning"?"🟠":analysis.status==="unavailable"?"🟡":"🟢";
  const firstWarnings=analysis.warnings.slice(0,2).map(w=>w.title);
  status.textContent=`${icon} ${transportTypes[transportDrawing.type].name}: ${analysis.distanceKm.toFixed(1)} km · ${firstWarnings.length?firstWarnings.join(" · "):"No major live flags"}`;
}

/* =========================================================
   57. SEARCH LOCATION
   ========================================================= */

let searchMarker = null;


async function searchLocation() {

  const input =
    document.getElementById(
      "locationSearch"
    );

  const query =
    input.value.trim();

  const status =
    document.getElementById(
      "searchStatus"
    );

  const results =
    document.getElementById(
      "searchResults"
    );

  if (!query) {

    status.textContent =
      "Enter a location to search.";

    return;

  }

  status.textContent =
    "Searching...";

  results.innerHTML =
    "";

  try {

    const url =
      `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=8&countrycodes=ph&q=${encodeURIComponent(query)}`;

    const response =
      await fetch(
        url,
        {
          headers: {
            "Accept":
              "application/json"
          }
        }
      );

    if (!response.ok) {

      throw new Error(
        "Search service unavailable."
      );

    }

    const data =
      await response.json();

    if (!data.length) {

      status.textContent =
        "No matching Philippine locations found.";

      return;

    }

    status.textContent =
      `${data.length} result${data.length === 1 ? "" : "s"} found.`;

    data.forEach(
      function(item) {

        const div =
          document.createElement(
            "div"
          );

        div.className =
          "search-result-item";

        div.innerHTML = `

          <div class="search-result-name">

            ${escapeHTML(
              item.display_name
            )}

          </div>

          <div class="search-result-type">

            ${escapeHTML(
              item.type || "Location"
            )}

          </div>

          <div class="search-result-pin">

            Click to locate

          </div>

        `;

        div.addEventListener(
          "click",
          function() {

            locateSearchResult(
              Number(item.lat),
              Number(item.lon),
              item.display_name
            );

          }
        );

        results.appendChild(
          div
        );

      }
    );

    locateSearchResult(
      Number(data[0].lat),
      Number(data[0].lon),
      data[0].display_name
    );

  }

  catch(error) {

    console.error(
      error
    );

    status.textContent =
      "Search failed. Please try again.";

  }

}


function handleSearchKey(
  event
) {

  if (
    event.key === "Enter"
  ) {

    searchLocation();

  }

}


/* =========================================================
   58. LOCATE SEARCH RESULT
   ========================================================= */

function locateSearchResult(
  lat,
  lng,
  name
) {

  if (searchMarker) {

    map.removeLayer(
      searchMarker
    );

  }

  searchMarker =
    L.marker(
      [lat,lng],
      {

        icon:
          L.divIcon({

            className:
              "",

            html:
              `<div class="search-location-marker"></div>`,

            iconSize:
              [22,22],

            iconAnchor:
              [11,11]

          }),

        zIndexOffset:
          3000

      }
    ).addTo(map);

  searchMarker.bindPopup(
    `<strong>${escapeHTML(name)}</strong>`
  );

  searchMarker.openPopup();

  map.setView(
    [lat,lng],
    16,
    {
      animate:
        true
    }
  );

}




/* =========================================================
   GPS-LIKE PIN-TO-PIN LAND ROUTING
   ========================================================= */

let pinToPinRouteLayer = null;
let pinToPinRouteRequest = 0;

/* Small cursor target used only while the Transportation Planner is drawing. */
let drawingCursorMarker = null;

function updateDrawingCursorMarker(latlng, snapped = null) {

  if (!transportDrawing.active) {
    if (drawingCursorMarker && map.hasLayer(drawingCursorMarker)) {
      map.removeLayer(drawingCursorMarker);
    }
    drawingCursorMarker = null;
    return;
  }

  const point =
    snapped
      ? snapped.latlng
      : latlng;

  if (!drawingCursorMarker) {

    drawingCursorMarker =
      L.circleMarker(
        point,
        {
          radius: 6,
          color: "#17365d",
          weight: 2,
          fillColor: "#ffffff",
          fillOpacity: 0.95,
          interactive: false,
          pane: "routePreviewPane"
        }
      ).addTo(map);

  }
  else {

    drawingCursorMarker.setLatLng(
      point
    );

  }

}

function refreshPinRouteSelectors() {

  const start =
    document.getElementById("gpsStartPin");

  const end =
    document.getElementById("gpsEndPin");

  if (!start || !end) return;

  const previousStart = start.value;
  const previousEnd = end.value;

  const options = placedPins
    .map(pin => `
      <option value="${escapeHTML(String(pin.id))}">
        ${escapeHTML(pin.name)}${pin.type ? " · " + escapeHTML(pin.type) : ""}
      </option>
    `)
    .join("");

  start.innerHTML =
    `<option value="">Choose a transportation pin</option>${options}`;

  end.innerHTML =
    `<option value="">Choose a transportation pin</option>${options}`;

  if (placedPins.some(pin => String(pin.id) === previousStart)) {
    start.value = previousStart;
  }

  if (placedPins.some(pin => String(pin.id) === previousEnd)) {
    end.value = previousEnd;
  }
}

function getPinById(id) {
  return placedPins.find(
    pin => String(pin.id) === String(id)
  ) || null;
}

function clearPinToPinRoute() {

  if (pinToPinRouteLayer && map.hasLayer(pinToPinRouteLayer)) {
    map.removeLayer(pinToPinRouteLayer);
  }

  pinToPinRouteLayer = null;

  const status =
    document.getElementById("gpsRouteStatus");

  if (status) {
    status.textContent =
      "Choose two transportation pins to calculate a mostly land-based route.";
  }
}

async function createPinToPinRoute() {

  const startPin =
    getPinById(
      document.getElementById("gpsStartPin")?.value
    );

  const endPin =
    getPinById(
      document.getElementById("gpsEndPin")?.value
    );

  const status =
    document.getElementById("gpsRouteStatus");

  if (!startPin || !endPin) {
    if (status) {
      status.textContent =
        "⚠️ Select both a start pin and a destination pin.";
    }
    return;
  }

  if (String(startPin.id) === String(endPin.id)) {
    if (status) {
      status.textContent =
        "⚠️ Start and destination must be different pins.";
    }
    return;
  }

  clearPinToPinRoute();

  if (status) {
    status.textContent =
      "🟡 Finding a mostly land-based road route…";
  }

  const requestId = ++pinToPinRouteRequest;

  try {

    /*
      OSRM's public routing service uses OpenStreetMap road data.
      The driving profile is deliberately used here because the
      requested GPS-like function is intended to prefer land
      transportation rather than a straight geographic line.
    */
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${startPin.longitude},${startPin.latitude};` +
      `${endPin.longitude},${endPin.latitude}` +
      `?overview=full&geometries=geojson&steps=true`;

    const response =
      await fetch(url, {
        cache: "no-store"
      });

    if (!response.ok) {
      throw new Error("Routing service unavailable.");
    }

    const data =
      await response.json();

    if (
      requestId !== pinToPinRouteRequest ||
      !data.routes ||
      !data.routes.length
    ) {
      throw new Error("No routable land connection was returned.");
    }

    const route =
      data.routes[0];

    if (
      !route.geometry ||
      !route.geometry.coordinates ||
      route.geometry.coordinates.length < 2
    ) {
      throw new Error("Routing service returned no usable geometry.");
    }

    const latLngs =
      route.geometry.coordinates.map(
        coordinate =>
          [
            coordinate[1],
            coordinate[0]
          ]
      );

    pinToPinRouteLayer =
      L.polyline(
        latLngs,
        {
          color: "#17365d",
          weight: 6,
          opacity: .9,
          dashArray: "10 6",
          lineCap: "round",
          lineJoin: "round",
          interactive: false,
          pane: "routePane",
          className: "gps-route-line"
        }
      ).addTo(map);

    const kilometers =
      Number(route.distance) / 1000;

    const minutes =
      Number(route.duration) / 60;

    map.fitBounds(
      pinToPinRouteLayer.getBounds(),
      {
        padding: [50,50],
        maxZoom: 15
      }
    );

    if (status) {
      status.innerHTML =
        `🟢 Land route found: <strong>${formatNumber(kilometers)} km</strong> · ` +
        `about <strong>${formatNumber(minutes)} min</strong>.<br>` +
        `${escapeHTML(startPin.name)} → ${escapeHTML(endPin.name)}`
        + `<br><span style="color:#66727e;">Based on OpenStreetMap road-network data.</span>`;
    }

  } catch (error) {

    console.warn(
      "Pin-to-pin routing unavailable:",
      error
    );

    if (status) {
      status.innerHTML =
        `🔴 <strong>Land route unavailable.</strong><br>` +
        `The routing service did not return a confirmed road route. ` +
        `No straight-line route was substituted.`;
    }
  }
}

/* =========================================================
   BUILT-IN LANDMARKS / TOURIST SPOTS
   ========================================================= */

const builtInLandmarks = [
  {name:"Baguio City", type:"City / Tourist Destination", region:"car", lat:16.4023, lon:120.5960},
  {name:"Burnham Park", type:"Park", region:"car", lat:16.4120, lon:120.5960},
  {name:"Mines View Park", type:"Viewpoint", region:"car", lat:16.4124, lon:120.6200},
  {name:"Vigan Heritage Village", type:"Historic Place", region:"region1", lat:17.5747, lon:120.3869},
  {name:"Hundred Islands National Park", type:"Tourist Attraction", region:"region1", lat:16.1900, lon:120.0000},
  {name:"San Juan, La Union", type:"Beach / Tourist Destination", region:"region1", lat:16.6680, lon:120.3300},
  {name:"Banaue Rice Terraces", type:"Tourist Attraction", region:"car", lat:16.9199, lon:121.0592},
  {name:"Mayon Volcano", type:"Natural Landmark", region:"region5", lat:13.2570, lon:123.6850},
  {name:"Cagsawa Ruins", type:"Historic Place", region:"region5", lat:13.1528, lon:123.7130},
  {name:"Puerto Princesa Underground River", type:"Tourist Attraction", region:"region4b", lat:10.1780, lon:118.9250},
  {name:"Boracay White Beach", type:"Beach", region:"region6", lat:11.9674, lon:121.9248},
  {name:"Miagao Church", type:"Historic Place", region:"region6", lat:10.6427, lon:122.2358},
  {name:"Chocolate Hills", type:"Tourist Attraction", region:"region7", lat:9.8280, lon:124.1420},
  {name:"Magellan's Cross", type:"Historic Place", region:"region7", lat:10.2930, lon:123.9020},
  {name:"Fort San Pedro", type:"Historic Place", region:"region7", lat:10.2940, lon:123.9050},
  {name:"Kawasan Falls", type:"Waterfall", region:"region7", lat:9.8020, lon:123.3750},
  {name:"Rizal Park", type:"Park", region:"ncr", lat:14.5826, lon:120.9794},
  {name:"Intramuros", type:"Historic Place", region:"ncr", lat:14.5896, lon:120.9747},
  {name:"National Museum of the Philippines", type:"Museum", region:"ncr", lat:14.5858, lon:120.9819},
  {name:"Quezon Memorial Circle", type:"Monument / Park", region:"ncr", lat:14.6514, lon:121.0493},
  {name:"Manila Ocean Park", type:"Tourist Attraction", region:"ncr", lat:14.5790, lon:120.9720},
  {name:"Tagaytay", type:"Tourist Destination / Viewpoint", region:"region4a", lat:14.1153, lon:120.9621},
  {name:"Taal Volcano", type:"Natural Landmark", region:"region4a", lat:14.0020, lon:120.9930},
  {name:"Pagsanjan Falls", type:"Waterfall", region:"region4a", lat:14.2720, lon:121.4550},
  {name:"Davao Crocodile Park", type:"Tourist Attraction", region:"region11", lat:7.1040, lon:125.6240},
  {name:"Mount Apo", type:"Natural Landmark", region:"region11", lat:6.9880, lon:125.2700},
  {name:"Tinago Falls", type:"Waterfall", region:"region10", lat:8.1670, lon:124.0470},
  {name:"Camiguin", type:"Tourist Destination", region:"region10", lat:9.1730, lon:124.7290},
  {name:"Siargao Cloud 9", type:"Beach / Tourist Attraction", region:"region13", lat:9.8150, lon:126.1620},
  {name:"Tinuy-an Falls", type:"Waterfall", region:"region13", lat:8.8590, lon:125.5320},
  {name:"Enchanted River", type:"Tourist Attraction", region:"region13", lat:8.8620, lon:126.2940}
];

function getBuiltInLandmarks(regionKey, type) {
  return builtInLandmarks.filter(place => {
    const regionMatch =
      regionKey === "all" ||
      regionKey === "philippines" ||
      place.region === regionKey;

    const normalized = String(place.type).toLowerCase();
    const typeMatch =
      type === "tourism" ||
      (type === "attraction" && normalized.includes("attraction")) ||
      (type === "museum" && normalized.includes("museum")) ||
      (type === "monument" && normalized.includes("monument")) ||
      (type === "viewpoint" && normalized.includes("viewpoint")) ||
      (type === "park" && normalized.includes("park")) ||
      (type === "beach" && normalized.includes("beach")) ||
      (type === "waterfall" && normalized.includes("waterfall")) ||
      (type === "church" && normalized.includes("church")) ||
      (type === "historic" && normalized.includes("historic"));

    return regionMatch && typeMatch;
  });
}

function showBuiltInLandmarks(regionKey, type, results, status) {
  const places = getBuiltInLandmarks(regionKey, type);

  places.forEach(place => {
    const marker = L.circleMarker(
      [place.lat, place.lon],
      {
        radius: 7,
        color: "#ffffff",
        weight: 2,
        fillColor: "#f97316",
        fillOpacity: .95
      }
    );

    marker.bindPopup(`
      <strong>${escapeHTML(place.name)}</strong>
      <br>${escapeHTML(place.type)}
      <br><br>
      <button onclick="pinLandmark(${place.lat},${place.lon},'${escapeJS(place.name)}','${escapeJS(place.type)}')">
        📍 Add Pin
      </button>
    `);

    marker.addTo(landmarkLayerGroup);
  });

  places.slice(0, 50).forEach(place => {
    const div = document.createElement("div");
    div.className = "search-result-item";
    div.innerHTML = `
      <div class="search-result-name">${escapeHTML(place.name)}</div>
      <div class="search-result-type">${escapeHTML(place.type)} · Built-in</div>
      <div class="search-result-pin">Click to locate</div>
    `;
    div.addEventListener("click", () => {
      map.setView([place.lat, place.lon], 14, {animate:true});
      landmarkLayerGroup.eachLayer(layer => {
        const ll = layer.getLatLng();
        if (Math.abs(ll.lat - place.lat) < .00001 && Math.abs(ll.lng - place.lon) < .00001) {
          layer.openPopup();
        }
      });
    });
    results.appendChild(div);
  });

  if (places.length) {
    status.textContent =
      `${places.length} built-in landmark${places.length === 1 ? "" : "s"} available. Live OpenStreetMap results can also be added below.`;
  }

  return places;
}

/* =========================================================
   59. LANDMARK SEARCH
   ========================================================= */

async function findLandmarks() {

  const regionKey =
    document.getElementById(
      "landmarkRegion"
    ).value;

  const type =
    document.getElementById(
      "landmarkType"
    ).value;

  const status =
    document.getElementById(
      "landmarkStatus"
    );

  const results =
    document.getElementById(
      "landmarkResults"
    );

  status.textContent =
    "Loading built-in landmarks and OpenStreetMap results...";

  results.innerHTML =
    "";

  clearLandmarkMarkers();

  landmarkLayerGroup =
    L.layerGroup().addTo(map);

  showBuiltInLandmarks(
    regionKey,
    type,
    results,
    status
  );

  const bounds =
    getRegionBounds(
      regionKey
    );

  let selector;

  switch(type) {

    case "museum":
      selector =
        `["tourism"="museum"]`;
      break;

    case "monument":
      selector =
        `["historic"="monument"]`;
      break;

    case "viewpoint":
      selector =
        `["tourism"="viewpoint"]`;
      break;

    case "park":
      selector =
        `["leisure"="park"]`;
      break;

    case "beach":
      selector =
        `["natural"="beach"]`;
      break;

    case "waterfall":
      selector =
        `["natural"="waterfall"]`;
      break;

    case "church":
      selector =
        `["amenity"="place_of_worship"]["religion"="christian"]`;
      break;

    case "historic":
      selector =
        `["historic"]`;
      break;

    case "attraction":
      selector =
        `["tourism"="attraction"]`;
      break;

    default:
      selector =
        `["tourism"]`;
      break;

  }

  const south =
    bounds[0];

  const west =
    bounds[1];

  const north =
    bounds[2];

  const east =
    bounds[3];

  const query = `

    [out:json][timeout:60];

    (

      node${selector}(${south},${west},${north},${east});

      way${selector}(${south},${west},${north},${east});

      relation${selector}(${south},${west},${north},${east});

    );

    out center tags;

  `;

  try {

    let response;

    try {

      response =
        await fetch(
          "https://overpass-api.de/api/interpreter",
          {
            method:
              "POST",

            body:
              query
          }
        );

    }

    catch(error) {

      response =
        await fetch(
          "https://overpass.kumi.systems/api/interpreter",
          {
            method:
              "POST",

            body:
              query
          }
        );

    }

    if (!response.ok) {

      throw new Error(
        "Landmark data service unavailable."
      );

    }

    const data =
      await response.json();

    if (
      !data.elements ||
      !data.elements.length
    ) {

      status.textContent =
        "No matching mapped places were found.";

      return;

    }

    const unique = [];
    const seen = new Set();

    data.elements.forEach(
      function(item) {

        const tags =
          item.tags || {};

        let lat =
          item.lat;

        let lon =
          item.lon;

        if (
          lat === undefined &&
          item.center
        ) {

          lat =
            item.center.lat;

          lon =
            item.center.lon;

        }

        if (
          lat === undefined ||
          lon === undefined
        ) {
          return;
        }

        const name =
          tags.name ||
          tags["name:en"] ||
          "Unnamed mapped place";

        const key =
          `${name}|${Number(lat).toFixed(5)}|${Number(lon).toFixed(5)}`;

        if (
          seen.has(key)
        ) {
          return;
        }

        seen.add(key);

        unique.push({

          id:
            item.id,

          name,

          lat:
            Number(lat),

          lon:
            Number(lon),

          tags

        });

      }
    );

    const places =
      unique.slice(
        0,
        300
      );

    status.textContent =
      `${unique.length} mapped place${unique.length === 1 ? "" : "s"} found. Showing ${places.length}.`;

    /* Keep the built-in landmark layer and append live OSM results. */
    if (!landmarkLayerGroup) {
      landmarkLayerGroup =
        L.layerGroup().addTo(map);
    }

    places.forEach(
      function(place) {

        const marker =
          L.circleMarker(
            [
              place.lat,
              place.lon
            ],
            {
              radius:
                6,

              color:
                "#ffffff",

              weight:
                2,

              fillColor:
                "#f59e0b",

              fillOpacity:
                .9
            }
          );

        marker.bindPopup(`

          <strong>
            ${escapeHTML(place.name)}
          </strong>

          <br>

          ${escapeHTML(
            getPlaceCategory(
              place.tags
            )
          )}

          <br><br>

          <button
            onclick="pinLandmark(
              ${place.lat},
              ${place.lon},
              '${escapeJS(place.name)}',
              '${escapeJS(getPlaceCategory(place.tags))}'
            )"
          >
            📍 Add Pin
          </button>

        `);

        marker.addTo(
          landmarkLayerGroup
        );

      }
    );

    places.slice(
      0,
      50
    ).forEach(
      function(place) {

        const div =
          document.createElement(
            "div"
          );

        div.className =
          "search-result-item";

        div.innerHTML = `

          <div class="search-result-name">

            ${escapeHTML(place.name)}

          </div>

          <div class="search-result-type">

            ${escapeHTML(
              getPlaceCategory(
                place.tags
              )
            )}

          </div>

          <div class="search-result-pin">

            Click to locate

          </div>

        `;

        div.addEventListener(
          "click",
          function() {

            map.setView(
              [
                place.lat,
                place.lon
              ],
              16,
              {
                animate:
                  true
              }
            );

            landmarkLayerGroup.eachLayer(
              function(layer) {

                const ll =
                  layer.getLatLng();

                if (
                  Math.abs(
                    ll.lat -
                    place.lat
                  ) < .00001 &&
                  Math.abs(
                    ll.lng -
                    place.lon
                  ) < .00001
                ) {

                  layer.openPopup();

                }

              }
            );

          }
        );

        results.appendChild(
          div
        );

      }
    );

    if (
      places.length > 0
    ) {

      const bounds =
        L.latLngBounds(
          places.map(
            place =>
              [
                place.lat,
                place.lon
              ]
          )
        );

      map.fitBounds(
        bounds,
        {
          padding:
            [30,30],

          maxZoom:
            12
        }
      );

    }

  }

  catch(error) {

    console.error(
      "Landmark search error:",
      error
    );

    status.textContent =
      "Could not retrieve landmark data.";

  }

}


/* =========================================================
   60. LANDMARK HELPERS
   ========================================================= */

let landmarkLayerGroup = null;


function clearLandmarkMarkers() {

  if (
    landmarkLayerGroup
  ) {

    map.removeLayer(
      landmarkLayerGroup
    );

    landmarkLayerGroup =
      null;

  }

}


function getPlaceCategory(
  tags
) {

  if (!tags) {
    return "Mapped place";
  }

  if (tags.tourism) {

    return capitalize(
      tags.tourism
    );

  }

  if (tags.historic) {

    return capitalize(
      tags.historic
    );

  }

  if (tags.natural) {

    return capitalize(
      tags.natural
    );

  }

  if (tags.leisure) {

    return capitalize(
      tags.leisure
    );

  }

  if (tags.amenity) {

    return capitalize(
      tags.amenity
    );

  }

  return "Mapped place";

}


function capitalize(
  value
) {

  if (!value) {
    return "";
  }

  return String(value)
    .replace(
      /_/g,
      " "
    )
    .replace(
      /\b\w/g,
      char =>
        char.toUpperCase()
    );

}


function escapeJS(
  text
) {

  return String(text)
    .replace(
      /\\/g,
      "\\\\"
    )
    .replace(
      /'/g,
      "\\'"
    )
    .replace(
      /"/g,
      '\\"'
    )
    .replace(
      /\n/g,
      "\\n"
    )
    .replace(
      /\r/g,
      "\\r"
    );

}


/* =========================================================
   61. PIN LANDMARK
   ========================================================= */

function pinLandmark(
  lat,
  lon,
  name,
  type
) {

  const pin =
    addPin(
      L.latLng(
        lat,
        lon
      ),
      name,
      type,
      "#f97316"
    );

  map.setView(
    [
      lat,
      lon
    ],
    16,
    {
      animate:
        true
    }
  );

  if (
    pin.marker
  ) {

    pin.marker.openTooltip();

  }

}


/* =========================================================
   62. REGION BOUNDS
   ========================================================= */

function getRegionBounds(
  regionKey
) {

  const bounds = {

    all:
      [4.5,116.0,21.5,127.5],

    philippines:
      [4.5,116.0,21.5,127.5],

    region1:
      [15.7,119.4,18.7,121.7],

    region2:
      [15.5,120.7,19.7,123.5],

    region3:
      [13.7,119.4,16.7,122.0],

    region4a:
      [13.0,120.0,15.2,122.2],

    region4b:
      [8.0,117.0,13.5,122.5],

    region5:
      [11.8,122.5,14.8,125.0],

    region6:
      [9.5,121.0,12.8,124.0],

    region7:
      [9.0,123.0,11.8,125.0],

    region8:
      [9.5,124.0,13.0,126.8],

    region9:
      [5.5,121.0,9.8,124.5],

    region10:
      [7.0,123.5,10.2,126.0],

    region11:
      [5.0,124.0,8.8,127.0],

    region12:
      [5.0,123.0,8.0,126.0],

    region13:
      [7.5,124.5,10.5,127.0],

    nir:
      [9.0,121.5,11.5,124.5],

    car:
      [16.0,120.0,18.5,122.0],

    ncr:
      [14.35,120.80,14.85,121.20],

    barmm:
      [5.0,119.0,9.0,125.0]

  };

  return (
    bounds[regionKey] ||
    bounds.philippines
  );

}


/* =========================================================
   63. FIT VIEW
   ========================================================= */

function resetView() {

  fitSelectedRegion();

}


function fitSelectedRegion() {

  const c =
    calibrations[
      currentCalibration
    ];

  if (
    currentCalibration ===
    "philippines"
  ) {

    map.fitBounds(
      [
        [4.5,116.0],
        [21.5,127.5]
      ],
      {
        padding:
          [20,20]
      }
    );

    return;

  }

  const center =
    L.latLng(
      c.lat,
      c.lng
    );

  map.setView(
    center,
    currentCalibration === "region1"
      ? 8
      : 7,
    {
      animate:
        true
    }
  );

}


/* =========================================================
   64. PHILIPPINES
   ========================================================= */

function locatePhilippines() {

  document.getElementById(
    "calibrationSelect"
  ).value =
    "philippines";

  changeCalibration(
    "philippines"
  );

}


/* =========================================================
   65. KEYBOARD SHORTCUTS
   ========================================================= */

document.addEventListener(
  "keydown",
  function(event) {

    const tag =
      document.activeElement.tagName;

    if (
      tag === "SELECT" ||
      tag === "INPUT" ||
      tag === "TEXTAREA"
    ) {
      return;
    }

    const key =
      event.key.toLowerCase();

    if (
      key === "r"
    ) {

      resetView();

    }

    if (
      key === "g"
    ) {

      toggleGrid();

    }

    if (
      key === "c"
    ) {

      toggleLabels();

    }

    if (
      key === "t"
    ) {

      toggleTerrain();

    }

    if (
      key === "escape"
    ) {

      cancelTransportDrawing();
      cancelCircleDrawing();
      cancelCorridorConstruction();

      if (settingCustomOrigin) {
        settingCustomOrigin = false;
        map.getContainer().style.cursor = "";
        const button = document.getElementById("setOriginButton");
        if (button) {
          button.textContent = "🎯 Set Custom Origin";
        }
      }

    }

  }
);


/* =========================================================
   66. INITIALIZATION
   ========================================================= */

updateCalibrationInfo();

map.setView(
  [
    calibrations.region1.lat,
    calibrations.region1.lng
  ],
  8
);

map.whenReady(
  function() {

    /*
       The map container's height is now driven by the flex
       layout instead of a fixed pixel value, so Leaflet needs
       an explicit nudge once the real box size is known.
    */
    setTimeout(
      function() {
        map.invalidateSize();
        drawCartesianGrid();
      },
      50
    );

    drawCartesianGrid();

    updatePinCount();
    refreshPinRouteSelectors();

    updateRouteList();

  }
);

window.addEventListener(
  "resize",
  function() {

    map.invalidateSize();
    drawCartesianGrid();

  }
);


/* =========================================================
   67. DEBUG
   ========================================================= */

console.log(
  "Philippines Transportation Planning Map loaded."
);

console.log(
  "Cartesian planning grid enabled."
);

console.log(
  "Pin system enabled."
);

console.log(
  "Transportation drawing system enabled."
);

console.log(
  "Snap-to-point system enabled."
);

console.log(
  "Terrain analysis enabled."
);

console.log(
  "MRT / LRT / Rail / BRT planning enabled."
);

console.log(
  "OpenStreetMap search enabled."
);

console.log(
  "OpenStreetMap landmark search enabled."
);