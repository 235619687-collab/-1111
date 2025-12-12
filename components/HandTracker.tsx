import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

interface HandTrackerProps {
  onGestureUpdate: (distance: number, isActive: boolean) => void;
}

const HandTracker: React.FC<HandTrackerProps> = ({ onGestureUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const lastVideoTime = useRef<number>(-1);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    let handLandmarker: HandLandmarker | null = null;
    let isActive = true;

    const setupMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        
        if (!isActive) return;

        handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 2
        });

        setLoading(false);
        startWebcam();
      } catch (error) {
        console.error("Error initializing MediaPipe:", error);
        setLoading(false);
      }
    };

    setupMediaPipe();

    return () => {
      isActive = false;
      if (handLandmarker) handLandmarker.close();
    };
  }, []);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener('loadeddata', predictWebcam);
        setHasPermission(true);
      }
    } catch (err) {
      console.error("Error accessing webcam:", err);
      setHasPermission(false);
    }
  };

  const predictWebcam = () => {
    if (!videoRef.current) return;
    
    // Safety check for valid video dimensions
    if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
       requestRef.current = requestAnimationFrame(predictWebcam);
       return;
    }

    const nowInMs = Date.now();
    if (lastVideoTime.current !== videoRef.current.currentTime) {
      lastVideoTime.current = videoRef.current.currentTime;
      
      // We need to access the landmarker instance from the closure or ref
      // Since createFromOptions is async, we might be running this before it's ready.
      // Ideally, we'd store landmarker in a ref. 
      // For simplicity in this structure, we'll assume the setup function sets a ref if we refactor,
      // but here we need to hoist the landmarker variable or use a ref.
    }
    requestRef.current = requestAnimationFrame(predictWebcam);
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 w-32 h-24 bg-black/50 rounded-lg overflow-hidden border border-white/20 shadow-lg">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover transform scale-x-[-1]"
      />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-white/70">
          Loading AI...
        </div>
      )}
      {!hasPermission && !loading && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-red-400 text-center p-1">
          No Camera
        </div>
      )}
    </div>
  );
};

// Refactored for better state handling inside the component logic
const HandTrackerLogic = ({ onUpdate }: { onUpdate: (d: number, a: boolean) => void }) => {
   const videoRef = useRef<HTMLVideoElement>(null);
   const landmarkerRef = useRef<HandLandmarker | null>(null);
   const requestRef = useRef<number>(0);
   const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

   useEffect(() => {
     const init = async () => {
       try {
         const vision = await FilesetResolver.forVisionTasks(
           "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
         );
         landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
           baseOptions: {
             modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
             delegate: "GPU"
           },
           runningMode: "VIDEO",
           numHands: 2
         });
         setStatus('ready');
         startCamera();
       } catch (e) {
         console.error(e);
         setStatus('error');
       }
     };
     init();

     return () => cancelAnimationFrame(requestRef.current);
   }, []);

   const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 320, height: 240, frameRate: { ideal: 30 } } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadeddata = predict;
        }
      } catch (e) {
        setStatus('error');
      }
   };

   const predict = () => {
     if (videoRef.current && landmarkerRef.current) {
        let distance = 0.5; // Default
        let active = false;

        const results = landmarkerRef.current.detectForVideo(videoRef.current, performance.now());
        
        if (results.landmarks && results.landmarks.length > 0) {
            active = true;
            
            // If two hands, measure distance between index fingers
            if (results.landmarks.length === 2) {
                const hand1 = results.landmarks[0][8]; // Index tip
                const hand2 = results.landmarks[1][8]; // Index tip
                
                // Simple Euclidean distance in normalized coordinates (0-1)
                const dx = hand1.x - hand2.x;
                const dy = hand1.y - hand2.y;
                const d = Math.sqrt(dx*dx + dy*dy);
                
                // Map reasonable screen distance to 0-1 factor
                // Max distance roughly 0.8, min roughly 0.05
                distance = Math.min(Math.max((d - 0.05) / 0.6, 0), 1);
            } 
            // If one hand, measure Thumb tip to Index tip (Pinch)
            else if (results.landmarks.length === 1) {
                const thumb = results.landmarks[0][4];
                const index = results.landmarks[0][8];
                const dx = thumb.x - index.x;
                const dy = thumb.y - index.y;
                const d = Math.sqrt(dx*dx + dy*dy);
                // Pinch is roughly 0 to 0.2
                distance = Math.min(Math.max(d / 0.2, 0), 1);
            }
        } else {
            active = false;
        }

        onUpdate(distance, active);
        requestRef.current = requestAnimationFrame(predict);
     }
   };

   return (
    <div className="fixed bottom-6 left-6 z-50 w-40 h-32 bg-gray-900 rounded-xl overflow-hidden border border-white/10 shadow-2xl backdrop-blur-md">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover transform scale-x-[-1] opacity-80"
      />
      <div className="absolute top-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider text-white">
        {status === 'loading' ? 'Init AI...' : status === 'error' ? 'Cam Error' : 'Tracking'}
      </div>
    </div>
   );
};

export default HandTrackerLogic;