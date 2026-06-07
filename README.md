# Skyliner 🏙️⚡

An interactive, real-time ASCII and Binary Point Cloud Hologram background generator. Inspired by the dynamic aesthetic of [Hire Spartan](https://hirespartan.io/), Skyliner renders dense, high-fidelity digital landscapes using canvas-based luma-to-opacity mapping and chromatic aberration effects.

Live Demo: [hinchk.github.io/skyliner](https://hinchk.github.io/skyliner/) (or [skyliner.github.io](https://skyliner.github.io) if custom domain is configured)

---

## Features

- **Dense Point-Cloud Engine**: High-performance HTML5 Canvas renderer that maps image brightness (Luma) to character density and opacity.
- **Dynamic Glitch Effect**: Sub-pixel chromatic aberration (cyan/magenta split) screen-blended onto the brightest luma regions for a cyberpunk holographic feel.
- **Interactive Control Panel**:
  - **Source Selection**: Switch between three preloaded San Diego landmarks (`SD NIGHT`, `SD SUNSET`, `CORONADO`) or upload your own high-contrast image.
  - **Color Themes**: Toggle between curated palettes:
    - `NY Knicks` (Orange / Blue / White)
    - `Synthwave '84` (Neon Pink / Cyan / Yellow)
    - `Monokai` (Pink / Blue / Green)
    - `Solarized` (Teal / Orange / Amber)
    - `Oceanic` (Teal / Purple / Sage)
  - **Glyph Modes**: Render in standard Binary (`0`/`1`) or a dense alphanumeric Data Matrix.
  - **Live Sliders**: Fine-tune grid density (4px to 16px), flicker speed, luma thresholds, and invert the luma mask.
- **Sleek Glassmorphic UI**: Minimal dashboard control panel overlay with glassmorphism backdrop blur.

---

## Tech Stack

- **Core**: React, TypeScript, HTML5 Canvas API
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Deployment**: GitHub Actions (auto-build & deploy to GitHub Pages)

---

## Local Development

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/HinchK/skyliner.git
   cd skyliner
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` (or the port specified in terminal) to view it in your browser.

4. **Build for Production**:
   ```bash
   npm run build
   ```

---

## How It Works

1. **Image Scaling**: The source image is dynamically scaled to cover the entire canvas area while preserving its aspect ratio.
2. **Offscreen Sampling**: A secondary offscreen canvas samples the pixel coordinates of the scaled image at regular grid intervals (determined by the `Density` setting).
3. **Luma Thresholding**: For each grid node, the perceptual brightness (Luma) is calculated:
   $$\text{Luma} = R \times 0.299 + G \times 0.587 + B \times 0.114$$
   If the pixel's Luma passes the set threshold, a character is rendered at that coordinate.
4. **Opacity Mapping**: The transparency of the characters scales proportionally to how far the pixel's brightness exceeds the threshold, creating depth.
5. **Chromatic Glitch**: Pixels in extremely bright regions have a chance to render dual offset cyan and magenta glyphs using screen composite operations, mimicking real cathode/hologram glitches.

---

## License

MIT License. Feel free to use and customize for your own bespoke backgrounds.
