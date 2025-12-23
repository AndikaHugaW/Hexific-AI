"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/* ============================================
   SHADERS (INLINED FOR STABILITY)
============================================ */
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;
  varying vec2 vUv;
  uniform float u_time;
  uniform vec2 u_resolution;

  vec2 toPolar(vec2 p) {
    return vec2(length(p), atan(p.y, p.x));
  }

  void main() {
    // Normalisasi koordinat
    vec2 p = 6.0 * (vUv - 0.5);
    p.x *= u_resolution.x / u_resolution.y;
    
    vec2 polar = toPolar(p);
    float r = polar.x;
    
    vec2 i = p;
    float c = 0.0;
    float rot = r + u_time * 0.2 + p.x * 0.1;
    
    for (float n = 0.0; n < 4.0; n++) {
      float rr = r + 0.15 * sin(u_time * 0.5 + n + r * 1.5);
      float s = sin(rot - sin(u_time / 15.0));
      float co = cos(rot);
      p *= mat2(co, s, -s, co) * -0.25;
      float t = r - u_time / (n + 25.0);
      i -= p + sin(t - i.y) + rr;
      c += 2.5 / length(vec2(sin(i.x + t) / 0.15, cos(i.y + t) / 0.15));
    }
    
    c /= 12.0; // Much darker base
    
    // BLACK DOMINANT with subtle green accents
    vec3 baseBlack = vec3(0.01, 0.02, 0.015);  // Almost pure black
    vec3 darkGreen = vec3(0.02, 0.12, 0.06);   // Very dark green
    vec3 accentGreen = vec3(0.06, 0.45, 0.25); // Subtle emerald accent
    
    // Mix colors - keep mostly black
    vec3 finalColor = mix(baseBlack, darkGreen, c * 0.5);
    finalColor = mix(finalColor, accentGreen, pow(c, 2.0) * 0.6); // Only bright spots get green
    
    // Reduce overall brightness
    finalColor *= smoothstep(0.0, 0.8, c * 1.2);
    
    // Subtle green glow in very bright areas only
    finalColor += accentGreen * pow(c, 3.0) * 0.3;
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

/* ============================================
   SHADER PLANE COMPONENT
============================================ */
function ShaderPlane() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  const uniforms = useMemo(() => ({
    u_time: { value: 0 },
    u_resolution: { value: new THREE.Vector2(size.width, size.height) },
  }), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const material = meshRef.current.material as THREE.ShaderMaterial;
    material.uniforms.u_time.value = state.clock.elapsedTime * 0.4;
    material.uniforms.u_resolution.value.set(size.width, size.height);
  });

  return (
    <mesh ref={meshRef} frustumCulled={false}>
      <planeGeometry args={[5, 5]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  );
}

/* ============================================
   HERO CANVAS
============================================ */
export default function HeroCanvas() {
  return (
    <Canvas 
      camera={{ position: [0, 0, 1], fov: 75 }}
      dpr={[1, 1.5]}
      gl={{ 
        antialias: true,
        powerPreference: "high-performance",
        alpha: true 
      }}
      style={{ 
        position: 'absolute', 
        inset: 0,
        background: 'transparent'
      }}
    >
      <ShaderPlane />
    </Canvas>
  );
}
