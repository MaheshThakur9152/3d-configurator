import { create } from 'zustand';
import { RingConfiguration, RingConfigurationSchema } from '@configurator/contracts';

interface ConfiguratorState {
  config: RingConfiguration;
  activeTab: 'metals' | 'gemstones' | 'setting' | 'engraving';
  isDirty: boolean;
  estimatedPriceUSD: number;
  isEmbedMode: boolean;

  // Actions
  setActiveTab: (tab: 'metals' | 'gemstones' | 'setting' | 'engraving') => void;
  setMetalType: (metal: RingConfiguration['metalType']) => void;
  setMetalFinish: (finish: RingConfiguration['metalFinish']) => void;
  setStoneShape: (shape: RingConfiguration['stoneShape']) => void;
  setCaratWeight: (carat: number) => void;
  setGemstoneType: (gem: RingConfiguration['gemstoneType']) => void;
  setFingerSize: (size: number) => void;
  setHeadStyle: (style: RingConfiguration['headStyle']) => void;
  setEngravingText: (text: string) => void;
  setModelId: (modelId: string) => void;
  setEstimatedPrice: (price: number) => void;
  setEmbedMode: (embed: boolean) => void;
  resetDefaults: () => void;
  loadConfiguration: (newConfig: RingConfiguration) => void;
}

const DEFAULT_CONFIG: RingConfiguration = {
  schemaVersion: '1.0.0',
  productId: 'solitaire-01',
  productSlug: 'the-eternal-cathedral-solitaire',
  modelId: 'solitaire_cathedral_01',
  metalType: '18K_YELLOW_GOLD',
  metalFinish: 'HIGH_POLISH',
  fingerSizeUS: 6.5,
  gemstoneType: 'DIAMOND_WHITE',
  stoneShape: 'ROUND_BRILLIANT',
  caratWeight: 1.0,
  settingMetalType: '18K_WHITE_GOLD',
  headStyle: 'SIX_PRONG',
  engraving: {
    text: '',
    font: 'PlayfairDisplay'
  }
};

function getInitialConfig(): RingConfiguration {
  if (typeof window !== 'undefined' && window.location.hash.startsWith('#cfg=')) {
    try {
      const base64 = window.location.hash.replace('#cfg=', '');
      const json = JSON.parse(atob(base64));
      const res = RingConfigurationSchema.safeParse(json);
      if (res.success) return res.data;
    } catch (e) {
      console.warn('[ConfiguratorStore] Failed to parse URL configuration hash.');
    }
  }
  return DEFAULT_CONFIG;
}

function syncUrlHash(config: RingConfiguration) {
  if (typeof window !== 'undefined') {
    try {
      const base64 = btoa(JSON.stringify(config));
      window.history.replaceState(null, '', `#cfg=${base64}`);
    } catch (e) {
      // ignore
    }
  }
}

export const useConfiguratorStore = create<ConfiguratorState>((set, get) => ({
  config: getInitialConfig(),
  activeTab: 'metals',
  isDirty: false,
  estimatedPriceUSD: 2450.00,
  isEmbedMode: typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('embed') === 'true',

  setActiveTab: (tab) => set({ activeTab: tab }),

  setMetalType: (metal) => {
    const updated = { ...get().config, metalType: metal };
    syncUrlHash(updated);
    set({ config: updated, isDirty: true });
  },

  setMetalFinish: (finish) => {
    const updated = { ...get().config, metalFinish: finish };
    syncUrlHash(updated);
    set({ config: updated, isDirty: true });
  },

  setStoneShape: (shape) => {
    const updated = { ...get().config, stoneShape: shape };
    syncUrlHash(updated);
    set({ config: updated, isDirty: true });
  },

  setCaratWeight: (carat) => {
    const updated = { ...get().config, caratWeight: carat };
    syncUrlHash(updated);
    set({ config: updated, isDirty: true });
  },

  setGemstoneType: (gem) => {
    const updated = { ...get().config, gemstoneType: gem };
    syncUrlHash(updated);
    set({ config: updated, isDirty: true });
  },

  setFingerSize: (size) => {
    const updated = { ...get().config, fingerSizeUS: size };
    syncUrlHash(updated);
    set({ config: updated, isDirty: true });
  },

  setHeadStyle: (style) => {
    const updated = { ...get().config, headStyle: style };
    syncUrlHash(updated);
    set({ config: updated, isDirty: true });
  },

  setEngravingText: (text) => {
    const updated = {
      ...get().config,
      engraving: {
        font: get().config.engraving?.font || 'PlayfairDisplay',
        text
      }
    };
    syncUrlHash(updated);
    set({ config: updated, isDirty: true });
  },

  setModelId: (modelId) => {
    const updated = {
      ...get().config,
      modelId,
      productId: modelId.includes('halo') ? 'halo-02' : 'solitaire-01',
      productSlug: modelId.includes('halo') ? 'the-luminary-halo-pave' : 'the-eternal-cathedral-solitaire'
    };
    syncUrlHash(updated);
    set({ config: updated, isDirty: true });
  },

  setEstimatedPrice: (price) => set({ estimatedPriceUSD: price }),

  setEmbedMode: (embed) => set({ isEmbedMode: embed }),

  resetDefaults: () => {
    syncUrlHash(DEFAULT_CONFIG);
    set({ config: DEFAULT_CONFIG, isDirty: false });
  },

  loadConfiguration: (newConfig) => {
    syncUrlHash(newConfig);
    set({ config: newConfig, isDirty: false });
  }
}));
