// import React from 'react';
// import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// interface DebugPanelProps {
//   apiStatus: string;
//   onTestApi: () => void;
// }

// export default function DebugPanel({ apiStatus, onTestApi }: DebugPanelProps) {
//   if (apiStatus !== 'error') return null;

//   return (
//     <View style={styles.debugContainer}>
//       <Text style={styles.debugText}>
//         ⚠️ Check console for details
//       </Text>
//       <TouchableOpacity onPress={onTestApi} style={styles.debugButton}>
//         <Text style={styles.debugButtonText}>Test API</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   debugContainer: {
//     position: 'absolute',
//     top: 190,
//     left: 20,
//     right: 20,
//     backgroundColor: 'rgba(255,0,0,0.8)',
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 10,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   debugText: {
//     color: '#fff',
//     fontSize: 12,
//     fontWeight: '500',
//   },
//   debugButton: {
//     backgroundColor: 'rgba(255,255,255,0.3)',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 5,
//   },
//   debugButtonText: {
//     color: '#fff',
//     fontSize: 10,
//     fontWeight: 'bold',
//   },
// });