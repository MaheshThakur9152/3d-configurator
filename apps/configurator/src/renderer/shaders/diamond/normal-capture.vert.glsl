varying vec3 vNormal;
varying vec3 vLocalPosition;
uniform vec3 centroidOffset;

void main() {
    vNormal = normalize(normal);
    vLocalPosition = position - centroidOffset;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(vLocalPosition, 1.0);
}
