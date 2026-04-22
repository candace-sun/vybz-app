import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Animated,
  Modal,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Lock,
  Check,
  Coins,
  Music,
  X,
  Droplets,
  TrendingUp,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";

import Colors from "@/constants/colors";
import { plants, gardenItems, stageLabels } from "@/mocks/data";
import type { Plant } from "@/mocks/data";

const theme = Colors.dark;
const SHELF_COUNT = 3;
const SHELF_HEIGHT = 160;
const { width: SCREEN_WIDTH } = Dimensions.get("window");

const genreFilters = [
  { id: "edm", label: "EDM", color: "#8B5CF6", icon: true, unlocked: true },
  { id: "rnb", label: "R&B", color: "#FF6B35", icon: true, unlocked: true },
  { id: "rap", label: "Rap", color: "#00D9A6", icon: true, unlocked: true },
  { id: "pop", label: "Pop", color: "#FF2D78", icon: true, unlocked: false },
  { id: "rock", label: "Rock", color: "#FFD700", icon: true, unlocked: false },
];

const plantImages: Record<string, any> = {
  EDM: require("@/assets/images/plant-edm.png"),
  "R&B": require("@/assets/images/plant-rnb.png"),
  Rap: require("@/assets/images/plant-rap.png"),
};

const lotusImage = require("@/assets/images/plant-lotus.png");

const tabs = ["Garden", "Greenhouse", "Shop"] as const;
type TabType = (typeof tabs)[number];

function GenreFilterRow({
  activeGenre,
  onSelect,
}: {
  activeGenre: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.genreRow}
    >
      {genreFilters.map((genre) => {
        const isActive = activeGenre === genre.id;
        return (
          <Pressable
            key={genre.id}
            onPress={() => {
              if (!genre.unlocked) return;
              Haptics.selectionAsync();
              onSelect(isActive ? null : genre.id);
            }}
            style={styles.genreFilterItem}
          >
            <View
              style={[
                styles.genreCircle,
                { borderColor: genre.unlocked ? genre.color : "#2A2A4A" },
                isActive && { backgroundColor: genre.color + "30" },
                !genre.unlocked && styles.genreCircleLocked,
              ]}
            >
              {genre.unlocked ? (
                <Music size={18} color={genre.color} />
              ) : (
                <Lock size={16} color="#4A4A6A" />
              )}
            </View>
            <Text
              style={[
                styles.genreLabel,
                !genre.unlocked && styles.genreLabelLocked,
              ]}
            >
              {genre.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function PlantInfoModal({
  plant,
  visible,
  onClose,
}: {
  plant: Plant | null;
  visible: boolean;
  onClose: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 65,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.8);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  if (!plant) return null;

  const imageSource = plantImages[plant.genre] || lotusImage;
  const progressPercent = (plant.xpCurrent / plant.xpNeeded) * 100;
  const genreColor =
    genreFilters.find((g) => g.label === plant.genre)?.color || theme.purple;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Animated.View
          style={[
            styles.modalContent,
            { opacity: opacityAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <Pressable onPress={() => {}} style={styles.modalInner}>
            <Pressable onPress={onClose} style={styles.modalClose}>
              <X size={20} color="#fff" />
            </Pressable>

            <View style={styles.modalPlantImageWrap}>
              <Image
                source={imageSource}
                style={styles.modalPlantImage}
                contentFit="contain"
              />
            </View>

            <Text style={styles.modalPlantName}>{plant.name}</Text>
            <View
              style={[
                styles.modalGenreBadge,
                { backgroundColor: genreColor + "25" },
              ]}
            >
              <Music size={12} color={genreColor} />
              <Text style={[styles.modalGenreText, { color: genreColor }]}>
                {plant.genre}
              </Text>
            </View>

            <View style={styles.modalStatsRow}>
              <View style={styles.modalStat}>
                <TrendingUp size={14} color={theme.neonGreen} />
                <Text style={styles.modalStatLabel}>Stage</Text>
                <Text style={styles.modalStatValue}>
                  {stageLabels[plant.stage - 1] || plant.stageLabel}
                </Text>
              </View>
              <View style={styles.modalStatDivider} />
              <View style={styles.modalStat}>
                <Droplets size={14} color="#4FC3F7" />
                <Text style={styles.modalStatLabel}>XP</Text>
                <Text style={styles.modalStatValue}>
                  {plant.xpCurrent}/{plant.xpNeeded}
                </Text>
              </View>
            </View>

            <View style={styles.modalProgressWrap}>
              <View style={styles.modalProgressBar}>
                <View
                  style={[
                    styles.modalProgressFill,
                    {
                      width: `${progressPercent}%`,
                      backgroundColor: genreColor,
                    },
                  ]}
                />
              </View>
              <Text style={styles.modalProgressText}>
                {Math.round(progressPercent)}%
              </Text>
            </View>

            <View style={styles.modalStagesRow}>
              {stageLabels.map((label, i) => {
                const isReached = plant.stage > i;
                const isCurrent = plant.stage === i + 1;
                return (
                  <View key={label} style={styles.modalStageItem}>
                    <View
                      style={[
                        styles.modalStageDot,
                        isReached && { backgroundColor: genreColor },
                        isCurrent && {
                          backgroundColor: genreColor,
                          borderWidth: 2,
                          borderColor: "#fff",
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.modalStageLabel,
                        isCurrent && { color: "#fff" },
                      ]}
                    >
                      {label}
                    </Text>
                  </View>
                );
              })}
            </View>

            <Pressable
              style={[styles.modalWaterBtn, { backgroundColor: genreColor }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
            >
              <Droplets size={16} color="#fff" />
              <Text style={styles.modalWaterBtnText}>Water Plant</Text>
            </Pressable>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

function ShelfRow({
  plantData,
  shelfIndex,
  onPlantPress,
}: {
  plantData: typeof plants;
  shelfIndex: number;
  onPlantPress: (plant: Plant) => void;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      delay: shelfIndex * 100,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.shelfContainer, { opacity: fadeAnim }]}>
      <View style={styles.shelfPlantsArea}>
        {plantData.map((plant) => {
          const imageSource = plantImages[plant.genre] || lotusImage;
          return (
            <Pressable
              key={plant.id}
              style={styles.plantOnShelf}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onPlantPress(plant);
              }}
            >
              <Image
                source={imageSource}
                style={styles.plantImage}
                contentFit="contain"
              />
            </Pressable>
          );
        })}
      </View>
      <View style={styles.shelf}>
        <View style={styles.shelfSurface} />
        <View style={styles.shelfGlow} />
      </View>
    </Animated.View>
  );
}

function GardenTab() {
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const filteredPlants = activeGenre
    ? plants.filter(
        (p) =>
          p.genre.toLowerCase().replace("&", "n") ===
          activeGenre.replace("&", "n"),
      )
    : plants;

  const shelves = Array.from({ length: SHELF_COUNT }, (_, i) => {
    if (i === 0) return filteredPlants;
    return [];
  });

  const handlePlantPress = (plant: Plant) => {
    console.log("Plant pressed:", plant.name);
    setSelectedPlant(plant);
    setModalVisible(true);
  };

  return (
    <View>
      <GenreFilterRow activeGenre={activeGenre} onSelect={setActiveGenre} />
      <View style={styles.shelvesContainer}>
        {shelves.map((shelfPlants, i) => (
          <ShelfRow
            key={i}
            plantData={shelfPlants}
            shelfIndex={i}
            onPlantPress={handlePlantPress}
          />
        ))}
      </View>
      <PlantInfoModal
        plant={selectedPlant}
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setSelectedPlant(null);
        }}
      />
    </View>
  );
}

/* function GreenhouseTab() {
  const categories = ['Backgrounds', 'Fences', 'Animals', 'Props'] as const;
  const [activeCategory, setActiveCategory] = useState<string>('Backgrounds');

  const filteredItems = gardenItems.filter(item => item.category === activeCategory);

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
        {categories.map((cat) => (
          <Pressable
            key={cat}
            onPress={() => {
              Haptics.selectionAsync();
              setActiveCategory(cat);
            }}
            style={[styles.categoryPill, activeCategory === cat && styles.categoryPillActive]}
          >
            <Text style={[styles.categoryText, activeCategory === cat && styles.categoryTextActive]}>{cat}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <View style={styles.itemsGrid}>
        {filteredItems.map((item) => (
          <Pressable key={item.id} style={styles.ghItem}>
            <Text style={styles.ghEmoji}>{item.emoji}</Text>
            <Text style={styles.ghName}>{item.name}</Text>
            {item.owned ? (
              <View style={styles.ownedBadge}>
                <Check size={12} color={theme.neonGreen} />
                <Text style={styles.ownedText}>Owned</Text>
              </View>
            ) : (
              <View style={styles.priceBadge}>
                <Coins size={12} color={theme.coinYellow} />
                <Text style={styles.priceText}>{item.price}</Text>
              </View>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
} */

/* function ShopTab() {
  const shopItems = [
    { id: 's1', name: 'Rare Seed Pack', price: 120, emoji: '🌱', desc: '3 random rare seeds' },
    { id: 's2', name: 'XP Booster', price: 80, emoji: '⚡', desc: '2x XP for 24h' },
    { id: 's3', name: 'Golden Watering Can', price: 200, emoji: '🪣', desc: 'Water all plants at once' },
    { id: 's4', name: 'Mystery Box', price: 150, emoji: '🎁', desc: 'Random greenhouse item' },
  ];

  return (
    <View style={styles.shopGrid}>
      {shopItems.map((item) => (
        <Pressable
          key={item.id}
          style={styles.shopCard}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <Text style={styles.shopEmoji}>{item.emoji}</Text>
          <Text style={styles.shopName}>{item.name}</Text>
          <Text style={styles.shopDesc}>{item.desc}</Text>
          <View style={styles.shopPrice}>
            <Coins size={14} color={theme.coinYellow} />
            <Text style={styles.shopPriceText}>{item.price}</Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
} */

export default function GardenScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>("Garden");

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 8 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.tabRow}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <Pressable
                key={tab}
                onPress={() => {
                  Haptics.selectionAsync();
                  setActiveTab(tab);
                }}
                style={[styles.tab, isActive && styles.tabActive]}
              >
                <Text
                  style={[styles.tabText, isActive && styles.tabTextActive]}
                >
                  {tab}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {activeTab === "Garden" && <GardenTab />}
        {/* {activeTab === 'Greenhouse' && <GreenhouseTab />}
        {activeTab === 'Shop' && <ShopTab />} */}

        {(activeTab === "Greenhouse" || activeTab === "Shop") && (
          <View style={styles.comingSoonContainer}>
            <Text style={styles.comingSoonText}>Coming soon!</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080818",
  },
  scrollContent: {
    paddingBottom: 32,
  },
  tabRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: "#10102A",
    borderRadius: 28,
    padding: 4,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 24,
  },
  tabActive: {
    backgroundColor: theme.pink,
  },
  tabText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: theme.textMuted,
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  genreRow: {
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 20,
  },
  genreFilterItem: {
    alignItems: "center",
    gap: 6,
  },
  genreCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(20, 20, 40, 0.8)",
  },
  genreCircleLocked: {
    backgroundColor: "#15152A",
    borderColor: "#2A2A4A",
  },
  genreLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: theme.textSecondary,
  },
  genreLabelLocked: {
    color: theme.textMuted,
  },
  shelvesContainer: {
    paddingHorizontal: 16,
  },
  shelfContainer: {
    height: SHELF_HEIGHT,
    marginBottom: 8,
    justifyContent: "flex-end",
  },
  shelfPlantsArea: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    gap: 12,
    position: "absolute",
    bottom: 18,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  plantOnShelf: {
    width: 105,
    height: 115,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  plantImage: {
    width: 100,
    height: 110,
  },
  shelf: {
    height: 20,
    position: "relative",
  },
  shelfSurface: {
    height: 6,
    backgroundColor: "#2A1A4A",
    borderRadius: 3,
    marginHorizontal: 4,
  },
  shelfGlow: {
    height: 14,
    backgroundColor: "transparent",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(138, 43, 226, 0.4)",
    marginHorizontal: 4,
    shadowColor: "#8B2BE2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryRow: {
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.surface,
  },
  categoryPillActive: {
    backgroundColor: theme.purple,
  },
  categoryText: {
    fontSize: 13,
    color: theme.textSecondary,
    fontWeight: "600" as const,
  },
  categoryTextActive: {
    color: "#fff",
  },
  itemsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 20,
  },
  ghItem: {
    width: "47%",
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.cardBorder,
  },
  ghEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  ghName: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: theme.text,
    marginBottom: 8,
  },
  ownedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ownedText: {
    fontSize: 12,
    color: theme.neonGreen,
    fontWeight: "600" as const,
  },
  priceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  priceText: {
    fontSize: 13,
    color: theme.coinYellow,
    fontWeight: "700" as const,
  },
  shopGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 20,
  },
  shopCard: {
    width: "47%",
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.cardBorder,
  },
  shopEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  shopName: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: theme.text,
    textAlign: "center",
  },
  shopDesc: {
    fontSize: 12,
    color: theme.textSecondary,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 10,
  },
  shopPrice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255, 193, 7, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  shopPriceText: {
    fontSize: 14,
    color: theme.coinYellow,
    fontWeight: "700" as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: SCREEN_WIDTH - 48,
    maxWidth: 380,
  },
  modalInner: {
    backgroundColor: "#14142E",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(108, 43, 217, 0.3)",
  },
  modalClose: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  modalPlantImageWrap: {
    width: 140,
    height: 140,
    marginBottom: 16,
    marginTop: 8,
  },
  modalPlantImage: {
    width: "100%",
    height: "100%",
  },
  modalPlantName: {
    fontSize: 24,
    fontWeight: "800" as const,
    color: "#fff",
    marginBottom: 8,
  },
  modalGenreBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 20,
  },
  modalGenreText: {
    fontSize: 13,
    fontWeight: "700" as const,
  },
  modalStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  modalStat: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  modalStatLabel: {
    fontSize: 11,
    color: theme.textMuted,
    fontWeight: "500" as const,
  },
  modalStatValue: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: "#fff",
  },
  modalStatDivider: {
    width: 1,
    height: 36,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  modalProgressWrap: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    gap: 10,
    marginBottom: 16,
  },
  modalProgressBar: {
    flex: 1,
    height: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 4,
    overflow: "hidden",
  },
  modalProgressFill: {
    height: "100%",
    borderRadius: 4,
  },
  modalProgressText: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: theme.textSecondary,
    width: 36,
    textAlign: "right",
  },
  modalStagesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  modalStageItem: {
    alignItems: "center",
    gap: 4,
  },
  modalStageDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  modalStageLabel: {
    fontSize: 10,
    color: theme.textMuted,
    fontWeight: "500" as const,
  },
  modalWaterBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    paddingVertical: 14,
    borderRadius: 16,
  },
  modalWaterBtnText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: "#fff",
  },
  comingSoonContainer: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  comingSoonText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: theme.text,
    textAlign: "center",
  },
});
