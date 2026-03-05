import React, { useRef, useEffect, useState, useCallback } from 'react';
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
import { ArrowLeft, UserPlus, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import Colors from '@/constants/colors';
import { friendRequests, FriendRequest } from '@/mocks/data';

const theme = Colors.dark;

function RequestCard({ item, index, onAccept, onDecline }: { item: FriendRequest; index: number; onAccept: (id: string) => void; onDecline: (id: string) => void }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay: index * 80, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, delay: index * 80, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.requestCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.requestTop}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.requestInfo}>
          <Text style={styles.requestName}>{item.user}</Text>
          <Text style={styles.requestMutual}>{item.mutualFriends} mutual friends</Text>
          <View style={styles.tagsRow}>
            {item.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
        <Text style={styles.requestTime}>{item.timestamp}</Text>
      </View>
      <View style={styles.requestActions}>
        <Pressable
          style={styles.acceptBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onAccept(item.id);
          }}
          testID={`accept-${item.id}`}
        >
          <UserPlus size={16} color="#fff" />
          <Text style={styles.acceptText}>Accept</Text>
        </Pressable>
        <Pressable
          style={styles.declineBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onDecline(item.id);
          }}
          testID={`decline-${item.id}`}
        >
          <X size={16} color={theme.textMuted} />
          <Text style={styles.declineText}>Decline</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

export default function FriendRequestsScreen() {
  const router = useRouter();
  const [requests, setRequests] = useState<FriendRequest[]>(friendRequests);

  const handleAccept = useCallback((id: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const handleDecline = useCallback((id: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Friend Requests',
          headerStyle: { backgroundColor: '#080818' },
          headerTintColor: '#fff',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <ArrowLeft size={22} color="#fff" />
            </Pressable>
          ),
        }}
      />
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <RequestCard item={item} index={index} onAccept={handleAccept} onDecline={handleDecline} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <UserPlus size={48} color={theme.textMuted} />
            <Text style={styles.emptyText}>No pending requests</Text>
          </View>
        }
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
  listContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 40,
  },
  requestCard: {
    backgroundColor: '#12122A',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(108, 43, 217, 0.2)',
  },
  requestTop: {
    flexDirection: 'row',
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  requestInfo: {
    flex: 1,
  },
  requestName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
  requestMutual: {
    fontSize: 13,
    color: theme.textSecondary,
    marginTop: 2,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  tag: {
    backgroundColor: 'rgba(108, 43, 217, 0.18)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 11,
    color: theme.purpleLight,
    fontWeight: '600' as const,
  },
  requestTime: {
    fontSize: 12,
    color: theme.textMuted,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  acceptBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: theme.pink,
    borderRadius: 12,
    paddingVertical: 10,
  },
  acceptText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#fff',
  },
  declineBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  declineText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: theme.textMuted,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: theme.textMuted,
    fontWeight: '600' as const,
  },
});
