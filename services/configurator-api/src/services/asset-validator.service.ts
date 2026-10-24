export interface GlbValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  metadata: {
    byteLength: number;
    generator?: string;
    nodeCount: number;
    meshCount: number;
    materialCount: number;
    detectedNodeNames: string[];
    suggestedMappings: Record<string, string>;
  };
}

export class AssetValidatorService {
  private static MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB limit

  public static validate(buffer: Buffer): GlbValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (buffer.length < 20) {
      return {
        isValid: false,
        errors: ['File is smaller than minimal 20-byte glTF binary header'],
        warnings: [],
        metadata: { byteLength: buffer.length, nodeCount: 0, meshCount: 0, materialCount: 0, detectedNodeNames: [], suggestedMappings: {} }
      };
    }

    if (buffer.length > this.MAX_FILE_SIZE_BYTES) {
      errors.push(`File size (${(buffer.length / 1024 / 1024).toFixed(1)}MB) exceeds maximum 25MB threshold`);
    }

    // Read GLB Header: magic (4 bytes), version (uint32), length (uint32)
    const magic = buffer.toString('ascii', 0, 4);
    if (magic !== 'glTF') {
      errors.push(`Invalid magic bytes '${magic}'. Expected 'glTF' (0x46546C67).`);
      return {
        isValid: false,
        errors,
        warnings,
        metadata: { byteLength: buffer.length, nodeCount: 0, meshCount: 0, materialCount: 0, detectedNodeNames: [], suggestedMappings: {} }
      };
    }

    const version = buffer.readUInt32LE(4);
    if (version !== 2) {
      errors.push(`Unsupported glTF version ${version}. Only glTF 2.0 is supported.`);
    }

    // Read Chunk 0: length (uint32), type (uint32)
    const chunk0Length = buffer.readUInt32LE(12);
    const chunk0Type = buffer.toString('ascii', 16, 20);

    if (chunk0Type !== 'JSON') {
      errors.push(`Expected first chunk to be 'JSON', received '${chunk0Type}'`);
      return {
        isValid: false,
        errors,
        warnings,
        metadata: { byteLength: buffer.length, nodeCount: 0, meshCount: 0, materialCount: 0, detectedNodeNames: [], suggestedMappings: {} }
      };
    }

    let gltfJson: any = {};
    try {
      const jsonString = buffer.toString('utf-8', 20, 20 + chunk0Length);
      gltfJson = JSON.parse(jsonString);
    } catch (e: any) {
      errors.push(`Failed to parse glTF JSON chunk: ${e.message}`);
      return {
        isValid: false,
        errors,
        warnings,
        metadata: { byteLength: buffer.length, nodeCount: 0, meshCount: 0, materialCount: 0, detectedNodeNames: [], suggestedMappings: {} }
      };
    }

    // Audit structure
    const nodes = gltfJson.nodes || [];
    const meshes = gltfJson.meshes || [];
    const materials = gltfJson.materials || [];
    const images = gltfJson.images || [];

    // Security check: Reject external image URIs (HTTP/HTTPS)
    for (let i = 0; i < images.length; i++) {
      const uri = images[i].uri;
      if (uri && (uri.startsWith('http://') || uri.startsWith('https://'))) {
        errors.push(`External image URI '${uri}' prohibited. All textures must be embedded in GLB buffers.`);
      }
    }

    const detectedNodeNames: string[] = nodes.map((n: any, idx: number) => n.name || `Node_${idx}`);
    const suggestedMappings: Record<string, string> = {};

    // Semantic node detection heuristics
    for (const name of detectedNodeNames) {
      const lower = name.toLowerCase();
      if (lower.includes('shank') || lower.includes('band') || lower.includes('gold') || lower.includes('ring')) {
        suggestedMappings['Shank'] = name;
      } else if (lower.includes('setting') || lower.includes('head') || lower.includes('basket') || lower.includes('entourage')) {
        suggestedMappings['Setting'] = name;
      } else if (lower.includes('prong') || lower.includes('claw')) {
        suggestedMappings['Prongs'] = name;
      } else if (lower.includes('diamond') || lower.includes('stone') || lower.includes('gem') || lower.includes('center')) {
        if (!suggestedMappings['CenterStone']) {
          suggestedMappings['CenterStone'] = name;
        }
      }
    }

    if (!suggestedMappings['Shank']) {
      warnings.push("No obvious 'Shank' or band node detected by heuristics. Manual component mapping required.");
    }
    if (!suggestedMappings['CenterStone']) {
      warnings.push("No obvious 'CenterStone' diamond node detected by heuristics. Manual component mapping required.");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      metadata: {
        byteLength: buffer.length,
        generator: gltfJson.asset?.generator,
        nodeCount: nodes.length,
        meshCount: meshes.length,
        materialCount: materials.length,
        detectedNodeNames,
        suggestedMappings
      }
    };
  }
}
