import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Animated,
  ActivityIndicator,
  RefreshControl,
  FlatList,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Settings,
  Eye,
  Bell,
  Lock,
  FileText,
  Shield,
  Users,
  AlertTriangle,
  ChevronRight,
  Coins,
  Zap,
  Music,
  Sprout,
  LogOut,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";

import Colors from "@/constants/colors";
import {
  getProfile,
  getCollection,
  logout,
  UserProfile,
  CollectedSong,
} from "@/services/api";

const theme = Colors.dark;

const RARITY_COLORS: Record<string, string> = {
  common: theme.textMuted,
  uncommon: theme.neonGreen,
  rare: "#4FC3F7",
  epic: theme.purpleLight,
  legendary: theme.coinYellow,
};

interface SettingRow {
  icon: React.ReactNode;
  label: string;
  color?: string;
}

const settingsRows: SettingRow[] = [
  { icon: <Eye size={18} color={theme.purpleLight} />, label: "Visibility" },
  { icon: <Bell size={18} color={theme.coinYellow} />, label: "Notifications" },
  { icon: <Lock size={18} color={theme.neonGreen} />, label: "Passwords" },
  {
    icon: <FileText size={18} color={theme.textSecondary} />,
    label: "Privacy Policy",
  },
  { icon: <Shield size={18} color="#4FC3F7" />, label: "Terms of Service" },
  {
    icon: <Users size={18} color={theme.pink} />,
    label: "Community Guidelines",
  },
  {
    icon: <AlertTriangle size={18} color={theme.danger} />,
    label: "Report an Issue",
    color: theme.danger,
  },
];

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}) {
  return (
    <View style={styles.statCard}>
      {icon}
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function SongCard({ song }: { song: CollectedSong }) {
  const rarityColor = RARITY_COLORS[song.rarity] ?? theme.pink;
  return (
    <View style={styles.songCard}>
      {song.image_url ? (
        <Image
          source={{ uri: song.image_url }}
          style={styles.songArt}
          contentFit="cover"
        />
      ) : (
        <View style={[styles.songArt, styles.songArtPlaceholder]}>
          <Music size={20} color={theme.textMuted} />
        </View>
      )}
      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>
          {song.title}
        </Text>
        <Text style={styles.songArtist} numberOfLines={1}>
          {song.artist}
        </Text>
      </View>
      <View style={[styles.rarityBadge, { borderColor: rarityColor }]}>
        <Text style={[styles.rarityText, { color: rarityColor }]}>
          {song.rarity}
        </Text>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [songs, setSongs] = useState<CollectedSong[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [profileData, collectionData] = await Promise.all([
        getProfile(),
        getCollection(),
      ]);
      setProfile(profileData);
      setSongs(collectionData.collected_songs);
    } catch (e) {
      console.error("Failed to load profile:", e);
    }
  }, []);

  useEffect(() => {
    loadData().finally(() => {
      setLoading(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    });
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await logout();
    } catch {}
    router.replace("/auth");
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.pink} />
      </View>
    );
  }

  const xpProgress =
    profile && profile.next_level_xp
      ? (profile.xp / profile.next_level_xp) * 100
      : 0;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.pink}
          />
        }
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.screenTitle}>Profile</Text>
            <View style={styles.headerButtons}>
              {/* <Pressable
                style={styles.settingsBtn}
                onPress={() =>
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                }
              >
                <Settings size={22} color={theme.textSecondary} />
              </Pressable> */}
              <Pressable
                style={[styles.settingsBtn, styles.logoutBtn]}
                onPress={handleLogout}
              >
                <LogOut size={22} color={theme.danger} />
              </Pressable>
            </View>
          </View>

          {/* Profile Card */}
          <View style={styles.profileCard}>
            {profile?.avatar ? (
              <Image source={{ uri: profile.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarInitial}>
                  {profile?.username?.[0]?.toUpperCase() ?? "?"}
                </Text>
              </View>
            )}
            <Text style={styles.username}>@{profile?.username}</Text>

            {profile?.bio && <Text style={styles.bio}>{profile.bio}</Text>}

            {(profile?.mbti || profile?.zodiac) && (
              <View style={styles.tagRow}>
                {profile.mbti && (
                  <View style={styles.profileTag}>
                    <Text style={styles.profileTagText}>{profile.mbti}</Text>
                  </View>
                )}
                {profile.zodiac && (
                  <View style={styles.profileTag}>
                    <Text style={styles.profileTagText}>{profile.zodiac}</Text>
                  </View>
                )}
                <View
                  style={[
                    styles.profileTag,
                    { backgroundColor: "rgba(255, 45, 120, 0.15)" },
                  ]}
                >
                  <Text style={[styles.profileTagText, { color: theme.pink }]}>
                    Lvl {profile?.level}
                  </Text>
                </View>
              </View>
            )}

            {!profile?.mbti && !profile?.zodiac && (
              <View style={styles.tagRow}>
                <View
                  style={[
                    styles.profileTag,
                    { backgroundColor: "rgba(255, 45, 120, 0.15)" },
                  ]}
                >
                  <Text style={[styles.profileTagText, { color: theme.pink }]}>
                    Lvl {profile?.level}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.xpSection}>
              <View style={styles.xpHeader}>
                <Text style={styles.xpLabel}>XP Progress</Text>
                <Text style={styles.xpCount}>
                  {profile?.xp} / {profile?.next_level_xp}
                </Text>
              </View>
              <View style={styles.xpBar}>
                <View style={[styles.xpBarFill, { width: `${xpProgress}%` }]} />
              </View>
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <StatCard
              icon={<Zap size={18} color={theme.xpGold} />}
              value={profile?.xp ?? 0}
              label="Total XP"
            />
            <StatCard
              icon={<Coins size={18} color={theme.coinYellow} />}
              value={profile?.coins ?? 0}
              label="Coins"
            />
            <StatCard
              icon={<Sprout size={18} color={theme.neonGreen} />}
              value="—"
              label="Plants"
            />
            <StatCard
              icon={<Music size={18} color={theme.pink} />}
              value={songs.length}
              label="Songs"
            />
          </View>

          {/* Song Collection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Collection</Text>
            {songs.length === 0 ? (
              <View style={styles.emptyCollection}>
                <Music size={32} color={theme.textMuted} />
                <Text style={styles.emptyText}>No songs collected yet</Text>
                <Text style={styles.emptySubtext}>
                  Collect drops on the map to fill your collection
                </Text>
              </View>
            ) : (
              songs.map((song) => <SongCard key={song.id} song={song} />)
            )}
          </View>

          {/* Settings */}
          {/* <View style={styles.section}>
            <Text style={styles.sectionTitle}>Settings</Text>
            <View style={styles.settingsList}>
              {settingsRows.map((row, i) => (
                <Pressable
                  key={row.label}
                  style={[styles.settingRow, i < settingsRows.length - 1 && styles.settingRowBorder]}
                  onPress={() => Haptics.selectionAsync()}
                >
                  <View style={styles.settingIcon}>{row.icon}</View>
                  <Text style={[styles.settingLabel, row.color ? { color: row.color } : null]}>
                    {row.label}
                  </Text>
                  <ChevronRight size={16} color={theme.textMuted} />
                </Pressable>
              ))}
            </View>
          </View> */}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.background,
  },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  screenTitle: { fontSize: 26, fontWeight: "800" as const, color: theme.text },
  headerButtons: { flexDirection: "row", gap: 10 },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  logoutBtn: { backgroundColor: "rgba(255, 0, 0, 0.1)" },
  profileCard: {
    backgroundColor: theme.surface,
    borderRadius: 22,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.cardBorder,
    marginBottom: 16,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: theme.purple,
    marginBottom: 14,
  },
  avatarPlaceholder: {
    backgroundColor: theme.surfaceLight,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: "800" as const,
    color: theme.purpleLight,
  },
  username: { fontSize: 20, fontWeight: "800" as const, color: theme.text },
  bio: {
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 6,
    textAlign: "center",
  },
  tagRow: { flexDirection: "row", gap: 8, marginTop: 14 },
  profileTag: {
    backgroundColor: "rgba(108, 43, 217, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  profileTagText: {
    fontSize: 13,
    color: theme.purpleLight,
    fontWeight: "700" as const,
  },
  xpSection: { width: "100%", marginTop: 18 },
  xpHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  xpLabel: {
    fontSize: 13,
    color: theme.textSecondary,
    fontWeight: "600" as const,
  },
  xpCount: { fontSize: 13, color: theme.xpGold, fontWeight: "700" as const },
  xpBar: {
    height: 6,
    backgroundColor: theme.surfaceLight,
    borderRadius: 3,
    overflow: "hidden",
  },
  xpBarFill: { height: "100%", backgroundColor: theme.xpGold, borderRadius: 3 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  statCard: {
    flex: 1,
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.cardBorder,
    gap: 4,
  },
  statValue: { fontSize: 18, fontWeight: "800" as const, color: theme.text },
  statLabel: {
    fontSize: 11,
    color: theme.textMuted,
    fontWeight: "500" as const,
  },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: theme.textSecondary,
    marginBottom: 12,
  },
  songCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.surface,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    gap: 12,
  },
  songArt: { width: 48, height: 48, borderRadius: 10 },
  songArtPlaceholder: {
    backgroundColor: theme.surfaceLight,
    justifyContent: "center",
    alignItems: "center",
  },
  songInfo: { flex: 1 },
  songTitle: { fontSize: 14, fontWeight: "700" as const, color: theme.text },
  songArtist: { fontSize: 12, color: theme.textSecondary, marginTop: 2 },
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
  emptyCollection: { alignItems: "center", paddingVertical: 32, gap: 8 },
  emptyText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: theme.textSecondary,
  },
  emptySubtext: { fontSize: 13, color: theme.textMuted, textAlign: "center" },
  settingsList: {
    backgroundColor: theme.surface,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.cardBorder,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(108, 43, 217, 0.08)",
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: theme.surfaceLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingLabel: {
    flex: 1,
    fontSize: 15,
    color: theme.text,
    fontWeight: "500" as const,
  },
});
