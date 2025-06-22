import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface CameraOverlayProps {
  mode: string;
  isDetecting: boolean;
  isMoving: boolean;
  showPhotos: boolean;
  onToggleMode: () => void;
  onManualDetect: () => void;
  onToggleCameraFacing: () => void;
  onCycleObject: () => void;
}

export default function CameraOverlay({
  mode,
  isDetecting,
  isMoving,
  showPhotos,
  onToggleMode,
  onManualDetect,
  onToggleCameraFacing,
  onCycleObject,
}: CameraOverlayProps) {
  const showInstructions = !showPhotos;

  const instructionText = isMoving
    ? ` Hold steady to ${mode === 'detect' ? 'detect objects' : 'describe scene'}`
    : ` ${mode === 'detect' ? 'Auto-detection' : 'AI description'} active`;

  const handleDescribePress = () => {
    if (mode !== 'caption') onToggleMode();
    onManualDetect();
  };

  const handleScanPress = () => {
    if (mode !== 'detect') onToggleMode();
    onManualDetect();
  };

  return (
    <>
      {showInstructions && (
        <View style={styles.instructionContainer}>
          <Text style={styles.instruction}>{instructionText}</Text>
        </View>
      )}

      <View style={styles.controlsContainer}>
        {/* Describe (Left) */}
        <TouchableOpacity
          style={[styles.controlButton, styles.describeButton]}
          onPress={handleDescribePress}
          disabled={isDetecting}
        >
          <MaterialCommunityIcons name="text-box-search-outline" size={22} color="#fff" />
          <Text style={styles.label}>Describe</Text>
        </TouchableOpacity>

        {/* Scan, Flip, and Object Buttons (Right Column) */}
        <View style={styles.rightControls}>
          <TouchableOpacity
            style={[styles.controlButton, styles.scanButton]}
            onPress={handleScanPress}
            disabled={isDetecting}
          >
            <Ionicons name="scan" size={22} color="#fff" />
            <Text style={styles.label}>Scan</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, styles.flipButton]}
            onPress={onToggleCameraFacing}
          >
            <Ionicons name="camera-reverse-outline" size={22} color="#fff" />
            <Text style={styles.label}>Flip</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, styles.objectButton]}
            onPress={onCycleObject}
          >
            <MaterialCommunityIcons name="shape-outline" size={22} color="#fff" />
            <Text style={styles.label}>Object</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  instructionContainer: {
    position: 'absolute',
    bottom: 140,
    alignSelf: 'center',
    alignItems: 'center',
    gap: 8,
  },
  instruction: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    textAlign: 'center',
  },

  controlsContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  rightControls: {
    flexDirection: 'column',
    gap: 12,
  },
  controlButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    alignItems: 'center',
    minWidth: 70,
  },
  describeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  scanButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  flipButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  objectButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  label: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
});