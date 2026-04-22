import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Animated,
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
  Heart,
  LogOut,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";

import Colors from "@/constants/colors";
import { userProfile } from "@/mocks/data";

const theme = Colors.dark;

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

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const xpProgress = userProfile.xp / userProfile.xpToNext;

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/auth");
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.header}>
            <Text style={styles.screenTitle}>Profile</Text>
            <View style={styles.headerButtons}>
              <Pressable
                style={styles.settingsBtn}
                onPress={() =>
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                }
              >
                <Settings size={22} color={theme.textSecondary} />
              </Pressable>
              <Pressable
                style={[styles.settingsBtn, styles.logoutBtn]}
                onPress={handleLogout}
              >
                <LogOut size={22} color={theme.danger} />
              </Pressable>
            </View>
          </View>

          <View style={styles.profileCard}>
            <Image source={{ uri: userProfile.avatar }} style={styles.avatar} />
            <Text style={styles.username}>@{userProfile.name}</Text>
            <Text style={styles.bio}>{userProfile.bio}</Text>

            <View style={styles.tagRow}>
              <View style={styles.profileTag}>
                <Text style={styles.profileTagText}>{userProfile.mbti}</Text>
              </View>
              <View style={styles.profileTag}>
                <Text style={styles.profileTagText}>{userProfile.zodiac}</Text>
              </View>
              <View
                style={[
                  styles.profileTag,
                  { backgroundColor: "rgba(255, 45, 120, 0.15)" },
                ]}
              >
                <Text style={[styles.profileTagText, { color: theme.pink }]}>
                  Lvl {userProfile.level}
                </Text>
              </View>
            </View>

            <View style={styles.xpSection}>
              <View style={styles.xpHeader}>
                <Text style={styles.xpLabel}>XP Progress</Text>
                <Text style={styles.xpCount}>
                  {userProfile.xp}/{userProfile.xpToNext}
                </Text>
              </View>
              <View style={styles.xpBar}>
                <View
                  style={[styles.xpBarFill, { width: `${xpProgress * 100}%` }]}
                />
              </View>
            </View>
          </View>

          <View style={styles.statsRow}>
            <StatCard
              icon={<Zap size={18} color={theme.xpGold} />}
              value={userProfile.xp}
              label="Total XP"
            />
            <StatCard
              icon={<Coins size={18} color={theme.coinYellow} />}
              value={userProfile.coins}
              label="Coins"
            />
            <StatCard
              icon={<Sprout size={18} color={theme.neonGreen} />}
              value={userProfile.plantsGrown}
              label="Plants"
            />
            <StatCard
              icon={<Music size={18} color={theme.pink} />}
              value={userProfile.songsCollected}
              label="Songs"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Artists</Text>
            <View style={styles.artistsRow}>
              {userProfile.topArtists.map((artist) => (
                <View key={artist} style={styles.artistChip}>
                  <Heart size={12} color={theme.pink} />
                  <Text style={styles.artistText}>{artist}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Settings</Text>
            <View style={styles.settingsList}>
              {settingsRows.map((row, i) => (
                <Pressable
                  key={row.label}
                  style={[
                    styles.settingRow,
                    i < settingsRows.length - 1 && styles.settingRowBorder,
                  ]}
                  onPress={() => Haptics.selectionAsync()}
                >
                  <View style={styles.settingIcon}>{row.icon}</View>
                  <Text
                    style={[
                      styles.settingLabel,
                      row.color ? { color: row.color } : null,
                    ]}
                  >
                    {row.label}
                  </Text>
                  <ChevronRight size={16} color={theme.textMuted} />
                </Pressable>
              ))}
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: "800" as const,
    color: theme.text,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 10,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  logoutBtn: {
    backgroundColor: "rgba(255, 0, 0, 0.1)",
  },
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
  username: {
    fontSize: 20,
    fontWeight: "800" as const,
    color: theme.text,
  },
  bio: {
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 6,
    textAlign: "center",
  },
  tagRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
  },
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
  xpSection: {
    width: "100%",
    marginTop: 18,
  },
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
  xpCount: {
    fontSize: 13,
    color: theme.xpGold,
    fontWeight: "700" as const,
  },
  xpBar: {
    height: 6,
    backgroundColor: theme.surfaceLight,
    borderRadius: 3,
    overflow: "hidden",
  },
  xpBarFill: {
    height: "100%",
    backgroundColor: theme.xpGold,
    borderRadius: 3,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
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
  statValue: {
    fontSize: 18,
    fontWeight: "800" as const,
    color: theme.text,
  },
  statLabel: {
    fontSize: 11,
    color: theme.textMuted,
    fontWeight: "500" as const,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: theme.textSecondary,
    marginBottom: 12,
  },
  artistsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  artistChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: theme.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.cardBorder,
  },
  artistText: {
    fontSize: 14,
    color: theme.text,
    fontWeight: "600" as const,
  },
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
