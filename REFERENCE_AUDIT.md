# Reference Audit: Alloyum 3D Ring Configurator Demo

**Target URL:** https://alloyum.com/demo/  
**Inspection Date:** 2026-10-21  
**Inspection Environment:** Windows, Brave Browser connected via Chrome DevTools Protocol (CDP) at `http://127.0.0.1:9222` using Playwright Chromium CDP.

---

## 1. Executive Summary & Page Overview

The reference application is the public 3D Ring Configurator Demo by **Alloyum**, an interactive jewelry configurator allowing customers to customize an engagement ring and optional stacked eternity wedding band in real time with high-fidelity 3D rendering.

Key characteristics:
- **Architecture:** Single-page web application built with modern reactive components (Vite + Tailwind CSS), communicating with the Alloyum public API (`https://api.alloyum.com`).
- **3D Engine:** Three.js / WebGi physically based WebGL engine (`data-engine="three.js r168"`), rendering realistic metals (white gold, yellow gold, rose gold) and faceted gemstone refraction/dispersion with ground contact shadow and environment reflection maps.
- **Layout:** Fixed viewport height application (`h-screen`, `overflow-hidden`). Two-column layout on desktop (70% 3D viewer on left, 30% scrollable configurator panel on right with custom scrollbar). Vertically stacked (50% / 50%) on tablet and mobile viewports.
- **Visual Design:** Minimalist luxury jewelry aesthetic. High-contrast neutral palette (`#ffffff`, `#111827`, `#6b7280`, `#e5e7eb`), crisp typography (`Red Hat Display`), subtle selection indicators (circular outlines on thumbnails, horizontal indicator bars on icons).

---

## 2. Layout & Proportions

### Desktop (1440 × 900)
- **Header:**
  - Height: `65px`
  - Structure: 3-column grid (`grid grid-cols-3 items-center px-4 md:px-6 py-2 md:py-4`)
  - Center: Alloyum logo mark (stylized 'A') + bold text `Alloyum` (links to `/`)
  - Right: `Sign in` button (`bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium px-5 py-2.5`)
  - Bottom border: `1px solid #e5e7eb` (`border-gray-200`)
- **Main Body:**
  - Height: `calc(100vh - 65px)`
  - Left Viewer: `w-full md:w-[70%] h-full relative overflow-hidden bg-white`
    - WebGL Canvas: `w-full h-full absolute inset-0 mix-blend-multiply` with background color `#ececec`
    - Watermark: `absolute top-6 left-6 h-8 opacity-70 select-none pointer-events-none`
    - Gesture Hint: Centered hand pointer icon `👆` indicating drag to rotate; fades out on interaction
    - Fullscreen Button: `absolute bottom-6 right-6 w-10 h-10 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:bg-white`
  - Right Configurator Sidebar: `w-full md:w-[30%] h-full overflow-hidden flex flex-col bg-white border-l border-gray-200`
    - Inner scrollable area: `md:h-full md:overflow-y-auto px-4 md:px-6 pt-4 custom-scrollbar`
    - Title: `Your Engagement Ring` (`24px`/`30px`, `font-normal text-gray-900 tracking-tight`)
    - Subtitle: `Make it yours—design your perfect ring with Alloyum by choosing the shank, head, gold color, and diamond size.` (`text-xs text-gray-500 leading-relaxed`)
    - Price: `$ 7,836` (`16px`, `font-medium text-gray-900 mt-4 md:mt-6 tracking-wide`)
    - Tab Switcher: `Engagement Ring` (active) | `Eternity Ring` (inactive)
    - Scrollable Option Sections (Ring, Metal, Shape, Crown, Centerstone, Side Diamond, Carat, Quality & Origin, Ring Size)
    - Sticky Bottom Action: Full-width black button `💬 INTERESTED, ENQUIRE?`

### Laptop (1280 × 800)
- Proportions maintain 70% / 30% split. Right sidebar shank grid displays 6-7 items per row depending on viewport padding.

### Tablet (768 × 1024)
- Proportions switch to split-pane or narrower sidebar (3 items per row for shanks).
- Top header reduces padding to `px-4 py-2`.

### Mobile (390 × 844) & Narrow Mobile (360 × 800)
- Stacked vertical layout:
  - Top 50%: 3D viewer container (`h-1/2`)
  - Bottom 50%: Configurator scrollable panel (`h-1/2`) with `border-t border-gray-200`
  - Header: Logo centered, `Sign in` button text hidden on small screens (`hidden md:inline`).
  - Shank grid displays 6 columns on mobile.

---

## 3. Typography & Styling Details

### Font Families
- **Primary:** `"Red Hat Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- **Secondary / Thai:** `"Noto Sans Thai", sans-serif`

### Type Hierarchy
| Element | Font Size | Weight | Line Height | Color |
|---|---|---|---|---|
| Header Logo | `18px` (`text-lg`) | `700` (`font-bold`) | `1.5` | `#111827` (`text-gray-900`) |
| Header Sign In | `14px` (`text-sm`) | `500` (`font-medium`) | `1.5` | `#ffffff` |
| Configurator Title | `24px` (mobile) / `30px` (desktop) | `400` (`font-normal`) | `1.2` | `#111827` (`text-gray-900`) |
| Configurator Subtitle | `12px` (`text-xs`) | `400` | `1.5` | `#6b7280` (`text-gray-500`) |
| Price Display | `16px` | `500` (`font-medium`) | `1.5` | `#111827` (`text-gray-900`) |
| Tabs | `14px` | `400` / `500` | `1.5` | Active: `#111827`, Inactive: `#6b7280` |
| Section Labels | `14px` | `400` | `1.5` | `#111827` (`var(--config-text-primary)`) |
| Selected Option Name | `14px` | `300` | `1.5` | `#6b7280` (`var(--config-text-secondary)`) |
| Dropdown Selects | `14px` | `400` | `1.5` | `#374151` (`text-gray-700`) |
| Ring Size Buttons | `12px` | `400` | `1.5` | `#374151` (`text-gray-700`) |
| CTA Button | `14px` | `700` (`font-bold`) | `1.5` | `#ffffff` (All Caps with chat icon) |

---

## 4. Color Palette & Theming Variables

- `--config-text-primary`: `#111827`
- `--config-text-secondary`: `#6b7280`
- Border color: `#e5e7eb` (`border-gray-200`)
- Hover border: `#d1d5db` (`border-gray-300`)
- Active selection underline: `h-[1.5px] bg-black` or `h-[1px] bg-[#00000080]`
- Active thumbnail circle: `border-2 border-black rounded-full`
- Button CTA background: `#000000` (`bg-black` or `#0f172a` in modal)
- Background surface: `#ffffff`
- 3D Viewer background: `#ececec`
- Modal backdrop: `rgba(0, 0, 0, 0.7)`

---

## 5. 3D Viewer & Material Audit

- **WebGL Canvas Dimensions:** Initial `724 × 666 px` on 1440×900 desktop; dynamic resize on window resize.
- **Camera Configuration:**
  - Position: `[-0.028, 11.51, -4.22]`
  - Target: `[0, 0.335, 0]`
  - Field of View (FOV): `~45°`
  - Controls: OrbitControls with azimuthal rotation, polar angle limits preventing viewing below ground plane, smooth inertia damping.
- **Materials:**
  - `Metal 01` (Ring Band): Physically based metallic material (`metalness: 1.0`, `roughness: 0.05-0.15`).
    - White Gold: `#c1c4c7` / `#e2e4e6`
    - Yellow Gold: `#d4af37` / `#e5be75`
    - Rose Gold: `#e89d82` / `#c87a6b`
  - `Metal 02` (Head / Prongs): Physically based metallic material matching band metal.
  - `Gem 01` (Center Oval Diamond): Diamond refraction/dispersion shader with `ior: 2.42`, high transmission, high facet sparkle. Gemstone colors tint transmission:
    - Diamond: Clear white / sparkle
    - Blue Sapphire: Deep rich blue (`#0f4c81`)
    - Ruby: Pigeon blood red (`#c70039`)
    - Emerald: Deep vibrant green (`#097969`)
    - Aquamarine: Ice blue (`#7fffd4` / `#a2e8dd`)
    - Pink Diamond: Soft pastel pink (`#f78da7`)
    - Yellow Sapphire: Canary golden yellow (`#ffd700`)
  - `Gem 02` (Side Pave Diamonds): Matches chosen side diamond gemstone color.
  - `BaseGroundMaterial` / Shadow Plane: Soft contact ambient occlusion / shadow beneath the ring on the `#ececec` ground.
