import React from 'react';
import { MeshNodeInfo, SemanticMeshRole } from '../types/inspector.types';

interface MeshHierarchyTreeProps {
  nodes: MeshNodeInfo[];
  selectedNodeId?: string;
  onSelectNode: (node: MeshNodeInfo) => void;
  onAssignRole: (nodeId: string, role: SemanticMeshRole) => void;
}

const ROLE_COLORS: Record<SemanticMeshRole, { bg: string; text: string; border: string }> = {
  metal: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  centerGem: { bg: 'bg-cyan-50', text: 'text-cyan-800', border: 'border-cyan-200' },
  sideGem: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
  prongs: { bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-200' },
  band: { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200' },
  accent: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
  unassigned: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' },
};

export const MeshHierarchyTree: React.FC<MeshHierarchyTreeProps> = ({
  nodes,
  selectedNodeId,
  onSelectNode,
  onAssignRole,
}) => {
  if (nodes.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-gray-400 border border-gray-100 rounded-lg">
        No 3D model loaded yet. Upload a GLB above to inspect scene nodes.
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs text-gray-500 font-medium px-1">
        <span>Detected Meshes ({nodes.length})</span>
        <span>Triangles: {nodes.reduce((acc, n) => acc + n.triangleCount, 0).toLocaleString()}</span>
      </div>

      <div className="flex flex-col gap-1.5 max-h-[320px] overflow-y-auto custom-scrollbar pr-1">
        {nodes.map((node) => {
          const isSelected = node.id === selectedNodeId;
          const roleBadge = ROLE_COLORS[node.assignedRole];

          return (
            <div
              key={node.id}
              onClick={() => onSelectNode(node)}
              className={`p-2.5 rounded-lg border transition-all duration-150 flex flex-col gap-1.5 cursor-pointer ${
                isSelected
                  ? 'border-gray-900 bg-gray-50 shadow-xs'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-medium text-gray-900 truncate">
                  {node.name || `[Mesh ${node.id}]`}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${roleBadge.bg} ${roleBadge.text} ${roleBadge.border}`}
                >
                  {node.assignedRole}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-gray-500">
                <span>Mat: {node.materialName || 'Default'}</span>
                <span>{node.triangleCount.toLocaleString()} tris</span>
              </div>

              {/* Quick role changer buttons when selected */}
              {isSelected && (
                <div className="mt-2 pt-2 border-t border-gray-200/60 flex flex-wrap gap-1">
                  {(['metal', 'centerGem', 'sideGem', 'prongs', 'unassigned'] as SemanticMeshRole[]).map(
                    (role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAssignRole(node.id, role);
                        }}
                        className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                          node.assignedRole === role
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        {role}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
