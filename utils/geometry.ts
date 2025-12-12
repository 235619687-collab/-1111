import * as THREE from 'three';
import { ShapeType } from '../types';

const getRandomPointInSphere = (radius: number) => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;
  const sinPhi = Math.sin(phi);
  return new THREE.Vector3(
    r * sinPhi * Math.cos(theta),
    r * sinPhi * Math.sin(theta),
    r * Math.cos(phi)
  );
};

export const generateParticles = (shape: ShapeType, count: number): Float32Array => {
  const positions = new Float32Array(count * 3);
  const tempVec = new THREE.Vector3();

  for (let i = 0; i < count; i++) {
    let x = 0, y = 0, z = 0;
    const idx = i * 3;
    const ratio = i / count;

    switch (shape) {
      case ShapeType.HEART: {
        // Parametric heart
        const t = ratio * Math.PI * 2; // This creates a line, let's distribute randomly
        const phi = Math.random() * Math.PI * 2;
        const theta = Math.random() * Math.PI;
        
        // Better volume heart
        // x = 16sin^3(t)
        // y = 13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t)
        // Extrude slightly in Z
        const t2 = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()); // Even distribution
        
        // Use a rejection sampling or simplified approximate volume
        x = 16 * Math.pow(Math.sin(t2), 3);
        y = 13 * Math.cos(t2) - 5 * Math.cos(2 * t2) - 2 * Math.cos(3 * t2) - Math.cos(4 * t2);
        z = (Math.random() - 0.5) * 10;
        
        // Scale down
        x *= 0.15;
        y *= 0.15;
        z *= 0.15;
        break;
      }

      case ShapeType.SATURN: {
        // 70% Planet, 30% Rings
        if (Math.random() > 0.3) {
          // Planet
          const p = getRandomPointInSphere(1.5);
          x = p.x; y = p.y; z = p.z;
        } else {
          // Rings
          const angle = Math.random() * Math.PI * 2;
          const dist = 2.2 + Math.random() * 1.5;
          x = Math.cos(angle) * dist;
          z = Math.sin(angle) * dist;
          y = (Math.random() - 0.5) * 0.1; // Thin rings
          
          // Tilt the rings
          const tilt = Math.PI / 6;
          const yNew = y * Math.cos(tilt) - x * Math.sin(tilt);
          const xNew = y * Math.sin(tilt) + x * Math.cos(tilt);
          x = xNew;
          y = yNew;
        }
        break;
      }

      case ShapeType.FLOWER: {
        // 3D Rose / Flower shape
        const u = Math.random() * Math.PI * 2;
        const v = Math.random() * Math.PI;
        
        // Rose curve equation for radius
        const k = 3; // Petals
        const r = 2 * Math.cos(k * u);
        
        x = r * Math.sin(v) * Math.cos(u);
        y = r * Math.cos(v) + 0.5; // Lift up slightly
        z = r * Math.sin(v) * Math.sin(u);
        
        // Add a center pistil
        if (Math.random() < 0.1) {
            const p = getRandomPointInSphere(0.3);
            x = p.x; y = p.y; z = p.z;
        }
        break;
      }

      case ShapeType.BUDDHA: {
        // Approximate meditative pose with primitives
        const r = Math.random();
        
        if (r < 0.2) {
          // Head
          const p = getRandomPointInSphere(0.6);
          x = p.x; y = p.y + 1.8; z = p.z;
        } else if (r < 0.6) {
          // Body (Cylinder-ish/Egg)
          const angle = Math.random() * Math.PI * 2;
          const rad = 0.9 * Math.sqrt(Math.random());
          const h = (Math.random() - 0.5) * 2.0; // Height -1 to 1
          x = Math.cos(angle) * rad * (1.2 - Math.abs(h)*0.3); // Taper shoulders
          y = h + 0.5;
          z = Math.sin(angle) * rad * (1.2 - Math.abs(h)*0.3);
        } else {
          // Legs (Crossed / Base)
          const angle = Math.random() * Math.PI * 2;
          const rad = 1.0 + Math.random() * 0.8;
          const h = (Math.random() - 0.5) * 0.5;
          x = Math.cos(angle) * rad;
          y = h - 0.8;
          z = Math.sin(angle) * rad;
          
          // Cut out middle to make it look like legs not a disc
          // Ideally we use a torus equation but random disc is okay for point cloud abstract
        }
        break;
      }

      case ShapeType.FIREWORKS: {
        // Explosion from center
        const p = getRandomPointInSphere(0.1); // Start small
        // In the animation loop, we will expand these based on index
        // For the static target, let's make a big sphere
        const p2 = getRandomPointInSphere(4.0);
        x = p2.x; y = p2.y; z = p2.z;
        break;
      }

      case ShapeType.SPHERE:
      default: {
        const p = getRandomPointInSphere(2);
        x = p.x; y = p.y; z = p.z;
        break;
      }
    }

    positions[idx] = x;
    positions[idx + 1] = y;
    positions[idx + 2] = z;
  }

  return positions;
};