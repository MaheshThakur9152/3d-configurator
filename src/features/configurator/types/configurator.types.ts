export type TabType = 'engagement' | 'eternity';

export interface ShankOption {
  id: string;
  name: string;
  code: string;
  thumbnail: string;
  modelUrl?: string;
  hasPave?: boolean;
}

export interface MetalOption {
  id: string;
  name: string;
  icon: string;
  colorHex: string;
  metalness: number;
  roughness: number;
  priceDelta: number;
}

export interface ShapeOption {
  id: string;
  name: string;
  icon: string;
}

export interface CrownOption {
  id: string;
  name: string;
  icon: string;
}

export interface GemstoneOption {
  id: string;
  name: string;
  icon: string;
  color: string;
  transmissionColor: string;
  ior: number;
}

export interface CaratOption {
  id: string;
  carat: number;
  label: string;
  icon: string;
  scale: number;
  priceDelta: number;
}

export interface EternityBandOption {
  id: string;
  name: string;
  thumbnail: string;
  modelUrl?: string;
  priceDelta: number;
}

export interface ConfiguratorState {
  activeTab: TabType;
  selectedShank: ShankOption;
  selectedMetal: MetalOption;
  selectedShape: ShapeOption;
  selectedCrown: CrownOption;
  selectedCenterstone: GemstoneOption;
  selectedSideDiamond: GemstoneOption;
  selectedCarat: CaratOption;
  selectedQuality: string;
  selectedOrigin: string;
  selectedRingSize: string;
  eternityActive: boolean;
  selectedEternity: EternityBandOption;
  isFullscreen: boolean;
  isEnquiryOpen: boolean;
  isLoading: boolean;
}
