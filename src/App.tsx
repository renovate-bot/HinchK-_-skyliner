import { useState } from 'react';
import SkylineDataStream from './components/SkylineDataStream';
import type { ThemePalette } from './components/SkylineDataStream';

const PALETTES: Record<string, { name: string, data: ThemePalette }> = {
  knicks: {
    name: 'NY KNICKS',
    data: {
      background: '#020617', 
      text: '#e2e8f0',       
      primary: '#F58426',    // Orange
      secondary: '#006BB6',  // Blue
      accent: '#ffffff',
    }
  },
  synthwave: {
    name: 'SYNTHWAVE 84',
    data: {
      background: '#090014', 
      text: '#e2e8f0',
      primary: '#FF2A6D',    // Hot Pink
      secondary: '#05D9E8',  // Cyan
      accent: '#F1C40F',     
    }
  },
  monokai: {
    name: 'MONOKAI',
    data: {
      background: '#272822',
      text: '#F8F8F2',
      primary: '#F92672',    // Pink
      secondary: '#66D9EF',  // Light Blue
      accent: '#A6E22E',     
    }
  },
  solarized: {
    name: 'SOLARIZED',
    data: {
      background: '#002b36',
      text: '#839496',
      primary: '#2aa198',    // Cyan
      secondary: '#cb4b16',  // Orange
      accent: '#b58900',     
    }
  },
  oceanic: {
    name: 'OCEANIC',
    data: {
      background: '#1B2B34',
      text: '#D8DEE9',
      primary: '#5FB3B3',    // Teal
      secondary: '#C594C5',  // Purple
      accent: '#99C794',     
    }
  }
};

const PREDEFINED_IMAGES = [
  { id: 'sd-night', name: 'SD NIGHT', url: 'san-diego-skyline-night.png', threshold: 30, invert: false },
  { id: 'sd-sunset', name: 'SD SUNSET', url: 'san_diego_sunset.png', threshold: 100, invert: true },
  { id: 'coronado', name: 'CORONADO', url: 'coronado_bridge_night.png', threshold: 50, invert: false },
];

function App() {
  const [activePalette, setActivePalette] = useState<string>('knicks');
  const [glyphMode, setGlyphMode] = useState<'binary' | 'matrix'>('matrix');
  const [speed, setSpeed] = useState<number>(45);
  const [density, setDensity] = useState<number>(8);
  
  const [lumaThreshold, setLumaThreshold] = useState<number>(30);
  const [invertMask, setInvertMask] = useState<boolean>(false);
  
  const [activeImageId, setActiveImageId] = useState<string>('sd-night');
  const [customImage, setCustomImage] = useState<string | null>(null);

  const [bgImageOpacity, setBgImageOpacity] = useState<number>(0.08); // Subtle background skyline blend by default
  const [colorMapping, setColorMapping] = useState<'random' | 'luma'>('luma'); // Luma mapping by default
  const [contrast, setContrast] = useState<number>(1.2); // Sightly boosted contrast by default

  const currentPalette = PALETTES[activePalette].data;
  const currentImageSrc = activeImageId === 'custom' && customImage 
    ? customImage 
    : PREDEFINED_IMAGES.find(img => img.id === activeImageId)?.url || 'san-diego-skyline-night.png';

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomImage(event.target?.result as string);
        setActiveImageId('custom');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden font-mono">
      
      {/* ========================================================================= */}
      {/* CANVAS ENGINE */}
      {/* ========================================================================= */}
      <SkylineDataStream 
        mode={glyphMode} 
        palette={currentPalette} 
        speed={speed} 
        density={density} 
        imageSrc={currentImageSrc}
        lumaThreshold={lumaThreshold}
        invertMask={invertMask}
        bgImageOpacity={bgImageOpacity}
        colorMapping={colorMapping}
        contrast={contrast}
      />

      {/* ========================================================================= */}
      {/* GENERATOR DASHBOARD UI (FLOATING RIGHT PANEL) */}
      {/* ========================================================================= */}
      <div className="absolute top-0 right-0 h-full w-full max-w-sm p-6 overflow-y-auto z-50 pointer-events-none">
        
        {/* Panel Container (Re-enable pointer events for the panel itself) */}
        <div className="glass-morphism rounded-xl border border-white/10 p-6 space-y-8 shadow-2xl pointer-events-auto backdrop-blur-xl bg-black/40 text-slate-200">
          
          <header className="border-b border-white/10 pb-4">
            <h1 className="text-xl font-bold tracking-tight text-white mb-1">Background Gen <span className="text-xs text-white/50 align-top">v1.2</span></h1>
            <p className="text-xs text-slate-400">Configure real-time bespoke aesthetics.</p>
          </header>

          {/* SOURCE IMAGE SELECTOR */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold tracking-widest text-slate-300">SOURCE IMAGE</h3>
            <div className="grid grid-cols-3 gap-2">
              {PREDEFINED_IMAGES.map((img) => (
                <button
                  key={img.id}
                  onClick={() => {
                    setActiveImageId(img.id);
                    setLumaThreshold(img.threshold);
                    setInvertMask(img.invert);
                  }}
                  className={`px-2 py-2 text-[10px] rounded border text-center transition-all ${
                    activeImageId === img.id
                      ? 'border-white/40 bg-white/10 text-white shadow-inner' 
                      : 'border-white/5 bg-black/20 text-slate-400 hover:border-white/20'
                  }`}
                >
                  {img.name}
                </button>
              ))}
            </div>
            <label className="block w-full">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileUpload} 
                className="hidden" 
              />
              <div className="w-full px-4 py-2 border border-white/10 hover:border-white/30 rounded text-center text-xs text-slate-400 hover:text-white cursor-pointer transition-colors bg-black/40">
                + UPLOAD CUSTOM IMAGE
              </div>
            </label>
            <p className="text-[10px] text-slate-500 italic">Tip: High-contrast photos (night cityscapes, blueprints) produce the best stylized results.</p>
          </div>

          {/* PALETTE SELECTOR */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold tracking-widest text-slate-300">COLOR PALETTE</h3>
            <div className="space-y-2">
              {Object.entries(PALETTES).map(([key, { name, data }]) => (
                <button
                  key={key}
                  onClick={() => setActivePalette(key)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded border transition-all ${
                    activePalette === key 
                      ? 'border-white/40 bg-white/10 text-white shadow-inner' 
                      : 'border-white/5 bg-black/20 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <span className="uppercase tracking-wider">{name}</span>
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.primary }} />
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.secondary }} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* GLYPH MODULE */}
          <div className="space-y-3">
            <label className="block text-[10px] font-bold text-slate-400 tracking-widest uppercase">Glyph Module</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setGlyphMode('binary')}
                className={`px-3 py-2 text-xs rounded border text-center transition-all ${
                  glyphMode === 'binary' ? 'border-white/40 bg-white/10 text-white' : 'border-white/5 bg-black/20 text-slate-400 hover:border-white/20'
                }`}
              >
                BINARY (0/1)
              </button>
              <button
                onClick={() => setGlyphMode('matrix')}
                className={`px-3 py-2 text-xs rounded border text-center transition-all ${
                  glyphMode === 'matrix' ? 'border-white/40 bg-white/10 text-white' : 'border-white/5 bg-black/20 text-slate-400 hover:border-white/20'
                }`}
              >
                DATA MATRIX
              </button>
            </div>
          </div>

          {/* COLOR MAPPING */}
          <div className="space-y-3">
            <label className="block text-[10px] font-bold text-slate-400 tracking-widest uppercase">Color Distribution</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setColorMapping('random')}
                className={`px-3 py-2 text-xs rounded border text-center transition-all ${
                  colorMapping === 'random' ? 'border-white/40 bg-white/10 text-white shadow-inner' : 'border-white/5 bg-black/20 text-slate-400 hover:border-white/20'
                }`}
              >
                RANDOM
              </button>
              <button
                onClick={() => setColorMapping('luma')}
                className={`px-3 py-2 text-xs rounded border text-center transition-all ${
                  colorMapping === 'luma' ? 'border-white/40 bg-white/10 text-white shadow-inner' : 'border-white/5 bg-black/20 text-slate-400 hover:border-white/20'
                }`}
              >
                LUMA-MAPPED
              </button>
            </div>
          </div>

          {/* SLIDERS */}
          <div className="space-y-4 pt-2 border-t border-white/5">
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                <span>Density (Grid Size)</span>
                <span className="text-white">{density}px</span>
              </div>
              <input
                type="range"
                min="4"
                max="16"
                step="1"
                value={density}
                onChange={(e) => setDensity(Number(e.target.value))}
                className="w-full h-1 bg-white/20 rounded appearance-none outline-none focus:outline-none cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                <span>Flicker Speed</span>
                <span className="text-white">{speed}</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                step="1"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full h-1 bg-white/20 rounded appearance-none outline-none focus:outline-none cursor-pointer"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-white/5">
              <div className="flex justify-between text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                <span>Background Opacity</span>
                <span className="text-white">{Math.round(bgImageOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.4"
                step="0.01"
                value={bgImageOpacity}
                onChange={(e) => setBgImageOpacity(Number(e.target.value))}
                className="w-full h-1 bg-white/20 rounded appearance-none outline-none focus:outline-none cursor-pointer"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-white/5">
              <div className="flex justify-between text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                <span>Contrast</span>
                <span className="text-white">{contrast.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.1"
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-full h-1 bg-white/20 rounded appearance-none outline-none focus:outline-none cursor-pointer"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-white/5">
              <div className="flex justify-between text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                <span>Luma Threshold</span>
                <span className="text-white">{lumaThreshold}</span>
              </div>
              <input
                type="range"
                min="0"
                max="255"
                step="1"
                value={lumaThreshold}
                onChange={(e) => setLumaThreshold(Number(e.target.value))}
                className="w-full h-1 bg-white/20 rounded appearance-none outline-none focus:outline-none cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase cursor-pointer">
                Invert Luma Mask
              </label>
              <button 
                onClick={() => setInvertMask(!invertMask)}
                className={`w-8 h-4 rounded-full transition-colors relative ${invertMask ? 'bg-white/80' : 'bg-black/40 border border-white/20'}`}
              >
                <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all duration-300 ${invertMask ? 'left-4 shadow-sm bg-black' : 'left-0.5'}`} />
              </button>
            </div>
          </div>

          {/* ACTION BUTTON */}
          <div className="pt-4">
            <button className="w-full py-3 rounded bg-white text-black font-bold text-xs tracking-wider uppercase hover:bg-slate-200 transition-colors shadow-lg">
              Export Configuration
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}

export default App;
