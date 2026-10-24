import React, { useEffect } from 'react';
import { RendererProvider } from './renderer/core/RendererProvider.js';
import { ConfiguratorPage } from './app/routes/ConfiguratorPage.js';
import { useConfiguratorStore } from './store/useConfiguratorStore.js';
import { IframeMessenger } from './messenger/IframeMessenger.js';

export const App: React.FC = () => {
  const { loadConfiguration, config } = useConfiguratorStore();

  useEffect(() => {
    // Initialize cross-origin postMessage communication with host storefront
    const cleanup = IframeMessenger.init((incomingPartial) => {
      loadConfiguration({ ...config, ...incomingPartial });
    });
    return cleanup;
  }, [config, loadConfiguration]);

  return (
    <RendererProvider>
      <ConfiguratorPage />
    </RendererProvider>
  );
};
