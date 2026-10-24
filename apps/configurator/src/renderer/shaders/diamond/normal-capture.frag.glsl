varying vec3 vNormal;
varying vec3 vLocalPosition;
uniform float boundingRadius;

void main() {
    // Normal vector normalized & mapped from [-1, 1] to [0, 1]
    vec3 packedNormal = normalize(vNormal) * 0.5 + 0.5;
    // Alpha stores normalized radial distance from centroid to facet surface
    float radialDistance = length(vLocalPosition) / max(boundingRadius, 0.0001);
    
    gl_FragColor = vec4(packedNormal, radialDistance);
}
