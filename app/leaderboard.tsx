import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  FlatList,
} from 'react-native';
import { Image } from 'expo-image';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, Trophy, TrendingUp } from 'lucide-react-native';

import Colors from '@/constants/colors';
import { leaderboard } from '@/mocks/data';

const theme = Colors.dark;

const extendedLeaderboard = [
  ...leaderboard,
  { id: '6', name: 'cosmicBeats', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop', xp: 1480 },
  { id: '7', name: 'lofiDreamer', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&h=100&fit=crop', xp: 1320 },
  { id: '8', name: 'vinylCollector', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', xp: 1150 },
  { id: '9', name: 'drumNbass', avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=100&h=100&fit=crop', xp: 980 },
  { id: '10', name: 'synthWave', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop', xp: 870 },
].sort((a, b) => b.xp - a.xp);

const rankColors = ['#FFD700', '#C0C0C0', '#CD7F32'];

function LeaderRow({ item, index }: { item: typeof extendedLeaderboard[0]; index: number }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const rank = index + 1;
  const isTop3 = rank <= 3;
  const maxXp = extendedLeaderboard[0].xp;
  const barWidth = (item.xp / maxXp) * 100;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, delay: index * 50, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 350, delay: index * 50, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.leaderRow, isTop3 && styles.leaderRowTop, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={[styles.rankCircle, isTop3 && { backgroundColor: rankColors[rank - 1] }]}>
        <Text style={[styles.rankNum, isTop3 && styles.rankNumTop]}>{rank}</Text>
      </View>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.leaderInfo}>
        <Text style={styles.leaderName}>{item.name}</Text>
        <View style={styles.xpBarBg}>
          <View style={[styles.xpBarFill, { width: `${barWidth}%` }]} />
        </View>
      </View>
      <View style={styles.xpBadge}>
        <TrendingUp size={12} color={theme.neonGreen} />
        <Text style={styles.xpText}>{item.xp.toLocaleString()} XP</Text>
      </View>
    </Animated.View>
  );
}

export default function LeaderboardScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Leaderboard',
          headerStyle: { backgroundColor: '#080818' },
          headerTintColor: '#fff',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <ArrowLeft size={22} color="#fff" />
            </Pressable>
          ),
        }}
      />
      <View style={styles.topBanner}>
        <Trophy size={28} color="#FFD700" />
        <Text style={styles.topBannerTitle}>Top Vibers</Text>
        <Text style={styles.topBannerSub}>{"This week's most active users"}</Text>
      </View>
      <FlatList
        data={extendedLeaderboard}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => <LeaderRow item={item} index={index} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080818',
  },
  backBtn: {
    marginRight: 8,
  },
  topBanner: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 4,
  },
  topBannerTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: '#fff',
    marginTop: 6,
  },
  topBannerSub: {
    fontSize: 13,
    color: theme.textMuted,
  },
  listContent: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 40,
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#12122A',
    borderRadius: 16,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(108, 43, 217, 0.15)',
  },
  leaderRowTop: {
    borderColor: 'rgba(255, 215, 0, 0.25)',
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
  },
  rankCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankNum: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: theme.textMuted,
  },
  rankNumTop: {
    color: '#000',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  leaderInfo: {
    flex: 1,
    gap: 6,
  },
  leaderName: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#fff',
  },
  xpBarBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: theme.neonGreen,
    borderRadius: 3,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  xpText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: theme.neonGreen,
  },
});
