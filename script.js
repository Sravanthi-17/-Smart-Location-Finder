
console.log("Smart Location Finder started");

// ========================================
// STEP 1: CREATE MAP
// ========================================

const map = L.map('map').setView(
    [17.3850, 78.4867],
    12
);


// ========================================
// STEP 2: LOAD OPENSTREETMAP TILES
// ========================================

L.tileLayer(
    'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
        attribution: '© OpenStreetMap contributors'
    }
).addTo(map);


// ========================================
// STEP 3: CREATE INITIAL MARKER
// ========================================

let selectedMarker = L.marker(
    [17.3850, 78.4867]
).addTo(map);

selectedMarker.bindPopup("Hyderabad");


// ========================================
// STEP 4: CREATE LAYERS
// ========================================

const nearbyLayer = L.layerGroup().addTo(map);

// This layer stores the route and its start/end markers.
const routeLayer = L.layerGroup().addTo(map);


// ========================================
// STEP 5: GET HTML ELEMENTS
// ========================================

const searchBtn =
    document.getElementById('searchBtn');

const locationInput =
    document.getElementById('locationInput');

const searchStatus =
    document.getElementById('searchStatus');

const results =
    document.getElementById('results');

const startInput =
    document.getElementById('startLocation');

const endInput =
    document.getElementById('endLocation');

const routeBtn =
    document.getElementById('routeBtn');

const routeStatus =
    document.getElementById('routeStatus');


// ========================================
// STEP 6: SEARCH LOCATION USING NOMINATIM
// ========================================

async function searchLocation() {

    const location = locationInput.value.trim();

    if (location === "") {
        searchStatus.textContent =
            "Please enter a location.";
        return;
    }

    searchStatus.textContent = "Searching location...";

    try {

        const params = new URLSearchParams({
            q: location,
            format: "jsonv2",
            limit: "5",
            addressdetails: "1"
        });

        const apiURL =
            "https://nominatim.openstreetmap.org/search?" +
            params.toString();

        const response = await fetch(apiURL);

        if (!response.ok) {
            throw new Error("Location search failed");
        }

        const data = await response.json();

        if (data.length === 0) {
            searchStatus.textContent = "Location not found.";
            return;
        }

        const place = data[0];

        const latitude = parseFloat(place.lat);
        const longitude = parseFloat(place.lon);

        map.setView([latitude, longitude], 15);

        selectedMarker.setLatLng([
            latitude,
            longitude
        ]);

        selectedMarker
            .bindPopup(place.display_name)
            .openPopup();

        nearbyLayer.clearLayers();
        results.innerHTML = "";

        searchStatus.textContent =
            "Location found: " + place.display_name;

    }

    catch (error) {

        console.error(error);

        searchStatus.textContent =
            "Unable to search location.";

    }
}


// ========================================
// STEP 7: SEARCH NEARBY PLACES
// USING OVERPASS API
// ========================================

async function searchNearby(type) {

    const center = map.getCenter();

    const latitude = center.lat;
    const longitude = center.lng;

    const radius = 2000;

    const categories = {

        restaurant: {
            key: "amenity",
            value: "restaurant"
        },

        hospital: {
            key: "amenity",
            value: "hospital"
        },

        hotel: {
            key: "tourism",
            value: "hotel"
        },

        atm: {
            key: "amenity",
            value: "atm"
        }

    };

    const category = categories[type];

    if (!category) {
        return;
    }

    searchStatus.textContent =
        "Searching nearby " + type + "...";

    results.innerHTML = "";

    nearbyLayer.clearLayers();

    const query = `
        [out:json][timeout:25];

        nwr
        ["${category.key}"="${category.value}"]
        (around:${radius},${latitude},${longitude});

        out center;
    `;

    const apiURL =
        "https://overpass-api.de/api/interpreter";

    try {

        const response = await fetch(apiURL, {

            method: "POST",

            body: new URLSearchParams({
                data: query
            })

        });

        if (!response.ok) {

            throw new Error(
                "Overpass API request failed: " +
                response.status
            );

        }

        const data = await response.json();

        if (data.elements.length === 0) {

            searchStatus.textContent =
                "No nearby " + type + " found.";

            return;

        }

        let count = 0;

        data.elements.forEach(place => {

            let lat;
            let lon;

            if (place.type === "node") {

                lat = place.lat;
                lon = place.lon;

            }

            else if (place.center) {

                lat = place.center.lat;
                lon = place.center.lon;

            }

            if (
                typeof lat !== "number" ||
                typeof lon !== "number"
            ) {
                return;
            }

            const name =
                place.tags?.name || "Unnamed " + type;

            const placeMarker = L.marker([
                lat,
                lon
            ]);

            placeMarker.bindPopup(
                `<b>${escapeHTML(name)}</b><br>${escapeHTML(type)}`
            );

            nearbyLayer.addLayer(placeMarker);

            const item = document.createElement("div");

            item.className = "result-item";

            item.textContent = name;

            item.addEventListener("click", () => {

                map.setView([lat, lon], 17);

                placeMarker.openPopup();

            });

            results.appendChild(item);

            count++;

        });

        searchStatus.textContent =
            count + " nearby " + type +
            " found within " + radius + " metres.";

        if (count === 0) {

            searchStatus.textContent =
                "No usable locations found.";

        }

    }

    catch (error) {

        console.error("Overpass error:", error);

        searchStatus.textContent =
            "Unable to retrieve nearby places. Try again later.";

    }

}


// ========================================
// STEP 8: SAFELY DISPLAY PLACE NAMES
// ========================================

function escapeHTML(value) {

    return String(value).replace(
        /[&<>"']/g,
        char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]
    );

}


// ========================================
// STEP 9: CONNECT LOCATION SEARCH BUTTON
// ========================================

searchBtn.addEventListener(
    'click',
    searchLocation
);


// ========================================
// STEP 10: ENTER KEY SUPPORT
// ========================================

locationInput.addEventListener(
    'keydown',
    function(event) {

        if (event.key === "Enter") {
            searchLocation();
        }

    }
);


// ========================================
// STEP 11: CONNECT NEARBY PLACE BUTTONS
// ========================================

const placeButtons =
    document.querySelectorAll('.placeBtn');

placeButtons.forEach(button => {

    button.addEventListener('click', function() {

        const type = this.dataset.type;

        searchNearby(type);

    });

});


// ========================================
// STEP 12: GET COORDINATES USING NOMINATIM
// ========================================

async function getCoordinates(location) {

    const params = new URLSearchParams({
        q: location,
        format: "jsonv2",
        limit: "1"
    });

    const url =
        "https://nominatim.openstreetmap.org/search?" +
        params.toString();

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Location search failed.");
    }

    const data = await response.json();

    if (data.length === 0) {
        throw new Error("Location not found: " + location);
    }

    return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        name: data[0].display_name
    };

}


// ========================================
// STEP 13: FIND ROUTE USING OSRM API
// ========================================

async function findRoute() {

    const start = startInput.value.trim();

    const end = endInput.value.trim();

    if (!start || !end) {

        routeStatus.textContent =
            "Please enter both locations.";

        return;

    }

    routeBtn.disabled = true;

    routeStatus.textContent =
        "Finding route...";

    routeLayer.clearLayers();

    try {

        // Get starting location coordinates

        const startPoint =
            await getCoordinates(start);


        // Get destination coordinates

        const endPoint =
            await getCoordinates(end);


        // OSRM expects longitude first, then latitude

        const coordinates =
            `${startPoint.lon},${startPoint.lat};` +
            `${endPoint.lon},${endPoint.lat}`;


        // Construct OSRM route API URL

        const url =
            `https://router.project-osrm.org/route/v1/driving/${coordinates}` +
            `?overview=full&geometries=geojson`;


        // Send request to OSRM

        const response = await fetch(url);

        if (!response.ok) {

            throw new Error("Route API request failed.");

        }


        // Convert response into JSON

        const data = await response.json();


        // Check whether route exists

        if (
            data.code !== "Ok" ||
            !data.routes ||
            data.routes.length === 0
        ) {

            throw new Error("No route found.");

        }


        // Get the first available route

        const route = data.routes[0];


        // Convert metres into kilometres

        const distanceKm =
            (route.distance / 1000).toFixed(2);


        // Convert seconds into minutes

        const durationMinutes =
            Math.round(route.duration / 60);


        // Convert GeoJSON coordinates
        // [longitude, latitude]
        // into Leaflet coordinates
        // [latitude, longitude]

        const routeCoordinates =
            route.geometry.coordinates.map(
                coordinate => [
                    coordinate[1],
                    coordinate[0]
                ]
            );


        // Draw route on the map

        const routeLine = L.polyline(
            routeCoordinates,
            {
                color: "blue",
                weight: 5
            }
        );


        routeLayer.addLayer(routeLine);


        // Create starting point marker

        const startMarker = L.marker([
            startPoint.lat,
            startPoint.lon
        ]).bindPopup(
            "Starting point: " + escapeHTML(startPoint.name)
        );


        // Create destination marker

        const endMarker = L.marker([
            endPoint.lat,
            endPoint.lon
        ]).bindPopup(
            "Destination: " + escapeHTML(endPoint.name)
        );


        routeLayer.addLayer(startMarker);

        routeLayer.addLayer(endMarker);


        // Adjust map to show the complete route

        map.fitBounds(routeLine.getBounds());


        // Display distance and estimated time

        routeStatus.textContent =
            `Distance: ${distanceKm} km | ` +
            `Estimated time: ${durationMinutes} minutes`;

    }

    catch (error) {

        console.error("Route error:", error);

        routeStatus.textContent = error.message;

    }

    finally {

        routeBtn.disabled = false;

    }

}


// ========================================
// STEP 14: CONNECT FIND ROUTE BUTTON
// ========================================

routeBtn.addEventListener(
    'click',
    findRoute
);
