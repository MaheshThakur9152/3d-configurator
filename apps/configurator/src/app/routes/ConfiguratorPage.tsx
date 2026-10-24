import React from 'react';
import { ViewerCanvas } from '../../features/product-viewer/ViewerCanvas.js';
import { ConfiguratorUI } from '../../features/configurator/ConfiguratorUI.js';

export const ConfiguratorPage: React.FC = () => {
  return (
    <main className="relative w-screen h-screen flex flex-col lg:flex-row overflow-hidden bg-[#121216]">
      {/* 3D WebGL Canvas Viewport */}
      <section className="flex-1 h-[55vh] lg:h-full relative">
        <ViewerCanvas />
      </section>

      {/* Product Customizer Controls Sidebar */}
      <section className="h-[45vh] lg:h-full flex-shrink-0">
        <ConfiguratorUI />
      </section>
    </main>
  );
};
