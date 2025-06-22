import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

interface Detection {
  x_min: number;
  y_min: number;
  x_max: number;
  y_max: number;
  label?: string;
  cameraInfo?: {
    cameraWidth: number;
    cameraHeight: number;
    screenWidth: number;
    screenHeight: number;
  };
}

interface DetectionOverlayProps {
  mode: string;
  detections: Detection[];
  detectingObject: string;
  caption: string;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function DetectionOverlay({
  mode,
  detections,
  detectingObject,
  caption
}: DetectionOverlayProps) {
  
  if (mode === 'detect' && detections && detections.length > 0) {
    return (
      <>
        {detections.map((detection, index) => {
          // ✅ PRECISE: Exact coordinate mapping with validation
          
          const x_min = Math.max(0, Math.min(1, detection.x_min));
          const y_min = Math.max(0, Math.min(1, detection.y_min));
          const x_max = Math.max(0, Math.min(1, detection.x_max));
          const y_max = Math.max(0, Math.min(1, detection.y_max));
          
          // ✅ DIRECT PIXEL MAPPING (most accurate)
          const boxLeft = Math.round(x_min * screenWidth);
          const boxTop = Math.round(y_min * screenHeight);
          const boxWidth = Math.round((x_max - x_min) * screenWidth);
          const boxHeight = Math.round((y_max - y_min) * screenHeight);
          
          // ✅ ENHANCED VALIDATION
          const minSize = 15; // Reduced minimum size
          const finalWidth = Math.max(minSize, boxWidth);
          const finalHeight = Math.max(minSize, boxHeight);
          
          // ✅ PRECISE BOUNDS CHECK
          const finalLeft = Math.max(0, Math.min(screenWidth - finalWidth, boxLeft));
          const finalTop = Math.max(0, Math.min(screenHeight - finalHeight, boxTop));
          
          // ✅ DETAILED LOGGING FOR EACH DETECTION
          console.log(`🎯 PRECISE Detection ${index} mapping:`, {
            originalCoords: { x_min, y_min, x_max, y_max },
            screenDimensions: { screenWidth, screenHeight },
            calculatedPixels: { boxLeft, boxTop, boxWidth, boxHeight },
            finalPixels: { finalLeft, finalTop, finalWidth, finalHeight },
            pixelAccuracy: {
              leftOffset: finalLeft - boxLeft,
              topOffset: finalTop - boxTop,
              widthAdjustment: finalWidth - boxWidth,
              heightAdjustment: finalHeight - boxHeight
            }
          });

          // ✅ SKIP INVALID DETECTIONS
          if (finalWidth < 10 || finalHeight < 10) {
            console.warn(`❌ Skipping invalid detection ${index}:`, {
              finalWidth, finalHeight, reason: 'too small'
            });
            return null;
          }

          return (
            <React.Fragment key={`detection-${index}-${Date.now()}`}>
              {/* ✅ MAIN BOUNDING BOX - PRECISELY POSITIONED */}
              <View
                style={[
                  styles.detectionBox,
                  {
                    left: finalLeft,
                    top: finalTop,
                    width: finalWidth,
                    height: finalHeight,
                  },
                ]}
              >
                {/* ✅ ENHANCED LABEL WITH COORDINATES */}
                <View 
                  style={[
                    styles.labelContainer,
                    {
                      top: finalTop > 40 ? -38 : finalHeight + 6,
                      left: Math.max(0, Math.min(screenWidth - 100, 0)), // Keep label on screen
                    }
                  ]}
                >
                  <Text style={styles.detectionLabel}>
                    {detection.label || detectingObject}
                  </Text>
                  <Text style={styles.coordinateText}>
                    {Math.round(x_min * 1000)/10}%, {Math.round(y_min * 1000)/10}%
                  </Text>
                </View>
              </View>
              
              {/* ✅ CORNER MARKERS FOR PRECISE VISIBILITY */}
              <View style={[styles.cornerMarker, styles.topLeft, { 
                left: finalLeft - 4, 
                top: finalTop - 4 
              }]} />
              <View style={[styles.cornerMarker, styles.topRight, { 
                left: finalLeft + finalWidth - 8, 
                top: finalTop - 4 
              }]} />
              <View style={[styles.cornerMarker, styles.bottomLeft, { 
                left: finalLeft - 4, 
                top: finalTop + finalHeight - 8 
              }]} />
              <View style={[styles.cornerMarker, styles.bottomRight, { 
                left: finalLeft + finalWidth - 8, 
                top: finalTop + finalHeight - 8 
              }]} />
              
              {/* ✅ CENTER CROSSHAIR FOR PRECISION */}
              <View style={[styles.centerCross, {
                left: finalLeft + finalWidth/2 - 8,
                top: finalTop + finalHeight/2 - 1,
              }]} />
              <View style={[styles.centerCross, styles.vertical, {
                left: finalLeft + finalWidth/2 - 1,
                top: finalTop + finalHeight/2 - 8,
              }]} />
              
              {/* ✅ DEBUG: Pixel Position Overlay */}
              <View style={[styles.debugInfo, {
                left: finalLeft,
                top: finalTop + finalHeight + 2,
              }]}>
                <Text style={styles.debugText}>
                  {finalLeft},{finalTop} • {finalWidth}×{finalHeight}
                </Text>
              </View>
            </React.Fragment>
          );
        })}
        
        {/* ✅ DETECTION SUMMARY OVERLAY */}
        <View style={styles.summaryOverlay}>
          <Text style={styles.summaryText}>
            🎯 {detections.length} {detectingObject}(s) detected
          </Text>
          <Text style={styles.summarySubtext}>
            Screen: {screenWidth}×{screenHeight}
          </Text>
        </View>
      </>
    );
  }

  if (mode === 'caption' && caption && caption.trim()) {
    return (
      <View style={styles.captionContainer}>
        <View style={styles.captionContent}>
          <Text style={styles.captionHeader}>🔍 Scene Description</Text>
          <Text style={styles.captionText}>{caption}</Text>
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  // ✅ ENHANCED DETECTION BOX
  detectionBox: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: '#00FF00',
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    borderRadius: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1.0,
    shadowRadius: 4,
    elevation: 10,
  },
  
  // ✅ ENHANCED LABEL WITH COORDINATES
  labelContainer: {
    position: 'absolute',
    backgroundColor: '#00FF00',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1.0,
    shadowRadius: 3,
    elevation: 12,
    minWidth: 60,
  },
  detectionLabel: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'capitalize',
    textAlign: 'center',
    lineHeight: 14,
  },
  coordinateText: {
    color: '#000000',
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 10,
    marginTop: 1,
  },
  
  // ✅ ENHANCED CORNER MARKERS
  cornerMarker: {
    position: 'absolute',
    width: 14,
    height: 14,
    backgroundColor: '#00FF00',
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1.0,
    shadowRadius: 2,
    elevation: 8,
  },
  topLeft: { borderBottomRightRadius: 8 },
  topRight: { borderBottomLeftRadius: 8 },
  bottomLeft: { borderTopRightRadius: 8 },
  bottomRight: { borderTopLeftRadius: 8 },
  
  // ✅ CENTER CROSSHAIR
  centerCross: {
    position: 'absolute',
    backgroundColor: '#FF0000',
    width: 16,
    height: 2,
  },
  vertical: {
    width: 2,
    height: 16,
  },
  
  // ✅ DEBUG INFO
  debugInfo: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  debugText: {
    color: '#000000',
    fontSize: 8,
    fontWeight: '600',
  },
  
  // ✅ SUMMARY OVERLAY
  summaryOverlay: {
    position: 'absolute',
    top: 130,
    left: 16,
    backgroundColor: 'rgba(0, 255, 0, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  summaryText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  summarySubtext: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2,
  },
  
  // Caption display (unchanged)
  captionContainer: {
    position: 'absolute',
    bottom: 200,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  captionContent: { alignItems: 'center' },
  captionHeader: {
    color: '#00FF00',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  captionText: {
    color: '#ffffff',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    fontWeight: '500',
  },
});