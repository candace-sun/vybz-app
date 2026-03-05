import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  FlatList,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Calendar, MapPin, Users } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import Colors from '@/constants/colors';
import { events } from '@/mocks/data';

const theme = Colors.dark;

const extendedEvents = [
  ...events,
  { id: '3', title: 'Midnight Rave', subtitle: 'EDM night under the stars', date: 'Fri, Mar 7', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop', attendees: 312 },
  { id: '4', title: 'Acoustic Sessions', subtitle: 'Intimate live performances', date: 'Sat, Mar 8', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=300&fit=crop', attendees: 89 },
  { id: '5', title: 'Hip-Hop Cypher', subtitle: 'Freestyle and beat battles', date: 'Sun, Mar 9', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop', attendees: 178 },
];

function EventCard({ item, index }: { item: typeof extendedEvents[0]; index: number }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 450, delay: index * 100, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 450, delay: index * 100, useNativeDriver: true }),
    ]).start();
  }, []);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
  };

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }}>
      <Pressable onPress={handlePress} style={styles.eventCard} testID={`event-${item.id}`}>
        <Image source={{ uri: item.image }} style={styles.eventImage} contentFit="cover" />
        <LinearGradient
          colors={['transparent', 'rgba(8,8,24,0.85)', '#080818']}
          locations={[0.1, 0.6, 1]}
          style={styles.eventGradient}
        />
        <View style={styles.eventContent}>
          <Text style={styles.eventTitle}>{item.title}</Text>
          <Text style={styles.eventSub}>{item.subtitle}</Text>
          <View style={styles.eventMetaRow}>
            <View style={styles.eventMetaItem}>
              <Calendar size={14} color={theme.pink} />
              <Text style={styles.eventMetaText}>{item.date}</Text>
            </View>
            <View style={styles.eventMetaItem}>
              <MapPin size={14} color={theme.pink} />
              <Text style={styles.eventMetaText}>Main Auditorium</Text>
            </View>
            <View style={styles.eventMetaItem}>
              <Users size={14} color={theme.neonGreen} />
              <Text style={styles.eventMetaGreen}>{item.attendees} going</Text>
            </View>
          </View>
          <View style={styles.eventActions}>
            <Pressable
              style={styles.learnMoreBtn}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Text style={styles.learnMoreText}>learn more</Text>
            </Pressable>
            <Pressable
              style={styles.rsvpBtn}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
            >
              <Text style={styles.rsvpText}>RSVP (+25 XP)</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function EventsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Events',
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
        data={extendedEvents}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => <EventCard item={item} index={index} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <Calendar size={22} color={theme.pink} />
            <Text style={styles.headerTitle}>Upcoming Events</Text>
            <Text style={styles.headerSub}>Discover local music events & artists</Text>
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
  header: {
    paddingBottom: 20,
    gap: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#fff',
    marginTop: 8,
  },
  headerSub: {
    fontSize: 14,
    color: theme.textMuted,
  },
  listContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  eventCard: {
    borderRadius: 20,
    overflow: 'hidden',
    height: 280,
    backgroundColor: '#12122A',
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
    height: '80%',
  },
  eventContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 18,
  },
  eventTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: '#fff',
  },
  eventSub: {
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 4,
  },
  eventMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginTop: 10,
  },
  eventMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  eventMetaText: {
    fontSize: 12,
    color: theme.textSecondary,
    fontWeight: '500' as const,
  },
  eventMetaGreen: {
    fontSize: 12,
    color: theme.neonGreen,
    fontWeight: '600' as const,
  },
  eventActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  learnMoreBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  learnMoreText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#fff',
  },
  rsvpBtn: {
    backgroundColor: theme.pink,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  rsvpText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#fff',
  },
});
