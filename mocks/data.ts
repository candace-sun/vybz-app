export interface Goal {
  id: string;
  title: string;
  reward: string;
  icon: string;
  completed: boolean;
}

export interface ActivityItem {
  id: string;
  user: string;
  avatar: string;
  status: string;
  timestamp: string;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  xp: number;
}

export interface EventCard {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  image: string;
  attendees: number;
}

export interface MusicDrop {
  id: string;
  song: string;
  artist: string;
  genre: string;
  distance: number;
  x: number;
  y: number;
  latitude: number;
  longitude: number;
  collected: boolean;
}

export interface Plant {
  id: string;
  name: string;
  genre: string;
  stage: number;
  maxStage: number;
  stageLabel: string;
  xpNeeded: number;
  xpCurrent: number;
  emoji: string;
}

export interface GardenItem {
  id: string;
  name: string;
  category: string;
  price: number;
  owned: boolean;
  emoji: string;
}

export interface Friend {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  mutualArtists: number;
  tags: string[];
  online: boolean;
}

export const todayGoals: Goal[] = [
  { id: '1', title: 'Vibe Check', reward: '+20 XP', icon: 'music', completed: false },
  { id: '2', title: 'Collect one music drop', reward: '+10 XP', icon: 'coin', completed: false },
  { id: '3', title: 'Water your garden', reward: '+5 XP', icon: 'droplet', completed: true },
];

export const activityFeed: ActivityItem[] = [
  { id: '1', user: 'planetGrape', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop', status: 'Collected a song: Good Days by SZA', timestamp: '12m ago' },
  { id: '2', user: 'dayDreamer', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', status: 'Collected a song: Sicko Mode by Travis Scott', timestamp: '32m ago' },
  { id: '3', user: 'neonVibes', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop', status: 'Grew an Orchid to Full Bloom!', timestamp: '1h ago' },
  { id: '4', user: 'bassHunter', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', status: 'Joined Battle of the Bands', timestamp: '2h ago' },
];

export const leaderboard: LeaderboardUser[] = [
  { id: '1', name: 'vibeQueen', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop', xp: 2450 },
  { id: '2', name: 'beatMaster', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop', xp: 2180 },
  { id: '3', name: 'planetGrape', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop', xp: 1920 },
  { id: '4', name: 'neonVibes', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop', xp: 1750 },
  { id: '5', name: 'dayDreamer', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', xp: 1600 },
];

export const events: EventCard[] = [
  { id: '1', title: 'Battle of the Bands', subtitle: 'Compete with your garden for prizes', date: 'Sat, Feb 22', image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=200&fit=crop', attendees: 234 },
  { id: '2', title: 'Community Garden Fest', subtitle: 'Share plants & earn rare seeds', date: 'Sun, Feb 23', image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=200&fit=crop', attendees: 156 },
];

export const musicDrops: MusicDrop[] = [
  { id: '1', song: 'Levitating', artist: 'Dua Lipa', genre: 'Pop', distance: 120, x: 0.3, y: 0.25, latitude: 40.7580, longitude: -73.9855, collected: false },
  { id: '2', song: 'Blinding Lights', artist: 'The Weeknd', genre: 'Pop', distance: 85, x: 0.65, y: 0.4, latitude: 40.7549, longitude: -73.9840, collected: false },
  { id: '3', song: 'HUMBLE.', artist: 'Kendrick Lamar', genre: 'Rap', distance: 200, x: 0.5, y: 0.6, latitude: 40.7505, longitude: -73.9934, collected: false },
  { id: '4', song: 'Pink + White', artist: 'Frank Ocean', genre: 'R&B', distance: 45, x: 0.2, y: 0.7, latitude: 40.7484, longitude: -73.9857, collected: false },
  { id: '5', song: 'Midnight City', artist: 'M83', genre: 'EDM', distance: 310, x: 0.8, y: 0.2, latitude: 40.7614, longitude: -73.9776, collected: false },
  { id: '6', song: 'Good Days', artist: 'SZA', genre: 'R&B', distance: 150, x: 0.15, y: 0.45, latitude: 40.7527, longitude: -73.9772, collected: true },
];

export const plants: Plant[] = [
  { id: '1', name: 'Lotus', genre: 'EDM', stage: 3, maxStage: 4, stageLabel: 'Bloom', xpNeeded: 100, xpCurrent: 75, emoji: '🪷' },
  { id: '2', name: 'Orchid', genre: 'R&B', stage: 2, maxStage: 4, stageLabel: 'Bud', xpNeeded: 80, xpCurrent: 50, emoji: '🌸' },
  { id: '3', name: 'Coleus', genre: 'Rap', stage: 1, maxStage: 4, stageLabel: 'Seedling', xpNeeded: 60, xpCurrent: 20, emoji: '🌿' },
];

export const gardenItems: GardenItem[] = [
  { id: '1', name: 'Forest Grove', category: 'Backgrounds', price: 50, owned: true, emoji: '🌲' },
  { id: '2', name: 'Sunset Sky', category: 'Backgrounds', price: 75, owned: false, emoji: '🌅' },
  { id: '3', name: 'Mystic Garden', category: 'Backgrounds', price: 100, owned: false, emoji: '✨' },
  { id: '4', name: 'Wooden Fence', category: 'Fences', price: 30, owned: true, emoji: '🪵' },
  { id: '5', name: 'White Picket', category: 'Fences', price: 45, owned: false, emoji: '🏡' },
  { id: '6', name: 'Stone Wall', category: 'Fences', price: 60, owned: false, emoji: '🧱' },
  { id: '7', name: 'Butterfly', category: 'Animals', price: 40, owned: false, emoji: '🦋' },
  { id: '8', name: 'Hummingbird', category: 'Animals', price: 55, owned: false, emoji: '🐦' },
  { id: '9', name: 'Garden Rabbit', category: 'Animals', price: 35, owned: true, emoji: '🐰' },
  { id: '10', name: 'Firefly Swarm', category: 'Props', price: 80, owned: false, emoji: '✨' },
];

export const friends: Friend[] = [
  { id: '1', name: 'melodicSoul', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop', bio: 'R&B is life. Frank Ocean forever.', mutualArtists: 5, tags: ['ENFP', 'Pisces'], online: true },
  { id: '2', name: 'trapKing99', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop', bio: 'ATL hip hop head. Studio rat.', mutualArtists: 3, tags: ['ISTP', 'Aries'], online: true },
  { id: '3', name: 'synthWave', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop', bio: 'EDM festivals are my happy place.', mutualArtists: 7, tags: ['INFJ', 'Leo'], online: false },
  { id: '4', name: 'acousticDreams', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop', bio: 'Indie folk & coffee shop vibes.', mutualArtists: 2, tags: ['INFP', 'Virgo'], online: false },
  { id: '5', name: 'bassDropper', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop', bio: 'If the bass doesn\'t hit, I don\'t want it.', mutualArtists: 4, tags: ['ENTP', 'Scorpio'], online: true },
];

export const userProfile = {
  name: 'vibeSeeker',
  avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop',
  level: 12,
  xp: 1840,
  xpToNext: 2000,
  coins: 350,
  mbti: 'INTJ',
  zodiac: 'Aquarius',
  topArtists: ['Frank Ocean', 'Kendrick Lamar', 'Dua Lipa'],
  bio: 'Chasing vibes & growing beats 🌱🎵',
  plantsGrown: 8,
  songsCollected: 47,
  friendsCount: 23,
};

export const stageLabels = ['Seedling', 'Bud', 'Bloom', 'Full Bloom'];

export interface Message {
  id: string;
  user: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  online: boolean;
}

export interface FriendRequest {
  id: string;
  user: string;
  avatar: string;
  mutualFriends: number;
  tags: string[];
  timestamp: string;
}

export const messages: Message[] = [
  { id: '1', user: 'melodicSoul', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop', lastMessage: 'Have you heard the new Frank Ocean leak?', timestamp: '2m ago', unread: true, online: true },
  { id: '2', user: 'trapKing99', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop', lastMessage: 'Let\'s link up at the garden fest!', timestamp: '15m ago', unread: true, online: true },
  { id: '3', user: 'synthWave', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop', lastMessage: 'My lotus just hit full bloom 🌸', timestamp: '1h ago', unread: true, online: false },
  { id: '4', user: 'bassDropper', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop', lastMessage: 'That drop was insane!!', timestamp: '3h ago', unread: false, online: true },
  { id: '5', user: 'acousticDreams', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop', lastMessage: 'Check out this playlist I made', timestamp: '5h ago', unread: false, online: false },
  { id: '6', user: 'neonVibes', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop', lastMessage: 'GG on the leaderboard!', timestamp: '1d ago', unread: false, online: false },
];

export const friendRequests: FriendRequest[] = [
  { id: '1', user: 'cosmicBeats', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop', mutualFriends: 4, tags: ['EDM', 'House'], timestamp: '10m ago' },
  { id: '2', user: 'lofiDreamer', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&h=100&fit=crop', mutualFriends: 2, tags: ['Lo-Fi', 'Jazz'], timestamp: '1h ago' },
  { id: '3', user: 'vinylCollector', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', mutualFriends: 6, tags: ['R&B', 'Soul'], timestamp: '3h ago' },
  { id: '4', user: 'drumNbass', avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=100&h=100&fit=crop', mutualFriends: 1, tags: ['DnB', 'Jungle'], timestamp: '5h ago' },
];
