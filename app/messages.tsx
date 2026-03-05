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
import { ArrowLeft, Search } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import Colors from '@/constants/colors';
import { messages, Message } from '@/mocks/data';

const theme = Colors.dark;

function MessageRow({ item, index }: { item: Message; index: number }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, delay: index * 60, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 350, delay: index * 60, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <Pressable
        style={styles.messageRow}
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        testID={`message-row-${item.id}`}
      >
        <View style={styles.avatarWrap}>
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
          {item.online && <View style={styles.onlineDot} />}
        </View>
        <View style={styles.messageContent}>
          <View style={styles.messageTopRow}>
            <Text style={[styles.userName, item.unread && styles.userNameUnread]}>{item.user}</Text>
            <Text style={[styles.timestamp, item.unread && styles.timestampUnread]}>{item.timestamp}</Text>
          </View>
          <Text style={[styles.lastMessage, item.unread && styles.lastMessageUnread]} numberOfLines={1}>
            {item.lastMessage}
          </Text>
        </View>
        {item.unread && <View style={styles.unreadDot} />}
      </Pressable>
    </Animated.View>
  );
}

export default function MessagesScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Messages',
          headerStyle: { backgroundColor: '#080818' },
          headerTintColor: '#fff',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <ArrowLeft size={22} color="#fff" />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
              <Search size={20} color={theme.textSecondary} />
            </Pressable>
          ),
        }}
      />
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => <MessageRow item={item} index={index} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: theme.neonGreen,
    borderWidth: 2.5,
    borderColor: '#080818',
  },
  messageContent: {
    flex: 1,
  },
  messageTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: theme.textSecondary,
  },
  userNameUnread: {
    color: '#fff',
    fontWeight: '700' as const,
  },
  timestamp: {
    fontSize: 12,
    color: theme.textMuted,
  },
  timestampUnread: {
    color: theme.neonGreen,
  },
  lastMessage: {
    fontSize: 14,
    color: theme.textMuted,
    lineHeight: 19,
  },
  lastMessageUnread: {
    color: theme.textSecondary,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.pink,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(108, 43, 217, 0.12)',
    marginLeft: 64,
  },
});
