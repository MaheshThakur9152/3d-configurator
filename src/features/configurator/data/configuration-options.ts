import {
  ShankOption,
  MetalOption,
  ShapeOption,
  CrownOption,
  GemstoneOption,
  CaratOption,
  EternityBandOption,
  ConfiguratorState,
} from '../types/configurator.types';

export const SHANK_OPTIONS: ShankOption[] = [
  { id: 'sh-pv-1', name: 'SH PV 1', code: 'SH PV 1', thumbnail: '/assets/thumbnails/sh_pv_1.png', modelUrl: '/assets/models/sh_pave_1.glb', hasPave: true },
  { id: 'sh-3-pv', name: 'SH 3 PV Y', code: 'SH 3 PV Y', thumbnail: '/assets/thumbnails/sh_3_pv.png', hasPave: true },
  { id: 'sh-f-2', name: 'SH F 2 Y', code: 'SH F 2 Y', thumbnail: '/assets/thumbnails/sh_f_2.png', hasPave: true },
  { id: 'sh-8-d', name: 'SH 8 D Y', code: 'SH 8 D Y', thumbnail: '/assets/thumbnails/sh_8_d.png', hasPave: false },
  { id: 'sh-ch-2', name: 'SH CH 2 Y', code: 'SH CH 2 Y', thumbnail: '/assets/thumbnails/sh_ch_2.png', hasPave: true },
  { id: 'sh-pv-2', name: 'SH PV 2', code: 'SH PV 2', thumbnail: '/assets/thumbnails/sh_pv_2.png', hasPave: true },
  { id: 'sh-pv-3', name: 'SH PV 3', code: 'SH PV 3', thumbnail: '/assets/thumbnails/sh_pv_3.png', hasPave: true },
  { id: 'sh-pv-4', name: 'SH PV 4', code: 'SH PV 4', thumbnail: '/assets/thumbnails/sh_pv_4.png', hasPave: true },
  { id: 'sh-pl-2', name: 'SH PL 2', code: 'SH PL 2', thumbnail: '/assets/thumbnails/sh_pl_2.png', hasPave: false },
  { id: 'sh-pl-3', name: 'SH PL 3', code: 'SH PL 3', thumbnail: '/assets/thumbnails/sh_pl_3.png', hasPave: false },
  { id: 'sh-pl-4', name: 'SH PL 4', code: 'SH PL 4', thumbnail: '/assets/thumbnails/sh_pl_4.png', hasPave: false },
  { id: 'sh-pl-5', name: 'SH PL 5', code: 'SH PL 5', thumbnail: '/assets/thumbnails/sh_pl_5.png', hasPave: false },
  { id: 'sh-u-2', name: 'SH U 2 Y', code: 'SH U 2 Y', thumbnail: '/assets/thumbnails/sh_u_2.png', hasPave: false },
];

export const METAL_OPTIONS: MetalOption[] = [
  {
    id: 'yellow_gold',
    name: 'Yellow Gold',
    icon: '/assets/icons/metals/yellow-gold.png',
    colorHex: '#e8be70',
    metalness: 1.0,
    roughness: 0.08,
    priceDelta: -5,
  },
  {
    id: 'white_gold',
    name: 'White Gold',
    icon: '/assets/icons/metals/white-gold.png',
    colorHex: '#dfe2e5',
    metalness: 1.0,
    roughness: 0.08,
    priceDelta: 0,
  },
  {
    id: 'rose_gold',
    name: 'Rose Gold',
    icon: '/assets/icons/metals/rose-gold.png',
    colorHex: '#e59a85',
    metalness: 1.0,
    roughness: 0.08,
    priceDelta: -3,
  },
];

export const SHAPE_OPTIONS: ShapeOption[] = [
  { id: 'cushion', name: 'Cushion', icon: '/assets/icons/shapes/cushion.svg' },
  { id: 'emerald', name: 'Emerald', icon: '/assets/icons/shapes/emerald.svg' },
  { id: 'oval', name: 'Oval', icon: '/assets/icons/shapes/oval.svg' },
  { id: 'pear', name: 'Pear', icon: '/assets/icons/shapes/pear.svg' },
  { id: 'round', name: 'Round', icon: '/assets/icons/shapes/round.svg' },
];

export const CROWN_OPTIONS: CrownOption[] = [
  { id: 'halo', name: 'Halo', icon: '/assets/icons/head_style/halo.svg' },
  { id: 'hidden_halo', name: 'Hidden Halo', icon: '/assets/icons/head_style/hidden_halo.svg' },
  { id: 'secret_hidden_halo', name: 'Secret Hidden Halo', icon: '/assets/icons/head_style/secret_hidden_halo.svg' },
  { id: '4_prongs', name: '4 Prongs', icon: '/assets/icons/head_style/4_prongs.svg' },
  { id: '6_prongs', name: '6 Prongs', icon: '/assets/icons/head_style/6_prongs.svg' },
  { id: 'secret_bazel', name: 'Secret Bazel', icon: '/assets/icons/head_style/secret_bazel.svg' },
  { id: 'tulip', name: 'Tulip', icon: '/assets/icons/head_style/tulip.svg' },
];

export const GEMSTONE_OPTIONS: GemstoneOption[] = [
  { id: 'diamond', name: 'Diamond', icon: '/assets/icons/gemstones/diamond.svg', color: '#ffffff', transmissionColor: '#ffffff', ior: 2.42 },
  { id: 'blue_sapphire', name: 'Blue Sapphire', icon: '/assets/icons/gemstones/blue_sapphire.svg', color: '#0f4c81', transmissionColor: '#1657a0', ior: 1.77 },
  { id: 'ruby', name: 'Ruby', icon: '/assets/icons/gemstones/ruby.svg', color: '#c70039', transmissionColor: '#de1247', ior: 1.77 },
  { id: 'emerald', name: 'Emerald', icon: '/assets/icons/gemstones/emerald.svg', color: '#097969', transmissionColor: '#0ea47f', ior: 1.58 },
  { id: 'aquamarine', name: 'Aquamarine', icon: '/assets/icons/gemstones/aquamarine.svg', color: '#7fffd4', transmissionColor: '#93ece1', ior: 1.58 },
  { id: 'pink_diamond', name: 'Pink Diamond', icon: '/assets/icons/gemstones/pink_diamond.svg', color: '#f78da7', transmissionColor: '#ffaec3', ior: 2.42 },
  { id: 'yellow_sapphire', name: 'Yellow Sapphire', icon: '/assets/icons/gemstones/yellow_sapphire.svg', color: '#ffd700', transmissionColor: '#ffe033', ior: 1.77 },
];

export const CARAT_OPTIONS: CaratOption[] = [
  { id: '0.5', carat: 0.5, label: '0.50 ct', icon: '/assets/icons/carats/0.5.svg', scale: 0.78, priceDelta: -2800 },
  { id: '1.0', carat: 1.0, label: '1.00 ct', icon: '/assets/icons/carats/1.svg', scale: 1.0, priceDelta: 0 },
  { id: '2.0', carat: 2.0, label: '2.00 ct', icon: '/assets/icons/carats/2.svg', scale: 1.25, priceDelta: 5400 },
];

export const QUALITY_OPTIONS = [
  { id: 'excellent', label: 'Excellent' },
  { id: 'very_good', label: 'Very Good' },
  { id: 'good', label: 'Good' },
  { id: 'fair', label: 'Fair' },
  { id: 'poor', label: 'Poor' },
];

export const ORIGIN_OPTIONS = [
  { id: 'natural', label: 'Natural' },
  { id: 'lab', label: 'Lab-Grown' },
];

export const RING_SIZES = [
  'US 4',
  'US 5',
  'US 6',
  'US 7',
  'US 8',
  'US 9',
  'US 10',
  'US 11',
  'US 12',
];

export const ETERNITY_OPTIONS: EternityBandOption[] = [
  { id: 'et-plain-03', name: 'ET-Plain-03', thumbnail: '/assets/thumbnails/eternity/et_plain_03_y_a0a672907c.png', modelUrl: '/assets/models/et_plain_03.glb', priceDelta: 195 },
  { id: 'et-9diamonds', name: 'ET-9Diamonds', thumbnail: '/assets/thumbnails/eternity/et_9_diamonds_y_429541dda0.png', modelUrl: '/assets/models/et_9_diamods.glb', priceDelta: 350 },
  { id: 'et-channel-1', name: 'ET-Channel-1', thumbnail: '/assets/thumbnails/eternity/et_channel_1_y_591896a787.png', modelUrl: '/assets/models/et_channel_1.glb', priceDelta: 420 },
  { id: 'et-diamond-1', name: 'ET-Diamond-1', thumbnail: '/assets/thumbnails/eternity/et_diamond_1_y_46142af31a.png', modelUrl: '/assets/models/et_diamond_1.glb', priceDelta: 480 },
  { id: 'et-pave-2', name: 'ET-Pave-2', thumbnail: '/assets/thumbnails/eternity/et_pave_2_y_c77d799766.png', priceDelta: 390 },
  { id: 'et-pave-4', name: 'ET-Pave-4', thumbnail: '/assets/thumbnails/eternity/et_pave_4_y_93640c03a4.png', priceDelta: 450 },
  { id: 'et-plain-01', name: 'ET-Plain-01', thumbnail: '/assets/thumbnails/eternity/et_plain_01_y_85eff0c176.png', priceDelta: 180 },
  { id: 'et-plain-02', name: 'ET-Plain-02', thumbnail: '/assets/thumbnails/eternity/et_plain_02_y_40ad83632f.png', priceDelta: 210 },
  { id: 'et-upave-1', name: 'ET-UPave-1', thumbnail: '/assets/thumbnails/eternity/et_upave_1_y_f8dde15fbe.png', priceDelta: 380 },
  { id: 'et-upave-2', name: 'ET-UPave-2', thumbnail: '/assets/thumbnails/eternity/et_upave_2_y_2c53eacfe0.png', priceDelta: 420 },
  { id: 'et-upave-3', name: 'ET-UPave-3', thumbnail: '/assets/thumbnails/eternity/et_upave_3_y_b15c78e12f.png', priceDelta: 460 },
];

export const INITIAL_CONFIGURATOR_STATE: ConfiguratorState = {
  activeTab: 'engagement',
  selectedShank: SHANK_OPTIONS[0],
  selectedMetal: METAL_OPTIONS[1], // White Gold is default in reference
  selectedShape: SHAPE_OPTIONS[2], // Oval is default in reference
  selectedCrown: CROWN_OPTIONS[2], // Secret Hidden Halo is default in reference
  selectedCenterstone: GEMSTONE_OPTIONS[0], // Diamond
  selectedSideDiamond: GEMSTONE_OPTIONS[0], // Diamond
  selectedCarat: CARAT_OPTIONS[1], // 1.00 ct
  selectedQuality: 'good',
  selectedOrigin: 'natural',
  selectedRingSize: 'US 7',
  eternityActive: false,
  selectedEternity: ETERNITY_OPTIONS[0],
  isFullscreen: false,
  isEnquiryOpen: false,
  isLoading: false,
};
