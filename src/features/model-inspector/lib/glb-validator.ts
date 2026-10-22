export interface GLBValidationResult {
  valid: boolean;
  error?: string;
  fileSizeMB: number;
  warnings: string[];
}

/**
 * Validates binary glTF (.glb) files before Three.js parsing.
 * Checks file extension, binary magic header (0x46546C67 = 'glTF'), and size constraints.
 */
export async function validateGLBFile(file: File): Promise<GLBValidationResult> {
  const warnings: string[] = [];
  const fileSizeMB = file.size / (1024 * 1024);

  // 1. File extension validation
  const fileName = file.name.toLowerCase();
  if (!fileName.endsWith('.glb')) {
    return {
      valid: false,
      error: `Invalid file format "${file.name}". Please upload a binary glTF (.glb) 3D asset.`,
      fileSizeMB,
      warnings,
    };
  }

  // 2. File size constraints
  if (fileSizeMB > 50) {
    return {
      valid: false,
      error: `File size exceeds the 50 MB limit (${fileSizeMB.toFixed(1)} MB). Please optimize geometry or apply DRACO compression.`,
      fileSizeMB,
      warnings,
    };
  }

  if (fileSizeMB > 20) {
    warnings.push(
      `File size (${fileSizeMB.toFixed(1)} MB) is relatively large for web delivery. Google DRACO compression is recommended.`
    );
  }

  // 3. Binary glTF Magic Byte Header Check (first 4 bytes must be 0x46546C67 = "glTF")
  try {
    const buffer = await file.slice(0, 12).arrayBuffer();
    const dataView = new DataView(buffer);
    const magic = dataView.getUint32(0, true); // Little-endian 'glTF' = 0x46546C67

    if (magic !== 0x46546c67) {
      return {
        valid: false,
        error: 'The uploaded file does not contain a valid binary glTF header.',
        fileSizeMB,
        warnings,
      };
    }

    const version = dataView.getUint32(4, true);
    if (version !== 2) {
      warnings.push(`Detected glTF version ${version}. Version 2.0 is recommended for full PBR compatibility.`);
    }
  } catch (err) {
    return {
      valid: false,
      error: `Failed to inspect file binary header: ${err instanceof Error ? err.message : String(err)}`,
      fileSizeMB,
      warnings,
    };
  }

  return {
    valid: true,
    fileSizeMB,
    warnings,
  };
}
