import React from 'react';
import { RingViewerProps } from '../types/viewer.types';
import { useRingViewer } from '../hooks/useRingViewer';

export const RingViewer: React.FC<RingViewerProps> = ({ state, onToggleFullscreen }) => {
  const {
    containerRef,
    canvasRef,
    isLoading,
    hasInteracted,
    setHasInteracted,
  } = useRingViewer(state);

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden bg-[#ececec] flex-shrink-0 transition-all duration-300 ${
        state.isFullscreen
          ? 'fixed inset-0 z-50 w-screen h-screen'
          : 'h-1/2 md:h-full md:w-[70%]'
      }`}
      onPointerDown={() => setHasInteracted(true)}
    >
      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'none' }}
      />

      {/* Watermark Logo (top-left) */}
      <img
        alt="Watermark"
        src="/assets/logo.png"
        className="absolute top-6 left-6 h-8 z-20 w-auto object-contain pointer-events-none select-none opacity-70"
      />

      {/* Rotational gesture hint hand icon (center bottom) */}
      {!hasInteracted && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-12 pointer-events-none select-none flex flex-col items-center justify-center transition-opacity duration-700">
          <div className="w-10 h-10 flex items-center justify-center opacity-85">
            <svg width="25" height="36" viewBox="0 0 25 36" fill="none">
              <path
                d="M8.733 11.165c.04-1.108.766-2.027 1.743-2.307a2.54 2.54 0 0 1 .628-.089c.16 0 .314.017.463.044 1.088.2 1.9 1.092 1.9 2.16v8.88h1.26c2.943-1.39 5-4.45 5-8.025a9.01 9.01 0 0 0-1.9-5.56l-.43-.5c-.765-.838-1.683-1.522-2.712-2-1.057-.49-2.226-.77-3.46-.77s-2.4.278-3.46.77c-1.03.478-1.947 1.162-2.71 2l-.43.5a9.01 9.01 0 0 0-1.9 5.56 9.04 9.04 0 0 0 .094 1.305c.03.21.088.41.13.617l.136.624c.083.286.196.56.305.832"
                stroke="#4a5568"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="rgba(255, 255, 255, 0.4)"
              />
            </svg>
          </div>
        </div>
      )}

      {/* Loading state indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#ececec]/60 backdrop-blur-sm z-10 pointer-events-none">
          <div className="w-8 h-8 border-2 border-gray-400 border-t-gray-900 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Fullscreen Expand / Exit Toggle Button (bottom-right) */}
      <div className="group absolute bottom-4 right-4 md:bottom-6 md:right-6 z-50">
        <button
          type="button"
          onClick={onToggleFullscreen}
          className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200/50 text-gray-700 hover:text-gray-900 hover:bg-white hover:shadow-md transition-all duration-300"
          aria-label={state.isFullscreen ? 'Exit Full Screen' : 'Open in Full Screen'}
        >
          {state.isFullscreen ? (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7" />
            </svg>
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};
