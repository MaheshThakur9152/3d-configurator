import React from 'react';
import { useConfigurator } from '@/features/configurator/hooks/useConfigurator';
import { MainLayout } from '@/components/layout/MainLayout';
import { RingViewer } from '@/features/ring-viewer/components/RingViewer';
import { ConfiguratorSidebar } from '@/features/configurator/components/ConfiguratorSidebar';
import { EnquiryModal } from '@/features/configurator/components/EnquiryModal';

export const App: React.FC = () => {
  const { state, updateState, toggleFullscreen } = useConfigurator();

  return (
    <MainLayout isFullscreen={state.isFullscreen}>
      {/* Interactive 3D WebGL Ring Viewport */}
      <RingViewer state={state} onToggleFullscreen={toggleFullscreen} />

      {/* Configurator Controls Sidebar */}
      {!state.isFullscreen && (
        <ConfiguratorSidebar
          state={state}
          updateState={updateState}
          onOpenEnquiry={() => updateState({ isEnquiryOpen: true })}
        />
      )}

      {/* Enquiry Form Modal */}
      <EnquiryModal
        isOpen={state.isEnquiryOpen}
        onClose={() => updateState({ isEnquiryOpen: false })}
      />
    </MainLayout>
  );
};

export default App;
