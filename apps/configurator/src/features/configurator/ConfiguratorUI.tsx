import React from 'react';
import { useConfiguratorStore } from '../../store/useConfiguratorStore.js';
import { MetalSelector } from './MetalSelector.js';
import { GemstoneSelector } from './GemstoneSelector.js';
import { CaratSlider } from './CaratSlider.js';
import { RingSizeSelector } from './RingSizeSelector.js';
import { PricingSummary } from './PricingSummary.js';
import { Sparkles, Gem, Layers, Type } from 'lucide-react';

export const ConfiguratorUI: React.FC = () => {
  const { config, activeTab, setActiveTab, setModelId, setEngravingText } = useConfiguratorStore();

  const isSolitaire = config.modelId === 'solitaire_cathedral_01';

  return (
    <aside className="w-full lg:w-[420px] h-full flex flex-col bg-[#14141A] border-l border-white/10 z-20 shadow-2xl">
      {/* Header Bar */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gold">
            Bespoke 3D Studio
          </span>
          {/* Ring Model Switcher */}
          <div className="flex items-center p-0.5 rounded-lg border border-white/10 bg-white/[0.04]">
            <button
              onClick={() => setModelId('solitaire_cathedral_01')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                isSolitaire ? 'bg-gold text-[#121216] font-semibold shadow-sm' : 'text-white/60 hover:text-white'
              }`}
            >
              Solitaire
            </button>
            <button
              onClick={() => setModelId('halo_pave_02')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                !isSolitaire ? 'bg-gold text-[#121216] font-semibold shadow-sm' : 'text-white/60 hover:text-white'
              }`}
            >
              Halo Pavé
            </button>
          </div>
        </div>

        <h1 className="text-xl font-serif font-bold text-white tracking-tight">
          {isSolitaire ? 'The Eternal Cathedral Solitaire' : 'The Luminary Halo & Pavé Ring'}
        </h1>
        <p className="text-xs text-white/50 mt-1">
          Precision crafted 18K gold and certified brilliant gemstone.
        </p>
      </div>

      {/* Luxury Navigation Tabs */}
      <nav className="flex border-b border-white/10 bg-[#121217]">
        {[
          { id: 'metals', label: 'Metals', icon: Sparkles },
          { id: 'gemstones', label: 'Diamonds', icon: Gem },
          { id: 'setting', label: 'Sizing', icon: Layers },
          { id: 'engraving', label: 'Engraving', icon: Type }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 px-2 flex flex-col items-center gap-1 border-b-2 text-[11px] font-medium transition-all ${
                isActive
                  ? 'border-gold text-white font-semibold'
                  : 'border-transparent text-white/50 hover:text-white/80'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Tab Panels Container */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
        {activeTab === 'metals' && <MetalSelector />}
        {activeTab === 'gemstones' && <GemstoneSelector />}
        {activeTab === 'setting' && (
          <div className="space-y-6">
            <CaratSlider />
            <RingSizeSelector />
          </div>
        )}
        {activeTab === 'engraving' && (
          <div className="space-y-4">
            <label className="block text-xs font-semibold tracking-wider uppercase text-white/50">
              Personal Laser Engraving (Band Interior)
            </label>
            <input
              type="text"
              maxLength={25}
              placeholder="e.g. Forever & Always"
              value={config.engraving?.text || ''}
              onChange={(e) => setEngravingText(e.target.value)}
              className="w-full py-3 px-3.5 rounded-xl border border-white/15 bg-white/[0.04] text-white text-sm focus:outline-none focus:border-gold transition-all"
            />
            <p className="text-[11px] text-white/40">
              Maximum 25 characters. Precision micro-laser etched along the inner shank curvature ($40.00).
            </p>
          </div>
        )}
      </div>

      {/* Bottom Sticky Pricing & Action Bar */}
      <PricingSummary />
    </aside>
  );
};
