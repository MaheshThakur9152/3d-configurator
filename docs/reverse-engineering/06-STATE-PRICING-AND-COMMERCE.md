# 06 - State Management, Pricing, and E-Commerce Integration

## 1. Executive Summary: State and Commerce Evaluation

The existing Crystal Jewels application contains **no commercial e-commerce infrastructure**:
- **State Management**: Handled via primitive, unencapsulated JavaScript module variables (`ringModel`, `usingCustomColors`, `nightMode`, `musicPlay`) within `Crystal-Jewels/src/index.ts`.
- **State Persistence**: Zero persistence; the URL does not store configuration parameters, and neither `localStorage` nor `sessionStorage` is queried or written. Refreshing the browser resets the user to the hero scroll section with default colors.
- **Pricing Calculation**: Completely absent. There is no pricing display in HTML, no pricing formula in TypeScript, and no backend API connection.
- **Commerce Operations**: Zero "Add to Cart", "Save Design", or "Checkout" mechanisms exist.

To transform this visual prototype into a functional jewellery e-commerce storefront, an engineering team must design and implement a complete state synchronization layer connected to a modern commerce backend (such as **MedusaJS**).

---

## 2. Reverse-Engineered State Variables (Current App)

Inspection of `Crystal-Jewels/src/index.ts` reveals only five primitive state variables:

```typescript
// Crystal-Jewels/src/index.ts
let usingCustomColors = false; // line 44: suppresses GSAP scroll color-lerping once user customizes
let nightMode = false;         // line 84: tracks whether dark background is active
let firstLooad = true;         // line 85: determines whether intro GSAP animation should play
let ringModel = 1;             // line 86: 1 = Solitaire (ring_webgi.glb), 2 = Halo (ring2_webgi.glb)
let musicPlay = false;         // line 700: tracks audio element play state
```

### Inherent State Synchronization Bugs:
1. **Model Switch State Amnesia**:
   When the user customizes gemstone or metal colors on Ring 1 (`usingCustomColors = true`) and then clicks `.config--ring`, `loadNewModel()` runs (`index.ts` line 632). It removes all scene objects and loads `ring2_webgi.glb`. The new model initializes with its default embedded glTF colors, but `usingCustomColors` remains `true`. If the user scrolls up, the GSAP scroll-lerper is blocked, leaving the scene in an inconsistent state.
2. **Race Conditions on Rapid Clicking**:
   `loadNewModel()` is an `async` function. If a user clicks the ring switch button twice rapidly, two overlapping calls to `viewer.scene.removeSceneModels()` and `manager.addFromPath()` execute concurrently, causing duplicate meshes, corrupt scene graphs, or unhandled promise rejections.

---

## 3. Discovered Configuration vs. Production Schema

### A. Minimal JSON Representation of Discovered State
If we serialized only what the current application actually tracks:

```json
{
  "ringModel": 1,
  "usingCustomColors": true,
  "metalPreset": "rose-silver",
  "gemColorHex": "#f70db1",
  "nightMode": false
}
```

---

### B. Production Jewellery Configurator Schema (For Storefront)
A real jewellery e-commerce storefront requires an immutable, validated, URL-serializable configuration schema:

```json
{
  "$schema": "https://schema.yourstore.com/ring-configurator-v1.json",
  "configurationId": "cfg_9a8b7c6d-5e4f-4a3b-2c1d-0e9f8a7b6c5d",
  "timestamp": "2026-10-24T08:30:00Z",
  "product": {
    "baseModelId": "ring_solitaire_cathedral_01",
    "sku": "RNG-SOL-CAT-18K-RD100",
    "title": "The Eternal Cathedral Solitaire Ring"
  },
  "band": {
    "fingerSizeUS": 6.5,
    "metalType": "18K_GOLD",
    "metalColor": "ROSE_GOLD",
    "metalFinish": "HIGH_POLISH",
    "metalHex": "#E8A399",
    "engraving": {
      "text": "Forever & Always",
      "font": "PlayfairDisplay",
      "laserDepthMm": 0.2
    }
  },
  "centerStone": {
    "gemstoneType": "DIAMOND",
    "origin": "LAB_GROWN",
    "shape": "ROUND_BRILLIANT",
    "caratWeight": 1.50,
    "dimensionsMm": {
      "diameter": 7.35,
      "depth": 4.52
    },
    "colorGrade": "F",
    "clarityGrade": "VS1",
    "cutGrade": "EXCELLENT",
    "colorTintHex": "#FFFFFF"
  },
  "setting": {
    "headType": "SIX_PRONG",
    "prongMetalColor": "PLATINUM",
    "prongMetalHex": "#F5F5F7"
  },
  "pricing": {
    "currency": "USD",
    "bandPrice": 850.00,
    "centerStonePrice": 1650.00,
    "engravingFee": 40.00,
    "totalPrice": 2540.00
  }
}
```

---

## 4. Suggested MedusaJS E-Commerce Architecture

To connect a 3D configurator to **MedusaJS** (a popular, open-source headless commerce platform):

```
+─────────────────────────────────────────────────────────────────────────────+
|                          MEDUSAJS STOREFRONT FLOW                           |
+─────────────────────────────────────────────────────────────────────────────+
                                                                               
   [ 3D React Three Fiber Configurator ]                                       
           │                                                                   
           │ 1. User configures ring (Band: 18K Rose, Stone: 1.5ct Oval)       
           ▼                                                                   
   [ Zustand Reactive Store ] ──────────────────────┐                          
           │                                        │ Syncs state to URL hash  
           │ 2. Calculates client-side price        ▼                          
           ▼                               [ Browser URL: #cfg=base64... ]     
   [ Validate Configuration API ]                                              
           │                                                                   
           │ POST /store/rings/validate-and-price                              
           ▼                                                                   
   [ MedusaJS Backend (Custom Plugin) ]                                        
           │                                                                   
           │ 3. Server-side authoritative validation:                          
           │    - Checks daily metal spot price (Gold per gram * weight)      
           │    - Validates diamond inventory or Rapaport pricing sheet        
           │    - Ensures stone shape matches head geometry                    
           ▼                                                                   
   [ MedusaJS Cart API ]                                                       
           │                                                                   
           │ POST /store/carts/{id}/line-items                                 
           │ Body: {                                                           
           │   variant_id: "var_ring_custom_base",                             
           │   quantity: 1,                                                    
           │   metadata: {                                                     
           │     configuration: { ... full config JSON ... },                 
           │     preview_image_url: "s3://renders/preview-9a8b.png",           
           │     cad_assembly_id: "CAD-RNG-01-RD150"                           
           │   }                                                               
           │ }                                                                 
           ▼                                                                   
   [ Medusa Checkout ] ──► [ Order Created with Custom Manufacturing Metadata ]
```

### Key Integration Principles:
1. **Never Trust Client-Side Prices**:
   The 3D viewer calculates display prices for instantaneous UX feedback, but when the user clicks "Add to Cart", the MedusaJS backend recalculates the authoritative price using server-side inventory rules and daily precious metal market rates.
2. **Snapshot Preview Generation**:
   Before adding to the cart, the 3D canvas calls `gl.canvas.toDataURL('image/jpeg', 0.8)` to capture a thumbnail of the configured ring and attaches it to the line-item metadata so it renders in the cart, order confirmation email, and customer account portal.
3. **Deep-Link Restoration**:
   Encoding the configuration into the URL (e.g. `https://store.com/ring?cfg=eyJhbGciOi...`) enables customers to share their custom designs with friends or resume their session across devices without requiring an account login.
