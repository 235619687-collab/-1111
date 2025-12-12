import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ShapeType } from '../types';
import { generateParticles } from '../utils/geometry';

interface ParticleSystemProps {
  shape: ShapeType;
  color: string;
  handDistance: number;
  isHandActive: boolean;
}

const COUNT = 6000;

const ParticleSystem: React.FC<ParticleSystemProps> = ({ shape, color, handDistance, isHandActive }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Current positions of particles
  const particles = useMemo(() => {
    return new Float32Array(COUNT * 3);
  }, []);

  // Target positions based on shape
  const targetPositions = useMemo(() => {
    return generateParticles(shape, COUNT);
  }, [shape]);

  // Initial random positions
  useEffect(() => {
    const initial = generateParticles(ShapeType.SPHERE, COUNT);
    particles.set(initial);
  }, []); // Run once

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();
    const lerpSpeed = 0.05;
    
    // Determine expansion factor based on hands
    // If hands active: use handDistance. If not: breathe automatically.
    const expansion = isHandActive 
        ? 1 + handDistance * 2.5 // Hands apart -> Explode up to 3.5x
        : 1 + Math.sin(time) * 0.1; // Idle breathing

    // Color handling
    const colorObj = new THREE.Color(color);

    for (let i = 0; i < COUNT; i++) {
      const idx = i * 3;

      // 1. Move current position towards target position
      // We do a "soft" lerp on the CPU for the simulation, then render via matrix
      const tx = targetPositions[idx];
      const ty = targetPositions[idx + 1];
      const tz = targetPositions[idx + 2];

      // Current pos
      let cx = particles[idx];
      let cy = particles[idx + 1];
      let cz = particles[idx + 2];

      // Lerp logic
      cx += (tx - cx) * lerpSpeed;
      cy += (ty - cy) * lerpSpeed;
      cz += (tz - cz) * lerpSpeed;

      // Update state
      particles[idx] = cx;
      particles[idx + 1] = cy;
      particles[idx + 2] = cz;

      // 2. Apply expansion and rotation for rendering
      // Add some noise/drift
      const drift = Math.sin(time * 0.5 + i) * 0.02;

      dummy.position.set(
        cx * expansion + drift,
        cy * expansion + drift,
        cz * expansion + drift
      );

      // Rotate entire system slowly or specific particles
      // Let's rotate the particle in place to sparkle
      dummy.rotation.set(time * 0.1, time * 0.1, 0);
      
      const scale = isHandActive ? 0.03 : 0.02 + Math.sin(time * 2 + i)*0.005;
      dummy.scale.set(scale, scale, scale);

      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
      
      // Update color (InstancedMesh supports instanceColor if material vertexColors is true)
      // To save perf, we usually just change material color, but for rainbow effects we'd do it here.
      // For this requirement, a single global color is fine, but let's add variation.
      meshRef.current.setColorAt(i, colorObj);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    
    // Rotate the whole group slowly
    meshRef.current.rotation.y = time * 0.1;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
      <dodecahedronGeometry args={[0.2, 0]} />
      <meshStandardMaterial 
        color={color} 
        toneMapped={false} 
        emissive={color} 
        emissiveIntensity={0.5}
        roughness={0.1}
        metalness={0.8}
      />
    </instancedMesh>
  );
};

export default ParticleSystem;