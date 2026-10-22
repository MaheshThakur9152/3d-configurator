import * as THREE from 'three';

/**
 * Clean-Room Real-Time Optical Diamond Shader (Artistic TIR Approximation)
 *
 * Implements real-time gemstone optical heuristics:
 * 1. Screen-space derivatives (dFdx/dFdy) for razor-sharp, planar facet normal boundaries
 * 2. Fresnel external specular reflectance (Schlick approximation with F0 ~ 0.172 for diamond n=2.417)
 * 3. Chromatic spectral dispersion (Cauchy formula splitting R, G, B ray refractions)
 * 4. Directional Total Internal Reflection (TIR) approximation:
 *    Uses 41-degree inward pavilion facet normals opposing incoming refracted rays,
 *    reflecting light upward through the table and crown toward the viewer.
 * 5. Facet extinction contrast uniform (facetExtinction) for crisp scintillation
 * 6. Direct specular key-light glints and dynamic environment map sampling
 */

const DiamondVertexShader = /* glsl */ `
varying vec3 vWorldPosition;
varying vec3 vWorldNormal;
varying vec3 vViewPosition;

void main() {
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPos.xyz;
  vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
  vec4 mvPosition = viewMatrix * worldPos;
  vViewPosition = -mvPosition.xyz;
  gl_Position = projectionMatrix * mvPosition;
}
`;

const DiamondFragmentShader = /* glsl */ `
uniform sampler2D envMap;
uniform float envMapIntensity;
uniform float refractiveIndex; // 2.417 for diamond
uniform float dispersion;      // 0.044
uniform vec3 gemColor;         // Base tint (pure white for diamond)
uniform float boost;           // Scintillation boost factor
uniform float facetExtinction; // Dark contrast bands (0.35)
uniform vec3 keyLightDir;      // Normalized studio key light direction

varying vec3 vWorldPosition;
varying vec3 vWorldNormal;
varying vec3 vViewPosition;

#define PI 3.14159265359

// Converts direction vector to equirectangular UV coordinates matching Three.js convention
vec2 dirToEquirectUV(vec3 dir) {
  vec3 d = normalize(dir);
  float u = atan(d.x, -d.z) / (2.0 * PI) + 0.5;
  float v = asin(clamp(d.y, -1.0, 1.0)) / PI + 0.5;
  return vec2(u, v);
}

// Samples equirectangular environment texture
vec3 sampleEnvironment(vec3 dir) {
  vec2 uv = dirToEquirectUV(dir);
  return texture2D(envMap, uv).rgb * envMapIntensity;
}

void main() {
  // Screen-space derivatives compute true geometric planar facet normal
  // Eliminates smoothed vertex normal washing and produces crisp facet boundaries
  vec3 dX = dFdx(vWorldPosition);
  vec3 dY = dFdy(vWorldPosition);
  vec3 crossNorm = cross(dX, dY);
  vec3 facetNormal = length(crossNorm) > 0.00001 ? normalize(crossNorm) : normalize(vWorldNormal);

  vec3 V = normalize(vWorldPosition - cameraPosition);
  // Ensure facet normal points toward the viewer
  vec3 N = dot(facetNormal, V) < 0.0 ? facetNormal : -facetNormal;

  // 1. Fresnel external specular reflectance (Schlick approximation)
  // For diamond with n=2.417 in air (n1=1.0): F0 = ((2.417-1)/(2.417+1))^2 = 0.1719
  float n1 = 1.0;
  float n2 = refractiveIndex;
  float f0 = pow((n2 - n1) / (n2 + n1), 2.0);
  float cosTheta = clamp(dot(-V, N), 0.0, 1.0);
  float fresnel = f0 + (1.0 - f0) * pow(1.0 - cosTheta, 5.0);

  // 2. Exterior Specular Reflection from Studio Environment
  vec3 reflectDir = reflect(V, N);
  vec3 exteriorReflection = sampleEnvironment(reflectDir) * 1.5;

  // Direct specular glint from studio key light (tracks camera orbit dynamically)
  vec3 H = normalize(-V + keyLightDir);
  float NdotH = max(dot(N, H), 0.0);
  float directGlint = pow(NdotH, 96.0) * 2.2;
  exteriorReflection += vec3(directGlint);

  // 3. Chromatic Dispersion & Refraction (Cauchy wavelength splitting)
  float iorR = n2 - dispersion * 1.0;
  float iorG = n2;
  float iorB = n2 + dispersion * 1.0;

  vec3 refrR = refract(V, N, n1 / iorR);
  vec3 refrG = refract(V, N, n1 / iorG);
  vec3 refrB = refract(V, N, n1 / iorB);

  // Fallback to reflection if total internal reflection occurs at exterior boundary
  if (length(refrR) < 0.01) refrR = reflectDir;
  if (length(refrG) < 0.01) refrG = reflectDir;
  if (length(refrB) < 0.01) refrB = reflectDir;

  // 4. Multi-Facet Inward Pavilion Reflection (TIR at ~41 degree internal facets)
  // Downward-traveling internal rays strike inward-sloping pavilion walls (ny = +0.73)
  // opposing the lateral direction of the ray to bounce across and upward
  vec3 pavN_posx = normalize(vec3(-0.68, 0.73, 0.0));
  vec3 pavN_negx = normalize(vec3(0.68, 0.73, 0.0));
  vec3 pavN_posz = normalize(vec3(0.0, 0.73, -0.68));
  vec3 pavN_negz = normalize(vec3(0.0, 0.73, 0.68));

  vec3 pN = (refrG.x > 0.0) ? pavN_posx : pavN_negx;
  if (abs(refrG.z) > abs(refrG.x)) {
    pN = (refrG.z > 0.0) ? pavN_posz : pavN_negz;
  }

  // First internal bounce off pavilion wall
  vec3 bounceR = reflect(refrR, pN);
  vec3 bounceG = reflect(refrG, pN);
  vec3 bounceB = reflect(refrB, pN);

  // Second internal bounce off opposing pavilion wall (reflects upward toward crown/viewer)
  vec3 pN_opp = -pN;
  pN_opp.y = abs(pN.y);
  vec3 bounce2R = reflect(bounceR, pN_opp);
  vec3 bounce2G = reflect(bounceG, pN_opp);
  vec3 bounce2B = reflect(bounceB, pN_opp);

  // Sample environment along multi-bounce ray directions
  vec3 colR = sampleEnvironment(refrR) * 0.20 + sampleEnvironment(bounceR) * 0.45 + sampleEnvironment(bounce2R) * 0.35;
  vec3 colG = sampleEnvironment(refrG) * 0.20 + sampleEnvironment(bounceG) * 0.45 + sampleEnvironment(bounce2G) * 0.35;
  vec3 colB = sampleEnvironment(refrB) * 0.20 + sampleEnvironment(bounceB) * 0.45 + sampleEnvironment(bounce2B) * 0.35;

  vec3 internalColor = vec3(colR.r, colG.g, colB.b) * gemColor * boost;

  // 5. Facet Extinction Contrast
  // Directly facing facets experience viewer head occlusion (extinction)
  // Angled crown and bezel facets catch high-intensity studio softbox highlights
  float facetFacing = abs(dot(N, vec3(0.0, 1.0, 0.0)));
  float contrastFactor = mix(1.35, facetExtinction, pow(facetFacing, 1.5));
  internalColor *= contrastFactor;

  // 6. Combine Specular Exterior with Internal Brilliant Dispersion
  vec3 finalColor = mix(internalColor, exteriorReflection, fresnel * 0.70);

  gl_FragColor = vec4(finalColor, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export interface DiamondShaderOptions {
  envMap?: THREE.Texture | null;
  refractiveIndex?: number;
  dispersion?: number;
  gemColor?: THREE.Color;
  envMapIntensity?: number;
  boost?: number;
  facetExtinction?: number;
  keyLightDir?: THREE.Vector3;
}

export function createDiamondShaderMaterial(options: DiamondShaderOptions = {}): THREE.ShaderMaterial {
  const envMap = options.envMap || null;
  const refractiveIndex = options.refractiveIndex ?? 2.417;
  const dispersion = options.dispersion ?? 0.044;
  const gemColor = options.gemColor ?? new THREE.Color(0xffffff);
  const envMapIntensity = options.envMapIntensity ?? 4.0;
  const boost = options.boost ?? 1.45;
  const facetExtinction = options.facetExtinction ?? 0.35;
  const keyLightDir = options.keyLightDir ?? new THREE.Vector3(0.0, 0.894, -0.447).normalize();

  return new THREE.ShaderMaterial({
    name: 'DiamondShaderMaterial',
    vertexShader: DiamondVertexShader,
    fragmentShader: DiamondFragmentShader,
    uniforms: {
      envMap: { value: envMap },
      envMapIntensity: { value: envMapIntensity },
      refractiveIndex: { value: refractiveIndex },
      dispersion: { value: dispersion },
      gemColor: { value: gemColor },
      boost: { value: boost },
      facetExtinction: { value: facetExtinction },
      keyLightDir: { value: keyLightDir },
    },
    transparent: false,
    depthWrite: true,
    depthTest: true,
    side: THREE.FrontSide,
  });
}
