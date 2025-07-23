"use client"
import React, { useRef, useMemo } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const fragmentShader = `
uniform float iTime;
uniform vec2 iResolution;
varying vec2 vUv;

float rand(float x) {
    return fract(sin(x * 23.371) * 43758.5453);
}

float waveDistortion(vec2 dir, float id, float dist) {
    float angle = atan(dir.y, dir.x);
    float wave1 = sin(angle * 6.0 + id * 10.0 + iTime * 2.5) * 0.025;
    float wave2 = sin(angle * 4.0 + id * 7.0 + iTime * 1.8) * 0.018;
    return wave1 + wave2;
}

float stroke(float d, float w) {
    float edge = fwidth(d) * 0.5;
    return smoothstep(w + edge, w - edge, abs(d));
}

void main() {
    vec2 uv = vUv; // UV goes from 0 to 1

vec3 lineColor = vec3(0.976, 0.882, 0.412);

    float t = iTime * 0.4;
    float interval = 1.2;
    float waveSpeed = 0.45;

    float finalLine = 0.0;

    for (int i = 0; i < 5; i++) {
        float waveId = floor(t / interval) - float(i);
        float seed = waveId * 19.73;

        vec2 startPos = vec2(
            -0.1 + rand(seed) * 0.1,
            1.0 + rand(seed + 1.0) * 0.1
        );

        float localTime = t - waveId * interval;

        if (localTime < 0.0 || localTime > interval * 4.0) continue;

        vec2 dir = uv - startPos;
        float dist = length(dir);

        float diagonalBias = dot(normalize(dir), normalize(vec2(1.0, 1.0))) * 0.5 + 0.5;
        float waveRadius = localTime * waveSpeed * (0.8 + diagonalBias * 0.4);

        float distortion = waveDistortion(normalize(dir), waveId, dist);
        float finalRadius = waveRadius + distortion;

        float baseWidth = 0.015 + rand(seed + 2.0) * 0.01;
        float thicknessFactor = smoothstep(0.0, 0.3, localTime / interval);
        float ringWidth = baseWidth * (0.5 + 0.5 * thicknessFactor);
        float ring = stroke(dist - finalRadius, ringWidth);

        float intensity = 0.7 + rand(seed + 3.0) * 0.3;

        finalLine += ring * intensity;
    }

    // Set alpha based on wave presence for transparency
    float alpha = clamp(finalLine, 0.0, 1.0);
    vec3 color = lineColor;

    gl_FragColor = vec4(color, alpha);
}
`

export default function Shader1() {
  const materialRef = useRef()
  const { size } = useThree()

  const uniforms = useMemo(
    () => ({
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector2(size.width, size.height) },
    }),
    [size.width, size.height]
  )

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.iTime.value = clock.elapsedTime
      materialRef.current.uniforms.iResolution.value.set(size.width, size.height)
    }
  })

  return (
    <mesh>
      <planeGeometry args={[window.innerWidth, window.innerHeight]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true} // THIS makes the material respect alpha!
      />
    </mesh>
  )
}
