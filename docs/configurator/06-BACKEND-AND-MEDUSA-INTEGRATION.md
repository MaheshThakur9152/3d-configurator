# 06 - Backend API and MedusaJS Commerce Integration

## 1. Executive Summary

This document specifies the backend API architecture and headless commerce integration for the 3D jewellery configurator.

In contrast to marketing demos where prices are hardcoded or calculated client-side in the browser, an enterprise jewellery storefront requires:
1. **Server-Side Authoritative Pricing**: Calculating exact product costs based on daily precious metal spot prices ($/gram), stone carat tiers, and setting labor.
2. **Headless Commerce Separation**: Delegating cart, inventory, checkout, customer accounts, and tax calculation to **MedusaJS**, while the **Configurator API** handles 3D manifests and custom validation.
3. **Traceable Manufacturing Metadata**: Attaching the complete 3D configuration JSON, high-resolution render snapshots, and CAD component IDs to MedusaJS cart line items for downstream manufacturing.

---

## 2. Service Boundaries: Configurator API vs. MedusaJS

```
+─────────────────────────────────────────+      +──────────────────────────────────────────+
|      CONFIGURATOR API SERVICE           |      |          MEDUSAJS COMMERCE CORE          |
|      (services/configurator-api)        |      |            (medusa backend)              |
+─────────────────────────────────────────+      +──────────────────────────────────────────+
| - Serves 3D GLB manifests & node maps   |      | - Product Catalog & Base Variant SKUs    |
| - Validates 3D compatibility rules      |      | - Customer Cart & Line-Item Management   |
| - Computes precious metal & stone cost  | ───► | - Authoritative Checkout & Tax Engine    |
| - Ingests & validates admin GLB uploads |      | - Payment Gateways (Stripe, Klarna, etc.)|
| - Manages short-link configuration IDs  |      | - Order Fulfillment & Factory Webhooks   |
+─────────────────────────────────────────+      +──────────────────────────────────────────+
```

---

## 3. Authoritative Pricing Formula

Precious jewellery cannot use static prices because raw gold, platinum, and diamond market prices fluctuate. The Configurator API calculates prices using a server-side formula:

$$\text{FinalPrice} = \Big( \text{BaseMetalWeight}_{\text{grams}} \times \text{MetalSpotPrice}_{\text{currency/gram}} \times \text{MarkupMultiplier} \Big) + \text{LaborFee} + \text{GemstonePrice}(\text{Cut}, \text{Carat}, \text{Grade}) + \text{EngravingFee}$$

### Pricing Matrix Example (USD):

```json
{
  "spotPrices": {
    "18K_YELLOW_GOLD": 58.50,
    "18K_WHITE_GOLD": 61.20,
    "18K_ROSE_GOLD": 59.10,
    "PLATINUM_950": 34.80
  },
  "baseMetalWeightsGrams": {
    "solitaire_cathedral_01": 4.5,
    "halo_pave_02": 6.8
  },
  "diamondCaratTiers": {
    "0.50": 650.00,
    "1.00": 1850.00,
    "1.50": 3400.00,
    "2.00": 6200.00,
    "3.00": 14500.00
  },
  "laborFees": {
    "FOUR_PRONG": 150.00,
    "SIX_PRONG": 180.00,
    "BEZEL": 220.00,
    "HALO": 350.00
  },
  "engravingFee": 40.00
}
```

---

## 4. RESTful API Contracts (`services/configurator-api`)

All endpoints validate request and response payloads using `@configurator/contracts`.

### 4.1 `GET /api/configurator/products/:productId`
Retrieves product configuration manifests, allowed metals, gemstone cuts, and component mapping rules.

#### Response (200 OK):
```json
{
  "productId": "prod_solitaire_01",
  "productSlug": "the-eternal-cathedral-solitaire",
  "title": "The Eternal Cathedral Solitaire Ring",
  "basePrice": 850.00,
  "currency": "USD",
  "manifestUrl": "/models/manifests/solitaire_cathedral_01/manifest.json",
  "allowedOptions": {
    "metals": ["18K_YELLOW_GOLD", "18K_WHITE_GOLD", "18K_ROSE_GOLD", "PLATINUM_950"],
    "finishes": ["HIGH_POLISH", "SATIN_BRUSHED"],
    "stoneShapes": ["ROUND_BRILLIANT", "OVAL", "EMERALD_CUT", "PEAR", "CUSHION"],
    "caratRange": { "min": 0.5, "max": 3.0, "step": 0.1 },
    "headStyles": ["FOUR_PRONG", "SIX_PRONG", "BEZEL"]
  }
}
```

---

### 4.2 `POST /api/configurator/pricing/calculate`
Calculates authoritative price for a given selection.

#### Request Body:
```json
{
  "productId": "prod_solitaire_01",
  "metalType": "18K_ROSE_GOLD",
  "metalFinish": "HIGH_POLISH",
  "stoneShape": "ROUND_BRILLIANT",
  "caratWeight": 1.5,
  "headStyle": "SIX_PRONG",
  "engraving": { "text": "Forever" }
}
```

#### Response (200 OK):
```json
{
  "currency": "USD",
  "subtotal": 3905.95,
  "breakdown": {
    "metalCost": 265.95,
    "settingLabor": 180.00,
    "stoneCost": 3400.00,
    "engravingFee": 40.00,
    "markupMultiplier": 2.2
  },
  "calculatedAt": "2026-10-24T09:00:00Z",
  "expiresAt": "2026-10-24T09:15:00Z"
}
```

---

### 4.3 `POST /api/configurator/configurations`
Persists a user configuration to generate a permanent short-link ID.

#### Response (201 Created):
```json
{
  "configurationId": "cfg_9a8b7c6d5e4f",
  "shareUrl": "https://storefront.com/configure/solitaire-01?cfg=cfg_9a8b7c6d5e4f",
  "createdAt": "2026-10-24T09:00:00Z"
}
```

---

## 5. MedusaJS Cart Line-Item Integration

When the customer clicks **"Add to Cart"**, the configurator bundles the 3D state and submits it to MedusaJS's Store Cart API (`POST /store/carts/:cart_id/line-items`):

```json
{
  "variant_id": "variant_solitaire_custom_base",
  "quantity": 1,
  "metadata": {
    "configurator": {
      "configurationId": "cfg_9a8b7c6d5e4f",
      "modelId": "solitaire_cathedral_01",
      "metalType": "18K_ROSE_GOLD",
      "metalFinish": "HIGH_POLISH",
      "fingerSizeUS": 6.5,
      "gemstoneType": "DIAMOND_WHITE",
      "stoneShape": "ROUND_BRILLIANT",
      "caratWeight": 1.5,
      "headStyle": "SIX_PRONG",
      "engravingText": "Forever & Always",
      "authoritativePrice": 3905.95,
      "currency": "USD",
      "snapshotImageUrl": "https://storage.yourstore.com/snapshots/preview-cfg-9a8b.webp"
    }
  }
}
```

### Medusa Order Admin Impact:
- **Order Details**: In the Medusa Admin panel, customer service and manufacturing managers see the exact ring configuration, finger size, engraving text, and the snapshot thumbnail rendered directly by the 3D viewer.
- **Factory Export**: The order metadata can be consumed directly by CAD/CAM factory automation tools to generate 3D print wax molds for casting.
