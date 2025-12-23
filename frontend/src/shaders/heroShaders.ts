// Hero Background Shaders - Original 4-Iteration Version (High Detail)

export const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

export const fragmentShader = `
  precision highp float;
  varying vec2 vUv;
  uniform float u_time;
  uniform vec3 u_resolution;

  vec2 toPolar(vec2 p) {
    return vec2(length(p), atan(p.y, p.x));
  }

  void main() {
    vec2 p = 6.0 * ((vUv * u_resolution.xy - 0.5 * u_resolution.xy) / u_resolution.y);
    vec2 polar = toPolar(p);
    float r = polar.x;
    
    vec2 i = p;
    float c = 0.0;
    float rot = r + u_time * 0.2 + p.x * 0.1;
    
    // ✅ Back to original 4 iterations for the rich visual look
    for (float n = 0.0; n < 4.0; n++) {
      float rr = r + 0.15 * sin(u_time * 0.5 + n + r * 1.5);
      p *= mat2(cos(rot - sin(u_time / 15.0)), sin(rot), -sin(cos(rot) - u_time / 15.0), cos(rot)) * -0.25;
      float t = r - u_time / (n + 25.0);
      i -= p + sin(t - i.y) + rr;
      c += 2.5 / length(vec2(sin(i.x + t) / 0.15, cos(i.y + t) / 0.15));
    }
    
    c /= 8.0; // Original divisor
    
    vec3 color1 = vec3(0.02, 0.12, 0.08);
    vec3 color2 = vec3(0.04, 0.28, 0.18);
    vec3 color3 = vec3(0.08, 0.42, 0.30);
    
    vec3 finalColor = mix(color1, color2, sin(u_time * 0.3) * 0.5 + 0.5);
    finalColor = mix(finalColor, color3, c * 0.35);
    finalColor *= smoothstep(0.0, 1.0, c * 0.6);
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;
