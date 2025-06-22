import {
  CameraView,
  CameraType,
  useCameraPermissions,
} from 'expo-camera';
import { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

// Custom hooks
import { useMotionDetection } from '../hooks/useMotionDetection';

// API utilities
import { detectObjects, captionImage, testApiConnectivity } from '../utils/api';

// Components
import MotionIndicator from '../components/MotionIndicator';
import DetectionOverlay from '../components/DetectionOverlay';
import HistoricPhotos from '../components/HistoricPhotos';
import TimelineComponent from '../components/Timeline';
import CameraOverlay from '../components/CameraControls';

export default function ExploreScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [showHistoricPhotos, setShowHistoricPhotos] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [detections, setDetections] = useState([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectingObject, setDetectingObject] = useState('building');
  const [mode, setMode] = useState('detect'); // 'detect' or 'caption'
  const [caption, setCaption] = useState('');
  const [apiStatus, setApiStatus] = useState('ready'); // 'ready', 'error', 'connecting'
  const [apiFeedback, setApiFeedback] = useState(''); // Feedback when moving
  const cameraRef = useRef(null);
  const lastDetectionTimeRef = useRef(0);

  // ✅ MODIFIED: Motion detection without automatic triggering
  const { isMoving, motionStatus, setMotionStatus } = useMotionDetection(() => {
    // ❌ REMOVED: Automatic detection when stable
    // We only want manual detection now
  });

  useEffect(() => {
    // Test API connectivity on mount
    testApiConnectivityWrapper();
    
    // ❌ REMOVED: Continuous frame processing
    // No more automatic picture taking every 1.5 seconds
    
  }, [mode, detectingObject]);

  // Clear detection boxes when movement is detected
  useEffect(() => {
    if (isMoving) {
      console.log('🏃 Movement detected - Clearing detections');
      setDetections([]); // Clear boxes immediately when movement starts
      setCaption(''); // Clear caption
      setApiFeedback('Movement detected'); // Show movement feedback
    } else {
      console.log('⏹️ Device stable');
      setApiFeedback(''); // Clear feedback when stable
    }
  }, [isMoving]);

  // Clear detections when object type changes
  useEffect(() => {
    console.log('🔄 Detection object changed to:', detectingObject);
    setDetections([]);
    setCaption('');
    setApiFeedback('');
  }, [detectingObject]);

  // Clear detections when mode changes
  useEffect(() => {
    console.log('🔄 Mode changed to:', mode);
    setDetections([]);
    setCaption('');
    setApiFeedback('');
  }, [mode]);

  // Clear stale detections after 10 seconds of inactivity
  useEffect(() => {
    const staleDetectionInterval = setInterval(() => {
      const now = Date.now();
      if (!isMoving && now - lastDetectionTimeRef.current > 10000) { // 10 seconds
        console.log('🧹 Clearing stale detections after 10 seconds');
        setDetections([]);
        setCaption('');
      }
    }, 2000); // Check every 2 seconds

    return () => clearInterval(staleDetectionInterval);
  }, [isMoving]);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>We need camera permission</Text>
        <TouchableOpacity onPress={requestPermission}>
          <Text style={styles.permissionBtn}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ✅ Test API connectivity function
  async function testApiConnectivityWrapper() {
    try {
      const result = await testApiConnectivity();
      setApiStatus(result.status);
    } catch (error) {
      setApiStatus('error');
    }
  }

  // ✅ MODIFIED: Only capture when manually triggered with comprehensive logging
  async function captureFrameAndDetect(showResults: boolean = true) {
    if (!cameraRef.current || isDetecting) return;
    
    try {
      setIsDetecting(true);
      setMotionStatus('detecting');
      setApiStatus('connecting');
      
      // ✅ Get screen dimensions for comparison
      const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
      console.log('📱 SCREEN DIMENSIONS:', {
        width: screenWidth,
        height: screenHeight,
        aspectRatio: (screenWidth / screenHeight).toFixed(3)
      });
      
      // ✅ CAMERA-AWARE: Capture frame with enhanced settings
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.8, // Higher quality for better detection
        skipProcessing: false,
        // ✅ IMPORTANT: Camera settings for consistency
        exif: false,
        mirrorImage: false,
        forceUpOrientation: true,
        fixOrientation: true,
      });

      if (photo?.base64) {
        // ✅ LOG ACTUAL CAMERA CAPTURE DIMENSIONS
        console.log('📷 CAMERA CAPTURE DIMENSIONS:', {
          width: photo.width,
          height: photo.height,
          aspectRatio: photo.width && photo.height ? (photo.width / photo.height).toFixed(3) : 'unknown',
          uri: photo.uri ? 'present' : 'missing'
        });
        
        // ✅ COMPARE SCREEN VS CAMERA RATIOS
        if (photo.width && photo.height) {
          const cameraAspectRatio = photo.width / photo.height;
          const screenAspectRatio = screenWidth / screenHeight;
          const aspectRatioDifference = Math.abs(cameraAspectRatio - screenAspectRatio);
          
          console.log('🔍 ASPECT RATIO COMPARISON:', {
            camera: {
              width: photo.width,
              height: photo.height,
              aspectRatio: cameraAspectRatio.toFixed(3)
            },
            screen: {
              width: screenWidth,
              height: screenHeight,
              aspectRatio: screenAspectRatio.toFixed(3)
            },
            difference: aspectRatioDifference.toFixed(3),
            needsAdjustment: aspectRatioDifference > 0.1 ? 'YES' : 'NO',
            cameraOrientation: photo.width > photo.height ? 'landscape' : 'portrait',
            screenOrientation: screenWidth > screenHeight ? 'landscape' : 'portrait'
          });
        }
        
        if (mode === 'detect') {
          await detectObjectsWrapper(photo.base64, showResults, {
            cameraWidth: photo.width,
            cameraHeight: photo.height,
            screenWidth,
            screenHeight
          });
        } else {
          await captionImageWrapper(photo.base64, showResults);
        }
        
        if (showResults) {
          lastDetectionTimeRef.current = Date.now();
        }
      }
    } catch (error) {
      console.error('Error capturing frame:', error);
      setApiStatus('error');
    } finally {
      setIsDetecting(false);
      if (!isMoving) {
        setMotionStatus('stable');
      }
    }
  }

  // ✅ ENHANCED: Wrapper for detectObjects with camera dimension awareness
  async function detectObjectsWrapper(base64Image: string, showResults: boolean, cameraInfo?: any) {
    try {
      console.log('🔍 Calling detectObjects...', { showResults, detectingObject });
      const objects = await detectObjects(base64Image, detectingObject, !showResults);
      
      // ✅ ENHANCED: Detailed coordinate logging with camera info
      console.log('📦 Raw detection results from Pi server:', JSON.stringify(objects, null, 2));
      
      // ✅ Get screen dimensions for debugging
      const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
      console.log('📱 Screen dimensions:', { screenWidth, screenHeight });
      
      if (cameraInfo) {
        console.log('📷 Camera info passed to detection:', cameraInfo);
      }
      
      if (objects && objects.length > 0) {
        console.log('🔍 Analyzing detection coordinates:');
        objects.forEach((obj, index) => {
          // Calculate screen positions using both methods
          const directBoxLeft = obj.x_min * screenWidth;
          const directBoxTop = obj.y_min * screenHeight;
          const directBoxWidth = (obj.x_max - obj.x_min) * screenWidth;
          const directBoxHeight = (obj.y_max - obj.y_min) * screenHeight;
          
          let adjustedBoxLeft = directBoxLeft;
          let adjustedBoxTop = directBoxTop;
          let adjustedBoxWidth = directBoxWidth;
          let adjustedBoxHeight = directBoxHeight;
          
          // If we have camera dimensions, calculate aspect ratio adjustment
          if (cameraInfo && cameraInfo.cameraWidth && cameraInfo.cameraHeight) {
            const cameraAspectRatio = cameraInfo.cameraWidth / cameraInfo.cameraHeight;
            const screenAspectRatio = screenWidth / screenHeight;
            
            console.log(`📐 Aspect ratio calculation for detection ${index}:`, {
              camera: { width: cameraInfo.cameraWidth, height: cameraInfo.cameraHeight, ratio: cameraAspectRatio.toFixed(3) },
              screen: { width: screenWidth, height: screenHeight, ratio: screenAspectRatio.toFixed(3) }
            });
            
            // Apply aspect ratio correction
            if (Math.abs(cameraAspectRatio - screenAspectRatio) > 0.1) {
              if (cameraAspectRatio > screenAspectRatio) {
                // Camera is wider - need to letterbox vertically
                const scale = screenAspectRatio / cameraAspectRatio;
                const offset = (1 - scale) / 2;
                
                adjustedBoxTop = (obj.y_min * scale + offset) * screenHeight;
                adjustedBoxHeight = (obj.y_max - obj.y_min) * scale * screenHeight;
                
                console.log(`📐 Vertical letterbox applied to detection ${index}:`, {
                  scale: scale.toFixed(3),
                  offset: offset.toFixed(3),
                  originalY: { min: obj.y_min, max: obj.y_max },
                  adjustedY: { top: adjustedBoxTop.toFixed(1), height: adjustedBoxHeight.toFixed(1) }
                });
              } else {
                // Camera is taller - need to letterbox horizontally  
                const scale = cameraAspectRatio / screenAspectRatio;
                const offset = (1 - scale) / 2;
                
                adjustedBoxLeft = (obj.x_min * scale + offset) * screenWidth;
                adjustedBoxWidth = (obj.x_max - obj.x_min) * scale * screenWidth;
                
                console.log(`📐 Horizontal letterbox applied to detection ${index}:`, {
                  scale: scale.toFixed(3),
                  offset: offset.toFixed(3),
                  originalX: { min: obj.x_min, max: obj.x_max },
                  adjustedX: { left: adjustedBoxLeft.toFixed(1), width: adjustedBoxWidth.toFixed(1) }
                });
              }
            }
          }
          
          console.log(`📐 Detection ${index} complete analysis:`, {
            label: obj.label,
            normalizedCoords: {
              x_min: obj.x_min,
              y_min: obj.y_min, 
              x_max: obj.x_max,
              y_max: obj.y_max
            },
            directMapping: {
              left: directBoxLeft.toFixed(1),
              top: directBoxTop.toFixed(1),
              width: directBoxWidth.toFixed(1),
              height: directBoxHeight.toFixed(1)
            },
            adjustedMapping: {
              left: adjustedBoxLeft.toFixed(1),
              top: adjustedBoxTop.toFixed(1),
              width: adjustedBoxWidth.toFixed(1),
              height: adjustedBoxHeight.toFixed(1)
            },
            validation: {
              coordsInRange: (obj.x_min >= 0 && obj.x_min <= 1 && 
                             obj.y_min >= 0 && obj.y_min <= 1 &&
                             obj.x_max >= 0 && obj.x_max <= 1 &&
                             obj.y_max >= 0 && obj.y_max <= 1),
              validSize: (obj.x_max > obj.x_min && obj.y_max > obj.y_min),
              visibleSize: (adjustedBoxWidth > 10 && adjustedBoxHeight > 10)
            }
          });
        });
        
        // ✅ Additional validation
        const validObjects = objects.filter(obj => {
          const isValid = (obj.x_min >= 0 && obj.x_min <= 1 && 
                          obj.y_min >= 0 && obj.y_min <= 1 &&
                          obj.x_max >= 0 && obj.x_max <= 1 &&
                          obj.y_max >= 0 && obj.y_max <= 1 &&
                          obj.x_max > obj.x_min && obj.y_max > obj.y_min);
          
          if (!isValid) {
            console.warn(`⚠️ Invalid detection coordinates:`, obj);
          }
          return isValid;
        });
        
        console.log(`✅ Valid detections: ${validObjects.length} out of ${objects.length}`);
      }
      
      if (showResults) {
        // Pass camera info to DetectionOverlay for proper coordinate mapping
        const objectsWithCameraInfo = objects?.map(obj => ({
          ...obj,
          cameraInfo: cameraInfo
        }));
        
        setDetections(objectsWithCameraInfo || []);
        setApiFeedback('');
        console.log('✅ Detections set in state:', objects?.length || 0, 'objects');
      }
      
      setApiStatus('ready');
    } catch (error) {
      console.error('❌ Detection error:', error);
      if (showResults) {
        setDetections([]);
      }
      setApiStatus('error');
    }
  }

  // ✅ Wrapper for captionImage
  async function captionImageWrapper(base64Image: string, showResults: boolean) {
    try {
      console.log('📝 Calling captionImage...', { showResults });
      const generatedCaption = await captionImage(base64Image, !showResults);
      console.log('📝 Caption result:', generatedCaption);
      
      if (showResults) {
        // Only show caption when manually triggered
        setCaption(generatedCaption);
        setApiFeedback('');
        console.log('✅ Caption set');
      }
      
      setApiStatus('ready');
    } catch (error) {
      console.error('❌ Caption error:', error);
      if (showResults) {
        setCaption('Error generating caption');
      }
      setApiStatus('error');
    }
  }

  function toggleCameraFacing() {
    setFacing(prev => (prev === 'back' ? 'front' : 'back'));
    // Clear detections when switching cameras
    setDetections([]);
    setCaption('');
  }

  function cycleDetectionObject() {
    const objects = ['building', 'person', 'car', 'tree', 'sign', 'window', 'door', 'street sign'];
    const currentIndex = objects.indexOf(detectingObject);
    const nextIndex = (currentIndex + 1) % objects.length;
    setDetectingObject(objects[nextIndex]);
    setDetections([]); // Clear previous detections
    setCaption(''); // Clear caption
    setApiFeedback(''); // Clear feedback
    setApiStatus('ready'); // Reset API status
    console.log('🔄 Object detection changed to:', objects[nextIndex]);
  }

  function toggleMode() {
    setMode(prev => prev === 'detect' ? 'caption' : 'detect');
    setDetections([]); // Clear detections
    setCaption(''); // Clear caption
    setApiFeedback(''); // Clear feedback
    setApiStatus('ready'); // Reset API status
    console.log('🔄 Mode toggled to:', mode === 'detect' ? 'caption' : 'detect');
  }

  // ✅ MODIFIED: Manual detection only
  function manualDetect() {
    console.log('🔍 Manual detection triggered');
    console.log('📱 Current state:', { isMoving, mode, detectingObject });
    
    // Always capture and show results when manually triggered
    captureFrameAndDetect(true);
  }

  // ✅ Handle building selection for timeline
  function handleBuildingSelect(building: any) {
    console.log('Building selected:', building);
    if (building && building.name) {
      setSelectedBuilding(building);
      setShowHistoricPhotos(false); // Close the modal
    } else {
      console.error('Invalid building data:', building);
    }
  }

  // ✅ Handle back from timeline
  function handleTimelineBack() {
    console.log('Going back from timeline');
    setSelectedBuilding(null);
  }

  return (
    <View style={styles.container}>
      <CameraView 
        style={StyleSheet.absoluteFill} 
        facing={facing}
        ref={cameraRef}
      >
        {/* Street name overlay */}
        <View style={styles.streetNameContainer}>
          <Text style={styles.streetName}>{"\n"}Historic Overlay</Text>
        </View>

        {/* Motion and Detection status indicator */}
        <MotionIndicator
          motionStatus={motionStatus}
          apiStatus={apiStatus}
          mode={mode}
          detectingObject={detectingObject}
          isDetecting={isDetecting}
          detections={detections}
          isMoving={isMoving}
          apiFeedback={apiFeedback}
        />

        {/* Detection overlay and caption display */}
        <DetectionOverlay
          mode={mode}
          detections={detections}
          detectingObject={detectingObject}
          caption={caption}
        />

        {/* ✅ MODIFIED: Show movement feedback differently */}
        {isMoving && (
          <View style={styles.movementContainer}>
            <Text style={styles.movementText}>
              📱 Device is moving - Tap scan to detect
            </Text>
          </View>
        )}

        {/* Camera Controls */}
        <CameraOverlay
          mode={mode}
          isDetecting={isDetecting}
          isMoving={isMoving}
          showPhotos={showHistoricPhotos}
          onToggleMode={toggleMode}
          onManualDetect={manualDetect} // This is now the only way to detect
          onToggleCameraFacing={toggleCameraFacing}
          onCycleObject={cycleDetectionObject} 
        />

        {/* Historic Photos Button */}
        <TouchableOpacity 
          style={styles.historicPhotosButton}
          onPress={() => setShowHistoricPhotos(true)}
        >
          <Text style={styles.historicPhotosButtonText}>Historic Photos</Text>
        </TouchableOpacity>

        {/* ✅ DEBUG: Display detection count overlay */}
        {detections.length > 0 && (
          <View style={styles.debugOverlay}>
            <Text style={styles.debugText}>
              🎯 {detections.length} detection(s) active
            </Text>
          </View>
        )}
      </CameraView>

      {/* Historic Photos Modal */}
      <HistoricPhotos
        visible={showHistoricPhotos}
        onClose={() => setShowHistoricPhotos(false)}
        onBuildingSelect={handleBuildingSelect}
      />

      {/* Timeline Component */}
      {selectedBuilding && (
        <TimelineComponent
          building={selectedBuilding}
          onBack={handleTimelineBack}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  message: { textAlign: 'center', marginBottom: 10 },
  permissionBtn: { fontSize: 18, color: '#007AFF' },

  streetNameContainer: {
    position: 'absolute',
    top: 80,
    alignSelf: 'center',
  },
  streetName: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 34,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },

  // ✅ MODIFIED: Movement indicator (no longer feedback)
  movementContainer: {
    position: 'absolute',
    bottom: 200,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 193, 7, 0.9)',
    borderRadius: 15,
    padding: 12,
  },
  movementText: {
    color: '#000',
    fontSize: 14,
    lineHeight: 18,
    textAlign: 'center',
    fontWeight: '600',
  },

  // Historic Photos Button
  historicPhotosButton: {
    position: 'absolute',
    bottom: 25,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  historicPhotosButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },

  // ✅ DEBUG: Debug overlay for detection count
  debugOverlay: {
    position: 'absolute',
    top: 240,
    right: 20,
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  debugText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});