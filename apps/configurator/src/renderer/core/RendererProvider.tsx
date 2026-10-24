import React, { createContext, useContext, useEffect, useState } from 'react';
import { QualityManager, QualityProfile } from './QualityManager.js';

interface RendererContextValue {
  isContextLost: boolean;
  quality: QualityProfile;
}

const RendererContext = createContext<RendererContextValue>({
  isContextLost: false,
  quality: QualityManager.getProfile()
});

export const useRenderer = () => useContext(RendererContext);

export const RendererProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isContextLost, setIsContextLost] = useState(false);
  const [quality] = useState<QualityProfile>(QualityManager.getProfile());

  useEffect(() => {
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      console.warn('[3D Configurator] WebGL context lost. Pausing GPU operations.');
      setIsContextLost(true);
    };

    const handleContextRestored = () => {
      console.info('[3D Configurator] WebGL context restored. Re-mounting scene graph.');
      setIsContextLost(false);
    };

    window.addEventListener('webglcontextlost', handleContextLost, false);
    window.addEventListener('webglcontextrestored', handleContextRestored, false);

    return () => {
      window.removeEventListener('webglcontextlost', handleContextLost);
      window.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, []);

  return (
    <RendererContext.Provider value={{ isContextLost, quality }}>
      {children}
    </RendererContext.Provider>
  );
};
