import React, { useEffect, useState } from 'react';
import { useConfiguratorStore } from '../../store/useConfiguratorStore.js';
import { IframeMessenger } from '../../messenger/IframeMessenger.js';
import { ShoppingBag, Share2, RotateCcw, Check } from 'lucide-react';

export const PricingSummary: React.FC = () => {
  const { config, estimatedPriceUSD, setEstimatedPrice, resetDefaults } = useConfiguratorStore();
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Authoritative price calculation from backend
  useEffect(() => {
    let isCancelled = false;

    async function fetchAuthoritativePrice() {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
        const res = await fetch(`${apiUrl}/api/configurator/pricing/calculate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: config.productId,
            metalType: config.metalType,
            metalFinish: config.metalFinish,
            stoneShape: config.stoneShape,
            caratWeight: config.caratWeight,
            headStyle: config.headStyle,
            engravingText: config.engraving?.text
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (!isCancelled && data.subtotal) {
            setEstimatedPrice(data.subtotal);
            IframeMessenger.notifyConfigurationChanged(config, data.subtotal);
          }
        }
      } catch (e) {
        // Fallback local estimation if backend is unreachable
        const base = 850 + (config.caratWeight * 1850);
        setEstimatedPrice(Math.round(base * 100) / 100);
      }
    }

    const timer = setTimeout(fetchAuthoritativePrice, 200);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [config, setEstimatedPrice]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAddToCart = () => {
    setIsSubmitting(true);
    // Request cart addition via postMessage bridge
    IframeMessenger.requestAddToCart(config);
    setTimeout(() => setIsSubmitting(false), 1500);
  };

  return (
    <div className="p-4 border-t border-white/10 bg-[#15151B]/95 backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-white/50 block">
            Authoritative Retail Total
          </span>
          <span className="text-2xl font-serif font-bold text-white tracking-tight">
            ${estimatedPriceUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            title="Share Configuration"
            className="p-2.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/[0.04] text-white/70 hover:text-white transition-all flex items-center gap-1.5 text-xs font-medium"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Share'}</span>
          </button>

          <button
            onClick={resetDefaults}
            title="Reset to Defaults"
            className="p-2.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/[0.04] text-white/70 hover:text-white transition-all text-xs"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <button
        onClick={handleAddToCart}
        disabled={isSubmitting}
        className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#E2BF7F] via-[#F3D79E] to-[#C59B4C] text-[#121216] font-semibold text-xs tracking-wider uppercase shadow-[0_4px_20px_rgba(226,191,127,0.3)] hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <ShoppingBag className="w-4 h-4" />
        {isSubmitting ? 'Adding to Cart...' : 'Add Configured Ring to Cart'}
      </button>
    </div>
  );
};
