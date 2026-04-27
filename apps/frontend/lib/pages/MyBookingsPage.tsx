import React, { useState, useMemo } from 'react';
import { Booking } from '../../types';
import { Card, Button, Badge } from './ui';
import { Calendar, CreditCard, Clock, MapPin, AlertCircle, Filter, ArrowUpDown, Search, Zap, CheckCircle, X } from 'lucide-react';

export type MyBookingsPageProps = {
    bookings: Booking[];
    onCancel?: (bookingId: string) => void;
};

export const MyBookingsPage: React.FC<MyBookingsPageProps> = ({ bookings, onCancel }) => {
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'date' | 'price' | 'status'>('date');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Search and filter bookings
    const filteredBookings = useMemo(() => {
        let result = bookings;

        // Status filter
        if (statusFilter !== 'all') {
            result = result.filter(b => b.status?.toLowerCase() === statusFilter.toLowerCase());
        }

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(b =>
                (b.room?.roomNumber?.toLowerCase().includes(query)) ||
                ((b.room as any)?.university?.toLowerCase().includes(query)) ||
                ((b.room as any)?.building?.toLowerCase().includes(query)) ||
                (b.id.toLowerCase().includes(query))
            );
        }

        return result;
    }, [bookings, statusFilter, searchQuery]);

    // Sort bookings
    const sortedBookings = useMemo(() => {
        const sorted = [...filteredBookings];
        sorted.sort((a, b) => {
            if (sortBy === 'date') {
                return new Date(b.checkInDate).getTime() - new Date(a.checkInDate).getTime();
            } else if (sortBy === 'price') {
                return (b.totalPrice || 0) - (a.totalPrice || 0);
            } else {
                // Sort by status: Confirmed > Pending > Cancelled
                const statusOrder = { 'Confirmed': 0, 'Pending': 1, 'Cancelled': 2 };
                return (statusOrder[a.status as keyof typeof statusOrder] || 3) -
                       (statusOrder[b.status as keyof typeof statusOrder] || 3);
            }
        });
        return sorted;
    }, [filteredBookings, sortBy]);

    const stats = {
        total: bookings.length,
        confirmed: bookings.filter(b => b.status === 'Confirmed').length,
        pending: bookings.filter(b => b.status === 'Pending').length,
        cancelled: bookings.filter(b => b.status === 'Cancelled').length,
    };

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'Confirmed':
                return 'bg-emerald-500/90 text-white';
            case 'Pending':
                return 'bg-amber-500/90 text-white';
            case 'Cancelled':
                return 'bg-red-500/90 text-white';
            default:
                return 'bg-slate-500/90 text-white';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 pb-20 pt-24">
            {/* Header with Stats */}
            <div className="relative mb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {/* Main Title */}
                        <div className="md:col-span-2">
                            <Card className="p-6 bg-gradient-to-br from-blue-600 to-blue-700 border-0 text-white shadow-xl hover:shadow-2xl transition-all backdrop-blur-xl">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-blue-100 text-sm font-semibold uppercase tracking-wider mb-1">My Bookings</p>
                                        <h1 className="text-3xl md:text-4xl font-bold">{stats.total}</h1>
                                        <p className="text-blue-100 text-sm mt-2">Active reservations</p>
                                    </div>
                                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                        <Calendar className="text-white" size={24} />
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Stats Cards */}
                        {[
                            { label: 'Confirmed', value: stats.confirmed, color: 'from-emerald-500 to-emerald-600', icon: CheckCircle },
                            { label: 'Pending', value: stats.pending, color: 'from-amber-500 to-amber-600', icon: Clock },
                            { label: 'Cancelled', value: stats.cancelled, color: 'from-red-500 to-red-600', icon: X },
                        ].map((stat) => {
                            const Icon = stat.icon;
                            return (
                                <Card key={stat.label} className={`p-4 bg-gradient-to-br ${stat.color} border-0 text-white shadow-lg hover:shadow-xl transition-all backdrop-blur-xl`}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-white/80 text-xs font-semibold uppercase">{stat.label}</p>
                                            <p className="text-2xl font-bold mt-1">{stat.value}</p>
                                        </div>
                                        <Icon size={20} className="opacity-60" />
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
                <div className="space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by room number, university, or booking ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-md border border-white/20 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-lg hover:bg-white/90"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X size={16} className="text-slate-400" />
                            </button>
                        )}
                    </div>

                    {/* Filter Controls */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white/60 backdrop-blur-md p-4 rounded-xl border border-white/20 shadow-lg">
                        <div className="flex flex-wrap gap-2">
                            <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                <Filter size={18} /> Status:
                            </span>
                            {['all', 'Confirmed', 'Pending', 'Cancelled'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-3 py-1.5 rounded-lg font-semibold text-sm transition-all ${
                                        statusFilter === status
                                            ? 'bg-blue-600 text-white shadow-md scale-105'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                                >
                                    {status === 'all' ? 'All' : status}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                                <ArrowUpDown size={16} /> Sort:
                            </span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as 'date' | 'price' | 'status')}
                                className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-sm font-semibold hover:bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="date">Newest First</option>
                                <option value="price">Price (High)</option>
                                <option value="status">By Status</option>
                            </select>
                        </div>

                        <div className="flex gap-1 bg-slate-200 p-1 rounded-lg">
                            {['grid', 'list'].map(mode => (
                                <button
                                    key={mode}
                                    onClick={() => setViewMode(mode as 'grid' | 'list')}
                                    className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                                        viewMode === mode
                                            ? 'bg-white text-blue-600 shadow-md'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    {mode === 'grid' ? '⊞' : '≡'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bookings Display */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {bookings.length === 0 ? (
                    <Card className="p-12 text-center bg-white/60 backdrop-blur-md border border-white/20 shadow-lg rounded-2xl">
                        <div className="mx-auto h-20 w-20 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center mb-4">
                            <Calendar size={40} className="text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No bookings yet</h3>
                        <p className="text-slate-600 mb-6 max-w-md mx-auto">Start your journey! Browse available rooms and make your first booking.</p>
                        <Button onClick={() => window.location.href = '/'} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                            <Zap size={16} className="mr-2" />
                            Browse Rooms
                        </Button>
                    </Card>
                ) : filteredBookings.length === 0 ? (
                    <Card className="p-12 text-center bg-white/60 backdrop-blur-md border border-white/20 shadow-lg rounded-2xl">
                        <AlertCircle size={40} className="mx-auto text-amber-500 mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No bookings match your filters</h3>
                        <p className="text-slate-600 mb-6">Try adjusting your search or filters to find what you're looking for.</p>
                        <Button variant="outline" onClick={() => { setStatusFilter('all'); setSearchQuery(''); }}>
                            Clear Filters
                        </Button>
                    </Card>
                ) : (
                    <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-4'}>
                        {sortedBookings.map((booking, idx) => (
                            <Card
                                key={booking.id}
                                className="group overflow-hidden bg-white/70 backdrop-blur-md border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 rounded-2xl animate-in fade-in slide-in-from-bottom-2"
                                style={{ animationDelay: `${idx * 50}ms` }}
                            >
                                <div className="relative overflow-hidden h-48">
                                    <img
                                        src={booking.room?.imageUrl || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop'}
                                        alt="Room"
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                    {/* Status Badge */}
                                    <div className="absolute top-4 left-4">
                                        <Badge className={`${getStatusColor(booking.status)} backdrop-blur-md text-xs font-bold uppercase tracking-wider`}>
                                            {booking.status}
                                        </Badge>
                                    </div>

                                    {/* Room Type Badge */}
                                    <div className="absolute top-4 right-4">
                                        <Badge className="bg-white/90 backdrop-blur-sm text-slate-900 text-xs font-bold">
                                            {booking.room?.type}
                                        </Badge>
                                    </div>

                                    {/* Price Overlay */}
                                    <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-600 text-sm font-semibold">Total Price:</span>
                                            <span className="text-lg font-bold text-blue-600">
                                                ${booking.totalPrice || (booking.room?.price || 0) * Math.ceil((new Date(booking.checkOutDate).getTime() - new Date(booking.checkInDate).getTime()) / (1000 * 60 * 60 * 24))}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="mb-4">
                                        <h3 className="text-xl font-bold text-slate-900">
                                            Room {booking.room?.roomNumber}
                                        </h3>
                                        <div className="flex items-center gap-2 text-slate-600 text-sm mt-1">
                                            <MapPin size={14} />
                                            {((booking.room as any)?.university || 'Campus Location')}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-blue-50 rounded-lg">
                                                <Calendar size={16} className="text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 font-semibold uppercase">Check In</p>
                                                <p className="text-sm font-bold text-slate-900">{new Date(booking.checkInDate).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-blue-50 rounded-lg">
                                                <Clock size={16} className="text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 font-semibold uppercase">Check Out</p>
                                                <p className="text-sm font-bold text-slate-900">{new Date(booking.checkOutDate).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        {booking.status === 'Pending' && onCancel && (
                                            <Button
                                                onClick={() => onCancel(booking.id)}
                                                variant="outline"
                                                className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
                                            >
                                                Cancel
                                            </Button>
                                        )}
                                        {booking.status === 'Confirmed' && (
                                            <Button variant="outline" className="flex-1">
                                                Download Receipt
                                            </Button>
                                        )}
                                        <Button className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                                            View Details
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
