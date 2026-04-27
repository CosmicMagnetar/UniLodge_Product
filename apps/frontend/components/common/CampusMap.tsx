import React from 'react';
import { MapPin, Navigation } from 'lucide-react';

interface CampusMapProps {
  university: string;
  roomNumber?: string;
}

export const CampusMap: React.FC<CampusMapProps> = ({ university, roomNumber }) => {
  const mapQuery = encodeURIComponent(university || 'University');
  const googleMapsUrl = `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${mapQuery}`;

  return (
    <div className="w-full h-64 md:h-96 bg-slate-100 rounded-xl overflow-hidden relative">
      {/* Overlay with university info */}
      <div className="absolute inset-0 flex items-center justify-center bg-slate-200 z-10">
        <div className="text-center">
          <MapPin className="mx-auto h-12 w-12 text-slate-400 mb-2" />
          <p className="text-slate-500 font-medium">Campus Map</p>
          <p className="text-xs text-slate-400 mt-1">{university}</p>
          {roomNumber && (
            <p className="text-xs text-slate-400">Room: {roomNumber}</p>
          )}
        </div>
      </div>
      
      {/* Google Maps Embed (requires API key) */}
      <iframe
        width="100%"
        height="100%"
        frameBorder="0"
        style={{ border: 0 }}
        src={googleMapsUrl}
        allowFullScreen
        className="opacity-60 relative z-20"
        title="Campus Map"
      ></iframe>
      
      {/* Navigation helper */}
      <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-sm z-30">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
            <Navigation size={20} />
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm">Campus Navigation</p>
            <p className="text-xs text-slate-500">Get directions to your room and facilities</p>
          </div>
        </div>
      </div>
    </div>
  );
};
