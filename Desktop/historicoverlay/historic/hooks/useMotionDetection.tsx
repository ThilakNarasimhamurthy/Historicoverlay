import { useEffect, useRef, useState } from 'react';
import { Accelerometer } from 'expo-sensors';

const MOTION_THRESHOLD = 0.15; // Slightly increased sensitivity
const STILLNESS_DURATION = 800; // Reduced to 800ms for faster response

export function useMotionDetection(onStill: () => void) {
  const [isMoving, setIsMoving] = useState(false);
  const [motionStatus, setMotionStatus] = useState('stable');
  const stillnessTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastMotionTimeRef = useRef(0);
  const accelerometerSubscriptionRef = useRef<any>(null);

  useEffect(() => {
    // Set accelerometer update interval
    Accelerometer.setUpdateInterval(200); // Reduced frequency to 200ms

    accelerometerSubscriptionRef.current = Accelerometer.addListener(({ x, y, z }) => {
      // Calculate total acceleration magnitude
      const acceleration = Math.sqrt(x * x + y * y + z * z);
      const currentTime = Date.now();

      // Check if device is moving beyond threshold
      if (Math.abs(acceleration - 1) > MOTION_THRESHOLD) { // 1 is gravity baseline
        if (!isMoving) {
          console.log('🏃 Motion detected - clearing detections');
        }
        setIsMoving(true);
        setMotionStatus('moving');
        lastMotionTimeRef.current = currentTime;
 
        // Clear any pending stillness detection
        if (stillnessTimeoutRef.current) {
          clearTimeout(stillnessTimeoutRef.current);
          stillnessTimeoutRef.current = null;
        }
      } else {
        // Device appears stable, but wait for stillness duration
        if (isMoving && !stillnessTimeoutRef.current) {
          setMotionStatus('stabilizing');
          
          stillnessTimeoutRef.current = setTimeout(() => {
            console.log('⏹️ Device stabilized');
            setIsMoving(false);
            setMotionStatus('stable');
            
            stillnessTimeoutRef.current = null;
          }, STILLNESS_DURATION);
        }
      }
    });

    return () => {
      // Cleanup on unmount
      if (stillnessTimeoutRef.current) {
        clearTimeout(stillnessTimeoutRef.current);
      }
      if (accelerometerSubscriptionRef.current) {
        accelerometerSubscriptionRef.current.remove();
      }
    };
  }, []); // ✅ REMOVED: onStill dependency to prevent automatic triggering

  const cleanup = () => {
    if (stillnessTimeoutRef.current) {
      clearTimeout(stillnessTimeoutRef.current);
    }
    if (accelerometerSubscriptionRef.current) {
      accelerometerSubscriptionRef.current.remove();
    }
  };

  return {
    isMoving,
    motionStatus,
    setMotionStatus,
    cleanup
  };
}