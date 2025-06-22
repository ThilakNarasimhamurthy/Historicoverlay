import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Enhanced historical data with multiple images per period
const centreStreetTimelineData = {
  "timeline": [
    {
      "period": "1940–1960",
      "year": 1940,
      "thumbnail": require('@/assets/images/1940.jpg'),
      "images": [
        {
          "id": 1,
          "source": require('@/assets/images/1940.jpg'),
          "caption": "60 Centre Street courthouse facade in the 1940s",
          "description": "The imposing neoclassical facade during the post-war era"
        },
        {
          "id": 2,
          "source": require('@/assets/images/1940.jpg'),
          "caption": "Art Deco 'Tombs' construction across the street",
          "description": "Manhattan House of Detention under construction in 1941"
        },
        {
          "id": 3,
          "source": require('@/assets/images/1940.jpg'),
          "caption": "Justice and Authority statues in original position",
          "description": "The iconic statues before their 1960 relocation"
        }
      ],
      "events": [
        {
          "year": 1941,
          "title": "Art‑Deco 'Tombs' built",
          "description": "Manhattan House of Detention replaced the old jail across Centre Street.",
          "type": "architecture"
        },
        {
          "year": 1960,
          "title": "Statues relocated",
          "description": "Justice and Authority moved behind courthouse due to street/subway expansion.",
          "type": "civic"
        },
        {
          "year": 1966,
          "title": "Exterior Landmarked",
          "description": "60 Centre St exterior officially designated a New York City landmark.",
          "type": "designation"
        }
      ]
    },
    {
      "period": "1960–1980",
      "year": 1960,
      "thumbnail": require('@/assets/images/1940.jpg'),
      "images": [
        {
          "id": 1,
          "source": require('@/assets/images/1940.jpg'),
          "caption": "Vietnam War protest at Foley Square, 1967",
          "description": "Up to 400,000 protesters gathered for peace rally"
        },
        {
          "id": 2,
          "source": require('@/assets/images/1940.jpg'),
          "caption": "Courthouse during the civil rights era",
          "description": "The building during turbulent social change period"
        },
        {
          "id": 3,
          "source": require('@/assets/images/1940.jpg'),
          "caption": "Interior landmark designation ceremony, 1981",
          "description": "Officials celebrating the courthouse's heritage recognition"
        }
      ],
      "events": [
        {
          "year": 1967,
          "title": "Mass Anti‑Vietnam Rally",
          "description": "Up to 400k protesters in Foley Square marched to the UN for peace. Largest US anti‑war rally to date.",
          "type": "protest",
          "source": "Largest US anti‑war rally to date"
        },
        {
          "year": 1981,
          "title": "Interior Landmarked",
          "description": "Courthouse interior received official landmark status.",
          "type": "designation"
        }
      ]
    },
    {
      "period": "1980–2020 & Present",
      "year": 1980,
      "thumbnail": require('@/assets/images/1940.jpg'),
      "images": [
        {
          "id": 1,
          "source": require('@/assets/images/1940.jpg'),
          "caption": "Modern courthouse operations",
          "description": "The courthouse serving NYC's legal system today"
        },
        {
          "id": 2,
          "source": require('@/assets/images/1940.jpg'),
          "caption": "Lemmon Slave Case exhibit opening, 2023",
          "description": "Historical Society event in the courthouse rotunda"
        },
        {
          "id": 3,
          "source": require('@/assets/images/1940.jpg'),
          "caption": "Foster Memorial restoration unveiling",
          "description": "Rebecca Salome Foster memorial in courthouse vestibule"
        }
      ],
      "events": [
        {
          "year": 2023,
          "title": "Lemmon Slave Case Exhibit",
          "description": "The courthouse hosted the finale of the statewide Lemmon Slave Case exhibit. Historical Society event at Centre St rotunda.",
          "type": "exhibit",
          "link": "Historical Society event at Centre St rotunda"
        },
        {
          "year": 2023,
          "title": "Foster Memorial Rededicated",
          "description": "Rebecca Salome Foster memorial relief restored and unveiled in courthouse vestibule.",
          "type": "heritage",
          "link": "Public art restoration event"
        }
      ]
    }
  ]
};

// Event type colors and icons
const eventTypeStyles = {
  architecture: { color: '#FF6B6B', icon: '🏛️' },
  civic: { color: '#4ECDC4', icon: '⚖️' },
  designation: { color: '#45B7D1', icon: '🏆' },
  protest: { color: '#96CEB4', icon: '✊' },
  exhibit: { color: '#FECA57', icon: '🎨' },
  heritage: { color: '#FF9FF3', icon: '📜' }
};

interface TimelineProps {
  building?: {
    id: number;
    name: string;
    location: string;
    image?: any;
  } | null;
  onBack: () => void;
  customTimelineData?: any;
}

export default function TimelineComponent({ building, onBack, customTimelineData }: TimelineProps) {
  console.log('🕒 Enhanced TimelineComponent rendered with building:', building);
  
  const [currentPeriodIndex, setCurrentPeriodIndex] = useState(0);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // ✅ NEW: Track current image in period
  
  // Use custom data or default to Centre Street historical data
  const timelineData = customTimelineData || centreStreetTimelineData;
  const periods = timelineData.timeline || [];
  
  console.log('📊 Timeline periods loaded:', periods.length);
  
  if (!periods || periods.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.buildingName}>No Timeline Data</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>No historical data available</Text>
          <TouchableOpacity onPress={onBack} style={styles.backButtonLarge}>
            <Text style={styles.backButtonLargeText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!building) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.buildingName}>60 Centre Street</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading building data...</Text>
          <TouchableOpacity onPress={onBack} style={styles.backButtonLarge}>
            <Text style={styles.backButtonLargeText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const currentPeriod = periods[currentPeriodIndex];
  const currentEvent = currentPeriod?.events[currentEventIndex];
  const currentImage = currentPeriod?.images[currentImageIndex];
  const eventStyle = eventTypeStyles[currentEvent?.type] || eventTypeStyles.heritage;

  // ✅ NEW: Handle image navigation
  const handleNextImage = () => {
    if (currentImageIndex < currentPeriod.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    } else {
      setCurrentImageIndex(0); // Loop back to first image
    }
  };

  const handlePreviousImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    } else {
      setCurrentImageIndex(currentPeriod.images.length - 1); // Loop to last image
    }
  };

  const handleImageDotPress = (imageIndex: number) => {
    setCurrentImageIndex(imageIndex);
  };

  const handleNextEvent = () => {
    if (currentEventIndex < currentPeriod.events.length - 1) {
      setCurrentEventIndex(currentEventIndex + 1);
    } else if (currentPeriodIndex < periods.length - 1) {
      // Move to next period
      setCurrentPeriodIndex(currentPeriodIndex + 1);
      setCurrentEventIndex(0);
      setCurrentImageIndex(0); // Reset image index
    }
  };

  const handlePreviousEvent = () => {
    if (currentEventIndex > 0) {
      setCurrentEventIndex(currentEventIndex - 1);
    } else if (currentPeriodIndex > 0) {
      // Move to previous period
      setCurrentPeriodIndex(currentPeriodIndex - 1);
      setCurrentEventIndex(periods[currentPeriodIndex - 1].events.length - 1);
      setCurrentImageIndex(0); // Reset image index
    }
  };

  const handleThumbnailPress = (periodIndex: number) => {
    setCurrentPeriodIndex(periodIndex);
    setCurrentEventIndex(0);
    setCurrentImageIndex(0); // Reset image index when changing periods
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.buildingName}>{building.name}</Text>
          <Text style={styles.buildingLocation}>{building.location} • Historical Timeline</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.timelineLayout}>
          {/* ✅ ENHANCED: Main Image Section with Navigation */}
          <View style={styles.mainImageSection}>
            <View style={styles.mainImageContainer}>
              <Image source={currentImage.source} style={styles.mainImage} />
              
              {/* Image Navigation Overlay */}
              <View style={styles.imageNavOverlay}>
                <TouchableOpacity 
                  style={styles.imageNavButton}
                  onPress={handlePreviousImage}
                >
                  <Text style={styles.imageNavText}>‹</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.imageNavButton}
                  onPress={handleNextImage}
                >
                  <Text style={styles.imageNavText}>›</Text>
                </TouchableOpacity>
              </View>

              {/* Image Info Overlay */}
              <View style={styles.imageInfoOverlay}>
                <View style={[styles.periodBadge, { backgroundColor: eventStyle.color }]}>
                  <Text style={styles.periodBadgeText}>{currentPeriod.period}</Text>
                </View>
                
                {/* ✅ NEW: Image Caption */}
                <View style={styles.imageCaptionContainer}>
                  <Text style={styles.imageCaption}>{currentImage.caption}</Text>
                  <Text style={styles.imageDescription}>{currentImage.description}</Text>
                </View>
                
                {/* ✅ NEW: Image Dots Indicator */}
                <View style={styles.imageDots}>
                  {currentPeriod.images.map((_, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.imageDot,
                        index === currentImageIndex && styles.activeImageDot
                      ]}
                      onPress={() => handleImageDotPress(index)}
                    />
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* Right Side Content */}
          <View style={styles.rightSection}>
            {/* Period Thumbnails */}
            <View style={styles.thumbnailSection}>
              {periods.map((period, index) => (
                <TouchableOpacity
                  key={period.period}
                  style={[
                    styles.thumbnailContainer,
                    index === currentPeriodIndex && styles.activeThumbnail
                  ]}
                  onPress={() => handleThumbnailPress(index)}
                >
                  <Image source={period.thumbnail} style={styles.thumbnailImage} />
                  <Text style={styles.thumbnailYear}>{period.year}s</Text>
                  {/* ✅ NEW: Image count indicator */}
                  <View style={styles.thumbnailImageCount}>
                    <Text style={styles.thumbnailImageCountText}>
                      {period.images.length} photos
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Event Details Section */}
        <View style={styles.eventSection}>
          {/* Large Year Display */}
          <View style={styles.yearContainer}>
            <Text style={styles.largeYear}>{currentEvent.year}</Text>
            <View style={[styles.eventTypeBadge, { backgroundColor: eventStyle.color }]}>
              <Text style={styles.eventTypeIcon}>{eventStyle.icon}</Text>
              <Text style={styles.eventTypeText}>{currentEvent.type}</Text>
            </View>
          </View>
          
          {/* Event Details */}
          <View style={styles.eventDetails}>
            <Text style={styles.eventTitle}>{currentEvent.title}</Text>
            <Text style={styles.eventDescription}>{currentEvent.description}</Text>
            
            {currentEvent.source && (
              <Text style={styles.eventSource}>📍 {currentEvent.source}</Text>
            )}
            
            {currentEvent.link && (
              <Text style={styles.eventLink}>🔗 {currentEvent.link}</Text>
            )}
          </View>

          {/* ✅ ENHANCED: Period Overview with Image Info */}
          <View style={styles.periodOverview}>
            <Text style={styles.periodTitle}>Period Overview: {currentPeriod.period}</Text>
            <View style={styles.overviewStats}>
              <Text style={styles.periodSummary}>
                Event {currentEventIndex + 1} of {currentPeriod.events.length}
              </Text>
              <Text style={styles.periodSummary}>
                Photo {currentImageIndex + 1} of {currentPeriod.images.length}
              </Text>
            </View>
            
            {/* Event dots for current period */}
            <View style={styles.eventDots}>
              {currentPeriod.events.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setCurrentEventIndex(index)}
                  style={[
                    styles.eventDot,
                    index === currentEventIndex && styles.activeEventDot,
                    { backgroundColor: index === currentEventIndex ? eventStyle.color : '#e0e0e0' }
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Navigation */}
          <View style={styles.navigationSection}>
            <TouchableOpacity 
              style={[styles.navButton, (currentPeriodIndex === 0 && currentEventIndex === 0) && styles.disabledButton]}
              onPress={handlePreviousEvent}
              disabled={currentPeriodIndex === 0 && currentEventIndex === 0}
            >
              <Text style={[styles.navButtonText, (currentPeriodIndex === 0 && currentEventIndex === 0) && styles.disabledText]}>
                ← Previous
              </Text>
            </TouchableOpacity>
            
            <View style={styles.progressIndicator}>
              <Text style={styles.progressText}>
                {currentPeriod.period}
              </Text>
              <View style={styles.progressDots}>
                {periods.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.progressDot,
                      index === currentPeriodIndex && styles.activeProgressDot
                    ]}
                  />
                ))}
              </View>
            </View>

            <TouchableOpacity 
              style={[
                styles.navButton, 
                (currentPeriodIndex === periods.length - 1 && currentEventIndex === currentPeriod.events.length - 1) && styles.disabledButton
              ]}
              onPress={handleNextEvent}
              disabled={currentPeriodIndex === periods.length - 1 && currentEventIndex === currentPeriod.events.length - 1}
            >
              <Text style={[
                styles.navButtonText, 
                (currentPeriodIndex === periods.length - 1 && currentEventIndex === currentPeriod.events.length - 1) && styles.disabledText
              ]}>
                Next →
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    paddingRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  headerInfo: {
    flex: 1,
  },
  buildingName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c2c2c',
    marginBottom: 2,
  },
  buildingLocation: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  timelineLayout: {
    flexDirection: 'row',
    padding: 20,
    height: height * 0.5,
  },
  mainImageSection: {
    flex: 2,
    marginRight: 20,
  },
  mainImageContainer: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e0e0',
  },
  // ✅ NEW: Image Navigation Overlay
  imageNavOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  imageNavButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageNavText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  // ✅ NEW: Enhanced Image Info Overlay
  imageInfoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
    padding: 16,
  },
  periodBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  periodBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  // ✅ NEW: Image Caption Styles
  imageCaptionContainer: {
    marginBottom: 12,
  },
  imageCaption: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  imageDescription: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.9,
    lineHeight: 16,
  },
  // ✅ NEW: Image Dots
  imageDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  imageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  activeImageDot: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  rightSection: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  thumbnailSection: {
    gap: 12,
  },
  thumbnailContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeThumbnail: {
    borderWidth: 3,
    borderColor: '#007AFF',
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  thumbnailImage: {
    width: '100%',
    height: 60,
    backgroundColor: '#e0e0e0',
  },
  thumbnailYear: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2c2c2c',
    textAlign: 'center',
    paddingVertical: 4,
  },
  // ✅ NEW: Thumbnail Image Count
  thumbnailImageCount: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 2,
  },
  thumbnailImageCountText: {
    fontSize: 9,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  eventSection: {
    backgroundColor: '#fff',
    margin: 20,
    marginTop: 0,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  yearContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  largeYear: {
    fontSize: 64,
    fontWeight: '800',
    color: '#2c2c2c',
    letterSpacing: -2,
    marginRight: 16,
  },
  eventTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  eventTypeIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  eventTypeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  eventDetails: {
    marginBottom: 24,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2c2c2c',
    marginBottom: 12,
    lineHeight: 30,
  },
  eventDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4a4a4a',
    marginBottom: 12,
  },
  eventSource: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  eventLink: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  periodOverview: {
    marginBottom: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  periodTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c2c2c',
    marginBottom: 8,
  },
  // ✅ NEW: Overview Stats
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  periodSummary: {
    fontSize: 14,
    color: '#666',
  },
  eventDots: {
    flexDirection: 'row',
    gap: 8,
  },
  eventDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e0e0e0',
  },
  activeEventDot: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  navigationSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  navButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  disabledButton: {
    opacity: 0.3,
  },
  navButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  disabledText: {
    color: '#ccc',
  },
  progressIndicator: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c2c2c',
    marginBottom: 8,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 6,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
  },
  activeProgressDot: {
    backgroundColor: '#007AFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
    marginBottom: 20,
  },
  backButtonLarge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonLargeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});