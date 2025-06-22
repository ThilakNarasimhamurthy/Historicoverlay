import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';

interface MotionIndicatorProps {
  motionStatus: string;
  apiStatus: string;
  mode: string;
  detectingObject: string;
  isDetecting: boolean;
  detections: any[];
  isMoving: boolean;
  apiFeedback: string;
}

const screenWidth = Dimensions.get('window').width;

export default function MotionIndicator({
  motionStatus,
  apiStatus,
  mode,
  detectingObject,
  isDetecting,
  detections,
  isMoving,
  apiFeedback,
}: MotionIndicatorProps) {
  const getColor = () => {
    if (apiStatus === 'error') return '#ff4d4f';
    if (isDetecting) return '#4ecdc4';
    if (isMoving) return '#fbc531';
    if (detections.length > 0) return '#2ecc71'; // Green when detections found
    return '#95a5a6'; // Gray when no detections
  };

  const getMainText = () => {
    const label = mode === 'detect' ? detectingObject : 'Caption';
    if (apiStatus === 'error') return `${label} • Error`;
    if (isDetecting) return `${label} • Processing`;
    if (isMoving) return `${label} • Moving`;
    if (detections.length > 0) return `${label} • Detected`;
    return `${label} • ${motionStatus}`;
  };

  const getSubText = () => {
    if (isDetecting) return 'Analyzing...';
    if (isMoving) return 'Move away to clear';
    if (mode === 'detect') {
      const count = detections.length;
      return count > 0 ? `Found: ${count} ${detectingObject}(s)` : 'Tap scan to detect';
    }
    return apiFeedback || 'Tap describe';
  };

  return (
    <View style={styles.container}>
      <View style={[styles.dot, { backgroundColor: getColor() }]} />
      <View style={styles.textContainer}>
        <Text style={styles.mainText}>{getMainText()}</Text>
        <Text style={styles.subText}>{getSubText()}</Text>
      </View>
      {isDetecting && <ActivityIndicator size="small" color="#4ecdc4" style={styles.spinner} />}
      {detections.length > 0 && !isDetecting && (
        <View style={styles.detectionBadge}>
          <Text style={styles.detectionCount}>{detections.length}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 170,
    right: Dimensions.get('window').width * 0.05,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30,30,30,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  textContainer: {
    flex: 1,
  },
  mainText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  subText: {
    fontSize: 11,
    color: '#ccc',
    fontWeight: '500',
  },
  spinner: {
    marginLeft: 8,
  },
  detectionBadge: {
    backgroundColor: '#00FF00',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  detectionCount: {
    color: '#000',
    fontSize: 12,
    fontWeight: '800',
  },
});