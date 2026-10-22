import React from 'react';
import { useModelInspector } from '../hooks/useModelInspector';
import { ModelUploadZone } from './ModelUploadZone';
import { MeshHierarchyTree } from './MeshHierarchyTree';
import { ProductCategory } from '../types/inspector.types';

export const ModelInspectorView: React.FC = () => {
  const {
    canvasRef,
    containerRef,
    isLoading,
    activeFileName,
    meshNodes,
    selectedNodeId,
    category,
    setCategory,
    productTitle,
    setProductTitle,
    previewMetalId,
    setPreviewMetalId,
    loadUploadedGLB,
    assignRole,
    selectNode,
    exportProductManifest,
  } = useModelInspector();

  return (
    <div className="w-full h-full flex flex-col md:flex-row overflow-hidden bg-white">
      {/* 3D Auto-Framed Interactive Viewport (70% desktop) */}
      <div
        ref={containerRef}
        className="relative w-full md:w-[68%] h-1/2 md:h-full overflow-hidden bg-[#d4d4d4] flex-shrink-0"
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing"
          style={{ touchAction: 'none' }}
        />

        {/* Viewport Overlay Controls */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
          <span className="px-2.5 py-1 bg-black/75 text-white text-[11px] font-semibold tracking-wider uppercase rounded backdrop-blur-xs">
            Model Inspector Studio
          </span>
          {activeFileName && (
            <span className="px-2.5 py-1 bg-white/90 text-gray-800 text-[11px] font-mono rounded shadow-xs border border-gray-200">
              {activeFileName}
            </span>
          )}
        </div>

        {/* Live Preview Metal Swatches in Viewport */}
        {meshNodes.length > 0 && (
          <div className="absolute bottom-6 left-6 z-20 bg-white/90 backdrop-blur-sm p-2 rounded-xl shadow-md border border-gray-200/80 flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 pl-1">
              Preview Metal:
            </span>
            <button
              type="button"
              onClick={() => setPreviewMetalId('white_gold')}
              className={`w-6 h-6 rounded-full border-2 transition-transform ${
                previewMetalId === 'white_gold' ? 'border-gray-900 scale-110 shadow-xs' : 'border-gray-300'
              }`}
              style={{ backgroundColor: '#e5e7ea' }}
              title="White Gold"
            />
            <button
              type="button"
              onClick={() => setPreviewMetalId('yellow_gold')}
              className={`w-6 h-6 rounded-full border-2 transition-transform ${
                previewMetalId === 'yellow_gold' ? 'border-gray-900 scale-110 shadow-xs' : 'border-gray-300'
              }`}
              style={{ backgroundColor: '#f4ce6a' }}
              title="Yellow Gold"
            />
            <button
              type="button"
              onClick={() => setPreviewMetalId('rose_gold')}
              className={`w-6 h-6 rounded-full border-2 transition-transform ${
                previewMetalId === 'rose_gold' ? 'border-gray-900 scale-110 shadow-xs' : 'border-gray-300'
              }`}
              style={{ backgroundColor: '#e89a82' }}
              title="Rose Gold"
            />
          </div>
        )}
      </div>

      {/* Right Control Sidebar (32% desktop) */}
      <aside className="w-full md:w-[32%] h-1/2 md:h-full bg-white border-t md:border-t-0 md:border-l border-gray-200 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 flex flex-col gap-5">
          {/* Header */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              Ingest & Map 3D Model
            </h2>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Upload any CAD jewelry asset (.glb). Inspect scene nodes, assign semantic roles for metals and gemstones, and configure product capabilities.
            </p>
          </div>

          {/* Upload Zone */}
          <ModelUploadZone
            onFileLoaded={loadUploadedGLB}
            isLoading={isLoading}
            activeFileName={activeFileName}
          />

          {/* Product Category & Title Settings */}
          {meshNodes.length > 0 && (
            <div className="flex flex-col gap-3 pt-2 border-t border-gray-100">
              <label className="text-xs font-semibold text-gray-700">Product Title</label>
              <input
                type="text"
                value={productTitle}
                onChange={(e) => setProductTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-hidden focus:border-gray-900"
              />

              <label className="text-xs font-semibold text-gray-700">Jewelry Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-hidden focus:border-gray-900 bg-white"
              >
                <option value="ring">Engagement Ring</option>
                <option value="eternity_band">Eternity Band</option>
                <option value="necklace">Necklace / Pendant</option>
                <option value="earrings">Earrings</option>
                <option value="bracelet">Bracelet</option>
                <option value="custom">Custom Catalogue Item</option>
              </select>
            </div>
          )}

          {/* Mesh Hierarchy Inspector */}
          <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
              Semantic Role Mapping
            </h4>
            <p className="text-[11px] text-gray-500">
              Click a mesh below to assign whether it renders as a precious metal, diamond, or accent stone.
            </p>

            <MeshHierarchyTree
              nodes={meshNodes}
              selectedNodeId={selectedNodeId}
              onSelectNode={selectNode}
              onAssignRole={assignRole}
            />
          </div>
        </div>

        {/* Bottom Publish & Export CTA */}
        {meshNodes.length > 0 && (
          <div className="p-4 md:p-6 bg-white border-t border-gray-100 flex-shrink-0">
            <button
              type="button"
              onClick={exportProductManifest}
              className="w-full py-3 bg-gray-900 hover:bg-black text-white text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Export Product Manifest JSON</span>
            </button>
          </div>
        )}
      </aside>
    </div>
  );
};
