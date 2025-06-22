// import React from 'react';
// import { View, Text, StyleSheet } from 'react-native';

// interface InstructionOverlayProps {
//   showPhotos: boolean;
//   isMoving: boolean;
//   mode: string;
// }

// export default function InstructionOverlay({
//   showPhotos,
//   isMoving,
//   mode
// }: InstructionOverlayProps) {
//   // Don't render if photos panel is showing
//   if (showPhotos) return null;

//   // Determine instruction text based on movement and mode
//   const instructionText = isMoving
//     ? `Hold steady to ${mode === 'detect' ? 'detect objects' : 'describe scene'}`
//     : `${mode === 'detect' ? 'Auto-detection' : 'AI description'} active`;

//   return (
//     <View style={styles.container}>
//       <Text style={styles.instruction}>
//         {instructionText}
//       </Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     position: 'absolute',
//     bottom: 160,
//     alignSelf: 'center',
//     alignItems: 'center',
//     gap: 8,
//   },
//   instruction: {
//     backgroundColor: 'rgba(0,0,0,0.6)',
//     color: '#fff',
//     fontSize: 14,
//     fontWeight: '500',
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 20,
//     textAlign: 'center',
//   },
//   swipeHint: {
//     backgroundColor: 'rgba(0,0,0,0.6)',
//     color: '#fff',
//     fontSize: 12,
//     fontWeight: '500',
//     paddingHorizontal: 16,
//     paddingVertical: 6,
//     borderRadius: 15,
//   },
// });