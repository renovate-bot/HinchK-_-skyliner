import { useState, useEffect } from 'react';
import SkylineDataStream from './components/SkylineDataStream';

function App() {
  const [mode, setMode] = useState<'binary' | 'matrix'>('matrix');
  const [themeColor, setThemeColor] = useState<'teal' | 'purple' | 'emerald'>('teal');
  const [speed, setSpeed] = useState<number>(45);
  const [metrics, setMetrics] = useState({
    activeAgents: 1024,
    networkThroughput: 142.8,
    systemLoad: 24.5,
    nodeStatus: 'STABLE',
  });

  // Simulate updating telemetry metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => {
        const deltaLoad = (Math.random() - 0.5) * 1.5;
        const deltaThroughput = (Math.random() - 0.5) * 4.2;
        return {
          activeAgents: prev.activeAgents + (Math.random() > 0.6 ? 1 : Math.random() < 0.4 ? -1 : 0),
          networkThroughput: Math.max(100, Math.min(250, Number((prev.networkThroughput + deltaThroughput).toFixed(1)))),
          systemLoad: Math.max(5, Math.min(95, Number((prev.systemLoad + deltaLoad).toFixed(1)))),
          nodeStatus: prev.systemLoad > 80 ? 'CRITICAL_LOAD' : 'STABLE',
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Map theme colors to CSS colors and hex color codes for canvas
  const colorMap = {
    teal: {
      hex: '#2dd4bf',
      text: 'text-teal-400',
      bg: 'bg-teal-500',
      bgMuted: 'bg-teal-500/10',
      border: 'border-teal-500/30',
      glow: 'text-glow-teal',
      shadow: 'shadow-teal-500/20',
      gradient: 'from-teal-400 via-cyan-400 to-indigo-400',
    },
    purple: {
      hex: '#c084fc',
      text: 'text-purple-400',
      bg: 'bg-purple-500',
      bgMuted: 'bg-purple-500/10',
      border: 'border-purple-500/30',
      glow: 'text-glow-purple',
      shadow: 'shadow-purple-500/20',
      gradient: 'from-purple-400 via-fuchsia-400 to-indigo-400',
    },
    emerald: {
      hex: '#10b981',
      text: 'text-emerald-400',
      bg: 'bg-emerald-500',
      bgMuted: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      glow: 'text-glow-emerald',
      shadow: 'shadow-emerald-500/20',
      gradient: 'from-emerald-400 via-green-400 to-teal-400',
    },
  };

  const activeTheme = colorMap[themeColor];

  return (
    <div className="relative w-full min-h-screen bg-slate-950 text-slate-100 overflow-hidden flex flex-col">
      {/* ========================================================================= */}
      {/* LAYER 1: BASE SKYLINE NIGHT IMAGE (Dimmed to let ASCII shine) */}
      {/* ========================================================================= */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10 mix-blend-luminosity animate-pulse-glow transition-all duration-1000 z-0 pointer-events-none"
        style={{ backgroundImage: "url('/san-diego-skyline-night.png')" }}
      />

      {/* ========================================================================= */}
      {/* LAYER 2: ASCII MATRIX DATA STREAM CANVAS */}
      {/* ========================================================================= */}
      <SkylineDataStream mode={mode} color={activeTheme.hex} speed={speed} density={12} />

      {/* ========================================================================= */}
      {/* LAYER 3: FOREGROUND UI */}
      {/* ========================================================================= */}
      <div className="relative z-10 w-full flex-grow flex flex-col">
        {/* Navigation Bar */}
        <header className="w-full glass-morphism border-b px-6 py-4 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <div className={`h-3 w-3 rounded-full ${activeTheme.bg} animate-pulse shadow-lg ${activeTheme.shadow}`} />
            <span className="font-mono text-lg font-bold tracking-widest text-slate-200">
              AETHERIS <span className={activeTheme.text}>// SYSTEMS</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-8 font-mono text-xs text-slate-400">
            <a href="#core" className="hover:text-slate-100 transition-colors duration-200 uppercase tracking-wider">Core OS</a>
            <a href="#telemetry" className="hover:text-slate-100 transition-colors duration-200 uppercase tracking-wider font-semibold text-slate-200">Telemetry</a>
            <a href="#swarms" className="hover:text-slate-100 transition-colors duration-200 uppercase tracking-wider">Swarms</a>
            <a href="#nexus" className="hover:text-slate-100 transition-colors duration-200 uppercase tracking-wider">Nexus Portal</a>
          </nav>

          <div className="flex items-center space-x-4">
            <div className="hidden lg:flex items-center space-x-2 font-mono text-[10px] glass-morphism px-3 py-1 rounded border">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-slate-400">NODE STATUS:</span>
              <span className="text-emerald-400 font-semibold">{metrics.nodeStatus}</span>
            </div>
            <button className={`font-mono text-xs px-4 py-2 rounded border transition-all duration-300 font-medium ${activeTheme.border} ${activeTheme.bgMuted} ${activeTheme.text} hover:bg-opacity-20 hover:scale-105 active:scale-95`}>
              CONNECT NODE
            </button>
          </div>
        </header>

        {/* Main Hero & Dashboard Area */}
        <main className="flex-grow max-w-7xl w-full mx-auto px-6 py-8 md:py-16 flex flex-col justify-center space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Hero Text Info */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className={`inline-flex items-center space-x-2 font-mono text-xs px-3 py-1 rounded-full border ${activeTheme.border} ${activeTheme.bgMuted} ${activeTheme.text}`}>
                <span>📍 SAN DIEGO HQ CORRIDOR</span>
                <span>•</span>
                <span>SECURE HOSTING ACTIVE</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none text-slate-100">
                Distributed Edge Intelligence.{' '}
                <span className={`bg-gradient-to-r ${activeTheme.gradient} bg-clip-text text-transparent ${activeTheme.glow}`}>
                  Built for the Future.
                </span>
              </h1>

              <p className="text-slate-400 text-sm md:text-lg max-w-2xl font-light leading-relaxed">
                Deploy high-performance, real-time agent networks over defense-grade infrastructure. 
                Experience Zero-latency data streaming with canvas visual overlays, optimized 
                to render millions of computations with zero CPU overhead.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
                <a 
                  href="#nexus"
                  className={`font-mono text-xs px-8 py-3.5 rounded text-center font-bold tracking-wider text-slate-950 transition-all duration-300 transform hover:scale-105 active:scale-95 hover:shadow-lg ${activeTheme.bg} ${activeTheme.shadow}`}
                >
                  INITIALIZE NEXUS SWARM
                </a>
                <a 
                  href="#docs"
                  className="font-mono text-xs px-8 py-3.5 rounded text-center border border-slate-700 bg-slate-900/60 text-slate-300 hover:bg-slate-800/80 transition-all duration-300"
                >
                  READ PROTOCOLS
                </a>
              </div>
            </div>

            {/* Dashboard / Animation Control Panel */}
            <div className="lg:col-span-5">
              <div className="glass-morphism glass-morphism-glow rounded-xl border p-6 md:p-8 space-y-6 relative overflow-hidden">
                {/* Background Grid Pattern inside card */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />

                <div className="relative z-10 flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h2 className="text-lg font-bold tracking-wider uppercase text-slate-200">TELEMETRY CONTROLS</h2>
                    <p className="text-slate-500 font-mono text-[10px]">ADJUST DATA STREAM OVERLAYS IN REAL-TIME</p>
                  </div>
                  <span className={`font-mono text-xs px-2.5 py-0.5 rounded-full ${activeTheme.bgMuted} ${activeTheme.text} font-bold`}>
                    v3.4.17
                  </span>
                </div>

                <div className="relative z-10 space-y-5">
                  {/* Mode Selector */}
                  <div className="space-y-2">
                    <label className="block text-left text-xs font-mono text-slate-400">GLYPH RENDERING MODULE</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setMode('binary')}
                        className={`font-mono text-xs py-2 px-4 rounded border transition-all duration-200 ${
                          mode === 'binary' 
                            ? `${activeTheme.border} ${activeTheme.bgMuted} ${activeTheme.text} font-bold` 
                            : 'border-slate-800 bg-slate-900/40 text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        BINARY (01)
                      </button>
                      <button
                        onClick={() => setMode('matrix')}
                        className={`font-mono text-xs py-2 px-4 rounded border transition-all duration-200 ${
                          mode === 'matrix' 
                            ? `${activeTheme.border} ${activeTheme.bgMuted} ${activeTheme.text} font-bold` 
                            : 'border-slate-800 bg-slate-900/40 text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        DATA MATRIX
                      </button>
                    </div>
                  </div>

                  {/* Color Theme Selector */}
                  <div className="space-y-2">
                    <label className="block text-left text-xs font-mono text-slate-400">SPECTRUM GLOW SCHEME</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setThemeColor('teal')}
                        className="flex items-center justify-center space-x-2 py-2 px-3 rounded border border-slate-800 bg-slate-900/40 text-xs font-mono text-slate-400 hover:text-teal-400 hover:border-teal-500/20"
                      >
                        <span className="h-2 w-2 rounded-full bg-teal-400" />
                        <span>TEAL</span>
                      </button>
                      <button
                        onClick={() => setThemeColor('purple')}
                        className="flex items-center justify-center space-x-2 py-2 px-3 rounded border border-slate-800 bg-slate-900/40 text-xs font-mono text-slate-400 hover:text-purple-400 hover:border-purple-500/20"
                      >
                        <span className="h-2 w-2 rounded-full bg-purple-400" />
                        <span>PURPLE</span>
                      </button>
                      <button
                        onClick={() => setThemeColor('emerald')}
                        className="flex items-center justify-center space-x-2 py-2 px-3 rounded border border-slate-800 bg-slate-900/40 text-xs font-mono text-slate-400 hover:text-emerald-400 hover:border-emerald-500/20"
                      >
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        <span>EMERALD</span>
                      </button>
                    </div>
                  </div>

                  {/* Speed Controller */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                      <span>ANIMATION SPEED (FRAME DELAY)</span>
                      <span className={`${activeTheme.text} font-bold`}>{speed}ms</span>
                    </div>
                    <input
                      type="range"
                      min="15"
                      max="100"
                      value={speed}
                      onChange={(e) => setSpeed(Number(e.target.value))}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
                      style={{
                        accentColor: activeTheme.hex
                      }}
                    />
                    <div className="flex justify-between text-[10px] font-mono text-slate-600">
                      <span>FAST (15ms)</span>
                      <span>SLOW (100ms)</span>
                    </div>
                  </div>

                  {/* Realtime Stats Block */}
                  <div className="border-t border-slate-800/80 pt-4 mt-2">
                    <label className="block text-left text-xs font-mono text-slate-400 mb-3">NODE TELEMETRY METRICS</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-950/45 p-3 rounded border border-slate-900">
                        <span className="block text-[10px] font-mono text-slate-500 uppercase">ACTIVE SWARM AGENTS</span>
                        <span className="text-lg font-mono font-semibold text-slate-200">{metrics.activeAgents.toLocaleString()}</span>
                      </div>
                      <div className="bg-slate-950/45 p-3 rounded border border-slate-900">
                        <span className="block text-[10px] font-mono text-slate-500 uppercase">THROUGHPUT</span>
                        <span className="text-lg font-mono font-semibold text-slate-200">{metrics.networkThroughput} GB/s</span>
                      </div>
                      <div className="bg-slate-950/45 p-3 rounded border border-slate-900 col-span-2 flex items-center justify-between">
                        <div>
                          <span className="block text-[10px] font-mono text-slate-500 uppercase">GRID COMPUTE LOAD</span>
                          <span className="text-sm font-mono font-semibold text-slate-200">{metrics.systemLoad}%</span>
                        </div>
                        <div className="w-1/2 bg-slate-850 h-2 rounded overflow-hidden">
                          <div 
                            className={`h-full ${activeTheme.bg} transition-all duration-500`} 
                            style={{ width: `${metrics.systemLoad}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Features / Highlights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
            <div className="glass-morphism rounded-lg p-6 border hover:border-slate-700 transition-all duration-300 hover:translate-y-[-2px] group">
              <span className={`block font-mono text-xs ${activeTheme.text} mb-2`}>01 // DEFENSE GRADE SCAFFOLDING</span>
              <h3 className="text-lg font-bold text-slate-200 mb-2 group-hover:text-slate-100">Vite & React Architecture</h3>
              <p className="text-slate-400 text-xs font-light leading-relaxed">
                Supercharged frontend rendering leveraging React, TypeScript modules, and high-efficiency hot-reloading configurations.
              </p>
            </div>

            <div className="glass-morphism rounded-lg p-6 border hover:border-slate-700 transition-all duration-300 hover:translate-y-[-2px] group">
              <span className={`block font-mono text-xs ${activeTheme.text} mb-2`}>02 // ZERO RENDERING JANK</span>
              <h3 className="text-lg font-bold text-slate-200 mb-2 group-hover:text-slate-100">Luma Masked Data Stream</h3>
              <p className="text-slate-400 text-xs font-light leading-relaxed">
                The canvas dynamically samples image luminosity data off-screen, translating high-contrast areas into an optimized ASCII particle matrix.
              </p>
            </div>

            <div className="glass-morphism rounded-lg p-6 border hover:border-slate-700 transition-all duration-300 hover:translate-y-[-2px] group">
              <span className={`block font-mono text-xs ${activeTheme.text} mb-2`}>03 // DYNAMIC BLENDING SYSTEM</span>
              <h3 className="text-lg font-bold text-slate-200 mb-2 group-hover:text-slate-100">Glitch & Chromatic Shift</h3>
              <p className="text-slate-400 text-xs font-light leading-relaxed">
                Built-in chromatic aberration offsets (Cyan/Magenta) combined with screen composite modes deliver a cutting-edge CRT-inspired effect.
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full border-t border-slate-900 bg-slate-950/80 mt-auto py-6 px-6 flex flex-col md:flex-row items-center justify-between font-mono text-[10px] text-slate-500 z-10">
          <div className="flex items-center space-x-2">
            <span>© 2026 AETHERIS SYSTEMS INC.</span>
            <span>|</span>
            <span>SAN DIEGO CORRIDOR EDGE NODES</span>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span>REACT 19.x</span>
            <span>•</span>
            <span>TAILWIND CSS v3</span>
            <span>•</span>
            <span>VITE v8.x</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
