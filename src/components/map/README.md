# Map Components

This directory contains flexible, reusable map components built with React Leaflet and OpenStreetMap.

## Components

### 1. InteractiveMap
A map component for location selection and interaction.

**Features:**
- Click to select location
- Drag marker to adjust position
- Current location detection
- Address geocoding and reverse geocoding
- Customizable appearance and behavior

**Usage:**
```tsx
import { InteractiveMap, type LatLng, type AddressDetails } from '../../components/map';

const [location, setLocation] = useState<LatLng | null>(null);
const [address, setAddress] = useState<AddressDetails>({});

<InteractiveMap
  onLocationChange={setLocation}
  enableReverseGeocoding={true}
  onAddressChange={setAddress}
  showLocationButton={true}
  showAddressButton={true}
  height="400px"
  locationHint="Click on the map to select your location"
/>
```

### 2. DisplayMap
A map component for displaying multiple points/locations.

**Features:**
- Display multiple markers with different types
- Auto-fit bounds to show all points
- Custom popup content
- Point interaction callbacks
- User location display
- Different marker styles for different types

**Usage:**
```tsx
import { DisplayMap, type MapPoint } from '../../components/map';

const points: MapPoint[] = [
  {
    id: 1,
    lat: 37.7749,
    lng: -122.4194,
    title: "Blood Bank",
    description: "Main donation center",
    type: "bloodbank"
  }
];

<DisplayMap
  points={points}
  onPointClick={(point) => console.log('Clicked:', point)}
  showUserLocation={true}
  userLocation={{ lat: 37.7749, lng: -122.4194 }}
  height="400px"
/>
```

## Utilities

### mapUtils.ts
Helper functions for working with map data:

- `bloodBankToMapPoint()` - Convert blood bank data to MapPoint
- `donorToMapPoint()` - Convert donor data to MapPoint  
- `hospitalToMapPoint()` - Convert hospital data to MapPoint
- `convertToMapPoints()` - Batch convert various data types
- `calculateDistance()` - Calculate distance between two points
- `sortByDistance()` - Sort points by distance from reference
- `filterByRadius()` - Filter points within radius
- `groupPointsByType()` - Group points by type

**Usage:**
```tsx
import { convertToMapPoints, sortByDistance } from '../../components/map';

// Convert your data
const mapPoints = convertToMapPoints(bloodBanks, 'bloodbank');

// Sort by distance from user
const userLocation = { lat: 37.7749, lng: -122.4194 };
const sortedPoints = sortByDistance(mapPoints, userLocation);
```

## Types

### LatLng
```tsx
interface LatLng {
  lat: number;
  lng: number;
}
```

### MapPoint
```tsx
interface MapPoint {
  id: string | number;
  lat: number;
  lng: number;
  title: string;
  description?: string;
  type?: 'bloodbank' | 'donor' | 'hospital' | 'default';
  color?: string;
  data?: any;
}
```

### AddressDetails
```tsx
interface AddressDetails {
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}
```

## Examples

### Basic Location Selection
```tsx
const [selectedLocation, setSelectedLocation] = useState<LatLng | null>(null);

<InteractiveMap
  onLocationChange={setSelectedLocation}
  showLocationButton={true}
  locationHint="Select your pickup location"
/>
```

### Display Nearby Blood Banks
```tsx
const bloodBanks = [/* your blood bank data */];
const mapPoints = convertToMapPoints(bloodBanks, 'bloodbank');

<DisplayMap
  points={mapPoints}
  onPointClick={(point) => navigateToDetails(point.id)}
  autoFitBounds={true}
/>
```

### Address Geocoding
```tsx
const [address, setAddress] = useState({
  address: "123 Main St",
  city: "San Francisco",
  state: "CA"
});

<InteractiveMap
  onLocationChange={handleLocationChange}
  enableReverseGeocoding={true}
  onAddressChange={setAddress}
  addressForGeocoding={address}
  showAddressButton={true}
/>
```

### Custom Popup Content
```tsx
const customPopup = (point: MapPoint) => (
  <div className="p-3">
    <h3>{point.title}</h3>
    <p>{point.description}</p>
    <button onClick={() => contactLocation(point.data)}>
      Contact
    </button>
  </div>
);

<DisplayMap
  points={points}
  renderPopup={customPopup}
/>
```

## Styling

The components use Tailwind CSS classes and can be customized with:

- `className` prop for container styling
- `height` and `width` props for dimensions
- Custom marker icons via `markerIcon` prop
- Color customization through point `color` property

## Dependencies

- React Leaflet
- Leaflet
- PrimeReact (for UI components)
- OpenStreetMap tiles
- Nominatim API (for geocoding)

## Best Practices

1. **Performance**: For large datasets, consider implementing clustering
2. **Error Handling**: Always provide error callbacks for network operations
3. **Accessibility**: Use descriptive `ariaLabel` props
4. **User Experience**: Show loading states during geocoding operations
5. **Responsive Design**: Test on different screen sizes
