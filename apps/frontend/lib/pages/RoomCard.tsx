import React from 'react';
import { Room } from '../../types';
import { Icons } from './Icons';
import { Button, Card } from './ui';
import { Wifi, Wind, Utensils, Dumbbell } from 'lucide-react';

// Amenity icons mapping
const AmenityIcons: Record<string, React.ReactNode> = {
  'WiFi': <Wifi size={16} className="text-blue-500" />,
  'Wifi': <Wifi size={16} className="text-blue-500" />,
  'AC': <Wind size={16} className="text-blue-500" />,
  'Kitchen': <Utensils size={16} className="text-emerald-500" />,
  'Gym Access': <Dumbbell size={16} className="text-purple-500" />,
  'Laundry': <Wind size={16} className="text-indigo-500" />,
};

export const RoomCard: React.FC<{ room: Room; onBook: (roomId: string) => void }> = ({ room, onBook }) => (
    <Card className="flex flex-col group overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 bg-white/95 backdrop-blur-sm border border-white/20">
        {/* Image Container with Overlay */}
        <div className="relative overflow-hidden h-56 bg-gradient-to-br from-slate-100 to-slate-50">
            <img
                className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                src={room.imageUrl}
                alt={`Room ${room.roomNumber}`}
                onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500&h=400&fit=crop';
                }}
            />

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Type Badge */}
            <div className="absolute top-4 left-4">
                <span className="inline-block px-3 py-1 bg-blue-600/90 backdrop-blur-sm text-white text-xs font-bold rounded-full uppercase tracking-wide">
                    {room.type}
                </span>
            </div>

            {/* Availability Badge */}
            <div className="absolute top-4 right-4">
                {room.isAvailable ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/90 backdrop-blur-sm text-white text-xs font-bold rounded-full">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        Available
                    </span>
                ) : (
                    <span className="inline-block px-3 py-1 bg-red-500/90 backdrop-blur-sm text-white text-xs font-bold rounded-full">
                        Unavailable
                    </span>
                )}
            </div>

            {/* Rating Badge */}
            <div className="absolute bottom-4 right-4 flex items-center gap-1 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg">
                <Icons.star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="font-bold text-slate-900">{room.rating.toFixed(1)}</span>
            </div>
        </div>

        {/* Content Container */}
        <div className="p-6 flex flex-col flex-grow">
            {/* Room Info Header */}
            <div className="mb-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{room.type} Room</p>
                <h3 className="text-xl font-bold text-slate-900">Room {room.roomNumber}</h3>
                {(room as any).university && (
                    <p className="text-sm text-slate-600 mt-1">{(room as any).university}</p>
                )}
            </div>

            {/* Amenities Section */}
            <div className="mb-4 pb-4 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Amenities</p>
                <div className="flex flex-wrap gap-2">
                    {room.amenities.slice(0, 3).map((amenity, idx) => (
                        <div key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-blue-50 hover:border-blue-200 transition-colors">
                            {AmenityIcons[amenity] || <Wifi size={14} className="text-gray-500" />}
                            <span className="font-medium">{amenity}</span>
                        </div>
                    ))}
                    {room.amenities.length > 3 && (
                        <span className="text-xs text-slate-500 px-2.5 py-1">+{room.amenities.length - 3}</span>
                    )}
                </div>
            </div>

            {/* Capacity and Description */}
            {(room as any).capacity && (
                <div className="mb-4 text-sm text-slate-600">
                    <p><span className="font-semibold text-slate-900">Capacity:</span> {(room as any).capacity} {(room as any).capacity === 1 ? 'person' : 'people'}</p>
                </div>
            )}

            {(room as any).description && (
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">{(room as any).description}</p>
            )}

            {/* Price and Action */}
            <div className="mt-auto flex items-end justify-between gap-4">
                <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Price</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-blue-600">${room.price}</span>
                        <span className="text-sm text-slate-500 font-medium">/month</span>
                    </div>
                </div>

                {room.isAvailable ? (
                    <Button
                        onClick={() => onBook(room.id)}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 active:scale-95"
                    >
                        Book Now
                    </Button>
                ) : (
                    <div className="px-4 py-2 bg-slate-100 text-slate-500 rounded-lg font-semibold text-sm cursor-not-allowed">
                        Booked
                    </div>
                )}
            </div>
        </div>
    </Card>
);