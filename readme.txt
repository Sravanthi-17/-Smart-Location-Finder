# Smart Location Finder

## 1. Project Overview

Smart Location Finder is a web-based application that helps users search for locations, discover nearby places, and find routes between two locations using map and location-based APIs.

The application provides an interactive map and displays location details and routes to make navigation easier.

## 2. Technologies Used

- **HTML:** Creates the application structure.
- **CSS:** Handles styling and layout.
- **JavaScript:** Implements map interactions, API calls, and application logic.
- **Leaflet.js:** Displays and manages the interactive map.
- **OpenStreetMap:** Provides map tiles.

## 3. Project File Structure

```text
Smart-Location-Finder/
│
├── index.html
├── style.css
├── script.js
└── README.md
```

### File Descriptions

| File | Purpose |
|---|---|
| `index.html` | Creates the application interface, search fields, buttons, and map container. |
| `style.css` | Controls the appearance, layout, colors, spacing, and responsiveness. |
| `script.js` | Contains the main application logic, map initialization, API integration, location search, nearby-place search, and route calculation. |
| `README.md` | Documents the project, technologies, APIs, and setup instructions. |

## 4. APIs Used

### 1. Nominatim API – Location Search

**Purpose:** Converts a location name or address into geographical coordinates (latitude and longitude).

**How it works:**
1. User enters a location.
2. JavaScript sends a request to Nominatim.
3. The API returns latitude, longitude, and address details.
4. The application displays the location on the map.

### 2. Overpass API – Nearby Places Search

**Purpose:** Finds nearby places such as restaurants, hospitals, hotels, and other points of interest.

**How it works:**
1. The application gets the selected location's coordinates.
2. JavaScript sends a query to Overpass API.
3. The API searches OpenStreetMap data around those coordinates.
4. Matching places are displayed as map markers.

### 3. OSRM API – Route Calculation

**Purpose:** Calculates a route between two geographical locations.

**How it works:**
1. User selects a starting point and destination.
2. The application sends their coordinates to OSRM.
3. OSRM calculates a road route.
4. The application displays the route on the map.

### 4. Google Places API (New) – Nearby Search and Place Details

**Purpose:** Provides Google Maps place information and details about nearby businesses and locations.

**How it works:**
1. The application sends a nearby-search request with geographical coordinates and a search radius.
2. Google Places API returns matching places.
3. The application can retrieve additional information using Place Details.
4. The returned information can be displayed to the user.

**Authentication:** Requires a Google Cloud API key with the relevant Places API enabled.

## 5. How the APIs Work Together

1. User searches for a location.
2. Nominatim converts the location into coordinates.
3. Leaflet displays the location on the interactive map using OpenStreetMap tiles.
4. Overpass or Google Places API retrieves nearby places.
5. OSRM calculates routes between selected locations.
6. JavaScript updates the map with markers and route information.

## 6. How to Run the Project

1. Download or clone the project.
2. Open the project folder.
3. Open `index.html` in a web browser.
4. Allow the application to access location services if prompted.
5. Search for locations and explore nearby places and routes.

For Google Places features, configure your Google Cloud API key in the appropriate JavaScript configuration and restrict the key to the required APIs and application origins.

## 7. Key Features

- Search locations by name or address.
- Display locations on an interactive map.
- Discover nearby places.
- Retrieve additional place information through Google Places.
- Calculate routes between two locations.
- View location markers and route paths.

## 8. Project Outcome

Smart Location Finder demonstrates how multiple APIs can work together to build a location-based web application. It combines geocoding, nearby-place discovery, interactive maps, and route calculation into a single application.