import * as THREE from 'three';

/**
 * Clean-Room Real-Time Optical Diamond Shader
 *
 * Implements physical gemstone optics:
 * 1. Fresnel external specular reflectance (F0 ~ 0.172 for diamond n=2.417)
 * 2. Chromatic spectral dispersion (Cauchy formula splitting R, G, B ray refractions)
 * 3. Total Internal Reflection (TIR) with multi-bounce facet scattering
 * 4. Facet contrast & extinction bands for crisp diamond scintillation
 * 5. Environment map sampling from Three.js scene environment
 */

const DiamondVertexShader = /* glsl */ `
varying vec3 vWorldPosition;
varying vec3 vWorldNormal;
varying vec3 vViewPosition;
varying vec3 vNormal;

void main() {
  vNormal = normal;
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
uniform float facetExtinction; // Dark contrast bands

varying vec3 vWorldPosition;
varying vec3 vWorldNormal;
varying vec3 vViewPosition;
varying vec3 vNormal;

#define PI 3.14159265359

// Converts direction vector to equirectangular UV coordinates
vec2 dirToEquirectUV(vec3 dir) {
  vec3 d = normalize(dir);
  float u = atan(d.z, d.x) / (2.0 * PI) + 0.5;
  float v = asin(clamp(d.y, -1.0, 1.0)) / PI + 0.5;
  return vec2(u, v);
}

// Samples equirectangular environment texture
vec3 sampleEnvironment(vec3 dir) {
  vec2 uv = dirToEquirectUV(dir);
  return texture2D(envMap, uv).rgb * envMapIntensity;
}

void main() {
  vec3 N = normalize(vWorldNormal);
  vec3 V = normalize(vWorldPosition - cameraPosition);

  // 1. Fresnel reflectance (Schlick approximation)
  // For diamond with n=2.417 in air (n1=1.0): F0 = ((2.417-1)/(2.417+1))^2 = 0.1719
  float n1 = 1.0;
  float n2 = refractiveIndex;
  float f0 = pow((n2 - n1) / (n2 + n1), 2.0);
  float cosTheta = clamp(dot(-V, N), 0.0, 1.0);
  float fresnel = f0 + (1.0 - f0) * pow(1.0 - cosTheta, 5.0);

  // 2. Exterior Specular Reflection (Glints & Facet Edges)
  vec3 reflectDir = reflect(V, N);
  vec3 exteriorReflection = sampleEnvironment(reflectDir) * 1.5;

  // 3. Chromatic Dispersion & Refraction (Wavelength Splitting)
  // Red, Green, Blue experience different IORs (Cauchy equation approximation)
  float iorR = n2 - dispersion * 0.8;
  float iorG = n2;
  float iorB = n2 + dispersion * 0.9;

  vec3 refrR = refract(V, N, n1 / iorR);
  vec3 refrG = refract(V, N, n1 / iorG);
  vec3 refrB = refract(V, N, n1 / iorB);

  // Handle Total Internal Reflection fallback
  if (length(refrR) < 0.01) refrR = reflectDir;
  if (length(refrG) < 0.01) refrG = reflectDir;
  if (length(refrB) < 0.01) refrB = reflectDir;

  // 4. Multi-Facet Internal Pavilion Reflection (TIR at ~41 degree facets)
  // Internal rays strike opposing pavilion facets and reflect back up toward the crown
  vec3 pavN1 = normalize(vec3(0.68, -0.73, 0.0));
  vec3 pavN2 = normalize(vec3(-0.68, -0.73, 0.0));
  vec3 pavN3 = normalize(vec3(0.0, -0.73, 0.68));
  vec3 pavN4 = normalize(vec3(0.0, -0.73, -0.68));

  // Determine primary pavilion bounce normal based on ray quadrant
  vec3 pN = (refrG.x > 0.0) ? pavN1 : pavN2;
  if (abs(refrG.z) > abs(refrG.x)) {
    pN = (refrG.z > 0.0) ? pavN3 : pavN4;
  }

  vec3 bounceR = reflect(refrR, pN);
  vec3 bounceG = reflect(refrG, pN);
  vec3 bounceB = reflect(refrB, pN);

  // Secondary internal bounce off opposite pavilion wall
  vec3 bounce2R = reflect(bounceR, -pN);
  vec3 bounce2G = reflect(bounceG, -pN);
  vec3 bounce2B = reflect(bounceB, -pN);

  // Sample environment along refracted and multi-bounced ray directions (normalized weights)
  vec3 colR = sampleEnvironment(refrR) * 0.25 + sampleEnvironment(bounceR) * 0.45 + sampleEnvironment(bounce2R) * 0.30;
  vec3 colG = sampleEnvironment(refrG) * 0.25 + sampleEnvironment(bounceG) * 0.45 + sampleEnvironment(bounce2G) * 0.30;
  vec3 colB = sampleEnvironment(refrB) * 0.25 + sampleEnvironment(bounceB) * 0.45 + sampleEnvironment(bounce2B) * 0.30;

  vec3 internalColor = vec3(colR.r, colG.g, colB.b) * gemColor * boost;

  // 5. Facet Scintillation & Contrast
  // Real diamonds have sharp alternating contrast:
  // Central table facet reflects viewer shadow / extinction zone (~0.45)
  // Angled crown and pavilion facets catch the brilliant studio softbox reflections (~1.35)
  float facetFacing = abs(dot(N, vec3(0.0, 1.0, 0.0)));
  float contrastFactor = mix(1.25, 0.48, pow(facetFacing, 1.4));
  internalColor *= contrastFactor;

  // 6. Combine Specular Exterior with Internal Brilliant Dispersion
  vec3 finalColor = mix(internalColor, exteriorReflection, fresnel * 0.75);

  // Scintillation micro-sparkles along facet edges (at studio key angles)
  float glint = pow(clamp(dot(reflectDir, vec3(0.5, 0.8, -0.3)), 0.0, 1.0), 32.0);
  finalColor += vec3(glint * 0.8);

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
}

export function createDiamondShaderMaterial(options: DiamondShaderOptions = {}): THREE.ShaderMaterial {
  const envMap = options.envMap || null;
  const refractiveIndex = options.refractiveIndex ?? 2.417;
  const dispersion = options.dispersion ?? 0.044;
  const gemColor = options.gemColor ?? new THREE.Color(0xffffff);
  const envMapIntensity = options.envMapIntensity ?? 4.0;
  const boost = options.boost ?? 1.45;

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
      facetExtinction: { value: 0.35 },
    },
    transparent: false,
    depthWrite: true,
    depthTest: true,
    side: THREE.FrontSide,
  });
}
