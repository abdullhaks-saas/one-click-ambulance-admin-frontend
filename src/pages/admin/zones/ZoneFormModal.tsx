import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  APIProvider,
  Map,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { adminZonesApi, type Zone, type ZoneCoordinate } from '@/services/api';
import { toast } from 'sonner';
import { MapPin, Loader2, Pencil, Trash2, Info } from 'lucide-react';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
const MAP_ID = 'bf51a910020fa566';

interface DrawingManagerInnerProps {
  initialCoords: ZoneCoordinate[];
  onCoordsChange: (coords: ZoneCoordinate[]) => void;
}

function DrawingManagerInner({ initialCoords, onCoordsChange }: DrawingManagerInnerProps) {
  const map = useMap();
  const drawingLib = useMapsLibrary('drawing');
  const mapsLib = useMapsLibrary('maps');
  const polygonRef = useRef<google.maps.Polygon | null>(null);
  const drawingManagerRef = useRef<google.maps.drawing.DrawingManager | null>(null);
  const initialized = useRef(false);

  const extractCoords = useCallback((polygon: google.maps.Polygon): ZoneCoordinate[] => {
    const path = polygon.getPath();
    const coords: ZoneCoordinate[] = [];
    for (let i = 0; i < path.getLength(); i++) {
      const point = path.getAt(i);
      coords.push({
        latitude: point.lat(),
        longitude: point.lng(),
        sequence_order: i,
      });
    }
    return coords;
  }, []);

  useEffect(() => {
    if (!map || !drawingLib || !mapsLib || initialized.current) return;
    initialized.current = true;

    // If there are initial coords, render existing polygon
    if (initialCoords.length >= 3) {
      const sorted = [...initialCoords].sort((a, b) => a.sequence_order - b.sequence_order);
      const path = sorted.map((c) => ({ lat: c.latitude, lng: c.longitude }));

      polygonRef.current = new mapsLib.Polygon({
        paths: path,
        strokeColor: '#dc2626',
        strokeOpacity: 0.9,
        strokeWeight: 2,
        fillColor: '#dc2626',
        fillOpacity: 0.15,
        editable: true,
        draggable: true,
        map,
      });

      // Fit map to polygon
      const bounds = new google.maps.LatLngBounds();
      path.forEach((p) => bounds.extend(p));
      map.fitBounds(bounds, 60);

      // Update coords on edit
      const updateOnEdit = () => {
        if (polygonRef.current) {
          onCoordsChange(extractCoords(polygonRef.current));
        }
      };
      google.maps.event.addListener(polygonRef.current.getPath(), 'set_at', updateOnEdit);
      google.maps.event.addListener(polygonRef.current.getPath(), 'insert_at', updateOnEdit);
      google.maps.event.addListener(polygonRef.current, 'dragend', updateOnEdit);

      onCoordsChange(initialCoords);
    }

    // Create DrawingManager
    const dm = new drawingLib.DrawingManager({
      drawingMode: initialCoords.length < 3 ? drawingLib.OverlayType.POLYGON : null,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [drawingLib.OverlayType.POLYGON],
      },
      polygonOptions: {
        strokeColor: '#dc2626',
        strokeOpacity: 0.9,
        strokeWeight: 2,
        fillColor: '#dc2626',
        fillOpacity: 0.15,
        editable: true,
        draggable: true,
      },
    });
    dm.setMap(map);
    drawingManagerRef.current = dm;

    // When a polygon is drawn
    google.maps.event.addListener(dm, 'overlaycomplete', (event: google.maps.drawing.OverlayCompleteEvent) => {
      if (event.type === drawingLib.OverlayType.POLYGON) {
        // Remove previous polygon if any
        if (polygonRef.current) {
          polygonRef.current.setMap(null);
        }
        const newPolygon = event.overlay as google.maps.Polygon;
        polygonRef.current = newPolygon;
        dm.setDrawingMode(null);

        const coords = extractCoords(newPolygon);
        onCoordsChange(coords);

        // Listen for edits
        const updateOnEdit = () => {
          if (polygonRef.current) {
            onCoordsChange(extractCoords(polygonRef.current));
          }
        };
        google.maps.event.addListener(newPolygon.getPath(), 'set_at', updateOnEdit);
        google.maps.event.addListener(newPolygon.getPath(), 'insert_at', updateOnEdit);
        google.maps.event.addListener(newPolygon, 'dragend', updateOnEdit);
      }
    });

    return () => {
      dm.setMap(null);
      polygonRef.current?.setMap(null);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, drawingLib, mapsLib]);

  return null;
}

interface ZoneFormModalProps {
  zone: Zone | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (zone: Zone) => void;
}

export function ZoneFormModal({ zone, isOpen, onClose, onSaved }: ZoneFormModalProps) {
  const isEdit = !!zone;
  const [zoneName, setZoneName] = useState('');
  const [city, setCity] = useState('');
  const [coordinates, setCoordinates] = useState<ZoneCoordinate[]>([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ zoneName?: string; coordinates?: string }>({});

  useEffect(() => {
    if (isOpen) {
      setZoneName(zone?.zone_name ?? '');
      setCity(zone?.city ?? '');
      setCoordinates(zone?.coordinates ?? []);
      setErrors({});
    }
  }, [isOpen, zone]);

  function validate(): boolean {
    const newErrors: { zoneName?: string; coordinates?: string } = {};
    if (!zoneName.trim()) newErrors.zoneName = 'Zone name is required';
    if (coordinates.length < 3) newErrors.coordinates = 'Draw a polygon with at least 3 points on the map';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      const dto = {
        zone_name: zoneName.trim(),
        city: city.trim() || undefined,
        coordinates: coordinates.map((c, i) => ({
          latitude: c.latitude,
          longitude: c.longitude,
          sequence_order: c.sequence_order ?? i,
        })),
      };

      const { data } = isEdit
        ? await adminZonesApi.update(zone.id, dto)
        : await adminZonesApi.create(dto);

      toast.success(isEdit ? 'Zone updated successfully' : 'Zone created successfully');
      onSaved(data);
      onClose();
    } catch (err: unknown) {
      const msg = (err as { apiMessage?: string })?.apiMessage ?? 'Failed to save zone';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  function handleClearPolygon() {
    setCoordinates([]);
  }

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-red-600" />
            {isEdit ? 'Edit Zone' : 'Create New Zone'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-5 lg:grid-cols-5">
          {/* Left: Form fields */}
          <div className="lg:col-span-2 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="zone-name" className="font-medium">
                Zone Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="zone-name"
                placeholder="e.g. North Bangalore"
                value={zoneName}
                onChange={(e) => {
                  setZoneName(e.target.value);
                  if (errors.zoneName) setErrors((er) => ({ ...er, zoneName: undefined }));
                }}
                className={errors.zoneName ? 'border-red-500' : ''}
              />
              {errors.zoneName && <p className="text-xs text-red-500">{errors.zoneName}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="e.g. Bangalore"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            {/* Coordinates info */}
            <div className="rounded-xl bg-zinc-50 dark:bg-slate-800/50 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300">Polygon</h5>
                {coordinates.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-red-500 hover:text-red-600 gap-1"
                    onClick={handleClearPolygon}
                  >
                    <Trash2 className="h-3 w-3" />
                    Clear
                  </Button>
                )}
              </div>

              {coordinates.length === 0 ? (
                <div className="flex items-start gap-2 text-xs text-slate-500">
                  <Info className="h-4 w-4 shrink-0 mt-0.5 text-slate-400" />
                  <p>Use the polygon tool on the map to draw the zone boundary. Click points to define the area.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={coordinates.length >= 3 ? 'success' : 'warning'}>
                      {coordinates.length} points
                    </Badge>
                    {coordinates.length >= 3 && (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400">Valid polygon</span>
                    )}
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-0.5">
                    {coordinates.slice(0, 6).map((c, i) => (
                      <p key={i} className="text-xs font-mono text-slate-400">
                        {c.latitude.toFixed(5)}, {c.longitude.toFixed(5)}
                      </p>
                    ))}
                    {coordinates.length > 6 && (
                      <p className="text-xs text-slate-400">…{coordinates.length - 6} more</p>
                    )}
                  </div>
                </div>
              )}
              {errors.coordinates && (
                <p className="text-xs text-red-500">{errors.coordinates}</p>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={onClose} disabled={saving} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Pencil className="h-4 w-4 mr-1.5" />
                    {isEdit ? 'Update Zone' : 'Create Zone'}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Right: Map */}
          <div className="lg:col-span-3">
            <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-red-600" />
              Draw Zone Boundary
            </h5>
            <div className="rounded-xl overflow-hidden border border-zinc-100 dark:border-slate-800 h-80">
              {API_KEY ? (
                <APIProvider apiKey={API_KEY}>
                  <Map
                    defaultCenter={{ lat: 12.9629, lng: 77.5775 }}
                    defaultZoom={11}
                    mapId={MAP_ID}
                    className="w-full h-full"
                    gestureHandling="greedy"
                  >
                    {isOpen && (
                      <DrawingManagerInner
                        key={`${zone?.id ?? 'new'}-${isOpen}`}
                        initialCoords={zone?.coordinates ?? []}
                        onCoordsChange={setCoordinates}
                      />
                    )}
                  </Map>
                </APIProvider>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-50 dark:bg-slate-800 text-slate-400 text-sm italic p-4 text-center">
                  Google Maps API Key not configured.
                </div>
              )}
            </div>
            <p className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5" />
              Click the polygon icon in the top-center of the map, then click to define boundary points. Double-click to close.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
