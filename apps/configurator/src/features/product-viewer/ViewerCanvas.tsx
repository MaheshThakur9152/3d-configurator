import React, { Suspense, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { LightingRig } from './LightingRig.js';
import { ModelRenderer } from './ModelRenderer.js';
import { useConfiguratorStore } from '../../store/useConfiguratorStore.js';
import { IframeMessenger } from '../../messenger/IframeMessenger.js';
import { QualityManager } from '../../renderer/core/QualityManager.js';
import { Loader2 } from 'lucide-react';

export const ViewerCanvas: React.FC = () => {
  const { config } = useConfiguratorStore();
  const quality = QualityManager.getProfile();
  const controlsRef = useRef<any>(null);

  const modelUrl = config.modelId.includes('halo')
    ? '/models/ring2_webgi.glb'
    : '/models/ring_webgi.glb';

  useEffect(() => {
    IframeMessenger.notifyViewerReady(config.productId, config.modelId);
  }, [config.productId, config.modelId]);

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-[#18181F] via-[#121217] to-[#0A0A0E] overflow-hidden">
      <Canvas
        camera={{ position: [0, 1.2, 5.5], fov: 38 }}
        dpr={[1, quality.maxDpr]}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          preserveDrawingBuffer: true
        }}
        shadows
        className="w-full h-full"
      >
        <Suspense fallback={null}>
          <LightingRig />
          <ModelRenderer modelUrl={modelUrl} />
          <OrbitControls
            ref={controlsRef}
            enableDamping
            dampingFactor={0.05}
            minDistance={3.0}
            maxDistance={10.0}
            maxPolarAngle={Math.PI / 2 + 0.15} // Prevent camera going below ground
            rotateSpeed={0.8}
            zoomSpeed={1.0}
          />
        </Suspense>
      </Canvas>

      {/* Loading Overlay */}
      <Suspense
        fallback={
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#121216]/80 backdrop-blur-sm z-30">
            <Loader2 className="w-10 h-10 text-gold animate-spin mb-3" />
            <p className="text-sm font-medium tracking-widest uppercase text-white/70">
              Loading 3D Jewellery Model...
            </p>
          </div>
        }
      >
        <div style={{ display: 'none' }}></div>
      </Suspense>
    </div>
  );
};
