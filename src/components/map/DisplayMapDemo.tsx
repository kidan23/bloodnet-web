import React from "react";
import { DisplayMap, type MapPoint } from "../../components/map";

// Example usage of DisplayMap component
const DisplayMapDemo: React.FC = () => {
  // Sample data for different types of locations
  const samplePoints: MapPoint[] = [
    {
      id: 1,
      lat: 37.7749,
      lng: -122.4194,
      title: "San Francisco Blood Bank",
      description: "Main blood donation center in downtown SF",
      type: "bloodbank"
    },
    {
      id: 2,
      lat: 37.7849,
      lng: -122.4094,
      title: "John Doe - O+ Donor",
      description: "Available for emergency donations",
      type: "donor"
    },
    {
      id: 3,
      lat: 37.7649,
      lng: -122.4294,
      title: "SF General Hospital",
      description: "Emergency medical facility",
      type: "hospital"
    },
    {
      id: 4,
      lat: 37.7549,
      lng: -122.4394,
      title: "Community Health Center",
      description: "Local health services",
      type: "default"
    }
  ];

  const userLocation = {
    lat: 37.7749,
    lng: -122.4194
  };

  // Handle point clicks
  const handlePointClick = (point: MapPoint) => {
    console.log("Clicked point:", point);
    alert(`Clicked on: ${point.title}`);
  };

  // Handle point hover
  const handlePointHover = (point: MapPoint) => {
    console.log("Hovered point:", point);
  };

  // Handle map clicks
  const handleMapClick = (lat: number, lng: number) => {
    console.log("Clicked map at:", lat, lng);
  };

  // Custom popup renderer
  const renderCustomPopup = (point: MapPoint) => (
    <div className="p-3 max-w-xs">
      <div className="flex items-center gap-2 mb-2">
        <i className={`pi ${getIconForType(point.type)} text-lg`} style={{ color: getColorForType(point.type) }}></i>
        <h4 className="font-bold text-lg">{point.title}</h4>
      </div>
      {point.description && (
        <p className="text-sm text-gray-600 mb-3">{point.description}</p>
      )}
      <div className="flex justify-between items-center">
        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
          {point.type?.toUpperCase() || 'LOCATION'}
        </span>
        <button 
          className="text-blue-600 text-sm hover:underline"
          onClick={() => alert(`More info about ${point.title}`)}
        >
          View Details
        </button>
      </div>
    </div>
  );

  const getIconForType = (type?: string) => {
    switch (type) {
      case 'bloodbank': return 'pi-heart';
      case 'donor': return 'pi-user';
      case 'hospital': return 'pi-plus';
      default: return 'pi-map-marker';
    }
  };

  const getColorForType = (type?: string) => {
    switch (type) {
      case 'bloodbank': return '#e53e3e';
      case 'donor': return '#38a169';
      case 'hospital': return '#3182ce';
      default: return '#d69e2e';
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">DisplayMap Component Demo</h1>
      
      <div className="grid gap-6">
        {/* Basic usage */}
        <div>
          <h2 className="text-xl font-semibold mb-3">Basic Display Map</h2>
          <DisplayMap
            points={samplePoints}
            height="400px"
            onPointClick={handlePointClick}
            onPointHover={handlePointHover}
            onMapClick={handleMapClick}
          />
        </div>

        {/* With user location */}
        <div>
          <h2 className="text-xl font-semibold mb-3">With User Location</h2>
          <DisplayMap
            points={samplePoints}
            height="400px"
            showUserLocation={true}
            userLocation={userLocation}
            onPointClick={handlePointClick}
          />
        </div>

        {/* Custom popup content */}
        <div>
          <h2 className="text-xl font-semibold mb-3">Custom Popup Content</h2>
          <DisplayMap
            points={samplePoints}
            height="400px"
            renderPopup={renderCustomPopup}
            onPointClick={handlePointClick}
          />
        </div>

        {/* Filtered points (only blood banks) */}
        <div>
          <h2 className="text-xl font-semibold mb-3">Blood Banks Only</h2>
          <DisplayMap
            points={samplePoints.filter(p => p.type === 'bloodbank')}
            height="300px"
            onPointClick={handlePointClick}
          />
        </div>
      </div>

      {/* Usage instructions */}
      <div className="mt-8 p-4 bg-gray-50 rounded">
        <h3 className="text-lg font-semibold mb-2">Usage Examples:</h3>
        <ul className="text-sm space-y-1">
          <li>• Click on markers to see point details</li>
          <li>• Hover over markers to trigger hover events</li>
          <li>• Click on empty map areas to get coordinates</li>
          <li>• Map automatically fits to show all points</li>
          <li>• Different marker types have different colors and icons</li>
        </ul>
      </div>
    </div>
  );
};

export default DisplayMapDemo;
