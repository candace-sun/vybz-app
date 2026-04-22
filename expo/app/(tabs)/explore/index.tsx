import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  UserPlus,
  MessageCircle,
  Music,
  Sparkles,
  Trophy,
  Calendar,
  MapPin,
  Users,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

import Colors from "@/constants/colors";
import { friends, events } from "@/mocks/data";

const theme = Colors.dark;
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 52) / 2;

const exploreTabs = ["Friends", "Events"] as const;
type ExploreTab = (typeof exploreTabs)[number];

const quickActions = [
  { id: "messages", label: "Messages", icon: MessageCircle, count: 3 },
  { id: "requests", label: "Friend Requests", icon: Sparkles, count: 2 },
  { id: "leaderboard", label: "Leaderboard", icon: Trophy, count: null },
];

const friendsWithExtra = [
  ...friends,
  {
    id: "6",
    name: "lovelyVybz",
    avatar:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&h=200&fit=crop",
    bio: "Pop & rock all day",
    mutualArtists: 4,
    tags: ["pop", "rock"],
    online: true,
    level: 2,
  },
  {
    id: "7",
    name: "indieVibes22",
    avatar:
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&h=200&fit=crop",
    bio: "Indie is a lifestyle",
    mutualArtists: 6,
    tags: ["indie", "rock"],
    online: false,
    level: 5,
  },
  {
    id: "8",
    name: "beatMaster",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    bio: "Beats and rhymes forever",
    mutualArtists: 3,
    tags: ["hip-hop", "rap"],
    online: true,
    level: 8,
  },
  {
    id: "9",
    name: "jazzSoul",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop",
    bio: "Smooth jazz and neo soul",
    mutualArtists: 5,
    tags: ["jazz", "soul"],
    online: false,
    level: 4,
  },
];

function FriendGridCard({
  friend,
  index,
}: {
  friend: (typeof friendsWithExtra)[0];
  index: number;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 450,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim]);

  const level = (friend as any).level ?? Math.floor(Math.random() * 10) + 1;

  return (
    <Animated.View
      style={[
        styles.gridCardWrap,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      <Pressable onPress={handlePress} style={styles.gridCard}>
        <View style={styles.gridCardImageWrap}>
          <Image
            source={{ uri: friend.avatar }}
            style={styles.gridCardImage}
            contentFit="cover"
          />
          {friend.online && <View style={styles.gridOnlineDot} />}
        </View>

        <View style={styles.gridCardBody}>
          <Text style={styles.gridCardName} numberOfLines={1}>
            {friend.name}
          </Text>
          <View style={styles.gridLevelRow}>
            <Sparkles size={12} color={theme.neonGreen} />
            <Text style={styles.gridLevelText}>Level {level}</Text>
          </View>

          <View style={styles.gridTagsRow}>
            {friend.tags.slice(0, 2).map((tag) => (
              <View key={tag} style={styles.gridTag}>
                <Text style={styles.gridTagText}>{tag}</Text>
              </View>
            ))}
          </View>

          <Pressable
            style={styles.gridAddBtn}
            onPress={() =>
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
            }
          >
            <UserPlus size={14} color="#fff" />
            <Text style={styles.gridAddBtnText}>Add Friend</Text>
          </Pressable>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<ExploreTab>("Friends");
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 12 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.tabRow}>
          {exploreTabs.map((tab) => {
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

        {/* <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickActionsRow}
        >
          {quickActions.map((action) => {
            const IconComp = action.icon;
            return (
              <Pressable
                key={action.id}
                style={styles.quickActionPill}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  if (action.id === "messages") router.push("/messages");
                  else if (action.id === "requests")
                    router.push("/friend-requests");
                  else if (action.id === "leaderboard")
                    router.push("/leaderboard");
                }}
              >
                <IconComp size={16} color="#fff" />
                <Text style={styles.quickActionText}>{action.label}</Text>
                {action.count !== null && (
                  <View style={styles.quickActionBadge}>
                    <Text style={styles.quickActionBadgeText}>
                      {action.count}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView> */}

        {/* <View style={styles.recommendedHeader}>
          <Music size={20} color="#fff" />
          <View>
            <Text style={styles.recommendedTitle}>Recommended for you</Text>
            <Text style={styles.recommendedSub}>
              Based on similar music tastes
            </Text>
          </View>
        </View>

        {activeTab === "Friends" ? (
          <View style={styles.friendsGrid}>
            {friendsWithExtra.map((friend, i) => (
              <FriendGridCard key={friend.id} friend={friend} index={i} />
            ))}
          </View>
        ) : (
          <View style={styles.eventsContainer}>
            <View style={styles.eventsHeader}>
              <Calendar size={20} color={theme.pink} />
              <Text style={styles.eventsTitle}>Upcoming Events</Text>
            </View>
            {events.map((event) => (
              <Pressable
                key={event.id}
                style={styles.eventCard}
                onPress={() => router.push("/events")}
              >
                <Image
                  source={{ uri: event.image }}
                  style={styles.eventImage}
                  contentFit="cover"
                />
                <LinearGradient
                  colors={["transparent", "rgba(8,8,24,0.9)"]}
                  style={styles.eventGradient}
                />
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventSub}>{event.subtitle}</Text>
                  <View style={styles.eventMetaRow}>
                    <View style={styles.eventMetaItem}>
                      <Calendar size={13} color={theme.pink} />
                      <Text style={styles.eventMetaText}>{event.date}</Text>
                    </View>
                    <View style={styles.eventMetaItem}>
                      <MapPin size={13} color={theme.pink} />
                      <Text style={styles.eventMetaText}>Main Auditorium</Text>
                    </View>
                  </View>
                  <View style={styles.eventMetaItem}>
                    <Users size={13} color={theme.neonGreen} />
                    <Text style={styles.eventAttendees}>
                      {event.attendees} going
                    </Text>
                  </View>
                  <View style={styles.eventActions}>
                    <Pressable style={styles.learnMoreBtn}>
                      <Text style={styles.learnMoreText}>learn more</Text>
                    </Pressable>
                    <Pressable style={styles.rsvpBtn}>
                      <Text style={styles.rsvpText}>RSVP (+25 XP)</Text>
                    </Pressable>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )} */}

        <View style={styles.comingSoonContainer}>
          <Text style={styles.comingSoonText}>Coming soon!</Text>
        </View>
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
  quickActionsRow: {
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 24,
  },
  quickActionPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A3A",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(108, 43, 217, 0.25)",
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#fff",
  },
  quickActionBadge: {
    backgroundColor: theme.pink,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  quickActionBadgeText: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: "#fff",
  },
  recommendedHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  recommendedTitle: {
    fontSize: 18,
    fontWeight: "800" as const,
    color: "#fff",
  },
  recommendedSub: {
    fontSize: 13,
    color: theme.textMuted,
    marginTop: 2,
  },
  friendsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 12,
  },
  gridCardWrap: {
    width: CARD_WIDTH,
  },
  gridCard: {
    backgroundColor: "#12122A",
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(108, 43, 217, 0.2)",
  },
  gridCardImageWrap: {
    width: "100%",
    height: CARD_WIDTH * 0.85,
    position: "relative",
  },
  gridCardImage: {
    width: "100%",
    height: "100%",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  gridOnlineDot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.neonGreen,
    borderWidth: 2,
    borderColor: "#12122A",
  },
  gridCardBody: {
    padding: 12,
  },
  gridCardName: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: "#fff",
    marginBottom: 4,
  },
  gridLevelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  gridLevelText: {
    fontSize: 12,
    color: theme.textMuted,
    fontWeight: "500" as const,
  },
  gridTagsRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 10,
  },
  gridTag: {
    backgroundColor: "rgba(108, 43, 217, 0.18)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  gridTagText: {
    fontSize: 11,
    color: theme.purpleLight,
    fontWeight: "600" as const,
  },
  gridAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: theme.pink,
    borderRadius: 12,
    paddingVertical: 8,
  },
  gridAddBtnText: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: "#fff",
  },
  eventsContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  eventsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  eventsTitle: {
    fontSize: 20,
    fontWeight: "800" as const,
    color: "#fff",
  },
  eventCard: {
    borderRadius: 20,
    overflow: "hidden",
    height: 260,
    backgroundColor: "#12122A",
  },
  eventImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  eventGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "80%",
  },
  eventInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: "800" as const,
    color: "#fff",
  },
  eventSub: {
    fontSize: 13,
    color: theme.textSecondary,
    marginTop: 2,
  },
  eventMetaRow: {
    flexDirection: "row",
    gap: 14,
    marginTop: 8,
  },
  eventMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 4,
  },
  eventMetaText: {
    fontSize: 12,
    color: theme.textSecondary,
    fontWeight: "500" as const,
  },
  eventAttendees: {
    fontSize: 12,
    color: theme.neonGreen,
    fontWeight: "600" as const,
  },
  eventActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  learnMoreBtn: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 14,
    paddingVertical: 9,
    paddingHorizontal: 16,
  },
  learnMoreText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#fff",
  },
  rsvpBtn: {
    backgroundColor: theme.pink,
    borderRadius: 14,
    paddingVertical: 9,
    paddingHorizontal: 16,
  },
  rsvpText: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: "#fff",
  },
  comingSoonContainer: {
    paddingHorizontal: 20,
    paddingTop: 40,
    alignItems: "center",
  },
  comingSoonText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: theme.text,
    textAlign: "center",
  },
});
