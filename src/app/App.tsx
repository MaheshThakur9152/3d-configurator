import React, { useState } from 'react';
import { useConfigurator } from '@/features/configurator/hooks/useConfigurator';
import { MainLayout } from '@/components/layout/MainLayout';
import { RingViewer } from '@/features/ring-viewer/components/RingViewer';
import { ConfiguratorSidebar } from '@/features/configurator/components/ConfiguratorSidebar';
import { EnquiryModal } from '@/features/configurator/components/EnquiryModal';
import { ModelInspectorView } from '@/features/model-inspector/components/ModelInspectorView';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'configurator' | 'inspector'>('configurator');
  const { state, updateState, toggleFullscreen } = useConfigurator();

  return (
    <MainLayout
      isFullscreen={state.isFullscreen}
      currentView={currentView}
      onViewChange={setCurrentView}
    >
      {currentView === 'configurator' ? (
        <>
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
        </>
      ) : (
        /* Designer 3D Model Ingestion & Hierarchy Inspector Studio */
        <ModelInspectorView />
      )}
    </MainLayout>
  );
};

export default App;
