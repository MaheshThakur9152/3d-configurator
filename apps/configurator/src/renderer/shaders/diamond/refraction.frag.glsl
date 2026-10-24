varying vec3 vWorldPosition;
varying vec3 vWorldNormal;
varying vec2 vUv;

uniform samplerCube envMap;
uniform float envMapIntensity;
uniform float ior;
uniform float dispersion;
uniform vec3 colorTint;
uniform float absorption;
uniform float bounces;
uniform vec3 cameraPosition;

#define PI 3.14159265359

// Schlick Fresnel approximation
float fresnelSchlick(float cosTheta, float F0) {
    return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}

void main() {
    vec3 N = normalize(vWorldNormal);
    vec3 V = normalize(vWorldPosition - cameraPosition);

    // Diamond Fresnel F0 at normal incidence for IOR = 2.42
    float F0 = pow((ior - 1.0) / (ior + 1.0), 2.0); // ~0.172
    float cosTheta = max(dot(-V, N), 0.0);
    float F = fresnelSchlick(cosTheta, F0);

    // Exterior Specular Reflection
    vec3 reflectDir = reflect(V, N);
    vec3 exteriorReflection = textureCube(envMap, reflectDir).rgb * envMapIntensity;

    // Interior Snell Refraction with 3-channel Chromatic Dispersion
    float etaG = 1.0 / ior;
    float etaR = 1.0 / (ior - dispersion);
    float etaB = 1.0 / (ior + dispersion);

    vec3 refractR = refract(V, N, etaR);
    vec3 refractG = refract(V, N, etaG);
    vec3 refractB = refract(V, N, etaB);

    // Sample environment at dispersed angles
    vec3 refractedColor;
    refractedColor.r = textureCube(envMap, refractR).r;
    refractedColor.g = textureCube(envMap, refractG).g;
    refractedColor.b = textureCube(envMap, refractB).b;

    // Apply Beer-Lambert Exponential Absorption Tinting
    refractedColor *= colorTint;

    // Combine Fresnel Reflection and Refracted Fire
    vec3 finalColor = mix(refractedColor * envMapIntensity, exteriorReflection, F);

    gl_FragColor = vec4(finalColor, 1.0);
}
