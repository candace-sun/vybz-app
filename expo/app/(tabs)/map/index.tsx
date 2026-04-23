import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Modal,
  Platform,
  ActivityIndicator,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Music,
  X,
  Play,
  Pause,
  ExternalLink,
  MapPin,
  Radio,
  Navigation,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { Image } from "expo-image";
import { Audio } from "expo-av";

import Colors from "@/constants/colors";
import { getNearbyDrops, collectDrop, Drop } from "@/services/api";

const theme = Colors.dark;

const genreColors: Record<string, string> = {
  "Modern Pop": "#FF2D78",
  Rap: "#6C2BD9",
  "R&B": "#FFD700",
  EDM: "#00FF88",
  Indie: "#4FC3F7",
};

const rarityColors: Record<string, string> = {
  common: theme.textMuted,
  uncommon: theme.neonGreen,
  rare: "#4FC3F7",
  epic: theme.purpleLight,
  legendary: theme.coinYellow,
};

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#0a0a1a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0a0a1a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#6b6b8d" }] },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#1a1a3e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#12122a" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#080818" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#12122a" }],
  },
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1a1a3e" }],
  },
];

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const [selectedDrop, setSelectedDrop] = useState<Drop | null>(null);
  const [showModal, setShowModal] = useState(false);
  const slideAnim = useRef(new Animated.Value(300)).current;
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [drops, setDrops] = useState<Drop[]>([]);
  const [collecting, setCollecting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  // Stop audio when screen unmounts
  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchLocation() {
      try {
        console.log("[Map] Requesting location permissions...");
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.log("[Map] Location permission denied");
          setLocationError(
            "Location permission denied. Enable it in settings to see drops near you.",
          );
          setLoading(false);
          return;
        }

        console.log("[Map] Getting current position...");
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (cancelled) return;

        const { latitude, longitude } = position.coords;
        console.log("[Map] Got location:", latitude, longitude);
        setUserLocation({ latitude, longitude });

        const nearbyDrops = await getNearbyDrops(latitude, longitude);
        console.log("[Map] Fetched", nearbyDrops.length, "drops near user");
        setDrops(nearbyDrops);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        console.log("[Map] Location error:", err);
        setLocationError("Could not get your location. Please try again.");
        setLoading(false);
      }
    }

    fetchLocation();
    return () => {
      cancelled = true;
    };
  }, []);

  const region = useMemo(() => {
    if (!userLocation) return undefined;
    return {
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      latitudeDelta: 0.008,
      longitudeDelta: 0.008,
    };
  }, [userLocation]);

  const stopAudio = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const handleMarkerPress = useCallback(
    async (drop: Drop) => {
      await stopAudio();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setSelectedDrop(drop);
      setShowModal(true);
      slideAnim.setValue(300);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
      }).start();
    },
    [slideAnim, stopAudio],
  );

  const handleClose = useCallback(() => {
    stopAudio();
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowModal(false);
      setSelectedDrop(null);
    });
  }, [slideAnim, stopAudio]);

  const handleTogglePreview = useCallback(
    async (previewUrl: string) => {
      if (isPlaying) {
        await stopAudio();
        return;
      }
      try {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
        const { sound } = await Audio.Sound.createAsync(
          { uri: previewUrl },
          { shouldPlay: true },
        );
        soundRef.current = sound;
        setIsPlaying(true);
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            stopAudio();
          }
        });
      } catch (e) {
        console.error("Preview playback failed:", e);
      }
    },
    [isPlaying, stopAudio],
  );

  const handleRecenter = useCallback(() => {
    if (userLocation && mapRef.current) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      mapRef.current.animateToRegion(
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.008,
          longitudeDelta: 0.008,
        },
        500,
      );
    }
  }, [userLocation]);

  return (
    <View style={styles.container}>
      <View style={[styles.mapHeader, { paddingTop: insets.top + 12 }]}>
        <View>
          <Text style={styles.mapTitle}>Music Map</Text>
          <Text style={styles.mapSub}>
            {loading ? "Locating you..." : `${drops.length} drops nearby`}
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
              customMapStyle={
                Platform.OS === "android" ? darkMapStyle : undefined
              }
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
                      <View
                        style={[styles.markerPulse, { backgroundColor: color }]}
                      />
                      <View
                        style={[
                          styles.markerCore,
                          { backgroundColor: color, shadowColor: color },
                        ]}
                      >
                        <Music size={12} color="#fff" />
                      </View>
                      {drop.collected && <View style={styles.collectedDot} />}
                    </View>
                  </Marker>
                );
              })}
            </MapView>

            <Pressable
              style={styles.recenterBtn}
              onPress={handleRecenter}
              testID="recenter-btn"
            >
              <Navigation size={18} color={theme.text} />
            </Pressable>

            <View style={styles.legendOverlay}>
              {Object.entries(genreColors).map(([genre, color]) => (
                <View key={genre} style={styles.legendItem}>
                  <View
                    style={[styles.legendDot, { backgroundColor: color }]}
                  />
                  <Text style={styles.legendText}>
                    {genre === "Modern Pop" ? "Pop" : genre}
                  </Text>
                </View>
              ))}
            </View>
          </>
        ) : null}
      </View>

      <Modal visible={showModal} transparent animationType="none">
        <Pressable style={styles.modalOverlay} onPress={handleClose}>
          <Animated.View
            style={[
              styles.modalSheet,
              { transform: [{ translateY: slideAnim }] },
            ]}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHandle} />
              {selectedDrop && (
                <>
                  <View style={styles.modalHeader}>
                    <View
                      style={[
                        styles.modalGenreDot,
                        {
                          backgroundColor:
                            genreColors[selectedDrop.genre] || theme.pink,
                        },
                      ]}
                    />
                    <Text style={styles.modalGenre}>{selectedDrop.genre}</Text>
                    <Pressable onPress={handleClose} style={styles.modalClose}>
                      <X size={20} color={theme.textSecondary} />
                    </Pressable>
                  </View>

                  {/* Album art + song info row */}
                  <View style={styles.songRow}>
                    {selectedDrop.image_url ? (
                      <Image
                        source={{ uri: selectedDrop.image_url }}
                        style={styles.albumArt}
                        contentFit="cover"
                      />
                    ) : (
                      <View
                        style={[styles.albumArt, styles.albumArtPlaceholder]}
                      >
                        <Music size={24} color={theme.textMuted} />
                      </View>
                    )}
                    <View style={styles.songDetails}>
                      <Text style={styles.modalSong} numberOfLines={2}>
                        {selectedDrop.title}
                      </Text>
                      <Text style={styles.modalArtist} numberOfLines={1}>
                        by {selectedDrop.artist}
                      </Text>
                      <View style={styles.metaRow}>
                        <View
                          style={[
                            styles.rarityBadge,
                            {
                              borderColor:
                                rarityColors[selectedDrop.rarity] ?? theme.pink,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.rarityText,
                              {
                                color:
                                  rarityColors[selectedDrop.rarity] ??
                                  theme.pink,
                              },
                            ]}
                          >
                            {selectedDrop.rarity}
                          </Text>
                        </View>
                        <View style={styles.distanceBadge}>
                          <MapPin size={12} color={theme.textSecondary} />
                          <Text style={styles.distanceText}>
                            {Math.round(selectedDrop.distance_meters)}m
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {selectedDrop.distance_meters > 200 && (
                    <Text style={styles.proximityHint}>
                      Walk closer to collect this drop
                    </Text>
                  )}

                  {/* Preview player */}
                  {selectedDrop.preview_url && (
                    <Pressable
                      style={styles.previewBtn}
                      onPress={() =>
                        handleTogglePreview(selectedDrop.preview_url!)
                      }
                    >
                      {isPlaying ? (
                        <Pause size={16} color={theme.text} />
                      ) : (
                        <Play size={16} color={theme.text} />
                      )}
                      <Text style={styles.previewBtnText}>
                        {isPlaying ? "Pause preview" : "Play 30s preview"}
                      </Text>
                    </Pressable>
                  )}

                  <View style={styles.modalActions}>
                    <Pressable
                      style={[
                        styles.collectBtn,
                        (selectedDrop.collected ||
                          selectedDrop.distance_meters > 200) &&
                          styles.collectBtnDisabled,
                      ]}
                      disabled={
                        selectedDrop.collected ||
                        selectedDrop.distance_meters > 200 ||
                        collecting
                      }
                      onPress={async () => {
                        if (selectedDrop.collected || !userLocation) return;
                        setCollecting(true);
                        try {
                          await collectDrop(
                            selectedDrop.id,
                            userLocation.latitude,
                            userLocation.longitude,
                          );
                          Haptics.notificationAsync(
                            Haptics.NotificationFeedbackType.Success,
                          );
                          setDrops((prev) =>
                            prev.map((d) =>
                              d.id === selectedDrop.id
                                ? { ...d, collected: true }
                                : d,
                            ),
                          );
                          setSelectedDrop({ ...selectedDrop, collected: true });
                        } catch (e) {
                          console.error("Failed to collect drop:", e);
                        } finally {
                          setCollecting(false);
                        }
                      }}
                    >
                      {collecting ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.collectBtnText}>
                          {selectedDrop.collected ? "Collected ✓" : "Collect"}
                        </Text>
                      )}
                    </Pressable>
                    {selectedDrop.spotify_url && (
                      <Pressable
                        style={styles.spotifyBtn}
                        onPress={() =>
                          Linking.openURL(selectedDrop.spotify_url!)
                        }
                      >
                        <ExternalLink size={16} color={theme.neonGreen} />
                        <Text style={styles.spotifyBtnText}>Spotify</Text>
                      </Pressable>
                    )}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 14,
    zIndex: 10,
  },
  mapTitle: {
    fontSize: 24,
    fontWeight: "800" as const,
    color: theme.text,
  },
  mapSub: {
    fontSize: 13,
    color: theme.textSecondary,
    marginTop: 2,
  },
  radarBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: theme.neonGreenDim,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  radarText: {
    color: theme.neonGreen,
    fontSize: 13,
    fontWeight: "700" as const,
  },
  mapArea: {
    flex: 1,
    margin: 16,
    marginTop: 0,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(108, 43, 217, 0.25)",
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0a0a1a",
    gap: 16,
  },
  loadingText: {
    color: theme.textSecondary,
    fontSize: 15,
    fontWeight: "500" as const,
  },
  errorText: {
    color: theme.textSecondary,
    fontSize: 15,
    fontWeight: "500" as const,
    textAlign: "center",
    paddingHorizontal: 32,
    lineHeight: 22,
  },
  markerContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  markerPulse: {
    position: "absolute",
    width: 36,
    height: 36,
    borderRadius: 18,
    opacity: 0.25,
  },
  markerCore: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
  },
  collectedDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.neonGreen,
    borderWidth: 1,
    borderColor: "#080818",
  },
  recenterBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(10, 10, 26, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(108, 43, 217, 0.3)",
  },
  legendOverlay: {
    position: "absolute",
    bottom: 12,
    left: 12,
    flexDirection: "row",
    gap: 10,
    backgroundColor: "rgba(10, 10, 26, 0.85)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(108, 43, 217, 0.2)",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
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
    fontWeight: "600" as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
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
    alignSelf: "center",
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
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
    fontWeight: "600" as const,
    flex: 1,
  },
  modalClose: {
    padding: 4,
  },
  songRow: {
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-start",
    marginBottom: 4,
  },
  albumArt: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  albumArtPlaceholder: {
    backgroundColor: theme.surfaceLight,
    justifyContent: "center",
    alignItems: "center",
  },
  songDetails: {
    flex: 1,
    justifyContent: "center",
  },
  modalSong: {
    fontSize: 18,
    fontWeight: "800" as const,
    color: theme.text,
  },
  modalArtist: {
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 3,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  rarityBadge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  rarityText: {
    fontSize: 11,
    fontWeight: "700" as const,
    textTransform: "capitalize",
  },
  distanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: theme.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  distanceText: {
    fontSize: 11,
    color: theme.textSecondary,
    fontWeight: "500" as const,
  },
  proximityHint: {
    fontSize: 13,
    color: theme.pink,
    marginTop: 8,
    fontWeight: "500" as const,
  },
  previewBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: theme.surfaceLight,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 12,
  },
  previewBtnText: {
    color: theme.text,
    fontSize: 14,
    fontWeight: "600" as const,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 14,
  },
  collectBtn: {
    flex: 1,
    backgroundColor: theme.pink,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  collectBtnDisabled: {
    opacity: 0.5,
  },
  collectBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700" as const,
  },
  spotifyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: theme.neonGreenDim,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 14,
  },
  spotifyBtnText: {
    color: theme.neonGreen,
    fontSize: 13,
    fontWeight: "600" as const,
  },
});
