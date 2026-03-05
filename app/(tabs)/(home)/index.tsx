import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Music, Coins, Droplets, Check, Calendar } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import Colors from '@/constants/colors';
import { todayGoals, activityFeed, leaderboard, events } from '@/mocks/data';

const theme = Colors.dark;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const HERO_IMAGE = require('@/assets/images/hero-bg.png');

function GoalPill({ goal, index }: { goal: typeof todayGoals[0]; index: number }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.93, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
  };

  const iconMap: Record<string, React.ReactNode> = {
    music: <Music size={16} color="#fff" />,
    coin: <Coins size={16} color="#fff" />,
    droplet: <Droplets size={16} color="#fff" />,
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable onPress={handlePress} style={styles.goalPill}>
        <View style={styles.goalPillIcon}>
          {goal.completed ? <Check size={16} color={theme.neonGreen} /> : iconMap[goal.icon]}
        </View>
        <Text style={styles.goalPillTitle} numberOfLines={1}>{goal.title}</Text>
        <Text style={styles.goalPillReward}>{goal.reward}</Text>
        <Text style={styles.goalPillCoin}>🪙</Text>
      </Pressable>
    </Animated.View>
  );
}

function ActivityCard({ item, index }: { item: typeof activityFeed[0]; index: number }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      delay: 200 + index * 100,
      useNativeDriver: true,
    }).start();
  }, []);

  const songMatch = item.status.match(/Collected a song: (.+) by (.+)/);
  const songName = songMatch ? songMatch[1] : null;
  const artistName = songMatch ? songMatch[2] : null;

  return (
    <Animated.View style={[styles.activityCard, { opacity: fadeAnim }]}>
      <View style={styles.activityHeader}>
        <Image source={{ uri: item.avatar }} style={styles.activityAvatar} />
        <View style={styles.activityHeaderInfo}>
          <Text style={styles.activityUser}>{item.user}</Text>
          <Text style={styles.activityTime}>{item.timestamp}</Text>
        </View>
      </View>
      {songName ? (
        <View style={styles.songCard}>
          <View style={styles.songLeft}>
            <View style={styles.songThumb}>
              <Music size={16} color={theme.pink} />
            </View>
            <View>
              <Text style={styles.activityStatus} numberOfLines={1}>Collected a song</Text>
              <Text style={styles.songTitle}>{songName}</Text>
              <Text style={styles.songArtist}>{artistName}</Text>
              <Text style={styles.spotifyLink}>Play on Spotify</Text>
            </View>
          </View>
          <View style={styles.rarityBadge}>
            <Text style={styles.rarityText}>common</Text>
          </View>
        </View>
      ) : (
        <Text style={styles.activityStatusPlain}>{item.status}</Text>
      )}
    </Animated.View>
  );
}

function LeaderboardSection() {
  const barColors = ['#CDFF50', '#FF6B9D', '#FFD93D', '#4FC3F7', '#B388FF'];
  const maxXp = Math.max(...leaderboard.map(u => u.xp));

  const sorted = [...leaderboard].sort((a, b) => b.xp - a.xp);

  const router = useRouter();

  return (
    <Pressable style={styles.leaderboardCard} onPress={() => router.push('/leaderboard')}>
      <Text style={styles.leaderboardTitle}>Leaderboard</Text>
      <View style={styles.leaderboardBars}>
        {sorted.slice(0, 5).map((user, i) => {
          const barHeight = (user.xp / maxXp) * 100;
          const rank = i + 1;
          return (
            <View key={user.id} style={styles.leaderboardBarItem}>
              <View style={styles.leaderboardAvatarWrap}>
                <Image source={{ uri: user.avatar }} style={styles.leaderboardAvatarImg} />
                {rank <= 3 && (
                  <View style={[styles.rankBadge, { backgroundColor: barColors[i] }]}>
                    <Text style={styles.rankText}>{rank}</Text>
                  </View>
                )}
              </View>
              <View style={[styles.leaderboardBar, { height: barHeight, backgroundColor: barColors[i] }]} />
            </View>
          );
        })}
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroContainer}>
          <Image
            source={HERO_IMAGE}
            style={styles.heroImage}
            contentFit="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(8,8,24,0.6)', '#080818']}
            locations={[0.2, 0.6, 1]}
            style={styles.heroGradient}
          />
          <View style={[styles.heroContent, { paddingTop: insets.top + 100 }]}>
            <View style={styles.heroTextRow}>
              <View style={styles.heroTextLeft}>
                <Text style={styles.greeting}>{"What\u2019s your"}</Text>
                <Text style={styles.greeting}>{"vibe today?"}</Text>
              </View>
              <Pressable style={styles.gardenLink}>
                <Text style={styles.gardenLinkText}>check garden</Text>
                <Text style={styles.gardenLinkDash}> —</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.goalsSection}>
          <LinearGradient
            colors={['#FF2D78', '#FF6B35']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.goalsGradient}
          >
            <Text style={styles.goalsTitle}>{"Today\u2019s goals"}</Text>
          </LinearGradient>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.goalsPillRow}
            style={styles.goalsPillScroll}
          >
            {todayGoals.map((goal, i) => (
              <GoalPill key={goal.id} goal={goal} index={i} />
            ))}
          </ScrollView>
        </View>

        <View style={styles.feedSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.feedRow}>
            {activityFeed.map((item, i) => (
              <ActivityCard key={item.id} item={item} index={i} />
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <LeaderboardSection />
        </View>

        <View style={[styles.section, { marginBottom: 32 }]}>
          <View style={styles.sectionHeader}>
            <Calendar size={18} color={theme.neonGreen} />
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.eventsRow}>
            {events.map((event) => (
              <Pressable key={event.id} style={styles.eventCard}>
                <Image source={{ uri: event.image }} style={styles.eventImage} />
                <LinearGradient
                  colors={['transparent', 'rgba(10,10,26,0.95)']}
                  style={styles.eventGradient}
                />
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventSub}>{event.subtitle}</Text>
                  <View style={styles.eventMeta}>
                    <Text style={styles.eventDate}>{event.date}</Text>
                    <Text style={styles.eventAttendees}>{event.attendees} joined</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080818',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heroContainer: {
    height: 280,
    position: 'relative',
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '80%',
  },
  heroContent: {
    position: 'absolute',
    bottom: 16,
    left: 20,
    right: 20,
  },
  heroTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  heroTextLeft: {},
  greeting: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  gardenLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  gardenLinkText: {
    color: '#A0A0C0',
    fontSize: 13,
    fontWeight: '500' as const,
  },
  gardenLinkDash: {
    color: '#A0A0C0',
    fontSize: 13,
  },
  goalsSection: {
    marginHorizontal: 16,
    marginTop: -8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  goalsGradient: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  goalsTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  goalsPillScroll: {
    backgroundColor: 'rgba(255, 45, 120, 0.35)',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingBottom: 14,
  },
  goalsPillRow: {
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  goalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 8,
  },
  goalPillIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalPillTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    maxWidth: 100,
  },
  goalPillReward: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  goalPillCoin: {
    fontSize: 16,
  },
  feedSection: {
    marginTop: 20,
  },
  feedRow: {
    paddingHorizontal: 16,
    gap: 12,
  },
  activityCard: {
    width: SCREEN_WIDTH * 0.55,
    backgroundColor: '#12122A',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(108, 43, 217, 0.2)',
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  activityAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  activityHeaderInfo: {
    marginLeft: 8,
    flex: 1,
  },
  activityUser: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  activityTime: {
    fontSize: 11,
    color: theme.textMuted,
    marginTop: 1,
  },
  songCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  songLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 8,
  },
  songThumb: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 45, 120, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityStatus: {
    fontSize: 11,
    color: theme.textSecondary,
  },
  activityStatusPlain: {
    fontSize: 13,
    color: theme.textSecondary,
  },
  songTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginTop: 2,
  },
  songArtist: {
    fontSize: 11,
    color: theme.textMuted,
    marginTop: 1,
  },
  spotifyLink: {
    fontSize: 11,
    color: '#1DB954',
    fontWeight: '600' as const,
    marginTop: 3,
  },
  rarityBadge: {
    backgroundColor: 'rgba(0, 255, 136, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  rarityText: {
    fontSize: 10,
    color: theme.neonGreen,
    fontWeight: '600' as const,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: theme.text,
  },
  leaderboardCard: {
    backgroundColor: '#FF8C42',
    borderRadius: 20,
    padding: 16,
    overflow: 'hidden',
  },
  leaderboardTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  leaderboardBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 120,
  },
  leaderboardBarItem: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
  leaderboardAvatarWrap: {
    marginBottom: 6,
    position: 'relative',
  },
  leaderboardAvatarImg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  rankBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: '#000',
  },
  leaderboardBar: {
    width: 28,
    borderRadius: 6,
    minHeight: 10,
  },
  eventsRow: {
    gap: 14,
  },
  eventCard: {
    width: SCREEN_WIDTH * 0.72,
    height: 180,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: theme.surface,
  },
  eventImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  eventGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
  },
  eventInfo: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 14,
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: theme.text,
  },
  eventSub: {
    fontSize: 13,
    color: theme.textSecondary,
    marginTop: 2,
  },
  eventMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  eventDate: {
    fontSize: 12,
    color: theme.neonGreen,
    fontWeight: '600' as const,
  },
  eventAttendees: {
    fontSize: 12,
    color: theme.textMuted,
  },
});
