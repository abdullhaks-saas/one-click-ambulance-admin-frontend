import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { useMemo } from 'react';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
const MAP_ID = 'bf51a910020fa566'; // Default map ID or provided by user

interface DashboardMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
}

export function DashboardMap({ center = { lat: 12.9629, lng: 77.5775 }, zoom = 12 }: DashboardMapProps) {
  // Memoize map options to prevent unnecessary re-renders
  const mapOptions = useMemo(() => ({
    disableDefaultUI: true,
    clickableIcons: false,
    scrollwheel: true,
  }), []);

  if (!API_KEY) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-slate-800 text-zinc-500 dark:text-slate-400 p-8 text-center italic">
        Google Maps API Key not found. Please add VITE_GOOGLE_MAPS_API_KEY to your frontend .env file.
      </div>
    );
  }

  return (
    <APIProvider apiKey={API_KEY}>
      <div className="w-full h-full relative">
        <Map
          defaultCenter={center}
          defaultZoom={zoom}
          {...mapOptions}
          mapId={MAP_ID}
          className="w-full h-full"
        >
          {/* Example Marker for testing */}
          <AdvancedMarker position={center}>
             <Pin background={'#dc2626'} borderColor={'#ffffff'} glyphColor={'#ffffff'} />
          </AdvancedMarker>
          
          {/* You can add more markers for active ambulances here */}
        </Map>
        
        {/* Overlay for aesthetic consistency */}
        <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-black/5 dark:ring-white/5 rounded-4xl"></div>
      </div>
    </APIProvider>
  );
}
