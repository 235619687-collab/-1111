import React from 'react';
import { ShapeType } from '../types';
import { Palette, Hand, Maximize2, MonitorSmartphone } from 'lucide-react';
import clsx from 'clsx';

interface UIProps {
  currentShape: ShapeType;
  setShape: (s: ShapeType) => void;
  color: string;
  setColor: (c: string) => void;
  handActive: boolean;
  handDistance: number;
}

const SHAPES = Object.values(ShapeType);
const COLORS = ['#ffffff', '#ff0055', '#00ccff', '#ffcc00', '#aa00ff', '#00ff66'];

const UI: React.FC<UIProps> = ({ currentShape, setShape, color, setColor, handActive, handDistance }) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
      
      {/* Header */}
      <header className="flex justify-between items-start pointer-events-auto">
        <div className="bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10">
           <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
             Zen Particles
           </h1>
           <p className="text-xs text-gray-400 mt-1 max-w-[200px]">
             Use your hands to control the cosmic dust.
           </p>
        </div>
        
        <div className="flex gap-2">
           <div className={clsx(
             "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-300",
             handActive ? "bg-green-500/20 border-green-500/50 text-green-300" : "bg-red-500/20 border-red-500/50 text-red-300"
           )}>
             <Hand size={14} />
             {handActive ? "Hands Detected" : "No Hands"}
           </div>
           {handActive && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-white/10 border border-white/10">
                <Maximize2 size={14} />
                <span>Spread: {Math.round(handDistance * 100)}%</span>
              </div>
           )}
        </div>
      </header>

      {/* Controls */}
      <div className="flex flex-col gap-4 items-end pointer-events-auto">
        
        {/* Shape Selector */}
        <div className="bg-black/60 backdrop-blur-lg p-4 rounded-2xl border border-white/10 flex flex-col gap-3 w-48">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Shape</span>
          <div className="grid grid-cols-2 gap-2">
            {SHAPES.map((shape) => (
              <button
                key={shape}
                onClick={() => setShape(shape)}
                className={clsx(
                  "px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 text-left hover:bg-white/10",
                  currentShape === shape ? "bg-white/20 text-white border-l-2 border-blue-400" : "text-gray-400"
                )}
              >
                {shape}
              </button>
            ))}
          </div>
        </div>

        {/* Color Selector */}
        <div className="bg-black/60 backdrop-blur-lg p-4 rounded-2xl border border-white/10 flex flex-col gap-3 w-48">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <Palette size={12} />
            <span>Color Atmosphere</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={clsx(
                  "w-8 h-8 rounded-full border-2 transition-transform hover:scale-110",
                  color === c ? "border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.5)]" : "border-transparent"
                )}
                style={{ backgroundColor: c }}
              />
            ))}
            <input 
              type="color" 
              value={color} 
              onChange={(e) => setColor(e.target.value)}
              className="w-8 h-8 rounded-full overflow-hidden opacity-0 absolute"
              id="customColor"
            />
            <label htmlFor="customColor" className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center cursor-pointer hover:bg-white/10 text-white/50 text-xs">
              +
            </label>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UI;