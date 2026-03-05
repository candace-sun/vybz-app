import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Modal,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Music, X, Bookmark, MapPin, Radio, Navigation } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';

import Colors from '@/constants/colors';
import { MusicDrop } from '@/mocks/data';

const theme = Colors.dark;

const genreColors: Record<string, string> = {
  Pop: '#FF2D78',
  Rap: '#6C2BD9',
  'R&B': '#FFD700',
  EDM: '#00FF88',
};

const SONG_POOL: { song: string; artist: string; genre: string }[] = [
  { song: 'Levitating', artist: 'Dua Lipa', genre: 'Pop' },
  { song: 'Blinding Lights', artist: 'The Weeknd', genre: 'Pop' },
  { song: 'HUMBLE.', artist: 'Kendrick Lamar', genre: 'Rap' },
  { song: 'Pink + White', artist: 'Frank Ocean', genre: 'R&B' },
  { song: 'Midnight City', artist: 'M83', genre: 'EDM' },
  { song: 'Good Days', artist: 'SZA', genre: 'R&B' },
  { song: 'Starboy', artist: 'The Weeknd', genre: 'Pop' },
  { song: 'Money Trees', artist: 'Kendrick Lamar', genre: 'Rap' },
  { song: 'Nights', artist: 'Frank Ocean', genre: 'R&B' },
  { song: 'Strobe', artist: 'Deadmau5', genre: 'EDM' },
  { song: 'Sicko Mode', artist: 'Travis Scott', genre: 'Rap' },
  { song: 'Feels Like Summer', artist: 'Childish Gambino', genre: 'R&B' },
];

function generateDropsNearLocation(lat: number, lng: number): MusicDrop[] {
  const drops: MusicDrop[] = [];
  const shuffled = [...SONG_POOL].sort(() => Math.random() - 0.5);
  const count = Math.min(8, shuffled.length);

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const radiusMeters = 30 + Math.random() * 350;
    const dLat = (radiusMeters / 111320) * Math.cos(angle);
    const dLng = (radiusMeters / (111320 * Math.cos(lat * (Math.PI / 180)))) * Math.sin(angle);

    drops.push({
      id: String(i + 1),
      song: shuffled[i].song,
      artist: shuffled[i].artist,
      genre: shuffled[i].genre,
      distance: Math.round(radiusMeters),
      x: 0,
      y: 0,
      latitude: lat + dLat,
      longitude: lng + dLng,
      collected: Math.random() < 0.15,
    });
  }

  return drops;
}

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#0a0a1a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0a0a1a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6b6b8d' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a1a3e' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#12122a' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#080818' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#12122a' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#1a1a3e' }] },
];

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const [selectedDrop, setSelectedDrop] = useState<MusicDrop | null>(null);
  const [showModal, setShowModal] = useState(false);
  const slideAnim = useRef(new Animated.Value(300)).current;
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [drops, setDrops] = useState<MusicDrop[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function fetchLocation() {
      try {
        console.log('[Map] Requesting location permissions...');
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('[Map] Location permission denied');
          setLocationError('Location permission denied. Enable it in settings to see drops near you.');
          setLoading(false);
          return;
        }

        console.log('[Map] Getting current position...');
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (cancelled) return;

        const { latitude, longitude } = position.coords;
        console.log('[Map] Got location:', latitude, longitude);
        setUserLocation({ latitude, longitude });

        const nearbyDrops = generateDropsNearLocation(latitude, longitude);
        console.log('[Map] Generated', nearbyDrops.length, 'drops near user');
        setDrops(nearbyDrops);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        console.log('[Map] Location error:', err);
        setLocationError('Could not get your location. Please try again.');
        setLoading(false);
      }
    }

    fetchLocation();
    return () => { cancelled = true; };
  }, []);

  const region = useMemo(() => {
    if (!userLocation) return undefined;
    return {
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      latitudeDelta: 0.012,
      longitudeDelta: 0.012,
    };
  }, [userLocation]);

  const handleMarkerPress = useCallback((drop: MusicDrop) => {
    console.log('Marker pressed:', drop.song);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedDrop(drop);
    setShowModal(true);
    slideAnim.setValue(300);
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 20 }).start();
  }, [slideAnim]);

  const handleClose = useCallback(() => {
    Animated.timing(slideAnim, { toValue: 300, duration: 200, useNativeDriver: true }).start(() => {
      setShowModal(false);
      setSelectedDrop(null);
    });
  }, [slideAnim]);

  const handleRecenter = useCallback(() => {
    if (userLocation && mapRef.current) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.012,
        longitudeDelta: 0.012,
      }, 500);
    }
  }, [userLocation]);

  return (
    <View style={styles.container}>
      <View style={[styles.mapHeader, { paddingTop: insets.top + 12 }]}>
        <View>
          <Text style={styles.mapTitle}>Music Map</Text>
          <Text style={styles.mapSub}>
            {loading ? 'Locating you...' : `${drops.length} drops nearby`}
          </Text>
        </View>
        <View style={styles.radarBadge}>
          <Radio size={16} color={theme.neonGreen} />
          <Text style={styles.radarText}>Live</Text>
        </View>
      </View>

      <View style={styles.mapArea}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.pink} />
            <Text style={styles.loadingText}>Finding your location...</Text>
          </View>
        ) : locationError ? (
          <View style={styles.loadingContainer}>
            <MapPin size={36} color={theme.pink} />
            <Text style={styles.errorText}>{locationError}</Text>
          </View>
        ) : region ? (
          <>
            <MapView
              ref={mapRef}
              style={styles.map}
              provider={PROVIDER_DEFAULT}
              initialRegion={region}
              customMapStyle={Platform.OS === 'android' ? darkMapStyle : undefined}
              userInterfaceStyle="dark"
              showsUserLocation
              showsMyLocationButton={false}
              showsPointsOfInterest={false}
              showsBuildings={false}
              testID="music-map"
            >
              {drops.map((drop) => {
                const color = genreColors[drop.genre] || theme.pink;
                return (
                  <Marker
                    key={drop.id}
                    coordinate={{
                      latitude: drop.latitude,
                      longitude: drop.longitude,
                    }}
                    onPress={() => handleMarkerPress(drop)}
                    testID={`marker-${drop.id}`}
                  >
                    <View style={styles.markerContainer}>
                      <View style={[styles.markerPulse, { backgroundColor: color }]} />
                      <View style={[styles.markerCore, { backgroundColor: color, shadowColor: color }]}>
                        <Music size={12} color="#fff" />
                      </View>
                      {drop.collected && <View style={styles.collectedDot} />}
                    </View>
                  </Marker>
                );
              })}
            </MapView>

            <Pressable style={styles.recenterBtn} onPress={handleRecenter} testID="recenter-btn">
              <Navigation size={18} color={theme.text} />
            </Pressable>

            <View style={styles.legendOverlay}>
              {Object.entries(genreColors).map(([genre, color]) => (
                <View key={genre} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: color }]} />
                  <Text style={styles.legendText}>{genre}</Text>
                </View>
              ))}
            </View>
          </>
        ) : null}
      </View>

      <Modal visible={showModal} transparent animationType="none">
        <Pressable style={styles.modalOverlay} onPress={handleClose}>
          <Animated.View
            style={[styles.modalSheet, { transform: [{ translateY: slideAnim }] }]}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHandle} />
              {selectedDrop && (
                <>
                  <View style={styles.modalHeader}>
                    <View style={[styles.modalGenreDot, { backgroundColor: genreColors[selectedDrop.genre] || theme.pink }]} />
                    <Text style={styles.modalGenre}>{selectedDrop.genre}</Text>
                    <Pressable onPress={handleClose} style={styles.modalClose}>
                      <X size={20} color={theme.textSecondary} />
                    </Pressable>
                  </View>
                  <Text style={styles.modalSong}>{selectedDrop.song}</Text>
                  <Text style={styles.modalArtist}>by {selectedDrop.artist}</Text>
                  <View style={styles.distanceBadge}>
                    <MapPin size={14} color={theme.textSecondary} />
                    <Text style={styles.distanceText}>{selectedDrop.distance}m away</Text>
                  </View>
                  {selectedDrop.distance > 100 && (
                    <Text style={styles.proximityHint}>Walk closer to collect this drop</Text>
                  )}
                  <View style={styles.modalActions}>
                    <Pressable
                      style={[styles.collectBtn, selectedDrop.distance > 100 && styles.collectBtnDisabled]}
                      onPress={() => {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        handleClose();
                      }}
                    >
                      <Text style={styles.collectBtnText}>
                        {selectedDrop.collected ? 'Collected ✓' : 'Collect'}
                      </Text>
                    </Pressable>
                    <Pressable style={styles.saveBtn}>
                      <Bookmark size={18} color={theme.neonGreen} />
                      <Text style={styles.saveBtnText}>Save on Spotify</Text>
                    </Pressable>
                  </View>
                </>
              )}
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 14,
    zIndex: 10,
  },
  mapTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: theme.text,
  },
  mapSub: {
    fontSize: 13,
    color: theme.textSecondary,
    marginTop: 2,
  },
  radarBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.neonGreenDim,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  radarText: {
    color: theme.neonGreen,
    fontSize: 13,
    fontWeight: '700' as const,
  },
  mapArea: {
    flex: 1,
    margin: 16,
    marginTop: 0,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(108, 43, 217, 0.25)',
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a1a',
    gap: 16,
  },
  loadingText: {
    color: theme.textSecondary,
    fontSize: 15,
    fontWeight: '500' as const,
  },
  errorText: {
    color: theme.textSecondary,
    fontSize: 15,
    fontWeight: '500' as const,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 22,
  },
  markerContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerPulse: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    opacity: 0.25,
  },
  markerCore: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  collectedDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.neonGreen,
    borderWidth: 1,
    borderColor: '#080818',
  },
  recenterBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(10, 10, 26, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(108, 43, 217, 0.3)',
  },
  legendOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    gap: 10,
    backgroundColor: 'rgba(10, 10, 26, 0.85)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(108, 43, 217, 0.2)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    color: theme.textSecondary,
    fontSize: 11,
    fontWeight: '600' as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: theme.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    borderBottomWidth: 0,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.textMuted,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalGenreDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  modalGenre: {
    fontSize: 14,
    color: theme.textSecondary,
    fontWeight: '600' as const,
    flex: 1,
  },
  modalClose: {
    padding: 4,
  },
  modalSong: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: theme.text,
  },
  modalArtist: {
    fontSize: 16,
    color: theme.textSecondary,
    marginTop: 4,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    backgroundColor: theme.surfaceLight,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  distanceText: {
    fontSize: 13,
    color: theme.textSecondary,
    fontWeight: '500' as const,
  },
  proximityHint: {
    fontSize: 13,
    color: theme.pink,
    marginTop: 10,
    fontWeight: '500' as const,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  collectBtn: {
    flex: 1,
    backgroundColor: theme.pink,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  collectBtnDisabled: {
    opacity: 0.5,
  },
  collectBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700' as const,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.neonGreenDim,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 14,
  },
  saveBtnText: {
    color: theme.neonGreen,
    fontSize: 13,
    fontWeight: '600' as const,
  },
});
