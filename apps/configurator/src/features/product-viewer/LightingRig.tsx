import React from 'react';
import { Environment, ContactShadows } from '@react-three/drei';

export const LightingRig: React.FC = () => {
  return (
    <>
      {/* Studio HDRI Environment for realistic metal softbox reflections */}
      <Environment preset="city" environmentIntensity={1.2} />

      {/* Main Key Studio Light */}
      <directionalLight
        position={[5, 8, 5]}
        intensity={2.5}
        color="#FFF9F5"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0001}
      />

      {/* Cool Rim Fill Light for Edge Highlights */}
      <directionalLight
        position={[-6, 5, -4]}
        intensity={1.2}
        color="#E6F2FF"
      />

      {/* Subtle Bottom Ground Fill */}
      <directionalLight
        position={[0, -4, 0]}
        intensity={0.6}
        color="#FFFFFF"
      />

      {/* Soft Contact Shadows on Virtual Ground Plane */}
      <ContactShadows
        position={[0, -1.05, 0]}
        opacity={0.65}
        scale={10}
        blur={1.8}
        far={4.0}
        resolution={512}
        color="#0A070B"
      />
    </>
  );
};
