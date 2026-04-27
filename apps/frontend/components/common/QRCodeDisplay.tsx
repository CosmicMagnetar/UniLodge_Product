import React from 'react';
import { QrCode, Utensils, Bus, Coffee } from 'lucide-react';

interface QRCodeDisplayProps {
  type: 'mess' | 'bus' | 'other';
  title: string;
  subtitle?: string;
  value?: string; // The value to encode in QR (dummy for now)
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ type, title, subtitle, value }) => {
  const getIcon = () => {
    switch (type) {
      case 'mess':
        return <Utensils size={24} className="text-blue-600" />;
      case 'bus':
        return <Bus size={24} className="text-green-600" />;
      default:
        return <QrCode size={24} className="text-purple-600" />;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'mess':
        return 'from-blue-600 to-indigo-700';
      case 'bus':
        return 'from-green-600 to-emerald-700';
      default:
        return 'from-purple-600 to-violet-700';
    }
  };

  // Generate a dummy QR code pattern (visual only - can be replaced with actual QR library)
  const renderDummyQR = () => {
    const grid = [];
    for (let i = 0; i < 7; i++) {
      const row = [];
      for (let j = 0; j < 7; j++) {
        // Create a pattern that looks like a QR code
        const isFilled = (i + j) % 2 === 0 || (i < 2 && j < 2) || (i < 2 && j > 4) || (i > 4 && j < 2);
        row.push(
          <div
            key={`${i}-${j}`}
            className={`w-4 h-4 ${isFilled ? 'bg-slate-800' : 'bg-white'} ${i === 0 || j === 0 ? 'rounded-sm' : ''}`}
          />
        );
      }
      grid.push(
        <div key={i} className="flex gap-0.5">
          {row}
        </div>
      );
    }
    return grid;
  };

  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${getColor()} p-6 text-white shadow-lg`}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
      <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-black/10 rounded-full blur-xl" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {getIcon()}
            <h3 className="font-bold text-lg tracking-wide">{title.toUpperCase()}</h3>
          </div>
          <img src="/images/UniLodge.png" alt="Logo" className="h-8 opacity-80" onError={(e) => (e.currentTarget.style.display = 'none')} />
        </div>

        {/* User Info */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
            <QrCode size={32} className="text-white" />
          </div>
          <div>
            <p className="text-white/80 text-xs uppercase tracking-wider">Guest Pass</p>
            <p className="font-bold text-xl">{subtitle || 'UniLodge Guest'}</p>
          </div>
        </div>

        {/* Dummy QR Code */}
        <div className="bg-white p-4 rounded-lg mb-4 inline-block">
          <div className="flex flex-col gap-0.5">
            {renderDummyQR()}
          </div>
        </div>

        {/* Footer info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-white/60 text-xs uppercase">Valid Until</p>
            <p className="font-semibold">{value || '2026-12-31'}</p>
          </div>
          <div>
            <p className="text-white/60 text-xs uppercase">Type</p>
            <p className="font-semibold capitalize">{type}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
