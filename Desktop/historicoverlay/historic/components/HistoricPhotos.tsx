import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet, Dimensions, Modal } from 'react-native';

const { width, height } = Dimensions.get('window');

// Sample building data (max 6 items)
const buildingData = [
  { 
    id: 1,
    name: 'Historic Facade 1', 
    location: 'Downtown',
    image: require('@/assets/images/1940.jpg') 
  },
  { 
    id: 2,
    name: 'Courthouse Hall', 
    location: 'Midtown',
    image: require('@/assets/images/1940.jpg') 
  },
  { 
    id: 3,
    name: 'Old Brick House', 
    location: 'Uptown',
    image: require('@/assets/images/1940.jpg') 
  },
  { 
    id: 4,
    name: 'Art Deco Tower', 
    location: 'Downtown',
    image: require('@/assets/images/1940.jpg') 
  },
  { 
    id: 5,
    name: 'Victorian Manor', 
    location: 'Historic District',
    image: require('@/assets/images/1940.jpg') 
  },
  { 
    id: 6,
    name: 'Vintage Villa', 
    location: 'Riverside',
    image: require('@/assets/images/1940.jpg') 
  },
];

interface HistoricPhotosProps {
  visible: boolean;
  onClose: () => void;
  onBuildingSelect?: (building: any) => void;
}

export default function HistoricPhotos({ visible, onClose, onBuildingSelect }: HistoricPhotosProps) {
  const handleBuildingPress = (building: any) => {
    console.log('🏢 Building selected:', building);
    
    if (onBuildingSelect && building) {
      onBuildingSelect(building);
      onClose();
    } else {
      console.error('❌ onBuildingSelect not provided or building is null');
    }
  };

  const handleOverlayPress = () => {
    onClose();
  };

  const handleContainerPress = (event: any) => {
    event.stopPropagation();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={handleOverlayPress}
      >
        <TouchableOpacity 
          style={styles.modalContainer}
          activeOpacity={1}
          onPress={handleContainerPress}
        >
          <View style={styles.modalHeader}>
            <View style={styles.headerContent}>
              <Text style={styles.modalTitle}>Detected Buildings in Your Area</Text>
              <Text style={styles.modalSubtitle}>Explore unique facades and local architecture</Text>
            </View>
            <TouchableOpacity 
              style={styles.closeBtn}
              onPress={onClose}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.gridContainer}>
              {buildingData.map((building) => (
                <TouchableOpacity
                  key={building.id}
                  style={styles.buildingCard}
                  onPress={() => handleBuildingPress(building)}
                  activeOpacity={0.8}
                >
                  <Image source={building.image} style={styles.buildingImage} />
                  <View style={styles.buildingInfo}>
                    <Text style={styles.buildingName}>{building.name}</Text>
                    <Text style={styles.buildingLocation}>{building.location}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.9,
    height: height * 0.8,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#f5f5f5',
  },
  headerContent: {
    flex: 1,
  },
  modalTitle: {
    color: '#2c2c2c',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  modalSubtitle: {
    color: '#666',
    fontSize: 14,
    fontWeight: '400',
  },
  closeBtn: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  closeBtnText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  buildingCard: {
    width: '48%',
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buildingImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: '#e0e0e0',
  },
  buildingInfo: {
    padding: 12,
  },
  buildingName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c2c2c',
    marginBottom: 4,
  },
  buildingLocation: {
    fontSize: 12,
    color: '#666',
    fontWeight: '400',
  },
});