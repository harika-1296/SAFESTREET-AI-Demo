import { useMemo, useState } from 'react';
import type { MapMarker } from '@/types';
import { severityConfig, categoryConfig } from '@/utils/helpers';
import { cn } from '@/utils/cn';
import { Navigation, MapPin, AlertOctagon, Eye, Construction, Wrench, Lightbulb, Car } from 'lucide-react';

interface MapViewProps {
  markers: MapMarker[];
  height?: string;
  onMarkerClick?: (marker: MapMarker) => void;
  selectedId?: string;
  className?: string;
  showHeatmap?: boolean;
}

const categoryIcons: Record<string, typeof MapPin> = {
  pothole: Construction,
  poor_lighting: Lightbulb,
  harassment: AlertOctagon,
  unsafe_area: MapPin,
  accident: Car,
  suspicious_activity: Eye,
  infrastructure: Wrench,
  emergency: AlertOctagon,
};

export function MapView({ markers, height = '400px', onMarkerClick, selectedId, className, showHeatmap }: MapViewProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  const bounds = useMemo(() => {
    if (markers.length === 0) {
      return { minLat: 12.9, maxLat: 13.0, minLng: 77.58, maxLng: 77.65 };
    }
    const lats = markers.map((m) => m.lat);
    const lngs = markers.map((m) => m.lng);
    const minLat = Math.min(...lats) - 0.01;
    const maxLat = Math.max(...lats) + 0.01;
    const minLng = Math.min(...lngs) - 0.01;
    const maxLng = Math.max(...lngs) + 0.01;
    return { minLat, maxLat, minLng, maxLng };
  }, [markers]);

  const project = (lat: number, lng: number) => {
    const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
    const y = (1 - (lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * 100;
    return { x, y };
  };

  return (
    <div
      className={cn('relative overflow-hidden rounded-3xl', className)}
      style={{ height, background: 'linear-gradient(135deg, #E9E1F5 0%, #F2EDFB 40%, #FAF8F6 100%)' }}
    >
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
        {/* Map background blocks */}
        <rect x="0" y="0" width="100" height="100" fill="#EDE6F7" />

        {/* Water body */}
        <ellipse cx="78" cy="72" rx="22" ry="14" fill="#D4C5EE" opacity="0.25" />
        <ellipse cx="78" cy="72" rx="18" ry="11" fill="#D4C5EE" opacity="0.2" />

        {/* Parks / green areas */}
        <rect x="5" y="35" width="18" height="14" rx="3" fill="#C8E6D0" opacity="0.5" />
        <rect x="55" y="8" width="20" height="12" rx="3" fill="#C8E6D0" opacity="0.5" />

        {/* City blocks */}
        {Array.from({ length: 8 }).map((_, i) =>
          Array.from({ length: 8 }).map((_, j) => (
            <rect
              key={`block-${i}-${j}`}
              x={5 + i * 11 + (i % 2 === 0 ? 0 : 2)}
              y={3 + j * 11.5}
              width={8 + (i + j) % 3}
              height={7 + (i * j) % 3}
              rx="1.5"
              fill="#FFFFFF"
              opacity="0.5"
              stroke="#D4C5EE"
              strokeWidth="0.15"
            />
          ))
        )}

        {/* Major roads */}
        <line x1="0" y1="45" x2="100" y2="48" stroke="#FFFFFF" strokeWidth="2.2" opacity="0.9" />
        <line x1="0" y1="45" x2="100" y2="48" stroke="#B9A5DE" strokeWidth="0.3" opacity="0.4" />
        <line x1="42" y1="0" x2="45" y2="100" stroke="#FFFFFF" strokeWidth="2.2" opacity="0.9" />
        <line x1="42" y1="0" x2="45" y2="100" stroke="#B9A5DE" strokeWidth="0.3" opacity="0.4" />
        <line x1="0" y1="75" x2="100" y2="77" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.8" />
        <line x1="15" y1="0" x2="18" y2="100" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.8" />
        <line x1="65" y1="0" x2="68" y2="100" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.8" />

        {/* Minor roads */}
        {[20, 35, 55, 70, 88].map((y) => (
          <line key={`h-${y}`} x1="0" y1={y} x2="100" y2={y + 0.5} stroke="#FFFFFF" strokeWidth="0.6" opacity="0.5" />
        ))}
        {[10, 28, 52, 82].map((x) => (
          <line key={`v-${x}`} x1={x} y1="0" x2={x + 0.5} y2="100" stroke="#FFFFFF" strokeWidth="0.6" opacity="0.5" />
        ))}

        {/* Heatmap circles */}
        {showHeatmap && markers.map((m) => {
          const { x, y } = project(m.lat, m.lng);
          const sev = severityConfig[m.severity];
          const radius = m.severity === 'critical' ? 10 : m.severity === 'high' ? 8 : m.severity === 'medium' ? 6 : 4;
          return (
            <circle
              key={`heat-${m.id}`}
              cx={x}
              cy={y}
              r={radius}
              fill={sev.color}
              opacity="0.15"
            />
          );
        })}
      </svg>

      {/* Markers */}
      {markers.map((m) => {
        const { x, y } = project(m.lat, m.lng);
        const sev = severityConfig[m.severity];
        const Icon = categoryIcons[m.category] || MapPin;
        const isSelected = selectedId === m.id;
        const isHovered = hovered === m.id;
        const cat = m.category !== 'emergency' ? categoryConfig[m.category] : null;

        return (
          <div
            key={m.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform"
            style={{ left: `${x}%`, top: `${y}%`, zIndex: isSelected || isHovered ? 20 : 10 }}
            onMouseEnter={() => setHovered(m.id)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onMarkerClick?.(m)}
          >
            {m.severity === 'critical' && (
              <span
                className="absolute inset-0 rounded-full animate-ping-slow"
                style={{ backgroundColor: sev.color, width: 28, height: 28, left: -14, top: -14 }}
              />
            )}
            <div
              className={cn(
                'relative flex items-center justify-center rounded-2xl shadow-md transition-all',
                isSelected ? 'scale-125' : isHovered ? 'scale-110' : 'hover:scale-110'
              )}
              style={{
                width: 30,
                height: 30,
                backgroundColor: 'white',
                border: `2.5px solid ${sev.color}`,
              }}
            >
              <Icon size={15} style={{ color: sev.color }} strokeWidth={2.5} />
            </div>

            {(isHovered || isSelected) && (
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 whitespace-nowrap pointer-events-none animate-fade-in">
                <div className="bg-plum text-white text-xs font-semibold px-2.5 py-1.5 rounded-xl shadow-lg">
                  {cat ? cat.label : 'Emergency'}
                  <div className="text-[10px] font-normal opacity-70">{m.label}</div>
                </div>
                <div className="w-2 h-2 bg-plum rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1" />
              </div>
            )}
          </div>
        );
      })}

      {/* Simulated badge */}
      <div className="absolute top-3 right-3">
        <div className="glass px-2.5 py-1.5 rounded-xl text-[10px] font-semibold text-plum-muted flex items-center gap-1.5">
          <Navigation size={11} className="text-lavender-500" />
          Simulated Map
        </div>
      </div>

      {/* Compass */}
      <div className="absolute bottom-3 right-3">
        <div className="glass w-9 h-9 rounded-2xl flex items-center justify-center">
          <Navigation size={16} className="text-lavender-700" />
        </div>
      </div>

      {markers.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <MapPin size={32} className="text-lavender-300 mx-auto mb-2" />
            <p className="text-sm text-muted">No locations to display</p>
          </div>
        </div>
      )}
    </div>
  );
}
