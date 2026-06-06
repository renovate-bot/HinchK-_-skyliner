import { useState } from 'react';
import SkylineDataStream from './components/SkylineDataStream';
import type { ThemePalette, RenderStyle, MotionType } from './components/SkylineDataStream';

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
  { id: 'sd-night', name: 'SD NIGHT', url: '/san-diego-skyline-night.png' },
  { id: 'sd-sunset', name: 'SD SUNSET', url: '/san_diego_sunset.png' },
  { id: 'coronado', name: 'CORONADO', url: '/coronado_bridge_night.png' },
];

function App() {
  const [activePalette, setActivePalette] = useState<string>('knicks');
  const [renderStyle, setRenderStyle] = useState<RenderStyle>('silhouette');
  const [motionType, setMotionType] = useState<MotionType>('falling');
  const [glyphMode, setGlyphMode] = useState<'binary' | 'matrix'>('matrix');
  const [speed, setSpeed] = useState<number>(45);
  const [density, setDensity] = useState<number>(10);
  
  const [activeImageId, setActiveImageId] = useState<string>('sd-night');
  const [customImage, setCustomImage] = useState<string | null>(null);

  const currentPalette = PALETTES[activePalette].data;
  const currentImageSrc = activeImageId === 'custom' && customImage 
    ? customImage 
    : PREDEFINED_IMAGES.find(img => img.id === activeImageId)?.url || '/san-diego-skyline-night.png';

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
    <div className="relative w-full h-screen overflow-hidden font-mono" style={{ backgroundColor: currentPalette.background }}>
      
      {/* ========================================================================= */}
      {/* CANVAS ENGINE */}
      {/* ========================================================================= */}
      <SkylineDataStream 
        mode={glyphMode} 
        palette={currentPalette} 
        renderStyle={renderStyle} 
        motionType={motionType}
        speed={speed} 
        density={density} 
        imageSrc={currentImageSrc}
      />

      {/* ========================================================================= */}
      {/* GENERATOR DASHBOARD UI (FLOATING RIGHT PANEL) */}
      {/* ========================================================================= */}
      <div className="absolute top-0 right-0 h-full w-full max-w-sm p-6 overflow-y-auto z-50 pointer-events-none">
        
        {/* Panel Container (Re-enable pointer events for the panel itself) */}
        <div className="glass-morphism rounded-xl border border-white/10 p-6 space-y-8 shadow-2xl pointer-events-auto backdrop-blur-xl bg-black/40 text-slate-200">
          
          <header className="border-b border-white/10 pb-4">
            <h1 className="text-xl font-bold tracking-tight text-white mb-1">Background Gen <span className="text-xs text-white/50 align-top">v1.1</span></h1>
            <p className="text-xs text-slate-400">Configure real-time bespoke aesthetics.</p>
          </header>

          {/* SOURCE IMAGE SELECTOR */}
          <div className="space-y-3">
            <label className="block text-[10px] font-bold text-slate-400 tracking-widest uppercase">Source Image</label>
            <div className="grid grid-cols-3 gap-2">
              {PREDEFINED_IMAGES.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImageId(img.id)}
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
            <div className="relative mt-2">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <button className={`w-full px-3 py-2 text-[10px] rounded border text-center transition-all ${
                activeImageId === 'custom'
                  ? 'border-white/40 bg-white/10 text-white shadow-inner'
                  : 'border-white/5 bg-black/20 text-slate-400 hover:border-white/20'
              }`}>
                {activeImageId === 'custom' ? 'CUSTOM UPLOAD ACTIVE' : '+ UPLOAD CUSTOM IMAGE'}
              </button>
            </div>
            <p className="text-[9px] text-slate-500 leading-tight">
              Tip: High-contrast photos (night cityscapes, blueprints) produce the best stylized results.
            </p>
          </div>

          {/* PALETTE SELECTOR */}
          <div className="space-y-3">
            <label className="block text-[10px] font-bold text-slate-400 tracking-widest uppercase">Color Palette</label>
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(PALETTES).map(([key, { name, data }]) => (
                <button
                  key={key}
                  onClick={() => setActivePalette(key)}
                  className={`flex items-center justify-between px-3 py-2 text-xs rounded border transition-all ${
                    activePalette === key 
                      ? 'border-white/40 bg-white/10 text-white shadow-inner' 
                      : 'border-white/5 bg-black/20 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <span>{name}</span>
                  <div className="flex space-x-1">
                    <span className="w-3 h-3 rounded-full shadow-sm border border-black/50" style={{ backgroundColor: data.primary }} />
                    <span className="w-3 h-3 rounded-full shadow-sm border border-black/50" style={{ backgroundColor: data.secondary }} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* RENDER STYLE */}
          <div className="space-y-3">
            <label className="block text-[10px] font-bold text-slate-400 tracking-widest uppercase">Render Style</label>
            <div className="grid grid-cols-1 gap-2">
              {(['silhouette', 'outline', 'luma-blend'] as RenderStyle[]).map((style) => (
                <button
                  key={style}
                  onClick={() => setRenderStyle(style)}
                  className={`px-3 py-2 text-xs rounded border text-left transition-all ${
                    renderStyle === style 
                      ? 'border-white/40 bg-white/10 text-white' 
                      : 'border-white/5 bg-black/20 text-slate-400 hover:border-white/20'
                  }`}
                >
                  {style === 'silhouette' && 'SILHOUETTE MASK'}
                  {style === 'outline' && 'EDGE OUTLINE (SOBEL)'}
                  {style === 'luma-blend' && 'LUMA GLITCH BLEND'}
                </button>
              ))}
            </div>
          </div>

          {/* MOTION TYPE */}
          <div className="space-y-3">
            <label className="block text-[10px] font-bold text-slate-400 tracking-widest uppercase">Motion Dynamics</label>
            <div className="grid grid-cols-2 gap-2">
              {(['falling', 'flicker'] as MotionType[]).map((motion) => (
                <button
                  key={motion}
                  onClick={() => setMotionType(motion)}
                  className={`px-3 py-2 text-xs rounded border text-center transition-all uppercase ${
                    motionType === motion 
                      ? 'border-white/40 bg-white/10 text-white' 
                      : 'border-white/5 bg-black/20 text-slate-400 hover:border-white/20'
                  }`}
                >
                  {motion}
                </button>
              ))}
            </div>
          </div>

          {/* GLYPH MODE */}
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

          {/* SLIDERS */}
          <div className="space-y-5 border-t border-white/10 pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                <span>Density (Font Size)</span>
                <span className="text-white">{density}px</span>
              </div>
              <input
                type="range"
                min="6"
                max="24"
                step="2"
                value={density}
                onChange={(e) => setDensity(Number(e.target.value))}
                className="w-full h-1 bg-white/20 rounded appearance-none outline-none focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                <span>Speed Delay</span>
                <span className="text-white">{speed}ms</span>
              </div>
              <input
                type="range"
                min="15"
                max="120"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full h-1 bg-white/20 rounded appearance-none outline-none focus:outline-none"
              />
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
