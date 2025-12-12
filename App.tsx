import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Stars } from '@react-three/drei';
import ParticleSystem from './components/ParticleSystem';
import HandTrackerLogic from './components/HandTracker';
import UI from './components/UI';
import { ShapeType } from './types';

function App() {
  const [currentShape, setCurrentShape] = useState<ShapeType>(ShapeType.HEART);
  const [color, setColor] = useState<string>('#ff0055');
  const [handDistance, setHandDistance] = useState<number>(0);
  const [isHandActive, setIsHandActive] = useState<boolean>(false);

  const handleGestureUpdate = (distance: number, isActive: boolean) => {
    // Smooth out the data slightly or just pass direct
    setHandDistance(distance);
    setIsHandActive(isActive);
  };

  return (
    <div className="w-full h-screen bg-black relative selection:bg-none">
      
      {/* 3D Scene */}
      <Canvas camera={{ position: [0, 0, 6], fov: 60 }} dpr={[1, 2]}>
        <color attach="background" args={['#050505']} />
        
        <Suspense fallback={null}>
          <ParticleSystem 
            shape={currentShape} 
            color={color} 
            handDistance={handDistance} 
            isHandActive={isHandActive}
          />
          <Environment preset="city" />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        </Suspense>
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          autoRotate={!isHandActive} 
          autoRotateSpeed={0.5} 
        />
      </Canvas>

      {/* MediaPipe Logic (Hidden logic, Visible preview) */}
      <HandTrackerLogic onUpdate={handleGestureUpdate} />

      {/* UI Overlay */}
      <UI 
        currentShape={currentShape} 
        setShape={setCurrentShape} 
        color={color} 
        setColor={setColor}
        handActive={isHandActive}
        handDistance={handDistance}
      />
    </div>
  );
}

export default App;