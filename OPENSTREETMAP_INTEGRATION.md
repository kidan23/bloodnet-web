# OpenStreetMap Integration in BloodNet Web App

This document provides instructions for configuring and using the OpenStreetMap integration in the BloodNet web application.

## Installation

The application uses several packages for OpenStreetMap integration:

```bash
npm install react-leaflet leaflet leaflet-geosearch
npm install -D @types/leaflet
```

## Benefits of Using OpenStreetMap

1. **Free and Open Source**: OpenStreetMap is completely free to use without any API keys or billing requirements.
2. **No API Key Required**: No need to set up a Google Cloud account or provide payment information.
3. **Community-Driven**: Data is maintained by a global community of mappers.
4. **Privacy-Focused**: Less tracking and data collection compared to commercial map providers.
5. **Customizable**: Full control over the map's appearance and functionality.

## Features Implemented

The OpenStreetMap integration includes the following features:

1. **Interactive Map Selection**: Users can click on the map to select a location
2. **Current Location Detection**: "Use My Current Location" button to get the user's current location
3. **Address Geocoding**: "Find from Address" button to convert address to coordinates
4. **Reverse Geocoding**: When selecting a location on the map, address fields are automatically populated
5. **Draggable Marker**: Users can fine-tune their location by dragging the marker
6. **Location Reset**: Users can reset their location selection
7. **Address Search**: Built-in search functionality to find locations by name or address

## Usage Notes

### Geocoding with Nominatim

The implementation uses OpenStreetMap's Nominatim service for geocoding. Please be aware of the [Nominatim Usage Policy](https://operations.osmfoundation.org/policies/nominatim/):

- Maximum of 1 request per second
- Set a valid user agent identifying your application
- Provide attribution to OpenStreetMap contributors
- Cache results when possible to reduce server load

For production use with higher volumes, consider setting up your own Nominatim instance or using a commercial geocoding service that's based on OpenStreetMap data.

### Map Tiles

The default implementation uses the standard OpenStreetMap tile server. For production applications with significant traffic, consider:

1. Using a commercial tile provider (e.g., Mapbox, Stadia Maps)
2. Setting up your own tile server
3. Using a CDN-backed tile service

## Extending the Integration

To extend the OpenStreetMap functionality, consider:

1. **Custom Map Styles**: Use alternative tile providers for different visual styles
2. **Additional Map Layers**: Add layers for hospitals, blood banks, etc.
3. **Heatmaps**: Show density of donors or requests in different areas
4. **Routes**: Calculate and display routes between donors and blood banks
5. **Clustering**: Group multiple markers in dense areas for better visualization

## Resources

- [React Leaflet Documentation](https://react-leaflet.js.org/)
- [Leaflet Documentation](https://leafletjs.com/)
- [OpenStreetMap Wiki](https://wiki.openstreetmap.org/)
- [Nominatim Documentation](https://nominatim.org/release-docs/latest/)
- [Leaflet-GeoSearch Documentation](https://github.com/smeijer/leaflet-geosearch)
