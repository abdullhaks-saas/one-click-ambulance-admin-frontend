import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { adminSystemApi } from '@/services/api';
import { toast } from 'sonner';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

export function LiveMapPage() {
  const [data, setData] = useState<{ drivers: any[]; rides: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await adminSystemApi.getLiveMap();
      setData(res.data.data);
    } catch (err: any) {
      toast.error(err?.apiMessage || 'Failed to load live map data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000); // Refresh every 15 seconds
    return () => clearInterval(interval);
  }, [fetchData]);

  // Use a default center if no data or no drivers
  const defaultCenter = { lat: 20.5937, lng: 78.9629 }; // India center
  const center = data?.drivers?.[0]?.location 
    ? { lat: data.drivers[0].location.lat, lng: data.drivers[0].location.lng } 
    : defaultCenter;

  // Need to provide your actual Google Maps API Key here via env
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  return (
    <div className="space-y-6 text-slate-950 dark:text-slate-50 h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Live Map Monitoring</h1>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Available Drivers ({data?.drivers?.filter(d => d.status === 'AVAILABLE').length || 0})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>On Ride ({data?.drivers?.filter(d => d.status === 'ON_RIDE').length || 0})</span>
          </div>
        </div>
      </div>

      <Card className="flex-1 overflow-hidden">
        <CardContent className="p-0 h-full relative">
          {loading && !data ? (
            <Skeleton className="w-full h-full" />
          ) : !apiKey ? (
            <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-900">
              <p className="text-slate-500">Google Maps API Key is missing. Please set VITE_GOOGLE_MAPS_API_KEY.</p>
            </div>
          ) : (
            <APIProvider apiKey={apiKey}>
              <Map
                defaultCenter={center}
                defaultZoom={12}
                mapId="DEMO_MAP_ID"
                disableDefaultUI={true}
                className="w-full h-full"
              >
                {data?.drivers?.map((driver) => (
                  <AdvancedMarker
                    key={driver.id}
                    position={{ lat: driver.location.lat, lng: driver.location.lng }}
                    title={driver.name}
                  >
                    <Pin 
                      background={driver.status === 'AVAILABLE' ? '#22c55e' : '#3b82f6'} 
                      borderColor={driver.status === 'AVAILABLE' ? '#166534' : '#1d4ed8'}
                      glyphColor="#fff" 
                    />
                  </AdvancedMarker>
                ))}
              </Map>
            </APIProvider>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
